"""posted.py의 NHTSA 리콜 게시일 판정.

python3 -B -m unittest discover -s .claude/skills/wiki-news

fixtures/posted/flat.tsv는 NHTSA 리콜 평면 파일(2026-11-23 받음)에서 캠페인마다 첫 행을 고정한 것이고,
fixtures/posted/api/는 같은 날 `https://api.nhtsa.gov/safetyIssues/byNhtsaId`가 돌려준 응답에서 캠페인 번호와
문서 목록만 남긴 것이다. API 응답이 없는 캠페인(26V669, 26V740)은 API가 실패한 경우로 쓴다. 26V667은 46주차의
접수 범위(그 주와 그 전 4주) 밖이고, 26T017은 타이어 리콜이다.
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "posted.py")
FIXTURES = os.path.join(HERE, "fixtures", "posted")
FLAT = os.path.join(FIXTURES, "flat.tsv")
API = os.path.join(FIXTURES, "api")


def run(*args):
    return subprocess.run(
        [sys.executable, "-B", SCRIPT, FLAT, *args, "--api-dir", API], capture_output=True, text=True
    )


def listed(stdout, week):
    """출력에서 그 주차에 든 캠페인 번호."""
    numbers, inside = [], False
    for line in stdout.splitlines():
        if line.startswith("20"):
            inside = line.startswith(f"{week}:")
        elif inside and line.startswith("26"):
            numbers.append(line.split("\t")[0])
    return numbers


class PostedTest(unittest.TestCase):
    def test_week_46_takes_campaigns_posted_that_week_whatever_week_they_were_received(self):
        result = run("2026-w46")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(listed(result.stdout, "2026-w46"), ["26V721", "26V731", "26V735", "26V740"])
        self.assertIn("26V721\t게시일 2026-11-10\t접수일 2026-10-29", result.stdout)
        self.assertIn("26V735\t게시일 2026-11-14\t접수일 2026-11-05", result.stdout)

    def test_campaign_posted_in_week_45_belongs_to_week_45(self):
        result = run("2026-w45")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(listed(result.stdout, "2026-w45"), ["26V717"])
        self.assertIn("26V717\t게시일 2026-11-04\t접수일 2026-10-29", result.stdout)

    def test_equipment_recalls_count_and_tires_do_not(self):
        result = run("2026-w43")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(listed(result.stdout, "2026-w43"), ["26E073"])
        self.assertNotIn("26T017", run("2026-w45").stdout)

    def test_campaign_whose_api_failed_is_judged_by_its_received_date_and_reported(self):
        result = run("2026-w46")
        self.assertIn("26V740\t접수일 2026-11-09(게시일 API 실패)", result.stdout)
        self.assertIn("게시일 API 실패 2건", result.stdout)
        self.assertIn("- 26V669: ", result.stdout)
        self.assertIn("- 26V740: ", result.stdout)
        self.assertNotIn("26V667", result.stdout)
        self.assertNotIn("26V669\t", result.stdout)

    def test_access_record_carries_the_failures(self):
        with tempfile.TemporaryDirectory() as tmp:
            access = os.path.join(tmp, "R-access.jsonl")
            with open(access, "w") as f:
                f.write('{"source":"KBA","week":"","opened":true}\n')
            result = run("2026-w46", "--access", access)
            self.assertEqual(result.returncode, 0, result.stderr)
            with open(access) as f:
                records = [json.loads(line) for line in f if line.strip()]
        self.assertEqual(records[0]["source"], "KBA")
        record = records[1]
        self.assertEqual(record["source"], "NHTSA 리콜")
        self.assertIs(record["opened"], True)
        self.assertEqual(record["seen"], 4)
        self.assertEqual([f.split(":")[0] for f in record["failed"]], ["26V669", "26V740"])
        self.assertTrue(all("접수일로 판정" in f for f in record["failed"]))


if __name__ == "__main__":
    unittest.main()
