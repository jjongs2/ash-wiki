---
title: ADS 시나리오 기반 테스트
tags:
  - applications/adas
aliases:
  - ISO 34501
  - ISO 34502
  - ISO 34504
  - ISO 34505
verified: 2026-11-20
---

[[levels-of-driving-automation|ADS]]의 **시나리오 기반 테스트**(scenario-based testing)는 ADS를 미리 검증하는 접근으로, 자동차 분야에서 널리 지지된다.[@iso-34504-obp-2024] NATM(New Assessment/Test Method for Automated Driving) 지침에 따르면 시나리오 기반 검증은 ADS를 단 차량이 안전하게 운행하는 능력을 시험하는 특정 상황을 재현하는 것이고, 이 지침은 ADS의 안전 검증 활동을 시나리오 기반 접근으로 짜기를 권한다.[@unece-wp29-2023-44-rev1-2023] ISO 34502:2022는 제품 개발 중에 적용하는 시나리오 기반 안전 평가 프로세스를 다룬다.[@iso-34502-obp-2022]

ADS의 테스트에서 **시나리오**(scenario)는 대개 ADS나 시험 대상 차량(subject vehicle)을 포함하는 장면(scene)의 열과, [[levels-of-driving-automation#ADS|DDT]](Dynamic Driving Task)를 수행하는 동안의 그 상호작용이고, **테스트 시나리오**(test scenario)는 ADS나 시험 대상 차량을 테스트하고 평가하려는 시나리오다. 시나리오는 자연어로 쓴 functional scenario부터 명시적 파라미터 값으로 그린 concrete scenario까지 추상화 수준을 나눠 기술한다.[@iso-34501-obp-2022] ISO 34501\~34505는 시나리오를 기술하는 용어, 시나리오 기반 안전 평가 틀, [[operational-design-domain|ODD]], 시나리오 분류, 시나리오 평가와 [[test-case|테스트 케이스]] 생성을 정한다.[@iso-34501-2022][@iso-34502-2022][@iso-34503-2023][@iso-34504-2024][@iso-34505-2025]

[[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-4와 ISTQB가 다루는 [[software-testing|소프트웨어 테스트]] 기법은 [[scenario-based-testing|시나리오 기반 테스트]]에서 다룬다.

## 쓰는 곳

UNECE의 NATM 지침(ECE/TRANS/WP.29/2023/44/Rev.1)은 시나리오 기반 접근을 권하는 까닭으로, 충돌·법규 위반·해제 없이 달린 km 같은 지표만으로는 ADS가 마주칠 수많은 상황을 안전하게 다룬다는 충분한 증거가 되지 않고, 실도로 시험만으로 검증하면 수십억 km를 달려야 할 수 있으며, 시스템을 바꾼 뒤 그 시험을 되풀이할 수 없다는 것을 든다. 이 지침은 ADS 검증에 시나리오 카탈로그와 다섯 검증 방법(pillar)을 함께 쓰는 multi-pillar 접근을 권한다. 다섯 방법은 시뮬레이션·가상 테스트, 시험로 시험, 실도로 시험, 감사·평가, 운행 중 모니터링·보고다. 시나리오 카탈로그는 각 방법이 ADS의 안전을 체계적으로 검증하는 데 쓰는 도구이고, 운행 중 모니터링으로 모은 데이터는 카탈로그에 새 시나리오를 더하는 데도 쓸 수 있다.[@unece-wp29-2023-44-rev1-2023]

![[diagrams/natm-multi-pillar-approach.svg]]

## 추상화 수준

**functional scenario**는 대개 구체적인 물리 값 없이 개념 수준에서 자연어로 쓴 시나리오, **abstract scenario**는 functional scenario에서 끌어낸 형식화된 선언적 기술, **logical scenario**는 일부 파라미터 값을 범위로 둔 시나리오, **concrete scenario**는 물리 속성을 명시적 파라미터 값으로 그린 시나리오다.[@unece-wp29-2023-44-rev1-2023][@iso-34501-obp-2022]

UNECE의 NATM 지침에 따르면 일부 업계와 연구가 셋이나 넷의 추상화 수준을 제안하며, 이 수준들은 한 수준에서 다른 수준으로 가는 특정 구현이나 변환 흐름을 뜻하거나 강제하지 않는다. concrete scenario는 요소마다 값을 정해 만들어 특정 테스트 시나리오를 재현할 수 있게 하고, 연속 범위를 가진 logical scenario 하나에서 concrete scenario를 얼마든지 만들 수 있다.[@unece-wp29-2023-44-rev1-2023]

ISO 34501:2022는 정의의 주석에서 추상화 수준을 위에서 아래로 functional, abstract, logical, concrete scenario 순으로 두고, 아래로 갈수록 시나리오의 수가 늘어나는 경향이 있다고 제시한다. 이 표준은 같은 주석들에서 logical scenario의 파라미터 범위를 정규 분포 같은 확률 분포로도 나타낼 수 있고, concrete scenario를 만드는 한 방법이 logical scenario의 파라미터 공간에서 명시적 파라미터 묶음을 고르는 것이며, 파라미터 값은 기본값, 무작위로 고른 값, 공학적 판단으로 고른 값으로 이뤄진다고 제시한다.[@iso-34501-obp-2022]

![[diagrams/scenario-abstraction-levels.svg]]

## 시나리오의 구성

이 표준은 시나리오에서 관심 있는 요소를 **entity**로 정의하고, 이를 시나리오 동안 상태가 바뀌지 않는 **static entity**와 바뀌는 **dynamic entity**로 나눈다. 같은 entity도 시나리오에 따라 static이거나 dynamic일 수 있다. 나무는 대개 static entity지만, 갑자기 쓰러지는 나무에 ADS가 어떻게 대응하는지 시험하는 시나리오에서는 dynamic entity다. 시나리오 동안 바뀌지 않는 주변 환경은 **scenery**, 시나리오에서 행동하고 반응할 수 있는 entity는 **actor**, actor가 시나리오에서 하는 행동은 **action**이다. **Event**는 시나리오 안에서 entity의 의미 있는 상태 변화이고, **trigger**는 action을 시작하거나 끝내는 event다. **Scene**은 ADS나 시험 대상 차량, scenery, 동적 환경, 모든 actor를 포함한 entity들과 그 관계의 스냅숏이며, actor의 관점에서 본 scene이 **situation**이다. **Tag**는 분류를 위해 시나리오에 붙이는 라벨이고, **scenario category**는 하나 이상의 특성을 공유하는 시나리오의 집합이다.[@iso-34501-obp-2022]

![[diagrams/scenario-scenes-actions.svg]]

## 테스트 시나리오와 테스트 케이스

이 표준은 정의의 주석에서 테스트 시나리오가 시나리오 내용에 더해 ADS의 성능이나 거동을 평가하려는 항목을 담는 것을 허용하고, 그런 항목의 예로 이벤트 샘플링, SUT(system under test)의 오류 검사 표시, 관련 ODD 데이터, 성공 기준을 든다.[@iso-34501-obp-2022]

ISO 34505:2025는 테스트 케이스를 특정 테스트 목표를 위해 만든 테스트 입력(자극), 단계, 플랫폼, 기대 결과(pass/fail 기준)의 집합으로 정의하고, 정의의 주석에서 테스트 시나리오를 얼마나 자세히 정의하느냐에 따라 테스트 케이스가 테스트 시나리오와 같거나 그 상위 집합일 수 있다고 제시한다.[@iso-34505-obp-2025]

## 시나리오 분류

ISO 34504:2024의 Introduction은 tag를 시나리오마다 정보를 더하는 meta-attribute로 두고, 같은 tag를 공유하는 시나리오가 한 scenario category에 든다고 제시한다.[@iso-34504-obp-2024]

## 시나리오 고르기

UNECE의 NATM 지침(ECE/TRANS/WP.29/2023/44/Rev.1)은 시나리오 기반 검증이 관련·nominal·failure·critical·complex 시나리오를 충분히 덮기를 권한다. 시험할 시나리오는 ADS가 설계된 ODD의 조건을 정확히 반영하기를 권하며, 고속도로에서만 쓰는 ADS 기능에는 교차로 회전 시나리오를 쓰지 않는 것을 예로 든다. 다른 도로 사용자의 행동 때문에 충돌을 피할 수 없을 수도 있으므로, ADS가 막을 수 있다고 본 시나리오에 한정하지 말고 그 ODD에서 합리적으로 예견할 수 있는 다른 도로 사용자의 위험한 행동(역주행, 신호 없는 급한 차로 변경, 과속)도 검증에 넣기를 권한다. 시나리오를 찾는 방법으로는 자연 주행 데이터를 포함한 사람 운전자의 행동 분석, 사고 데이터베이스 분석, 특정 ODD의 교통 패턴 분석, ADS 센서 데이터 분석, ADS 개발 중 얻은 지식과 경험, 핵심 파라미터를 바꿔 합성한 시나리오, [[functional-safety|기능 안전]]과 [[sotif|SOTIF]] 요구사항에서 공학적으로 끌어낸 시나리오 등을 든다.[@unece-wp29-2023-44-rev1-2023]

## Critical scenario와 리스크 요인

ISO 34502:2022는 **critical scenario**를 리스크 요인을 하나 이상 담은 시나리오로, **리스크 요인**(risk factor)을 있으면 해의 확률이나 심각도, 또는 둘 다를 높이는 시나리오의 요인이나 조건으로 정의한다.[@iso-34502-obp-2022] UNECE의 NATM 지침(ECE/TRANS/WP.29/2023/44/Rev.1)은 Annex I의 용어집에서 critical scenario를 ADS가 잠재적 충돌을 피하거나 줄이려고, 또는 시스템 failure에 대응하려고 비상 기동을 해야 하는 상황을 담은 교통 시나리오로 정의한다.[@unece-wp29-2023-44-rev1-2023]

## SOTIF와의 관계

ISO 34501:2022는 정의의 주석에서 scenario, scene, event의 정의가 [[iso-21448|ISO 21448]]의 정의를 편집상 다시 쓴 것이고 뜻은 같다고 제시하고, action의 정의는 ISO 21448의 개념을 시간 폭으로 넓힌 것이라 제시한다.[@iso-34501-obp-2022] Triggering condition은 [[sotif#Triggering condition|SOTIF]]에서 다룬다.

## NATM

UNECE의 NATM 지침은 VMAD(자율주행 검증 방법을 다루는 비공식 작업반)가 만든 ADS 안전 검증 지침이다.[@unece-wp29-2023-44-rev1-2023] WP.29(UNECE 산하의 국제 차량 규정 포럼)는 2023년 6월 190차 회의에서, GRVA(WP.29 산하의 자율·커넥티드 차량 작업반)가 낸 NATM 지침 개정판(ECE/TRANS/WP.29/2023/44/Rev.1)을 채택했다.[@unece-wp29-2023-44-rev1-2023][@unece-wp29-1173-2023][@unece-wp29-introduction-2025][@unece-grva-introduction-2024]

## ISO 표준

ISO 34501\~34505는 'Road vehicles — Test scenarios for automated driving systems'라는 공통 제목 아래 번호와 판을 따로 받아 나오는 ISO 표준이고, ISO/TC 22/SC 33이 맡는다.[@iso-34501-2022][@iso-34502-2022][@iso-34503-2023][@iso-34504-2024][@iso-34505-2025]

- ISO 34501:2022: 용어. 2022년 10월에 1판이 나왔다.[@iso-34501-2022]
- ISO 34502:2022: 시나리오 기반 안전 평가 틀. 2022년 11월에 1판이 나왔다.[@iso-34502-2022]
- ISO 34503:2023: ODD의 명세. 2023년 8월에 1판이 나왔다.[@iso-34503-2023]
- ISO 34504:2024: 시나리오 분류. 2024년 2월에 1판이 나왔다.[@iso-34504-2024]
- ISO 34505:2025: 시나리오 평가와 테스트 케이스 생성. 2025년 6월에 1판이 나왔다.[@iso-34505-2025]

ISO 34501:2022는 ADS 테스트 시나리오의 용어를 정의하고, ISO/SAE PAS 22736이 정의한 운전 자동화 레벨 3 이상의 ADS에 적용한다. 이 표준의 Introduction은 시나리오를 기술하는 말을 표준화할 필요가 ADS의 설계, 테스트, 평가, 관리를 하는 정부와 산업계의 요구에서 나왔다고 제시하고, 이 문서의 용어는 시나리오 기술의 맥락에서 정의돼 ISO 21448이나 [[iso-26262|ISO 26262]]-1의 용어와 같지 않을 수 있다고 제시한다.[@iso-34501-obp-2022]

ISO 34502:2022는 ADS의 시나리오 기반 안전 평가 틀에 대한 지침을 준다. ISO/SAE PAS 22736이 정의한 ADS와 UNECE가 공통 정의한 차량 범주 1·2에 적용하며, limited access highway를 대상으로 한다. 오용, human machine interface, [[cybersecurity|사이버보안]]에 관한 안전 쟁점과, 안락·에너지 효율·교통 흐름 효율 같은 안전 밖 쟁점은 다루지 않는다. 3절에서는 critical scenario와 리스크 요인에 더해 **hazardous scenario**(ADS 밖의 개체가 막지 않으면 해가 생기는 시나리오)와 **safety test objective**(테스트 묶음으로 보일 ADS의 안전 속성)를 정의한다. 4절(Test scenario-based safety evaluation process)은 개발 프로세스에의 통합, safety test objective, 관련 시나리오 공간의 명세, 리스크 요인에 따른 critical scenario 도출, 시나리오 공간을 덮는 테스트 시나리오 도출, concrete 테스트 시나리오의 도출과 할당, 테스트 실행, 안전 평가를 하위 절로 둔다.[@iso-34502-obp-2022]

Introduction은 이 표준이 SOTIF에 부합하며, 의도된 기능에 영향을 주는 리스크 요인과 critical scenario를 찾는 시나리오 기반 안전 평가 프로세스를 넣어 ISO 21448에 구체성을 더한다고 제시한다. 이 표준은 ISO 34501, ISO 21448, ISO 26262-3을 규범 참조로 두고, 정의의 주석에서 safety test objective를 ISO 21448의 [[sotif#Acceptance criterion과 validation target|validation target]]이나 acceptance criterion에서 끌어낼 수 있다고 제시한다.[@iso-34502-obp-2022]

ISO 34504:2024는 시나리오에 대한 정보를 담은 tag로 시나리오를 분류하는 접근을 정하고, [[sae-j3016|SAE J3016]]의 레벨 3\~5 ADS에 적용한다. Introduction의 NOTE는 이 문서가 시나리오의 계층 구조는 주지 않는다고 제시한다.[@iso-34504-obp-2024]

ISO 34505:2025는 시나리오를 평가하는 방법론과, 테스트 시나리오를 테스트 케이스로 넓히는 절차를 정한다. 레벨 3 이상 ADS에 적용하며, 기능 안전과 SOTIF를 평가하려고 시험할 시나리오가 초점이다. 흐름은 시나리오 평가의 입력과 테스트 목표(5절), 시험 전 시나리오 평가와 테스트 케이스 생성·최적화(6절), 시험 중 초기화와 모니터링(7절), 시험 뒤 처음 명세한 테스트 케이스와 실행 결과로 나온 테스트 케이스의 비교(8절)로 이어진다. 시나리오 평가 기준으로는 **scenario exposure**(시나리오가 일어날 확률을 반영하는 측정 기준), **scenario complexity**(시나리오 파라미터 조합의 수를 늘리는 차원 요인을 반영하는 측정 기준), **prospective scenario criticality**(시나리오에 든 리스크 요인의 수와 가중을 반영하는 측정 기준)를 정의한다. 이 표준은 ISO 21448:2022, ISO 26262-3:2018, ISO 26262-8:2018과 ISO 34501\~34504를 규범 참조로 둔다.[@iso-34505-obp-2025]
