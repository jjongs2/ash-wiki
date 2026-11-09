"""digest.py의 보관과 분석 목록.

python3 -B -m unittest discover -s .claude/skills/wiki-retro
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "digest.py")
UUID = "11111111-2222-3333-4444-555555555555"


def stem_of(path):
    return path[: -len(".jsonl")]


def env_without_notes():
    return {k: v for k, v in os.environ.items() if k != "ASH_WIKI_NOTES"}


def entry(kind, text):
    return json.dumps({"type": kind, "timestamp": "2026-10-08T01:00:00Z", "message": {"content": text}})


def subagent(session_dir, agent_id, agent_type, description, *lines, workflow=None):
    sub_dir = os.path.join(session_dir, "subagents", *(("workflows", workflow) if workflow else ()))
    os.makedirs(sub_dir, exist_ok=True)
    with open(os.path.join(sub_dir, f"agent-{agent_id}.jsonl"), "w") as f:
        f.write("\n".join(lines or [entry("assistant", "sub reply")]) + "\n")
    with open(os.path.join(sub_dir, f"agent-{agent_id}.meta.json"), "w") as f:
        json.dump({"agentType": agent_type, "description": description}, f)


def git_repo(path, files, date="2026-01-01T00:00:00Z"):
    """files를 한 커밋에 담고 origin/main을 그 커밋에 둔 저장소를 만들어 커밋을 돌려준다."""
    env = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="t", GIT_COMMITTER_EMAIL="t@t",
               GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
    for name, body in files.items():
        os.makedirs(os.path.join(path, os.path.dirname(name)), exist_ok=True)
        with open(os.path.join(path, name), "w") as f:
            f.write(body)

    def git(*args):
        return subprocess.run(["git", *args], cwd=path, env=env, capture_output=True, text=True, check=True).stdout.strip()

    git("init", "-q")
    git("add", ".")
    git("commit", "-q", "-m", "c")
    commit = git("rev-parse", "HEAD")
    git("update-ref", "refs/remotes/origin/main", commit)
    return commit


class DigestArchiveTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = self.tmp.name
        self.archive = os.path.join(root, "archive")
        self.notes = os.path.join(root, "notes")
        os.makedirs(self.notes)
        self.transcript = os.path.join(root, f"{UUID}.jsonl")
        with open(self.transcript, "w") as f:
            f.write(entry("user", "hello") + "\n")
        sub_dir = os.path.join(root, UUID, "subagents")
        os.makedirs(sub_dir)
        with open(os.path.join(sub_dir, "agent-a1.jsonl"), "w") as f:
            f.write(entry("assistant", "sub reply") + "\n")

    def tearDown(self):
        self.tmp.cleanup()

    def run_digest(self, *args, check=True):
        env = dict(os.environ, ASH_WIKI_NOTES=self.notes)
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, *args],
            env=env, capture_output=True, text=True, check=check,
        )
        return result if not check else result.stdout

    def session_files(self):
        return sorted(os.listdir(os.path.join(self.archive, UUID)))

    def test_writes_main_and_subagent_digests_under_session_uuid(self):
        self.run_digest(self.transcript)
        files = self.session_files()
        self.assertIn(f"{UUID[:8]}-main.md", files)
        self.assertIn(f"{UUID[:8]}-agent-a1.md", files)
        with open(os.path.join(self.archive, UUID, f"{UUID[:8]}-main.md")) as f:
            self.assertIn("hello", f.read())

    def read(self, name):
        with open(os.path.join(self.archive, UUID, f"{UUID[:8]}-{name}.md")) as f:
            return f.read()

    def test_agent_call_line_names_the_agent(self):
        call = {"subagent_type": "source-verifier", "description": "Verify sentences", "prompt": "읽어라"}
        with open(self.transcript, "w") as f:
            f.write(assistant({"type": "tool_use", "id": "a1", "name": "Agent", "input": call}) + "\n")
        self.run_digest(self.transcript)
        self.assertIn("- Agent: source-verifier | Verify sentences | 읽어라", self.read("main"))

    def test_subagent_digest_starts_with_agent_name_and_description(self):
        subagent(os.path.join(self.tmp.name, UUID), "b2", "style-reviewer", "Style review round 1")
        self.run_digest(self.transcript)
        self.assertEqual(self.read("agent-b2").splitlines()[0], "agentType: style-reviewer | description: Style review round 1")

    def test_workflow_agent_record_is_digested(self):
        session_dir = os.path.join(self.tmp.name, UUID)
        subagent(session_dir, "c3", "external-reader", "Reader review", entry("assistant", "걸린 곳"), workflow="wf_1234abcd-ef0")
        with open(os.path.join(session_dir, "subagents", "workflows", "wf_1234abcd-ef0", "journal.jsonl"), "w") as f:
            f.write(entry("user", "journal") + "\n")
        out = self.run_digest(self.transcript)
        digest = self.read("agent-c3")
        self.assertEqual(digest.splitlines()[0], "agentType: external-reader | description: Reader review | workflow: wf_1234abcd-ef0")
        self.assertIn("걸린 곳", digest)
        self.assertNotIn("journal", out)

    def test_unchanged_transcript_is_redone_and_counted(self):
        self.run_digest(self.transcript)
        main = os.path.join(self.archive, UUID, f"{UUID[:8]}-main.md")
        with open(main, "a") as f:
            f.write("marker\n")
        out = self.run_digest(self.transcript)
        self.assertIn(f"{UUID[:8]}-main.md\t지움 0", out)
        with open(main) as f:
            self.assertNotIn("marker", f.read())

    def test_redo_keeps_report(self):
        self.run_digest(self.transcript)
        report = os.path.join(self.archive, UUID, "report.md")
        with open(report, "w") as f:
            f.write("findings\n")
        with open(self.transcript, "a") as f:
            f.write(entry("user", "later") + "\n")
        self.run_digest(self.transcript)
        self.assertTrue(os.path.exists(report))

    def test_rejects_transcript_not_named_by_uuid(self):
        other = os.path.join(self.tmp.name, "notes.jsonl")
        shutil.copy(self.transcript, other)
        result = self.run_digest(other, check=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(os.path.exists(os.path.join(self.archive, "notes")))

    def test_mark_appends_each_uuid_once(self):
        other = "66666666-7777-8888-9999-000000000000"
        self.run_digest("--mark", "retro-uuid", UUID, other)
        self.run_digest("--mark", "retro-uuid-2", UUID)
        with open(os.path.join(self.archive, "analyzed.tsv")) as f:
            rows = [line.rstrip("\n").split("\t") for line in f]
        self.assertEqual([r[0] for r in rows], [UUID, other])
        self.assertEqual(rows[0][1], "retro-uuid")
        self.assertRegex(rows[0][2], r"^\d{4}-\d{2}-\d{2}$")

    def test_mark_rejects_a_routine_run_id(self):
        result = self.run_digest("--mark", "retro-uuid", "cse_01AbCdEfGhIjKlMnOpQrStUv", UUID, check=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("CLI uuid", result.stderr)
        self.assertFalse(os.path.exists(os.path.join(self.archive, "analyzed.tsv")))

    def test_mark_rejects_a_path(self):
        result = self.run_digest("--mark", "retro-uuid", self.transcript, check=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(os.path.exists(os.path.join(self.archive, "analyzed.tsv")))


def queued(text, mode="prompt", kind="peer"):
    return json.dumps({
        "type": "attachment", "uuid": f"q-{abs(hash(text))}", "timestamp": "2026-10-08T01:05:00Z",
        "attachment": {"type": "queued_command", "prompt": text, "commandMode": mode, "origin": {"kind": kind}},
    })


class QueueTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.archive = os.path.join(self.tmp.name, "archive")
        self.notes = os.path.join(self.tmp.name, "notes")
        self.transcript = os.path.join(self.tmp.name, f"{UUID}.jsonl")

    def tearDown(self):
        self.tmp.cleanup()

    def digest(self, *lines):
        with open(self.transcript, "w") as f:
            f.write("\n".join(lines) + "\n")
        out = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, self.transcript],
            env=dict(os.environ, ASH_WIKI_NOTES=self.notes), capture_output=True, text=True, check=True,
        ).stdout
        with open(os.path.join(self.archive, UUID, f"{UUID[:8]}-main.md")) as f:
            return f.read(), out

    def test_queued_prompt_is_written_in_full_and_marked(self):
        report = "<agent-message>\n  # 보고서\n" + "가" * 2000
        main, _ = self.digest(entry("user", "start"), queued(report))
        self.assertIn("### USER 2026-10-08T01:05 (대기열, peer)\n" + report, main)

    def test_task_notification_is_not_written(self):
        main, _ = self.digest(queued("<task-notification>done</task-notification>", mode="task-notification"))
        self.assertNotIn("task-notification", main)

    def test_message_also_sent_as_user_line_is_written_once(self):
        main, _ = self.digest(queued("push하지 마", kind="human"), entry("user", "push하지 마"))
        self.assertEqual(main.count("push하지 마"), 1)

    def test_messages_redelivered_in_order_are_written_once(self):
        main, _ = self.digest(queued("메시지A"), queued("메시지B"), entry("user", "메시지A"), entry("user", "메시지B"))
        self.assertEqual((main.count("메시지A"), main.count("메시지B")), (1, 1))

    def test_each_user_message_naming_notes_is_counted(self):
        _, out = self.digest(*(entry("user", f"{self.notes}/note-{n}.md") for n in range(3)))
        self.assertIn("지움 3", out)

    def test_last_line_names_records_with_hidden_entries(self):
        _, out = self.digest(entry("user", f"{self.notes}/note.md"))
        self.assertEqual(out.splitlines()[-1], f"지움이 있는 기록 1: {UUID[:8]}-main.md")

    def test_last_line_says_when_no_record_has_hidden_entries(self):
        _, out = self.digest(entry("user", "hello"))
        self.assertEqual(out.splitlines()[-1], "지움이 있는 기록 없음")

    def test_same_text_sent_at_another_time_is_kept(self):
        main, _ = self.digest(entry("user", "계속"), entry("user", "다음"), queued("계속", kind="human"))
        self.assertEqual(main.count("계속"), 2)

    def test_duplicated_message_naming_notes_stays_hidden(self):
        text = f"읽은 노트: {self.notes}/iso-26262.md"
        main, _ = self.digest(queued(text), entry("user", text))
        self.assertNotIn("iso-26262", main)

    def test_notes_folder_anywhere_in_a_fetched_cloud_record_is_hidden(self):
        cloud = os.path.join(self.tmp.name, "cloud", "-home-user-ash-wiki")
        os.makedirs(cloud)
        transcript = os.path.join(cloud, f"{UUID}.jsonl")
        remote(stem_of(transcript), "cse_02Web", "web_claude_ai")
        lines = [
            *bash("cd /home/user/lecture-notes && ls can", "a.md b.md", "b1"),
            assistant({"type": "tool_use", "id": "r1", "name": "Read", "input": {"file_path": "/home/user/lecture-notes/can/a.md"}}),
            entry("user", "노트는 /home/user/lecture-notes에 있다"),
            assistant({"type": "tool_use", "id": "g1", "name": "mcp__remote__add_repo", "input": {"owner": "o", "repo": "lecture-notes"}}),
            entry("user", "lecture-notes-archive는 다른 저장소다"),
        ]
        with open(transcript, "w") as f:
            f.write("\n".join(lines) + "\n")
        out = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, transcript],
            env=dict(os.environ, ASH_WIKI_NOTES=f"{os.path.expanduser('~')}/lecture-notes"),
            capture_output=True, text=True, check=True,
        ).stdout
        digest_dir = os.path.join(self.archive, UUID)
        with open(os.path.join(digest_dir, f"{UUID[:8]}-main.md")) as f:
            main = f.read()
        with open(os.path.join(digest_dir, f"{UUID[:8]}-main-notes.txt")) as f:
            notes = f.read()
        self.assertNotIn("/lecture-notes", main)
        self.assertNotIn('"lecture-notes"', main)
        self.assertIn("lecture-notes-archive는 다른 저장소다", main)
        self.assertIn("cd /home/user/lecture-notes", notes)
        self.assertIn("/home/user/lecture-notes/can/a.md", notes)
        self.assertIn('"repo": "lecture-notes"', notes)
        self.assertIn("지움 4", out)

    def test_notes_under_the_home_of_the_machine_a_copy_came_from_are_hidden(self):
        copy = os.path.join(self.tmp.name, "copies", "b")
        os.makedirs(os.path.join(copy, "-home-bob-ash-wiki"))
        with open(os.path.join(copy, "manifest.json"), "w") as f:
            json.dump({"host": "b", "home": "/home/bob", "files": {}}, f)
        transcript = os.path.join(copy, "-home-bob-ash-wiki", f"{UUID}.jsonl")
        home = os.path.expanduser("~")
        with open(transcript, "w") as f:
            f.write("\n".join(entry("user", f"{h}/lecture-notes/iso.md") for h in ("/home/bob", home)) + "\n")
        out = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, transcript],
            env=dict(os.environ, ASH_WIKI_NOTES=f"{home}/lecture-notes"), capture_output=True, text=True, check=True,
        ).stdout
        self.assertIn("지움 2", out)

    def test_queued_message_naming_notes_is_hidden_and_counted(self):
        main, out = self.digest(queued(f"읽은 노트: {self.notes}/iso-26262.md 본문"))
        self.assertNotIn("iso-26262", main)
        self.assertIn("(노트, 지움)", main)
        self.assertIn("지움 1", out)


SKILL = ".claude/skills/wiki-news/SKILL.md"


def skill_call(body, base_dir="/home/u/ash-wiki/.claude/skills/wiki-news"):
    text = f"Base directory for this skill: {base_dir}\n\n{body}\n\n\nARGUMENTS: 2026-03"
    return json.dumps({"type": "user", "timestamp": "2026-10-08T01:00:00Z", "message": {"content": [{"type": "text", "text": text}]}})


class VersionTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.repo = os.path.join(self.tmp.name, "repo")
        os.makedirs(os.path.join(self.repo, os.path.dirname(SKILL)))
        self.git("init", "-q")
        self.v1 = self.commit("# 소식\n\n첫 판\n", "2026-01-01T00:00:00Z")
        self.v2 = self.commit("# 소식\n\n둘째 판\n", "2026-02-01T00:00:00Z")
        self.git("update-ref", "refs/remotes/origin/main", self.v2)
        self.transcript = os.path.join(self.tmp.name, f"{UUID}.jsonl")

    def tearDown(self):
        self.tmp.cleanup()

    def git(self, *args, date=None):
        env = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="t", GIT_COMMITTER_EMAIL="t@t")
        if date:
            env.update(GIT_AUTHOR_DATE=date, GIT_COMMITTER_DATE=date)
        return subprocess.run(["git", *args], cwd=self.repo, env=env, capture_output=True, text=True, check=True).stdout.strip()

    def commit(self, body, date):
        with open(os.path.join(self.repo, SKILL), "w") as f:
            f.write(f"---\nname: wiki-news\n---\n\n{body}")
        self.git("add", ".")
        self.git("commit", "-q", "-m", body, date=date)
        return self.git("rev-parse", "HEAD")

    def version(self, *lines, first_ts="2026-03-01T00:00:00Z"):
        rows = self.version_rows(*lines, first_ts=first_ts)
        self.assertEqual(len(rows), 1, rows)
        return rows[0]

    def test_worktree_base_is_the_version(self):
        base = bash("git worktree add -b x .claude/worktrees/x origin/main", f"Preparing worktree\nHEAD is now at {self.v1[:8]} 첫 판", "w1")
        row = self.version(*base, skill_call("# 소식\n\n첫 판"))
        self.assertEqual(row[:3], [UUID[:8], "wiki-news", self.v1[:12]])
        self.assertIn("worktree base", row[3])

    def test_base_quoted_outside_worktree_add_is_ignored(self):
        quoted = bash("grep -o 'HEAD is now at' other.jsonl", f"HEAD is now at {self.v1[:8]} 첫 판", "g1")
        row = self.version(*quoted, skill_call("# 소식\n\n둘째 판"))
        self.assertEqual(row[2], self.v2[:12])
        self.assertIn("시작 시각의 origin/main", row[3])

    def test_without_base_origin_main_at_start_is_the_version(self):
        row = self.version(skill_call("# 소식\n\n첫 판"), first_ts="2026-01-15T00:00:00Z")
        self.assertEqual(row[:3], [UUID[:8], "wiki-news", self.v1[:12]])
        self.assertIn("시작 시각의 origin/main", row[3])

    def test_body_differing_from_version_is_fixed_to_commit_with_same_body(self):
        row = self.version(skill_call("# 소식\n\n첫 판", base_dir="/home/u/ash-wiki/.claude/worktrees/x/.claude/skills/wiki-news"))
        self.assertEqual(row[2], self.v1[:12])
        self.assertIn("고침", row[3])

    def test_body_matching_no_commit_is_reported(self):
        row = self.version(skill_call("# 소식\n\n고치던 판"))
        self.assertEqual(row[2], self.v2[:12])
        self.assertIn("같은 커밋 없음", row[3])

    def test_session_without_skill_body_is_reported(self):
        row = self.version(entry("user", "/wiki-news 루틴을 돌려 줘"))
        self.assertEqual(row[1:3], ["-", self.v2[:12]])
        self.assertIn("스킬 본문 없음", row[3])

    def test_fetched_routine_run_takes_origin_main_at_run_time(self):
        remote(stem_of(self.transcript), RUN, "scheduled_trigger")
        row = self.version(entry("user", "/wiki-news 2026-w01"), first_ts="2026-01-15T00:00:00Z")
        self.assertEqual(row[1:3], ["wiki-news", self.v1[:12]])
        self.assertIn("루틴 실행", row[3])
        self.assertIn("시작 시각의 origin/main", row[3])

    def test_fetched_cloud_session_takes_its_slash_command_at_start(self):
        remote(stem_of(self.transcript), "cse_02Web", "web_claude_ai")
        row = self.version(entry("user", "/wiki-news 2026-w01"), first_ts="2026-01-15T00:00:00Z")
        self.assertEqual(row[1:3], ["wiki-news", self.v1[:12]])
        self.assertIn("슬래시 명령", row[3])

    def commit_with_agent(self):
        agent = os.path.join(self.repo, ".claude/agents/source-verifier.md")
        os.makedirs(os.path.dirname(agent))
        with open(agent, "w") as f:
            f.write("---\nname: source-verifier\n---\n")
        v3 = self.commit("# 소식\n\n셋째 판\n", "2026-02-15T00:00:00Z")
        self.git("update-ref", "refs/remotes/origin/main", v3)
        return v3

    def test_project_agents_the_session_spawned_are_listed_at_the_version(self):
        v3 = self.commit_with_agent()
        session_dir = stem_of(self.transcript)
        subagent(session_dir, "a1", "source-verifier", "Verify")
        subagent(session_dir, "a2", "general-purpose", "Search")
        subagent(session_dir, "a3", "source-verifier", "Re-verify", workflow="wf_1")
        rows = self.version_rows(skill_call("# 소식\n\n셋째 판"))
        self.assertEqual([r[1:3] for r in rows], [["wiki-news", v3[:12]], [".claude/agents/source-verifier.md", v3[:12]]])

    def test_agent_files_follow_the_commit_the_skill_body_fixed(self):
        self.commit_with_agent()
        subagent(stem_of(self.transcript), "a1", "source-verifier", "Verify")
        subagent(stem_of(self.transcript), "a2", "general-purpose", "Search")
        rows = self.version_rows(skill_call("# 소식\n\n첫 판"))
        self.assertEqual([r[1:3] for r in rows], [["wiki-news", self.v1[:12]], [".claude/agents/source-verifier.md", "-"]])
        self.assertIn("세션 버전에 없음", rows[1][3])

    def version_rows(self, *lines, first_ts="2026-03-01T00:00:00Z"):
        start = json.dumps({"type": "custom-title", "timestamp": first_ts})
        with open(self.transcript, "w") as f:
            f.write("\n".join([start, *lines]) + "\n")
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--version", self.transcript],
            cwd=self.repo, env=env_without_notes(), capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return [line.split("\t") for line in result.stdout.splitlines()]

    def test_outside_a_repository_fails(self):
        with open(self.transcript, "w") as f:
            f.write(skill_call("# 소식\n\n첫 판") + "\n")
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--version", self.transcript],
            cwd=self.tmp.name, env=env_without_notes(), capture_output=True, text=True,
        )
        self.assertNotEqual(result.returncode, 0)


def assistant(*content, msg_id="m1"):
    return json.dumps({"type": "assistant", "timestamp": "2026-10-08T01:00:00Z", "message": {"id": msg_id, "content": list(content)}})


def bash(command, output, call_id):
    call = assistant({"type": "tool_use", "id": call_id, "name": "Bash", "input": {"command": command}})
    result = json.dumps({"type": "user", "message": {"content": [
        {"type": "tool_result", "tool_use_id": call_id, "content": output}]}})
    return call, result


def handback(text):
    return {"type": "tool_use", "id": "t1", "name": "SubagentHandback", "input": {"message": text}}


class ReportTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.archive = os.path.join(self.tmp.name, "archive")
        self.agent = os.path.join(self.tmp.name, "agent-a1.jsonl")
        self.report = os.path.join(self.archive, UUID, "report.md")

    def tearDown(self):
        self.tmp.cleanup()

    def save(self, *lines, uuid=UUID):
        with open(self.agent, "w") as f:
            f.write("\n".join(lines) + "\n")
        return subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, "--report", self.agent, uuid, "PR #1, 티켓 #2"],
            env=env_without_notes(), capture_output=True, text=True,
        )

    def read_report(self):
        with open(self.report) as f:
            return f.read()

    def test_writes_last_handback_under_first_line(self):
        result = self.save(
            assistant(handback("old report"), msg_id="m1"),
            assistant({"type": "text", "text": "thinking aloud"}, msg_id="m2"),
            assistant(handback("final report"), msg_id="m3"),
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.read_report(), "PR #1, 티켓 #2\n\nfinal report\n")

    def test_without_handback_writes_last_assistant_text(self):
        result = self.save(
            assistant({"type": "text", "text": "draft"}, msg_id="m1"),
            assistant({"type": "text", "text": "## 보고서"}, msg_id="m2"),
            assistant({"type": "text", "text": "본문"}, msg_id="m2"),
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.read_report(), "PR #1, 티켓 #2\n\n## 보고서\n\n본문\n")

    def test_without_any_reply_fails_and_writes_nothing(self):
        result = self.save(entry("user", "go"), assistant({"type": "tool_use", "id": "t", "name": "Read", "input": {}}))
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(os.path.exists(self.report))

    def test_rejects_a_non_uuid(self):
        result = self.save(assistant(handback("final report")), uuid="report")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(os.path.exists(os.path.join(self.archive, "report")))

    def test_same_first_line_in_reply_is_dropped_and_printed(self):
        result = self.save(assistant(handback("\nPR #1, 티켓 #2\n\n## 보고서")))
        self.assertEqual(self.read_report(), "PR #1, 티켓 #2\n\n## 보고서\n")
        self.assertIn("PR #1, 티켓 #2", result.stdout)

    def test_differently_worded_first_line_with_first_number_is_dropped(self):
        result = self.save(assistant(handback("PR #1 코멘트·티켓 #2 항목\n\n## 보고서")))
        self.assertEqual(self.read_report(), "PR #1, 티켓 #2\n\n## 보고서\n")
        self.assertIn("PR #1 코멘트·티켓 #2 항목", result.stdout)

    def test_reply_starting_with_heading_is_kept(self):
        result = self.save(assistant(handback("## PR #1 보고서\n\n본문")))
        self.assertEqual(self.read_report(), "PR #1, 티켓 #2\n\n## PR #1 보고서\n\n본문\n")
        self.assertNotIn("뗀", result.stdout)

    def test_reply_starting_with_prose_is_kept(self):
        result = self.save(assistant(handback("세션은 PR #10을 냈다.\n\n본문")))
        self.assertEqual(self.read_report(), "PR #1, 티켓 #2\n\n세션은 PR #10을 냈다.\n\n본문\n")
        self.assertNotIn("뗀", result.stdout)


OTHER = "66666666-7777-8888-9999-000000000000"
RETRO = "99999999-8888-7777-6666-555555555555"
RUN = "cse_01AbCdEfGhIjKlMnOpQrStUv"


def remote(session_dir, run, origin):
    """받기 절차가 클라우드 기록의 세션 폴더에 남기는 remote.json."""
    os.makedirs(session_dir, exist_ok=True)
    suffix = run.removeprefix("cse_")
    with open(os.path.join(session_dir, "remote.json"), "w") as f:
        json.dump({"session": f"session_{suffix}", "cse": run, "uuid": os.path.basename(session_dir), "origin": origin}, f)


def trigger(content):
    body = {"job_config": {"ccr": {"events": [{"data": {"message": {"content": content, "role": "user"}}}]}}}
    return assistant({"type": "tool_use", "id": "r1", "name": "RemoteTrigger", "input": {"action": "update", "body": body}})


def session_lines(stdout, header=False):
    """후보 명령 출력의 첫 표(세션 줄). 빈 줄 뒤는 흐름 표다."""
    return stdout.split("\n\n")[0].splitlines()[0 if header else 1 :]


def flow_rows(stdout):
    """후보 명령 출력의 흐름 표(머리 줄 포함)."""
    return [line.split("\t") for line in stdout.split("\n\n")[1].splitlines()]


class CandidatesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.archive = os.path.join(self.tmp.name, "archive")
        self.repo = os.path.join(self.tmp.name, "repo")
        self.paths = []
        git_repo(self.repo, {f".claude/agents/{name}.md": f"---\nname: {name}\n---\n" for name in ("source-verifier", "external-reader")})

    def tearDown(self):
        self.tmp.cleanup()

    def transcript(self, uuid, *lines):
        path = os.path.join(self.tmp.name, f"{uuid}.jsonl")
        with open(path, "w") as f:
            f.write("\n".join(lines) + "\n")
        self.paths.append(path)
        return stem_of(path)

    def run_candidates(self, *extra):
        return subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, "--candidates", RETRO, *self.paths, *extra],
            cwd=self.repo, env=env_without_notes(), capture_output=True, text=True,
        )

    def candidates(self, *extra):
        result = self.run_candidates(*extra)
        self.assertEqual(result.returncode, 0, result.stderr)
        return {row[0]: row for row in (line.split("\t") for line in session_lines(result.stdout))}

    def test_session_spawning_a_project_agent_without_a_wiki_skill_is_a_candidate(self):
        subagent(self.transcript(UUID, entry("user", "#626 구현")), "a1", "source-verifier", "Verify")
        subagent(self.transcript(OTHER, entry("user", "검색")), "a2", "general-purpose", "Search")
        rows = self.candidates()
        self.assertEqual(list(rows), [UUID])
        self.assertEqual(rows[UUID][1:3], ["-", "source-verifier"])

    def test_agent_a_workflow_spawned_makes_a_candidate(self):
        session_dir = self.transcript(UUID, entry("user", "Reader Testing"))
        subagent(session_dir, "a1", "external-reader", "Reader", workflow="wf_1")
        subagent(session_dir, "a2", "source-verifier", "Verify")
        self.assertEqual(self.candidates()[UUID][2], "source-verifier,external-reader")

    def test_agent_missing_from_the_session_version_does_not_make_a_candidate(self):
        later = os.path.join(self.tmp.name, "later")
        git_repo(later, {".claude/agents/source-verifier.md": "x"}, date="2026-11-01T00:00:00Z")
        self.repo = later
        subagent(self.transcript(UUID, entry("user", "#626 구현")), "a1", "source-verifier", "Verify")
        self.assertEqual(self.candidates(), {})

    def test_outside_a_repository_fails(self):
        self.transcript(UUID, entry("user", "hello"))
        self.repo = self.tmp.name
        self.assertNotEqual(self.run_candidates().returncode, 0)

    def test_session_handing_a_skill_to_a_routine_is_a_candidate(self):
        self.transcript(UUID, trigger("/wiki-news 2026-w01\n\n인자는 하나다."))
        self.transcript(OTHER, entry("user", "wiki-news를 고쳐 줘"))
        rows = self.candidates()
        self.assertEqual(list(rows), [UUID])
        self.assertEqual(rows[UUID][1], "wiki-news(루틴)")

    def test_renamed_skill_and_its_old_name_are_both_candidates(self):
        self.transcript(UUID, entry("user", "<command-message>wiki-reader-testing</command-message>\n<command-args>platform</command-args>"))
        self.transcript(OTHER, entry("user", "<command-message>reader-testing</command-message>\n<command-args>platform</command-args>"))
        rows = self.candidates()
        self.assertEqual(rows[UUID][1], "wiki-reader-testing")
        self.assertEqual(rows[OTHER][1], "reader-testing")

    def test_analyzed_session_and_this_session_are_left_out(self):
        command = entry("user", "<command-message>wiki-verify</command-message>\n<command-args>#3</command-args>")
        self.transcript(UUID, command)
        self.transcript(OTHER, command)
        self.transcript(RETRO, command)
        os.makedirs(self.archive)
        with open(os.path.join(self.archive, "analyzed.tsv"), "w") as f:
            f.write(f"{OTHER}\t-\t2026-10-08\n")
        self.assertEqual(list(self.candidates()), [UUID])

    def test_row_shows_handoff_and_urls_the_session_made(self):
        handoff = "/home/u/documents/ash-wiki-handoff/2026-10-08-verify.md"
        self.transcript(
            UUID,
            json.dumps({"type": "custom-title", "customTitle": "CAN 재조사"}),
            assistant({"type": "tool_use", "id": "s1", "name": "Skill", "input": {"skill": "wiki-verify"}}),
            *bash("gh pr create --title x", "https://github.com/o/r/pull/7\n", "b1"),
            *bash("gh pr view 5", "https://github.com/o/r/pull/5\n", "b2"),
            assistant({"type": "tool_use", "id": "w1", "name": "Write", "input": {"file_path": handoff, "content": "x"}}),
        )
        self.transcript(OTHER, assistant({"type": "tool_use", "id": "s1", "name": "Skill", "input": {"skill": "wiki-verify"}}))
        rows = self.candidates()
        self.assertEqual(rows[UUID][1:7], ["wiki-verify", "-", "2026-10-08", "CAN 재조사", "https://github.com/o/r/pull/7", handoff])
        self.assertEqual(rows[OTHER][5:7], ["-", "-"])

    def test_fetched_routine_run_is_a_candidate_without_a_command_mark(self):
        remote(self.transcript(UUID, entry("user", "이번 주 소식을 모아 줘")), RUN, "scheduled_trigger")
        remote(self.transcript(OTHER, entry("user", "이번 주 소식을 모아 줘")), "cse_02Web", "web_claude_ai")
        rows = self.candidates()
        self.assertEqual(list(rows), [UUID])
        self.assertEqual(rows[UUID][1], f"루틴 실행({RUN})")

    def test_slash_command_starts_a_skill_only_in_a_fetched_cloud_record(self):
        remote(self.transcript(UUID, entry("user", "/wiki-ingest #18")), "cse_02Web", "web_claude_ai")
        remote(self.transcript(RETRO.replace("9", "8"), entry("user", "/wiki-news\n<system-reminder>fired</system-reminder>")), RUN, "scheduled_trigger")
        self.transcript(OTHER, entry("user", "/wiki-ingest #18"))
        rows = self.candidates()
        self.assertEqual(sorted(r[1] for r in rows.values()), ["wiki-ingest", f"루틴 실행({RUN}),wiki-news"])

    def test_routine_run_started_by_hand_is_a_candidate(self):
        remote(self.transcript(UUID, entry("user", "/wiki-news 2026-w01")), RUN, "force_run_trigger")
        self.assertEqual(self.candidates()[UUID][1], f"루틴 실행({RUN}),wiki-news")

    def test_run_marked_under_its_old_run_id_is_left_out(self):
        remote(self.transcript(UUID, entry("user", "/wiki-news 2026-w01")), RUN, "scheduled_trigger")
        os.makedirs(self.archive)
        with open(os.path.join(self.archive, "analyzed.tsv"), "w") as f:
            f.write(f"{RUN}\t{RETRO}\t2026-10-08\n")
        self.assertEqual(self.candidates(), {})

    def test_runs_not_fetched_are_rows_of_their_own(self):
        remote(self.transcript(UUID, entry("user", "/wiki-news 2026-w01")), RUN, "scheduled_trigger")
        os.makedirs(self.archive)
        with open(os.path.join(self.archive, "analyzed.tsv"), "w") as f:
            f.write(f"cse_03Old\t{RETRO}\t2026-10-08\n")
        rows = self.candidates("--runs", RUN.replace("cse_", "session_"), "cse_02New", "cse_03Old")
        self.assertEqual(list(rows), [UUID, "cse_02New"])
        self.assertEqual(rows["cse_02New"][1:7], ["루틴 실행(받지 않음)", "-", "-", "-", "-", "-"])

    def test_fetched_copy_wins_over_a_larger_copy_without_remote_json(self):
        fetched = os.path.join(self.tmp.name, "cloud", "-home-user-ash-wiki", f"{UUID}.jsonl")
        os.makedirs(os.path.dirname(fetched))
        with open(fetched, "w") as f:
            f.write(entry("user", "/wiki-news 2026-w01") + "\n")
        remote(stem_of(fetched), RUN, "scheduled_trigger")
        self.paths.append(fetched)
        self.transcript(UUID, entry("user", "/wiki-news 2026-w01"), entry("user", "teleport로 이어 받은 뒤의 글"))
        self.assertEqual(self.candidates()[UUID][1], f"루틴 실행({RUN}),wiki-news")

    def test_records_are_read_from_a_list_file(self):
        self.transcript(UUID, entry("user", "<command-message>wiki-verify</command-message>"))
        listing = os.path.join(self.tmp.name, "transcripts.txt")
        with open(listing, "w") as f:
            f.write("\n".join(self.paths) + "\n\n")
        self.paths = []
        self.assertEqual(list(self.candidates("--records", listing)), [UUID])

    def test_session_in_several_places_is_one_row_from_the_largest_copy(self):
        command = entry("user", "<command-message>wiki-verify</command-message>")
        self.transcript(UUID, command, json.dumps({"type": "custom-title", "customTitle": "늦게 붙인 제목"}))
        copy = os.path.join(self.tmp.name, "backup", "-home-u-ash-wiki", f"{UUID}.jsonl")
        os.makedirs(os.path.dirname(copy))
        with open(copy, "w") as f:
            f.write(command + "\n")
        self.paths.insert(0, copy)
        result = self.run_candidates()
        self.assertEqual(result.returncode, 0, result.stderr)
        rows = [line.split("\t") for line in session_lines(result.stdout)]
        self.assertEqual([(r[0], r[4]) for r in rows], [(UUID, "늦게 붙인 제목")])


A, B, C, D, E, F = (f"{n}{n}{n}{n}{n}{n}{n}{n}-0000-0000-0000-000000000000" for n in "abcdef")
SIGNALS = ["오류", "거부", "재실행", "소유자 글", "compact", "호출", "분", "메모리"]
MEMORY = "/home/u/.claude/projects/-home-u-ash-wiki/memory"


def said(text, origin="human", ts="2026-10-08T01:00:00Z", **extra):
    record = {"type": "user", "timestamp": ts, "message": {"content": text}, **extra}
    if origin:
        record["origin"] = {"kind": origin}
    return json.dumps(record)


def reply(msg_id, *content, output=10, read=100, write=5, model="claude-opus-5-5"):
    usage = {"output_tokens": output, "cache_read_input_tokens": read, "cache_creation_input_tokens": write}
    return json.dumps({"type": "assistant", "timestamp": "2026-10-08T01:00:00Z",
                       "message": {"id": msg_id, "model": model, "content": list(content), "usage": usage}})


def call(call_id, name, **inp):
    return {"type": "tool_use", "id": call_id, "name": name, "input": inp}


def result(call_id, text, error=False):
    return json.dumps({"type": "user", "timestamp": "2026-10-08T01:00:00Z", "message": {"content": [
        {"type": "tool_result", "tool_use_id": call_id, "content": text, "is_error": error}]}})


def system(subtype, **fields):
    return json.dumps({"type": "system", "subtype": subtype, "timestamp": "2026-10-08T01:00:00Z", **fields})


class CostTest(unittest.TestCase):
    """--cost: 기록과 그 서브에이전트의 호출 수, 캐시 읽기와 쓰기, 출력."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.tmp.cleanup()

    def cost(self, path):
        result = subprocess.run([sys.executable, "-B", SCRIPT, "--cost", path], env=env_without_notes(), capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        lines = [line.split("\t") for line in result.stdout.splitlines()]
        self.assertEqual(lines[0], ["uuid", "호출", "캐시 읽기", "캐시 쓰기", "출력"])
        return lines[1]

    def write(self, path, *lines):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write("\n".join(lines) + "\n")

    def test_local_record_adds_each_message_once_with_its_subagents(self):
        path = os.path.join(self.tmp.name, f"{UUID}.jsonl")
        self.write(path, reply("m1", output=10, read=100, write=5), reply("m1", output=10, read=100, write=5),
                   reply("m2", output=20, read=200, write=7), reply("m3", output=1, read=1, write=1, model="<synthetic>"))
        subagent(stem_of(path), "a1", "general-purpose", "Search", reply("s1", output=3, read=30, write=2))
        self.assertEqual(self.cost(path), [UUID, "3", "330", "14", "33"])

    def test_fetched_cloud_record_takes_the_last_result_totals(self):
        path = os.path.join(self.tmp.name, "cloud", f"{UUID}.jsonl")
        totals = {"claude-sonnet-5-5": {"outputTokens": 490561, "cacheReadInputTokens": 1000, "cacheCreationInputTokens": 50},
                  "claude-haiku-5-5": {"outputTokens": 37599, "cacheReadInputTokens": 0, "cacheCreationInputTokens": 0}}
        early = {"claude-sonnet-5-5": {"outputTokens": 9, "cacheReadInputTokens": 9, "cacheCreationInputTokens": 9}}
        self.write(path, reply("m1", output=4, read=600, write=30),
                   json.dumps({"type": "result", "modelUsage": early}),
                   reply("m2", output=3, read=300, write=10),
                   json.dumps({"type": "result", "modelUsage": totals}))
        subagent(stem_of(path), "a1", "general-purpose", "Search", reply("s1", output=1, read=100, write=10))
        remote(stem_of(path), RUN, "scheduled_trigger")
        self.assertEqual(self.cost(path), [UUID, "3", "1000", "50", "528160"])


class LastRetroTest(unittest.TestCase):
    """--last-retro: 분석 목록의 회고 세션 열에서 가장 최근 회고와, 그 기록에서 낸 티켓."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.archive = os.path.join(self.tmp.name, "archive")
        os.makedirs(self.archive)

    def tearDown(self):
        self.tmp.cleanup()

    def last_retro(self, *paths):
        result = subprocess.run([sys.executable, "-B", SCRIPT, "--archive", self.archive, "--last-retro", *paths],
                                env=env_without_notes(), capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.splitlines()

    def test_most_recent_retro_and_the_tickets_its_record_made(self):
        old, new = A, B
        with open(os.path.join(self.archive, "analyzed.tsv"), "w") as f:
            f.write(f"{C}\t{old}\t2026-10-01\n{D}\t-\t2026-10-30\n{E}\t{new}\t2026-10-26\n{F}\t포화\t2026-10-31\n")
        records = []
        for uuid, number in ((old, 1), (new, 2)):
            path = os.path.join(self.tmp.name, f"{uuid}.jsonl")
            with open(path, "w") as f:
                f.write("\n".join([*bash("gh issue create --title t", f"https://github.com/o/r/issues/{number}\n", "b1"),
                                   *bash("gh issue view 9", "https://github.com/o/r/issues/9\n", "b2")]) + "\n")
            records.append(path)
        self.assertEqual(self.last_retro(*records), [
            "회고 세션\t날짜\t기록\tURL", f"{new}\t2026-10-26\t{records[1]}\thttps://github.com/o/r/issues/2"])

    def test_without_a_retro_in_the_list(self):
        with open(os.path.join(self.archive, "analyzed.tsv"), "w") as f:
            f.write(f"{C}\t-\t2026-10-01\n")
        self.assertEqual(self.last_retro(), ["지난 회고 없음"])


class SignalTest(unittest.TestCase):
    """후보 명령이 세션마다 메인과 서브에이전트 기록을 합쳐 세는 신호."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.archive = os.path.join(self.tmp.name, "archive")
        self.repo = os.path.join(self.tmp.name, "repo")
        self.paths = []
        git_repo(self.repo, {".claude/agents/source-verifier.md": "---\nname: source-verifier\n---\n"})

    def tearDown(self):
        self.tmp.cleanup()

    def transcript(self, uuid, *lines, folder=None):
        path = os.path.join(folder or self.tmp.name, f"{uuid}.jsonl")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            f.write("\n".join(lines) + "\n")
        self.paths.append(path)
        return stem_of(path)

    def output(self, *extra):
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, "--candidates", RETRO, *self.paths, *extra],
            cwd=self.repo, env=env_without_notes(), capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout

    def rows(self, *extra):
        lines = session_lines(self.output(*extra), header=True)
        header = lines[0].split("\t")
        return {cells[0]: dict(zip(header, cells)) for cells in (line.split("\t") for line in lines[1:])}

    def signals(self, uuid, *extra):
        row = self.rows(*extra)[uuid]
        return {name: row[name] for name in SIGNALS}

    def test_local_record_signals_add_main_and_subagents(self):
        command = "<command-message>wiki-verify</command-message>"
        session = self.transcript(
            UUID,
            said(command),
            reply("m1", call("b1", "Bash", command="npm run check")),
            result("b1", "Exit code 1\nfail", error=True),
            reply("m1", call("b2", "Bash", command="npm run check")),
            result("b2", "The user doesn't want to proceed with this tool use. The tool use was rejected", error=True),
            reply("m2", call("b3", "Bash", command=" npm run check")),
            result("b3", "This session is isolated in the worktree /w, but this command is too complex", error=True),
            said("진행해줘"),
            said("<task-notification>done</task-notification>", origin="task-notification"),
            said("Base directory for this skill: /x", origin=None, isMeta=True),
            system("compact_boundary", compactMetadata={"trigger": "auto"}),
            reply("m3", call("r1", "Read", file_path=f"{MEMORY}/handoff-format.md")),
            reply("m4", call("r2", "Read", file_path=f"{MEMORY}/MEMORY.md")),
            system("turn_duration", durationMs=100_000),
            system("turn_duration", durationMs=80_000),
        )
        subagent(
            session, "a1", "source-verifier", "Verify",
            said("너는 검증자다", origin=None),
            reply("s1", call("c1", "Bash", command=f"cat {MEMORY}/handoff-format.md {MEMORY}/source-host-access.md")),
            result("c1", "Permission for this action was denied by the Claude Code auto mode classifier.", error=True),
            reply("s2", call("c2", "Read", file_path="/repo/x.md")),
            result("c2", "File does not exist.", error=True),
            reply("s3", {"type": "text", "text": "끝"}, model="<synthetic>"),
        )
        self.assertEqual(self.signals(UUID), {
            "오류": "2", "거부": "3", "재실행": "2", "소유자 글": "1", "compact": "1",
            "호출": "6", "분": "3", "메모리": "2",
        })

    def session(self, uuid, first, errors=0, calls=1, compacts=0, start="2026-10-08T01:00:00Z", folder=None):
        lines = [said(first, ts=start)]
        lines += [line for n in range(errors) for line in (reply(f"e{n}", call(f"x{n}", "Read", file_path=f"/{n}")), result(f"x{n}", "nope", error=True))]
        lines += [reply(f"c{n}") for n in range(calls - errors)]
        lines += [system("compact_boundary", compactMetadata={})] * compacts
        return self.transcript(uuid, *lines, folder=folder)

    def test_sessions_are_grouped_by_flow_and_ranked_by_signals_above_the_flow_median(self):
        verify = "<command-message>wiki-verify</command-message>"
        self.session(A, verify, errors=2, calls=3, compacts=1)
        self.session(B, verify, calls=5)
        self.session(C, verify, errors=1, calls=1)
        self.session(D, "<command-message>reader-testing</command-message>")
        self.session(E, "<command-message>wiki-reader-testing</command-message>", start="2026-10-09T01:00:00Z")
        subagent(self.session(F, "#626 구현"), "a1", "source-verifier", "Verify")
        rows = self.rows()
        self.assertEqual([(u, r["흐름"], r["점수"]) for u, r in rows.items()], [
            (A, "wiki-verify", "2"), (B, "wiki-verify", "1"), (C, "wiki-verify", "0"),
            (D, "wiki-reader-testing", "0"), (E, "wiki-reader-testing", "0"),
            (F, "에이전트(source-verifier)", "0"),
        ])
        flows = flow_rows(self.output())
        self.assertEqual([f[:2] for f in flows], [["흐름", "세션"], ["wiki-verify", "3"], ["wiki-reader-testing", "2"], ["에이전트(source-verifier)", "1"]])

    def five_verify_sessions(self):
        verify = "<command-message>wiki-verify</command-message>"
        for n, uuid in enumerate((A, B, C, D, E)):
            self.session(uuid, verify, errors=n, calls=5 + n, start=f"2026-10-0{n + 1}T01:00:00Z")
        self.session(F, "<command-message>wiki-news</command-message>")

    def marks(self, *extra):
        return {u: r["추천"] for u, r in self.rows(*extra).items()}

    def test_two_strongest_and_one_random_session_are_recommended_per_flow(self):
        self.five_verify_sessions()
        marks = self.marks()
        self.assertEqual((marks[E], marks[D], marks[F]), ("신호", "신호", "신호"))
        self.assertEqual(sorted(marks[u] for u in (A, B, C)), ["-", "-", "무작위"])
        flows = flow_rows(self.output())
        self.assertEqual(flows[1][0], "wiki-verify")
        self.assertEqual(len(flows[1][2].split()), 3)

    def test_same_retro_session_picks_the_same_random_session(self):
        self.five_verify_sessions()
        self.assertEqual(self.marks(), self.marks())

    def test_first_session_after_the_last_retro_fixed_the_flow_is_recommended(self):
        self.five_verify_sessions()
        marks = self.marks("--fixed", "wiki-verify=2026-10-02T12:00:00Z", "wiki-ingest=2026-10-01T00:00:00Z")
        self.assertEqual(marks[C], "고친 뒤")
        self.assertEqual(marks[D], "신호")
        self.assertEqual(list(marks.values()).count("무작위"), 1)

    def test_fixed_session_already_strong_carries_both_marks(self):
        self.five_verify_sessions()
        self.assertEqual(self.marks("--fixed", "wiki-verify=2026-10-04T00:00:00Z")[D], "신호,고친 뒤")

    def test_two_fixes_of_one_flow_wait_for_the_later(self):
        self.five_verify_sessions()
        marks = self.marks("--fixed", "wiki-verify=2026-10-03T12:00:00Z", "wiki-verify=2026-10-01T12:00:00Z")
        self.assertIn("고친 뒤", marks[D])

    def test_fetched_cloud_records_are_ranked_and_recommended_like_local_ones(self):
        cloud = os.path.join(self.tmp.name, "cloud", "-home-user-ash-wiki")
        for n, uuid in enumerate((A, B, C, D)):
            run = f"cse_0{n}Run"
            remote(self.session(uuid, "/wiki-news 2026-w4" + str(n), errors=n, calls=4 + n, start=f"2026-10-0{n + 1}T01:00:00Z", folder=cloud), run, "scheduled_trigger")
        marks = self.marks("--fixed", "wiki-news=2026-10-01T12:00:00Z")
        self.assertEqual(list(marks), [D, C, B, A])
        self.assertEqual((marks[D], marks[C], marks[B]), ("신호", "신호", "고친 뒤"))
        self.assertEqual(marks[A], "무작위")

    def test_routine_run_joins_its_skill_flow_and_handing_a_skill_over_is_a_flow_of_its_own(self):
        cloud = os.path.join(self.tmp.name, "cloud", "-home-user-ash-wiki")
        remote(self.session(A, "/wiki-news 2026-w44", folder=cloud), RUN, "scheduled_trigger")
        self.session(B, "<command-message>wiki-news</command-message>")
        self.transcript(C, trigger("/wiki-news 2026-w01"))
        rows = self.rows()
        self.assertEqual({u: r["흐름"] for u, r in rows.items()}, {A: "wiki-news", B: "wiki-news", C: "wiki-news(루틴)"})

    def test_fetched_cloud_record_signals_follow_its_own_record_shapes(self):
        cloud = os.path.join(self.tmp.name, "cloud", "-home-user-ash-wiki")
        session = self.transcript(
            UUID,
            said("/wiki-ingest #18", origin=None, clientPlatform="web"),
            json.dumps({"type": "autocompact_state", "value": {"enabled": True, "threshold": 784000}}),
            reply("m1", call("b1", "Bash", command="gh pr checks 7")),
            result("b1", "Exit code 8\npending", error=True),
            json.dumps({"type": "queued_notification", "notification": {"content": "<wake reason=\"external-event\">"}}),
            said("Another Claude session sent a message: <agent-message>", origin="peer", isMeta=True),
            said("<task-notification>done</task-notification>", origin="task-notification"),
            said("PR 올려줘", origin=None, clientPlatform="android"),
            system("compact_boundary_like", compactMetadata={"pre_tokens": 900000}),
            reply("m2", call("r1", "Read", file_path="/root/.claude/projects/-home-user-ash-wiki/memory/news.md")),
            json.dumps({"type": "result", "subtype": "success", "durationMs": 150_000, "modelUsage": {}}),
            json.dumps({"type": "result", "subtype": "success", "durationMs": 30_000, "modelUsage": {}}),
            folder=cloud,
        )
        remote(session, "cse_02Web", "web_claude_ai")
        self.assertEqual(self.signals(UUID), {
            "오류": "1", "거부": "0", "재실행": "0", "소유자 글": "1", "compact": "1",
            "호출": "2", "분": "3", "메모리": "1",
        })


if __name__ == "__main__":
    unittest.main()
