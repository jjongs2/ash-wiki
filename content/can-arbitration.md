---
title: CAN 중재
tags:
  - network/can
verified: 2026-09-25
---

## 정의

**CAN 중재**(arbitration)는 둘 이상의 노드가 동시에 송신을 시작했을 때, [[can-identifier|식별자]]를 비트 단위로 겨루어 버스를 쓸 노드 하나를 가리는 [[can|CAN]]의 버스 접근 방식이다. 이긴 프레임은 훼손되지 않으므로, 다시 보내느라 시간을 잃지 않고 그대로 전송된다. 그래서 비파괴 중재(Non-Destructive Arbitration)라고도 한다.[@microchip-dspic30f-can-frm-2003]

## 구조·동작

### 버스 접근

노드는 버스가 idle일 때만 프레임을 보내기 시작한다. 버스가 idle일 때 둘 이상의 노드가 SOF(Start of Frame)부터 동시에 송신을 시작하면 중재가 일어난다.[@microchip-dspic30f-can-frm-2003] 다른 노드가 이미 프레임을 보내고 있으면, 우선순위가 더 높은 프레임이라도 버스가 idle이 될 때까지 기다린다.[@microchip-mcp25xxfd-frm-2020]

### 비트 단위 겨루기

기본 포맷에서 중재 필드는 식별자 11비트와 RTR(Remote Transmission Request) 비트, 합해 12비트다.[@microchip-mcp2515-2019]

버스는 wired-AND로 동작해, dominant와 recessive가 겹치면 dominant가 된다. 각 노드는 식별자를 최상위 비트부터 보내며, 비트를 낼 때마다 버스 레벨을 읽어 자기가 낸 값과 비교한다. recessive를 냈는데 dominant를 읽었다면 그 노드가 졌다는 뜻이다. 진 노드는 그 자리에서 송신을 그만두고 수신 쪽으로 넘어간다.[@microchip-dspic30f-can-frm-2003]

![[diagrams/can-arbitration.svg]]

dominant는 논리 0이다. 따라서 처음으로 값이 갈리는 비트에서 0을 낸 쪽, 곧 식별자의 이진 값이 더 작은 쪽이 이긴다. 식별자의 값이 작을수록 우선순위가 높다.[@microchip-dspic30f-can-frm-2003]

### 식별자가 같을 때

식별자가 같은 데이터 프레임과 [[remote-frame|리모트 프레임]]이 동시에 송신되면, 식별자 뒤의 RTR 비트가 dominant인 데이터 프레임이 이긴다.[@microchip-mcp2515-2019]

확장 포맷에서는 기본 식별자 11비트 뒤, 기본 포맷의 RTR 자리에 SRR(Substitute Remote Request) 비트가 오고 그 뒤에 IDE(Identifier Extension) 비트가 온다. 둘 다 recessive다. 그래서 앞 11비트로 중재가 가려지지 않은 채 기본 포맷 프레임과 확장 포맷 프레임이 겨루면, 기본 포맷 프레임이 이긴다.[@microchip-mcp2515-2019]

![[diagrams/can-base-extended-arbitration-field.svg]]

서로 다른 노드가 같은 식별자로 동시에 보내면 중재로 가려지지 않아, 프레임 뒷부분에서 충돌과 오류가 생길 수 있다.[@microchip-dspic30f-can-frm-2003]

### 진 노드

버스가 idle로 돌아오면, 중재에서 밀린 노드는 같은 프레임의 송신을 자동으로 다시 시작한다.[@microchip-dspic30f-can-frm-2003] 예를 들어 M_CAN은 중재에서 진 프레임을 기본 설정에서 자동으로 다시 보내며, 이 기능을 끌 수도 있다.[@bosch-m-can-2023]

## 비교·한계

중재 동안 송신 노드는 자기가 낸 비트와 버스의 비트를 비교하므로, 샘플 포인트를 최대 전파 지연 뒤에 두어야 한다. 최대 전파 지연 $t_\mathrm{prop}$은 두 노드 사이를 오가는 시간으로, 트랜시버 지연 $t_\mathrm{trx}$와 버스 지연 $t_\mathrm{bus}$로 $t_\mathrm{prop} = 2(t_\mathrm{trx} + t_\mathrm{bus})$다. 그래서 중재 구간의 비트율은 네트워크의 전파 지연에 묶인다.[@microchip-mcp25xxfd-frm-2020]

![[diagrams/can-arbitration-round-trip-delay.svg]]

버스가 길수록 비트율을 낮춰야 한다. 비트율 1 Mbit/s는 버스 길이 $l$이 $l \le 40\,\mathrm{m}$일 때 쓸 수 있고, 그보다 긴 버스에서는 비트율을 낮춘다.[@microchip-dspic30f-can-frm-2003]

[[can-fd|CAN FD]](CAN with Flexible Data-Rate)는 중재가 끝난 뒤의 데이터 구간에서만 비트율을 올린다. 이 구간에서는 송신 노드가 하나뿐이라, 전파 지연이 최대 비트율을 제한하지 않는다.[@microchip-mcp25xxfd-frm-2020]

우선순위가 낮은 프레임은 우선순위가 높은 프레임이 몰리면 계속 밀려 전송이 늦어질 수 있다.[@bosch-m-can-2023]
