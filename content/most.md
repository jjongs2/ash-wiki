---
title: MOST
tags:
  - network
aliases:
  - Media Oriented Systems Transport
verified: 2026-10-22
---

ISO 21806-1:2020은 **MOST**(Media Oriented Systems Transport)를 동기식 시분할 다중화(TDM, Time-Division Multiplexing) 네트워크로 둔다.[@iso-21806-1-obp-2020]

## 데이터 전송

MOST는 데이터 종류마다 채널을 따로 두어 낮은 지연으로 나르고, 네트워크 클록은 연속한 데이터 신호로 준다. 스트리밍 연결에는 대역을 예약해 데이터 스트림이 끊기거나 충돌하거나 늦어지지 않게 한다. 비등시(anisochronous) 패킷 데이터는 제어 데이터, 스트리밍 데이터와 따로 보내며, 셋은 서로 간섭하지 않는다. MOST 네트워크의 장치들은 제어 채널 하나와 패킷 채널 하나를 함께 쓴다.[@iso-21806-1-obp-2020]

## 역사와 명세

MOST는 1990년대 말 차량의 복잡한 오디오 응용을 지원하려고 처음 개발되었고, MOST Cooperation은 1998년에 세워졌다. 이 표준은 MOST 명세 Rev. 2.5.0과 Rev. 3.0.0E2를 인용 규격으로 둔다.[@iso-21806-1-obp-2020]
