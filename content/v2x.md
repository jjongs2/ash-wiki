---
title: V2X
tags:
  - network/v2x
aliases:
  - Vehicle-to-Everything
verified: 2026-11-21
---

**V2X**(Vehicle-to-Everything) 통신은 차량이 다른 차량, 인프라, 네트워크, 보행자와 정보를 주고받는 통신이고, 상대에 따라 V2V(Vehicle-to-Vehicle), V2I(Vehicle-to-Infrastructure), V2N(Vehicle-to-Network), V2P(Vehicle-to-Pedestrian) 네 갈래로 나뉜다.[@3gpp-ts-22-185-2025][@c2c-cc-about-c-its-2026]

C-ITS(Cooperative Intelligent Transport Systems)는 차량끼리, 그리고 차량과 노변 인프라가 서로 통신하게 한다.[@c2c-cc-about-c-its-2026][@eu-2023-2661-2023]

ETSI EN 302 665 V1.1.1은 ITS(Intelligent Transport Systems) station 참조 구조를 [[osi-model|OSI 모델]]의 원칙을 따라 정하고, Access가 계층 1\~2, Networking & Transport가 계층 3\~4, Facilities가 계층 5\~7의 기능을 맡게 한다.[@etsi-en-302-665-2010][@etsi-tc-its-2026]

## 쓰는 곳

EU 지침 2023/2661이 고친 EU 지침 2010/40은 **C-ITS**를, ITS 사용자가 서로를 미리 알지 못해도 차별 없이 보안과 신뢰를 갖춘 메시지를 주고받아 상호작용하고 협력하게 하는 ITS로 정의한다. 이 지침의 Annex I은 우선 영역 IV의 C-ITS 서비스 명세로 상태 데이터에 기반한 정보·경고 서비스, 연결되지 않은 사용자까지 아우르는 관측 기반 정보·경고 서비스, 의도에 기반한 서비스, 자동 운전을 돕는 인프라 서비스 넷을 둔다.[@eu-2023-2661-2023]

C2C-CC(차량 제조사, 인프라 장비 제조사, 공급사, 도로 운영자, 연구 기관이 모인 유럽 업계 단체)에 따르면 C-ITS는 V2X 통신에 기반하고, C-ITS 서비스는 정보를 주고받아 앞을 내다보는 운전을 돕는 Day 1, 인지 정보를 나누는 Day 2, 의도를 나누고 협상과 협력을 돕는 Day 3+로 나뉜다.[@c2c-cc-about-c-its-2026][@c2c-cc-home-2026] 2026년 11월 기준 C2C-CC에 따르면 Day 1 서비스는 배치되고 있으며, 유럽 도로를 달리는 협력 V2X 차량에서 이미 쓸 수 있다.[@c2c-cc-about-c-its-2026]

ETSI TR 102 638 V2.2.1은 SAE J3216의 status-sharing을 C2C-CC의 awareness driving에 대응시키고, 그 까닭으로 차량 사이에서 [[cooperative-awareness-message|CAM]], [[decentralized-environmental-notification-message|DENM]], [[collective-perception-message|CPM]] 같은 메시지로 주고받는 것이 주로 상태라는 점을 든다.[@etsi-tr-102-638-2026]

ETSI EN 302 665 V1.1.1은 ITS 응용을 처음에 "Road Safety", "Traffic Efficiency", "Other Applications" 셋으로 묶는다. 이 표준은 NOTE로, 통신 시스템은 신뢰성을 높여도 100% 신뢰할 수는 없으니 응용 개발자가 통신 시스템에 문제가 생겨도 안전하게 동작하도록 시스템을 설계해야 한다고 제시한다.[@etsi-en-302-665-2010]

## ITS station 참조 구조

ITS station 참조 구조는 Access, Networking & Transport, Facilities 위에 ITS-S(ITS Station) 응용을 담는 Applications를 두고, 그 곁에 ITS station의 통신을 관리하는 Management와 보안 서비스를 주는 Security 개체를 둔다.[@etsi-en-302-665-2010]

![[diagrams/its-station-reference-architecture.svg]]

ITS 하위 시스템은 personal(휴대 기기), central(ITS 중앙 시스템), vehicle(승용차·트럭 같은 차량), roadside(갠트리·기둥 같은 노변) 넷이고, 하위 시스템마다 ITS station이 있다. vehicle ITS station에서 vehicle ITS-S gateway는 [[electronic-control-unit|ECU]] 같은 proprietary 차량 내부 네트워크의 구성 요소를 ITS station 내부 네트워크에 잇는다. 차량 내부 구성 요소와의 인터페이스는 이 표준의 범위 밖이다. ITS-S gateway는 계층 5\~7에서 서로 다른 OSI 프로토콜 스택 둘을 이으며 프로토콜을 변환할 수 있어야 하고, ITS-S router는 계층 3에서 서로 다른 ITS 프로토콜 스택 둘을 잇는다.[@etsi-en-302-665-2010]

이 표준은 네트워킹 프로토콜로 GeoNetworking, [[ipv6|IPv6]], IPv6 over GeoNetworking 등을 든다.[@etsi-en-302-665-2010]

## Facilities 계층

Facilities 계층은 OSI 응용 계층, 표현 계층, 세션 계층의 기능을 담는다. 이 계층의 기능으로는 ITS-S 응용 사이의 데이터 교환을 위한 메시지 관리도 들고, 그 메시지로 이벤트 메시지와 주기 메시지 등을 든다. **이벤트 메시지**는 사건을 감지하면 생겨, 그 사건을 감지한 ITS station이 사건을 지각하는 동안 되풀이되는 메시지로, DENM이 대표적이다. **주기 메시지**는 주기적으로 방송되는 메시지로, facilities 계층이 주기적으로 방송하는 CAM이 그 예다.[@etsi-en-302-665-2010]

협력 시스템이 쓰는 디지털 지도에는 차로 수준의 정보를 담을 수 있고, 직접 감지했거나 다른 도로 사용자가 CAM으로 알린 동적 객체를 모두 참조해 둘 수 있다. 이런 지도를 **LDM**(Local Dynamic Map)이라 하고, LDM의 모든 요소에는 시각을 붙여야 한다.[@etsi-en-302-665-2010]

ETSI TS 103 301 V2.3.1은 인프라 서비스로 다음 넷을 둔다.[@etsi-ts-103-301-2026]

| 서비스                                     | 하는 일                                                                                             |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| TLM(Traffic Light Manoeuvre)               | 신호등 컨트롤러의 동작 상태와 지금 신호 상태, 다음 상태로 바뀌기까지 남은 시간을 실시간으로 알린다. |
| RLT(Road and Lane Topology)                | 교차로나 도로 구간의 차로 토폴로지를 디지털 지도로 준다.                                            |
| IVI(Infrastructure to Vehicle Information) | 의무·권고 도로 표지 정보를 준다.                                                                    |
| TLC(Traffic Light Control)                 | 대중교통의 신호 우선 요청과 긴급 차량의 신호 선점 요청, 그에 대한 응답을 다룬다.                    |

ETSI TS 103 300-3 V2.3.1은 VRU(Vulnerable Road User) ITS-S가 늘 VAM(VRU Awareness Message)을 쓰게 하고, 노변·차량 ITS-S 같은 다른 ITS-S는 주변 VRU의 존재를 CPM으로 알릴 수 있게 한다.[@etsi-ts-103-300-3-2025]

## GeoNetworking과 BTP

ETSI EN 302 636-4-1 V1.4.1은 **GeoNetworking**을 지리적 위치를 써서 ad hoc 네트워크에서 패킷을 라우팅하는 네트워크 계층 프로토콜로 정한다. GeoNetworking은 ITS station끼리의 통신과 지리적 영역 안으로 패킷을 퍼뜨리는 것을 지원한다. 패킷 종류로는 원·직사각형·타원 영역에 퍼뜨리는 GeoBroadcast와 포워딩하지 않는 SHB(Single-hop broadcast) 등을 둔다.[@etsi-en-302-636-4-1-2020]

ETSI EN 302 636-5-1 V2.2.1은 **BTP**(Basic Transport Protocol)를 GeoNetworking 위, ITS-S facilities 계층 아래에서 종단 간에 연결 없고 신뢰성 없는 전송을 주는 프로토콜로 정한다. BTP의 주된 목적은 CAM, DENM 같은 facilities 계층 메시지를 포트로 다중화하는 것이고, 헤더는 4바이트다. BTP 헤더의 종류는 대화형 전송의 BTP-A와 비대화형 전송의 BTP-B 둘이고, BTP-A 헤더에는 출발 포트와 목적지 포트를 싣고, BTP-B 헤더에는 목적지 포트는 싣되 출발 포트는 싣지 않는다.[@etsi-en-302-636-5-1-2019]

## ETSI ITS Release

ETSI는 ITS 표준을 Release로 펴내며, Release 1은 이미 동결했다. Release 1 문서의 제목에는 Release 표시를 두지 않았다.[@etsi-tr-103-903-2026] ETSI TS 103 898 V2.0.0은 Release 2 문서의 판을 2.Y.Z로 하고 제목 끝에 "Release 2"를 붙이도록 정하며, ETSI EN 302 665를 Release 2에 그대로 적용한다.[@etsi-ts-103-898-2022]

## SAE J2735

3GPP TS 22.185 V19.0.0의 개요 절(informative)은 V2X 응용의 메시지 집합을 3GPP 밖의 자동차 표준 기구가 정하고, 3GPP는 그 메시지의 전송만 다룬다고 제시한다.[@3gpp-ts-22-185-2025]

SAE J2735:2024는 V2X 통신 시스템을 쓰는 응용을 위한 메시지 집합과 그 data frame, data element를 정한다.[@sae-j2735-2024] SAE J2735:2016은 이 메시지 집합을 5.9 GHz DSRC(Dedicated Short Range Communications) 통신 시스템을 쓰는 응용용으로 정했고, SAE J2735:2020은 V2X 응용에서 데이터를 주고받는 하부 통신 프로토콜과 무관하게 쓰도록 했다.[@sae-j2735-2016][@sae-j2735-2020]

SAE J2945/1:2026은 J2735가 정한 BSM(basic safety message)을 [[ieee-1609|IEEE 1609]]와 IEEE 802.11이 정한 DSRC 무선 링크로 주고받는, 경량 차량의 V2V 안전 통신 시스템의 요구를 정한다.[@sae-j2945-1-2026]
