---
title: Decentralized Environmental Notification Message
tags:
  - network/v2x
aliases:
  - DENM
verified: 2026-11-21
---

**DENM**(Decentralized Environmental Notification Message)은 도로 위의 해저드나 비정상 교통 상황에 관한 정보(종류, 위치 등)를 담는 메시지다. ITS-S(ITS Station) 응용이 요청하면 [[v2x#Facilities 계층|facilities 계층]]의 DEN(Decentralized Environmental Notification) service가 DENM을 만들고, DENM은 대개 지리적 영역 안의 ITS-S들에 전파된다. DENM이 알리는 사건은 종류, 기준 위치, 감지 시각, 지속 시간으로 나타낸다. 응용은 DENM의 정보를 주로 감지된 사건을 도로 사용자나 자동 운전 시스템에 알리는 데 쓴다.[@etsi-ts-103-831-2025]

## 쓰는 곳

받는 ITS-S는 받은 DENM의 정보가 자기에게 관련 있으면 그 정보를 자동 운전 시스템 같은 차량 시스템이나 헤드업 디스플레이에 넘겨, 사용자에게 경고나 정보를 보일 수 있다. ETSI TS 103 831 V2.3.1은 NOTE로, DENM을 먼 거리나 중앙 개체로 보내 차량 경로 변경이나 도로 교통 관리에 쓸 수도 있다고 제시한다.[@etsi-ts-103-831-2025]

## 생성과 종료

사건에는 차량 자신이 일으킨 전자 브레이크등(electronic brake light) 사건처럼 그 차량의 ITS-S가 송신과 종료를 맡는 것도 있고, 노면의 블랙 아이스처럼 여러 차량이 같은 사건을 감지해 저마다 DENM을 보내는 것도 있다.[@etsi-ts-103-831-2025]

이 명세는 DENM의 종류로 New, Update, Cancellation, Negation 넷을 정한다.[@etsi-ts-103-831-2025]

- **New DENM**: 사건을 처음 알린다. New DENM마다 새 actionId를 준다.
- **Update DENM**: 같은 사건의 갱신 정보를 담고, 그 사건의 New DENM을 만든 ITS-S가 보낸다.
- **Cancellation DENM**: 사건이 끝났음을 알리고, 그 사건의 New DENM을 만든 ITS-S만 보낼 수 있다.
- **Negation DENM**: 다른 ITS-S에게서 받은 DENM의 사건이 끝났음을 알리고, 그 사건의 New DENM을 만든 ITS-S가 아닌 ITS-S가 보낼 수 있다.[@etsi-ts-103-831-2025]

DEN service는 적어도 New와 Update DENM을 만들 수 있어야 하고, Cancellation과 Negation DENM을 만드는 것은 선택이다. 사건은 actionId로 식별하고, actionId는 ITS-S 식별자와 sequence number를 합친 것이다. ITS-S 식별자는 사건을 처음 감지한 ITS-S의 stationId이거나, 교통 관리 센터처럼 ITS-S에 정보를 주는 중앙 개체의 가상 stationId다. DENM을 갱신할 때마다 referenceTime을 앞 갱신보다 큰 값으로 새로 한다. 두 갱신 사이에는 DENM을 정해진 간격으로 되풀이해 보낼 수 있는데, 사건이 유효한 동안 목적 영역에 새로 들어오는 ITS-S도 DENM을 받게 하려는 것이다. 보내는 ITS-S에서 DENM의 유효 기간은 감지 시각부터 세어, 응용이 유효 기간을 주면 그 값이고 주지 않으면 기본값 600 s다.[@etsi-ts-103-831-2025]

![[diagrams/denm-message-types-sequence.svg]]

DEN service는 목적 영역을 원, 직사각형, 타원 가운데 하나로 네트워크·전송 계층에 넘긴다. 받는 ITS-S가 보낸 ITS-S의 직접 통신 범위 밖에 있으면 중간 ITS-S가 DENM을 포워딩할 수 있고, 이 포워딩은 네트워크·전송 계층이 맡는다. 받은 DENM을 저장했다가 필요할 때 다른 ITS-S에 다시 보내는 facilities 계층의 KAF(Keep-Alive Forwarding)는 DEN service의 선택 기능이다.[@etsi-ts-103-831-2025]

## 메시지 구조

DENM은 공통 header 하나와 여러 container로 이뤄진다. header는 프로토콜 버전, 메시지 종류, 보내는 ITS-S의 stationId를 담고, 모든 DENM에 있다. container는 다음과 같다.[@etsi-ts-103-831-2025]

| container            | 담는 것                                | 넣는 DENM                          |
| -------------------- | -------------------------------------- | ---------------------------------- |
| Management container | DENM 관리와 프로토콜에 관한 정보       | 모든 DENM                          |
| Situation container  | 감지한 사건의 종류                     | New·Update DENM                    |
| Location container   | 사건 위치의 추가 정보와 감지 구역      | New·Update DENM                    |
| À La Carte container | 앞의 container에 없는 사용 사례별 정보 | New·Update DENM 가운데 해당할 때만 |

Cancellation·Negation DENM에는 header와 Management container만 둔다. DENM은 ITU-T X.691이 정한 Unaligned Packed Encoding Rules로 인코딩한다.[@etsi-ts-103-831-2025]

## Release 1과 Release 2

DEN service의 Release 1 판은 ETSI EN 302 637-3으로 나왔고, 거기서는 DEN basic service라 불렸다. Release 2 판은 모두 최신 Release 1 판에 바탕을 두고 그와 하위 호환이어서, Release 1 구현은 Release 2 DENM을 받아 디코딩하고 Release 2 내용을 몰라도 Release 1 내용을 쓸 수 있다.[@etsi-ts-103-831-2025]

ETSI EN 302 637-3 V1.3.1은 ETSI TS 101 539-1\~3이 정한 응용(도로 위험 신호, 교차로 충돌 위험 경고, 종방향 충돌 위험 경고)에서 DENM을 전파할 때 [[v2x#GeoNetworking과 BTP|BTP]] header type B와 GeoBroadcast를 쓰게 한다. DEN basic service의 명세는 처음 [[v2x#쓰는 곳|C2C-CC]]의 Manifesto와 DENM 메시지 기술 문서에서 개발됐다.[@etsi-en-302-637-3-2019]
