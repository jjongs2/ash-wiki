---
title: 스패닝 트리 프로토콜
tags:
  - network/ethernet
aliases:
  - STP
verified: 2026-10-06
---

**스패닝 트리 프로토콜**(spanning tree protocol)은 [[ethernet-switch|브리지]]들이 함께 루프 없이 모든 LAN(Local Area Network)을 잇는 활성 토폴로지, 곧 스패닝 트리를 계산하게 하는 프로토콜이다. [[ieee-802-1q|IEEE 802.1Q]]-2022는 이 계산을 맡는 알고리즘과 프로토콜로 RSTP(Rapid Spanning Tree Protocol), MSTP(Multiple Spanning Tree Protocol), SPB(Shortest Path Bridging) 등을 두며, 이들은 망 구성 요소가 고장 나면 관리자의 개입 없이 다른 물리적 연결을 써서 연결을 빠르게 되살린다.[@ieee-802-1q-2022]

## 활성 토폴로지

IEEE 802.1Q-2022는 **활성 토폴로지**를, 정해진 [[virtual-lan|VLAN]] 식별자와 목적지·출발지 주소를 가진 프레임에 대해 브리지의 전달 포트로 LAN과 브리지를 이어 만든 연결로 정의한다. 브리지의 전달 프로세스는 사용자 데이터 프레임 하나가 지날 수 있는 경로를 스패닝 트리 하나로 제한하고, RSTP를 쓰는 브리지는 모든 프레임을 CST(Common Spanning Tree) 하나에 배정한다.[@ieee-802-1q-2022]

이 표준은 스패닝 트리 프로토콜이 물리적으로 이어진 모든 LAN과 브리지를 잇는 활성 토폴로지를 만들고, 물리 토폴로지가 바뀐 뒤 짧고 알려진 시간 안에 (높은 확률로) 안정되며, 어떤 프레임에 대해서든 활성 토폴로지가 늘 단순 연결로 남도록 요구한다. 브리지가 아닌 장치(LAN 리피터 등)가 LAN을 이어 생기는 일시적인 루프는 이 프로토콜들이 막지 못한다.[@ieee-802-1q-2022]

## 포트 상태

IEEE 802.1Q-2022는 스패닝 트리마다 브리지 포트의 학습과 전달 여부를 묶어 **포트 상태**(Port State)라 한다. 학습과 전달을 모두 끈 포트는 Discarding, 학습만 켠 포트는 Learning, 학습과 전달을 모두 하는 포트는 Forwarding이다. RSTP와 MSTP의 상태 기계는 포트 상태를 직접 다루지 않고, 트리마다 따로 둔 학습 변수와 전달 변수를 다룬다. 동작하지 않거나 관리자가 Disabled로 둔 포트는 모든 스패닝 트리에서 학습과 전달이 꺼진다.[@ieee-802-1q-2022]

IEEE 802.1Q-2022는 데이터 루프와 원치 않는 출발지 [[mac-address|MAC 주소]] 학습을 막으려고, 전달 프로세스가 받은 프레임과 브리지 포트마다 학습과 전달 제어 값을 정하도록 한다. 받은 포트의 학습이 참이고 입구 필터링이 프레임을 버리지 않으면 출발지 주소와 VLAN 식별자를 학습 프로세스에 넘기고, 받은 포트의 전달이 참이면 받은 포트를 뺀, 전달이 참인 다른 포트를 전송 후보로 삼는다. 다만 받은 포트가 EVB(Edge Virtual Bridging) Bridge 모드이고 반사 중계(operReflectiveRelayControl)를 켰으면 받은 포트도 후보에 든다.[@ieee-802-1q-2022]

KSZ9477S는 호스트 프로세서와 잇는 포트를 하나 두고, 다른 포트마다 송신 허용, 수신 허용, 학습 금지 레지스터 비트로 아래 스패닝 트리 상태 다섯 가지 가운데 하나를 설정한다.[@microchip-ksz9477s-2019]

| 상태       | 동작                                               |
| ---------- | -------------------------------------------------- |
| Disable    | 학습이 꺼진다.                                     |
| Blocking   | 학습이 꺼진다.                                     |
| Listening  | 학습이 꺼진다.                                     |
| Learning   | 프로세서와 주고받는 패킷만 전달하면서 학습을 켠다. |
| Forwarding | 패킷을 정상으로 주고받고 학습한다.                 |

KSZ9477S는 RSTP용으로 포트마다 Discarding, Learning, Forwarding 세 상태를 두며, Discarding은 위 다섯 상태 가운데 Disable, Blocking, Listening을 합친 것이다.[@microchip-ksz9477s-2019]

## 포트 역할

IEEE 802.1Q-2022는 RSTP에서 브리지마다 Configuration Message를 보내도록 정한다. 메시지에 담긴 스패닝 트리 우선순위 벡터로 브리지 하나가 루트 브리지로 정해지고, 각 브리지는 루트 브리지까지의 가장 낮은 경로 비용을 계산한다. 브리지마다 루트 브리지로 가는 가장 낮은 비용의 경로를 주는 포트 하나를 **Root Port**라 하고, LAN마다 그 LAN에서 루트 브리지로 가는 가장 낮은 비용의 경로를 주는 브리지 포트 하나를 **Designated Port**라 한다. **Alternate Port**와 **Backup Port**는 다른 구성 요소가 고장 나면 연결을 줄 수 있는 포트다.[@ieee-802-1q-2022]

이 표준은 브리지 식별자가 가장 좋은, 곧 수치가 가장 작은 브리지를 루트 브리지로 고르도록 정한다. 브리지 식별자는 브리지 주소와, 관리자가 바꿀 수 있는 우선순위로 이뤄진다. 루트 브리지가 아닌 브리지의 루트 경로 비용은 루트 브리지까지의 최소 비용 경로에 있는 포트 경로 비용의 합이다. 물리 토폴로지가 안정되면 모든 LAN에 Designated Port가 하나씩, 루트 브리지를 뺀 모든 브리지에 Root Port가 하나씩 있게 되고, 각 브리지가 Root Port와 Designated Port 사이만 이어 주므로 활성 토폴로지는 모든 LAN을 잇고(spanning) 루프가 없다(tree).[@ieee-802-1q-2022]

이 표준은 안정된 네트워크에서 Root Port와 Designated Port를 Forwarding으로, Alternate Port, Backup Port, Disabled Port를 Discarding으로 둔다. 포트 역할이 바뀔 때 Learning과 Forwarding으로 가는 전이는 늦춰지고, 루프를 막으려고 포트가 잠시 Discarding으로 갈 수 있다. RSTP는 새 Root Port와 점대점 LAN에 붙은 Designated Port가 프로토콜 타이머를 기다리지 않고 Forwarding으로 가게 해 연결을 빨리 되살린다. 다른 브리지가 없는 LAN에 붙은 포트는 Edge Port로 설정할 수 있고, Edge Port는 루프에 낄 일이 없으므로 바로 Forwarding으로 간다.[@ieee-802-1q-2022]

## MSTP와 SPB

IEEE 802.1Q-2022는 MSTP가 CIST(Common and Internal Spanning Tree)와 MSTI(Multiple Spanning Tree Instance)라는 여러 스패닝 트리를 만들고 트리마다 포트 상태를 두도록 정한다. MSTP를 쓰는 브리지는 MST(Multiple Spanning Tree) Configuration Table로 한 VLAN에 속한 프레임을 모두 CIST나 MSTI 하나에 배정한다. 관리자는 VLAN 식별자마다 활성 토폴로지로 공통 스패닝 트리, (MSTP를 구현했으면) 여러 스패닝 트리 가운데 하나, (SPB를 구현했으면) 최단 경로를 고를 수 있다.[@ieee-802-1q-2022]

SPB는 브리지마다 루트를 둔 최단 경로 트리로 전달하는 브리징 방식이다. SPB의 MAC 모드(SPBM)에 참여하는 브리지는 유니캐스트 트래픽에 일시적인 루프를 허용하는 대신 loop mitigation으로 그 영향을 줄여, 토폴로지 변화에 더 빨리 대응할 수 있다. loop mitigation이 이뤄지면 활성 토폴로지의 루프에 프레임의 출발지나 목적지가 들 수 없고, 루프 때문에 목적지에 처음 프레임의 사본이 여럿 전달되지도 않는다.[@ieee-802-1q-2022]
