---
title: ODD
tags:
  - applications/adas
aliases:
  - ISO 34503
verified: 2026-11-20
---

**ODD**(Operational Design Domain)는 운전 자동화 시스템이나 그 기능이 작동하도록 특별히 설계된 운행 조건이다. 환경·지리·시간대의 제약과, 특정 교통·도로 특성이 있어야 하거나 없어야 한다는 조건이 들어간다.[@iso-sae-pas-22736-obp-2021][@unece-wp29-2023-44-rev1-2023] ISO 34503:2023은 ODD를 정의하는 것을 [[levels-of-driving-automation|ADS]]가 무엇을 할 수 있는지 정하는 첫 단계로 제시한다.[@iso-34503-obp-2023] ODD를 벗어나는 것(ODD exit)은 [[levels-of-driving-automation#ADS|DDT]](Dynamic Driving Task) 수행에 관련된 시스템 failure와 더불어 [[levels-of-driving-automation#ADS|DDT fallback]]을 부르는 두 경우 가운데 하나다.[@iso-sae-pas-22736-obp-2021]

## 쓰는 곳

ISO 34503:2023의 Introduction은 ODD 정의가 안전한 운용에 더해 법규 적합에도 중요하다고 제시한다. 이 표준이 정하는 ODD의 분류 체계와 정의 형식이 ADS 제조사가 설계에서 최소한의 안전 요구사항을 명세하고 구현하고 알리게 하고, [[ads-scenario-based-testing|시나리오 기반 검증]]에서는 시나리오를 효율적으로 만들고 파라미터로 나타내게 한다고도 제시한다.[@iso-34503-obp-2023]

WP.29(UNECE 산하의 국제 차량 규정 포럼)의 자동·자율 차량 기본 문서(ECE/TRANS/WP.29/2019/34/Rev.2와 그 뒤 Table 1을 고친 개정 셋)는 차량의 안전을 평가할 수 있게 제조사가 차량의 ODD와 그 안에서의 기능을 문서로 남기기를 권하고, 거기에 최소한 도로 종류, 지리적 영역, 속도 범위, 날씨와 주야를 포함한 환경 조건, 그 밖의 제약을 담기를 권한다. 차량이 자기 failure나 ODD의 조건이 더는 충족되지 않음을 감지하고, 그때 minimum risk manoeuvre로 [[levels-of-driving-automation#ADS|minimal risk condition]]에 자동으로 옮겨 갈 수 있기를 권한다.[@unece-wp29-2019-34-rev2-2019][@unece-wp29-2024-33-2023][@unece-wp29-1177-2024][@unece-wp29-introduction-2025]

## 동작

ISO/SAE PAS 22736:2021은 운전 자동화 레벨 3·4의 ADS 기능이 자기 ODD 안에서만 작동하도록 설계되지만, 날씨가 나빠지거나 차선이 가려지는 것처럼 운행 중에 빠르게 바뀌는 조건이 반드시 ODD exit인 것은 아니라고 제시한다. 그런 변화가 fallback을 요구하는지는 ADS가 판단한다. 이 PAS는 DDT fallback을 수행하는 동안에는 ADS가 잠시 ODD 밖에서 작동할 수 있다고 제시한다.[@iso-sae-pas-22736-obp-2021]

ODD는 기능마다 정해진다. 이 PAS에서 운전 자동화 기능은 해당하는 ODD가 있으면 그 안에서 특정 레벨로 동작하는 설계 고유의 기능이고, 한 운전 자동화 시스템이 저마다 특정 레벨과 ODD에 묶인 기능을 여럿 가질 수 있다. 이 PAS는 맑은 날 완전 출입 통제 고속도로에서 운전자에게 종 방향 제어를 지원하도록 설계된 레벨 1 ACC(adaptive cruise control), 정해진 군 기지 안에서 낮에만 시속 25마일 이하로 다니도록 설계된 ADS 전용 차량, 지정된 항만과 정해진 경로에서 낮에만 다니도록 ODD를 제한한 ADS 화물차를 ODD의 예로 든다.[@iso-sae-pas-22736-obp-2021]

## 분류 체계

ISO 34503:2023은 ODD를 정의하는 운행 조건의 계층적 분류 체계와, 그 분류 체계로 ODD를 적는 정의 형식에 대한 요구사항을 정하고, 주로 레벨 3·4 ADS에 적용한다. 이 표준의 ODD는 ADS가 작동하도록 설계된, 정적·동적 속성을 포함한 특정 조건으로 이뤄진다. 레벨 5 ADS의 ODD는 제한이 없어 어디서나 운행할 수 있다. 이 표준은 **scenery element**(ADS를 단 차량의 운행 환경에서 움직이지 않는 요소로, 신호등이나 가동교처럼 상태가 바뀌는 것도 든다), **environmental condition**(날씨와 그 밖의 대기 조건, scenery element로 정의되지 않은 그 밖의 환경 조건, 정보 통신 연결), **dynamic element**(DDT의 시간 범위 안에서 ODD 안을 움직이는 객체나 행위자)를 정의한다. ODD 속성의 기본 테스트 절차와 감시 요구사항은 다루지 않는다.[@iso-34503-obp-2023]

이 표준은 ODD와 함께 운행 조건의 집합인 **OD**(operational domain), ADS가 배치돼 작동하리라 기대되는 곳의 조건인 **TOD**(target operational domain), 지금 ADS 바로 주변에 있는 조건인 **COD**(current operational domain)도 정의한다. ODD가 ADS가 작동하도록 설계된 조건이라면 TOD는 ADS를 배치할 곳이라, TOD에는 ADS의 ODD 밖 조건이 있을 수 있다.[@iso-34503-obp-2023]

## 표준마다 다른 정의

[[iso-21448|ISO 21448]]:2022는 ODD를 운전 자동화 시스템이 작동하도록 설계된 특정 조건으로 정의하고, 정의의 주석에서 '설계된'이 이 문서에서는 '명세된'을 뜻하며, 조건은 공간·시간·내재·환경 조건일 수 있고 차량 속도, 연산 능력, 인지 센서 능력 같은 ADS 자체의 조건도 ODD에 든다고 제시한다.[@iso-21448-obp-2022] ISO 34501:2022는 ISO/SAE PAS 22736의 정의를 고쳐 가져오되, 정의의 주석에서 이 문서의 ODD는 차량 외부 환경 조건만 가리키고, 차량 상태와 운전자·탑승자 조건까지 묶은 전체 조건은 operational design condition 같은 다른 용어로 부를 수 있다고 제시한다.[@iso-34501-obp-2022]
