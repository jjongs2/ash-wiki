---
title: CAN FD light
tags:
  - network/can
verified: 2026-10-06
---

[[iso-11898-1|ISO 11898-1:2024]]는 **CAN FD light**를 [[can|CAN]] 기능의 일부에 바탕을 둔 responder 노드의 구현 옵션으로 정의한다. CAN FD light 통신을 시작하려고 responder 노드에 데이터 프레임을 보내는 노드를 **commander 노드**로, commander 노드가 CAN FD light 통신으로 제어하는 노드를 **responder 노드**로 정의한다.[@iso-11898-1-obp-2024]

이 표준은 CAN FD light responder를 위해 [[can-fd|CAN FD]] 프레임 포맷을 지원하는 구현을 [[iso-11898-1#범위|구현 옵션]] 다섯째로 두고, 그 요구사항을 Annex A에 둔다. 이 표준은 classic 포맷만 지원하고 CAN FD 포맷을 용인하지 않는 노드가 responder 노드와 통신할 수 없다고 정한다.[@iso-11898-1-obp-2024] 옵션 사이의 통신 범위는 [[can-fd#호환성|CAN FD의 호환성]]에서 다룬다.

## 배경

CiA에 따르면 CAN FD light는 깊이 내장되고 가격에 민감한 센서·액추에이터 네트워크를 위한 것이다. 가벼운 CAN FD 네트워크가 필요하다는 것은 요즘 자동차 조명 시스템을 개발하면서 드러났고, 여기서는 commander 노드 하나가 LED(Light-Emitting Diode) 클러스터인 responder 노드들을 하나씩 제어한다. 중앙 호스트 컨트롤러가 자원이 적은 단순한 단말 여럿을 관리하는 제어 시스템에도 쓸 수 있고, HVAC(Heating, Ventilation, and Air Conditioning) 시스템이 그 예다.[@cia-can-fd-light-2026]

CAN FD light는 처음에 CiA 604-1에 규정되었고, ISO 11898-1:2024에 표준화되면서 CiA가 CiA 604-1을 철회했다.[@cia-can-fd-light-2026]

CiA는 master/slave라는 말을 피해, CAN FD light에서는 commander와 responder라는 말을 쓴다.[@cia-can-knowledge-2026]

## CiA 604 시리즈

CiA 604 시리즈는 CAN FD light의 사용 지침과 응용 노트를 계속 담는다. 2026년 10월 16일에 확인한 단계는 CiA 604-3 version 0.0.11이 WD(Work Draft), CiA 604-4 version 1.0.0이 DSP(Draft Specification Proposal)다. CiA 604-3은 시스템 설계 권고와 추가 노드 요건을 둔다. CiA 604-4는 ISO 11898-1을 넓히는 responder 노드의 추가 기능과, commander 노드와 responder 노드가 CAN FD light를 8 Mbit/s까지 쓰게 하는 고비트율 모드를 정한다.[@cia-604-2026][@cia-can-community-news-13-2024]

## 고비트율 commander

XS_CAN 매뉴얼에 따르면 CAN FD light는 중재 구간과 데이터 구간에 같은 비트율을 쓰므로, 최대 비트율은 중재 구간에서 낼 수 있는 최대 비트율과 [[can-acknowledgement|ACK]] 비트의 응답 시간이 정하고, 쓰는 트랜시버도 비트율을 제한한다. 비트율을 가장 크게 제한하는 것은 commander 노드의 버스 감시다. commander 노드는 자기가 보내는 값과 버스의 값이 같은지 감시하는데, 비트 시간이 너무 짧으면 이 감시를 할 수 없다. responder 노드는 송신하는 동안 버스를 감시하지 않는다.[@bosch-xs-can-2026]

commander 노드는 버스 감시, 송신 뒤 ACK 응답 요구, [[can-error-frame|오류 프레임]]과 [[can-overload-frame|오버로드 프레임]] 송신, 송신 중 동기화를 끄면 비트율을 높일 수 있다. XS_CAN의 프로토콜 컨트롤러(PRT)는 CAN FD light commander 모드를 `MODE` 레지스터의 `LCHB` 비트로 켠다. 이 모드의 데이터 구간 비트율은 8 Mbit/s까지다.[@bosch-xs-can-2026]
