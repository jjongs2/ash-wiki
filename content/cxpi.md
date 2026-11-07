---
title: CXPI
tags:
  - network/vehicle-bus
aliases:
  - Clock Extension Peripheral Interface
verified: 2026-11-07
---

**CXPI**(Clock Extension Peripheral Interface)는 스위치나 센서 같은 단순한 장치까지 가는 선을 줄이려고 쓰는 차량용 저속 단선 네트워크로, 차량 제어 응용을 위해 만들어졌다. 클록을 만드는 노드가 비트마다 클록을 실어 보내 네트워크에 이어진 노드들을 동기화하고, 비트율은 20 kbit/s까지 지원한다.[@iso-20794-4-obp-2020] 매체와 비트율을 다른 버스와 견준 것은 [[vehicle-bus|차량 버스]]에서 다룬다.

## 쓰는 곳

CXPI는 도어 제어 그룹, 라이트 스위치, 공조 시스템 같은 차량 제어 응용을 위한 것이다. 단순한 장치로 가는 선 수를 줄여 차량 무게와 연료 소비를 줄이는 수단이 된다.[@iso-20794-4-obp-2020]

ISO 20794-4:2020은 CXPI의 차량 진단 통신 틀이 [[iso-14229-1|ISO 14229-1]], ISO 14229-2, ISO 14229-8로 이뤄진다고 제시한다.[@iso-20794-4-obp-2020] CXPI 위의 UDS는 [[uds#문서 구성|UDS]]에서 다룬다.

## 동작

**master 노드**는 폴링 방식을 포함한 스케줄 관리와 primary clock을 맡고, 선택적으로 sleep 메시지 송신 관리도 맡는 노드다. **slave 노드**는 master 노드가 아닌 노드다. master 노드가 내는 클록을 **primary clock**, 전용 slave 노드가 내는 클록을 **secondary clock**이라 한다.[@iso-20794-2-obp-2020]

메시지는 request 필드와 response 필드로 이뤄지고, request 필드에 담긴 request identifier에 해당하는 노드가 response 필드를 보낼 수 있다. 통신 방식은 둘이고, 노드마다 시스템을 설계할 때 고른다. event-triggered 방식에서는 노드가 내부 이벤트가 생기면 request protected identifier 필드와 response 필드를 요청할 수 있다. 폴링 방식에서는 master 노드가 request protected type identifier 필드를 요청하고, 그 뒤 각 노드가 request protected identifier 필드를 보낼 수 있다.[@iso-20794-2-obp-2020]

클록을 만드는 노드는 기본으로 master 노드이고, 이 노드는 CXPI 네트워크에 클록을 끊임없이 보낸다. 노드들은 네트워크에서 클록의 하강 에지로 클록이 있는지 알아내고, 클록을 만드는 노드에 맞춰 통신한다. 프레임이 오가지 않는 idle 상태에도 네트워크에는 노드들을 동기화하는 클록만은 흐른다.[@iso-20794-4-obp-2020]

CXPI 네트워크가 idle 상태면 이어진 어느 노드든 PID(Protected Identifier) 전송을 시작할 수 있다. 둘 이상의 노드가 같은 때에 PID를 보내기 시작하면 PID 값에 따른 [[bus-access-method#경쟁 방식|비파괴 중재]]로 버스 접근 충돌을 풀고, 우선순위가 가장 높은 PID 값을 보낸 노드가 버스를 얻는다. 프레임은 broadcast로 보내고, 받는 쪽은 acceptance filtering으로 고른다.[@iso-20794-4-obp-2020]

데이터 링크 계층은 바이트 값, [[cyclic-redundancy-check|CRC]] 값, 데이터 길이 코드 값과 그 확장 값, [[parity-bit|패리티]] 값, framing 값의 오류를 검출하고, 오류가 나면 상위 계층에 알린다.[@iso-20794-4-obp-2020]

## 문서 구성

ISO 20794 시리즈는 [[osi-model|OSI 참조 모델]]에 바탕을 두고, CXPI의 서비스와 프로토콜을 OSI 계층에 따라 여러 부로 나눠 정한다.[@iso-20794-4-obp-2020] ISO 20794-2:2020은 응용 계층 프로토콜을 정한다.[@iso-20794-2-obp-2020] ISO 20794-3:2020은 전송 계층과 네트워크 계층을 정하고, 이 전송 계층은 메시지를 패킷 하나로 바꾼다.[@iso-20794-3-obp-2020]

ISO 20794-4:2020은 데이터 링크 계층과 물리 계층을 정한다. 이 표준은 물리 계층의 요구를 넷으로 나눈다. physical signalling 부계층은 클록 생성, 프레임 부호화·복호화, 비트 단위 충돌 해소를, physical media attachment 부계층은 신호 파형을, physical media dependent 부계층은 네트워크 종단, 정전기 방전 보호, 커넥터를, physical media는 케이블과 와이어 하네스를 다룬다.[@iso-20794-4-obp-2020]

## 배경

JSAE(일본의 자동차 기술 단체)는 JASO(Japanese Automotive Standards) 규격의 제정과 개정을 맡고[@jsae-standard-2026], CXPI를 JASO D015 시리즈로 냈다. JSAE가 2021년 9월에 낸 영문 번역 JASO 목록에는 D015의 1부부터 7부까지가 올라 있고, 그 판은 1·3·5부가 2015년, 2·4부가 2016년, 6·7부가 2019년이다.[@jsae-jaso-list-2021]

SAE는 2015년 10월 Information Report SAE J3076을 냈고, 2022년 12월 이 문서를 안정화(Stabilized)했다.[@sae-j3076-2022]

## 트랜시버

S6BT112A01과 S6BT112A02는 MCU의 [[serial-communication|UART]]와 CXPI 버스 사이에 놓이는 CXPI 트랜시버로, 핀 하나의 입력 레벨로 master 노드와 slave 노드를 고른다. master로 쓰면 클록 핀으로 비트율 주파수의 클록을 받고, slave로 쓰면 그 핀으로 클록을 낸다.[@infineon-s6bt112a-2021]

BD41000AFJ-C도 MCU의 UART 송수신 핀과 CXPI 버스 사이에 놓이고, 외부 핀으로 master 모드와 slave 모드를 바꾼다. master로 쓰면 클록 핀이 입력이 되어, CXPI 통신을 하는 모드에서 버스 클록을 받는다.[@rohm-bd41000afj-c-2019]
