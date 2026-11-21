---
title: 운전 자동화 레벨
tags:
  - applications/adas
aliases:
  - Automated Driving System
verified: 2026-11-20
---

**운전 자동화 레벨**(levels of driving automation)은 운전 자동화 기능을 사람 사용자와 운전 자동화 시스템 같은 운전의 주체가 맡는 역할에 따라 레벨 0부터 레벨 5까지로 나눈 분류다.[@sae-j3016-2026] 레벨은 서로 겹치지 않는다. 레벨이 오를수록 횡·종 방향 제어, 객체·사건의 감지와 대응, DDT(Dynamic Driving Task) fallback이 차례로 시스템의 몫이 된다.[@iso-21448-obp-2022] 레벨 3\~5에서는 ADS(Automated Driving System)가 DDT 전체를 수행한다.[@sae-j3016-2026][@iso-sae-pas-22736-obp-2021]

## 레벨

[[iso-21448|ISO 21448]]:2022는 표 2에서 레벨마다 이름과 함께 횡·종 방향 제어, OEDR(Object and Event Detection and Response), DDT fallback을 누가 맡는지와 [[operational-design-domain|ODD]]가 어떤지를 아래처럼 제시한다.[@iso-21448-obp-2022]

| 레벨 | 이름                           | 횡·종 방향 제어 | OEDR   | DDT fallback        | ODD       |
| ---- | ------------------------------ | --------------- | ------ | ------------------- | --------- |
| 0    | No driving automation          | 운전자          | 운전자 | 운전자              | 해당 없음 |
| 1    | Driver assistance              | 운전자와 시스템 | 운전자 | 운전자              | 제한      |
| 2    | Partial driving automation     | 시스템          | 운전자 | 운전자              | 제한      |
| 3    | Conditional driving automation | 시스템          | 시스템 | fallback-ready user | 제한      |
| 4    | High driving automation        | 시스템          | 시스템 | 시스템              | 제한      |
| 5    | Full driving automation        | 시스템          | 시스템 | 시스템              | 제한 없음 |

[[sae-j3016#개정 이력|ISO/SAE PAS 22736]]:2021은 레벨 1·2가 자동화하는 OEDR을 그 레벨이 맡는 차량 운동 제어 축에 딸린 제한된 OEDR로 두고, 레벨 3\~5는 횡·종 방향 제어와 완전한 OEDR을 모두 자동화하도록 둔다. 레벨 1과 레벨 2의 운전 자동화 시스템 기능을 묶어 **운전자 지원 기능**(driver support feature)이라 하고, 정의의 주석에서 이 기능은 DDT의 일부만 수행하므로 운전자가 나머지를 수행하고 기능을 감독해야 한다고 제시한다.[@iso-sae-pas-22736-obp-2021]

이 PAS는 사용자 감시(monitor the user)가 운전 자동화 시스템의 오용이나 남용(안주에서 오는 과신 포함)에 대한 대응책으로 쓰일 가능성이 가장 크고 주로 레벨 2·3에서 쓸모 있다고 제시한다. 레벨 1 기능에서는 현장에서 오용이나 남용이 두드러지게 나타나지 않았고, 그보다 높은 레벨에서는 ADS가 정의상 스스로 minimal risk condition에 이를 수 있다는 것을 그 까닭으로 든다.[@iso-sae-pas-22736-obp-2021]

## 쓰는 곳

적용 대상을 운전 자동화 레벨로 정하는 문서는 다음과 같다.

| 문서                                                                                                                             | 대상                                                                                                                                       | 다루는 페이지                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| ISO 21448:2022                                                                                                                   | 상황 인식이 안전에 꼭 필요하고 그 인식을 복잡한 센서와 처리 알고리즘에서 얻는 의도된 기능, 특히 긴급 개입 시스템과 레벨 1\~5 시스템의 기능 | ISO 21448[@iso-21448-obp-2022]                                                                                      |
| ISO 34501:2022                                                                                                                   | ISO/SAE PAS 22736이 정의한 레벨 3 이상의 ADS                                                                                               | [[ads-scenario-based-testing\|ADS 시나리오 기반 테스트]][@iso-34501-obp-2022]                                       |
| ISO 34503:2023                                                                                                                   | 주로 레벨 3·4 ADS                                                                                                                          | ODD[@iso-34503-obp-2023]                                                                                            |
| ISO 34504:2024                                                                                                                   | [[sae-j3016\|SAE J3016]]의 레벨 3\~5 ADS                                                                                                   | ADS 시나리오 기반 테스트[@iso-34504-obp-2024]                                                                       |
| ISO/TS 5083:2025                                                                                                                 | ISO/SAE PAS 22736이 정의한 레벨 3·4 ADS feature                                                                                            | [[iso-ts-5083\|ISO/TS 5083]][@iso-ts-5083-obp-2025]                                                                 |
| WP.29(UNECE 산하의 국제 차량 규정 포럼)의 자동·자율 차량 기본 문서(ECE/TRANS/WP.29/2019/34/Rev.2와 그 뒤 Table 1을 고친 개정 셋) | 레벨 3 이상 자동·자율 차량. 그 안전·보안 핵심 원칙을 밝혀 WP.29 산하 작업반에 지침을 준다                                                  | 없음[@unece-wp29-2019-34-rev2-2019][@unece-wp29-2024-33-2023][@unece-wp29-1177-2024][@unece-wp29-introduction-2025] |

## 분류 밖의 시스템

ISO/SAE PAS 22736:2021은 ESC(electronic stability control)·AEB(automatic emergency braking) 같은 능동 안전 시스템과 LKA(lane keeping assistance) 같은 일부 운전자 보조 시스템을 이 분류 체계에서 뺀다. 이들은 DDT를 지속적으로 수행하지 않고 위험할 수 있는 상황에 순간적으로 개입할 뿐이라, 운전자의 역할을 바꾸지 않기 때문이다. 이 PAS는 또 ABS·ESC·AEB처럼 순간적으로만 개입하고 DDT의 어느 부분도 지속적으로 수행하지 않는 시스템과, 외부 사건에 반응하지 않는 일반 크루즈 컨트롤은 레벨 0 말고는 분류되지 않는다고 제시한다.[@iso-sae-pas-22736-obp-2021]

## ADS

이 PAS는 **ADS**를 ODD로 제한되든 아니든 DDT 전체를 지속적으로 수행할 수 있는 하드웨어와 소프트웨어의 묶음으로 정의하고, 이 말을 레벨 3·4·5의 운전 자동화 시스템에만 쓴다. 레벨 1\~5의 시스템을 두루 가리키는 말은 **운전 자동화 시스템**(driving automation system)이다. 이 PAS는 ADS 기능의 예로, 완전 출입 통제 고속도로의 정체 구간에서 DDT 전체를 맡되 ODD를 벗어나면 사람이 운전해야 하는 레벨 3 기능, 여정 도중 사용자가 차를 근처의 지정된 주차 시설로 무인 운행으로 보내는 레벨 4 자동 주차 기능, 지정된 구역 안의 고객에게 차량 호출 서비스를 하려고 무인 운행으로 보내지는 레벨 4 ADS 전용 차량인 ADS-DV(automated driving system-dedicated vehicle)를 든다.[@iso-sae-pas-22736-obp-2021]

![[diagrams/driving-automation-system-level-ranges.svg]]

**DDT**는 경로·목적지 선택 같은 전략 기능을 뺀, 도로 교통에서 차량을 운행하는 데 필요한 실시간 운영·전술 기능 전체다. 조향에 의한 횡 방향 제어, 가감속에 의한 종 방향 제어, 객체·사건의 감지·인식·분류와 대응 준비(주행 환경 감시), 객체·사건에 대한 대응 실행, 기동 계획, 조명·경적·신호·손짓으로 눈에 띄게 하기가 든다. 주행 환경 감시와 대응 실행을 묶어 **OEDR**이라 부른다.[@iso-sae-pas-22736-obp-2021]

이 PAS는 **DDT fallback**을, DDT 수행에 관련된 시스템 failure가 생긴 뒤나 ODD를 벗어날 때(ODD exit) 사용자가 DDT를 이어 수행하거나 minimal risk condition에 이르는 응답, 또는 같은 상황에서 ADS가 minimal risk condition에 이르는 응답으로 정의한다. **Fallback-ready user**는 레벨 3 ADS 기능이 작동 중인 차량의 사용자로, 차량을 운전할 자격과 능력을 갖추고 ADS의 개입 요청과 차량의 명백한 DDT 관련 시스템 failure에 반응할 수 있어 DDT fallback을 수행하게 되는 사람이다. 정의의 주석에서는 DDT와 DDT fallback이 따로 된 기능이라, 레벨 3 ADS는 fallback이 필요한 모든 상황에서 fallback을 수행하지는 못할 수 있어 필요할 때 fallback-ready user에게 개입 요청을 보내고, 개입 요청 뒤 적어도 몇 초 동안 DDT를 이어 갈 수 있다고 제시한다. 레벨 4·5 ADS는 DDT fallback을 수행해 minimal risk condition에 이를 수 있어야 한다고도 제시한다.[@iso-sae-pas-22736-obp-2021]

![[diagrams/ddt-fallback-by-level.svg]]

이 PAS는 **minimal risk condition**을, 여정을 이어 갈 수 없거나 이어 가지 말아야 할 때 충돌 위험을 줄이려고 사용자나 ADS가 DDT fallback 뒤 차량을 데려가는 안정된 정지 상태로 정의한다. 레벨 4 ADS가 연산 모듈 하나의 failure 때 중복 연산 모듈을 써서 DDT fallback으로 넘어가 minimal risk condition에 이르는 것과, 주 전원 계통의 failure 때 예비 전원으로 minimal risk condition에 이르는 것을 예로 든다.[@iso-sae-pas-22736-obp-2021]

**Failure mitigation strategy**는 레벨 3 ADS 기능의 fallback-ready user가 개입 요청을 받고도 오래 fallback을 하지 않을 때나, ADS가 차량 운동을 더는 제어하지 못할 만큼 큰 시스템 failure나 외부 사건이 일어났을 때 차량을 달리던 경로 위에서 자동으로 멈춰 세우는 차량 기능이고, ADS 기능이 아니다.[@iso-sae-pas-22736-obp-2021]

이 PAS는 차량을, 모든 여정에서 적어도 일부 구간을 차내 운전자가 운전하도록 설계된 **conventional vehicle**, 정해진 ODD 안의 완전한 여정을 무인 운행이나 차내 운전자의 운전 가운데 골라 할 수 있는 **dual-mode vehicle**, 정해진 ODD 안의 모든 여정을 평상시 무인 운행하도록 설계된 ADS-DV로 나눈다. 또 원격의 사람이 ADS가 다루지 못하는 상황에서 무인 운행 중인 차량에 정보나 조언을 주는 **remote assistance**와, 원격 운전자가 DDT나 DDT fallback의 일부나 전부를 실시간으로 수행하는 **remote driving**을 구별하고, 정의의 주석에서 remote driving은 운전 자동화가 아니라고 제시한다.[@iso-sae-pas-22736-obp-2021]

ISO 34503:2023은 minimal risk condition(MRC)에 이르려고 ADS가 일으켜 실행하는 전술적이거나 운영적인 기동을 **minimal risk manoeuvre**(MRM)로 정의한다.[@iso-34503-obp-2023] ISO 21448:2022의 MRC 정의와 [[iso-26262|ISO 26262]]의 안전 상태와의 대응은 [[safety-mechanism#안전 상태와 성능 저하|안전 메커니즘]]에서 다룬다.
