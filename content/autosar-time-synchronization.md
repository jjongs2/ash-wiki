---
title: AUTOSAR 시간 동기화
tags:
  - platform/autosar
verified: 2026-10-07
---

**AUTOSAR 시간 동기화**는 [[autosar|AUTOSAR]]가 여러 차량 네트워크에 걸쳐 동기화된 time base를 주는 기능이다. [[autosar-classic-platform|Classic Platform]]에서는 StbM(Synchronized Time-Base Manager)이 시간 제공, time base 상태, time gateway를 맡고, CanTSyn(Time Sync over CAN), FrTSyn(Time Sync over FlexRay), EthTSyn(Time Sync over Ethernet)이 버스마다의 시간 동기화 프로토콜을 맡는다. 쓰임새의 예로는 센서 데이터 융합과 여러 ECU에 걸친 로깅이 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] AUTOSAR R25-11의 BSW(Basic Software) 일반 명세는 StbM을 [[autosar-layered-architecture#BSW의 층|System Services]]에, CanTSyn, FrTSyn, EthTSyn을 [[autosar-communication-stack|Communication Services]]에 둔다.[@autosar-cp-sws-bswgeneral-2025]

## StbM

AUTOSAR Classic Platform R25-11의 StbM 명세는 StbM이 분산 시스템의 다른 노드와 동기화된 time base를 사용자에게 주도록 정한다. 쓰임새는 두 가지다. 하나는 여러 [[runnable-entity|runnable]]을 정해진 상대 오프셋으로 맞춰 실행하는 것이고, 다른 하나는 절대 시간이나 상대 시간과 그 흐름을 한 모듈이 알려 주는 것이다. 뒤의 예로는 레이더나 카메라 같은 여러 센서의 데이터를 시간으로 맞추는 센서 데이터 융합, 충돌 같은 사건 때 여러 ECU의 사건과 내부 상태를 기록하는 event data recording, 진단 이벤트를 저장할 때 쓰는 동기화된 달력 시간이 있다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

StbM 자신은 다른 노드의 time base에 맞추는 네트워크 시간 프로토콜을 갖지 않는다. 시간 프로토콜은 Time Base Provider 역할을 하는 버스별 TSyn 모듈이 맡고, StbM은 이 모듈들이 준 정보로 자기 time base를 맞춘다. 시간 정보를 쓰는 BSW 모듈과 [[autosar-software-component|SW-C]]는 StbM에서 시간을 받으므로, StbM은 실제 time base provider를 감추는 중개자(broker) 역할을 한다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

Time Base Provider가 값을 갱신하는 사이에도 time base를 읽을 수 있게 하는 일은 대개 하드웨어 기준 클록으로 하고, 흔히 그 overflow를 세는 소프트웨어 카운터를 함께 쓴다. 이 둘이 Virtual Local Time을 이룬다. 이 시간에 time base마다의 rate 편차와 오프셋을 반영해 그 time base의 로컬 시간(Local Instance of the Global Time)을 진행시킨다. 하드웨어 기준 클록으로는 [[autosar-os|AUTOSAR OS]]의 counter, GPT(General Purpose Timer) counter, 송수신 타임스탬프에 쓰는 이더넷의 free-running counter를 쓸 수 있다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

StbM은 time base마다 0에서 127 사이의 Time Base 식별자를 둔다. 버스별 TSyn 모듈은 이와 따로 Time Domain 식별자를 정해 시간 동기화 메시지에 실어 보내며, 그 범위는 [[can|CAN]]과 [[flexray|FlexRay]]에서 0에서 15, [[ethernet|이더넷]]에서 0에서 127이다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

StbM은 time base마다 설정에 따라 아래 세 역할 가운데 하나를 맡는다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

- **Global Time Master**: 한 time base의 시스템 전체 기원으로, 그 time base의 값을 네트워크로 Time Slave에 나눠 준다.
- **Time Slave**: 대응하는 TSyn 모듈이 준 global time 값으로 자기 로컬 time base를 갱신한다.
- **Time Gateway**: Time Slave 하나와 Time Master 하나 이상이 함께 참조하는 time base다. Time Slave 쪽 TSyn 모듈이 한 버스에서 받은 값을 StbM에 넘기고, Time Master 쪽 TSyn 모듈이 그 값을 StbM에서 받아 다른 버스로 보낸다. 라우팅 지연을 보정해야 하므로 시간 동기화 메시지를 그대로 라우팅하지 않는다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

![[diagrams/stbm-time-gateway.svg]]

StbM은 time base마다 상태(`timeBaseStatus`)를 아래 비트로 둔다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

| 비트               | 뜻                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------- |
| `TIMEOUT`          | 동기화 메시지 수신이 시간 초과됐다                                                           |
| `SYNC_TO_GATEWAY`  | 로컬 time base가 Global Time Master가 아니라 그 아래의 Time Gateway를 바탕으로 갱신되고 있다 |
| `GLOBAL_TIME_BASE` | global time base와 한 번이라도 동기화됐다                                                    |
| `TIMELEAP_FUTURE`  | 받은 시간이 설정한 문턱을 넘게 앞으로 뛰었다                                                 |
| `TIMELEAP_PAST`    | 받은 시간이 설정한 문턱을 넘게 뒤로 뛰었다                                                   |

Time Slave나 Time Gateway인 time base에서 StbM은 마지막으로 global time 값을 받은 때부터 `StbMSyncLossTimeout`을 재고, 이 시간이 지나면 `TIMEOUT` 비트를 세우며, 다음 값을 받으면 지운다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

## 버스별 시간 동기화

AUTOSAR R25-11의 CanTSyn 명세는 CanTSyn이 Time Synchronization over CAN 프로토콜 명세가 정한 프로토콜을 구현하도록 정하고, 그 구현을 AUTOSAR에 맞추는 세부를 정한다.[@autosar-cp-sws-timesyncovercan-2025] AUTOSAR R25-11은 그전의 CanTSyn 명세를 둘로 나눠, AUTOSAR 구현 밖에서도 쓸 수 있는 순수 프로토콜은 새 Foundation 명세인 Time Synchronization over CAN 프로토콜 명세에 두고, CanTSyn 명세에는 이 프로토콜을 AUTOSAR 안에서 구현하는 방법을 남겼다.[@autosar-cp-tr-releaseoverview-2025][@autosar-fo-tr-releaseoverview-2025]

AUTOSAR R25-11의 Time Synchronization over CAN 프로토콜 명세는 두 단계로 시간을 맞추는 메커니즘을 정한다. Time Master는 먼저 SYNC 메시지에 현재 시간의 초 부분만 실어 브로드캐스트하고, 그 메시지가 실제로 버스에 나간 시점의 타임스탬프를 잡는다. 이어서 Follow-Up(FUP) 메시지에 SYNC에 실은 초 값과 SYNC가 나간 시점 사이의 오프셋을 실어 보낸다. Time Slave는 SYNC를 받은 시점의 타임스탬프를 잡아 두었다가, FUP를 받으면 두 메시지에 실린 시간, SYNC가 Time Master에서 Time Slave까지 오는 데 걸린 시간, SYNC를 받은 뒤 지금까지 지난 시간을 더해 자기 시간을 맞춘다. SYNC의 송수신 시점을 하드웨어 타임스탬프로 잡으면 가장 정밀하다. CAN 버스 하나에 Time Domain을 여럿 둘 수 있지만, Time Domain마다 Time Master는 하나다. Time Gateway는 한 CAN 버스에서는 Time Slave로, 다른 CAN 버스에서는 Time Master로 동작해 시간 정보를 넘긴다.[@autosar-fo-prs-timesyncovercanprotocol-2025]

![[diagrams/cantsyn-sync-fup-sequence.svg]]

이 프로토콜은 로컬 기준 클록의 틱 길이 $T_\mathrm{tick}$이 $T_\mathrm{tick} \le 2\,\mu\mathrm{s}$라고 가정한다. 클록 주파수 $f$로는 $f \ge 500\,\mathrm{kHz}$다. SYNC 메시지의 시간 값 필드가 32비트이므로, 나타낼 수 있는 시간은 최대 4294967295초($2^{32}-1$초)다.[@autosar-fo-prs-timesyncovercanprotocol-2025] AUTOSAR R25-11의 CanTSyn 명세는 시간의 인증 보호를 Classical CAN 버스에는 두지 않는다. 페이로드가 작아 인증을 구현하기 어렵고 어떤 해법을 넣어도 암호 공격이나 DoS(Denial of Service) 같은 취약점이 남으며, 오늘날의 ECU는 Classical CAN과 [[can-fd|CAN FD]] 채널을 함께 갖추기 때문이다.[@autosar-cp-sws-timesyncovercan-2025] AUTOSAR R25-11의 Time Synchronization over CAN 프로토콜 명세도 시간의 인증을 CAN FD와 [[can-xl|CAN XL]]에만 둔다.[@autosar-fo-prs-timesyncovercanprotocol-2025]

AUTOSAR R25-11의 FrTSyn 명세는 FlexRay의 시간 동기화를 CAN보다 단순한 메커니즘으로 정한다. FlexRay 노드끼리는 동기화돼 있어야 메시지를 보낼 수 있기 때문이다. Time Master와 Time Slave는 같은 FlexRay global time을 보므로, Time Master는 다음 사이클 가운데 cycle counter가 0인 사이클의 시작 시점에 맞을 시간을 계산해 메시지 하나로 보낸다. Time Slave는 받은 값과 자기 macrotick counter, cycle counter로 Time Master의 시간을 구한다. 그래서 메시지를 정확히 언제 보내고 받는지는 시간에 그다지 민감하지 않다. 이 명세는 Time Master, Time Gateway, Time Slave가 틱 길이 2 µs인 time base 기준 클록으로 동작하도록 정한다.[@autosar-cp-sws-timesyncoverflexray-2025]

AUTOSAR R25-11의 EthTSyn 명세는 EthTSyn이 Time Synchronization over Ethernet 프로토콜 명세가 정한 프로토콜을 다루고, 여기에 두 기능을 더하도록 정한다. 우선순위가 높은 PDU(Protocol Data Unit)가 낮은 PDU를 막지 않도록 시간 동기화 PDU의 송신 간격을 두는 debouncing과, Time Master와 Time Slave를 빨리 다시 동기화하도록 시간 동기화 메시지를 곧바로 보내는 기능이다. 두 Sync 메시지 사이에서 time base를 보간하는 일은 StbM이 맡는다. 링크 지연을 재는 Pdelay 프로토콜은 설정에 따라 Time Domain마다 돌리거나, 여러 Time Domain에 걸쳐 한 번만 돌린다.[@autosar-cp-sws-timesyncoverethernet-2025] 이 프로토콜과 IEEE 802.1AS의 차이는 [[ieee-802-1as#AUTOSAR 시간 동기화와의 차이|IEEE 802.1AS]]에서 다룬다.

## 보안 시간 동기화

AUTOSAR R25-11의 Time Synchronization over CAN 프로토콜 명세는 시간 동기화 메시지를 ICV(Integrity Check Value)로 보호해 무결성과 authenticity를 지키는 것을 선택 기능으로 둔다. 성능을 위해 ICV는 FUP 메시지에만 싣지만, ICV를 계산하는 데이터에는 SYNC와 FUP 메시지의 페이로드가 모두 든다.[@autosar-fo-prs-timesyncovercanprotocol-2025] AUTOSAR R25-11의 FrTSyn 명세도 SYNC 메시지를 ICV로 보호할 수 있게 한다.[@autosar-cp-sws-timesyncoverflexray-2025] AUTOSAR R25-11의 EthTSyn 명세는 EthTSyn이 이더넷 버스의 시간 동기화 메시지를 보호하는 기능을 지원하도록 둔다.[@autosar-cp-sws-timesyncoverethernet-2025]

AUTOSAR R25-11의 StbM 명세는 인증한 시간 동기화 메시지의 신선도를 [[secure-onboard-communication#Freshness Value|Freshness Value]]로 보장하도록 하고, Freshness Value를 주는 FVM(Freshness Value Manager)과 TSyn 모듈 사이의 인터페이스를 StbM에 맡긴다. FVM은 SW-C나 CDD(Complex Driver)로 만든다.[@autosar-cp-sws-synchronizedtimebasemanager-2025]

AUTOSAR R25-11의 CanTSyn 명세는 Time Master가 설정에 따라 [[autosar-crypto-stack#Crypto Service Manager|Csm]]의 `Csm_MacGenerate`나 `Csm_SignatureGenerate`를 불러 ICV를 만들고, Time Slave가 `Csm_MacVerify`나 `Csm_SignatureVerify`로 ICV를 검증하도록 정한다. CanTSyn은 Freshness Value를 StbM을 거쳐 FVM에서 받고, 보안 이벤트를 [[intrusion-detection-system-manager|IdsM]]에 보고한다.[@autosar-cp-sws-timesyncovercan-2025] AUTOSAR R25-11의 Layered Software Architecture는 보안 시간 동기화 구성의 송신 쪽과 수신 쪽 모두에 StbM, Csm, [[autosar-crypto-stack#Key Manager|KeyM]]을 두고, 메시지에는 잘라 낸 ICV를 싣도록 정한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## Adaptive Platform의 Time Synchronization

AUTOSAR Adaptive Platform R25-11의 Time Synchronization 명세는 응용이 다른 ECU와 동기화된 시간 정보를 얻는 API(Application Programming Interface)를 두고, 이 기능을 TBR(Time Base Resource)로 주도록 정한다. TBR의 종류는 Synchronized Master Time Base와 Synchronized Slave Time Base 둘이고, StbM이 주는 time base의 종류와 같은 설계를 따른다. TBR은 StbM처럼 실제 time base provider를 감추는 중개자 역할을 한다. TS(Time Synchronization) 모듈은 네트워크로 보내는 시간 동기화 메시지를 보호하는 기능도 지원한다. 프로토콜의 형식, 메시지 순서, 의미는 AUTOSAR 시간 동기화 프로토콜 명세를 따른다.[@autosar-ap-sws-timesynchronization-2025]

AUTOSAR R25-11의 Adaptive Platform 설계 설명서는 Time Synchronization 모듈이 TBR을 다른 노드의 time base에 맞추는 네트워크 시간 프로토콜을 스스로 갖지 않도록 두고, TBR 구현이 이더넷 시간 동기화 모듈 같은 곳에서 시간 정보를 받아 TBR을 맞출 수 있게 한다. 이 API는 Classic Platform의 StbM을 감싸되 C++의 `std::chrono`와 비슷한 꼴로 설계됐다.[@autosar-ap-exp-platformdesign-2025]
