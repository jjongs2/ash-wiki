---
title: CAN 비트 스터핑
tags:
  - network/can
verified: 2026-09-27
---

**비트 스터핑**은 [[can|CAN]] 송신 노드가 같은 값의 비트 5개를 보내고 나면, 실제로 송신하는 비트열에 반대 값의 비트를 하나 자동으로 끼워 넣는 부호화 규칙이다.[@bosch-can-2-0-1991] 끼워 넣는 비트를 **스터프 비트**라 하고, 수신 노드는 같은 값 5비트 뒤에 오는 스터프 비트를 버린다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-bit-stuffing.svg]]

## 적용 구간

[[can-frame|데이터 프레임]]과 [[remote-frame|리모트 프레임]]에서는 SOF(Start of Frame), 중재 필드, 제어 필드, 데이터 필드, [[can-crc|CRC]] 시퀀스가 스터핑 대상이다. CRC 구분자, [[can-acknowledgement#ACK 필드|ACK 필드]], EOF(End of Frame)는 모양이 고정된 필드라 스터핑하지 않는다. [[can-error-frame|오류 프레임]]과 [[can-overload-frame|오버로드 프레임]]도 모양이 고정되어 있어 스터핑하지 않는다.[@bosch-can-2-0-1991]

![[diagrams/can-bit-stuffing-range.svg]]

스터프 비트가 들어가는지는 데이터 바이트 패턴에 달려 있어, 예를 들어 `0xCC` 같은 패턴은 스터프 비트를 일으키지 않는다.[@bosch-can-fd-1-0-2012] 스터프 비트가 가장 많이 들어갈 때의 프레임 전송 시간은 [[can-response-time-analysis#전송 시간|CAN 응답 시간 분석]]에서 다룬다.

## 스터프 오류

스터핑 구간에서 같은 값의 비트가 6번째로 이어지면, 그 비트 시점에 **스터프 오류**가 검출된다.[@bosch-can-2-0-1991] 자세한 것은 [[can-error-detection#다섯 가지 오류|CAN 오류 검출]]에서 다룬다.

[[can-fault-confinement|error active]] 노드가 오류를 찾으면 내는 [[can-error-frame#오류 플래그|active 오류 플래그]]는 [[dominant-and-recessive|dominant]] 6비트다. 이 플래그는 SOF부터 CRC 구분자까지에서는 스터핑 규칙을 어기고, ACK 필드나 EOF에서는 고정된 모양을 깨뜨린다. 그래서 다른 노드도 모두 오류를 찾고 각자 오류 플래그를 낸다.[@bosch-can-2-0-1991]

## 목적

CAN 비트열은 NRZ(Non-Return-to-Zero)로 부호화되어, 한 비트 시간 내내 레벨이 dominant나 recessive 하나로 유지된다.[@bosch-can-2-0-1991] NRZ는 데이터에 클록을 싣지 않으므로, 에지가 적어도 6비트 시간마다 생기게 하려고 비트 스터핑을 쓴다.[@microchip-mcp2515-2019] [[iso-11898-1|ISO 11898-1:2024]]는 비트 스터핑을, NRZ 비트 표현에서 주기적 [[can-synchronization#재동기화|재동기화]]에 필요한 버스 상태 변화를 만들어 주는 프레임 부호화 방식으로 정의한다.[@iso-11898-1-obp-2024]

## CAN FD 프레임과의 차이

이 표준은 비트 스터핑을 동적 비트 스터핑과 고정 비트 스터핑 두 가지로 나눈다. 송신 노드가 스터프 비트를 넣고, 수신 노드가 거꾸로 걷어낸다.[@iso-11898-1-obp-2024]

[[can-fd-frame|CAN FD 포맷 프레임]]의 CRC 시퀀스에서는 스터프 비트를 고정 위치에 넣는다. 첫 비트 앞에 하나, 그 뒤로 4비트마다 하나를 넣고, 값은 바로 앞 비트의 반대다. Bosch CAN FD 1.0은 고정 스터프 비트의 수를 classical 포맷의 스터핑 방식을 적용했을 때 생길 수 있는 스터프 비트의 최대 수와 같게 두고, 수신 노드가 CRC를 검사할 때 고정 스터프 비트를 빼고 계산하게 정한다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-crc-fixed-stuff-bits.svg]]

ISO 11898-1:2024는 **stuff bit count**를 CRC 필드 앞까지 프레임에 들어간 스터프 비트의 수(고정 스터프 비트 제외)로 정의한다.[@iso-11898-1-obp-2024] MCP25xxFD 계열 [[can-fd|CAN FD]] 컨트롤러는 ISO CRC 모드에서 CRC 필드에 4비트 stuff bit count를 넣어 보내고, ISO 이전 방식(non-ISO) 모드에서는 넣지 않는다.[@microchip-mcp25xxfd-frm-2020]
