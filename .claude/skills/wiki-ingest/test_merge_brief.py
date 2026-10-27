"""merge_brief.py의 브리프 합치기.

python3 -B -m unittest discover -s .claude/skills/wiki-ingest
"""

import os
import subprocess
import sys
import tempfile
import unittest

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "merge_brief.py")

BRIEF = """# 브리프: #1 묶음

## 초안 에이전트 지시

2. 현행판을 확인해 `<사본 폴더>/brief-part.md`의 `## 현행판 표`에 적는다.
- 받은 출처는 `## 사본 목록`에 적는다.

## 도해 에이전트 지시

할 일:

1. 브리프의 `## 현행판 표`를 따른다.

```md
## 페이지 초안

<초안>
```
"""

PART_A = """# 조각 A

## 현행판 표

| 이름 | 현행판 | 확인한 주소 |
| --- | --- | --- |
| ISO 24089 | ISO 24089:2023 | https://www.iso.org/standard/77796.html |
| UN R156 | 01 시리즈 | https://unece.org/a |

## 사본 목록

- https://www.iso.org/standard/77796.html → `.work/draft-A/iso.txt`
"""

PART_B = """# 조각 B

## 현행판 표

| 이름 | 현행판 | 확인한 주소 |
| --- | --- | --- |
| UN R156 | 원판과 01 시리즈 | https://unece.org/b |
| RFC 9019 | 판 없음 | https://www.rfc-editor.org/info/rfc9019 |

## 사본 목록

- https://www.rfc-editor.org/rfc/rfc9019.txt → `.work/draft-B/rfc9019.txt`
"""


class MergeBriefTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.brief = self.write("brief.md", BRIEF)
        self.parts = [self.write("brief-part-A.md", PART_A), self.write("brief-part-B.md", PART_B)]

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, name, text):
        path = os.path.join(self.tmp.name, name)
        with open(path, "w") as f:
            f.write(text)
        return path

    def run_script(self):
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, self.brief, *self.parts], capture_output=True, text=True, check=True
        )
        with open(self.brief) as f:
            return f.read(), result.stdout

    def test_parts_land_in_one_section_each_and_instructions_stay(self):
        merged, _ = self.run_script()
        self.assertTrue(merged.startswith(BRIEF))
        self.assertEqual(merged.count("\n## 현행판 표\n"), 1)
        self.assertEqual(merged.count("\n## 사본 목록\n"), 1)
        table = merged.split("\n## 현행판 표\n")[1].split("\n## ")[0]
        self.assertIn("| ISO 24089 | ISO 24089:2023 |", table)
        self.assertIn("| RFC 9019 | 판 없음 |", table)
        copies = merged.split("\n## 사본 목록\n")[1]
        self.assertIn("`.work/draft-A/iso.txt`", copies)
        self.assertIn("`.work/draft-B/rfc9019.txt`", copies)

    def test_same_name_standards_are_printed_and_both_rows_kept(self):
        merged, out = self.run_script()
        self.assertIn("| UN R156 | 01 시리즈 |", merged)
        self.assertIn("| UN R156 | 원판과 01 시리즈 |", merged)
        self.assertIn("이름이 같은 표준 1개", out)
        self.assertIn("- UN R156", out)
        self.assertNotIn("ISO 24089", out)
        self.assertNotIn("RFC 9019", out)

    def test_table_keeps_one_header_when_parts_write_it_differently(self):
        with open(self.parts[1], "w") as f:
            f.write(PART_B.replace("| 이름 | 현행판 | 확인한 주소 |\n| --- | --- | --- |", "| 표준 | 현행판 | 주소 |\n|---|---|---|"))
        merged, out = self.run_script()
        table = merged.split("\n## 현행판 표\n")[1].split("\n## ")[0]
        self.assertTrue(table.strip().startswith("| 이름 | 현행판 | 확인한 주소 |\n| --- | --- | --- |\n"))
        self.assertNotIn("| 표준 |", table)
        self.assertNotIn("|---|", table)
        self.assertIn("| RFC 9019 | 판 없음 |", table)
        self.assertIn("- UN R156", out)

    def test_copy_tables_from_each_part_stay_whole(self):
        table = "사본 폴더: `.work/draft-{0}`\n\n| 원래 URL | 사본 |\n| --- | --- |\n| https://example.org/{0} | `{0}.txt` |\n"
        for part, name in zip(self.parts, "AB"):
            with open(part) as f:
                text = f.read()
            with open(part, "w") as f:
                f.write(text.split("## 사본 목록")[0] + "## 사본 목록\n\n" + table.format(name))
        merged, _ = self.run_script()
        copies = merged.split("\n## 사본 목록\n")[1]
        self.assertIn(table.format("A").strip(), copies)
        self.assertIn(table.format("B").strip(), copies)

    def test_running_again_changes_nothing(self):
        first, first_out = self.run_script()
        second, second_out = self.run_script()
        self.assertEqual(first, second)
        self.assertEqual(first_out, second_out)
        self.assertEqual(second.count("| 이름 | 현행판 | 확인한 주소 |"), 1)


if __name__ == "__main__":
    unittest.main()
