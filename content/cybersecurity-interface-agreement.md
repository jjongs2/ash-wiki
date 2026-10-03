---
title: Cybersecurity interface agreement
tags:
  - security/cybersecurity
verified: 2026-10-03
---

ISO/SAE 21434:2021은 책임이 고객과 공급자에게 나뉜 아이템이나 컴포넌트의 사이버보안 활동을 **분산 사이버보안 활동**(distributed cybersecurity activities)으로 정의하고, 분산 사이버보안 활동에 관한 고객과 공급자 사이의 합의를 **cybersecurity interface agreement**로 정의한다. 이 표준의 7절(distributed cybersecurity activities)은 고객과 공급자 사이에 사이버보안 활동의 책임을 나누는 요구사항을 둔다.[@iso-sae-21434-obp-2021]

## 합의에 담는 것

Automotive SPICE for Cybersecurity 2.0은 정보 항목 02-50(Interface agreement)에 다음을 정하도록 둔다.

- 고객과 공급자의 이해관계자와 연락 담당
- Tailoring에 관한 합의
- 분산 활동에 대한 고객과 공급자의 책임. 개발과 post-development에서 필요한 조치가 든다.
- 취약점, 발견 사항, 리스크 같은 문제가 생겼을 때의 정보와 산출물 공유
- 합의한 고객과 공급자의 마일스톤
- 공급자의 지원과 유지보수 기간[@vda-automotive-spice-cybersecurity-2-0-2025]

ISO/SAE 21434:2021은 RASIC을 responsible, accountable, supporting, informed, consulted의 약어로 둔다.[@iso-sae-21434-obp-2021] Automotive SPICE for Cybersecurity 2.0은 interface agreement의 고객·공급자 책임을 역할이나 RASIC 차트로 적을 수 있다고 둔다.[@vda-automotive-spice-cybersecurity-2-0-2025]

## Automotive SPICE for Cybersecurity의 ACQ.2

Automotive SPICE for Cybersecurity는 VDA QMC가 펴내는 [[automotive-spice|ASPICE]]의 사이버보안 확장이다.[@vda-automotive-spice-publications-2026] Automotive SPICE for Cybersecurity 2.0은 공급자 선정을 ACQ.2(Supplier Request and Selection) 프로세스로 두고, 그 목적을 관련 기준에 따라 약정이나 합의를 맺을 공급자를 고르는 것으로 둔다. ACQ.2의 BP(base practice)는 다음 넷이다.[@vda-automotive-spice-cybersecurity-2-0-2025]

| BP  | 하는 일                                |
| --- | -------------------------------------- |
| BP1 | 공급자 평가 기준 수립                  |
| BP2 | 후보 공급자 평가                       |
| BP3 | RFQ(request for quotation) 준비와 발행 |
| BP4 | 약정이나 합의의 협상과 체결            |

- BP1의 평가 기준에는 기능·비기능 요구사항, TARA·공격 모델·취약점 분석 같은 사이버보안 개념과 방법에 대한 공급자의 기술 역량, 개발과 post-development(생산, 운용, 폐기)·거버넌스·품질·정보 보안에서 조직이 갖춘 사이버보안 역량, 사이버보안을 포함한 지속 운영, 이전 프로젝트의 공급자 모니터링으로 얻은 사이버보안 역량과 성과의 증거가 들 수 있다.
- BP2의 후보 평가는 이전 Automotive SPICE for Cybersecurity 평가의 요약, 조직의 사이버보안 관리 체계의 증거(가능하면 조직 감사 결과), ISMS(information security management system)의 증거, 사이버보안 엔지니어링을 뒷받침할 수 있는 QMS(quality management system)의 증거, 이전 구매 경험으로 뒷받침할 수 있다.
- BP3에서는 평가를 바탕으로 후보 공급자를 정하고, 드러난 편차에 대한 시정 조치 계획을 담은 RFQ를 준비해 발행한다.
- BP4에서 분산 사이버보안 활동은 연락 담당, tailoring, 책임, 정보 공유, 마일스톤, 일정 같은 측면을 고려해 cybersecurity interface agreement로 정할 수 있다. 자유·오픈소스 소프트웨어처럼 지원이 전혀 없는 인도물에는 interface agreement가 필요 없다.[@vda-automotive-spice-cybersecurity-2-0-2025]
