---
title: 이더넷 흐름 제어
tags:
  - network/ethernet
verified: 2026-10-06
---

**이더넷 흐름 제어**(flow control)는 전이중 [[ethernet|이더넷]] 링크에서 한쪽이 링크 상대의 데이터 프레임 송신을 정한 시간 동안 막는 기능이다. [[ieee-802-3|IEEE 802.3]]-2022는 이를 위해 데이터 프레임 전체의 송신을 막는 PAUSE와, [[traffic-class#우선순위와 트래픽 클래스의 대응|우선순위]]별로 막는 PFC(Priority-based Flow Control)를 둔다.[@ieee-802-3-2022]

## PAUSE

이 표준은 **PAUSE**를 전이중 흐름 제어 메커니즘으로 정의한다. PAUSE 프레임은 MAC Control 프레임의 하나이고, MAC Control 프레임은 MAC(Medium Access Control)이 주고받는 다른 프레임과 [[ethernet-frame#길이/타입|길이/타입]] 필드로만 구별된다. 이 표준은 MAC Control 프레임의 길이/타입 필드 값을 EtherType `0x8808`로 정한다.[@ieee-802-3-2022]

이 표준은 다른 스테이션의 데이터 프레임 송신을 막으려는 MAC Control 클라이언트가 멀티캐스트 주소 `01-80-C2-00-00-01`, PAUSE opcode, 막을 시간을 지정해 PAUSE를 요청하도록 정한다. PAUSE로는 MAC Control 프레임의 송신을 막을 수 없고, PAUSE 프레임은 전이중 모드로 설정된 DTE(Data Terminal Equipment)만 보낸다. [[ieee-802-1q|IEEE 802.1Q]]를 따르는 브리지는 포트의 상태나 MAC Control 부계층 구현 여부와 상관없이 이 멀티캐스트 주소로 가는 프레임을 전달하지 않으며, PAUSE를 구현하는 스테이션은 이 주소의 프레임을 받도록 MAC을 설정해야 한다.[@ieee-802-3-2022]

이 표준은 막을 시간 pause_time을 2옥텟 부호 없는 정수로 두고, 그 단위 pause_quanta를 그 구현에서 512비트를 보내는 시간으로, 범위를 0부터 65535 pause_quanta까지로 정한다.[@ieee-802-3-2022]

이 표준은 [[ethernet-phy#자동 협상|자동 협상]]의 기본 링크 코드워드에 PAUSE 비트와 ASM_DIR 비트를 두고, PAUSE 비트가 대칭 PAUSE 기능을, ASM_DIR 비트가 비대칭 PAUSE 지원을 나타내도록 정하며, ASM_DIR 비트가 설정되면 PAUSE 비트의 값이 PAUSE 프레임을 지원하는 방향을 나타내게 한다. 비대칭 PAUSE 설정에서는 PAUSE 수신 기능과 송신 기능을 따로 켠다.[@ieee-802-3-2022]

이 표준은 프레임 선점의 [[frame-preemption#Express와 preemptable|eMAC이나 pMAC]]에 붙은 MAC Control 부계층이 PAUSE를 만들지 않도록 정한다.[@ieee-802-3-2022]

IEEE 802.1BA-2021은 흐름 제어가 [[avb|AVB]]의 지연 보장을 깨뜨릴 수 있어, 흐름 제어를 지원하는 AVB 시스템이 오디오·비디오 스트림을 나르는 포트에서 MAC Control PAUSE를 끄게 한다. 또 어느 포트에서 [[avb#SR 클래스|SR 클래스]]의 우선순위에 PFC가 켜져 있으면, 그 포트에서 그 SR 클래스의 SRPdomainBoundaryPort 파라미터를 TRUE로 두게 한다. 그러면 이 포트는 그 SR 클래스의 [[srp|SRP]] 도메인 경계가 되어, 그 클래스의 스트림 예약이 이 포트를 넘지 않는다.[@ieee-802-1ba-2021]

KSZ9477S(Microchip의 7포트 기가비트 [[ethernet-switch|이더넷 스위치]])는 전이중 연결에서 MAC Control PAUSE 프레임을 보내고 받는다. 어느 포트로 PAUSE 프레임을 받으면 그 프레임이 지정한 타이머가 끝날 때까지 그 포트로 다음 일반 프레임을 보내지 않고, 타이머가 끝나기 전에 PAUSE 프레임을 또 받으면 타이머를 새 값으로 바꾼다. 흐름 제어를 받는 동안에는 장치가 만든 흐름 제어 프레임만 보낸다. 송신 방향에서 KSZ9477S는 버퍼와 송신 큐 같은 자원의 여유를 보고 흐름 제어를 걸며, 이때 최대 pause_time을 담은 PAUSE 프레임을 보내고, 자원이 풀리면 pause_time이 0인 흐름 제어 프레임을 보내 송신을 다시 열게 한다. 흐름 제어가 거듭 켜졌다 꺼지지 않도록 히스테리시스를 둔다.[@microchip-ksz9477s-2019]

![[diagrams/ksz9477s-pause-flow-control.svg]]

## PFC

IEEE 802.3-2022는 PFC를 하나 이상의 우선순위에 대해 데이터 프레임 송신을 정한 시간 동안 막는 MAC Control 동작으로 두고, PFC를 지원하는 MAC Control 클라이언트의 동작은 IEEE 802.1Q가 정하게 한다. PFC는 PAUSE와 같은 멀티캐스트 주소를 쓰지만, PAUSE와 달리 송신을 막는 일은 MAC Control 클라이언트에서 일어난다. 이 표준은 반이중 모드로 설정된 DTE에서 PFC를 켜지 않도록 정하며, PFC는 전이중 점대점 링크에서 쓰기 위한 것이다. PFC를 켜면 PAUSE는 꺼야 한다.[@ieee-802-3-2022]

IEEE 802.1Q-2022는 PFC의 동작을 데이터 센터 환경으로 한정한다. PFC는 혼잡 때문에 프레임을 버리지 않아야 하는 프로토콜을 위한 것이지만 혼잡을 퍼뜨릴 수 있어, 범위가 제한된 네트워크에서 쓰도록 한다. 이 표준은 PFC를 점대점 링크 하나로 이어진 전이중 MAC 한 쌍에 대해서만 정의하고, 우선순위마다 켜거나 끌 수 있게 하며, 포트의 기본 우선순위에는 PFC를 켜지 않기를 강하게 권한다.[@ieee-802-1q-2022]
