---
title: X-in-the-loop
tags:
  - sw-engineering/sw-testing
aliases:
  - XiL
  - HIL
verified: 2026-10-03
---

MiL(model-in-the-loop), SiL(software-in-the-loop), HiL(hardware-in-the-loop) 같은 in-the-loop 테스트 환경을 묶어 **X-in-the-loop**(XiL)이라 부르고, X는 구체적인 테스트 환경의 이름이 들어갈 자리다. in-the-loop은 closed loop 방식의 자극을 달리 부르는 이름이다. 환경 모델이 테스트 대상의 출력을 받아 바로 또는 다른 요소를 거쳐 입력으로 되돌리므로, 테스트 환경 안에 제어 루프가 생긴다.[@istqb-ct-aut-syllabus-2025]

![[diagrams/xil-closed-loop.svg]]

ISTQB 용어집은 **테스트 환경**(test environment)을 테스트를 수행하는 데 필요한 하드웨어, 계측 장비, 시뮬레이터, 소프트웨어 도구, 그 밖의 지원 요소를 담은 환경으로 정의한다.[@istqb-glossary-test-environment-2026] ISTQB 용어집은 **환경 모델**(environment model)을 실시간 시뮬레이션에서 다른 컴포넌트, 프로세스, 환경 조건을 포함해 컴포넌트나 시스템의 실제 환경을 추상화한 것으로 정의한다.[@istqb-glossary-environment-model-2026]

## Closed loop와 open loop

제어 시스템은 closed loop와 open loop로 나뉜다. 둘은 제어 장치가 환경에 반응하는 방식이 달라서, 가상 테스트 환경에 필요한 시뮬레이션도 다르다. closed loop는 주로 제어기를 시험하는 데 쓰이며, 엔진과 변속 제어, ABS(anti-lock braking system)나 VDC(vehicle dynamics control) 같은 운전자 보조 시스템처럼 복잡한 기능을 시험할 수 있다. open loop에서는 시스템의 출력이 입력과 관계가 없어 되먹임 루프가 없고, 테스터가 테스트 절차에서 테스트 대상의 입력을 바로 정한다. ISTQB CT-AuT v2.1.1 강의계획서에 따르면 테스트 대상이 반응형으로 동작하거나 상태 기계를 따르면 open loop가 낫고, 실내와 섀시 전장의 조명, 스위치가 그 예다.[@istqb-ct-aut-syllabus-2025]

![[diagrams/xil-open-loop.svg]]

## 환경의 종류

자동차 업계에서 쓰는 XiL로는 MiL, SiL, PiL(processor-in-the-loop), HiL, ViL(vehicle-in-the-loop)이 있다. ISTQB CT-AuT v2.1.1 강의계획서는 이 가운데 PiL과 ViL을 본문에서 다루지 않는다.[@istqb-ct-aut-syllabus-2025]

dSPACE에 따르면 ViL 테스트는 디지털 검증에 실제 세계의 동역학을 더해 HiL 구성을 넓힌 것으로, 주행 환경과 시나리오를 실시간으로 시뮬레이션하고 운전자 보조에 관련된 센서를 자극해 완성차의 운전자 보조·자율 주행 시스템을 시험한다. 운전자 보조 시스템의 ViL 테스트는 루프 안의 하드웨어가 차량 전체인, 운전자 보조 시스템 HiL 테스트의 특수한 경우다.[@dspace-hil-testing-2026]

### MiL

ISTQB 용어집은 **MiL**을 시스템의 시뮬레이션 모델을 시험하는 가상 테스트 환경으로 정의한다.[@istqb-glossary-model-in-the-loop-2026] MiL의 테스트 대상은 특정 하드웨어용으로 컴파일하지 않은 실행 가능한 모델이고, 이 모델을 환경 모델에 이어 closed loop로 돌린다. 테스트 환경은 대개 모델과 같은 개발 환경에 꾸리고, 실행에는 컴퓨터와 환경 모델을 담은 시뮬레이션 소프트웨어가 필요하다. MiL에서는 모든 구성 요소가 모델이므로 테스트가 실시간이 아니라 시뮬레이션 시간으로 돌고, 테스터는 언제든 시뮬레이션을 멈추고 자세히 분석할 수 있다.[@istqb-ct-aut-syllabus-2025]

### SiL

ISTQB 용어집은 **SiL**을 실제 소프트웨어를 시험하는 가상 테스트 환경으로 정의한다. SiL은 안전 무결성 등급인 [[safety-integrity-level|SIL]]과 다른 용어다.[@istqb-glossary-software-in-the-loop-2026][@istqb-glossary-safety-integrity-level-2026] SiL에서는 소스 코드를 특정 컴퓨터 아키텍처용으로 컴파일하고, 래퍼(wrapper)로 신호에 접근하게 해 환경 모델에 잇는다. 실행에는 특수 하드웨어가 필요 없다. SiL의 테스트도 MiL처럼 시뮬레이션 시간으로 돌아, 계산 방식과 환경 모델의 복잡도에 따라 실시간보다 짧거나 길 수 있고 언제든 멈출 수 있다. SiL에서는 기능 적합성 테스트, 인터페이스 테스트, [[regression-testing|회귀 테스트]]가 흔하고, 대상 하드웨어의 영향을 주로 받는 성능 효율 테스트와 신뢰성 테스트는 드물다.[@istqb-ct-aut-syllabus-2025]

MathWorks의 Embedded Coder로 돌리는 software-in-the-loop 시뮬레이션은 모델에서 생성한 코드나 기존 코드를 개발용 컴퓨터용으로 컴파일해 그 컴퓨터에서 실행한다.[@mathworks-ecoder-sil-pil-2026]

### PiL

Embedded Coder의 processor-in-the-loop 시뮬레이션은 개발용 컴퓨터에서 코드를 교차 컴파일하고, 오브젝트 코드를 대상 프로세서나 그에 맞먹는 명령어 집합 시뮬레이터에 내려받아 실행한다. 모델에서 코드로 만들지 않은 부분은 같은 회사의 모델 시뮬레이션 환경인 Simulink에 남아 테스트 벡터를 주고, 알고리즘이 놓인 환경을 나타낼 수 있다.[@mathworks-ecoder-sil-pil-2026]

### HiL

ISTQB 용어집은 **HiL**을 소프트웨어가 통합된 실제 하드웨어를 시험하는 가상 테스트 환경으로 정의한다.[@istqb-glossary-hardware-in-the-loop-2026] HiL은 테스트 대상이 시제품으로 나왔거나 개발이 끝났을 때 쓰며, 시제품이나 완성된 [[electronic-control-unit|ECU]]를 시험한다. 환경 모델은 실시간 처리가 되는 컴퓨터에서 돈다. 소프트웨어가 실제 하드웨어에서 돌기 때문에 HiL의 시뮬레이션은 늘 실시간으로 흐르고, 잠시 멈추거나 세울 수 없다. 그래서 환경 모델을 돌리는 컴퓨터는 관련 신호를 모두 정해진 시간 안에 모으고 내준다.[@istqb-ct-aut-syllabus-2025] dSPACE SCALEXIO는 HiL 테스트에서 ECU의 환경을 시뮬레이션하는 실시간 플랫폼으로, 큰 시뮬레이션 모델도 실시간으로 계산한다.[@dspace-scalexio-2026]

## HiL의 구성

HiL 테스트 환경의 전형적인 구성은 다음과 같다.[@istqb-ct-aut-syllabus-2025]

- 전원 공급 장치
- 환경 모델을 돌리는 실시간 처리 컴퓨터
- 환경 모델에 넣지 않은 실제 부품
- 신호의 종류와 진폭을 다루는 신호 처리 장치
- 단선과 단락을 흉내 내는 FIU(fault insertion unit)
- 배선 하니스에 접근점을 더하는 브레이크아웃 박스
- 없는 버스 참여자를 흉내 내는 나머지 버스(restbus) 시뮬레이션[@istqb-ct-aut-syllabus-2025]

dSPACE에 따르면 HiL 테스트는 실제 ECU를 현실처럼 시뮬레이션한 환경에서 시험하는 것이다. HiL 테스트 시스템은 시뮬레이션 하드웨어와 소프트웨어로 이루어지고, 여기에 시험할 ECU를 하나 이상 잇고, 쓰임에 따라 조향이나 브레이크 같은 실제 부품을 더한다. HiL 테스트 벤치에서는 위험한 corner case를 시험해도 시험 대상이나 주변에 안전 문제가 생기지 않는다.[@dspace-hil-testing-2026]

## 개발 단계와의 대응

테스트 환경을 개발 단계에 맞춰 고르면 ECU가 다 만들어지기 전에 시험할 수 있다. 단락, 단선, 네트워크 통신 과부하처럼 실제 차량에서 재현하기 어려운 상황도 흉내 낼 수 있다. MiL은 개발 초기, 곧 [[v-model|V 모델]]의 왼쪽에서 모델의 기능 적합성을 시험하는 데 쓰고, SiL은 컴포넌트를 프로그래밍하고 컴파일한 뒤에 쓴다. 생성한 코드가 모델에서 기대한 대로 동작하는지는 SiL에서 처음 시험할 수 있다. ISTQB CT-AuT v2.1.1 강의계획서에 따르면 실제 환경에 가까운 정도는 MiL이 낮고, SiL이 낮거나 중간이며, HiL이 높다.[@istqb-ct-aut-syllabus-2025]

Embedded Coder에서는 평가 보드나 명령어 집합 시뮬레이터 같은 대상 하드웨어가 있을 때 processor-in-the-loop 시뮬레이션으로 대상 전용 코드의 동작과 컴파일러 설정·최적화의 영향을 확인할 수 있다. 일반 시뮬레이션은 제한된 메모리나 대상에 맞춰 최적화한 코드의 동작 같은 하드웨어 제약을 반영하지 못한다.[@mathworks-ecoder-sil-pil-2026]

## 테스트 레벨별 환경

SiL의 전형적인 테스트는 [[unit-testing#컴포넌트 테스트|컴포넌트 테스트]]와 [[integration-testing|통합 테스트]]이고, 모델과 테스트 환경을 더 발전시키면 MiL에서도 컴포넌트 테스트와 통합 테스트를 할 수 있다. HiL은 컴포넌트 테스트와 통합 테스트에도 쓰고, [[system-testing|시스템 테스트]]도 HiL에서 할 수 있다. 테스트 대상이 ECU 하나면 **component HiL**, 여러 ECU를 묶었으면 **system HiL**이라 하며, system HiL은 ECU 사이의 데이터 교환과 시스템 테스트에 초점을 둔다.[@istqb-ct-aut-syllabus-2025]

Embedded Coder의 software-in-the-loop·processor-in-the-loop 시뮬레이션으로는 부모 모델에서 생성한 코드 가운데 서브시스템 코드의 단위 테스트를 할 수 있다.[@mathworks-ecoder-sil-pil-2026]

## 환경 고르기

MiL, SiL, HiL은 실제와 가까운 정도, 디버깅에 드는 시간과 노력, 구현과 유지보수의 노력, 테스트 준비의 노력, 테스트 대상에 필요한 성숙도, 테스트 기준에 필요한 상세도, 테스트 대상에 접근하는 정도 같은 기준으로 견줄 수 있다. 구현과 유지보수에는 MiL은 환경 모델만, SiL은 환경 모델과 래퍼를, HiL은 환경 모델과 하드웨어 배선을 만들어야 한다. 모델의 신호는 MiL에서 모두 관찰하고 제어할 수 있지만, SiL에서는 래퍼에 있는 신호만, HiL에서는 하드웨어나 통신 프로토콜에 있는 신호만 다룰 수 있다.[@istqb-ct-aut-syllabus-2025]

ISTQB CT-AuT v2.1.1 강의계획서는 테스트 목적마다 알맞은 환경을 든다(+ 권장, o 가능, - 맞지 않음).[@istqb-ct-aut-syllabus-2025]

| 테스트 목적                    | MiL | SiL | HiL |
| ------------------------------ | --- | --- | --- |
| 고객 요구사항 시험             | o   | o   | +   |
| 결함 검출과 처리 메커니즘 시험 | +   | +   | +   |
| 설정 데이터에 대한 반응 시험   | o   | +   | +   |
| 진단 기능 시험                 | -   | +   | +   |
| 인터페이스에서의 상호작용 시험 | o   | +   | +   |
| 사용성 입증                    | -   | o   | +   |

MiL은 일반적인 설계 결함을, SiL은 주로 기술적인 소프트웨어 결함을, HiL은 기술적인 하드웨어·소프트웨어 결함을 찾는 데 쓴다. 테스트 관리자는 앞의 비교 기준과 테스트 목적별 표를 함께 보고 알맞은 테스트 환경을 고를 수 있다.[@istqb-ct-aut-syllabus-2025]

## ISO 26262-6

[[iso-26262|ISO 26262]]-6:2018은 표 13에 [[software-testing|소프트웨어 테스트]]를 수행하는 테스트 환경(Test environments for conducting the software testing)을 둔다.[@iso-26262-6-obp-2018]
