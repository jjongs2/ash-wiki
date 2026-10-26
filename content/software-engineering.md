---
title: 소프트웨어 공학
tags:
  - sw-engineering
verified: 2026-10-02
---

[[iso-iec-ieee-12207|ISO/IEC/IEEE 12207]]:2026은 **소프트웨어 공학**(software engineering)을 소프트웨어의 개발, 운용, 유지보수에 체계적이고 규율 있으며 정량화할 수 있는 접근을 적용하는 일로 정의하고, 이를 소프트웨어에 공학을 적용하는 일이라 덧붙인다.[@iso-iec-ieee-12207-obp-2026] ISO/IEC 2382:2015는 소프트웨어 공학을, 소프트웨어의 생산, 지원, 품질을 최적화하려고 소프트웨어의 설계, 구현, 테스트, 문서화에 과학·기술 지식, 방법, 경험을 체계적으로 적용하는 일로 정의한다.[@iso-iec-2382-obp-2015]

## 1968년 NATO 회의

NATO 과학위원회는 1968년 10월 7\~11일 독일 가르미슈에서 소프트웨어 공학 회의를 열었다. 회의 이름의 "software engineering"은 소프트웨어 제작에도 기존 공학 분야처럼 이론적 기초와 실무 규율이 필요하다는 뜻을 담아 일부러 도발적으로 고른 말이었다. 회의 보고서는 Naur와 Randell이 엮었다.[@naur-software-engineering-1969]

회의에서는 큰 소프트웨어 프로젝트가 일정과 명세를 맞추기 어려운 문제, 비용 추정과 실제 지출의 격차, 사회에 깊이 들어가는 시스템의 신뢰성이 논의되었다. 일부 참가자는 이 상황을 소프트웨어 위기(software crisis)나 소프트웨어 격차(software gap)라 불렀지만, 그 심각성에 대한 견해는 엇갈렸다.[@naur-software-engineering-1969]

이듬해 1969년 10월 27\~31일에는 NATO 과학위원회가 후원한 후속 회의가 로마 근교에서 열렸다.[@buxton-software-engineering-techniques-1970]

## 소프트웨어의 정의

ISO/IEC/IEEE 12207:2026은 소프트웨어를 컴퓨터 시스템의 운용에 관한 컴퓨터 프로그램과 절차, 그리고 경우에 따라 이에 딸린 문서와 데이터로 정의한다.[@iso-iec-ieee-12207-obp-2026] ISO/IEC 2382:2015는 소프트웨어를 정보 처리 시스템의 프로그램, 절차, 규칙과 이에 딸린 문서의 전부나 일부로 정의한다.[@iso-iec-2382-obp-2015]

## 본질적 어려움

Brooks는 1986년 기술 보고서 "No Silver Bullet"에서 소프트웨어 개발의 어려움을, 소프트웨어의 본성에 내재한 본질(essence)과 당시의 제작에 따르지만 내재하지는 않는 부수(accidents)로 나누었다. 그는 본질의 내재적 성질로 넷을 들었다.[@brooks-no-silver-bullet-1986]

- complexity: 같은 부분이 거의 없고, 규모를 키우면 서로 다른 요소의 수가 늘며 요소들이 비선형으로 상호작용해 전체 복잡도가 규모보다 훨씬 빠르게 커진다.
- conformity: 서로 다른 사람이 제각각 설계한 여러 제도와 시스템의 인터페이스에 맞춰야 해서, 소프트웨어만 다시 설계해서는 없앨 수 없는 임의의 복잡성을 떠안는다.
- changeability: 쓰이는 동안 끊임없이 변경 압력을 받는다.
- invisibility: 본래 공간에 자리하지 않아 바로 쓸 기하학적 표현이 없고, 그려 보일 수 없다.[@brooks-no-silver-bullet-1986]

Brooks는 10년 안에 생산성, 신뢰성, 단순성 가운데 어느 하나라도 열 배 높여 줄 단일한 기술이나 관리 기법은 없다고 주장했다.[@brooks-no-silver-bullet-1986]

## 전문 분야로 자리 잡기

IEEE Computer Society는 1972년 Transactions on Software Engineering을 처음 펴냈고, 1976년 소프트웨어 공학 표준을 만드는 위원회를 두었다. IEEE Computer Society 이사회와 ACM Council이 각각 승인한 1993년의 두 동의로 두 단체의 공동 운영 위원회(steering committee)가 꾸려졌다. 이 위원회는 지식 체계와 권장 실무, 윤리와 전문 표준, 교육과정 세 분야에 작업반을 두었고, SWEBOK 2004년판은 세 분야 가운데 첫째인 지식 체계와 권장 실무를 담았다.[@ieee-swebok-v4-0a-2026]

ACM과 IEEE Computer Society의 공동 작업반(Joint Task Force)이 권고하고 두 단체가 함께 승인한 Software Engineering Code of Ethics and Professional Practice 5.2는 소프트웨어 엔지니어가 지킬 여덟 원칙을 둔다.[@acm-software-engineering-code-2026]

| 원칙                | 지킬 것                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Public              | 공익에 맞게 행동한다.                                                                                  |
| Client and Employer | 공익에 맞는 범위에서 고객과 고용주에게 가장 이로운 방식으로 행동한다.                                  |
| Product             | 자기 제품과 그 수정이 할 수 있는 가장 높은 전문 기준을 충족하게 한다.                                  |
| Judgment            | 전문가로서 판단할 때 진실성과 독립성을 지킨다.                                                         |
| Management          | 소프트웨어 공학의 관리자와 리더는 소프트웨어 개발과 유지보수의 관리에서 윤리적 접근을 따르고 장려한다. |
| Profession          | 공익에 맞게 전문직의 진실성과 평판을 높인다.                                                           |
| Colleagues          | 동료에게 공정하고 협력적으로 대한다.                                                                   |
| Self                | 자기 전문 실무에 대해 평생 배우고, 전문 실무에서 윤리적 접근을 장려한다.                               |

## SWEBOK

IEEE Computer Society는 분야에서 일반적으로 받아들여진 지식을 지식 영역(knowledge area)으로 나눠 정리한 SWEBOK 지침을 펴낸다.[@ieee-swebok-2026] V3.0(2014)은 15개 지식 영역을 두었다.[@ieee-swebok-v3-2014] V4.0(2024)은 Software Architecture, Software Engineering Operations, Software Security를 더해 아래 18개 지식 영역으로 늘렸다.[@ieee-swebok-2026]

| 지식 영역                                  | V4.0에서 새로 듦 |
| ------------------------------------------ | ---------------- |
| Software Requirements                      |                  |
| Software Architecture                      | 예               |
| Software Design                            |                  |
| Software Construction                      |                  |
| Software Testing                           |                  |
| Software Engineering Operations            | 예               |
| Software Maintenance                       |                  |
| Software Configuration Management          |                  |
| Software Engineering Management            |                  |
| Software Engineering Process               |                  |
| Software Engineering Models and Methods    |                  |
| Software Quality                           |                  |
| Software Security                          | 예               |
| Software Engineering Professional Practice |                  |
| Software Engineering Economics             |                  |
| Computing Foundations                      |                  |
| Mathematical Foundations                   |                  |
| Engineering Foundations                    |                  |

SWEBOK 2004년판과 V3.0은 고치지 않은 채 ISO/IEC에 제출되어, 각각 기술 보고서 ISO/IEC TR 19759:2005와 ISO/IEC TR 19759:2015로 받아들여졌다.[@ieee-swebok-v4-0a-2026]
