---
title: CAN 중재
tags:
  - network/can
verified: 2026-09-27
---

**CAN 중재**는 [[can|CAN]] 버스에서 둘 이상의 노드가 한꺼번에 송신을 시작했을 때, 식별자를 비트 단위로 겨뤄 [[bus-access-method|버스 접근]] 충돌을 풀고 한 노드만 송신을 이어 가게 하는 방식이다. 이긴 프레임은 정보도 시간도 잃지 않는다.[@bosch-can-2-0-1991]

## 구조·동작

### 송신 시작

노드는 버스가 idle일 때만 프레임 송신을 시작할 수 있다. 다른 프레임이 전송되는 동안 기다리던 프레임은 인터미션 다음 첫 비트에 송신을 시작하고, 여러 노드가 함께 시작했으면 이어지는 중재 필드에서 중재가 일어난다. 버스가 쓰이는 동안 송신 요청이 생긴 노드는 우선순위와 상관없이 그 프레임과 인터미션이 끝나기를 기다린다.[@bosch-can-2-0-1991]

### 비트 비교

중재 동안 송신 노드는 자기가 보낸 비트 레벨을 버스에서 읽은 레벨과 비교한다. dominant와 recessive를 동시에 보내면 버스는 dominant가 되므로, recessive를 보냈는데 dominant를 읽은 노드는 중재에서 진 것이다. 진 노드는 비트를 하나도 더 보내지 않고 물러나 수신 노드가 된다.[@bosch-can-2-0-1991] 버스 레벨은 [[dominant-and-recessive|dominant와 recessive]]에서 다룬다.

![[diagrams/can-arbitration.svg]]

중재 필드는 기본 포맷에서 [[can-identifier|식별자]] 11비트와 RTR(Remote Transmission Request) 비트다. 확장 포맷에서는 기본 식별자 11비트, SRR(Substitute Remote Request) 비트, IDE(Identifier Extension) 비트, 확장 식별자 18비트, RTR 비트 순이다. 식별자는 최상위 비트부터 보낸다.[@bosch-can-2-0-1991]

![[diagrams/can-base-extended-arbitration-field.svg]]

### 승자

dominant는 논리 0, recessive는 논리 1이다.[@iso-11898-1-obp-2024] 그래서 식별자 값이 가장 작은 프레임이 우선순위가 가장 높아 중재에서 이긴다.[@st-rm0008-2021]

식별자가 같은 [[can-frame|데이터 프레임]]과 [[remote-frame|리모트 프레임]]이 만나면 RTR 비트가 dominant인 데이터 프레임이 이긴다. 기본 식별자가 같은 기본 포맷 프레임과 확장 포맷 프레임이 만나면 기본 포맷 프레임이 이긴다.[@bosch-can-2-0-1991]

### 진 프레임

Bosch M_CAN은 중재에서 진 프레임을 기본 설정에서 자동으로 다시 보내고, 이 동작은 설정으로 끌 수 있다. M_CAN 매뉴얼에 따르면 한 ECU가 CAN 메시지를 연달아 보내면, 중재 우선순위가 더 낮은 다른 ECU의 메시지가 늦어질 수 있다. M_CAN의 transmit pause 기능을 켜면 메시지를 하나 보낼 때마다 2비트 시간 쉬어, 우선순위가 낮은 다른 노드도 메시지를 보낼 수 있게 한다.[@bosch-m-can-2023]

## 비교·한계

Microchip 문서에 따르면 중재에 참여하는 모든 노드가 같은 비트 시간 안에 버스의 같은 비트를 샘플링할 수 있어야 중재가 성립하고, 송신 노드는 샘플 포인트를 최대 전파 지연 뒤에 두어야 한다.[@microchip-an754-2001][@microchip-mcp25xxfd-frm-2020]

비트 시간의 구성과 전파 구간(PROP_SEG)의 길이는 [[can-bit-timing|CAN 비트 타이밍]]에서, 버스 길이와 비트율의 관계는 [[can-physical-layer|CAN 물리 계층]]에서 다룬다.

같은 식별자의 데이터 프레임을 두 노드가 함께 보내면 중재 필드에서 승자가 가려지지 않아 둘 다 송신을 이어 간다. 중재 필드 밖에서 보낸 비트와 읽은 비트가 다르면 [[can-error-detection|비트 오류]]가 난다.[@bosch-can-2-0-1991]

[[can-fd|CAN FD]]는 중재가 끝난 뒤 데이터 구간에서 더 높은 비트율로 바꿀 수 있다.[@bosch-can-fd-1-0-2012] 데이터 구간에서는 한 노드만 송신하고 나머지는 모두 수신하므로, 버스 길이가 영향을 주지 않는다.[@bosch-m-can-2023]
