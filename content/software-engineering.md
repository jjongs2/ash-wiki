---
title: 소프트웨어 공학
tags:
  - process
verified: 2026-10-02
---

[[iso-iec-ieee-12207|ISO/IEC/IEEE 12207]]:2026은 **소프트웨어 공학**(software engineering)을 소프트웨어의 개발, 운용, 유지보수에 체계적이고 규율 있으며 정량화할 수 있는 접근을 적용하는 일로 정의하고, 이를 소프트웨어에 공학을 적용하는 일이라 덧붙인다.[@iso-iec-ieee-12207-obp-2026]

## 1968년 NATO 회의

NATO 과학위원회는 1968년 10월 7\~11일 독일 가르미슈에서 소프트웨어 공학 회의를 열었다. 회의 이름의 "software engineering"은 소프트웨어 제작에도 기존 공학 분야처럼 이론적 기초와 실무 규율이 필요하다는 뜻을 담아 일부러 도발적으로 고른 말이었다. 회의 보고서는 Naur와 Randell이 엮었다.[@naur-software-engineering-1969]

회의에서는 큰 소프트웨어 프로젝트가 일정과 명세를 맞추기 어려운 문제, 비용 추정과 실제 지출의 격차, 사회에 깊이 들어가는 시스템의 신뢰성이 논의되었다. 일부 참가자는 이 상황을 소프트웨어 위기(software crisis)나 소프트웨어 격차(software gap)라 불렀지만, 그 심각성에 대한 견해는 엇갈렸다.[@naur-software-engineering-1969]

이듬해 1969년 10월 27\~31일에는 NATO 과학위원회가 후원한 후속 회의가 로마 근교에서 열렸다.[@buxton-software-engineering-techniques-1970]

## 소프트웨어의 정의

ISO/IEC/IEEE 12207:2026은 소프트웨어를 컴퓨터 시스템의 운용에 관한 컴퓨터 프로그램과 절차, 그리고 경우에 따라 이에 딸린 문서와 데이터로 정의한다.[@iso-iec-ieee-12207-obp-2026] ISO/IEC 2382:2015는 소프트웨어를 정보 처리 시스템의 프로그램, 절차, 규칙과 이에 딸린 문서의 전부나 일부로 정의한다.[@iso-iec-2382-obp-2015]

## 본질적 어려움

Brooks는 1986년 기술 보고서 "No Silver Bullet"에서 소프트웨어 개발의 어려움을, 소프트웨어의 본성에 내재한 본질(essence)과 지금의 제작에 따르지만 내재하지는 않는 부수(accidents)로 나누었다. 그는 본질의 내재적 성질로 넷을 들었다.[@brooks-no-silver-bullet-1986]

- complexity: 같은 부분이 거의 없고, 규모를 키우면 서로 다른 요소의 수가 늘며 요소들이 비선형으로 상호작용해 전체 복잡도가 규모보다 훨씬 빠르게 커진다.
- conformity: 사람이 만든 여러 제도와 시스템의 인터페이스에 맞춰야 해서, 필연이 아닌 임의의 복잡성을 떠안는다.
- changeability: 쓰이는 동안 끊임없이 변경 압력을 받는다.
- invisibility: 본래 공간에 자리하지 않아 바로 쓸 기하학적 표현이 없고, 그려 보일 수 없다.[@brooks-no-silver-bullet-1986]

Brooks는 10년 안에 생산성, 신뢰성, 단순성 가운데 어느 하나라도 열 배 높여 줄 단일한 기술이나 관리 기법은 없다고 주장했다.[@brooks-no-silver-bullet-1986]

## SWEBOK

SWEBOK(Software Engineering Body of Knowledge) 지침은 IEEE Computer Society가 펴내며, 분야에서 일반적으로 받아들여진 지식을 지식 영역(knowledge area)으로 나눠 정리한다.[@ieee-swebok-2026] V3.0(2014)은 15개 지식 영역을 두었다.[@ieee-swebok-v3-2014] V4.0(2024)은 Software Architecture, Software Engineering Operations, Software Security를 더해 아래 18개 지식 영역으로 늘렸다.[@ieee-swebok-2026]

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
