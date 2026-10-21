"""recall.py의 리콜 문턱 셈.

python3 -B -m unittest discover -s .claude/skills/wiki-news

fixtures/recalls.tsv는 NHTSA 리콜 평면 파일(2026-10-21 받음)에서 고정한 행이다. 2025-03~2026-08에
`FORWARD COLLISION AVOIDANCE`나 `SERVICE BRAKES` 분류가 든 캠페인 19개를, 캠페인과 분류마다 한 행씩
옮겼다. 소프트웨어 리콜이 아닌 캠페인(25V639, 25V711 등)도 들어 있다.
"""

import os
import subprocess
import sys
import tempfile
import unittest
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SCRIPT = os.path.join(HERE, "recall.py")
ROWS = os.path.join(HERE, "fixtures", "recalls.tsv")


def run(*args):
    return subprocess.run([sys.executable, "-B", SCRIPT, *args], capture_output=True, text=True)


class RecallTest(unittest.TestCase):
    def test_campaign_whose_categories_all_had_software_recalls_is_not_a_new_defect_type(self):
        result = run(ROWS, "26V084")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("26V084: 접수일 2026-02-12, 대수 204, 소프트웨어 리콜", result.stdout)
        self.assertIn(
            "FORWARD COLLISION AVOIDANCE: 5건(25V187, 25V389, 25V585, 25V691, 25V746)", result.stdout
        )
        self.assertIn("SERVICE BRAKES: 2건(25V392, 25V409)", result.stdout)
        self.assertIn("새 결함 유형 아님", result.stdout)
        self.assertNotIn("새 결함 유형임", result.stdout)

    def test_category_count_takes_software_recalls_in_the_twelve_months_before_the_date(self):
        result = run(ROWS, "--category", "FORWARD COLLISION AVOIDANCE", "--date", "2026-08-31")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(
            "FORWARD COLLISION AVOIDANCE: 6건(25V585, 25V691, 25V746, 26V084, 26V316, 26V415)",
            result.stdout,
        )

    def test_reads_the_zip_as_published(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive = os.path.join(tmp, "FLAT_RCL_POST_2010.zip")
            with zipfile.ZipFile(archive, "w") as z:
                z.write(ROWS, "FLAT_RCL_POST_2010.txt")
            result = run(archive, "26V084000")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("26V084: 접수일 2026-02-12", result.stdout)

    def test_unknown_campaign_fails(self):
        result = run(ROWS, "26V999")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("26V999", result.stderr)


if __name__ == "__main__":
    unittest.main()
