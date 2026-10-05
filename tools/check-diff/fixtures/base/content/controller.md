---
title: 컨트롤러
tags:
  - network/can
verified: 2026-01-01
---

**컨트롤러**는 [[can|CAN]] 노드에서 프로토콜을 처리하는 부분이다.[@bosch-can-fd-1-0-2012]

## 노드 상태

| 상태        | 뜻                     |
| ----------- | ---------------------- |
| integrating | 버스가 비기를 기다린다 |

## 송신

송신 노드는 내보낸 비트를 버스에서 되읽는다.[@bosch-can-2-0-1991]

![[diagrams/readback.svg]]

수신 노드는 비트를 샘플 포인트에서 읽는다.[@bosch-can-2-0-1991]

![[diagrams/sample.svg]]

master 노드가 헤더를 보낸다. 슬레이브는 응답을 보낸다. 이 응답은 헤더 바로 뒤에 온다.[@iso-17987-1-2016]
