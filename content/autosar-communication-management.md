---
title: AUTOSAR Communication Management
tags:
  - platform/autosar
verified: 2026-10-07
---

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 **Communication Management**(CM)를 분산 실시간 임베디드 환경에서 응용 사이 통신의 모든 측면을 맡는 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 functional cluster로 정의한다. 통신 상대를 찾고 잇는 실제 메커니즘을 추상화해, 응용 소프트웨어 구현자가 응용 자체의 목적에 집중하게 하려는 것이다.[@autosar-ap-exp-platformdesign-2025]

[[osi-model|OSI 모델]]의 데이터 링크 계층에서 Adaptive Platform의 통신은 [[ieee-802-3|IEEE 802.3]]의 이더넷 MAC(Medium Access Control) 프레임을 바탕으로 한다. 물리 계층으로는 [[100base-t1|100BASE-T1]], [[1000base-t1|1000BASE-T1]] 같은 [[automotive-ethernet|차량용 이더넷]] 기술을 쓸 수 있다. [[can-xl|CAN XL]]도 Adaptive Platform의 물리 계층 선택지이지만, 이때 Adaptive Platform은 이더넷 프레임을 CAN XL 네트워크로 터널링하는 것만 지원한다.[@autosar-ap-exp-platformdesign-2025] 머신 안팎의 서비스 지향 통신에서 Communication Management가 맡는 역할은 [[service-oriented-communication#서비스 발견|서비스 지향 통신]]에서 다룬다.

## 서비스

서비스는 기본 운영 소프트웨어가 이미 주는 것 너머로 응용에 제공하는 기능이다. Communication Management는 이런 서비스를 머신 안 통신과 머신 사이 통신에서 제공하거나 소비하는 메커니즘을 준다. 서비스는 Event, Method, Field의 조합으로 이뤄진다.[@autosar-ap-exp-platformdesign-2025] [[some-ip|SOME/IP]]에서 이 셋의 뜻은 [[service-oriented-communication#서비스 인터페이스|서비스 지향 통신]]에서 다룬다.

통신 상대 사이의 통신 경로는 설계 시점, 시작 시점, 실행 시점에 세울 수 있다. **Service Registry**는 중개를 맡는 Communication Management의 일부로, 그 메커니즘의 중요한 구성 요소다. 서비스를 제공하는 응용은 Service Registry에 서비스를 등록하고, 서비스를 쓰려는 응용은 Service Registry에 물어 필요한 서비스를 찾는다. 이 과정이 서비스 발견이다.[@autosar-ap-exp-platformdesign-2025]

## Language Binding과 Network Binding

Communication Management는 정의한 서비스를 응용 구현자에게 어떻게 보일지와, 그 서비스의 데이터를 네트워크에서 어떻게 나타낼지를 표준으로 정한다. 앞의 상위 계층을 **Language Binding**, 뒤의 하위 계층을 **Network Binding**이라 한다. 이로써 소스 코드의 이식성과, 플랫폼 구현이 달라도 컴파일한 서비스가 호환되는 것을 보장한다.[@autosar-ap-exp-platformdesign-2025]

Language Binding은 서비스의 Method, Event, Field를 대상 프로그래밍 언어의 기능을 써서 바로 접근할 수 있는 식별자로 옮긴다. 성능과, 대상 언어가 지원하는 만큼의 타입 안전이 주된 목표다. 그래서 대개 서비스 인터페이스 정의를 입력으로 받는 소스 코드 생성기로 구현한다.[@autosar-ap-exp-platformdesign-2025]

Network Binding은 설정한 서비스의 실제 데이터를 어떻게 직렬화해 특정 네트워크에 묶을지 정한다. 생성한 서비스별 레시피를 해석하거나 직렬화 코드를 직접 생성하는 방식으로 구현할 수 있다. Communication Management가 지원하는 Network Binding은 SOME/IP, DDS(Data Distribution Service), IPC(Inter-Process Communication, 그 밖의 사용자 정의 바인딩 포함), 시그널 기반 Network Binding인 Signal PDU(Protocol Data Unit), 시그널 기반 정적 Network Binding이다. 로컬 Service Registry도 Network Binding의 일부다. Language Binding과 Network Binding 사이의 인터페이스는 Communication Management 안의 비공개 인터페이스로 보아, 이를 정하는 규범 명세는 범위 밖이다.[@autosar-ap-exp-platformdesign-2025]

AUTOSAR R25-11 Communication Management 명세는 [[signal-based-communication|시그널 기반 통신]]을 쓰는 [[autosar-classic-platform|Classic Platform]]의 소프트웨어 컴포넌트와 정보를 주고받을 때 시그널 기반 통신과 서비스 지향 통신을 변환하게 한다. 시그널 기반 정보를 Adaptive Platform의 [[autosar-adaptive-platform#Machine과 프로세스|Machine]]에 내놓는 방법으로는 SOME/IP를 쓰는 것, 정적인 것, [[ieee-1722|IEEE 1722]]를 쓰는 것의 세 가지 시그널 기반 Network Binding을 둔다.[@autosar-ap-sws-communicationmanagement-2025] 이 변환은 [[service-oriented-communication#시그널 기반 통신과의 차이|서비스 지향 통신]]에서 다룬다.

## Proxy와 Skeleton

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 C++ Language Binding의 상위 인터페이스가 AUTOSAR 메타모델의 인터페이스 기술에 정의한 서비스를 객체 지향으로 대응시키게 한다. Communication Management 개발 도구의 생성기가 서비스마다 Field, Event, Method의 타입 안전한 표현을 담은 C++ 클래스를 만든다. 서비스 구현 쪽의 생성 클래스를 **Service Provider Skeleton**, 클라이언트 쪽의 생성 클래스를 **Service Requester Proxy**라 부른다.[@autosar-ap-exp-platformdesign-2025]

![[diagrams/ara-com-language-network-binding.svg]]

Proxy는 서비스 Method를 동기로 부르는 메커니즘과 비동기로 부르는 메커니즘을 준다. 동기 호출은 서버가 결과를 돌려줄 때까지 호출자를 막고, 비동기 호출은 부른 함수가 바로 돌아온다. 비동기 호출에서 호출자는 다른 일을 병행하다가, 서버의 반환값이 준비되면 Core Type `ara::core::Future`의 기능으로 결과를 받는다. 클라이언트는 Proxy 클래스를 바로 쓸 수 있지만, C++ 바인딩의 Skeleton은 추상 기반 클래스일 뿐이어서 서비스 구현이 생성된 기반 클래스를 상속해 기능을 구현해야 한다. 서버가 아직 없을 때 클라이언트 개발과 단위 테스트를 돕는 mock-up 클래스를 생성기가 만들게 설정할 수도 있다.[@autosar-ap-exp-platformdesign-2025]

`ara::com` 인터페이스는 safety-related E2E 보호 통신용 Proxy와 Skeleton도 줄 수 있다. 이 인터페이스는 E2E 보호를 켜든 끄든 응용과의 호환이 보장되게 설계됐다.[@autosar-ap-exp-platformdesign-2025]

## 정적 구성과 동적 구성

통신 경로는 설계 시점, 시작 시점, 실행 시점에 구성할 수 있어 정적이거나 동적이다.[@autosar-ap-exp-platformdesign-2025]

- **완전 정적 구성**: 서버가 모든 클라이언트를 알고 클라이언트도 서버를 알아, 서비스 발견이 전혀 필요 없다.
- **응용 코드의 발견 없음**: 클라이언트는 서버를 알지만 서버는 클라이언트를 모른다. 응용의 동적 통신 패턴은 Event 구독뿐이다.
- **응용의 완전한 서비스 발견**: 구성 시점에 아는 통신 경로가 없다. 응용 코드가 서비스 발견 API(Application Programming Interface)로 실행 중에 서비스 인스턴스를 고른다.[@autosar-ap-exp-platformdesign-2025]

## Service contract versioning

서비스 지향 아키텍처에서 서비스의 클라이언트와 제공자는 서비스 인터페이스와 동작을 아우르는 계약에 기댄다. 서비스를 개발하는 동안 인터페이스나 동작이 바뀔 수 있어, 서비스의 버전을 가리려고 service contract versioning을 들였다. Adaptive Platform은 서비스의 설계 단계와 배치 단계에서 계약 버전 관리를 지원한다. 클라이언트의 서비스 발견이 하위 호환을 지원하도록 설정하면, 클라이언트는 자기가 요구하는 버전과 하위 호환되는 여러 제공 버전에 연결할 수 있다.[@autosar-ap-exp-platformdesign-2025]

## Minimum Send Interval

AUTOSAR R25-11 Communication Management 명세는 수신자가 넘치거나 과부하되지 않도록 Event마다 Minimum Send Interval을 설정할 수 있게 한다. **Minimum Send Interval**은 연이은 두 송신 사이에 지나야 하는 최소 시간으로, 네트워크에서 그 Event의 최대 송신 빈도를 제한한다. 응용이 Event의 송신을 요청하면 `ara::com`은 마지막으로 하위 송신 계층에 넘긴 때부터 지난 시간이 Minimum Send Interval보다 큰지 확인한다. 크면 Event를 송신 계층에 넘기고 그때부터 새 간격을 재며, 아니면 요청을 버리고 `kMinimumSendIntervalViolationError` 오류를 돌려준다. 설정값 `minimumSendInterval`이 0이면 감시하지 않고, 기본값은 0이다. 같은 감시는 Trigger, 클라이언트의 Method 호출, Field의 Get과 Set 호출, Field의 송신 요청에도 설정할 수 있다.[@autosar-ap-sws-communicationmanagement-2025]

![[diagrams/minimum-send-interval-timeline.svg]]
