---
title: 게이트웨이
tags:
  - hardware/ee-architecture
verified: 2026-09-29
---

ISO/IEC 2382:2015는 **게이트웨이**(gateway)를 네트워크 구조가 서로 다른 두 컴퓨터 네트워크를 잇는 기능 단위로 정의하고[@iso-iec-2382-obp-2015], IEC 60050은 네트워크 구조와 프로토콜이 서로 다른 두 컴퓨터 네트워크를 잇는 기능 단위로 정의한다.[@iec-60050-732-01-17-2010]

차량에서는 [[can|CAN]], [[lin|LIN]], [[flexray|FlexRay]], [[ethernet|이더넷]]처럼 서로 다른 차량 네트워크를 잇는 ECU가 게이트웨이 역할을 한다.[@nxp-autogwdevwpus-2018][@autosar-cp-sws-pdurouter-2025] NXP 백서에 따르면 차량 게이트웨이는 호환되지 않는 네트워크 사이에서 데이터와 제어 정보를 변환해 둘이 통신할 수 있게 한다.[@nxp-autogwdevwpus-2018]

SAE 기술 논문 931808에 따르면 데이터율 요구가 다른 하위 네트워크들은 브리지나 게이트웨이로 이어져 차량 전체의 데이터 일관성을 지킨다. 이 논문은 그 예로 J1850(Class B)과 CAN(Class C)을 잇는 브리지를 다룬다.[@sae-931808-1993] SAE Class는 [[vehicle-bus#비트율|차량 버스]]에서 다룬다.

## 중앙 게이트웨이

NXP는 여러 차량 네트워크를 한데 잇는 중앙 허브 게이트웨이를 중앙 게이트웨이(central gateway)라 부른다. 게이트웨이는 네트워크 사이에서 데이터가 목적지에 닿도록 라우팅하고, 외부 진단 장비와 ECU 사이에서 진단 메시지를 라우팅한다. 이때 [[doip|DoIP]]와 [[uds|UDS]] 사이의 변환이 따를 수 있다. 게이트웨이는 파워트레인, 섀시·안전, 바디, 인포테인먼트, 텔레매틱스, ADAS(Advanced Driver Assistance Systems) 같은 기능 도메인 사이의 데이터를 라우팅한다.[@nxp-autogwdevwpus-2018]

게이트웨이의 주요 기능으로는 그 밖에도 방화벽, 메시지 미러링(받은 데이터를 진단이나 데이터 기록을 위해 다른 인터페이스로 내보내는 것), 침입 탐지, 네트워크 관리, [[key-management|키 관리]], 게이트웨이를 거쳐 닿는 ECU의 [[over-the-air-update|OTA]] 펌웨어 업데이트 관리가 있다.[@nxp-autogwdevwpus-2018]

차량 네트워크가 이더넷으로 옮겨 가면 게이트웨이 기능이 [[domain-controller|도메인 제어기]]로 나뉠 수 있고, 이때 중앙 게이트웨이는 도메인 사이의 이더넷 패킷을 라우팅한다.[@nxp-autogwdevwpus-2018] NXP 발표 자료에 따르면 도메인을 [[virtual-lan|VLAN]]으로 나눈 이더넷 네트워크에서 도메인 안의 트래픽은 2계층 [[ethernet-switch|이더넷 스위치]]가 스위칭할 수 있지만, 도메인 사이의 트래픽은 IP나 게이트웨이 같은 더 높은 계층에서 라우팅하고 방화벽으로 검사해야 한다.[@nxp-amf-aut-t3190-2018] 도메인 제어기와 차량 네트워크의 구성은 [[ee-architecture#도메인 아키텍처|E/E 아키텍처]]에서 다룬다.

Bosch에 따르면 옛 차량에서는 바디 컴퓨터 같은 ECU 안에 게이트웨이 기능을 두었지만, 통신 버스와 데이터 교환이 빠르게 늘어 게이트웨이 기능을 독립된 제어기로 떼어 낼 필요가 생겼다. Bosch의 중앙 게이트웨이 제품 Central gateway는 차량 안 통신과 차량 밖과의 통신을 라우팅하고, 차량으로 들어오는 모든 데이터가 거치는 관문이다. 진단의 중앙 접근점으로서 진단 장비(테스터)의 진단 요청을 차량의 여러 도메인으로 라우팅한다.[@bosch-central-gateway-2026]

[[ee-architecture#존 아키텍처|존 아키텍처]]에서는 [[zone-controller|존 제어기]]도 게이트웨이 기능을 맡는다.[@infineon-zcu-2026][@ti-spry345-2024]

## AUTOSAR의 게이트웨이

[[autosar|AUTOSAR]] R25-11 용어집은 게이트웨이를 [[autosar-classic-platform|Classic Platform]] ECU 안에서 CAN 시스템 하나나 FlexRay 채널 하나 같은 두 통신 시스템 사이의 프레임이나 시그널 매핑을 하는 기능으로 정의한다.[@autosar-fo-tr-glossary-2025]

## PDU 게이트웨이

AUTOSAR R25-11의 [[pdu-router|PDU Router]] 명세는 I-PDU(Interaction Layer Protocol Data Unit)를 라우팅하는 모듈로 PDU Router를 둔다. [[pdu-router#상위 모듈과 하위 모듈|통신 인터페이스 모듈]]로 받은 I-PDU는 같은 통신 인터페이스 모듈이나 다른 통신 인터페이스 모듈로 곧바로 보내고, TP(Transport Protocol) 모듈로 받은 I-PDU도 같은 TP 모듈이나 다른 TP 모듈로 보낸다. 라우팅은 I-PDU를 고치지 않으며, 명세는 이 동작을 PDU(Protocol Data Unit) Gateway라 부른다. PDU Router는 받은 I-PDU 하나를 여러 목적지로 한꺼번에 보낼 수 있다(1:n). 1:1과 n:1도 지원하지만 n:m은 지원하지 않는다. 통신 인터페이스 모듈 사이에서 주기나 rate가 다른 I-PDU를 라우팅하는 rate conversion은 PDU Router가 지원하지 않는다. 이때는 I-PDU를 [[autosar-com|AUTOSAR COM]]으로 보내 시그널 게이트웨이로 처리한다.[@autosar-cp-sws-pdurouter-2025]

## 시그널 게이트웨이

AUTOSAR COM은 받은 I-PDU의 [[signal-based-communication|시그널]]과 [[autosar-com#시그널과 I-PDU|그룹 시그널]]을 송신할 I-PDU로 옮기는 시그널 게이트웨이를 둔다. 옮길 관계는 `ComGwMapping`으로 정적으로 설정하고, 라우팅하는 시그널의 값은 설정에 따라 송신할 시그널로 복사한다.[@autosar-cp-sws-com-2025] 게이트웨이 요구사항은 시그널 게이트웨이가 COM의 packing·unpacking과 타임아웃 처리 메커니즘을 쓰고, 개별 시그널을 I-PDU 사이에서 1:n으로 라우팅하도록 요구한다. 받은 시그널은 여러 버스로 보낼 수 있다.[@autosar-cp-rs-gateway-2025]

![[diagrams/pdu-signal-gateway.svg]]

이 명세는 시그널 라우팅의 쓰임새로 세 가지를 든다. 여러 ECU의 시그널을 모아 한 ECU가 받는 I-PDU 수를 줄이는 일, 게이트웨이가 보내는 I-PDU 수를 줄이는 일, 이어진 버스들의 페이로드 길이 차이에 맞추는 일이다.[@autosar-cp-rs-gateway-2025]

시그널 게이트웨이는 라우팅할 시그널의 [[autosar-com#수신 notification과 감시|데드라인 감시]] 타임아웃을 무시한다. 소스 버스에서 메시지가 빠진 것을 게이트웨이 뒤의 ECU가 알아챌 수 있도록, 데드라인 감시할 송신 시그널 가운데 [[autosar-com#전송 속성과 전송 모드|n-times나 direct 송신]]이 아닌 것에만 update bit를 둔다. 타임아웃 동안 갱신되지 않은 update bit는 지워진 채로 남고, 받는 노드는 데드라인 감시로 타임아웃을 응용에 알린다.[@autosar-cp-rs-gateway-2025]

## AUTOSAR 게이트웨이의 라우팅 규칙

이 명세는 게이트웨이가 라우팅 설정을 동적으로 바꾸지 않도록 한다. 모든 라우팅 경로는 정적으로 정하며, PDU, L-SDU(Link Layer Service Data Unit), 시그널의 내용에 따라 달라지지 않는다. 복잡도를 줄이고 게이트웨이를 결정적으로 만들기 위해서다. 같은 PDU, 같은 L-SDU, 같은 시그널의 서로 다른 인스턴스는 시간 순서를 지켜야 한다. 일부 인스턴스를 잃는 것은 이 규칙을 어기는 것이 아니며, 같은 버스의 서로 다른 PDU끼리나 다른 버스로 보내는 같은 PDU끼리의 순서는 지키지 않아도 된다. 이 명세는 이 규칙이 쓰이는 경우로, PDU와 시그널의 순서가 사용자 조작의 순서를 나타낼 수 있는 경우와 ECU가 실행할 명령의 순서를 나타내는 경우를 든다.[@autosar-cp-rs-gateway-2025]

## 진단 게이트웨이

[[iso-13400-2|ISO 13400-2]]:2025는 IP 기반 네트워크에 곧바로 이어지지 않은 차량 서브네트워크를 두고, 이 서브네트워크와 주고받는 데이터가 서브네트워크를 잇는 DoIP 게이트웨이만 거쳐 오간다고 정의한다. 이 표준은 차량의 하위 구성요소로 오가는 데이터의 라우팅을 필수 기능으로 둔다.[@iso-13400-2-obp-2025]

## 네트워크 관리

[[autosar-network-management|AUTOSAR Nm]]은 게이트웨이 ECU가 이어진 여러 버스를 함께 잠재우는 NM(Network Management) Coordinator 기능을 선택 기능으로 둔다.[@autosar-cp-sws-networkmanagementinterface-2025]

## 네트워크 분리

NXP 백서에 따르면 다층 보안 구조의 한 층인 보안 게이트웨이(Secure Gateway layer)는 인터넷 같은 외부 인터페이스에서 내부망으로 들어오는 접근과 내부 노드끼리의 통신을 통제하고, 신뢰하지 않는 인포테인먼트 시스템과 신뢰하는, 안전에 중요한 시스템처럼 기능 도메인을 서로 격리한다.[@nxp-autogwdevwpus-2018]

NHTSA의 2022년 지침(Cybersecurity Best Practices for the Safety of Modern Vehicles)은 무선으로 연결된 ECU와 저수준 차량 제어 시스템, 특히 제동, 조향, 추진, 전원 관리처럼 안전에 중요한 기능을 제어하는 시스템 사이의 연결을 네트워크 분할과 격리 기법으로 제한하기를 권한다. 네트워크 사이의 인터페이스는, 서로 다른 네트워크 세그먼트 사이의 메시지 흐름을 엄격한 화이트리스트 기반으로 거르는 것 같은 강한 경계 통제를 갖춘 게이트웨이로 보호하기를 권한다.[@nhtsa-cybersecurity-best-practices-2022]

중국의 [[gb-44495|GB 44495]]-2024는 차량이 내부 네트워크를 영역으로 나눠 영역 경계를 보호하고, 영역을 넘는 요청에는 기본 거부 원칙과 최소 권한 원칙에 따라 접근을 통제하도록 요구한다.[@gb-44495-2024]
