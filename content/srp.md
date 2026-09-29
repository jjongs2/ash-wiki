---
title: SRP
tags:
  - network/ethernet
aliases:
  - Stream Reservation Protocol
  - IEEE 802.1Qat
verified: 2026-09-29
---

**SRP**(Stream Reservation Protocol)는 [[avb|AVB]]에서 스트림 예약을 맡는 프로토콜로, 브리지가 오디오·비디오 스트림에 필요한 자원을 보장하게 한다.[@ieee-802-1-avb-tg-2013][@ti-snaa333-2020][@nxp-amf-aut-t2348-2016] IEEE 802.1Qat-2010이 처음 정했다. 이 개정은 브리지로 이어진 LAN(Local Area Network)을 지나는 스트림에 네트워크 자원을 예약하게 했고, 전송을 시작하기 전에 종단 간 경로 전체의 자원을 확보하도록 했다.[@ieee-802-1qat-project-2010] 지금은 IEEE 802.1Q가 SRP를 정한다.[@ieee-ra-ethertype-2024]

## 구조·동작

### MRP 응용

IEEE 802.1ak-2007이 정한 MRP(Multiple Registration Protocol)는 MRP 응용의 참여자가 브리지로 이어진 LAN의 다른 참여자에게 속성을 등록하게 했다. 이 개정은 응용으로 VLAN을 등록하는 MVRP(Multiple VLAN Registration Protocol)와 그룹 MAC(Medium Access Control) 주소를 등록하는 MMRP(Multiple MAC Registration Protocol) 둘을 정했다.[@ieee-802-1ak-project-2015] 지금은 MVRP와 MMRP도 IEEE 802.1Q가 정한다. EtherType은 SRP가 `0x22EA`, MVRP가 `0x88F5`, MMRP가 `0x88F6`이다.[@ieee-ra-ethertype-2024]

Micrel의 KSZ956X MRP 개발자 안내서에 따르면 MRP는 스위치를 거쳐 속성을 전달하는 틀이고, MMRP, MVRP, MSRP(Multiple Stream Registration Protocol)는 그 위에서 각각 MAC 속성, VLAN 속성, SRP 속성을 전달한다. KSZ956X는 AVB 스트림 예약을 위해 셋을 함께 다룬다.[@micrel-ksz956x-mrp-2014]

![[diagrams/mrp-applications.svg]]

### 선언

NXP 자료에 따르면 talker는 보낼 수 있는 스트림과 그 속성을 선언하고, listener는 스트림을 받으려는 뜻을 선언한다. 브리지는 선언을 조정하고 병합해 퍼뜨리며, 예약이 실패하면 talker나 listener의 선언을 바꿀 수 있다.[@nxp-amf-aut-t2348-2016]

![[diagrams/srp-roles-declarations.svg]]

KSZ956X MRP 드라이버는 SRP 속성을 talker 속성과 listener 속성으로 나눠 다룬다. talker 속성은 stream ID, 목적지 주소, VLAN ID, MaxFrameSize, MaxIntervalFrames, 우선순위, rank, AccumulatedLatency와, 실패를 보고할 bridge ID와 FailureCode를 담는다. FailureCode에는 대역폭 부족, 자원 부족 등이 있다. talker나 listener 속성이 등록되면 드라이버는 스위치에 그 스트림을 실을 대역폭이 있는지 확인한다.[@micrel-ksz956x-mrp-2014]

KSZ956X MRP 드라이버는 스트림 속성의 상태를 아래 코드로 나타낸다.[@micrel-ksz956x-mrp-2014]

| 코드                | 뜻                                               |
| ------------------- | ------------------------------------------------ |
| `SRP_ADVERTISE`     | talker가 스트림을 알렸다                         |
| `SRP_FAILED`        | 스트림을 보낼 준비가 안 됐다                     |
| `SRP_READY`         | 스트림을 보내고 받을 준비가 됐다                 |
| `SRP_READY_FAILED`  | 스트림은 준비됐지만 일부는 받을 준비가 안 됐다   |
| `SRP_ASKING_FAILED` | 스트림을 받을 준비가 안 됐다                     |

talker 속성의 등록이 풀리면 KSZ956X MRP 드라이버는 그 leave 메시지를 다른 포트로 퍼뜨린다.[@micrel-ksz956x-mrp-2014]

## 비교·한계

[[tsn|TSN]] 태스크 그룹의 IEEE 802.1Qcc-2018은 IEEE 802.1Q의 개정으로, SRP를 개선하고 시간에 민감한 스트림의 설정을 보강했다.[@ieee-802-1qcc-2018][@ieee-802-1qcc-project-2026]
