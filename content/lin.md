---
title: LIN
tags:
  - network/vehicle-bus
aliases:
  - Local Interconnect Network
verified: 2026-09-29
---

**LIN**(Local Interconnect Network)은 [[serial-communication|UART]] 기반의 저속 네트워크다.[@iso-17987-1-obp-2025] LIN은 차량 ECU를 잇는 저비용 네트워크로 선 하나로 최대 20 kbit/s로 통신하고[@iso-17987-4-obp-2025], 네트워크에 하나뿐인 commander 노드가 프레임을 스케줄한다.[@iso-17987-1-obp-2025] 매체와 비트율은 [[vehicle-bus|차량 버스]]에서 다룬다.

LIN 컨소시엄이 LIN 명세를 처음 개발했다.[@cia-lin-standards-2026][@ti-slla383a-2022] CiA에 따르면 LIN 컨소시엄은 LIN 2.0을 2003년에, LIN 2.1을 2006년에 냈다. LIN 2.2A는 컨소시엄이 닫힌 뒤인 2010년에 나왔지만 가장 많이 구현된 판 가운데 하나다.[@cia-lin-standards-2026] LIN은 2016년부터 ISO 17987 시리즈로 국제 표준이 되었다.[@cia-lin-standards-2026][@ti-slla383a-2022] LIN은 [[can|CAN]] 같은 상위 네트워크 아래에서 CAN의 대역폭이 필요 없는 장치를 잇는 하위 네트워크로 쓰인다.[@ti-slla383a-2022][@freescale-brinvehiclenet-2006] Freescale 브로셔에 따르면 LIN은 차량의 모터, 스위치, 센서, 램프를 싸게 잇는 네트워크다.[@freescale-brinvehiclenet-2006]

SAE J2602-1은 2004년에 처음 나왔다. SAE J2602-1:2021은 LIN 구현에 관한 SAE의 권장 관행(recommended practice)이며, ISO 17987:2016에 바탕을 두고 [[fault-tolerance|결함 허용]] 동작이나 네트워크 토폴로지처럼 ISO 17987:2016에 없는 요구를 더한다.[@sae-j2602-1-2021] SAE J2602-1:2012는 ISO 17987이 아니라 LIN 2.0에 바탕을 두었고, LIN 2.0의 요구 가운데 모호하거나 서로 어긋나거나 선택 사항인 것을 정했다.[@sae-j2602-1-2021][@sae-j2602-1-2012]

## ISO 17987 시리즈

ISO 17987-1:2025는 LIN 프로토콜의 주요 특성으로 [[signal-based-communication|시그널 기반 통신]], 스케줄 테이블에 따른 프레임 전송, 오류 검출을 갖춘 commander/responder 통신, 노드 구성과 진단 서비스 전송을 들고, 쓰임의 예로 도어 모듈과 공조 시스템을 든다.[@iso-17987-1-obp-2025] 이 표준은 시리즈의 1\~7부를, ISO 17987-8:2019는 8부를 아래처럼 제시한다.

| 문서           | 다루는 것                                                                             |
| -------------- | ------------------------------------------------------------------------------------- |
| ISO 17987-1    | 일반 정보와 use case 정의[@iso-17987-1-obp-2025]                                      |
| ISO 17987-2    | 전송 프로토콜과 네트워크 계층 서비스[@iso-17987-1-obp-2025]                           |
| ISO 17987-3    | 프로토콜 명세[@iso-17987-1-obp-2025]                                                  |
| ISO 17987-4    | 12 V/24 V 전기 물리 계층 명세[@iso-17987-1-obp-2025]                                  |
| ISO/TR 17987-5 | API와 노드 구성·식별 서비스[@iso-17987-1-obp-2025]                                    |
| ISO 17987-6    | 프로토콜 적합성 시험 명세[@iso-17987-1-obp-2025]                                      |
| ISO 17987-7    | 전기 물리 계층 적합성 시험 명세[@iso-17987-1-obp-2025]                                |
| ISO 17987-8    | DC(direct current) 전원선 전기 물리 계층과 그 적합성 시험 계획[@iso-17987-8-obp-2019] |

## Commander와 responder

**commander**는 LIN 네트워크에 하나뿐인 노드로, 프레임을 스케줄하고 백본 네트워크에도 연결된다. commander 태스크는 스케줄 테이블에 따라 모든 헤더를 버스에 보내고, responder 태스크는 헤더를 듣고 그에 맞춰 응답을 보내거나 받거나 무시한다. 스케줄 테이블은 보낼 프레임과 그 순서, 프레임 사이의 시간 간격을 정한다.[@iso-17987-1-obp-2025] ISO 17987-1:2016은 commander와 responder를 master와 slave라 불렀고, 2025년판에서 지금 이름으로 바뀌었다.[@iso-17987-1-obp-2025][@iso-17987-1-obp-2016] 2025년에는 ISO 17987-1, -2, -3, -4, -6, -7이 함께 2판으로 나와 각각 2016년 1판을 대체했고, 부마다 노드 이름 master와 slave를 commander와 responder로 바꿨다.[@iso-17987-1-obp-2025][@iso-17987-4-obp-2025][@iso-17987-2-obp-2025][@iso-17987-3-obp-2025][@iso-17987-6-obp-2025][@iso-17987-7-obp-2025]

TI 앱노트에 따르면 **클러스터**는 케이블로 이어진 LIN 노드의 묶음이고, commander 하나와 responder들로 이뤄진다. commander가 버스의 모든 통신을 다스리므로 commander가 고장 나면 클러스터 전체가 멈춘다. 이것이 느린 메시지 속도와 함께 LIN이 안전 관련 응용에 쓰이지 않는 까닭이다.[@ti-slla383a-2022]

## 프레임

LIN 프레임은 헤더와 응답으로 이뤄진다. 헤더는 늘 commander가 보내며, break 필드, sync 바이트 필드, PID(Protected Identifier)로 이뤄진다. 응답은 헤더 뒤에 오는 부분이다.[@iso-17987-3-obp-2025]

![[diagrams/lin-header-response.svg]]

break 필드는 LIN 프레임의 시작을 알린다.[@iso-17987-3-obp-2025] break 필드는 dominant 부분(break)과 recessive 부분(break delimiter)으로 이뤄지고[@iso-17987-1-obp-2025], break는 적어도 13비트 길이의 dominant 구간이다.[@ti-slla383a-2022][@atmel-avr308-2002] sync 바이트 필드는 값이 `0x55`로 정해진 바이트 필드다. PID는 6비트 프레임 ID와 2비트 패리티로 이뤄진 8비트 값이다. 응답의 데이터는 1\~8바이트다.[@iso-17987-3-obp-2025] 프레임 끝에는 [[checksum|체크섬]] 1바이트가 붙는다.[@iso-17987-1-obp-2025]

바이트 필드는 dominant start 비트, 최하위 비트부터 보내는 8비트 페이로드, recessive stop 비트로 된 10비트 단위다.[@iso-17987-1-obp-2025]

![[diagrams/lin-header-fields.svg]]

TMS320F2803x의 LIN 모듈은 PID의 [[parity-bit|패리티 비트]] 두 개를 프레임 ID 비트의 XOR로 계산한다. 패리티 비트 $P_0$은 ID 비트 0, 1, 2, 4의 XOR이고, $P_1$은 ID 비트 1, 3, 4, 5의 XOR을 반전한 값이다.[@ti-sprui10a-2022]

$$
P_0 = \mathrm{ID}_0 \oplus \mathrm{ID}_1 \oplus \mathrm{ID}_2 \oplus \mathrm{ID}_4
$$

$$
P_1 = \overline{\mathrm{ID}_1 \oplus \mathrm{ID}_3 \oplus \mathrm{ID}_4 \oplus \mathrm{ID}_5}
$$

## 동기화

responder는 sync 바이트 필드 패턴의 하강 에지로 commander의 비트 타이밍에 동기화하고, 이로 비트 폭을 잴 수 있다.[@ti-slla383a-2022][@atmel-avr308-2002] responder는 sync로 commander에 맞추므로 수정 발진기 없이 동작할 수 있다.[@ti-slla383a-2022][@freescale-brinvehiclenet-2006] TI 앱노트에 따르면 LIN 노드는 값싼 온칩 발진기를 쓰므로 비트율 허용 오차가 ±14%이고, 이 정확도로 break를 알아챈 뒤 sync 바이트 필드로 타이밍을 보정해 메시지를 주고받는다.[@ti-slla383a-2022] 선 하나만 쓰고 responder가 수정 발진기 없이 동기화하므로 LIN은 싸게 구현할 수 있다.[@ti-slla383a-2022][@atmel-avr308-2002]

## 체크섬

LIN 체크섬은 바이트를 더할 때마다 올림수를 최하위 비트에 다시 더한 8비트 합을 반전한 값이다.[@atmel-avr308-2002][@ti-sprui10a-2022] **classic 체크섬**은 데이터 바이트만 계산에 넣는다.[@iso-17987-3-obp-2025] **enhanced 체크섬**은 데이터 바이트와 PID를 함께 계산에 넣는다.[@ti-sprui10a-2022][@microchip-an1099-2007] ISO 17987-3:2025는 classic 체크섬을 진단 프레임과 프로토콜 1.x 판 노드의 프레임에 쓴다고 제시하고, enhanced 체크섬을 그 밖의 모든 프레임에 쓰는 체크섬 모델로 정의한다.[@iso-17987-3-obp-2025]

TMS320F2803x의 LIN 모듈은 받은 데이터 바이트(enhanced 체크섬이면 ID 바이트 포함)와 체크섬 바이트를 올림수와 함께 더한 합이 `0xFF`가 아니면 체크섬 오류로 표시한다.[@ti-sprui10a-2022]

## 프레임 종류

TMS320F2803x의 LIN 모듈은 프레임 ID 0\~59를 신호를 싣는 프레임으로 다룬다.[@ti-sprui10a-2022] Microchip AN1099의 LIN 드라이버는 진단 프레임에 ID 60(`0x3C`)과 61(`0x3D`)을 쓴다.[@microchip-an1099-2007] ISO 17987-3:2025는 진단 프레임을 commander 노드가 보내는 commander request frame(CRF)과 responder 노드 하나가 보내는 responder response frame(RRF)으로 둔다.[@iso-17987-3-obp-2025]

**unconditional 프레임**은 신호를 싣고, 할당된 프레임 슬롯에서 늘 전송된다. **event-triggered 프레임**은 여러 responder 노드가 같은 헤더에 응답할 수 있게 하는 프레임이다. **sporadic 프레임**은 한 스케줄 슬롯에 할당된 unconditional 프레임의 묶음이고, 헤더와 응답을 모두 commander가 보낸다.[@iso-17987-3-obp-2025] Microchip AN1099에 따르면 event-triggered 프레임의 헤더에는 관련 프레임의 데이터가 바뀐 responder만 응답하고, 둘 이상이 응답하면 충돌이 난다. sporadic 프레임의 슬롯은 갱신된 데이터가 없으면 비워 둔다.[@microchip-an1099-2007]

## 전송 계층

ISO 17987-2:2025는 LIN의 전송 프로토콜과 네트워크 계층 서비스를 정하고, 이 전송 프로토콜은 확인 응답 없는(unconfirmed) 통신이다. 전송 계층은 하나 이상의 프레임에 담긴 데이터를 나르며, 전송 계층 메시지는 진단 프레임에 실린다. 이 전송 계층은 백본 버스(예: CAN)에서 진단하는 시스템이 같은 진단 기능을 LIN 하위 클러스터에도 쓰려는 경우를 겨냥한다. 메시지는 [[iso-15765-2|ISO 15765-2]]의 메시지와 같고, 메시지를 나르는 [[osi-model#서비스와 프로토콜|PDU]]도 그와 매우 비슷하다.[@iso-17987-2-obp-2025]

## 노드 구성과 식별

ISO 17987-3:2025는 ISO 14229-7([[uds#문서 구성|UDSonLIN]])에 기반한 노드 구성·식별 서비스(서비스 식별자 `0xB0`\~`0xB8`)를 핵심 프로토콜 명세에 넣는다. **LIN product identification**은 responder 노드의 공급자, 기능, 변형 식별을 담은 번호다.[@iso-17987-3-obp-2025] 2026년 10월 기준 CiA는 ISO를 대신해 LIN Supplier ID를 배정하고 자기 LIN 사이트에 공개한다.[@cia-lin-about-us-2026]

ISO 17987-1:2025는 **node address for diagnostics**를 responder마다 배정한 진단 주소로 정의한다.[@iso-17987-1-obp-2025] ISO 17987-2:2025는 NAD(node address)에 관한 용어 넷을 정의한다. **broadcast NAD**는 값이 `0x7F`이고 모든 responder 노드가 받아 처리하는 요청에 쓰며, **functional NAD**는 값이 `0x7E`이고 진단 요청을 브로드캐스트하는 데 쓴다. **configured NAD**는 responder 노드마다 배정하는 `0x01`\~`0x7D` 범위의 값이고, **initial NAD**는 같은 범위의 고정값이다.[@iso-17987-2-obp-2025]

이 표준은 configured NAD 정의의 첫째 주석에서, configured NAD의 배정은 [[signal-based-communication#통신 기술 파일|LDF]]에 정하고 configured NAD는 노드 구성·식별 서비스와 ISO 14229-7의 [[uds|UDS]] 서비스에 쓴다고 제시한다. 둘째 주석에서는 통신을 시작할 때 responder 노드들의 configured NAD가 같아도 되고, commander 노드는 진단 통신을 시작하기 전에 모든 responder 노드에 서로 다른 configured NAD를 배정해야 한다고 정한다.[@iso-17987-2-obp-2025]

ISO 17987-3:2025는 auto addressing을 새로 넣었다.[@iso-17987-3-obp-2025] TI 앱노트에 따르면 auto addressing은 LIN 버스에서 responder 노드의 위치를 자동으로 알아내 장치마다 고유 ID를 배정하는 일이다.[@ti-slda038-2015]

## 물리 계층

TI 앱노트에 따르면 LIN 버스는 배터리 전압 쪽으로 풀업되어 트랜시버가 꺼져 있으면 recessive이고, 트랜시버가 버스를 접지 가까이 끌어내리면 dominant가 된다. 수신기는 버스 전압 $V_\mathrm{bus}$와 배터리 전압 $V_\mathrm{BAT}$가 $V_\mathrm{bus} \le 0.4\,V_\mathrm{BAT}$이면 dominant, $V_\mathrm{bus} \ge 0.6\,V_\mathrm{BAT}$이면 recessive로 읽는다. commander 노드는 흔히 1 kΩ 저항과 역극성 보호 다이오드를 직렬로 두어 배터리 전압에 풀업하고, responder 노드의 풀업은 보통 30 kΩ이며 트랜시버에 내장된다.[@ti-slla383a-2022]

![[diagrams/lin-receiver-threshold.svg]]

MCP2003B도 $V_\mathrm{bus} \le 0.4\,V_\mathrm{BAT}$이면 dominant, $V_\mathrm{bus} \ge 0.6\,V_\mathrm{BAT}$이면 recessive로 읽는다. MCP2003B는 배터리 공급 핀과 버스 핀 사이에 약 30 kΩ 풀업을 내장하고, 데이터시트의 응용 예는 commander 노드에만 1 kΩ 풀업을 둔다.[@microchip-mcp2003b-2016]

ISO 17987 시리즈의 8부인 ISO 17987-8:2019는 LIN 상위 계층에 영향을 주지 않고 DC 전원선으로 전송하는 전기 물리 계층인 **DC-LIN**을 정한다. DC-LIN은 고주파로 변조한 반송파에 UART 바이트를 실어 전원선으로 보낸다. 12 V와 24 V를 비롯한 여러 DC 전원선에 쓸 수 있고, 결합 커패시터를 거쳐 서로 다른 DC 전원선 사이에서도 통신할 수 있다.[@iso-17987-8-obp-2019]

## 슬립과 웨이크업

ISO 17987-3:2025는 **버스 슬립 상태**를 노드가 내부나 외부의 웨이크업만 기다리는 상태로 정의하고, 이 상태에서 노드는 출력을 recessive로 바꾼다고 제시한다. commander는 go-to-sleep 명령으로 responder 노드를 버스 슬립 상태로 보낸다.[@iso-17987-3-obp-2025] 슬립 중인 클러스터에서는 어느 노드든 웨이크업 신호를 보내 슬립을 끝낼 수 있다. 웨이크업 요청은 `0xF0` 바이트를 보내 만드는, 비트율에 따라 250 µs\~5 ms 길이의 dominant 펄스다.[@ti-sprui10a-2022][@microchip-an1099-2007]

## CAN과의 차이

LIN은 CAN보다 느리고 성능이 낮다.[@ti-slla383a-2022][@atmel-avr308-2002]
