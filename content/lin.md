---
title: LIN
tags:
  - network
aliases:
  - Local Interconnect Network
verified: 2026-09-29
---

**LIN**(Local Interconnect Network)은 UART(Universal Asynchronous Receiver/Transmitter) 기반의 저속 네트워크다.[@iso-17987-1-obp-2025] LIN은 차량 ECU를 잇는 저비용 네트워크로 선 하나로 최대 20 kbit/s로 통신하고[@iso-17987-4-obp-2025], 네트워크에 하나뿐인 commander 노드가 프레임을 스케줄한다.[@iso-17987-1-obp-2025] 매체와 비트율은 [[vehicle-bus|차량 버스]]에서 다룬다.

LIN 컨소시엄이 LIN 명세를 처음 개발했고, LIN은 2016년부터 ISO 17987 시리즈로 국제 표준이 되었다.[@cia-lin-standards-2026][@ti-slla383a-2022] LIN은 [[can|CAN]] 같은 상위 네트워크 아래에서 CAN의 대역폭이 필요 없는 장치를 잇는 하위 네트워크로 쓰인다.[@ti-slla383a-2022][@freescale-brinvehiclenet-2006] Freescale 브로셔에 따르면 LIN은 차량의 모터, 스위치, 센서, 램프를 싸게 잇는 네트워크다.[@freescale-brinvehiclenet-2006]

SAE J2602-1:2021은 LIN 구현에 관한 SAE의 권장 관행(recommended practice)이며, ISO 17987:2016에 바탕을 두고 [[fault-tolerance|결함 허용]] 동작이나 네트워크 토폴로지처럼 ISO 17987:2016에 없는 요구를 더한다.[@sae-j2602-1-2021] SAE J2602-1:2012는 ISO 17987이 아니라 LIN 2.0에 바탕을 두었고, LIN 2.0의 요구 가운데 모호하거나 서로 어긋나거나 선택 사항인 것을 정했다.[@sae-j2602-1-2021][@sae-j2602-1-2012]

## Commander와 responder

**commander**는 LIN 네트워크에 하나뿐인 노드로, 프레임을 스케줄하고 백본 네트워크에도 연결된다. commander 태스크는 스케줄 테이블에 따라 모든 헤더를 버스에 보내고, responder 태스크는 헤더를 듣고 그에 맞춰 응답을 보내거나 받거나 무시한다. 스케줄 테이블은 보낼 프레임과 그 순서, 프레임 사이의 시간 간격을 정한다.[@iso-17987-1-obp-2025] ISO 17987-1:2016은 commander와 responder를 master와 slave라 불렀고, 2025년판에서 지금 이름으로 바뀌었다.[@iso-17987-1-obp-2025][@iso-17987-1-obp-2016]

## 프레임

LIN 프레임은 헤더와 응답으로 이뤄진다. 헤더는 늘 commander가 보내며, break 필드, sync 바이트 필드, PID(Protected Identifier)로 이뤄진다. 응답은 헤더 뒤에 오는 부분이다.[@iso-17987-3-obp-2025]

![[diagrams/lin-header-response.svg]]

break 필드는 LIN 프레임의 시작을 알린다.[@iso-17987-3-obp-2025] break 필드는 dominant 부분(break)과 recessive 부분(break delimiter)으로 이뤄지고[@iso-17987-1-obp-2025], break는 적어도 13비트 길이의 dominant 구간이다.[@ti-slla383a-2022][@atmel-avr308-2002] sync 바이트 필드는 값이 `0x55`로 정해진 바이트 필드다. PID는 6비트 프레임 ID와 2비트 패리티로 이뤄진 8비트 값이다. 응답의 데이터는 1\~8바이트다.[@iso-17987-3-obp-2025] 프레임 끝에는 [[checksum|체크섬]] 1바이트가 붙는다.[@iso-17987-1-obp-2025]

TMS320F2803x의 LIN 모듈은 PID의 [[parity-bit|패리티 비트]] 두 개를 프레임 ID 비트의 XOR로 계산한다. 패리티 비트 $P_0$은 ID 비트 0, 1, 2, 4의 XOR이고, $P_1$은 ID 비트 1, 3, 4, 5의 XOR을 반전한 값이다.[@ti-sprui10a-2022]

$$P_0 = \mathrm{ID}_0 \oplus \mathrm{ID}_1 \oplus \mathrm{ID}_2 \oplus \mathrm{ID}_4$$

$$P_1 = \overline{\mathrm{ID}_1 \oplus \mathrm{ID}_3 \oplus \mathrm{ID}_4 \oplus \mathrm{ID}_5}$$

바이트 필드는 dominant start 비트, 최하위 비트부터 보내는 8비트 페이로드, recessive stop 비트로 된 10비트 단위다.[@iso-17987-1-obp-2025]

![[diagrams/lin-header-fields.svg]]

## 동기화

responder는 sync 바이트 필드 패턴의 하강 에지로 commander의 비트 타이밍에 동기화하고, 이로 비트 폭을 잴 수 있다.[@ti-slla383a-2022][@atmel-avr308-2002] responder는 sync로 commander에 맞추므로 수정 발진기 없이 동작할 수 있다.[@ti-slla383a-2022][@freescale-brinvehiclenet-2006] TI 앱노트에 따르면 LIN 노드는 값싼 온칩 발진기를 쓰며, 비트율 허용 오차가 ±14%인 것은 이 때문이다.[@ti-slla383a-2022] 선 하나만 쓰고 responder가 수정 발진기 없이 동기화하므로 LIN은 싸게 구현할 수 있다.[@ti-slla383a-2022][@atmel-avr308-2002]

## 체크섬

LIN 체크섬은 바이트를 더할 때마다 올림수를 최하위 비트에 다시 더한 8비트 합을 반전한 값이다.[@atmel-avr308-2002][@ti-sprui10a-2022] **classic 체크섬**은 데이터 바이트만 계산에 넣는다.[@iso-17987-3-obp-2025] **enhanced 체크섬**은 데이터 바이트와 PID를 함께 계산에 넣는다.[@ti-sprui10a-2022][@microchip-an1099-2007] 진단 프레임은 classic 체크섬을 쓴다.[@iso-17987-3-obp-2025]

TMS320F2803x의 LIN 모듈은 받은 데이터 바이트(enhanced 체크섬이면 ID 바이트 포함)와 체크섬 바이트를 올림수와 함께 더한 합이 `0xFF`가 아니면 체크섬 오류로 표시한다.[@ti-sprui10a-2022]

## 프레임 종류

TMS320F2803x의 LIN 모듈은 프레임 ID 0\~59를 신호를 싣는 프레임으로 다룬다.[@ti-sprui10a-2022] Microchip AN1099의 LIN 드라이버는 진단 프레임에 ID 60(`0x3C`)과 61(`0x3D`)을 쓴다.[@microchip-an1099-2007]

**unconditional 프레임**은 신호를 싣고, 할당된 프레임 슬롯에서 늘 전송된다. **event-triggered 프레임**은 여러 responder 노드가 같은 헤더에 응답할 수 있게 하는 프레임이다. **sporadic 프레임**은 한 스케줄 슬롯에 할당된 unconditional 프레임의 묶음이고, commander가 보낸다.[@iso-17987-3-obp-2025] Microchip AN1099에 따르면 event-triggered 프레임의 헤더에는 관련 프레임의 데이터가 바뀐 responder만 응답하고, 둘 이상이 응답하면 충돌이 난다. sporadic 프레임의 슬롯은 갱신된 데이터가 없으면 비워 둔다.[@microchip-an1099-2007]

## 물리 계층

TI 앱노트에 따르면 LIN 버스는 배터리 전압 쪽으로 풀업되어 트랜시버가 꺼져 있으면 recessive이고, 트랜시버가 버스를 접지 가까이 끌어내리면 dominant가 된다. 수신기는 버스 전압 $V_\mathrm{bus}$와 배터리 전압 $V_\mathrm{BAT}$가 $V_\mathrm{bus} \le 0.4\,V_\mathrm{BAT}$이면 dominant, $V_\mathrm{bus} \ge 0.6\,V_\mathrm{BAT}$이면 recessive로 읽는다. commander 노드는 흔히 1 kΩ 저항과 역극성 보호 다이오드를 직렬로 두어 배터리 전압에 풀업하고, responder 노드의 풀업은 보통 30 kΩ이며 트랜시버에 내장된다.[@ti-slla383a-2022]

![[diagrams/lin-receiver-threshold.svg]]

MCP2003B도 $V_\mathrm{bus} \le 0.4\,V_\mathrm{BAT}$이면 dominant, $V_\mathrm{bus} \ge 0.6\,V_\mathrm{BAT}$이면 recessive로 읽는다. MCP2003B는 배터리 공급 핀과 버스 핀 사이에 약 30 kΩ 풀업을 내장하고, 데이터시트의 응용 예는 commander 노드에만 1 kΩ 풀업을 둔다.[@microchip-mcp2003b-2016]

## 슬립과 웨이크업

commander는 go-to-sleep 명령으로 responder 노드를 버스 슬립 상태로 보낸다.[@iso-17987-3-obp-2025] 슬립 중인 클러스터에서는 어느 노드든 웨이크업 신호를 보내 슬립을 끝낼 수 있다. 웨이크업 요청은 `0xF0` 바이트를 보내 만드는, 비트율에 따라 250 µs\~5 ms 길이의 dominant 펄스다.[@ti-sprui10a-2022][@microchip-an1099-2007]

## CAN과의 차이

LIN은 CAN보다 느리고 성능이 낮다.[@ti-slla383a-2022][@atmel-avr308-2002]
