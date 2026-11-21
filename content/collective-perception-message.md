---
title: Collective Perception Message
tags:
  - network/v2x
  - applications/adas
aliases:
  - CPM
verified: 2026-11-21
publisher: ETSI
edition: 2023
status: 유효
---

**CPM**(Collective Perception Message)은 ITS-S(ITS Station)가 [[automotive-radar|레이더]], [[lidar|라이다]], [[automotive-camera|카메라]] 같은 센서로 감지한 객체(차량, 보행자, 동물 등)의 운동·자세 상태와 그 밖의 속성을 다른 ITS-S에 알리는 메시지로, CPS(Collective Perception Service)가 CPM 생성 사건에 따라 준주기적으로 만든다. CPM은 감지한 객체와 함께, 받는 ITS-S가 비어 있는 도로 영역을 판단하게 하는 인지 영역(perception region)도 알린다. 이로써 [[v2x|V2X]]를 갖추지 않은 도로 사용자의 정보를 주고, V2X를 갖춘 도로 사용자에게도 정보원을 늘린다.[@etsi-ts-103-324-2023]

ETSI TS 103 324 V2.1.1은 연속한 CPM 생성 사건 사이의 간격 T_GenCpm을 $\mathrm{T\_GenCpmMin} \le \mathrm{T\_GenCpm} \le \mathrm{T\_GenCpmMax}$로 제한하고, 객체·센서 정보를 CPM에 넣는 규칙과 메시지의 문법·의미를 정한다.[@etsi-ts-103-324-2023]

## 범위

이 명세는 개념상 ITS-S 주변의 지금 맥락에 관한 안전 관련 정보를 나누는 collective perception을 위해 CPS를 규정하며, CPM의 문법과 의미, CPM의 데이터·메시지 처리를 정한다.[@etsi-ts-103-324-2023]

### 쓰는 곳

한 객체나 빈 영역의 정보원이 여럿이면 ITS-S는 데이터 융합으로 객체 분류와 크기, 운동·자세 상태의 불확실성을 줄일 수 있다. 정보원에서 조작되거나 손상된 데이터를 받더라도, 무결성을 지킨 독립 정보원이 충분하면 그런 데이터를 가려낼 수 있다. 받는 ITS-S는 감지된 도로 사용자나 객체의 상태를 지켜보며 그와의 충돌 위험을 어림해, 사용자에게 알리거나 자동으로 바로잡는 조치를 할 수 있다.[@etsi-ts-103-324-2023]

[[v2x#Facilities 계층|LDM]]은 ITS-S 안의 데이터베이스로, 차량 탑재 센서 데이터에 더해 받은 [[cooperative-awareness-message|CAM]]과 CPM 데이터로 갱신될 수 있다.[@etsi-ts-103-324-2023]

### 정하는 것

Annex F(normative)는 T_GenCpmMin의 기본값을 100 ms로 정하고, 차량 ITS-S에는 100 ms를 권한다. 노변 ITS-S는 쓰임에 따라 50 ms까지 낮은 값이 필요할 수 있다. T_GenCpmMax의 기본값은 1000 ms다.[@etsi-ts-103-324-2023]

Sensor Information Container는 처음 만드는 CPM과, 마지막으로 넣은 뒤 T_AddSensorInformation(기본값 1000 ms) 이상 지난 CPM에 넣는다.[@etsi-ts-103-324-2023]

감지 객체를 CPM에 넣는 규칙은 설정 ObjectInclusionConfig에 따른다. 0이면 보내는 쪽이 스스로 정하고, 1(차량 ITS-S에 권하는 값)이면 이 명세의 포함 규칙을 따른다. 이 규칙은 분류 신뢰도가 가장 높은 class로 객체를 둘로 나눈다. Type-A는 VRU(Vulnerable Road User) profile이 보행자, 자전거 이용자·경량 VRU 차량, 동물인 VRU와, group class, 기타 class이고, Type-B는 차량과 motorcyclist profile의 VRU처럼 Type-A가 아닌 class다.[@etsi-ts-103-324-2023]

인지 품질이 임계를 넘는 객체 가운데 Type-A는 직전 CPM 생성 사건 뒤 처음 감지됐으면 넣고, CPM에 넣지 않은 시간 $t$가 $t \ge \mathrm{T\_GenCpmMax}/2$인 Type-A 객체가 하나라도 있으면 이 명세는 Type-A 객체를 모두 넣기를 권한다. Type-B는 직전 CPM 생성 사건 뒤 처음 감지됐거나, 마지막으로 CPM에 넣은 때보다 위치나 지면 속도가 임계보다 크게 바뀌었거나, 지면 속도의 방향이 임계 이상 바뀌었거나, 마지막으로 넣은 뒤 T_GenCpmMax 이상 지났으면 넣는다. ITS-S가 MCO(Multi Channel Operations)를 지원하면 CPS는 MCO facility가 주는 한도에 맞춰 T_GenCpm과 채널·생성 사건마다 만드는 데이터 양을 조정해야 하고, 이 명세는 이를 위해 VoI(Value of Information)가 가장 낮은 객체를 빼기를 권한다.[@etsi-ts-103-324-2023]

CPM은 facilities 계층 메시지에 공통인 header 하나와 여러 container로 이뤄진다. Management Container 뒤에 보내는 ITS-S를 기술하는 originating container, Sensor Information Container, Perception Region Container, Perceived Object Container를 합해 1\~8개 넣는다. 차량 ITS-S가 보내는 CPM에는 Originating Vehicle Container가 하나 있어야 하고, 감지 객체의 상태 변수는 차량 기준 위치를 중심으로 한 East-North-Up 좌표계로 나타낸다.[@etsi-ts-103-324-2023]

![[diagrams/cpm-header-containers.svg]]

CPS가 아래 계층에 넘기는 제어 정보에서 패킷 전송 종류와 헤더 종류는 [[v2x#GeoNetworking과 BTP|GeoNetworking SHB와 BTP]] header type B이고, 통신 프로파일은 unspecified, [[its-g5|ITS-G5]], [[c-v2x#쓰는 곳|LTE-V2X]] 가운데 하나다. 이 값들은 모두 GeoNetworking/BTP 스택을 쓰고 GeoNetworking을 네트워크 계층 프로토콜로 쓸 때의 값이다. UPER(Unaligned Packed Encoding Rules)로 인코딩한 CPM의 크기는 MTU_CPM을 넘지 않아야 하고, MTU_CPM은 CPM을 나르는 접속 계층 기술의 [[mtu|MTU]]에 따라 정해진다.[@etsi-ts-103-324-2023]

## 개정 이력

- 2019년: ETSI는 12월에 TR 103 562 V2.1.1로 CPS의 명세를 준비했다.[@etsi-tr-103-562-2019]
- 2023년: TS 103 324 V2.1.1이 6월에 나왔다.[@etsi-ts-103-324-2023]
