---
title: 차량용 SerDes
tags:
  - applications/adas
aliases:
  - A-PHY
  - IEEE 2977
  - ASA Motion Link
  - CSI-2
verified: 2026-11-21
---

**SerDes**(Serializer/Deserializer)는 차량에서 카메라 같은 센서의 영상을 [[electronic-control-unit|ECU]]까지 나르는 직렬 링크다. 센서 쪽 [[serial-communication#동기 전송|직렬화기]]가 센서의 MIPI CSI-2(Camera Serial Interface 2) 출력을 받아 동축이나 차폐 꼬임쌍선 케이블 한 가닥으로 보내고, ECU 쪽 역직렬화기가 이를 다시 CSI-2로 바꿔 프로세서에 넘긴다.[@adi-max96717-2025][@ti-ds90ub953-q1-2024][@mipi-csi-2-2026] MIPI A-PHY와 ASA Motion Link는 차량용 SerDes를 표준으로 정한 명세다.[@mipi-a-phy-2026][@asa-about-us-2026]

![[diagrams/serdes-camera-link-chain.svg]]

SerDes는 [[adas|ADAS]]의 카메라와 차량의 디스플레이를 잇는 데 쓴다.[@adi-serdes-gmsl-2026][@ti-fpd-link-serdes-2026][@maxim-ds24-2017]

## 쓰는 곳

Analog Devices의 GMSL(Gigabit Multimedia Serial Link)과 TI의 FPD-Link는 차량용 SerDes 제품군이다.[@adi-serdes-gmsl-2026][@ti-fpd-link-serdes-2026] Maxim Integrated의 설계 자료에 따르면 GMSL SerDes는 영상을 압축하지 않고 나르는, [[ethernet|이더넷]]의 대안이다.[@maxim-ds24-2017]

MIPI(모바일 기기의 인터페이스 명세를 만드는 국제 단체)에 따르면 많은 차량에서 CSI-2와 DSI-2(Display Serial Interface)가 센서와 디스플레이를 도메인 ECU 같은 차 안의 컴퓨터에 잇는 데 쓰인다. 이 프로토콜은 대개 짧은 거리용 물리 계층인 MIPI C-PHY나 D-PHY 위로 보내고, 독자 규격의 장거리 물리 계층과는 브리지로 잇는다.[@mipi-a-phy-2026][@mipi-about-us-2026]

## 동작

SerDes 링크는 앞 방향으로 고속 영상 데이터를 보내고, 같은 케이블로 양방향 제어 채널을 함께 둔다.[@adi-max96717-2025][@ti-ds90ub953-q1-2024] 예를 들어 GMSL2 직렬화기 MAX96717은 앞 방향 3 Gbit/s나 6 Gbit/s, 역방향 187.5 Mbit/s로 동작하고[@adi-max96717-2025], FPD-Link III 직렬화기 DS90UB953-Q1은 4.16 Gbit/s의 앞 채널과, GPIO(General-Purpose Input/Output) 같은 제어를 나르는 50 Mbit/s 양방향 제어 채널을 둔다.[@ti-ds90ub953-q1-2024]

링크는 같은 동축 케이블로 전원도 보낼 수 있는데, 이를 **PoC**(Power-over-Coax)라 한다. 링크는 [[cyclic-redundancy-check|CRC]]로 데이터를 보호한다.[@adi-max96717-2025][@ti-ds90ub953-q1-2024]

역직렬화기 하나가 여러 카메라의 직렬화기 링크를 받아 CSI-2로 [[system-on-chip|SoC]]에 넘긴다.[@adi-max96717-2025][@ti-fpd-link-serdes-2026] TI의 FPD-Link SerDes는 카메라 링크를 넷까지 동기를 맞춰 CSI-2 포트 하나로 모은다.[@ti-fpd-link-serdes-2026]

![[diagrams/serdes-deserializer-multi-camera.svg]]

## MIPI CSI-2

**MIPI CSI-2**는 MIPI의 Camera Working Group이 만든, 이미지 센서에서 응용 프로세서로 정지 영상과 동영상을 보내는 고속 프로토콜 명세다. 차량에서는 ADAS와 인포테인먼트에 쓴다.[@mipi-csi-2-2026]

CSI-2는 레인 수로 확장되고, 모든 판은 앞 판과 하위 호환된다.[@mipi-csi-2-2026]

CSI-2는 가상 채널을 32개까지 둘 수 있어, 데이터 타입이 여럿인 이미지 센서와, 차량의 충돌 회피 같은 응용의 다중 노출·다중 거리 센서 융합을 지원한다. CSI-2를 A-PHY 위로 싣는 PAL(protocol adaptation layer)과 [[ieee-1722|IEEE 1722]] 위로 싣는 PAL은 따로 된 명세다.[@mipi-csi-2-2026]

CSI-2는 2005년에 처음 나왔다. v4.0은 차세대 [[automotive-camera|HDR]] 차량용 이미지 센서를 위해 RAW28 픽셀 인코딩을 더했고, 앞 판은 RAW24까지 지원했다. v4.2는 2025년 12월 15일 채택됐고, 2026년 11월 기준 현행판이다.[@mipi-csi-2-2026]

## MIPI A-PHY

**MIPI A-PHY**는 MIPI의 A-PHY Working Group이 만든 차량용 장거리 SerDes 물리 계층 명세다. A-PHY는 ADAS와 자율주행 시스템, 카메라·[[lidar|라이다]]·[[automotive-radar|레이더]] 같은 주변 센서, 인포테인먼트 디스플레이를 잇는 데 겨냥한다.[@mipi-a-phy-2026]

A-PHY는 한 방향의 고속 데이터, 그 안에 실은 양방향 제어 데이터, 선택 사항인 전원 공급을 케이블 한 가닥으로 보내는 비대칭 데이터 링크로, 점대점이나 데이지 체인 토폴로지로 잇는다. 기존 네트워크 백본과 맞물리도록 이더넷, [[can|CAN]], [[flexray|FlexRay]] 같은 인터페이스를 보완한다.[@mipi-a-phy-2026]

A-PHY 링크는 15 m까지 닿는다. A-PHY는 물리 계층의 재전송으로 차량의 전자기 영향에 매우 강하고, 패킷 오류율이 $10^{-19}$로 매우 낮다.[@mipi-a-phy-2026]

A-PHY는 PAL로 CSI-2, DSI-2와 VESA(디스플레이 업계의 개방 표준을 만드는 단체)의 디스플레이 프로토콜을 별도의 소프트웨어 스택 없이 싣고, GPIO와 이더넷 같은 제어 채널도 싣는다.[@mipi-a-phy-2026][@vesa-about-2026]

![[diagrams/a-phy-pal-protocols.svg]]

MIPI는 A-PHY를 바탕으로 카메라, 센서, 디스플레이의 통합을 쉽게 하는 종단 간 연결 틀 MASS(MIPI Automotive SerDes Solutions)를 둔다. MIPI가 펴낸 A-PHY의 판과 판마다의 속도 기어, 바뀐 것은 아래와 같다. 2026년 11월 기준 v2.1이 현행판이다.[@mipi-a-phy-2026]

| 판     | 나온 때     | 속도 기어와 바뀐 것                                                                                                                                                                                                      |
| ------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.0   | 2020년 9월  | 하향 속도 기어 다섯(2, 4, 8, 12, 16 Gbit/s), 상향 100 Mbit/s까지                                                                                                                                                         |
| v1.1   | 2021년 12월 | 하향 속도 기어는 v1.0과 같다. 상향을 최대 200 Mbit/s로 늘렸다. 차폐 이중 차동 쌍 케이블인 Star Quad로 한 케이블에 하향 포트 둘을 두어, 두 포트를 합한 하향 속도를 16 Gbit/s에서 32 Gbit/s로 늘렸다. v1.0과 하위 호환된다 |
| v1.1.1 | 2023년 5월  |                                                                                                                                                                                                                          |
| v2.0   | 2024년 7월  | 지원하는 baud를 4 GBd에서 8 GBd로 늘려 하향 24, 32 Gbit/s 기어를 더했고, 상향 1.6 Gbit/s 기어를 더했다. [[ee-architecture#존 아키텍처\|존 아키텍처]]가 요구하는 커진 대역에 대응했다                                     |
| v2.1   | 2026년 9월  |                                                                                                                                                                                                                          |

![[diagrams/a-phy-downstream-speed-gears.svg]]

IEEE는 2021년 6월 A-PHY v1.0을 IEEE 2977-2021로 채택했고, 2026년 11월 기준 이 표준은 Active Standard다.[@ieee-2977-2021]

## ASA Motion Link

**ASA Motion Link**는 ASA(비대칭 SerDes 기술의 표준화를 위한 차량 기술 기업들의 비영리 업계 연합)가 정하는 차량 내 연결용 비대칭 SerDes 통신 기술로, 물리, 데이터 링크, 전송 계층을 다룬다. ASA는 2019년에 세워졌고, 2020년 12월 v1.01을, 2024년 v2.0을 펴냈다. 판마다 정하거나 더한 것은 아래와 같다.[@asa-about-us-2026]

| 판    | 정하거나 더한 것                                                                                                                                                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| v1.01 | 2\~16 Gbit/s의 다섯 하향 속도 단계, 100 Mbit/s를 넘는 상향 속도, 인라인 커넥터를 4개까지 둔 15 m 동축 채널, 결정적 전달 틀, 효율적인 키 교환을 포함한 보안 틀, 영상과 이더넷 패킷 등을 싣는 ASEP(Application Stream Encapsulation Protocol)[@asa-about-us-2026][@asa-faq-2026] |
| v1.1  | 64 Gbit/s까지 늘린 하향, GPIO를 비롯한 여러 인터페이스용 ASEP[@asa-about-us-2026]                                                                                                                                                                                              |
| v2.0  | ASA Motion Link 물리 계층 위로 이더넷 패킷을 보내는 비대칭 이더넷 기능 ASA-MLE(Motion Link Ethernet)[@asa-about-us-2026][@ieee-802-3dm-par-2024]                                                                                                                               |
| v2.1  | MIPI CSI-2의 네이티브 전송, VESA DSC(Display Stream Compression)[@asa-about-us-2026]                                                                                                                                                                                           |
