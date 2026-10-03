---
title: 사이버보안 검증과 확인
tags:
  - security/cybersecurity
verified: 2026-10-03
---

[[iso-sae-21434|ISO/SAE 21434]]:2021은 **검증**(verification)을 명시된 요구사항이 충족되었음을 객관적 증거로 확인하는 것으로, **확인**(validation)을 아이템의 [[cybersecurity-goal|cybersecurity goal]]이 적절하고 이루어졌음을 객관적 증거로 확인하는 것으로 정의한다. 두 정의에서 검증은 요구사항을, 확인은 goal을 기준으로 삼는다.[@iso-sae-21434-obp-2021] 일반적인 V&V는 [[verification-and-validation|검증과 확인]]에서 다룬다.

## ISO/SAE 21434의 검증과 확인

ISO/SAE 21434:2021의 11절(cybersecurity validation)은 아이템의 확인을 차량 수준에서 다룬다.[@iso-sae-21434-obp-2021] 요구사항을 구현하고 검증하는 10절은 [[cybersecurity-specification|cybersecurity specification]]에서 다룬다.

## Automotive SPICE for Cybersecurity의 SEC.3·SEC.4

[[automotive-spice-for-cybersecurity|Automotive SPICE for Cybersecurity]] 2.0은 검증을 SEC.3(Risk Treatment Verification), 확인을 SEC.4(Risk Treatment Validation) 프로세스로 둔다. SEC.3의 목적은 설계의 구현과 컴포넌트의 [[integration-testing|통합]]이 사이버보안 요구사항, 정련한 architectural design, 상세 설계를 따르는지 확인하는 것이고, SEC.4의 목적은 통합된 시스템이 관련 cybersecurity goal을 이루는지 확인하는 것이다. 두 프로세스의 성과는 다음과 같다.[@vda-automotive-spice-cybersecurity-2025]

| 성과 | SEC.3                                                     | SEC.4                                                            |
| ---- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| 1    | 리스크 처리 검증 수단이 개발된다.                         | 리스크 처리 확인 수단이 cybersecurity goal을 바탕으로 명세된다.  |
| 2    | 릴리스 범위에 따라 검증 수단이 선택된다.                  | 회귀 확인 기준을 포함한 정해진 기준에 따라 확인 수단이 선택된다. |
| 3    | 설계의 구현과 컴포넌트의 통합이 검증되고 결과가 기록된다. | 통합된 시스템이 명세된 확인 수단으로 확인되고 결과가 기록된다.   |
| 4    | 검증 수단과 그 대상 사이에 일관성과 양방향 추적성이 선다. | 확인 수단과 그 대상 사이에 일관성과 양방향 추적성이 선다.        |
| 5    | 검증 결과가 요약되어 영향받는 모든 당사자에게 전달된다.   | 확인 결과가 요약되어 영향받는 모든 당사자에게 전달된다.          |

두 프로세스의 BP(base practice)는 다섯으로, 같은 순서를 밟는다.[@vda-automotive-spice-cybersecurity-2025]

| BP  | 하는 일                          |
| --- | -------------------------------- |
| BP1 | 수단의 명세                      |
| BP2 | 수단의 선택                      |
| BP3 | 활동 수행과 결과 기록            |
| BP4 | 일관성 확보와 양방향 추적성 수립 |
| BP5 | 결과의 요약과 전달               |

### 수단과 기법

SEC.3의 검증 수단에는 명세되지 않은 기능의 확인, 제어 흐름과 데이터 흐름의 동적 검증, 보안 코딩 표준에 초점을 둔 [[static-analysis|정적 분석]]이 들 수 있다. 검증 방법과 기법으로는 비인가 명령, 잘못된 해시 키를 가진 신호, 메시지 폭주처럼 공격을 모사하는 네트워크 테스트와 brute force 공격 모사가 들 수 있고, 감사와 리뷰 같은 기법도 들 수 있다.[@vda-automotive-spice-cybersecurity-2025]

SEC.3.BP2는 [[regression-testing|회귀]] 검증 기준을 포함한 선택 기준으로 검증 수단을 고르고 그 선택을 문서로 남기게 하며, 고른 수단은 릴리스 범위를 충분히 덮어야 한다. 선택 기준의 예로는 요구사항 우선순위, 지속적 개발, 회귀 검증의 필요, 테스트 벤치나 테스트 트랙, 공공 도로 같은 릴리스의 용도가 있다.[@vda-automotive-spice-cybersecurity-2025]

SEC.4의 확인 수단은 보통 아직 찾지 못한 취약점을 찾는 사이버보안 방법을 쓰며, 침투 테스트가 그 예다.[@vda-automotive-spice-cybersecurity-2025]

두 프로세스 모두 test case를 [[equivalence-partitioning|동치 분할]], [[boundary-value-analysis|경계값 분석]], 지식이나 경험에 기반한 [[error-guessing|오류 추정]]으로 끌어낼 수 있고, SEC.4는 여기에 negative test를 더한다. 기대 결과와 다른 검증·확인 결과는 두 프로세스 모두 SUP.9(Problem Resolution Management)로 처리한다.[@vda-automotive-spice-cybersecurity-2025] SUP.9 자체는 [[defect-management#ASPICE의 SUP.9|결함 관리]]에서 다룬다.

### 추적성

SEC.3.BP4는 검증 수단과 사이버보안 요구사항, 검증 수단과 정련한 architectural design·상세 설계·소프트웨어 유닛 사이에 일관성과 양방향 추적성을 세우고, 검증 결과와 검증 수단 사이에 양방향 추적성을 세운다. SEC.4.BP4는 확인 수단과 cybersecurity goal 사이에 일관성과 양방향 추적성을, 확인 결과와 확인 수단 사이에 양방향 추적성을 세운다. 양방향 추적성은 일관성을 뒷받침하고, 영향 분석을 쉽게 하며, 검증과 확인의 [[test-coverage|커버리지]]를 보이는 데 쓰인다.[@vda-automotive-spice-cybersecurity-2025]

![[diagrams/aspice-cybersecurity-traceability.svg]]

SEC.4.BP5가 요약해 전하는 결과에는 확인 활동에서 얻은 정보와, 새로 드러난 취약점에 관한 중요한 발견이 들 수 있다.[@vda-automotive-spice-cybersecurity-2025] 추적성 자체는 [[traceability|추적성]]에서 다룬다.
