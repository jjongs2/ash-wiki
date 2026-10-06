---
title: CAN 상위 계층 프로토콜
tags:
  - network/can
verified: 2026-10-06
---

[[iso-11898-1|ISO 11898-1:2024]]는 **상위 계층 프로토콜**(HLP, Higher-Layer Protocol)을 데이터 링크 계층 프로토콜 위의 프로토콜로 정의하고, [[osi-model|OSI 모델]]의 전송 계층 프로토콜이나 네트워크 계층 프로토콜을 예로 든다. [[can|CAN]]을 규정하는 ISO 11898 시리즈는 데이터 링크 계층 위의 OSI 계층을 정하지 않는다.[@iso-11898-1-obp-2024]

## 표준화된 HLP

CiA에 따르면 표준화된 CAN 기반 HLP 스택은 대개 응용 계층과 전송 계층을 구현하고, 표현·세션·네트워크 계층의 기능도 일부 갖는다.[@cia-standardized-hlp-2026]

![[diagrams/can-hlp-osi-layers.svg]]

CiA는 가장 중요한 표준화된 HLP로 다음을 든다.[@cia-standardized-hlp-2026]

| HLP                              | 바탕                                   | 쓰임                  |
| -------------------------------- | -------------------------------------- | --------------------- |
| [[canopen\|CANopen]] CC(CiA 301) | CAN CC(classic)                        | 범용 내장 실시간 제어 |
| CANopen FD(CiA 1301)             | [[can-fd\|CAN FD]], [[can-xl\|CAN XL]] | 내장 실시간 제어      |
| [[j1939\|J1939]] 응용 프로파일   | CAN CC, CAN FD                         | 여러 분야             |
| DeviceNet 프로파일               | CAN CC                                 | 공장 자동화           |
| UAVCAN(Cyphal), DroneCAN         |                                        | 무인 항공기           |

승용차 산업의 응용 계층은 대개 독자 규격이다. 예외로는 [[iso-15765-2|ISO 15765-2]]로 표준화된 CAN 전송 계층, 진단 서비스인 [[uds|UDS]], CiA 447 CANopen 응용 프로파일 시리즈가 정한 부가 장치용 개방 네트워크가 있다.[@cia-standardized-hlp-2026]

CiA에 따르면 DeviceNet은 ODVA의 상표로, 공장 자동화에서 PLC(Programmable Logic Controller) 같은 컨트롤러와 산업용 I/O 장치, 전기 드라이브, HMI(Human Machine Interface)를 잇는 데 주로 쓰인다. CAN CC 데이터 링크 계층을 바탕으로 하고, IEC 62026-3으로 국제 표준이 되었다.[@cia-devicenet-2026]

DeviceNet은 데이터 링크 계층에 CAN을 고치지 않고 그대로 쓰고, CAN이 정한 프레임 종류 가운데 주로 [[can-frame|데이터 프레임]]을 쓴다. 세션 계층과 그 위(OSI 5\~7계층)에는 ODVA의 CIP(Common Industrial Protocol)를 쓴다. 노드는 64개까지 지원하고, 굵은 원형 케이블(thick round cable)로 잇는 네트워크의 끝에서 끝까지 길이는 125 kbit/s에서 500 m, 250 kbit/s에서 250 m, 500 kbit/s에서 100 m까지다.[@odva-pub00026-2021]

CiA에 따르면 드론 커뮤니티는 2022년 전에 UAVCAN으로 알려졌던 오픈 소스 HLP Cyphal을 만들었고, 이는 응용 계층이다. DroneCAN은 UAVCAN v0 프로토콜의 개발을 잇고자 만들어졌고, ArduPilot과 PX4 프로젝트가 CAN 주변 장치와 통신하는 데 쓴다.[@cia-uavcan-dronecan-2026] DroneCAN 명세는 classical CAN 버스와 CAN FD 버스 위의 전송 계층을 따로 정한다.[@dronecan-can-transport-2025][@dronecan-canfd-transport-2025]

## 역사

CiA에 따르면 스웨덴의 Kvaser가 섬유 기계 제조사들과 함께 1989년까지 만든 통신 원칙은 1990년대 초 개발 환경 CAN Kingdom의 틀을 잡는 데 도움을 주었다. CAN Kingdom은 OSI 참조 모델의 응용 계층은 아니지만 CAN 기반 HLP의 조상으로 볼 수 있다. Philips Medical Systems의 PMS(Philips Message Specification)는 CAN 네트워크의 첫 응용 계층이었다.[@cia-can-history-2026]

CiA가 처음 맡은 일 가운데 하나는 CAN 응용 계층을 정하는 것이었고, Philips Medical Systems와 STZP(Steinbeis Transfer Center for Process Automation)의 자료를 바탕으로 'Green Book'이라고도 부른 CAL(CAN Application Layer)을 만들었다. CAL은 순수한 응용 계층이라 사용자마다 새 프로파일을 설계해야 했고, 현장에서 널리 받아들여지지 못했다. 그 뒤 CAL을 바탕으로 한 CANopen이 나왔다.[@cia-can-history-2026]
