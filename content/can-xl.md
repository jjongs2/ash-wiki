---
title: CAN XL
tags:
  - network/can
aliases:
  - CAN Extended Data-Field Length
verified: 2026-10-06
---

**CAN XL**(CAN Extended Data-Field Length)은 [[can|CAN]] 데이터 링크 계층에서 데이터 필드를 2048바이트까지 쓸 수 있게 한 프레임 포맷이다.[@iso-11898-1-obp-2024] CiA(CAN 사용자·제조사의 국제 단체)는 CAN XL을 classical CAN과 [[can-fd|CAN FD]]에 이은 셋째 세대 CAN 데이터 링크 계층 프로토콜이라 부른다.[@cia-can-history-2026][@cia-about-us-2026]

[[iso-11898-1|ISO 11898-1:2024]]는 classic, CAN FD, CAN XL 프레임 포맷을 모두 지원하는 구현을 [[iso-11898-1#범위|구현 옵션]] 넷째로 둔다.[@iso-11898-1-obp-2024]

## 프레임 포맷

이 표준은 **XL 프레임 포맷**(XLFF, XL Frame Format)을 11비트 [[can-identifier|식별자]]를 쓰고 데이터를 2048바이트까지 담으며, [[can-fd#두 비트율|데이터 구간]]의 시작과 끝에서 비트율을 바꾸는 데이터 프레임 포맷으로 정의한다. 이 포맷을 쓰는 데이터 프레임은 **XL 프레임**으로 정의한다.[@iso-11898-1-obp-2024] 다른 프레임 포맷과의 비교는 [[can-frame#기본 포맷과 확장 포맷|CAN 프레임]]에서 다룬다.

이 표준은 데이터 링크 계층을 LLC(Logical Link Control)와 MAC(Medium Access Control) 부계층으로 나누고, 둘 사이의 서비스 데이터 단위를 LLC 프레임으로 구현한다. LLC 프레임에는 상위 계층 프로토콜의 설정과 식별 정보를 주는 SDT(Service Data Unit Type)와 VCID(Virtual CAN Channel Identifier)를 두고, 상위 계층 기능을 어떻게 다루는지는 정하지 않는다.[@iso-11898-1-obp-2024]

## 물리 부호화와 트랜시버 모드

이 표준은 PCS(Physical Coding Sublayer)가 [[can-transceiver#FAST 모드|CAN SIC XL 트랜시버]]로 넘길 PWM(Pulse-Width Modulation) 부호화를 맡고, 그 복호화는 트랜시버가 맡는다고 정한다.[@iso-11898-1-obp-2024]

이 표준은 [[dominant-and-recessive|dominant]] 비트가 recessive 비트를 덮어쓸 수 있는 PCS의 동작 모드를 **중재 모드**(arbitration mode)로 정의한다. PMA(Physical Medium Attachment) 부계층의 동작 모드는 **트랜시버 모드**로 정의하고, 그 가운데 PMA가 버스 상태를 중재 모드와 다르게 구동할 수 있는 모드를 **data TX 모드**, 버스 상태가 중재 모드 때와 다를 수 있는 모드를 **data RX 모드**로 정의한다.[@iso-11898-1-obp-2024]

## 오류 신호

이 표준은 **protocol exception event**를, 앞으로 나올 새 프레임 포맷을 용인하려고 정해진 규칙에서 벗어나는 것이나 오류 신호를 끈 CAN XL에서 오류에 반응하는 것으로 정의한다. 이 표준은 protocol exception event 뒤에 idle 조건을 기다리는 노드도 [[can-controller#노드 상태|integrating]] 상태에 둔다.[@iso-11898-1-obp-2024]

Bosch의 CAN XL 개요에 따르면 CAN XL에는 오류 신호를 켠 모드와 끈 모드가 있고, 모드는 실행 중에 소프트웨어로 설정하며, 한 네트워크의 노드는 모두 같은 모드를 써야 한다. 오류 신호를 켜면 CAN FD처럼 오류를 [[can-error-frame#오류 플래그|오류 플래그]]로 알리고, 버스에 classical CAN, CAN FD, CAN XL 프레임이 함께 다닐 수 있다. 오류 신호를 끄면 오류를 알리지 않는다. 수신 노드는 오류가 나면 진행 중인 송신이 끝나기를 기다려 다시 통합하고, 송신 노드는 송신 오류를 검사하지 않고 프레임을 끝까지 보낸다. 이 모드는 CAN FD와 호환되지 않아 버스에는 CAN XL 프레임만 다닌다.[@bosch-can-xl-overview-2023]

Bosch X_CAN은 오류 신호를 끄는 설정 비트 `EFDI`를 켜면 오류 계수기를 올리지 않고 CAN XL 프레임만 보내며, dominant인 FDF(FD Format) 비트나 XLF(XL Format) 비트를 받으면 [[can-error-detection#다섯 가지 오류|형식 오류]]로 다룬다.[@bosch-x-can-2024]

## 프레임 구성

Bosch의 CAN XL 개요에 따르면 CAN XL 데이터 프레임의 필드는 아래 순서로 나간다.[@bosch-can-xl-overview-2023]

| 필드                           | 길이          | 구실                                                                                          |
| ------------------------------ | ------------- | --------------------------------------------------------------------------------------------- |
| 우선순위 ID(Identifier)        | 11비트        | 버스 접근 우선순위를 정한다.                                                                  |
| 포맷 전환 비트                 |               | CAN FD 포맷에서 XL 포맷으로 바꾼다.                                                           |
| ADS(Arbitration Data Sequence) |               | 중재 구간의 비트율에서 데이터 구간의 비트율로 바꾼다.                                         |
| SDT                            | 8비트         | 데이터 필드에 실린 프로토콜의 종류를 알린다. [[ethernet\|이더넷]]의 EtherType에 견줄 수 있다. |
| SEC(Simple Extended Content)   | 1비트         | 보안이나 분할 같은 다른 2계층 기능이 데이터 필드에 헤더를 더했는지 알린다.                    |
| [[data-length-code\|DLC]]      | 11비트        | 데이터 길이 코드                                                                              |
| SBC(Stuff Bit Count)           |               | 중재 필드의 동적 스터프 비트 수로, 특정 오류를 막는다.                                        |
| PCRC(Preface CRC)              | 13비트        | PCRC 앞까지의 비트를 지킨다.                                                                  |
| VCID                           | 8비트         | 버스를 가상 버스로 나눈다. 이더넷의 [[virtual-lan\|VLAN]] ID에 견줄 수 있다.                  |
| AF(Acceptance Field)           | 32비트        | 주소 지정에 쓰고, 해석은 SDT에 따른다.                                                        |
| 데이터                         | 1\~2048바이트 | 사용자 데이터                                                                                 |
| FCRC(Frame CRC)                | 32비트        | FCRC 앞까지 프레임 전체를 지킨다.                                                             |
| FCP(Format Check Pattern)      |               | 수신 노드가 송신 비트열에 맞춰져 있는지 검사한다.                                             |
| DAS(Data Arbitration Sequence) |               | 데이터 구간의 비트율에서 중재 구간의 비트율로 바꾼다.                                         |
| [[can-acknowledgement\|ACK]]   |               | CAN FD와 같은 긍정 응답                                                                       |
| EOF(End of Frame)              |               |                                                                                               |

![[diagrams/can-xl-frame-fields.svg]]

PCRC와 FCRC의 [[can-crc|CRC]]는 모두 [[hamming-distance|해밍 거리]] 6을 준다. 중재 필드에서는 동적 [[can-bit-stuffing|스터프 비트]]를 넣고, XL 데이터 구간에서는 데이터 10비트마다 스터프 비트 하나를 넣는 고정 스터핑을 쓰며, 그 뒤로는 스터프 비트를 넣지 않는다.[@bosch-can-xl-overview-2023]

CAN XL은 버스 접근 우선순위를 정하는 짧은 11비트 우선순위 ID와 메시지를 식별하는 32비트 ID를 나눈다. 우선순위 ID가 짧아 페이로드가 짧아도 순 비트율이 높고, 메시지 ID는 XL 데이터 구간의 AF에 실린다. AF의 해석은 SDT에 따르고, [[message-addressing|내용 기반 주소 지정]](메시지 ID)과 노드 기반 주소 지정(출발지·목적지 주소)을 모두 지원한다.[@bosch-can-xl-overview-2023]

## CAN FD와 섞어 쓰기

CAN FD 프레임의 res 비트는 앞으로의 프로토콜 확장을 위해 남겨 둔 비트다. CAN FD 노드는 이 비트가 0이면 CAN FD 프레임을 기대하고, 1이면 수동으로 기다리는 버스 통합 상태에 들어가 recessive 11비트를 보고 CAN XL 프레임이 끝나면 통합을 마친다. 그래서 CAN FD 노드와 CAN XL 노드를 한 버스에 섞어 쓸 수 있고, 이때 CAN XL은 SIC(Signal Improvement Capability) 모드로만 동작해 트랜시버 모드를 바꾸지 않는다. 섞어 쓰려면 CAN XL의 오류 신호를 켜야 한다.[@bosch-can-xl-overview-2023]

## 비트율

CAN XL의 중재 구간 비트율 $R_\mathrm{b,N}$은 1 Mbit/s 이하이고, 데이터 구간 비트율 $R_\mathrm{b,D}$는 사용자가 트랜시버와 토폴로지에 맞춰 20 Mbit/s까지 정한다. 두 비트율은 $2R_\mathrm{b,N} \le R_\mathrm{b,D} \le 40R_\mathrm{b,N}$을 만족한다.[@bosch-can-xl-overview-2023]

이 개요는 CAN XL에 쓸 수 있는 트랜시버마다 데이터 구간 비트율을 아래처럼 제시한다. 고속 CAN 트랜시버와 CAN FD 트랜시버의 값은 기존 버스 토폴로지에서 현실적인 값이다.[@bosch-can-xl-overview-2023]

| 트랜시버            | 데이터 구간 비트율 |
| ------------------- | ------------------ |
| 고속 CAN 트랜시버   | 1 Mbit/s           |
| CAN FD 트랜시버     | 2 Mbit/s           |
| CAN SIC 트랜시버    | 5나 8 Mbit/s       |
| CAN SIC XL 트랜시버 | 20 Mbit/s까지      |

이 개요에 따르면 이 트랜시버들은 모두 CAN XL에 쓸 수 있고 핀이 호환된다.[@bosch-can-xl-overview-2023]

이 개요에 따르면 CAN XL 프로토콜 컨트롤러는 ADS와 DAS 동안 CAN SIC XL 트랜시버에 SIC 모드와 FAST 모드 사이의 전환을 알리고, FAST 모드에서는 [[can-error-frame|오류 프레임]]을 쓸 수 없다.[@bosch-can-xl-overview-2023]

XS_CAN의 프로토콜 컨트롤러는 클록 160 MHz에서 CAN XL 데이터 구간을 20 Mbit/s까지, CAN FD와 CAN XL의 중재 구간을 1 Mbit/s까지 지원한다.[@bosch-xs-can-2026]

## 제품 예

Bosch X_CAN은 CAN XL을 지원하는 CAN 통신 컨트롤러 IP(Intellectual Property)로, SoC(System on Chip)에 넣을 수 있다. ISO 11898-1:2015와 CiA 610-1을 따르고, classical CAN은 8바이트·1 Mbit/s까지, CAN FD는 64바이트·8 Mbit/s까지, CAN XL은 2048바이트·20 Mbit/s까지 지원한다. 슬롯을 32개까지 둘 수 있는 우선순위 큐 1개와, 메시지를 1024개까지 담는 송신 FIFO 큐와 수신 FIFO 큐를 8개씩 두고, 송신 필터 요소는 16개, 수신 필터 요소는 255개까지 둔다.[@bosch-x-can-2024]

Bosch XS_CAN은 ISO 11898-1:2024에 따라 classical CAN, CAN FD, CAN XL로 통신하는 CAN 컨트롤러 IP이고, 버스에 이으려면 트랜시버가 따로 필요하다. 송신 FIFO 큐 1개, 수신 FIFO 큐 2개, 슬롯을 32개까지 둘 수 있는 송신 우선순위 큐 1개를 두고, 수신 필터 요소는 127개까지 둔다.[@bosch-xs-can-2026]

## 개발 경위

CiA는 2018년 말 Volkswagen의 요청으로 CAN XL 개발을 시작했다. CiA에 따르면 PWM 부호화는 NXP의 전문가들이 처음 제안했고, ISO 11898-1:2024는 CiA 610-1에 있던 CAN XL 규격을 넣었다.[@cia-can-history-2026] CiA에 따르면 CAN XL은 2021년 제17회 iCC(international CAN Conference)에서 공식 발표되었다.[@cia-611-2026] CiA는 CiA 610-1과, PWM을 쓰는 CAN XL SIC PMA를 정했던 CiA 610-3을 철회했다.[@cia-612-2026]

CiA에 따르면 CAN XL은 백본과 서브 백본 네트워크를 위한 것이고, [[internet-protocol-suite|TCP/IP]] 네트워크 시스템에 쉽게 통합되도록 설계되었다.[@cia-can-xl-2026]

## CiA 문서

CiA 611 시리즈는 상위 계층의 PDU(Protocol Data Unit)를 CAN XL LLC 부계층의 데이터 필드에 싣는 서비스와 프로토콜을 정한다.[@cia-611-2026] CiA 612 시리즈는 CAN XL 시스템 설계 지침이다.[@cia-612-2026] CiA 613 시리즈는 CAN XL 프레임의 부가 서비스를 정한다.[@cia-613-2026] 2026년 10월 기준 시리즈마다 문서는 아래와 같다.

| 문서                     | 단계                              | 다루는 것                                                                                                                                                                                                                        |
| ------------------------ | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CiA 611-1 version 2.0.0  | DSP(Draft Specification Proposal) | SDT 필드의 쓰임을 정한다. 내용 기반 주소 지정에 쓰는 SDT, classical CAN이나 CAN FD 프레임을 싣는 SDT, [[ieee-802-3\|IEEE 802.3]] MAC 프레임을 싣는 SDT를 둔다.[@cia-611-2026][@cia-can-xl-2026][@cia-can-community-news-13-2024] |
| CiA 611-1 version 2.0.1  | WD(Work Draft)                    | version 2.0.0의 뒤 버전으로, 제목은 version 2.0.0과 같다.[@cia-611-2026]                                                                                                                                                         |
| CiA 611-2 version 1.0.0  | DSP                               | 여러 PDU를 CAN XL 데이터 프레임 하나에 묶어 보내는 multi-PDU 프로토콜을 정한다.[@cia-611-2026]                                                                                                                                   |
| CiA 612-1 version 0.0.9  | WD                                | 네트워크 설계, 클록 허용 오차, 비트 타이밍 설정, 트랜시버 동작 모드, MAC 프레임 필드의 쓰임, 우선순위 ID[@cia-612-2026]                                                                                                          |
| CiA 612-2                |                                   | PWM 기반 AUI(Attachment Unit Interface)와 물리 신호 요건[@cia-612-2026]                                                                                                                                                          |
| CiA 612-3 version 0.0.2  | WD                                | SIC와 CAN SIC XL의 중재 비트율 선택지에 대한 권고[@cia-612-2026]                                                                                                                                                                 |
| CiA 613-1 version 0.0.5  | WD                                | 부가 기능을 SEC 비트로 알리는 방법[@cia-613-2026]                                                                                                                                                                                |
| CiA 613-2 version 1.0.0  | DSP                               | [[ieee-802-1ae\|MACsec]]의 보안 기능을 다시 써서 CAN XL 데이터 링크 계층에서 데이터의 무결성, 신선도, 출처 인증, 기밀성을 지키는 CANsec 데이터 평면[@cia-613-2026]                                                               |
| CiA 613-3 version 0.0.11 | WD                                | 긴 CAN XL 프레임을 조각으로 나눠 보내, 송신이 끊겨도 끊긴 조각부터 다시 보내게 하는 LLC 프레임 분할[@cia-613-2026]                                                                                                               |
