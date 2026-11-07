---
title: FlexRay
tags:
  - network/vehicle-bus
verified: 2026-09-29
---

**FlexRay**는 결정적(deterministic)이고 사이클 기반인 메시지 전송 서비스를 제공하는 차량용 통신 시스템이다. FlexRay는 이 밖에 자율 기동 절차를 주는 기동 서비스, 오류를 처리하고 알리는 오류 관리 서비스, 전원 관리를 위한 웨이크업 서비스도 준다. ISO 17458 시리즈는 FlexRay의 사용 사례, 통신 프로토콜, 물리 계층 요구사항을 정한다.[@iso-17458-1-obp-2013] FlexRay의 전기 물리 계층은 차량 ECU를 잇는 time-triggered 네트워크를 위한 것으로, 최대 10 Mbit/s로 통신한다.[@iso-17458-4-obp-2013] NXP 앱노트에 따르면 FlexRay는 FlexRay 컨소시엄이 개발했다.[@nxp-an12233-2021] BMW 그룹은 2006년 9월 새 BMW X5의 섀시 도메인에 FlexRay를 처음 적용해 양산을 시작했고, BMW 그룹 필자들의 SAE 논문에 따르면 FlexRay를 양산에 처음 도입한 자동차 제조사다.[@sae-2006-21-0039-2006]

FlexRay의 통신 사이클에서 정적 세그먼트는 정적 슬롯으로 나뉘어 프레임을 동기적으로 보내고, 동적 세그먼트는 미니슬롯으로 나뉘어 우선순위가 있는 이벤트 구동 전송을 지원한다.[@iso-17458-1-obp-2013] 토폴로지는 [[vehicle-bus#토폴로지|차량 버스]]에서 다룬다.

## 문서 구성

ISO 17458 시리즈는 아래 다섯 부로 이뤄진다.[@iso-17458-1-obp-2013]

| 문서        | 다루는 것                    |
| ----------- | ---------------------------- |
| ISO 17458-1 | 일반 정보와 use case 정의    |
| ISO 17458-2 | 데이터 링크 계층             |
| ISO 17458-3 | 데이터 링크 계층 적합성 시험 |
| ISO 17458-4 | 전기 물리 계층               |
| ISO 17458-5 | 전기 물리 계층 적합성 시험   |

[[osi-model|OSI 참조 모델]]의 1·2계층은 FlexRay 통신 시스템과 제조사 확장 진단(vehicle manufacturer enhanced diagnostics)이 함께 쓰는 ISO 17458의 2\~5부가 맡고, 3\~7계층은 두 쪽이 다르다. FlexRay 통신 시스템에서는 3\~7계층이 모두 제조사별이다. 제조사 확장 진단에서는 3·4계층에 ISO 10681-2를, 5계층에 ISO 14229-2를, 7계층에 [[iso-14229-1|ISO 14229-1]]과 ISO 14229-4를 쓰고, 6계층은 제조사별이다. ISO 14229의 이 부들은 [[uds|UDS]]를 다룬다.[@iso-17458-1-obp-2013]

![[diagrams/flexray-osi-layers.svg]]

## 통신 사이클

FlexRay는 통신 사이클을 주기적으로 되풀이한다. 사이클은 정적 세그먼트, 동적 세그먼트, 심볼 윈도, 네트워크 idle 시간으로 이뤄지고, 동적 세그먼트와 심볼 윈도는 선택 사항이다.[@iso-17458-1-obp-2013] 정적 슬롯마다 그 슬롯을 쓸 노드가 배정된다.[@iso-17458-2-obp-2013] NXP 앱노트에 따르면 FlexRay의 정적 세그먼트는 버스 접근에 TDMA(Time Division Multiple Access)를 쓰고, 동적 세그먼트는 FTDMA(Flexible TDMA)를 쓴다. FlexRay의 시간은 통신 사이클, arbitration grid(정적 슬롯과 미니슬롯), macrotick, microtick의 네 단계로 나뉜다.[@nxp-an12233-2021] TDMA는 [[bus-access-method#시분할|버스 접근 방식]]에서 다룬다.

![[diagrams/flexray-communication-cycle.svg]]

FlexRay는 동기 전송에서 프레임 지연과 지터를 보장한다. 정적 세그먼트에서 슬롯을 배정받은 노드는 보낼 데이터가 없어도 null 프레임을 보낸다. 동적 세그먼트에서는 슬롯을 배정받은 노드라도 그 슬롯에서 보내지 않을 수 있다.[@iso-17458-2-obp-2013]

정적 슬롯의 프레임 전송은 그 슬롯의 action point에서 시작하고, 동적 세그먼트의 전송은 미니슬롯의 action point에서 시작한다. action point는 슬롯이나 미니슬롯이 시작한 뒤 설정한 offset만큼 지난 시점이다.[@nxp-an12233-2021][@ti-spnu499c-2018] NXP 앱노트에 따르면 이 offset은 macrotick 단위로 설정한다.[@nxp-an12233-2021]

심볼 윈도로는 웨이크업 같은 일을 돕는 FlexRay 심볼을 보내고, 네트워크 idle 시간은 클록 보정에 쓴다.[@iso-17458-1-obp-2013] NXP 앱노트에 따르면 심볼 윈도로는 물리 연결을 시험하는 MTS(Media Access Test Symbol)를 보낸다.[@nxp-an12233-2021]

## 노드

**호스트**는 ECU에서 응용 소프트웨어가 실행되는 부분이고, CHI(Controller Host Interface)로 프로토콜 엔진과 나뉜다. **통신 컨트롤러**(CC, Communication Controller)는 노드 안에서 FlexRay 프로토콜을 구현하는 전자 부품이다. **버스 드라이버**(BD, Bus Driver)는 통신 컨트롤러와 배선 사이의 물리 인터페이스로, FlexRay 노드에 반드시 있는 구성 요소다.[@iso-17458-1-obp-2013]

**버스 가디언**(BG, Bus Guardian)은 노드가 미리 정해진 타이밍 슬롯 안에서만 송신하게 하는 구성 요소다.[@iso-17458-4-obp-2013] 버스 가디언은 선택 사항이다.[@ti-spnu499c-2018][@freescale-netwrkfrway-2005]

![[diagrams/flexray-node-structure.svg]]

## 채널

FlexRay 통신 컨트롤러 하나는 두 채널(채널 A, 채널 B)로 데이터 프레임을 서로 독립적으로 보낼 수 있다.[@iso-17458-1-obp-2013] [[vehicle-bus#토폴로지|클러스터]]는 단일 채널이나 이중 채널로 구성해 [[fault-tolerance|결함 허용]] 수준을 달리할 수 있다.[@iso-17458-2-obp-2013] Freescale 브로셔에 따르면 FlexRay의 이중 채널 구조는 시스템 전체에 중복성을 주어, brake-by-wire 같은 안전 시스템의 신뢰성 요구를 맞춘다.[@freescale-brinvehiclenet-2006]

FlexRay 버스는 두 선 사이에 [[differential-signaling|차동 전압]]을 걸어 신호를 보낸다. 버스 드라이버의 두 핀 BP(Bus Plus)와 BM(Bus Minus) 사이의 차동 전압 $u_\mathrm{BP} - u_\mathrm{BM}$이 버스 상태(idle, Data_0, Data_1)를 나타낸다. 예를 들어 버스 상태가 idle이면 차동 전압은 약 0 V이고, 통신 중(activity)이면 약 ±600 mV\~±1000 mV다.[@iso-17458-4-obp-2013]

## 시간

FlexRay는 모든 노드에 공통 시간 기준을 제공하고, 정적 세그먼트의 시간 분할은 분산 클록에 기반한다.[@iso-17458-1-obp-2013]

**microtick**은 노드의 발진기 클록에서 나온 노드별 시간 단위다. **macrotick**은 FlexRay 네트워크 전체가 함께 쓰는 시간 단위이고, 정수 개의 microtick으로 이뤄진다.[@nxp-an12233-2021][@ti-spnu499c-2018] 노드들은 sync 프레임의 도착 시각을 재어 클록을 맞춘다.[@iso-17458-2-obp-2013][@ti-spnu499c-2018] 클록 동기화는 두 보정으로 이뤄진다. **offset correction**은 사이클 시작 시점의 어긋남을 고치는 보정이고, **rate correction**은 사이클 길이의 어긋남을 고치는 보정이다. offset correction은 홀수 사이클에 적용하고, rate correction은 짝수·홀수 사이클 한 쌍에서 잰 값으로 홀수 사이클에 구해 다음 짝수·홀수 사이클 한 쌍에 적용한다.[@nxp-an12233-2021][@ti-spnu499c-2018]

ISO 17458-2:2013은 단일·다중 마스터 클록 동기화와 여러 네트워크에 걸친 시간 동기화를 FlexRay 프로토콜의 기본 특성으로 둔다. 다중 마스터 클록 동기화는 셋 이상의 sync 노드의 클록에 기반한 동기화다.[@iso-17458-2-obp-2013]

## 웨이크업

TI의 TMS570LS31x/21x 기술 참조 매뉴얼에 따르면 버스 드라이버는 채널에서 웨이크업 패턴(WUP, Wakeup Pattern)을 받으면 자기 노드의 다른 부품을 깨울 수 있다.[@ti-spnu499c-2018] 웨이크업 패턴은 웨이크업 심볼(WUS, Wakeup Symbol)을 되풀이해 만든다.[@iso-17458-2-obp-2013][@ti-spnu499c-2018] ISO 17458-2:2013은 웨이크업 노드가 coldstart 노드일 필요도, coldstart 노드가 웨이크업 노드일 필요도 없다고 제시한다.[@iso-17458-2-obp-2013]

## 기동

클러스터를 기동하려면 coldstart 노드가 적어도 둘 있어야 한다. 기동은 coldstart 노드가 CAS(Collision Avoidance Symbol)를 보내며 시작하고, startup 프레임은 sync 프레임이기도 하다.[@nxp-an12233-2021][@ti-spnu499c-2018] NXP 앱노트에 따르면 startup 프레임은 coldstart 노드만 보낸다.[@nxp-an12233-2021]

TI의 TMS570LS31x/21x 기술 참조 매뉴얼에 따르면 TT-D(Time-Triggered Distributed) 모드에서는 그 둘이 결함 없는 coldstart 노드여야 한다. coldstart 노드는 모두 sync 노드이기도 하다.[@ti-spnu499c-2018] ISO 17458-2:2013은 클러스터의 coldstart 노드를 꼭 셋으로 두면 여러 결함 상황에서 기동 중에 clique가 생기지 않는다고 제시한다.[@iso-17458-2-obp-2013]

## 프레임

FlexRay 프레임은 헤더, 페이로드, 트레일러 세그먼트로 이뤄진다. 헤더에는 11비트 프레임 ID, 7비트 페이로드 길이, 11비트 헤더 [[cyclic-redundancy-check|CRC]]가 있다. 페이로드 길이 필드는 페이로드를 2바이트 워드 수로 나타낸다. 프레임 CRC는 24비트다.[@iso-17458-2-obp-2013] NXP 앱노트에 따르면 헤더는 5바이트로, 한 비트짜리 indicator 다섯 개와 6비트 사이클 카운트도 담는다. 트레일러는 헤더와 페이로드 전체에 대해 계산한 이 프레임 CRC다.[@nxp-an12233-2021] 페이로드는 0\~254바이트다.[@nxp-an12233-2021][@renesas-r01an7076-2024]

![[diagrams/flexray-frame-format.svg]]

FlexRay 데이터 프레임과 CAS/MTS 앞에는 비트열 TSS(Transmission Start Sequence)를 보내고, 바이트마다 앞에는 두 비트 `10`인 BSS(Byte Start Sequence)를, 데이터 프레임 끝에는 두 비트 `01`인 FES(Frame End Sequence)를 보낸다. TSS는 버스 드라이버와 [[vehicle-bus#토폴로지|능동 스타]]가 버스 활동을 알아보는 데 필요하고, 둘은 TSS를 줄이거나 늘일 수 있다.[@iso-17458-4-obp-2013]

FlexRay의 비트 하나는 샘플 클록 여덟 주기다.[@nxp-an12233-2021][@renesas-r01an7076-2024]

ISO 17458-2:2013은 프레임 ID가 1\~2047이고, 0은 무효 프레임이나 빈 슬롯을 표시하는 데 쓴다고 제시한다. 송신 프레임의 ID는 그 프레임을 보내는 슬롯의 번호다.[@iso-17458-2-obp-2013]

11비트 헤더 CRC는 sync 프레임 지시 비트, startup 프레임 지시 비트, 프레임 ID, 페이로드 길이를 합한 20비트를 보호하고, 최소 [[hamming-distance|해밍 거리]]가 6인 (31,20) BCH 부호를 이룬다. 24비트 프레임 CRC는 페이로드가 248바이트까지인 프레임에는 해밍 거리 6을, 그보다 긴 프레임에는 4를 준다. 프레임 CRC의 초기값은 채널마다 다르게 정해, 채널을 엇갈려 이은 노드, 엉뚱한 채널에 이은 단일 채널 노드, 두 채널을 같은 물리 채널에 이은 노드가 통신하지 못하게 한다.[@iso-17458-2-obp-2013]

## CAN과의 차이

FlexRay가 정적 슬롯마다 그 슬롯을 쓸 노드를 배정하는 것과 달리[@iso-17458-2-obp-2013], [[can|CAN]]의 버스 접근은 이벤트 구동이다.[@ti-sloa101b-2016][@nxp-can-101-2021] CAN의 버스 접근은 [[bus-access-method#경쟁 방식|버스 접근 방식]]에서 다룬다.
