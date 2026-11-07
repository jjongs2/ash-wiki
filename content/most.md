---
title: MOST
tags:
  - network/vehicle-bus
aliases:
  - Media Oriented Systems Transport
verified: 2026-10-22
---

**MOST**(Media Oriented Systems Transport)는 차량의 멀티미디어·인포테인먼트 시스템에서 생기는 여러 신호와 데이터 스트림을 나르는 동기식 시분할 다중화(TDM, Time-Division Multiplexing) 네트워크다. QoS가 높은 오디오와 비디오를 패킷 데이터, 실시간 제어와 함께 나른다. 여러 비트율과 물리 계층을 지원하며, 비트율이 50 Mbit/s인 MOST 네트워크를 **MOST50**, 150 Mbit/s인 것을 **MOST150**이라 한다.[@iso-21806-1-obp-2020]

## 문서 구성

ISO 21806 시리즈는 [[osi-model|OSI 기본 참조 모델]]에 바탕을 두고, 아래 15부로 이뤄진다.[@iso-21806-1-obp-2020]

| 문서              | 다루는 것                                                                     |
| ----------------- | ----------------------------------------------------------------------------- |
| ISO 21806-1:2020  | MOST의 일반 정보와 정의[@iso-21806-1-obp-2020]                                |
| ISO 21806-2:2020  | 응용 계층[@iso-21806-2-obp-2020]                                              |
| ISO 21806-3:2020  | 응용 계층의 적합성 시험 계획[@iso-21806-3-obp-2020]                           |
| ISO 21806-4:2020  | 전송 계층과 네트워크 계층[@iso-21806-4-obp-2020]                              |
| ISO 21806-5:2020  | 전송 계층과 네트워크 계층의 적합성 시험 계획[@iso-21806-5-obp-2020]           |
| ISO 21806-6:2020  | 데이터 링크 계층[@iso-21806-6-obp-2020]                                       |
| ISO 21806-7:2020  | 데이터 링크 계층의 적합성 시험 계획[@iso-21806-7-obp-2020]                    |
| ISO 21806-8:2020  | 150 Mbit/s 광 물리 계층(MOST150 oPHY)[@iso-21806-8-obp-2020]                  |
| ISO 21806-9:2020  | 150 Mbit/s 광 물리 계층의 적합성 시험 계획[@iso-21806-9-obp-2020]             |
| ISO 21806-10:2021 | 150 Mbit/s 동축 물리 계층(MOST150 cPHY)[@iso-21806-10-obp-2021]               |
| ISO 21806-11:2021 | 150 Mbit/s 동축 물리 계층의 적합성 시험 계획[@iso-21806-11-obp-2021]          |
| ISO 21806-12:2021 | 50 Mbit/s balanced media 물리 계층(MOST50 bPHY)[@iso-21806-12-obp-2021]       |
| ISO 21806-13:2021 | 50 Mbit/s balanced media 물리 계층의 적합성 시험 계획[@iso-21806-13-obp-2021] |
| ISO 21806-14:2021 | lean 응용 계층[@iso-21806-14-obp-2021]                                        |
| ISO 21806-15:2021 | lean 응용 계층의 적합성 시험 계획[@iso-21806-15-obp-2021]                     |

## 기능

MOST는 MOST 노드를 하나 이상 담은 여러 멀티미디어 장치를 잇는 통신 기술로, 아래 기능을 준다.[@iso-21806-1-obp-2020]

- 동기·등시(isochronous) 스트리밍
- 통신 제어를 관리하는 데 드는 오버헤드가 작음
- 기능 중심의 계층적 시스템 모델
- function block(FBlock) 틀을 통한 API 표준화
- 각 기능을 어느 물리 장치에 둘지 자유롭게 정할 수 있음
- 서비스 발견과 통지
- ISO/IEC/IEEE 8802-3에 따른 [[ethernet|이더넷]] 통신. 차량에 쓸 수 있고 규모를 유연하게 키울 수 있음[@iso-21806-1-obp-2020]

**동기**는 두 신호의 대응하는 유의 순간 사이의 간격이 일정하게 정해진 것이고, **등시**는 한 신호의 잇따른 유의 순간 사이의 간격이 모두 같은 정격 길이이거나, 정격 길이가 단위 길이의 정수배인 것이다. 그래서 두 신호는 등시가 아니면서도 동기일 수 있다.[@iso-21806-1-obp-2020]

## 데이터 전송

MOST는 데이터 종류마다 채널을 따로 두어 낮은 지연으로 나르고, 네트워크 클록은 연속한 데이터 신호로 준다. 비등시(anisochronous) 패킷 데이터는 제어 데이터, 스트리밍 데이터와 따로 보내며, 이 세 데이터는 서로 간섭하지 않는다. MOST 네트워크의 장치들은 제어 채널 하나와 패킷 채널 하나를 함께 쓴다.[@iso-21806-1-obp-2020]

채널은 나르는 데이터에 따라 아래처럼 나뉜다. **스트리밍 데이터**는 동기나 등시로 보내는 오디오·비디오 같은 내용이다.[@iso-21806-1-obp-2020]

| 채널      | 나르는 것                                 |
| --------- | ----------------------------------------- |
| 제어 채널 | 제어 데이터. 지연이 낮은 작은 데이터 패킷 |
| 패킷 채널 | 패킷 데이터. 비등시 데이터 패킷           |
| 동기 채널 | 네트워크 프레임 위의 동기 데이터          |
| 등시 채널 | 네트워크 프레임 위의 등시 데이터          |

**스트리밍 연결**은 데이터 스트림이 끊기거나 충돌하거나 늦어지지 않도록 네트워크에 예약한 대역으로, connection label로 가린다. 스트리밍 데이터와 패킷 데이터에 대역을 얼마씩 나눠 줄지는 boundary descriptor라는 값이 정한다. **네트워크 프레임**은 MOST 네트워크의 다른 모든 프레임 종류가 바탕으로 삼는 프레임이다.[@iso-21806-1-obp-2020]

MOST Specification Rev. 3.0 E2는 패킷 채널에 모든 노드가 공평하게 [[bus-access-method#토큰 원리|토큰]] 링 방식으로 접근하게 하고, 이 채널의 대역을 boundary descriptor로 4바이트 단위로 조절하게 한다. 패킷 채널의 주소 방식은 16비트 target address를 쓰는 classic MOST addressing과 48비트 target address를 쓰는 [[mac-address|MAC]] addressing 둘이다. 등시 데이터는 동기 데이터처럼 소스 하나에서 수신 쪽 하나 이상으로 가므로 중재가 필요 없고, 등시 전송에는 [[cyclic-redundancy-check|CRC]] 같은 오류 검출이 없다.[@most-cooperation-spec-3-0-e2-2010]

## 노드와 장치

**MOST 장치**는 광 MOST 부품이나 전기 MOST 부품을 담은 [[electronic-control-unit|ECU]]이고, **MOST 네트워크**는 MOST 장치를 잇는 통신 네트워크다. MOST 장치 안의 MOST 네트워크 컨트롤러(MNC, MOST Network Controller)는 라우팅을 하고 MOST 네트워크의 자원을 관리한다. **MOST 노드**는 배정할 수 있는 논리 노드 주소를 갖고 MOST network service 라이브러리를 구현한 MOST 네트워크 안의 개체다. 하드웨어인 MOST 장치 하나가 노드를 둘 이상 담을 수도 있다.[@iso-21806-1-obp-2020]

노드는 TimingMaster, TimingSlave, listen-only 노드 가운데 하나다. **TimingMaster**는 네트워크 클록을 주고, **TimingSlave**는 MOST 네트워크에서 네트워크 클록을 얻는다. **listen-only 노드**는 네트워크 프레임의 내용을 바꾸지 않는다. 노드 사이의 점대점 전송에는 노드 위치와 상관없이 배정할 수 있는 논리 노드 주소를 쓴다.[@iso-21806-1-obp-2020]

ISO 21806-2:2020은 논리 노드 주소와 기능 주소를 대응시키는 조회 표인 central registry를 관리하는 노드를 **NetworkMaster**로, 자기 FBlock을 NetworkMaster에 알리는 노드를 **NetworkSlave**로, MOST 네트워크의 기동과 종료를 제어하는 노드를 **PowerMaster**로 정의한다. 스트리밍 연결을 관리하는 connection manager에 인터페이스를 주는 FBlock은 **ConnectionMaster**다.[@iso-21806-2-obp-2020]

## 토폴로지

MOST 네트워크의 장치는 링 구조로 이어진다.[@most-cooperation-spec-3-0-e2-2010][@smsc-most-backgrounder-2005]

MOST Specification Rev. 3.0 E2는 MOST 시스템의 노드를 64개까지로 정한다. ring break diagnosis는 장치마다 상대 노드 위치를 정해, 링이 끊기거나 감쇠로 lock을 잡을 수 없거나 장치에 결함이 있는 치명 오류가 난 자리를 찾게 한다. 진단이 오류로 끝나면 이 위치는 진단이 끝날 때 TimingMaster로 설정된 장치에 대한 상대 위치다.[@most-cooperation-spec-3-0-e2-2010]

## 프레임

이 명세는 MOST의 속도 등급(speed grade)을 **MOST25**, MOST50, MOST150이라 부른다. 부록 D(informative)는 MOST150 프레임 하나를 3072비트(384바이트)로 들고, 앞 12바이트는 프리앰블, boundary descriptor, 제어 데이터 4바이트 등을 담는 관리 영역으로, 나머지 372바이트는 패킷 데이터와 스트리밍 데이터 전송에 쓰는 구성을 제시한다. 시스템의 샘플링 주파수로는 44.1 kHz와 48 kHz를 들고, 그 가운데 48 kHz를 권장값으로 제시한다.[@most-cooperation-spec-3-0-e2-2010]

## 역사

MOST는 1990년대 말 차량의 복잡한 오디오 응용을 지원하려고 처음 개발되었고, MOST Cooperation은 1998년에 세워졌다.[@iso-21806-1-obp-2020]
