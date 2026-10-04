---
title: Cybersecurity interface agreement
tags:
  - security/cybersecurity
verified: 2026-10-03
---

[[iso-sae-21434|ISO/SAE 21434]]:2021은 책임이 고객과 공급자에게 나뉜 아이템이나 컴포넌트의 사이버보안 활동을 **분산 사이버보안 활동**(distributed cybersecurity activities)으로 정의하고, 분산 사이버보안 활동에 관한 고객과 공급자 사이의 합의를 **cybersecurity interface agreement**로 정의한다. 이 표준의 7절(distributed cybersecurity activities)은 고객과 공급자 사이에 사이버보안 활동의 책임을 나누는 요구사항을 둔다. 7절은 공급자 역량(supplier capability), 견적 요청(request for quotation), 책임 정렬(alignment of responsibilities)을 하위 절로 둔다.[@iso-sae-21434-obp-2021]

## 합의에 담는 것

[[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0은 정보 항목 02-50(Interface agreement)에 다음을 정하도록 둔다.[@vda-automotive-spice-cybersecurity-2025]

- 고객과 공급자의 이해관계자와 연락 담당
- Tailoring에 관한 합의
- 분산 활동에 대한 고객과 공급자의 책임. 개발과 post-development에서 필요한 조치가 든다.
- 취약점, 발견 사항, 리스크 같은 문제가 생겼을 때의 정보와 산출물 공유
- 합의한 고객과 공급자의 마일스톤
- 공급자의 지원과 유지보수 기간[@vda-automotive-spice-cybersecurity-2025]

![[diagrams/cybersecurity-interface-agreement-parties.svg]]

ISO/SAE 21434:2021은 RASIC을 responsible, accountable, supporting, informed, consulted의 약어로 둔다.[@iso-sae-21434-obp-2021] Automotive SPICE for Cybersecurity 2.0은 interface agreement에서 분산 활동에 대한 고객·공급자 책임을 역할이나 RASIC 차트로 적을 수 있다고 둔다.[@vda-automotive-spice-cybersecurity-2025]

## Automotive SPICE for Cybersecurity의 ACQ.2

Automotive SPICE for Cybersecurity 2.0은 공급자 선정을 ACQ.2(Supplier Request and Selection) 프로세스로 두고, 그 목적을 관련 기준에 따라 약정이나 합의를 맺을 공급자를 고르는 것으로 둔다. ACQ.2가 드는 획득(ACQ) 프로세스 그룹은 고객이 제품이나 서비스를 얻으려고 수행하는 프로세스로 이루어지고, 공급자도 자기 공급자에게 고객으로 나설 때 이 프로세스를 수행한다. ACQ.2의 성과는 다음 넷이다.[@vda-automotive-spice-cybersecurity-2025]

| 성과 | 내용                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 1    | 공급자 평가 기준이 세워진다.                                                  |
| 2    | 정한 기준으로 공급자가 평가된다.                                              |
| 3    | 후보 공급자에게 RFQ(request for quotation)가 발행된다.                        |
| 4    | 약정이나 합의와 시정 조치가 합의되고, 공급자와의 계약에 평가 결과가 반영된다. |

ACQ.2의 BP(base practice)는 다음 넷이다.[@vda-automotive-spice-cybersecurity-2025]

| BP  | 하는 일                     |
| --- | --------------------------- |
| BP1 | 공급자 평가 기준 수립       |
| BP2 | 후보 공급자 평가            |
| BP3 | RFQ 준비와 발행             |
| BP4 | 약정이나 합의의 협상과 체결 |

- BP1의 평가 기준에는 기능·비기능 요구사항, TARA·공격 모델·취약점 분석 같은 사이버보안 개념과 방법에 대한 공급자의 기술 역량, 개발과 post-development(생산, 운용, 폐기)·거버넌스·품질·정보 보안에서 조직이 갖춘 사이버보안 역량, 사이버보안을 포함한 지속 운영, 이전 프로젝트의 공급자 모니터링으로 얻은 사이버보안 역량과 성과의 증거가 들 수 있다.
- BP2의 후보 평가는 이전 Automotive SPICE for Cybersecurity 평가의 요약, 조직의 [[cybersecurity-management-system|사이버보안 관리 시스템]]의 증거(가능하면 조직 [[cybersecurity-management-system#감사|감사]] 결과), ISMS(information security management system)의 증거, 사이버보안 엔지니어링을 뒷받침할 수 있는 QMS(quality management system)의 증거, 이전 구매 경험으로 뒷받침할 수 있다.
- BP3에서는 평가를 바탕으로 후보 공급자를 정하고, 드러난 편차에 대한 시정 조치 계획을 담은 RFQ를 준비해 발행한다.
- BP4에서 분산 사이버보안 활동은 연락 담당, 책임, tailoring, 정보 공유, 일정, 마일스톤 같은 측면을 고려해 cybersecurity interface agreement로 정할 수 있다. 자유·오픈소스 소프트웨어처럼 지원이 전혀 없는 인도물에는 interface agreement가 필요 없다.[@vda-automotive-spice-cybersecurity-2025]
