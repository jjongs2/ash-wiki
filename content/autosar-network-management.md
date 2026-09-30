---
title: AUTOSAR 네트워크 관리
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 네트워크 관리**(Network Management, NM)는 NM 클러스터의 ECU들이 통신 스택을 함께 깨우고 함께 내리도록 맞추는 기능이다. 노드는 네트워크가 필요한 동안 NM 메시지를 주기적으로 보내 클러스터를 깨어 있게 하고, 필요가 없어지면 송신을 멈춘다. 어느 노드의 NM 메시지도 오지 않아 정해진 타이머가 만료되면 모든 노드가 슬립 모드로의 전이를 시작한다.[@autosar-fo-prs-networkmanagementprotocol-2025] CanNm(CAN Network Management)의 타이밍 설정이 클러스터의 모든 노드에서 같으면, 노드들은 거의 같은 때에 Bus-Sleep Mode로 들어간다.[@autosar-cp-sws-cannetworkmanagement-2025]

## 모듈

- **Nm interface**(Generic Network Management Interface): ComM(Communication Manager)과 버스별 NM 모듈 사이의 버스 독립 적응 계층이다. ComM이 부른 일반 함수는 버스별 NM의 함수로 바꾸고, 버스별 NM이 부른 콜백은 ComM에 주는 일반 콜백으로 바꾼다.
- **NM coordinator**: Nm interface의 선택 기능으로, 게이트웨이 ECU가 자신이 이어진 여러 버스를 함께 재우도록 조정한다. 조정하는 버스들을 함께 깨우는 것은 Nm interface의 범위 밖이며 응용의 몫이다.
- **버스별 NM**: [[can|CAN]]의 CanNm, [[flexray|FlexRay]]의 FrNm(FlexRay Network Management), [[ethernet|이더넷]]의 UdpNm(UDP Network Management), [[j1939|J1939]]의 J1939Nm(J1939 Network Management)이 있다.[@autosar-cp-sws-networkmanagementinterface-2025]

ComM은 [[autosar-communication-stack#통신 모드 관리|AUTOSAR 통신 스택]]에서 다룬다.

## 상태 기계

CanNm은 NM PDU(Protocol Data Unit)를 브로드캐스트로 주기적으로 주고받고, 이 PDU는 클러스터의 모든 노드가 받는다.[@autosar-cp-sws-cannetworkmanagement-2025] CanNm과 UdpNm은 Network Mode, Prepare Bus-Sleep Mode, Bus-Sleep Mode의 세 동작 모드를 둔다.[@autosar-cp-sws-cannetworkmanagement-2025][@autosar-cp-sws-udpnetworkmanagement-2025] FrNm은 Prepare Bus-Sleep Mode 대신 Synchronize Mode를 두며, Network Mode 안의 세 상태는 CanNm과 같다.[@autosar-cp-sws-flexraynetworkmanagement-2025] 아래는 CanNm을 기준으로 한 동작이다.[@autosar-cp-sws-cannetworkmanagement-2025]

- **Bus-Sleep Mode**: 주고받을 메시지가 없을 때 통신 컨트롤러를 슬립으로 두어 전력 소비를 줄이는 모드다. 네트워크 요청이 오면 Network Mode로 가며, 기본으로 Repeat Message State에 든다. 이 모드에서 NM 메시지를 받으면 스스로 Network Mode로 가지 않고 상위 계층에 알리기만 하며, 깨울지는 상위 계층이 정한다.
- **Network Mode**: Repeat Message State, Normal Operation State, Ready Sleep State의 세 내부 상태로 이루어진다.
  - **Repeat Message State**: 노드가 Network Mode로 넘어온 것을 다른 노드가 알 수 있게 하는 상태다. 이 상태에 들면 passive mode가 아닌 노드는 NM 메시지 송신을 시작한다. `CanNmRepeatMessageTime`이 지나면 이 상태를 떠나, 네트워크가 요청된 상태면 Normal Operation State로, 해제된 상태면 Ready Sleep State로 간다.
  - **Normal Operation State**: 네트워크가 요청된 동안 노드가 클러스터를 깨어 있게 하는 상태다. NM 메시지를 주기적으로 보내고, 네트워크가 해제되면 Ready Sleep State로 간다.
  - **Ready Sleep State**: 다른 노드가 클러스터를 깨어 있게 하는 동안 Prepare Bus-Sleep Mode로 가는 것을 미루며 기다리는 상태다. 이 상태에 들면 NM 메시지 송신을 멈춘다.
- **Prepare Bus-Sleep Mode**: Bus-Sleep Mode에 들기 전에 모든 노드가 네트워크 활동을 멈출 시간을 주는 모드다. 대기 중인 메시지를 내보내 버스를 조용히 만들고, Wait Bus-Sleep 타이머가 만료되면 Bus-Sleep Mode로 간다. `CanNmStayInPbsEnabled`를 켜면 전원이 꺼지거나 재시작 사유가 생길 때까지 이 모드에 머문다.[@autosar-cp-sws-cannetworkmanagement-2025]

Network Mode에서 NM 메시지를 받거나 NM 메시지 송신에 성공하면 NM-Timeout 타이머를 다시 시작한다. Ready Sleep State에서 NM-Timeout 타이머가 만료되면 Prepare Bus-Sleep Mode로 간다.[@autosar-cp-sws-cannetworkmanagement-2025]

![[diagrams/cannm-state-machine.svg]]

## Direct NM과 indirect NM

AUTOSAR의 버스별 NM은 분산 direct NM 전략을 따른다. 각 노드는 자신이 받거나 보낸 NM 메시지만을 바탕으로 스스로 동작한다.[@autosar-cp-sws-cannetworkmanagement-2025][@autosar-cp-sws-udpnetworkmanagement-2025]

[[osek-vdx|OSEK]] NM 명세의 direct NM은 노드를 [[bus-access-method|논리 링]]으로 잇는다. OSEK NM 명세의 indirect NM은 전용 NM 메시지를 쓰지 않고, 주기적으로 오가는 응용 메시지를 감시해 노드의 상태를 판단한다. 그래서 정상 동작 중 메시지를 주기적으로 보내는 노드만 감시할 수 있다.[@osek-nm-2-5-3-2004]

## Partial networking

Partial networking은 버스 전체가 아니라 PNC(Partial Network Cluster) 단위로 ECU를 깨우고 깨어 있게 하는 기능이다. PNC는 분산 기능을 이루려고 함께 동작해야 하는 ECU의 논리적 묶음이다. Partial networking이 없으면 NM 메시지는 버스 전체만 깨우거나 깨어 있게 할 수 있다.[@autosar-cp-sws-commanager-2025]

PNC마다의 요청 상태는 NM 메시지 안의 PNC 비트 벡터에 담겨 오가며, 비트 하나가 PNC 하나를 나타낸다.[@autosar-fo-prs-networkmanagementprotocol-2025][@autosar-cp-sws-commanager-2025] Partial networking을 켠 CanNm은, 모든 NM 메시지로 깨어 있게 하는 설정(`CanNmAllNmMessagesKeepAwake`)이 꺼져 있고 partial networking을 쓸 수 있음이 확인된 뒤에는, 자기 노드와 관계있는 PNC 요청이 없는 NM PDU를 더 처리하지 않는다. 그런 메시지로는 NM-Timeout 타이머가 다시 시작되지 않는다.[@autosar-cp-sws-cannetworkmanagement-2025]

## Bus-sleep 동기화

NM coordinator는 조정 클러스터에 묶인 여러 버스의 셧다운이 함께 끝나도록 조정한다(coordinated shutdown). 조정 클러스터의 모든 네트워크가 슬립 준비가 되었거나 이미 bus-sleep이면, NM coordinator는 깨어 있는 네트워크들에 coordinated shutdown을 시작하고 채널마다 셧다운 지연 타이머를 건다. 타이머 값은 `NmGlobalCoordinatorTime`에서 그 채널의 셧다운 시간을 뺀 것이다. 타이머가 만료되면 NM coordinator는 그 버스의 NM에 버스 동기화를 요청한 뒤 네트워크를 해제한다.[@autosar-cp-sws-networkmanagementinterface-2025]

![[diagrams/nm-coordinated-shutdown-timer.svg]]
