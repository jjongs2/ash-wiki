---
title: CAN 프레임
tags:
  - network/can
verified: 2026-09-26
---

**CAN 프레임**은 [[can|CAN]] 노드 사이의 메시지 전송을 이루는 단위다. Classical CAN에는 데이터 프레임, [[remote-frame|리모트 프레임]], 오류 프레임, [[can-overload-frame|오버로드 프레임]] 네 종류가 있고, 데이터 프레임은 송신 노드의 데이터를 수신 노드들에 나른다.[@bosch-can-2-0-1991]

## 데이터 프레임의 필드

데이터 프레임은 SOF(Start of Frame), 중재 필드, 제어 필드, 데이터 필드, [[can-crc|CRC]] 필드, [[can-acknowledgement|ACK]] 필드, EOF(End of Frame)의 일곱 필드로 이루어진다.[@bosch-can-2-0-1991]

- SOF: [[dominant-and-recessive|dominant]] 비트 하나로 프레임의 시작을 알린다. 노드는 버스가 idle일 때만 송신을 시작할 수 있고, 모든 노드가 먼저 송신을 시작한 노드의 SOF 앞 에지에 [[can-synchronization|동기를 맞춘다]].
- 중재 필드: 기본 포맷에서는 [[can-identifier|식별자]]와 RTR(Remote Transmission Request) 비트로 이루어진다. RTR 비트는 데이터 프레임에서 dominant, 리모트 프레임에서 recessive다.
- 제어 필드: 모두 6비트다. 기본 포맷에서는 IDE(Identifier Extension) 비트, 예약 비트 r0, 데이터 필드의 바이트 수를 나타내는 [[data-length-code|DLC]] 4비트이고, 확장 포맷에서는 예약 비트 r1, r0과 DLC 4비트다.[@bosch-can-2-0-1991][@bosch-can-fd-1-0-2012] Bosch CAN 2.0 규격은 CAN 규격 1.0–1.2가 예약 비트 r1이라 부르던 비트를 IDE 비트라 부른다. 예약 비트는 dominant로 보내지만 수신 노드는 dominant와 recessive를 모두 받아들인다.
- 데이터 필드: 0~8바이트이고, 바이트마다 최상위 비트부터 보낸다.
- CRC 필드: CRC 시퀀스와 recessive 비트 하나인 CRC 구분자로 이루어진다.
- ACK 필드: ACK 슬롯과 ACK 구분자 두 비트다.
- EOF: recessive 7비트로 프레임을 닫는다.[@bosch-can-2-0-1991]

![[diagrams/can-data-remote-frame-fields.svg]]

![[diagrams/can-control-field-base-extended.svg]]

## 기본 포맷과 확장 포맷

식별자가 11비트인 프레임을 기본 포맷(standard format), 29비트인 프레임을 확장 포맷(extended format)이라 한다. 두 포맷은 IDE 비트로 가르고, IDE는 기본 포맷에서 dominant, 확장 포맷에서 recessive다.[@bosch-can-2-0-1991]

확장 포맷의 중재 필드는 기본 식별자 11비트, SRR(Substitute Remote Request) 비트, IDE 비트, 확장 식별자 18비트, RTR 비트 순이다.[@bosch-can-fd-1-0-2012] SRR 비트는 기본 포맷의 RTR 자리에 놓이고 recessive로 보낸다. Bosch CAN 2.0 규격은 기본 포맷만 다루는 Part A와 두 포맷을 모두 다루는 Part B로 나뉜다. 두 포맷의 프레임은 한 버스에 함께 쓸 수 있다.[@bosch-can-2-0-1991]

![[diagrams/can-base-extended-arbitration-field.svg]]

이 규격은 새 컨트롤러가 기본 포맷을 제한 없이 지원하도록 정한다. 확장 포맷은 지원하지 않아도 되지만, 확장 포맷 프레임을 받을 수는 있어야 하고 그 포맷이라는 이유로 깨뜨려서는 안 된다.[@bosch-can-2-0-1991]

[[iso-11898-1|ISO 11898-1]]:2024는 프레임 포맷을 다섯으로 나눠 정의한다.[@iso-11898-1-obp-2024]

| 포맷                                | 식별자 | 프레임                       | 비트율                           | 데이터         |
| ----------------------------------- | ------ | ---------------------------- | -------------------------------- | -------------- |
| CBFF(Classic Base Frame Format)     | 11비트 | 데이터 프레임, 리모트 프레임 | 하나의 비트율                    | 8바이트까지    |
| CEFF(Classic Extended Frame Format) | 29비트 | 데이터 프레임, 리모트 프레임 | 하나의 비트율                    | 8바이트까지    |
| FBFF(FD Base Frame Format)          | 11비트 | 데이터 프레임                | 바꿔 가며 보낼 수 있음           | —              |
| FEFF(FD Extended Frame Format)      | 29비트 | 데이터 프레임                | 바꿔 가며 보낼 수 있음           | —              |
| XLFF(XL Frame Format)               | 11비트 | 데이터 프레임                | 데이터 구간의 시작과 끝에서 바꿈 | 2048바이트까지 |

이 표준은 CBFF나 CEFF를 쓰는 데이터 프레임과 리모트 프레임을 classic 프레임, FBFF나 FEFF를 쓰는 데이터 프레임을 FD 프레임으로 부른다. FBFF와 FEFF의 정의는 데이터 길이를 적지 않는다.[@iso-11898-1-obp-2024]

## 프레임 사이

데이터 프레임과 리모트 프레임은 앞 프레임이 어떤 종류든 프레임 간 공간으로 앞 프레임과 떨어진다. 오류 프레임과 오버로드 프레임 앞에는 프레임 간 공간이 없다.[@bosch-can-2-0-1991]

프레임 간 공간은 인터미션과 버스 idle로 이루어진다. 앞 메시지를 보낸 노드가 [[can-fault-confinement|error passive]]이면 그 사이에 [[can-fault-confinement#상태마다 할 수 있는 일|송신 정지]]가 더 들어간다. 인터미션은 recessive 3비트이고, 그동안 어느 노드도 데이터 프레임이나 리모트 프레임을 시작할 수 없다.[@bosch-can-2-0-1991]

Bosch CAN 2.0 규격과 Bosch CAN FD 1.0은 인터미션의 셋째 비트에서 찾은 dominant를 SOF로 해석하게 정한다.[@bosch-can-2-0-1991][@bosch-can-fd-1-0-2012] Bosch CAN 2.0 규격은 이때 보낼 메시지가 있는 노드가 SOF를 따로 보내지 않고 수신 노드가 되지도 않은 채, 다음 비트부터 식별자의 첫 비트를 보내게 한다.[@bosch-can-2-0-1991] Bosch CAN FD 1.0은 SOF를 보내지 않고 식별자부터 보내는 이 동작을, error active이거나 앞 프레임의 수신 노드였던 노드로 한정한다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-intermission-overload-start.svg]]

오류 프레임은 버스 오류를 찾은 노드가 내보내며, [[can-error-frame|CAN 오류 프레임]]에서 다룬다. 오버로드 프레임은 수신 노드가 다음 프레임을 늦춰야 할 때나 인터미션의 첫째·둘째 비트에서 dominant를 찾았을 때 등에 내보내, 앞뒤 데이터 프레임이나 리모트 프레임 사이에 지연을 더한다.[@bosch-can-2-0-1991]

## CAN FD 프레임과의 차이

Classical CAN 프레임의 데이터는 최대 8바이트다.[@bosch-can-2-0-1991] [[can-fd|CAN FD]] 포맷 프레임은 데이터 필드를 64바이트까지 늘리고, 중재가 끝난 뒤 데이터 구간의 비트율을 선택적으로 높일 수 있다.[@bosch-can-fd-1-0-2012] 구조는 [[can-fd-frame|CAN FD 프레임]]에서 다룬다.
