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
            self.draft("DCAS는 레벨 2로 다룬다. [`R171` (Introduction 2.) “treated as “SAE level 2 according to SAE J3016” here”]")
        )
        self.assertEqual((code, findings), (0, []))

    def test_quote_missing_from_copy_is_reported(self):
        self.copy("I11898", "1 Scope\nThis document specifies the physical layer.\n")
        code, findings = self.run_check(self.draft("CAN은 데이터 링크 계층을 정한다. [`I11898` (1 Scope) “specifies the data link layer”]"))
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 1)
        self.assertIn("I11898", findings[0])
        self.assertIn("사본에 없다", findings[0])
        self.assertTrue(findings[0].endswith("“specifies the data link layer”"))
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

    def test_numbered_body_lines_are_not_headings(self):
        self.copy("ST", "7 Electrical\n7.3 Supply\nThe LDO supplies the core.\n8 channels are sampled at once.\n3.3 V rail powers the core.\nThe LDO is trimmed at test.\n7.4 Timing\nClock.")
        code, findings = self.run_check(
            self.draft(
                "LDO는 시험에서 맞춘다. [`ST` (7.3) “trimmed at test”]",
                "LDO는 시험에서 맞춘다. [`ST` (7) “trimmed at test”]",
                "LDO는 시험에서 맞춘다. [`ST` (3.3) “trimmed at test”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 1)
        self.assertIn(":8:", findings[0])
        self.assertIn("찾지 못했다", findings[0])

    # 목차 줄(점 지시선 없음), 장 안의 번호 목록, 표 값 줄이 제목 후보로 섞인 사본.
    OUTLINE = "\n".join(
        [
            "6 Specifications",
            "7 Detailed Description",
            "6 Specifications",
            "6.1 Ratings",
            "Supply voltage",
            "5.5",
            "8.1",
            "7 Detailed Description",
            "7.3 Feature Description",
            "7.3.1 Wake",
            "1. Send a WAKE ping.",
            "6. Repeat this procedure for every device.",
            "7.3.2 Hotplug",
            "8.1",
            "9 Mode",
            "The ladder spreads the hotplug spike.",
            "7.3.3 Faults",
            "Faults latch in the summary register.",
            "8 Application",
            "8.1 Typical",
            "Isolate the host.",
        ]
    )

    def test_out_of_order_headings_do_not_bound_sections(self):
        self.copy("TI-BQ", self.OUTLINE)
        code, findings = self.run_check(
            self.draft(
                "사다리가 퍼뜨린다. [`TI-BQ` (7) “ladder spreads the hotplug spike”]",
                "사다리가 퍼뜨린다. [`TI-BQ` (7.3, 7.3.2) “ladder spreads the hotplug spike”]",
                "요약에 래치한다. [`TI-BQ` (7.3) “faults latch in the summary register”]",
                "공급 전압. [`TI-BQ` (6.1) “supply voltage”]",
                "호스트를 떼어 둔다. [`TI-BQ` (8.1) “isolate the host”]",
                "사다리가 퍼뜨린다. [`TI-BQ` (6) “ladder spreads the hotplug spike”]",
                "사다리가 퍼뜨린다. [`TI-BQ` (9) “ladder spreads the hotplug spike”]",
                "사다리가 퍼뜨린다. [`TI-BQ` (8.1) “ladder spreads the hotplug spike”]",
                "요약에 래치한다. [`TI-BQ` (7.3.2) “faults latch in the summary register”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["11", "12", "13", "14"])
        self.assertIn("찾지 못했다", findings[1])
        self.assertTrue(all("위치 밖" in finding for finding in findings[:1] + findings[2:]))

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

    # 쪽 번호가 끝 줄에 있고, 본문에도 숫자만 있는 줄(표 칸, 비트 번호)이 있는 사본.
    BITS = "\f".join(
        [
            "Cover\nBattery monitor",
            "Contents\n7\n6\n5\n2",
            "Features\nMeasures 16 cells.\n3",
            "Pinout\nVC2\nCopyright\n4",
            "5\nBit field\n7\n6\n5\nThe register is cleared on read.\n5\nFeedback",
            "Figure only",
            "Write a register for all devices in the chain.\n7\n6\n5\n4\n3\n2\nCopyright\n7",
        ]
    )

    def test_number_lines_in_body_are_not_page_numbers(self):
        self.copy("TI-BQ", self.BITS)
        code, findings = self.run_check(
            self.draft(
                "읽으면 지운다. [`TI-BQ` (5쪽) “cleared on read”]",
                "그림. [`TI-BQ` (6쪽) “figure only”]",
                "모두에 쓴다. [`TI-BQ` (7쪽) “for all devices in the chain”]",
                "모두에 쓴다. [`TI-BQ` (5쪽) “for all devices in the chain”]",
                "모두에 쓴다. [`TI-BQ` (2쪽) “for all devices in the chain”]",
                "셀을 잰다. [`TI-BQ` (5쪽) “measures 16 cells”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["9", "10", "11"])
        self.assertTrue(all("위치 밖" in finding for finding in findings))

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
        self.copy("R100", "2.37 Rechargeable Electrical Energy Storage System (REESS) means the system. Storage Systems on printed circuit boards (PCBs).")
        self.copy("I15118", "3.3 certificate authority (CA) issues certificates.\n3.4 Power over Coax (PoC) carries power.")
        code, findings = self.run_check(
            self.draft(
                "REESS(Rechargeable Electrical Energy Storage System)를 관리한다. [`R100` (2.37) “Rechargeable Electrical Energy Storage System (REESS)”]",
                "CA(Certificate Authority)가 발급한다. [`I15118` (3.3) “certificate authority (CA)”]",
                "PoC(Power-over-Coax)로 보낸다. [`I15118` (3.4) “Power over Coax (PoC)”]",
                "PCB(printed circuit board)에 둔다. [`I15118` (3.3) “issues certificates”; `R100` (2.37) “printed circuit boards (PCBs)”]",
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
        self.copy("R100", "2.37 Rechargeable Electrical Energy Storage System (REESS) means the system.\nnon-maskable interrupt (NMI)")
        code, findings = self.run_check(
            self.draft(
                "REESS(Rechargeable Energy Storage System)를 관리한다. [`R100` (2.37) “Rechargeable Electrical Energy Storage System (REESS)”]",
                "NMI(Non Maskable Int)는 막을 수 없다. [`R100` (2.37) “non-maskable interrupt (NMI)”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 2)
        self.assertIn("REESS", findings[0])
        self.assertIn("NMI", findings[1])
        self.assertTrue(all("풀이가 인용에 없다" in finding for finding in findings))

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

    def test_expansion_after_wikilink_is_read(self):
        self.copy("NIST", "true random number generator (TRNG)\nElliptic Curve Diffie-Hellman (ECDH)")
        self.page("hsm", "HSM은 [[true-random-number-generator|TRNG]](True Random Number Generator)를 둔다.\n")
        self.page("ecc", "[[ecdh|ECDH]](Elliptic Curve Diffie-Hellman)로 키를 나눈다.\n")
        code, findings = self.run_check(
            self.draft(
                "TRNG(True-Random Number Generator)를 둔다. [`NIST` (Overview) “true random number generator (TRNG)”]",
                "[[ecdh|ECDH]](Elliptic Curve Diffie-Hellman)로 나눈다. [`NIST` (Overview) “Elliptic Curve Diffie-Hellman (ECDH)”]",
                "[[true-random-number-generator|TRNG]](Truly Random Generator)를 둔다. [`NIST` (Overview) “true random number generator (TRNG)”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["6", "8", "8"])
        self.assertIn("content/의 풀이와 다르다", findings[0])
        self.assertIn("hsm.md", findings[0])
        self.assertIn("풀이가 인용에 없다", findings[1])
        self.assertIn("content/의 풀이와 다르다", findings[2])

    def test_location_forms_in_tickets_are_read(self):
        self.copy(
            "ISO",
            "1 Introduction\nalpha text\n\f2 Normative references\nbeta text\n\f3 Terms\ngamma text\n\f4 Requirements\nthe quote lives here\n",
        )
        wrong = ["§2", "2절 Normative references", "2장 제목", "2(Normative references)", "인쇄 2쪽", "Normative references(2쪽)", "p.2"]
        right = ["§4", "4절 Requirements", "4장 제목", "4(Requirements)", "인쇄 4쪽", "Requirements(PDF 4쪽, 인쇄 4쪽)", "표 4-1(4쪽)", "p.4 Requirements"]
        code, findings = self.run_check(
            self.draft(*[f"요구한다. [`ISO` ({location}) “the quote lives here”]" for location in wrong + right])
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], [str(6 + i) for i in range(len(wrong))])
        self.assertTrue(all("인용이 위치 밖에 있다" in finding for finding in findings))

    def test_semicolon_separated_locations_are_read(self):
        self.copy("R157", "5.5.4.2.6.5 Lane change\nearlier text\n7.1 Activation\nthe quote lives here\n")
        code, findings = self.run_check(
            self.draft(
                "요구한다. [`R157` (표지; 5.5.4.2.6.5) “the quote lives here”]",
                "요구한다. [`R157` (표지; 5.5.4.2.6.1.3; 5.5.4.2.6.5) “the quote lives here”]",
                "요구한다. [`R157` (표지; 7.1) “the quote lives here”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["6", "7"])
        self.assertTrue(all("인용이 위치 밖에 있다" in finding for finding in findings))

    def test_section_lists_ranges_and_annex_parts_are_read(self):
        self.copy(
            "R157",
            "\n".join(
                [
                    "3 Definitions",
                    "3.21 Alpha term",
                    "alpha text",
                    "3.22 Beta term",
                    "the beta quote",
                    "3.23 Gamma term",
                    "gamma text",
                    "6 Requirements",
                    "6.6 First",
                    "6.6.2 Second",
                    "early text",
                    "6.7 Third",
                    "the range quote",
                    "6.10 Fourth",
                    "6.10.2 Fifth",
                    "late text",
                    "7 Tests",
                    "after text",
                    "Annex I Critical Scenarios",
                    "Part 1",
                    "3.3.1 Inner one",
                    "the annex quote",
                    "3.3.2 Inner two",
                    "other annex text",
                ]
            ),
        )
        wrong = [
            ("3.21과 Note 1", "the beta quote"),
            ("3.21·3.23 Note 1", "the beta quote"),
            ("3.28의 SOURCE", "the beta quote"),
            ("새 3.21", "the beta quote"),
            ("Annex I(Critical Scenarios)", "the beta quote"),
            ("Annex I, Part 1 3.3.2", "the annex quote"),
            ("6.6.2~6.10.2", "after text"),
        ]
        right = [
            ("3.22와 NOTE", "the beta quote"),
            ("3.21·3.22 Note 1", "the beta quote"),
            ("Annex I(Critical Scenarios)", "the annex quote"),
            ("Annex I, Part 1 3.3.1", "the annex quote"),
            ("6.6.2~6.10.2", "the range quote"),
            ("3.21\\~3.23", "the beta quote"),
        ]
        code, findings = self.run_check(
            self.draft(*[f"요구한다. [`R157` ({location}) “{quote}”]" for location, quote in wrong + right])
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], [str(6 + i) for i in range(len(wrong))])
        self.assertIn("찾지 못했다", findings[2])
        self.assertTrue(all("인용이 위치 밖에 있다" in finding for finding in findings[:2] + findings[3:]))

    def test_lettered_section_numbers_are_read(self):
        self.copy("ARM", "B3.4 Memory types\nordinary text\nB3.5 Caches\nthe cache quote\nB3.10 Barriers\nlater text\n")
        code, findings = self.run_check(
            self.draft(
                "캐시를 둔다. [`ARM` (B3.5) “the cache quote”]",
                "캐시를 둔다. [`ARM` (B3.4) “the cache quote”]",
                "캐시를 둔다. [`ARM` (B3.10) “the cache quote”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["7", "8"])
        self.assertTrue(all("인용이 위치 밖에 있다" in finding for finding in findings))

    def test_unreadable_location_is_reported(self):
        self.copy("ISO", "1 Introduction\nthe quote lives here\n")
        code, findings = self.run_check(
            self.draft(
                "요구한다. [`ISO` (제1절) “the quote lives here”]",
                "요구한다. [`ISO` (Overview) “the quote lives here”]",
                "요구한다. [`ISO` (Table 3) “the quote lives here”]",
                "요구한다. [`ISO` ('NDS.Live' 절) “the quote lives here”]",
                "요구한다. [`ISO` (첫 절(머리 문단 뒤)) “the quote lives here”]",
                "요구한다. [`ISO` (Executive summary 첫 문장) “the quote lives here”]",
                "요구한다. [`ISO` (쪽 머리 요약) “the quote lives here”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["6", "9", "10"])
        self.assertTrue(all("위치를 읽지 못했다" in finding for finding in findings))

    def test_reverse_and_annotated_expansions_are_read(self):
        self.copy("SAE", "On-Road Automated Driving (ORAD)\nthe control pilot (CP) line\nsleepiness is rated\nsystem MMU\nElectrical/Electronic architecture\nHomePlug Green PHY (HPGP)")
        self.page("ethernet-phy", "**PHY**(Physical Layer Device)는 신호를 만든다.\n")
        self.page("homeplug", "**HPGP**(HomePlug GreenPHY)는 전력선 통신이다.\n")
        code, findings = self.run_check(
            self.draft(
                "On-Road Automated Driving(ORAD) 위원회. [`SAE` (Scope) “On-Road Automated Driving (ORAD)”]",
                "Control pilot(CP) 선을 쓴다. [`SAE` (Scope) “the control pilot (CP) line”]",
                "졸음은 Karolinska Sleepiness Scale(KSS)로 잰다. [`SAE` (Scope) “sleepiness is rated”]",
                "SMMU(System Memory Management Unit, IOMMU라고도 부름)를 둔다. [`SAE` (Scope) “system MMU”]",
                "Department of Transportation(DOT)이 정한다. [`SAE` (Scope) “sleepiness is rated”]",
                "E/E(Electrical/Electronic) 아키텍처. [`SAE` (Scope) “Electrical/Electronic architecture”]",
                "HomePlug Green PHY(HPGP)를 쓴다. [`SAE` (Scope) “HomePlug Green PHY (HPGP)”]",
                "HomePlug AV(HPGP)를 쓴다. [`SAE` (Scope) “HomePlug Green PHY (HPGP)”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual([finding.split(":")[1] for finding in findings], ["8", "9", "10", "12"])
        self.assertTrue(all("풀이가 인용에 없다" in finding for finding in findings[:3]))
        self.assertIn("HPGP(HomePlug Green PHY): content/의 풀이와 다르다", findings[3])
        self.assertIn("KSS(Karolinska Sleepiness Scale)", findings[0])
        self.assertIn("SMMU(System Memory Management Unit)", findings[1])
        self.assertIn("DOT(Department of Transportation)", findings[2])

    def test_bold_lead_expansion_in_content_is_read(self):
        self.copy("NIST", "micro controller unit (MCU)\nengine control unit (ECU)\nadvanced encryption scheme (AES)")
        self.page("microcontroller", "---\ntitle: 마이크로컨트롤러\n---\n\n**MCU**(Microcontroller Unit)는 칩 하나에 CPU를 담는다.\n")
        self.page("electronic-control-unit", "**ECU**(Electronic Control Unit)는 차량을 제어한다.\n")
        self.page("symmetric-key-cryptography", "**AES**(Advanced Encryption Standard)는 블록 암호다.\n")
        code, findings = self.run_check(
            self.draft(
                "MCU(Micro Controller Unit)를 쓴다. [`NIST` (Overview) “micro controller unit (MCU)”]",
                "ECU(Engine Control Unit)가 제어한다. [`NIST` (Overview) “engine control unit (ECU)”]",
                "AES(Advanced Encryption Scheme)로 암호화한다. [`NIST` (Overview) “advanced encryption scheme (AES)”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 3)
        self.assertTrue(all("content/의 풀이와 다르다" in finding for finding in findings))
        for finding, page in zip(findings, ["microcontroller.md", "electronic-control-unit.md", "symmetric-key-cryptography.md"]):
            self.assertIn(page, finding)

    def test_bold_lead_name_before_abbreviation_in_content_is_read(self):
        self.copy("IEEE", "time-aware scheduler (TAS)\nsecure on-board communication (SecOC)\nSchedule Manager (SchM)")
        self.page("time-aware-shaper", "**Time-aware shaper**(TAS)는 시간 창마다 큐를 연다.\n")
        self.page("secure-onboard-communication", "**Secure Onboard Communication**(SecOC)은 메시지를 인증한다.\n")
        self.page("basic-software-scheduler", "**Basic Software Scheduler**(SchM)는 실행 단위를 부른다.\n")
        code, findings = self.run_check(
            self.draft(
                "TAS(time-aware scheduler)가 창을 연다. [`IEEE` (Overview) “time-aware scheduler (TAS)”]",
                "SecOC(secure on-board communication)이 인증한다. [`IEEE` (Overview) “secure on-board communication (SecOC)”]",
                "SchM(Schedule Manager)이 부른다. [`IEEE` (Overview) “Schedule Manager (SchM)”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 3)
        self.assertIn("time-aware-shaper.md", findings[0])
        self.assertIn("secure-onboard-communication.md", findings[1])
        self.assertIn("basic-software-scheduler.md", findings[2])
        self.assertTrue(all("content/의 풀이와 다르다" in finding for finding in findings))

    def test_expansion_follows_term_decision(self):
        self.decide(
            "- ADAS 풀이 Advanced Driver Assistance Systems: Advanced Driver Assistance System (#659)\n"
            "- CAN CC 풀이 CAN classic: CAN CC(CC: classic) (#564)\n"
            "- PLL 풀이: 통일하지 않음 (#675). 인용한 출처의 풀이대로\n"
        )
        self.copy("SAE", "Driver assistance systems assist the driver.\nphase lock loop (PLL)")
        self.page("clock", "PLL(Phase-Locked Loop)은 클록을 만든다.\n")
        code, findings = self.run_check(
            self.draft(
                "ADAS(Advanced Driver Assistance Systems)는 돕는다. [`SAE` (Scope) “assist the driver”]",
                "PLL(phase lock loop)이 곱한다. [`SAE` (Scope) “phase lock loop (PLL)”]",
                "CAN CC(CAN classic)를 쓴다. [`SAE` (Scope) “assist the driver”]",
                "ADAS(Advanced Driver Assistance System)는 돕는다. [`SAE` (Scope) “assist the driver”]",
            )
        )
        self.assertEqual(code, 1)
        self.assertEqual(len(findings), 1)
        self.assertIn(":9:", findings[0])
        self.assertIn("용어 표기 결정", findings[0])
        self.assertIn("Advanced Driver Assistance Systems", findings[0])


if __name__ == "__main__":
    unittest.main()
