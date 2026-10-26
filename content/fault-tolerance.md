---
title: 결함 허용
tags:
  - sw-engineering/functional-safety
verified: 2026-10-02
---

IEC 60050은 **결함 허용**(fault tolerance)을 어떤 fault가 있어도 시스템이 계속 기능하는 능력으로 정의한다.[@iec-60050-192-10-09-2015] Avizienis 외(2004)는 fault tolerance를 fault가 있어도 서비스 failure를 피하는 수단으로 두고, error 검출과 시스템 복구로 이룬다고 본다.[@avizienis-dependable-secure-computing-2004] Fault, error, failure의 정의는 [[fault-error-failure|Fault, error, failure]]에서 다룬다.

## 중복과 다양성

[[iso-26262|ISO 26262]]-1:2018은 **중복**(redundancy)을 요구된 기능을 수행하거나 정보를 나타내는 데 충분한 수단에 더해 수단을 더 두는 것으로 정의하고, 그 예로 기능 구성 요소를 이중으로 두는 것과 안전 관련 데이터에 [[parity-bit|패리티 비트]]를 붙이는 것을 든다. 또 **다양성**(diversity)을 같은 요구사항을 충족하는 서로 다른 해법으로 정의하고, 그 목적을 독립성을 얻는 것으로 둔다. 다양성은 중복을 구현하는 한 방법이며, 독립성을 보장하지는 않지만 어떤 종류의 [[safety-analysis#Dependent failure 분석|common cause failure]]에는 대처할 수 있다.[@iso-26262-1-obp-2018]

Avizienis 외(2004)는 결함 허용을 구현하는 방법의 하나로 여러 채널에서 순차로 또는 동시에 여러 번 계산하는 것을 든다. 하드웨어 부품이 서로 독립적으로 고장 난다고 가정하면, 물리 fault를 허용하는 채널은 같은 설계로 둘 수 있다. 그러나 같은 설계의 채널은 개발 중에 들어간 설계 fault를 허용하지 못한다. 이를 허용하려면 채널들이 같은 기능을 서로 다른 설계와 구현으로 실현해야 하며, 이를 설계 다양성(design diversity)이라 부른다.[@avizienis-dependable-secure-computing-2004]

하드웨어의 결함 허용 설계가 허용하는 것은 설계 fault가 아니라 부품 failure이고, 소프트웨어에 필요한 중복은 프로그램의 복제가 아니라 설계의 중복이다. 대체 구성 요소가 주 구성 요소의 복사본에 지나지 않으면 주 구성 요소를 고장 나게 한 상황에 대처할 수 없으므로, 대체 구성 요소는 따로 설계한다.[@randell-software-fault-tolerance-1975]

Avizienis 외(2004)의 분류에서 공통 원인에서 비롯한 fault들은 대개 검출 메커니즘이 구별하지 못하는 비슷한 error를 내고, 원인이 서로 다른 독립된 fault들은 대개 서로 다른 error를 낸다. 다만 독립된 fault가 비슷한 error를 내거나, 공통 원인에서 비롯한 fault가 서로 다른 error를 내기도 한다. 이 분류는 비슷한 error로 생긴 failure를 common-mode failure라 한다.[@avizienis-dependable-secure-computing-2004]

## Ariane 5 501편

1996년 6월 4일 Ariane 5의 첫 비행인 501편은 이륙 약 30초 뒤 유도·자세 정보를 잃고, 비행 경로를 벗어나 부서지고 폭발했다. Ariane 5에는 하드웨어도 소프트웨어도 같은 관성 기준 시스템(SRI) 두 대가 병렬로 있었고, 한 대는 동작하고 한 대는 hot stand-by였다.[@esa-ariane-501-inquiry-1996]

64비트 부동소수점 값을 16비트 부호 있는 정수로 바꾸다 operand error가 나서, 예비 SRI가 먼저 멈추고 약 0.05초 뒤 주 SRI가 같은 이유로 멈췄다. 예외가 난 부분은 이륙 전에만 의미 있는 결과를 내는, 스트랩다운 관성 플랫폼의 정렬(alignment) 기능이었다. 이 기능은 Ariane 4의 요구에 따라 이륙 뒤에도 약 40초 동안 동작했고, Ariane 5에는 쓸모가 없었지만 공통성을 이유로 그대로 남았다. SRI의 설계, 특히 소프트웨어는 Ariane 4의 것과 사실상 같았다.[@esa-ariane-501-inquiry-1996]

## 다중 채널과 비교

Lockstep 구조는 같은 입력을 받아 함께 동작하는 두 처리 장치의 출력을 비교기로 견주어 둘의 차이를 검출하는 구조로, 출력이 다르면 시스템에 불일치를 알린다.[@ti-spry178-2011][@infineon-aurix-tc3xx-spulckstp-training-2020]

TI Hercules MCU는 기능 CPU와 같은 입력을 받는 checker CPU를 lockstep으로 둔다. Core compare 모듈이 두 CPU의 출력을 사이클마다 감시하다가 다르면 시스템에 error를 알린다.[@ti-spry178-2011]

![[diagrams/lockstep-core-compare.svg]]

## 소프트웨어의 결함 허용

Recovery block은 소프트웨어의 설계 fault로 생긴 error를 다루려고 마련한 방식이다.[@randell-software-fault-tolerance-1975] [[n-version-programming|N-version programming]]도 설계 fault를 허용하려는 방식이다.[@avizienis-n-version-1985]

Randell은 1975년 논문에서 recovery block, conversation, fault-tolerant interface로 복잡한 컴퓨팅 시스템을 구조화하는 방법을 내놓았다. Recovery block의 기본 구조는 Horning, Lauer, Melliar-Smith, Randell이 1974년 논문에서 먼저 기술했다. Recovery block은 primary alternate를 실행한 뒤 그 결과를 acceptance test로 검사한다. 통과하지 못하면 프로세스 상태를 recovery point, 곧 primary alternate에 들어가기 직전의 상태로 되돌리고 다음 alternate를 실행한다. 마지막 alternate까지 통과하지 못하면 recovery block 전체가 실패한 것으로 본다.[@randell-software-fault-tolerance-1975]

![[diagrams/recovery-block-flow.svg]]
