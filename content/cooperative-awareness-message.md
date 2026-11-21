---
title: Cooperative Awareness Message
tags:
  - network/v2x
aliases:
  - CAM
verified: 2026-11-21
---

Cooperative awareness는 도로 사용자와 노변 인프라가 서로의 위치, 동역학, 속성을 아는 것이다. 차량 사이와 차량·노변 인프라 사이에서 [[v2x|V2X]] 네트워크라 부르는 무선망으로 정보를 정기적으로 주고받아 이루고, 그 정보를 담아 주기적으로 보내는 메시지를 **CAM**(Cooperative Awareness Message)이라 한다. CAM은 보내는 ITS-S(ITS Station)의 상태와 속성을 담고, 내용은 ITS-S의 종류에 따라 다르다. 차량이면 상태에는 시간, 위치, 운동 상태, 켜진 시스템 등이, 속성에는 치수, 차종, 도로 교통에서의 역할 등이 든다. 받는 ITS-S는 보낸 ITS-S의 상태를 자기 상태와 견주어 그와의 충돌 위험을 어림하고, 필요하면 운전자에게 알릴 수 있다.[@etsi-ts-103-900-2026]

ETSI TS 103 900 V2.3.1은 CAM을 보낸 ITS-S에서 직접 통신 범위 안의 ITS-S로 single hop으로만 퍼뜨리게 하고, 받은 CAM은 다른 ITS-S로 전달하지 않게 하며, 차량 CAM의 생성 간격 $T$를 $100\,\mathrm{ms} \le T \le 1000\,\mathrm{ms}$로 제한한다. 이 범위 안에서 CAM 생성은 보내는 ITS-S의 동역학과 채널 혼잡 상태에 따라 트리거된다.[@etsi-ts-103-900-2026]

## 쓰는 곳

받은 CAM의 정보로는 받는 ITS-S의 facilities 계층 데이터베이스인 [[v2x#Facilities 계층|LDM]]을 갱신할 수 있고, ITS-S 응용은 그 정보를 LDM에서 꺼내 쓸 수 있다. CAM으로 얻은 다른 ITS-S에 관한 인식(awareness)은 네트워크·전송 계층이 위치에 따른 메시지 전파에 쓸 수도 있다.[@etsi-ts-103-900-2026]

## 생성

차량 CAM의 생성 간격 $T$는 $\mathrm{T\_GenCamMin} \le T \le \mathrm{T\_GenCamMax}$이고, T_GenCamMin은 100 ms, T_GenCamMax는 1000 ms다. 생성 조건은 주기 T_CheckCamGen마다 검사하고, $\mathrm{T\_CheckCamGen} \le \mathrm{T\_GenCamMin}$이다. 검사는 임의의 시점에 시작하고 실시간 클록에 동기하지 않는다. 마지막 CAM 생성에서 흐른 시간을 $t$라 하면, 아래 둘 가운데 하나를 만족할 때 CAM을 만든다.[@etsi-ts-103-900-2026]

1. $t \ge \mathrm{T\_GenCam\_Dcc}$이고, 지난 CAM에 담은 값과 견준 heading 차이 $\Delta h$, 위치 사이의 거리 $\Delta p$, 속도 차이 $\Delta v$ 가운데 하나가 $\Delta h > 4^\circ$, $\Delta p > 4\,\mathrm{m}$, $\Delta v > 0.5\,\mathrm{m/s}$이다.
2. $t \ge \mathrm{T\_GenCam}$이고 $t \ge \mathrm{T\_GenCam\_Dcc}$이다.[@etsi-ts-103-900-2026]

T_GenCam_Dcc는 채널 혼잡에 맞춰 연속한 두 CAM 생성 사이의 최소 간격을 주는 값으로, $\mathrm{T\_GenCamMin} \le \mathrm{T\_GenCam\_Dcc} \le \mathrm{T\_GenCamMax}$이고 [[v2x#ITS station 참조 구조|관리 개체]]가 주지 않으면 T_GenCamMin이다. T_GenCam은 지금 유효한 생성 간격의 상한으로 기본값이 T_GenCamMax다. 조건 1로 CAM이 생기면 T_GenCam은 마지막 생성에서 흐른 시간이 되고, 그 뒤 조건 2로 CAM을 연속 N_GenCam개 만들면 T_GenCamMax로 돌아간다. 동역학 때문에 줄어든 생성 간격은 연속한 여러 CAM 동안 유지된다. N_GenCam은 환경에 따라 바꿀 수 있고, 기본값이자 최댓값은 3이다.[@etsi-ts-103-900-2026]

![[diagrams/cam-generation-conditions.svg]]

생성이 트리거된 때부터 CAM을 네트워크·전송 계층에 넘길 때까지의 생성 시간 $t_\mathrm{gen}$은 $t_\mathrm{gen} < 50\,\mathrm{ms}$여야 한다. 차량 CAM의 타임스탬프는 그 CAM에 실은 기준 위치를 정한 시각이고, 노변 인프라 CAM의 타임스탬프는 생성 시각이다.[@etsi-ts-103-900-2026]

## 메시지 구조

CAM은 facilities 계층 메시지에 공통인 header 하나와 여러 container로 이뤄진다. header는 프로토콜 버전, 메시지 종류, 보내는 ITS-S의 식별자를 담는다. container는 다음과 같다.[@etsi-ts-103-900-2026]

- **basic container**: 모든 CAM에 있다. 보내는 ITS-S의 station ID(고유 식별자), 종류, CAM을 만들 때 얻은 최근 위치를 담는다.
- **high frequency container**: 모든 CAM에 하나 있다. 차량 CAM은 차량의 빠르게 바뀌는 동적 상태를 모두 담고, 노변 인프라 CAM은 보호 통신 구역 정보를 담는다.
- **low frequency container**: 차량 CAM에만 넣을 수 있고, 외부 조명 상태 같은 정적이거나 느리게 바뀌는 데이터를 담는다. 서비스가 켜진 뒤 첫 CAM에 넣고, 그 뒤로는 마지막으로 넣은 CAM의 생성에서 500 ms 이상 지나면 넣는다.
- **special vehicle container**: 대중교통, 긴급 차량처럼 도로 교통에서 특정 역할을 맡은 차량의 CAM에만 넣는다.
- **extension container**: 차량 CAM에 하나 이상 넣을 수 있는 Release 2의 확장으로, two-wheeler container, eHorizon location sharing container, very low frequency container 등이 있다.[@etsi-ts-103-900-2026]

![[diagrams/cam-header-containers.svg]]

## Release 1과 Release 2

이 명세는 Release 2의 서비스 명세로, CAM을 만드는 facility를 **CAS**(Cooperative Awareness Service)라 부르고 도로 교통에 참여하는 모든 종류의 ITS-S에 둘 수 있는 facility로 둔다. 노변 인프라 CAM의 생성 간격 $T$는 $T \ge 500\,\mathrm{ms}$로 둔다. CAS의 Release 1 판은 ETSI EN 302 637-2로 나왔다. Release 2 판은 모두 최신 Release 1 판에 바탕을 두고 그와 하위 호환이어서, Release 1 구현은 Release 2 CAM을 받아 디코딩하고 Release 2 내용을 몰라도 Release 1 내용을 쓸 수 있다.[@etsi-ts-103-900-2026]

ETSI EN 302 637-2 V1.4.1은 같은 facility를 CA(Cooperative Awareness) basic service라 부르고, 도로 교통에 참여하는 모든 종류의 ITS-S에 필수인 facility로 둔다. 패킷 전송 종류와 헤더 종류로는 [[v2x#GeoNetworking과 BTP|GeoNetworking SHB와 BTP]] header type B를 쓰게 하고, 이 둘은 GeoNetworking/BTP 스택을 쓸 때의 것이다. 이 표준은 RSU(Road Side Unit) ITS-S의 CAM 생성 간격 $T$를 $T \ge 1000\,\mathrm{ms}$로 둔다. CA basic service의 명세는 처음 유럽의 [[v2x#쓰는 곳|C2C-CC]]에서 개발됐다.[@etsi-en-302-637-2-2019]

ETSI TS 103 900 V2.3.1과 EN 302 637-2 V1.4.1은 모두 CAM을 ITU-T X.691이 정한 Unaligned Packed Encoding Rules로 인코딩하게 한다.[@etsi-ts-103-900-2026][@etsi-en-302-637-2-2019]
