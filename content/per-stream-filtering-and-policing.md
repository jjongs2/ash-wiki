---
title: Per-stream filtering and policing
tags:
  - network/ethernet
aliases:
  - PSFP
  - IEEE 802.1Qci
verified: 2026-10-06
---

**Per-stream filtering and policing**(PSFP)은 브리지가 받은 프레임을 그 프레임이 속한 스트림에 따라 세고, 거르고, policing하는 [[ieee-802-1q|IEEE 802.1Q]]의 기능이다. 스트림 필터가 프레임을 스트림 게이트와 flow meter에 이어 주고, 스트림 게이트는 시간 스케줄에 맞지 않는 프레임을 버리며, flow meter는 트래픽 한도를 넘은 프레임을 버리거나 drop eligible로 표시한다.[@ieee-802-1q-2022] IEEE 802.1Qci-2017이 IEEE 802.1Q-2014의 개정(Amendment 28)으로 PSFP를 넣었고[@ieee-802-1qci-2017], 이 개정은 IEEE 802.1Q-2018에 합쳐졌다.[@ieee-802-1q-2022]

P802.1Qci 프로젝트는 브리지가 프레임이 속한 데이터 스트림과 동기화된 주기적 시간 스케줄에 따라 프레임 계수, 필터링, policing, 서비스 클래스 선택을 하는 절차와 관리 객체를 정하는 것을 범위로 삼았다. 이 프로젝트에서 policing과 필터링 기능에는 네트워크의 다른 시스템이 보내는 방해 전송을 찾아내고 그 영향을 줄여 네트워크를 더 견고하게 하는 일이 든다. 이 프로젝트는 한 스트림에 할당된 대역폭을 넘는 장치가 그 스트림만이 아니라 어느 스트림이나 모든 스트림에서 [[tsn|TSN]]의 이점을 잃게 할 수 있다는 점을 배경으로 들었다.[@ieee-802-1qci-project-2026]

## 처리 순서

IEEE 802.1Q-2022는 PSFP를 구현하는 브리지 구성 요소나 엔드 스테이션이 스트림 필터, 최대 SDU(Service Data Unit) 크기 필터, 스트림 게이트, flow meter를 지원하고, 스트림 필터, 스트림 게이트, flow meter의 인스턴스 표를 하나씩 두도록 정한다.[@ieee-802-1q-2022]

이 표준은 받은 프레임을 아래 순서로 처리하도록 정한다.[@ieee-802-1q-2022]

- 프레임은 스트림 필터에 대응될 수 있다. 맞는 스트림 필터가 없으면 프레임은 거르지 않고 [[traffic-class|큐]]에 들어간다.
- 스트림 필터가 최대 SDU 크기를 정하면, 그보다 큰 프레임을 버릴 수 있다.
- 스트림 필터가 가리키는 스트림 게이트는 허용된 수신 구간 밖에서 받은 프레임과, 한 수신 구간의 데이터 한도를 넘은 프레임을 버릴 수 있다. 스트림 게이트는 프레임의 우선순위를 IPV(Internal Priority Value)로 바꿀 수 있다.
- 스트림 필터가 flow meter를 정하면, flow meter의 트래픽 한도를 넘은 프레임을 버리거나 drop eligible로 표시할 수 있다.[@ieee-802-1q-2022]

![[diagrams/psfp-processing-order.svg]]

## 스트림 필터

이 표준은 받은 프레임을 stream_handle과 우선순위로 스트림 필터에 대응시키도록 정한다. stream_handle은 [[ieee-802-1cb|IEEE 802.1CB]]의 스트림 식별 기능이 준다. 스트림 필터는 stream_handle 값 하나나 아무 값에나 맞는 와일드카드, 우선순위 값 하나나 와일드카드, 최대 SDU 크기, 스트림 게이트 식별자를 갖고, flow meter 식별자를 가질 수 있다. flow meter 식별자가 없으면 그 스트림 필터의 프레임은 flow meter를 거치지 않는다. 프레임은 stream_handle과 우선순위가 맞는 스트림 필터 가운데 식별자가 가장 작은 것에 대응된다.[@ieee-802-1q-2022]

어느 스트림에도 대응되지 않는 프레임을 거르지 않고 넘기는 대신 버리려면, 스트림 필터 인스턴스 표의 끝에 stream_handle과 우선순위가 모두 와일드카드이고 늘 닫힌 스트림 게이트를 가리키는 스트림 필터를 둔다.[@ieee-802-1q-2022]

프레임의 SDU 크기가 스트림 필터의 최대 SDU 크기를 넘으면 프레임은 버려진다. 설정에 따라, 한 번 큰 프레임을 버린 뒤로는 관리 동작으로 풀 때까지 그 스트림 필터의 프레임을 모두 버리게 할 수 있고, 이 설정의 기본값은 꺼짐이다.[@ieee-802-1q-2022]

## 스트림 게이트

이 표준은 스트림 게이트가 시간 스케줄에 어긋나는 시각에 받은 프레임을 버리도록 정한다. 또 스트림 게이트는 프레임의 우선순위를 IPV로 바꿔 큐잉 결정에 쓰게 하고, 전송할 때는 프레임의 원래 우선순위를 그대로 둔다. 스트림 게이트를 지원하는 브리지는 프레임에 IPV가 정해지면 우선순위 대신 IPV로 프레임의 트래픽 클래스를 정한다.[@ieee-802-1q-2022]

스트림 게이트의 상태는 열림과 닫힘 둘이고, 닫힌 게이트는 프레임을 통과시키지 않는다. IPV 명세는 null이거나 특정 IPV 값이며, null이면 받은 프레임의 우선순위를 IPV로 쓴다. PSFP를 지원하는 스트림 게이트는 스트림 게이트 제어 목록을 두고, 상태 기계가 목록의 동작을 주기적으로 실행해 게이트 상태와 IPV를 정한다. 목록의 동작 SetGateAndIPV는 게이트 상태와 IPV를 정하고 TimeInterval이 지나면 다음 동작으로 넘어가며, 선택 파라미터 IntervalOctetMax로 그 구간에 게이트를 지날 수 있는 MSDU(MAC Service Data Unit) 옥텟 수를 제한한다.[@ieee-802-1q-2022]

설정에 따라 스트림 게이트는 닫힌 상태에서 프레임을 받거나 남은 옥텟 수보다 큰 프레임을 받으면, 관리 동작으로 풀 때까지 그 뒤의 프레임을 모두 버린다. 이 기능의 기본값은 꺼짐이다. 이는 프레임이 게이트가 열려 있을 때만, 정해진 양까지만 도착하도록 네트워크 전체의 송수신을 맞춘 응용을 위한 것으로, 닫힌 상태에서 받은 프레임이나 예상 밖의 많은 옥텟은 잘못된 수신으로 본다.[@ieee-802-1q-2022]

## Flow meter

이 표준은 flow meter가 MEF 10.3의 bandwidth profile 파라미터와 알고리즘을 따르도록 정한다. flow meter는 committed information rate, committed burst size, excess information rate, excess burst size, coupling flag, color mode를 갖는다. MEF 10.3 알고리즘이 yellow로 표시한 프레임은 DropOnYellow 파라미터가 참이면 버려지고, 거짓이면 drop_eligible 파라미터가 참으로 바뀐다. 설정에 따라 flow meter가 프레임을 하나 버린 뒤로는 관리 동작으로 풀 때까지 모든 프레임을 버리게 할 수 있고, 이 설정의 기본값은 꺼짐이다.[@ieee-802-1q-2022]

PSFP와 [[asynchronous-traffic-shaping|ATS]]는 스트림 필터와 스트림 게이트 같은 스트림별 분류와 미터링의 요소를 함께 쓴다.[@ieee-802-1q-2022]
