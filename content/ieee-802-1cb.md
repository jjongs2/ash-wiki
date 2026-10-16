---
title: IEEE 802.1CB
tags:
  - network/ethernet
aliases:
  - FRER
verified: 2026-10-06
publisher: IEEE
edition: 2017
status: 개정 중
---

**IEEE 802.1CB**는 신뢰성을 위한 프레임 복제와 중복 제거, 곧 **FRER**(Frame Replication and Elimination for Reliability)를 정하는 IEEE 표준이다. 정식 제목은 "IEEE Standard for Local and metropolitan area networks—Frame Replication and Elimination for Reliability"이다.[@ieee-802-1cb-2017]

## 범위

이 표준은 브리지와 엔드 시스템이 중복 전송을 위해 패킷을 식별해 복제하고, 중복된 패킷을 식별해 없애는 데 쓰는 절차, 관리 객체, 프로토콜을 정한다. 복제본이 지나갈 여러 경로를 만드는 일은 다루지 않는다.[@ieee-802-1cb-2017]

이 표준은 FRER의 목적을 패킷이 전달될 확률을 높이는 것으로 둔다. 정체 손실을 막은 고정 경로 위에서 FRER을 쓰면 장비 고장에 따른 패킷 손실 확률을 크게 줄일 수 있다.[@ieee-802-1cb-2017] IEEE 802.1 작업 그룹에 따르면 이 표준을 만들 때 IEEE 802와 호환되면서 failover 없이 고장을 견디는 방식은 따로 없었고, 이를 이루려면 중복 프레임을 만들고 없애야 했다. 이 일은 엔드 스테이션과, 브리지나 라우터 같은 중계 노드에서 할 수 있다.[@ieee-802-1cb-project-2017]

IEEE 802.1CB-2017은 동적 네트워크 제어 프로토콜이 장비 고장에서 회복하는 데 걸리는 시간을 받아들일 수 없는 응용을 전제한다. FRER은 스트림 하나를 서로 이어진 Member Stream 하나 이상으로 나누어 원래 스트림을 Compound Stream으로 만든다. 스트림의 패킷을 복제해 Member Stream들로 나눠 보내고, 다른 지점에서 Member Stream들을 다시 합쳐 복제본을 없앤 뒤 되살린 스트림을 내보낸다. 기존 응용을 받아들이고 비슷한 표준과 함께 운용되도록, 스트림에 속한 패킷을 다른 패킷과 가리는 방식도 여럿 정한다.[@ieee-802-1cb-2017]

![[diagrams/frer-replication-elimination.svg]]

[[ieee-802-1q|IEEE 802.1Q]]-2022는 수신 프레임을 stream filter에 대응시키는 데 IEEE 802.1CB의 스트림 식별 함수가 주는 stream_handle과 프레임의 우선순위를 쓸 수 있게 정한다.[@ieee-802-1q-2022]

## 개정 이력

- 2017년: 첫판이 나왔다.
- 2021년: 개정 802.1CBcv-2021과 802.1CBdb-2021이 나왔다.[@ieee-802-1cb-2017] 802.1CBcv-2021은 정보 모델, YANG(Yet Another Next Generation) 데이터 모델, MIB(Management Information Base) 모듈을 더했고[@ieee-802-1-tsn-tg-2026], 802.1CBdb-2021은 스트림 식별 함수를 확장했다.[@ieee-802-1cbdb-2021]
- 2025년: 2017년판과 그 개정, 정오표를 합치는 개정 프로젝트 P802.1CB-2017-Rev의 PAR(Project Authorization Request)이 2025년 2월에 승인되었고, 2026년 10월 기준 진행 중이다.[@ieee-p802-1cb-rev-2025] 같은 때 승인된 제안 개정 P802.1CBec는 시퀀스 복구 함수를 다듬고 그 파라미터의 권장값을 참고 Annex로 더한다.[@ieee-802-1cb-2017][@ieee-p802-1cbec-2025]
- 2026년: 정오표 802.1CB-2017/Cor 1-2026이 나왔다.[@ieee-802-1cb-2017]
