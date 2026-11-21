---
title: ADAS Horizon
tags:
  - applications/adas
aliases:
  - e-horizon
verified: 2026-11-21
---

**ADAS Horizon**은 지도에서 뽑은 차량 앞 도로의 가능한 경로와 그 속성으로, ADASIS(Advanced Driver Assistance Systems Interface Specification)가 바탕으로 삼는 개념이다. ADASIS는 디지털 지도와 [[adas|ADAS]] 사이에서 지리 정보를 주고받는 인터페이스를 정하고, ADAS와 자율주행 응용이 지도 데이터베이스의 데이터를 받게 한다. 이 개념에서 디지털 지도는 바로 보이는 범위 너머의 도로를 미리 알게 하는 예측 센서 구실을 한다. ADASISv3는 HD(High Definition) 지도의 정보를 보내 ADAS와 자율주행을 돕는다.[@adasis-white-paper-2024]

u-blox의 3D Automotive Dead Reckoning 솔루션은 GNSS(Global Navigation Satellite System) 수신기에 바퀴 속도 센서·자이로·가속도계의 입력을 더해, 위성 신호가 나쁘거나 없는 곳에서도 dead reckoning으로 위치를 이어 간다.[@ublox-3d-dead-reckoning-2014][@euspa-what-is-gnss-2026]

## 쓰는 곳

ADASIS 백서에 따르면 백서가 나온 2024년 무렵 ADASISv2는 Predictive Powertrain Control, Predictive Cruise Control, overspeed warning, intelligent speed limit assist, overtaking assist, predictive [[adas#기능|ACC]] 같은 기본 ADAS 기능에 쓰였다. ADASISv3는 2022년 중반부터 일부 OEM의 [[levels-of-driving-automation|운전 자동화 레벨]] 3 양산차에 쓰였다.[@adasis-white-paper-2024]

EU 규정 2019/2144는 [[adas#EU 규정|ISA]]의 피드백이 도로 표지와 신호를 관찰하거나, 차 안에서 받는 인프라 신호나 전자 지도 데이터, 또는 둘 다에서 얻은 속도 제한 정보에 근거하게 한다.[@eu-2019-2144-2026]

## 동작

ADASIS에서는 ADASIS Horizon Provider(AHP)가 지도에서 도로망을 지나는 하나 이상의 가능한 경로(path)를 계산해 경로 트리로 만들고, 그 경로 트리와 속성을 차량 앞 정해진 범위까지 보낸다. 이 범위는 [[automotive-camera|카메라]] 같은 센서의 범위보다 훨씬 멀리 닿을 수 있다. AHP는 차량 위치를 보낸 경로 트리에 map matching해 경로 위의 위치도 함께 준다. 응용 쪽의 ADASIS Horizon Reconstructor(AHR)는 받은 메시지를 해석해 Horizon의 사본을 다시 만든다.[@adasis-white-paper-2024]

![[diagrams/adasis-horizon-provider-reconstructor.svg]]

경로 트리에는 도로 위상의 기본 정보만 담고, 속도 제한, 도로 시설물, localization 객체 같은 정보는 경로마다 ADASIS profile로 붙인다. profile의 종류는 [[electronic-control-unit|ECU]]마다 그 처리 능력에 맞게 고를 수 있어, 처리 능력이 낮은 ECU는 곡률과 속도 제한만, 높은 ECU는 차로 수준 정보까지 받게 할 수 있다.[@adasis-white-paper-2024]

![[diagrams/adas-horizon-path-tree-profiles.svg]]

ADASISv2는 [[can|CAN]] 버스를 쓰는 시스템을 겨냥한 프로토콜로, 적은 수의 메시지로 차량 주변 전체와 앞 몇 km를 기술한다. ADASISv2는 브로드캐스트 프로토콜이라 메시지가 전달되지 않았는지 감지하지 못해, provider와 reconstructor 사이의 신뢰성 있는 통신을 보장하지 못한다. ADASISv3는 IP 기반 프로토콜로 HD 지도의 차로 수준 정보를 보낸다. ADASISv3에서는 auxiliary horizon provider가 차량 센서나 교통 정보·[[v2x|V2X]] 같은 외부 소스의 데이터를 Horizon에 더할 수 있다.[@adasis-white-paper-2024]

백서가 나온 2024년 무렵 ADASISv3 프로토콜은 [[osi-model|OSI 참조 모델]]의 응용 계층(7계층)에 정의되어 있었다. ADASISv3는 특정 운영체제나 미들웨어에 매이지 않아 [[autosar-classic-platform|AUTOSAR Classic Platform]]·[[autosar-adaptive-platform|Adaptive Platform]]이나 자체 미들웨어에서 쓸 수 있고, 차량 안의 [[some-ip|SOME/IP]]나, 클라우드에서 바로 오는 REST API·보안 WebSocket 위에서도 쓸 수 있다. 필요한 대역폭은 기본 지도 지원과 짧은 Horizon에서 평균 1 kB/s 미만이고, 긴 Horizon과 많은 profile 종류에서는 10 kB/s 이상으로 늘 수 있다.[@adasis-white-paper-2024]

## HD 지도와 NDS

자율주행용 HD 지도는 차로 수준의 데이터와, 차량이 자기 위치를 정밀하게 찾는 데 쓰는 localization 데이터를 담는다.[@adasis-white-paper-2024][@nds-website-2026] ADASIS 백서에 따르면 HD 지도는 차로, 차로 표시, 기둥, localization 객체 같은 교통 관련 객체의 좌표를 cm 수준의 정확도로 담는다. SD(Standard Definition) 지도는 이를테면 도로 중심선 수준으로 디지털화한 지도다.[@adasis-white-paper-2024]

NDS(Navigation Data Standard)는 차량 생태계의 지도 데이터 표준으로, 그 명세는 데이터 모델, 저장 포맷, 인터페이스, 프로토콜을 다룬다. NDS는 차량 내비게이션과 ADAS·e-horizon 안전 시스템, 자율주행 등에 쓴다. 표준화 작업은 독일 법에 따른 법인인 NDS Association이 맡는다. 다음 세대인 NDS.Live는 지도 데이터를 타일로, 또는 주행 경로나 지점 단위로 내줄 수 있고, 클라우드에 연결된 동적 데이터와 바뀐 것만 데이터 연결로 갱신하는 것을 지원한다.[@nds-website-2026]

## 측위

u-blox 백서에 따르면 터널과 주차장은 GNSS 신호를 완전히 막고, 고가도로와 다층 도로는 수신기가 어느 도로에 있는지 헷갈리게 하며, 도심 협곡에서 일부만 오거나 반사된 신호(multipath)는 수신기가 다른 곳에 있다고 여기게 한다.[@ublox-3d-dead-reckoning-2014]

dead reckoning은 마지막으로 안 위치에서 얼마나, 어느 방향으로 움직였는지로 위치를 계산한다. 바퀴 tick으로 거리를, 요 레이트 자이로로 방향을 알아내고, 직교하게 둔 세 가속도계로 차량의 피치를 계산해 거리와 함께 고도 변화를 구한다. 좌우 바퀴의 tick만 보아도 거리와 방향을 얻을 수 있다. u-blox의 3D Automotive Dead Reckoning 솔루션은 GNSS 수신이 좋을 때 차량 센서의 측정을 계속 보정해 두었다가, 신호가 나쁘거나 없는 곳에서는 센서 입력으로 위치를 이어 간다.[@ublox-3d-dead-reckoning-2014]

차량 내비게이션의 map matching은 위치를 언제나 실제 도로 위에 보고하는데, 겹친 다층 도로에서는 어느 도로를 달리는지 가리기 어렵다. 3D dead reckoning이 주는 고도 정보가 이를 가리게 돕는다.[@ublox-3d-dead-reckoning-2014]

ADASIS 백서에 따르면 차량을 자동으로 제어하려면 30 cm 미만의 위치 정확도가 필요하고, 이 정확도는 GNSS와 차량 센서(속도, 자이로, IMU(Inertial Measurement Unit))에 기댄 기존 측위로는 얻지 못한다. HD 지도의 차로 표시, 도로 시설물, localization 객체를 카메라·[[lidar|라이다]]로 본 것과 맞추면, GNSS와 IMU를 함께 쓸 때보다 훨씬 정확하게 지도 위의 위치를 정할 수 있다.[@adasis-white-paper-2024]

## ADASIS

ADASIS는 2018년 5월 벨기에 법에 따른 비영리 국제 협회로 세워져 ERTICO(유럽 안팎에서 지능형 교통 시스템의 혁신·연구·보급을 앞당기는 민관 협력 단체)의 Innovation Platform이 되었다.[@adasis-aisbl-2026][@ertico-about-2026] ERTICO 산업 파트너들은 2002년 ADASIS를 포럼으로 세웠다. ADASIS는 2010년에 ADASISv2를 냈고, 2018년 11월 ADASISv3 첫 판을 회원에게 낸 뒤 2020년 10월 공개했다.[@adasis-white-paper-2024]
