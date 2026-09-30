---
title: MAC 주소
tags:
  - network/ethernet
aliases:
  - EUI-48
verified: 2026-09-29
---

**MAC 주소**는 [[ethernet|이더넷]] 같은 IEEE 802 네트워크에서 하드웨어 인터페이스를 가리키는 주소로, 흔히 EUI-48(48-bit Extended Unique Identifier)을 쓴다. 이더넷 MAC 주소는 이더넷 인터페이스 하나에 고유한 EUI-48이다. IEEE 등록 기관은 전역에서 고유한 48비트 MAC 주소를 정식으로 EUI-48이라 부른다.[@ieee-ra-eui-2017][@ieee-ra-faq-2026]

ST RM0008은 MAC을 media access control로, Microchip ENC28J60 데이터시트는 Medium Access Control로 풀어 쓴다.[@st-rm0008-2021][@microchip-enc28j60-2012] [[ethernet-frame|이더넷 프레임]]의 주소는 하나가 48비트(6옥텟)이고, MAC 주소는 프레임의 목적지 주소 필드와 출발지 주소 필드에 실린다.[@st-rm0008-2021][@microchip-enc28j60-2012]

## 표기

IEEE 등록 기관의 16진 표기는 EUI-48의 여섯 옥텟을 두 자리 16진수로 적고 하이픈으로 잇는다. 예: `AC-DE-48-23-45-67`. 하이픈 없이 16진수로 적기도 한다.[@ieee-ra-eui-2017]

## OUI

MAC 주소의 앞 3옥텟(24비트)은 **OUI**(Organizationally Unique Identifier)다.[@ieee-ra-eui-2017][@microchip-enc28j60-2012] IEEE 등록 기관은 주소 블록의 크기에 따라 MA-L(MAC Address Block Large), MA-M(MAC Address Block Medium), MA-S(MAC Address Block Small) 세 종류를 배정한다.[@ieee-ra-eui-2017][@ieee-ra-faq-2026] 등록 기관은 MA-L로 조직에 OUI를 배정하고, OUI를 받은 조직은 나머지 3옥텟을 제품마다 겹치지 않게 붙인다.[@ieee-ra-eui-2017][@microchip-enc28j60-2012]

## 첫 옥텟의 두 비트

첫 옥텟의 최하위 비트(I/G)는 개별 주소와 그룹 주소를 가르고, 그다음 비트(U/L)는 전역 관리 주소와 로컬 관리 주소를 가른다.[@ieee-ra-eui-2017][@st-rm0008-2021] 두 구분의 뜻은 [[message-addressing#주소를 싣는 프레임|메시지 주소 지정]]에서 다룬다. 모든 비트가 1인 `FF-FF-FF-FF-FF-FF`는 네트워크의 모든 스테이션을 가리키는 브로드캐스트 주소다.[@ieee-ra-eui-2017][@st-rm0008-2021]

이더넷 MAC 프레임은 주소의 각 바이트를 최하위 비트부터 보내므로, I/G 비트가 주소에서 가장 먼저 전송된다.[@st-rm0008-2021][@microchip-an1120-2008]

![[diagrams/mac-address-first-octet-bits.svg]]

## 장치의 주소

Microchip 24AA02E48은 공장에서 전역 고유한 EUI-48 노드 주소를 기록하고 영구히 쓰기 금지해 둔 I2C(Inter-Integrated Circuit) EEPROM(Electrically Erasable Programmable Read-Only Memory)이다.[@microchip-24aa02e48-2016] ENC28J60과 STM32F107xx의 이더넷 MAC은 자기 MAC 주소를 레지스터에 두고, 소프트웨어가 그 값을 써 넣는다.[@st-rm0008-2021][@microchip-enc28j60-2012]
