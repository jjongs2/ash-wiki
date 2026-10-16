---
title: SRP
tags:
  - network/ethernet
aliases:
  - Stream Reservation Protocol
  - IEEE 802.1Qat
verified: 2026-09-29
---

**SRP**(Stream Reservation Protocol)는 [[avb|AVB]]에서 스트림 예약을 맡는 프로토콜로, 브리지가 오디오·비디오 스트림에 필요한 자원을 보장하게 한다.[@ieee-802-1-avb-tg-2013][@nxp-amf-aut-t2348-2016] IEEE 802.1Qat-2010이 처음 정했다. 이 개정은 브리지로 이어진 LAN을 지나는 스트림에 네트워크 자원을 예약하고 그 자원을 유지하게 했다. 802.1Qat 프로젝트는 전송을 시작하기 전에 종단 간 경로 전체의 자원을 확보하려고 스트림 기술자와 종단 간 예약 신호 프로토콜을 정의하려 했다.[@ieee-802-1qat-project-2010] [[ieee-802-1q|IEEE 802.1Q]]-2022는 SRP를 35장(Clause 35)에서 정한다.[@ieee-802-1q-2022]

## MRP 응용

IEEE 802.1ak-2007이 정한 MRP(Multiple Registration Protocol)는 MRP 응용의 참여자가 브리지로 이어진 LAN의 다른 참여자에게 속성을 등록하게 했다. 이 개정은 응용으로 [[virtual-lan|VLAN]]을 등록하는 MVRP(Multiple VLAN Registration Protocol)와 그룹 MAC(Medium Access Control) 주소를 등록하는 MMRP(Multiple MAC Registration Protocol) 둘을 정했다.[@ieee-802-1ak-project-2015] IEEE 802.1Q-2022는 MVRP와 MMRP도 정한다.[@ieee-802-1q-2022] EtherType은 SRP가 `0x22EA`, MVRP가 `0x88F5`, MMRP가 `0x88F6`이다.[@ieee-ra-ethertype-2024]

IEEE 802.1Q의 MRP에서 참여자는 속성을 선언하거나 철회하고, 선언을 받은 다른 참여자는 그 속성을 등록하거나 등록을 푼다. 브리지 포트에 등록된 속성은 활성 토폴로지에 든 그 브리지의 다른 포트에서 다시 선언되므로, 선언은 응용의 모든 참여자에게 퍼진다. IEEE 802.1Q-2022는 MMRP, MVRP에 이어 MSRP(Multiple Stream Registration Protocol)를 MRP 응용으로 정하며, MSRP는 데이터 스트림의 특성을 등록하고 예약 요청을 퍼뜨려, QoS를 보장하도록 브리지 자원을 예약한다.[@ieee-802-1q-2022]

SRP는 스트림 예약에 MMRP, MVRP, MSRP 세 신호 프로토콜을 쓴다. MVRP는 스트림이 나오는 VLAN의 멤버십을 선언하는 데 쓰며, listener는 MSRP로 Listener Ready를 선언하기 전에 그 VLAN의 멤버십을 MVRP로 선언한다. MMRP는 talker 선언이 퍼지는 범위를 제한하는 데 쓸 수 있다. talker pruning을 켠 브리지는 스트림의 목적지 주소가 MMRP 등으로 등록된 포트로만 talker 선언을 넘긴다.[@ieee-802-1q-2022]

Micrel의 KSZ956X MRP 개발자 안내서에 따르면 MRP는 스위치를 거쳐 속성을 전달하는 틀이고, MMRP, MVRP, MSRP는 그 위에서 각각 MAC 속성, VLAN 속성, SRP 속성을 전달한다. KSZ956X는 AVB 스트림 예약을 위해 셋을 함께 다룬다.[@micrel-ksz956x-mrp-2014]

![[diagrams/mrp-applications.svg]]

## 선언

talker는 보낼 수 있는 스트림을 알리고, listener는 그 스트림을 받겠다고 알린다.[@nxp-amf-aut-t2348-2016][@xmos-xm000102-2014] NXP 자료에 따르면 talker는 스트림의 속성도 선언하고, 브리지는 선언을 조정하고 병합해 퍼뜨리며, 예약이 실패하면 talker나 listener의 선언을 바꿀 수 있다.[@nxp-amf-aut-t2348-2016]

![[diagrams/srp-roles-declarations.svg]]

IEEE 802.1Q-2022는 MSRP 선언을 다섯 가지로 나눈다. talker의 선언은 Talker Advertise와 Talker Failed이고, listener의 선언은 Listener Ready, Listener Ready Failed, Listener Asking Failed다. listener의 선언은 talker까지의 경로에서 대역폭과 자원을 확보했는지를 알린다.[@ieee-802-1q-2022]

- **Listener Ready**: 스트림을 요청한 모든 listener가 talker까지의 경로에 충분한 대역폭과 자원을 가졌다.
- **Listener Ready Failed**: 둘 이상의 listener가 스트림을 요청했고, 적어도 하나는 받을 수 있지만 하나 이상은 대역폭이나 자원 문제로 받을 수 없다.
- **Listener Asking Failed**: 스트림을 요청한 listener 가운데 어느 것도 대역폭이나 자원 문제로 스트림을 받을 수 없다.[@ieee-802-1q-2022]

이 표준은 **StreamID**를 스트림을 유일하게 가리는 64비트 필드로 정의하며, StreamID는 talker 등록을 그에 맞는 listener 등록과 짝짓는 데 쓰인다. StreamID는 스트림을 내보내는 talker에 연관된 48비트 [[mac-address|MAC 주소]]와, 같은 talker가 내보내는 여러 스트림을 가리는 16비트 Unique ID로 이루어진다.[@ieee-802-1q-2022]

![[diagrams/srp-stream-id-fields.svg]]

이 표준은 확장 스트림 예약을 위한 속성 타입 Talker Enhanced와 Listener Enhanced도 정한다. 이 두 타입은 원래 속성 타입과 달리 MSRP FirstValue를 TLV(Type-Length-Value) 목록으로 부호화해, 선택 기능을 넣을 수 있는 유연한 구조를 준다.[@ieee-802-1q-2022]

KSZ956X MRP 드라이버는 SRP 속성을 talker 속성과 listener 속성으로 나눠 다룬다. talker 속성은 StreamID, 목적지 주소, VLAN ID, MaxFrameSize, MaxIntervalFrames, 우선순위, rank, AccumulatedLatency와, 실패를 보고할 bridge ID와 FailureCode를 담는다. FailureCode에는 대역폭 부족, 자원 부족 등이 있다. talker나 listener 속성이 등록되면 드라이버는 스위치에 그 스트림을 실을 대역폭이 있는지 확인한다.[@micrel-ksz956x-mrp-2014]

KSZ956X MRP 드라이버는 스트림 속성의 상태를 아래 코드로 나타낸다.[@micrel-ksz956x-mrp-2014]

| 코드                | 뜻                                              |
| ------------------- | ----------------------------------------------- |
| `SRP_ADVERTISE`     | talker가 스트림을 알렸다.                       |
| `SRP_FAILED`        | 스트림을 보낼 준비가 안 됐다.                   |
| `SRP_READY`         | 스트림을 보내고 받을 준비가 됐다.               |
| `SRP_READY_FAILED`  | 스트림은 준비됐지만 일부는 받을 준비가 안 됐다. |
| `SRP_ASKING_FAILED` | 스트림을 받을 준비가 안 됐다.                   |

talker 속성의 등록이 풀리면 KSZ956X MRP 드라이버는 그 leave 메시지를 다른 포트로 퍼뜨린다.[@micrel-ksz956x-mrp-2014]

## 예약 과정

talker는 Talker Advertise로 자기가 낼 수 있는 스트림의 특성을 알리고, 브리지는 이를 등록해 일부 정보를 고친 뒤 다른 포트로 넘긴다. 경로의 브리지에 대역폭이나 자원이 모자라면, 그 브리지는 Talker Advertise를 Talker Failed로 바꿔 넘긴다. Talker Advertise를 받은 listener는 스트림을 받을 준비가 되면 Listener Ready를 talker 쪽으로 돌려보낸다. 브리지는 StreamID로 Listener Ready를 Talker Advertise와 짝지어 Talker Advertise를 등록한 포트로만 넘기고, 필요한 대역폭을 예약하며 큐와 필터링 데이터베이스를 설정한다. 대역폭이나 자원이 모자라면 Listener Ready는 Listener Asking Failed로 바뀐다. talker가 받은 listener 선언을 합친 결과가 Listener Ready나 Listener Ready Failed면 talker는 곧바로 스트림 전송을 시작할 수 있고, Listener Asking Failed면 전송을 멈춘다.[@ieee-802-1q-2022]

![[diagrams/srp-reservation-sequence.svg]]

talker가 스트림의 광고를 거두면 MSRP 참여자는 talker 선언을 철회한다. 그러면 브리지는 그 스트림을 포워딩하던 포트에서 스트림을 필터링하도록 바꾸고, 그 [[traffic-class|트래픽 클래스]]의 예약 대역폭인 [[credit-based-shaper#트래픽 클래스와의 관계|operIdleSlope]]를 줄인다.[@ieee-802-1q-2022]

## IEEE 802.1Qcc의 보강

[[tsn|TSN]] 태스크 그룹의 IEEE 802.1Qcc-2018은 IEEE 802.1Q의 개정으로, SRP를 개선하고 시간에 민감한 스트림의 설정을 보강했다.[@ieee-802-1qcc-2018][@ieee-802-1qcc-project-2026]

SRP는 IEEE 802.1Q-2022의 [[tsn-configuration|TSN 설정]] 모델 가운데 완전 분산 모델과 중앙 네트워크/분산 사용자 모델에 쓰이며, 뒤 모델에서 CNC(Centralized Network Configuration)가 브리지를 설정하는 데 쓰는 스트림 예약 원격 관리 기능은 IEEE 802.1Qcc가 처음 넣었다.[@ieee-802-1q-2022]

## LRP와 RAP

IEEE 802.1CS-2020은 점대점 링크의 한쪽 끝에서 다른 쪽 끝으로 등록 데이터베이스와 그 변경을 복제하는 LRP(Link-local Registration Protocol)를 정하며, LRP는 1 Mbyte 정도의 데이터베이스에 맞춰져 있다.[@ieee-802-1cs-2020] IEEE 802.1 작업 그룹에 따르면 IEEE 802.1Q의 MRP는 1500바이트까지의 데이터베이스에 맞춰져 있어 더 큰 데이터베이스에서는 크게 느려지며, LRP는 이 한계를 넘으려고 만들어졌다.[@ieee-802-1cs-project-2021]

IEEE 802.1 작업 그룹의 P802.1DD 프로젝트는 브리지 LAN에서 데이터 스트림을 동적으로 만들고 유지하기 위한 자원 할당 프로토콜, 곧 RAP(Resource Allocation Protocol)를 정하는 프로젝트이고, 2026년 10월 현재 진행 중이다. RAP는 데이터 경로나 별도 제어 경로로 제어 신호를 주고받아 중앙 제어를 지원하고, IEEE 802.1Q의 SRP와 하위 호환되게 한다.[@ieee-p802-1dd-2026]
