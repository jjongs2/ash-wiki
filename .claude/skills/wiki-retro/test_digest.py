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


def env_without_notes():
    return {k: v for k, v in os.environ.items() if k != "ASH_WIKI_NOTES"}


def entry(kind, text):
    return json.dumps({"type": kind, "timestamp": "2026-10-08T01:00:00Z", "message": {"content": text}})


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

    def run_digest(self, *args, script=SCRIPT, check=True, notes=None):
        env = dict(os.environ, ASH_WIKI_NOTES=notes or self.notes)
        result = subprocess.run(
            [sys.executable, "-B", script, "--archive", self.archive, *args],
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

    def test_unchanged_transcript_is_kept(self):
        self.run_digest(self.transcript)
        main = os.path.join(self.archive, UUID, f"{UUID[:8]}-main.md")
        with open(main, "a") as f:
            f.write("marker\n")
        out = self.run_digest(self.transcript)
        self.assertIn("있음", out)
        with open(main) as f:
            self.assertIn("marker", f.read())

    def test_grown_transcript_is_redone(self):
        self.run_digest(self.transcript)
        with open(self.transcript, "a") as f:
            f.write(entry("user", "later") + "\n")
        self.run_digest(self.transcript)
        with open(os.path.join(self.archive, UUID, f"{UUID[:8]}-main.md")) as f:
            self.assertIn("later", f.read())

    def test_redo_keeps_report(self):
        self.run_digest(self.transcript)
        report = os.path.join(self.archive, UUID, "report.md")
        with open(report, "w") as f:
            f.write("findings\n")
        with open(self.transcript, "a") as f:
            f.write(entry("user", "later") + "\n")
        self.run_digest(self.transcript)
        self.assertTrue(os.path.exists(report))

    def test_changed_script_redoes_digest(self):
        script = os.path.join(self.tmp.name, "digest.py")
        shutil.copy(SCRIPT, script)
        self.run_digest(self.transcript, script=script)
        main = os.path.join(self.archive, UUID, f"{UUID[:8]}-main.md")
        with open(main, "a") as f:
            f.write("marker\n")
        with open(script, "a") as f:
            f.write("\n# changed\n")
        self.run_digest(self.transcript, script=script)
        with open(main) as f:
            self.assertNotIn("marker", f.read())

    def test_changed_notes_path_redoes_digest(self):
        self.run_digest(self.transcript, notes=os.path.join(self.tmp.name, "other-notes"))
        main = os.path.join(self.archive, UUID, f"{UUID[:8]}-main.md")
        with open(main, "a") as f:
            f.write("marker\n")
        self.run_digest(self.transcript)
        with open(main) as f:
            self.assertNotIn("marker", f.read())

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

    def test_same_text_sent_at_another_time_is_kept(self):
        main, _ = self.digest(entry("user", "계속"), entry("user", "다음"), queued("계속", kind="human"))
        self.assertEqual(main.count("계속"), 2)

    def test_duplicated_message_naming_notes_stays_hidden(self):
        text = f"읽은 노트: {self.notes}/iso-26262.md"
        main, _ = self.digest(queued(text), entry("user", text))
        self.assertNotIn("iso-26262", main)

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
        start = json.dumps({"type": "custom-title", "timestamp": first_ts})
        with open(self.transcript, "w") as f:
            f.write("\n".join([start, *lines]) + "\n")
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--version", self.transcript],
            cwd=self.repo, env=env_without_notes(), capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.strip().split("\t")

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


def trigger(content):
    body = {"job_config": {"ccr": {"events": [{"data": {"message": {"content": content, "role": "user"}}}]}}}
    return assistant({"type": "tool_use", "id": "r1", "name": "RemoteTrigger", "input": {"action": "update", "body": body}})


class CandidatesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.archive = os.path.join(self.tmp.name, "archive")
        self.paths = []

    def tearDown(self):
        self.tmp.cleanup()

    def transcript(self, uuid, *lines):
        path = os.path.join(self.tmp.name, f"{uuid}.jsonl")
        with open(path, "w") as f:
            f.write("\n".join(lines) + "\n")
        self.paths.append(path)

    def candidates(self):
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--archive", self.archive, "--candidates", RETRO, *self.paths],
            env=env_without_notes(), capture_output=True, text=True,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return {row[0]: row for row in (line.split("\t") for line in result.stdout.splitlines()[1:])}

    def test_session_handing_a_skill_to_a_routine_is_a_candidate(self):
        self.transcript(UUID, trigger("/wiki-news 2026-w01\n\n인자는 하나다."))
        self.transcript(OTHER, entry("user", "wiki-news를 고쳐 줘"))
        rows = self.candidates()
        self.assertEqual(list(rows), [UUID])
        self.assertEqual(rows[UUID][1], "wiki-news(루틴)")

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
        self.assertEqual(rows[UUID][1:], ["wiki-verify", "2026-10-08", "CAN 재조사", "https://github.com/o/r/pull/7", handoff])
        self.assertEqual(rows[OTHER][4:], ["-", "-"])


if __name__ == "__main__":
    unittest.main()
