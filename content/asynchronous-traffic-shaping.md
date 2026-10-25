---
title: Asynchronous traffic shaping
tags:
  - network/ethernet
aliases:
  - ATS
  - IEEE 802.1Qcr
verified: 2026-10-06
---

**Asynchronous traffic shaping**(ATS)은 [[ieee-802-1q|IEEE 802.1Q]]가 정하는 트래픽 셰이핑 방식으로, ATS 스케줄러가 받은 프레임마다 eligibility time을 붙이고 ATS 전송 선택 알고리즘이 그 시각에 따라 프레임의 전송을 조절한다.[@ieee-802-1q-2022] IEEE 802.1Qcr-2020이 IEEE 802.1Q-2018의 개정(Amendment 34)으로 ATS를 넣었고[@ieee-802-1qcr-2020], 이 개정은 IEEE 802.1Q-2022에 합쳐졌다.[@ieee-802-1q-2022]

P802.1Qcr 프로젝트는 브리지와 엔드 스테이션이 데이터율이 일정한 전이중 링크에서 비동기 트래픽 셰이핑을 하는 절차와 관리 객체를 정하는 것을 범위로 삼았다. 이 프로젝트는 동기식 통신에 기대지 않는 메커니즘을 정해, 시계 동기 메커니즘에서 독립하고 동기식 메커니즘보다 링크 이용률을 높이는 것을 목표로 했다.[@ieee-802-1qcr-project-2026]

## Eligibility time

IEEE 802.1Q-2022는 ATS 스케줄러가 정수 스케줄러 식별자와 스케줄러 그룹 식별자, 비트 단위의 CommittedBurstSize 파라미터, 초당 비트 단위의 CommittedInformationRate 파라미터를 갖도록 정한다. ATS 스케줄러는 프레임마다 eligibility time을 붙이고, 예외적인 상황에서는 프레임을 버린다.[@ieee-802-1q-2022]

이 표준은 eligibility time을 프레임의 도착 시각, 같은 스케줄러 그룹이 앞 프레임에 준 eligibility time, 스케줄러의 상태로 계산한 시각 가운데 가장 늦은 것으로 정한다. 스케줄러의 상태로 계산한 시각은 스케줄러의 bucket이 빈 시각(BucketEmptyTime)에, 매체에 따른 오버헤드를 포함한 프레임 길이를 CommittedInformationRate로 나눈 시간을 더한 것이다. eligibility time이 도착 시각에 MaxResidenceTime을 더한 시각보다 늦으면 스케줄러는 프레임을 버린다. 이 표준은 프레임을 버리는 것을 연결된 상류 시스템의 오작동 같은 예외적인 상황에서만 일어나는 일로 둔다.[@ieee-802-1q-2022]

![[diagrams/ats-eligibility-time.svg]]

도착 시각은 ATS 스케줄러 시계로 정하며, 이 시계는 구현마다 정하는 로컬 시스템 시계다. 한 수신 포트에서 받은 프레임의 도착 시각은 모두 같은 스케줄러 시계로 정한다. ATS 스케줄러 시계와 전송 선택 시계는 장기적으로 같은 속도로 가고, 둘 사이의 오프셋 변동에는 한계가 있다.[@ieee-802-1q-2022]

## 스케줄러 그룹

이 표준은 ATS 스케줄러를 스케줄러 그룹으로 묶는다. 그룹은 수신 포트마다, 그리고 그 포트에 이어진 장치에서 프레임을 보낸 [[traffic-class|트래픽 클래스]](upstream traffic class)마다 하나씩 있다. 한 그룹의 스케줄러들은 MaxResidenceTime 파라미터와 group eligibility time 상태 변수를 함께 쓴다. 이렇게 묶으면 한 그룹에 속한 프레임의 eligibility time은 앞 프레임의 eligibility time보다 이르지 않으므로, 한 그룹의 프레임을 FIFO로 큐에 넣을 수 있다.[@ieee-802-1q-2022]

## 전송 선택

이 표준은 ATS 전송 선택 알고리즘을 쓰는 큐에서, 붙은 eligibility time이 현재 시각과 같거나 그보다 이른 프레임을 전송할 수 있는 프레임으로 정한다. 현재 시각은 구현마다 정하는 로컬 시스템 시계인 전송 선택 시계가 정한다. 프레임은 eligibility time이 이른 순서로 전송에 뽑힌다. 이 표준은 ATS 전송 선택 알고리즘을 strict priority에 더해 지원할 수 있는 [[traffic-class#전송 선택|전송 선택 알고리즘]]의 하나로 두고, 그 식별자를 3으로 둔다.[@ieee-802-1q-2022]

이 표준은 ATS를 지원하는 브리지 구성 요소가 ATS용 스트림별 분류와 미터링, [[per-stream-filtering-and-policing#스트림 게이트|스트림 게이트]]를 쓰는 큐잉, ATS 전송 선택 알고리즘, ATS 스케줄러 상태 기계, ATS 관리 객체를 지원하도록 요구한다. ATS와 [[per-stream-filtering-and-policing|PSFP]]는 스트림별 분류와 미터링의 요소를 함께 쓴다. ATS를 구현하는 브리지 구성 요소는 [[per-stream-filtering-and-policing#스트림 필터|스트림 필터]], 최대 SDU(Service Data Unit) 크기 필터, IPV(Internal Priority Value) 지정을 지원하는 스트림 게이트, ATS 스케줄러, ATS 스케줄러 그룹을 지원해야 하고, PSFP 없이 ATS만 지원하면 스트림 게이트는 IPV 지정에만 쓰고 닫히지 않는다. ATS 스케줄러의 동작은 [[per-stream-filtering-and-policing#Flow meter|flow meter]]와 비슷한 policing 기능을 주어, flow meter를 따로 두지 않아도 될 수 있다.[@ieee-802-1q-2022]

## 지연 분석

이 표준의 Annex V(informative)는 구성이 고정된 정적 네트워크에서 최악 지연을 분석하는 틀을 제시한다. 이 틀은 [[avb#Talker와 listener|talker]]에서 listener까지의 경로를 홉으로 나누고, 홉마다의 지연 상한을 더해 스트림의 종단 간 지연 상한을 얻는다. 이 틀은 ATS 전송 선택 알고리즘을 번호가 가장 큰 트래픽 클래스들에 두고, 그 트래픽 클래스들의 [[time-aware-shaper#게이트|전송 게이트]]가 늘 열려 있으며, 포트가 일정한 데이터율로 보낸다고 가정한다.[@ieee-802-1q-2022]
