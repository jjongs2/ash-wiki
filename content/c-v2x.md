---
title: C-V2X
tags:
  - network/v2x
aliases:
  - LTE-V2X
  - NR-V2X
verified: 2026-11-21
---

FCC 규칙 § 90.7은 FCC 24-123이 더한 정의에서 **C-V2X**(Cellular Vehicle-to-Everything)를 노변 장치와 차량 탑재 장치 사이, 또는 차량 탑재 장치끼리 셀룰러 무선 기법으로 데이터를 주고받아 교통 흐름과 교통 안전 같은 ITS(Intelligent Transportation System) 응용을 하는 것으로 정의한다.[@fcc-24-123-2024]

**sidelink**는 단말과 단말 사이의 인터페이스로, PC5 인터페이스에 해당한다.[@3gpp-ts-36-300-2026] LTE 기반 [[v2x|V2X]] 통신에는 PC5로 하는 모드와 LTE-Uu로 하는 모드가 있다.[@3gpp-ts-23-285-2025]

3GPP는 Release 14와 Release 15에서 LTE 기반 V2X를 정했고, Release 16에서 그 뒤를 잇는 5G NR(New Radio) 기반 sidelink를 V2X phase 3로 정했다.[@3gpp-tr-21-916-2022]

## 쓰는 곳

ETSI EN 303 613 V1.1.1은 LTE-V2X(Long Term Evolution based Vehicle-to-Everything)를 ITS station 구조의 접속 계층 기술 가운데 하나로 둔다. 이 표준이 정하는 접속 계층은 ITS 전용 대역(5.855\~5.925 GHz)에서 쓰는 LTE-V2X의 sidelink, 곧 PC5 인터페이스다. LTE-V2X를 접속 계층 기술로 쓰는 ITS station은 ETSI TS 136 300(3GPP TS 36.300 V14.7.0)이 정한 LTE-V2X sidelink 통신을 지원해야 한다.[@etsi-en-303-613-2020]

FCC 20-164(2020년 First Report and Order)는 미국 5.9 GHz 대역의 ITS 서비스가 전환 기간이 끝나면 C-V2X 기반 기술을 쓰도록 했다.[@fcc-20-164-2020]

3GPP는 Release 14의 V2X 작업에서 [[cooperative-awareness-message|CAM]], [[decentralized-environmental-notification-message|DENM]], BSM(Basic Safety Message) 같은 기본 도로 안전 서비스의 데이터 운반을 주로 겨냥했다.[@3gpp-tr-21-915-2019]

## 서비스 요구

3GPP TS 22.186 V19.1.0은 3GPP 시스템이 V2X 시나리오를 더 지원하도록 서비스 요구를 일반 사항, Vehicles Platooning, Advanced Driving, Extended Sensors, Remote Driving, 차량 QoS 지원의 여섯 영역으로 나눠 정한다. Vehicles Platooning은 차량들이 동적으로 무리를 지어 함께 달리게 한다.[@3gpp-ts-22-186-2026]

3GPP TS 22.185 V19.0.0은 단말 사이의 메시지 전달에 아래 요구를 둔다. pre-crash sensing의 지연만 권고(should)다.[@3gpp-ts-22-185-2025]

| 요구                                                            | 대상                                                                                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 최대 지연 100 ms로 메시지를 나를 수 있어야 한다.                | V2V(Vehicle-to-Vehicle)·V2P(Vehicle-to-Pedestrian) 응용을 지원하는 두 단말 사이(직접이나 노변 장치를 거쳐) |
| 최대 지연 20 ms로 메시지를 나를 수 있기를 권한다.               | pre-crash sensing에 한해, V2V 응용을 지원하는 두 단말 사이                                                 |
| 50\~300바이트(보안 부분 제외)의 메시지를 나를 수 있어야 한다.   | 주기 broadcast 메시지                                                                                      |
| 최대 1200바이트(보안 부분 제외)의 메시지를 나를 수 있어야 한다. | 이벤트로 트리거되는 메시지                                                                                 |
| 초당 최대 10건의 메시지를 지원해야 한다.                        | 송신 단말 하나                                                                                             |
| 상대 속도 최대 500 km/h에서 메시지를 나를 수 있어야 한다.       | V2V 응용을 지원하는 단말 사이                                                                              |

## 통신 모드

V2X 통신은 PC5 reference point로 하는 것과 Uu reference point로 하는 것 두 모드로 나뉜다. 단말은 두 모드를 송신과 수신에 따로 쓸 수 있다. LTE의 PC5는 broadcast만 쓰고, NR의 PC5는 broadcast, groupcast, unicast를 지원한다.[@3gpp-ts-23-287-2026] Uu는 단말과 NG-RAN(NG Radio Access Network) 사이의 reference point다.[@3gpp-ts-23-287-2026][@3gpp-ts-38-300-2026]

![[diagrams/v2x-pc5-uu-modes-cast-types.svg]]

LTE의 PC5 통신은 단말이 LTE 망의 서비스를 받을 때와 받지 않을 때 모두 되고, 연결이 없어 연결 설정을 위한 PC5 제어 평면 신호가 없다. PC5로는 IP 기반과 non-IP 기반 V2X 메시지를 모두 보내고, IP 기반이면 [[ipv6|IPv6]]만 쓴다. non-IP 메시지에는 Non-IP Type 헤더가 붙어, 응용 계층이 쓰는 V2X 메시지 계열(예: [[ieee-1609|IEEE 1609]] 계열의 메시지)을 가리킨다.[@3gpp-ts-23-285-2025]

3GPP TS 23.285 V19.0.0은 단말에 진행 중인 긴급 세션이 있으면 그 세션의 통신이 PC5 V2X 통신보다 앞서도록 정한다.[@3gpp-ts-23-285-2025]

## 자원 할당

LTE의 V2X sidelink 자원 할당은 두 가지다. scheduled resource allocation에서는 단말이 기지국에 송신 자원을 요청하고, 기지국이 sidelink 제어 정보와 데이터의 송신 자원을 스케줄한다. autonomous resource selection에서는 단말이 자원 풀에서 스스로 자원을 고르고, 센싱 결과에 따라 sidelink 자원을 고르거나 다시 고르며 여러 자원을 예약한다.[@3gpp-ts-36-300-2026]

LTE sidelink 기반 V2V에서 기지국이 돕는 스케줄링을 **Mode 3**, 차량끼리의 분산 스케줄링을 **Mode 4**라 부른다. Mode 4는 센싱과 semi-persistent 송신에 기반한 방식이다.[@3gpp-tr-21-914-2018]

NR sidelink는 망이 자원을 할당하는 mode 1과, 단말이 자원 풀에서 송신 자원을 정하는 mode 2를 둔다.[@3gpp-ts-38-300-2026] 3GPP TR 21.916 V16.2.0에 따르면 두 모드는 LTE sidelink의 Mode 3·Mode 4와 매우 비슷하다.[@3gpp-tr-21-916-2022]

![[diagrams/v2x-sidelink-resource-allocation-modes.svg]]

## 동기와 혼잡 제어

LTE의 V2X sidelink 동기 기준은 기지국, 단말, GNSS(Global Navigation Satellite System) 셋이다. 단말은 RRC(Radio Resource Control) 상태와 상관없이 CBR(Channel Busy Ratio)에 따라 송신 파라미터를 조정한다.[@3gpp-ts-36-300-2026]

ETSI EN 303 613 V1.1.1의 Annex B는 동기 우선순위(SyncPriority)의 기본값을 GNSS로 둔다. 이 표준은 LTE-V2X ITS station이 측정한 CBR에 따라 CR(Channel Occupancy Ratio)을 맞춰, 요구된 CR 한도를 지키도록 요구한다.[@etsi-en-303-613-2020]

## 프로토콜 계층

sidelink에서 MAC(Medium Access Control) 계층은 주로 V2X sidelink 통신의 자원 할당을, RLC(Radio Link Control) 계층은 SDU(Service Data Unit)의 분할과 연결을, PDCP(Packet Data Convergence Protocol) 계층은 IP와 non-IP 같은 SDU 종류의 구별을 맡는다.[@etsi-en-303-613-2020]

Annex D(informative)는 [[v2x#GeoNetworking과 BTP|GeoNetworking]] 패킷을 MAC, RLC, PDCP 헤더와 Non-IP Type 헤더 뒤에 싣는 프레임 구조와, 그때 PDCP 헤더의 SDU Type 필드를 Non-IP로, Non-IP Type 필드를 3(ETSI-ITS)으로 두는 설정을 제시한다.[@etsi-en-303-613-2020]

![[diagrams/lte-v2x-geonetworking-packet-structure.svg]]

## 보안과 프라이버시

3GPP TS 33.185 V19.0.0은 LTE의 PC5 통신 계층에 보안을 두지 않는다. V2X 통신에 걸리는 보안 요구는 IEEE나 ETSI ITS 같은 다른 표준 기구가 정한 응용 계층 보안으로 모두 채워진다고 보고, 그 응용 계층 보안을 쓰는 일은 3GPP 범위 밖에 둔다.[@3gpp-ts-33-185-2025]

3GPP TS 33.536 V19.0.0은 NR의 PC5 broadcast 모드에는 보안 요구를 두지 않고, PC5 unicast의 사용자 평면 데이터에는 기밀성, 무결성, 재전송 방지 보호를 지원하도록 요구한다.[@3gpp-ts-33-536-2025]

3GPP TS 23.287 V20.0.0은 응용이 프라이버시를 요구하는 지역에서, 다른 차량이 송신 단말을 응용이 정한 짧은 시간보다 오래 추적하거나 식별하지 못하도록 송신 단말의 Layer-2 식별자를 시간에 따라 바꾸고 무작위로 정하도록 요구한다.[@3gpp-ts-23-287-2026]

## 이력

3GPP는 Release 15에서 V2X phase 2를 Release 14 V2X와 완전히 하위 호환되게 정했다. 이 작업은 Mode 4에 CA(Carrier Aggregation)를 들였고, 물리 계층에 패킷이 도착한 때부터 송신 자원을 고를 때까지의 최대 시간을 Release 14의 20 ms에서 10 ms로 줄였다.[@3gpp-tr-21-915-2019]
