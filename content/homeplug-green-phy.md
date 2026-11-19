---
title: HomePlug Green PHY
tags:
  - applications/battery-charging
aliases:
  - HPGP
verified: 2026-11-19
---

**HomePlug Green PHY**(HPGP)는 전기차 충전에서 차량과 충전 설비 사이의 통신을 나르는 PLC(Power Line Communications) 기술이다.[@qualcomm-qca7005-2026] SAE J2931/4:2023은 SAE J1772에 기술된 [[control-pilot|Control pilot]] 선 위의 차량 충전 응용을 지원하는 데 필요한 HomePlug Green PHY v1.1의 수정과 선택 기능을 정한다.[@sae-j2931-4-2023]

같은 네트워크 키를 쓰는 저층 통신 스테이션끼리 logical network를 이루고, HPGP 스테이션 사이의 신호 세기는 SLAC(signal level attenuation characterization) 프로토콜로 잰다.[@iso-15118-3-obp-2015]

## 쓰는 곳

Qualcomm에 따르면 HPGP 명세는 차량 응용인 [[combined-charging-system|CCS]]와 NACS(North American Charging System)[@sae-j3400-2024], 그리고 가정, 유틸리티, 스마트 그리드 환경의 요구를 지원한다.[@qualcomm-qca7005-2026]

## 동작

[[iso-15118|ISO 15118]]-3:2015는 HomePlug Green PHY 네트워크의 관리자를 **central coordinator**로 정의한다. 이 부는 **logical network**를 같은 네트워크 키를 쓰는 저층 통신 스테이션의 집합으로 정의하고, 같은 logical network의 구성원끼리만 암호화한 페이로드를 주고받고 상위 계층에서 서로 보이며, 같은 물리 매체에 logical network 여럿이 함께 있을 수 있다고 제시한다.[@iso-15118-3-obp-2015]

![[diagrams/homeplug-logical-networks.svg]]

이 부는 **matching**을 차량의 저층 통신 모듈과, 그 차량이 물리적으로 직접 이어진 충전 설비의 저층 통신 모듈을 가려내는 과정으로 정의하고, matching이 ISO 15118-1의 association에 해당한다고 제시한다.[@iso-15118-3-obp-2015]

## 칩

QCA7005는 HPGP 명세를 따르는 Qualcomm의 전기차 충전용 PLC 칩으로, HPGP 최대 속도인 10 Mbit/s까지 상호 운용된다.[@qualcomm-qca7005-2026] 자동차 grade 2 등급의 PLC 모뎀 QCA7006AQ는 HPGP에 더해 HomePlug AV와 HomePlug 1.0도 지원하고, [[ethernet|이더넷]] 호스트 인터페이스를 둔다.[@qualcomm-80-36676-5-2026]
