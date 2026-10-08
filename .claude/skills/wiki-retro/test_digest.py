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

    def run_digest(self, *args, script=SCRIPT, check=True):
        env = dict(os.environ, ASH_WIKI_NOTES=self.notes)
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


if __name__ == "__main__":
    unittest.main()
