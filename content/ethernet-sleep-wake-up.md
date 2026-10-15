---
title: 이더넷 슬립과 웨이크업
tags:
  - network/ethernet
verified: 2026-10-06
---

**이더넷 슬립과 웨이크업**은 차량용 [[ethernet|이더넷]] 링크를 재웠다가 필요할 때 다시 깨우는 기능이다. OPEN Alliance TC10은 차량 네트워크가 일부 구간을 재웠다가 필요할 때 깨우는 partial networking에 크게 기대므로, 차량 쓰임에 맞춘 슬립 모드와 웨이크업 메커니즘을 마련하는 일을 맡는다.[@open-alliance-tc10-2026]

## OPEN Alliance TC10

TC10은 이더넷 슬립·웨이크업 개념이 갖출 기능으로 아래를 든다.[@open-alliance-tc10-2026]

- 계층 1에서 네트워크 전체를 깨우도록 빠른 웨이크업과 웨이크업 요청 전달을 지원한다.
- 네트워크의 고른 부분을 재우도록 제어된 링크 종료를 지원한다.
- 네트워크 전체 웨이크업에서 링크 트레이닝 시작까지의 시간에 요구를 둔다.
- 웨이크·슬립 응용을 위한 전기 I/O 인터페이스를 정한다.
- 표준 MAC(Medium Access Control) 인터페이스와 [[autosar|AUTOSAR]] [[autosar-network-management|네트워크 관리]]를 따른다.
- 간섭 잡음이 있어도 뜻하지 않게 깨지 않는다.
- [[10base-t1s|10BASE-T1S]], [[100base-t1|100BASE-T1]], [[1000base-t1|1000BASE-T1]], [[multigbase-t1|MultiGBASE-T1]]에 적용하고, 할 수 있으면 앞으로 나올 꼬임쌍선 [[ethernet-phy|PHY]]에도 적용한다.[@open-alliance-tc10-2026]

## PHY 동작

TJA1100은 Sleep 모드로 넘어가는 중간 상태로 Sleep Request 모드를 둔다. Sleep Request에 들면 타이머가 돌기 시작하고, 타이머가 끝나면 Sleep 모드로 넘어가며 INH 출력을 끈다. Sleep Request 동안 MDI(Medium Dependent Interface)나 [[mii|MII]]에서 [[ethernet-frame|이더넷 프레임]]을 받으면 Normal 모드로 돌아간다. Sleep 모드에 있는 링크는 다시 맺기 전에 깨워야 한다. 링크를 원하는 노드는 링크에 idle 심볼을 보내 웨이크업을 요청하고, 링크 상대는 그 활동을 감지해 깨어난다. TJA1100의 웨이크업 요청은 적어도 5 ms 이어진다.[@nxp-tja1100-2017]

TJA1100은 웨이크업 원인을 셋으로 나눈다. Standby와 Sleep 모드에서 MDI의 이더넷 활동은 원격 웨이크업을 일으킨다. `LED_ENABLE`이 0이면 Standby, Sleep Request, Sleep 모드에서 WAKE 핀의 하강 에지가 로컬 웨이크업을 일으킨다. Sleep Request 모드에서 MDI나 MII의 이더넷 프레임은 데이터 감지 웨이크업을 일으킨다.[@nxp-tja1100-2017]

![[diagrams/tja1100-sleep-modes.svg]]

TJA1103은 OPEN Alliance TC10을 따르는 슬립·웨이크업을 지원하며, 전용 핀으로 PHY 수준의 웨이크업 전달을 하고 버스 선으로 원격 웨이크업을 감지한다. TC10 슬립으로 설정한 TJA1103은 두 PHY가 모두 슬립에 들도록 하는 슬립 핸드셰이크를 거쳐 슬립에 드는 것을 정해진 방식으로 둔다.[@nxp-tja1103-2026] DP83TG720S-Q1은 절전 기능으로 standby와 sleep, 로컬 웨이크업과 원격 웨이크업을 둔다.[@ti-dp83tg720s-q1-2026]

## AUTOSAR

AUTOSAR R25-11의 EthTrcv(Ethernet Transceiver Driver) 명세는 OPEN Alliance TC10을 따르는 PHY를 지원한다. 이 명세는 상위 계층이 ETH_MODE_ACTIVE_WITH_WAKEUP_REQUEST를 요청하면 네트워크에 웨이크업을, ETH_MODE_DOWN을 요청하면 슬립을 일으키도록 드라이버에 요구하고, 받은 웨이크업을 이웃 PHY와 네트워크로 넘길지는 설정 파라미터(`EthTrcvWakeupForwardLocalEnabled`, `EthTrcvWakeupForwardRemoteEnabled`)로 정하게 한다.[@autosar-cp-sws-ethernettransceiverdriver-2025]

## EEE LPI와의 차이

TC10의 슬립은 제어된 링크 종료로 네트워크의 고른 부분을 재운다.[@open-alliance-tc10-2026] 이와 달리 [[ieee-802-3|IEEE 802.3]]-2022는 1000BASE-T1의 [[energy-efficient-ethernet|EEE]] LPI(Low Power Idle) 모드를 링크를 유지한 채 사용률이 낮은 동안 송신을 쉬고 주기적으로 refresh를 보내는 모드로 정하고, LPI에 들고 날 때 MAC 프레임을 잃거나 망가뜨리지 않도록 요구한다.[@ieee-802-3-2022]
