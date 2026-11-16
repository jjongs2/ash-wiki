"""check_fragments.py의 조각 대조.

python3 -B -m unittest discover -s .claude/skills/wiki-enrich
"""

import os
import subprocess
import sys
import tempfile
import unittest

SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "check_fragments.py")


class CheckFragments(unittest.TestCase):
    def setUp(self):
        self.dir = tempfile.TemporaryDirectory()
        self.copies = os.path.join(self.dir.name, "사본")
        self.content = os.path.join(self.dir.name, "content")
        os.makedirs(self.copies)
        os.makedirs(self.content)
        self.terms = os.path.join(self.dir.name, "wiki-terms.md")
        self.decide("")

    def tearDown(self):
        self.dir.cleanup()

    def copy(self, abbreviation, text):
        with open(os.path.join(self.copies, f"{abbreviation}.txt"), "w", encoding="utf-8") as f:
            f.write(text)

    def decide(self, text):
        with open(self.terms, "w", encoding="utf-8") as f:
            f.write(text)

    def page(self, slug, text):
        with open(os.path.join(self.content, f"{slug}.md"), "w", encoding="utf-8") as f:
            f.write(text)

    def run_check(self, draft):
        path = os.path.join(self.dir.name, "ingest-1.md")
        with open(path, "w", encoding="utf-8") as f:
            f.write(draft)
        result = subprocess.run(
            [sys.executable, "-B", SCRIPT, "--content", self.content, "--terms", self.terms, self.copies, path],
            capture_output=True,
            text=True,
        )
        findings = [line for line in result.stdout.splitlines() if line.startswith(path)]
        return result.returncode, findings

    def draft(self, *fragments):
        lines = ["## Pages", "", "### `can`", "", "- 머리말"]
        lines += [f"  - {fragment}" for fragment in fragments]
        return "\n".join(lines) + "\n"

    def test_quote_in_copy_passes(self):
        self.copy("I11898", "1 Scope\nThis document specifies the data link layer.\n")
        code, findings = self.run_check(self.draft("CAN은 데이터 링크 계층을 정한다. [`I11898` (1 Scope) “specifies the data link layer”]"))
        self.assertEqual((code, findings), (0, []))

    def test_quote_with_nested_quotes_is_one_quote(self):
        self.copy("R171", "Introduction\n2. DCAS are treated as \"SAE level 2 according to SAE J3016\" here.")
        code, findings = self.run_check(
            self.draft("DCAS는 레벨 2로 다룬다. [`R171` (Introduction 2.; 4.) “treated as “SAE level 2 according to SAE J3016” here”]")
        )
        self.assertEqual((code, findings), (0, []))

    def test_quote_missing_from_copy_is_reported(self):
        self.copy("I11898", "1 Scope\nThis document specifies the physical layer.\n")
        code, findings = self.run_check(self.draft("CAN은 데이터 링크 계층을 정한다. [`I11898` (1 Scope) “specifies the data link layer”]"))
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 1)
        self.assertIn("I11898", findings[0])
        self.assertIn("사본에 없다", findings[0])
        self.assertTrue(findings[0].endswith("specifies the data link layer”") or "specifies the data link layer" in findings[0])
        self.assertIn(":6:", findings[0])

    SPEC = "\n".join(
        [
            "Contents",
            "3.3 Daisy chain ........ 5",
            "3.4 Coulomb counting ........ 7",
            "\f",
            "3 Functional description",
            "3.3 Daisy chain",
            "3.3.1 Wiring",
            "Every bit is duplicated with a complement.",
            "12",
            "The link is retimed in every device.",
            "3.4 Coulomb counting",
            "The counter represents the discrete integral of samples.",
            "Annex B",
            "B.2 Tests",
            "Overcharge protection is tested at a high SOC.",
        ]
    )

    def test_quote_inside_cited_section_passes(self):
        self.copy("TI-BQ", self.SPEC)
        code, findings = self.run_check(
            self.draft(
                "보수를 함께 보낸다. [`TI-BQ` (3.3) “every bit is duplicated”]",
                "장치마다 다시 클록한다. [`TI-BQ` (3.3.1, 표 2) “retimed in every device”]",
                "적분을 둔다. [`TI-BQ` (3.4 Coulomb counting) “discrete integral”]",
                "과충전을 시험한다. [`TI-BQ` (Annex B, B.2) “overcharge protection is tested”]",
                "링크는 다시 클록한다. [`TI-BQ` (3.2, 3.3) “retimed in every device”]",
                "레지스터에 둔다. [`TI-BQ` (Overview) “discrete integral”]",
            )
        )
        self.assertEqual((code, findings), (0, []))

    def test_quote_outside_cited_section_is_reported(self):
        self.copy("TI-BQ", self.SPEC)
        code, findings = self.run_check(
            self.draft(
                "적분을 둔다. [`TI-BQ` (3.3) “discrete integral”]",
                "보수를 함께 보낸다. [`TI-BQ` (3.4) “every bit is duplicated”]",
                "과충전을 시험한다. [`TI-BQ` (Annex A) “overcharge protection is tested”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 3)
        self.assertIn("3.3", findings[0])
        self.assertIn("밖", findings[0])
        self.assertIn(":6:", findings[0])
        self.assertIn(":8:", findings[2])

    DATASHEET = "\f".join(
        [
            "BQ79616-Q1 cover\nAutomotive battery monitor",
            "Features\nMeasures 16 cells in series.\n1",
            "Description\nStreams data from device to device.\n2",
        ]
    )

    def test_quote_on_cited_page_passes(self):
        self.copy("TI-BQ", self.DATASHEET)
        code, findings = self.run_check(
            self.draft(
                "셀 16개를 잰다. [`TI-BQ` (1쪽 Features) “measures 16 cells”]",
                "장치 사이로 보낸다. [`TI-BQ` (PDF 3쪽, Figure 2) “streams data from device to device”]",
                "셀 16개를 잰다. [`TI-BQ` (1쪽, 2쪽) “measures 16 cells”]",
                "장치 사이로 보낸다. [`TI-BQ` (1–2쪽) “streams data from device to device”]",
                "장치 사이로 보낸다. [`TI-BQ` (1\\~2쪽) “streams data from device to device”]",
            )
        )
        self.assertEqual((code, findings), (0, []))

    def test_quote_on_other_page_is_reported(self):
        self.copy("TI-BQ", self.DATASHEET)
        self.copy("TI-PLAIN", "Cover\fIntro\fThe device streams data.")
        code, findings = self.run_check(
            self.draft(
                "셀 16개를 잰다. [`TI-BQ` (2쪽) “measures 16 cells”]",
                "장치 사이로 보낸다. [`TI-BQ` (PDF 2쪽) “streams data from device to device”]",
                "보낸다. [`TI-PLAIN` (2쪽) “streams data”]",
                "셀 16개를 잰다. [`TI-BQ` (2–3쪽) “measures 16 cells”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["6", "7", "8", "9"])
        self.assertTrue(all("위치 밖" in finding for finding in findings))

    def test_expansion_inside_quote_passes(self):
        self.copy("R100", "2.37 Rechargeable Electrical Energy Storage System (REESS) means the system.")
        self.copy("I15118", "3.3 certificate authority (CA) issues certificates.\n3.4 Power over Coax (PoC) carries power.")
        code, findings = self.run_check(
            self.draft(
                "REESS(Rechargeable Electrical Energy Storage System)를 관리한다. [`R100` (2.37) “Rechargeable Electrical Energy Storage System (REESS)”]",
                "CA(Certificate Authority)가 발급한다. [`I15118` (3.3) “certificate authority (CA)”]",
                "PoC(Power-over-Coax)로 보낸다. [`I15118` (3.4) “Power over Coax (PoC)”]",
                "ASA(차량 SerDes 업계 연합)가 정하고 Annex U(informative)가 다룬다. [`R100` (2.37) “means the system”]",
            )
        )
        self.assertEqual((code, findings), (0, []))

    def test_text_that_is_not_an_expansion_is_skipped(self):
        self.copy("TI", "Range FFT uses the Fast Fourier Transform (FFT).\nDirect current (DC) flows.")
        code, findings = self.run_check(
            self.draft(
                "range-FFT(FFT: Fast Fourier Transform)를 돌린다. [`TI` (Overview) “Fast Fourier Transform (FFT)”]",
                "ADS([[levels-of-driving-automation]])와 PAL(MIPI PAL/CSI-2)을 둔다. [`TI` (Overview) “Range FFT”]",
                "DC(direct current)로 충전한다. [`TI` (Overview) “Direct current (DC)”] [`TI` (Overview) “flows”]",
            )
        )
        self.assertEqual((code, findings), (0, []))

    def test_expansion_missing_from_quotes_is_reported(self):
        self.copy("R100", "2.37 Rechargeable Electrical Energy Storage System (REESS) means the system.")
        code, findings = self.run_check(
            self.draft("REESS(Rechargeable Energy Storage System)를 관리한다. [`R100` (2.37) “Rechargeable Electrical Energy Storage System (REESS)”]")
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 1)
        self.assertIn("REESS", findings[0])
        self.assertIn("풀이가 인용에 없다", findings[0])

    def test_expansion_differing_from_content_is_reported(self):
        self.copy("I26262", "3.94 phase-locked loop (PLL) and phase locked loop.\n3.95 non-maskable interrupt (NMI)")
        self.page("clock", "---\ntitle: 클록\n---\n\nPLL(Phase Locked Loop)은 클록을 만든다.\n")
        self.page("interrupt", "---\ntitle: 인터럽트\n---\n\nNMI(Non-Maskable Interrupt)는 막을 수 없다.\n")
        code, findings = self.run_check(
            self.draft(
                "PLL(Phase-Locked Loop)이 클록을 곱한다. [`I26262` (3.94) “phase-locked loop (PLL)”]",
                "NMI(Non-Maskable Interrupt)는 막을 수 없다. [`I26262` (3.95) “non-maskable interrupt (NMI)”]",
                "PLL(Phase Locked Loop)이 클록을 곱한다. [`I26262` (3.94) “phase locked loop”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 1)
        self.assertIn(":6:", findings[0])
        self.assertIn("Phase Locked Loop", findings[0])
        self.assertIn("clock.md", findings[0])

    def test_expansion_follows_term_decision(self):
        self.decide(
            "- ADAS 풀이 Advanced Driver Assistance Systems: Advanced Driver Assistance System (#659)\n"
            "- PLL 풀이: 통일하지 않음 (#675). 인용한 출처의 풀이대로\n"
        )
        self.copy("SAE", "Driver assistance systems assist the driver.\nphase lock loop (PLL)")
        self.page("clock", "PLL(Phase-Locked Loop)은 클록을 만든다.\n")
        code, findings = self.run_check(
            self.draft(
                "ADAS(Advanced Driver Assistance Systems)는 돕는다. [`SAE` (Scope) “assist the driver”]",
                "PLL(phase lock loop)이 곱한다. [`SAE` (Scope) “phase lock loop (PLL)”]",
                "ADAS(Advanced Driver Assistance System)는 돕는다. [`SAE` (Scope) “assist the driver”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 1)
        self.assertIn(":8:", findings[0])
        self.assertIn("용어 표기 결정", findings[0])
        self.assertIn("Advanced Driver Assistance Systems", findings[0])


if __name__ == "__main__":
    unittest.main()
