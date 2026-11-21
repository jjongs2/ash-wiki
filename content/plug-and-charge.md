---
title: Plug and Charge
tags:
  - applications/battery-charging
  - security/cryptography
aliases:
  - PnC
  - Plug & Charge
verified: 2026-11-19
---

**Plug and Charge**(PnC)는 운전자가 차량을 충전 설비에 꽂거나, 무선 전력 전달이면 차량을 세우기만 하면 에너지 전달의 모든 면이 운전자의 손을 더 거치지 않고 자동으로 처리되는 식별 방식이다. [[iso-15118|ISO 15118]]-1:2019는 그런 면으로 부하 제어, 인가, 과금을 제시한다.[@iso-15118-1-obp-2019] ISO 15118-20:2022는 PnC를 park and charge라 부르고, 차량에 저장한 [[public-key-infrastructure#공개 키 인증서|인증서]]를 써서 사용자 조작 없이 인가하는 방식으로 정의한다.[@iso-15118-20-obp-2022]

EU 규정 2023/1804의 Annex II(EU 위임 규정 2025/656이 고친 판)는 2027년 1월 1일부터 설치하거나 개보수하는 공공 충전점이 PnC 같은 자동 인증·인가 서비스를 주면 EN ISO 15118-20:2022에 더해 EN ISO 15118-2:2016도 따르도록 요구한다.[@eu-2025-656-2025]

차량은 계약 인증서로 응용 계층의 XML [[digital-signature|서명]]을 만들고, [[transport-layer-security|TLS]]에서는 충전 설비 쪽 통신 제어기의 인증서로 그 제어기의 진위를 확인한다.[@iso-15118-2-obp-2014] ISO 15118-20:2022는 충전 설비 쪽도 TLS에서 차량 인증서로 차량의 진위를 확인하도록 정한다.[@iso-15118-20-obp-2022]

## 쓰는 곳

EU 위임 규정 2025/656의 전문(recital)은 공공 충전점 운영자가 PnC를 줄지 스스로 정할 수 있게 둔다.[@eu-2025-656-2025]

[[combined-charging-system|CharIN]]은 Plug & Charge 로고나 아이콘을 쓰려면 적어도 ISO 15118-2나 ISO 15118-20에 따른 자기 인증(self-certification)을 미리 갖추도록 한다. 2026년 11월 기준 CharIN은 PnC 표준의 개발과 조화된 구현을 돕지만 충전 서비스나 [[public-key-infrastructure|PKI]]를 운영하지 않는다. CharIN은 회원 출자 프로젝트로 세운 CharIN V2G PKI를 2024년 Irdeto에 법적·운영적으로 넘겼다.[@charin-plug-and-charge-2026]

Vector의 MICROSAR Charge는 ISO 15118에 따른 인증서 기반 PnC를 지원하고, ISO 15118-2와 ISO 15118-20의 보안 요구를 MICROSAR Classic의 [[ethernet|이더넷]]·암호 모듈과 함께 TLS 1.2·1.3, XML 서명, [[elliptic-curve-cryptography|타원 곡선 암호]] 등으로 구현한다.[@vector-microsar-charge-2026]

## 동작

ISO 15118-20:2022는 인증서를 발급하는 CA(certificate authority) 가운데 **V2G root CA**를 sub-CA에 sub-CA 인증서를 발급하는 CA로 정의한다. 이 부는 **sub-CA**를 V2G root CA 같은 root CA를 대신해 SECC(supply equipment communication controller) 인증서나 계약 인증서 같은 인증서를 발급하는 하위 CA로 정의하고, sub-CA가 둘째 sub-CA에 인증서를 발급하거나 계약 인증서와 SECC 인증서 같은 leaf 인증서를 직접 발급한다고 제시한다. root CA가 sub-CA를 언제든 폐지할 수 있다는 것도 제시한다.[@iso-15118-20-obp-2022]

이 부는 **계약 인증서**를 eMSP(eMobility service provider)의 sub-CA가 EVCC(electric vehicle communication controller) 몫으로 발급해 응용 계층의 XML 서명에 쓰고, SECC나 secondary actor가 그 서명을 검증하는 인증서로 정의하고, secondary actor가 인증서 subject 필드의 EMAID(eMobility account identifier)로 eMSP 계약에 따라 차량의 충전을 인가한다고 제시한다.[@iso-15118-20-obp-2022]

![[diagrams/v2g-certificate-issuing-chain.svg]]

이 부는 **OEM provisioning 인증서**를 계약 인증서의 프로비저닝을 위해 OEM이 EVCC에 발급하는 인증서로 정의한다.[@iso-15118-20-obp-2022]

이 부는 **SECC 인증서**를 TLS에서 EVCC가 SECC의 진위를 확인하는 데 쓰는 leaf 인증서로, **차량 인증서**를 TLS에서 SECC가 EVCC의 진위를 확인하는 데 쓰는 leaf 인증서로 정의한다. 또 SECC가 차량 인증서로 같은 V2G(vehicle to grid) 세션에 속한 여러 TLS 세션을 묶기도 한다고 제시한다.[@iso-15118-20-obp-2022]

![[diagrams/plug-and-charge-certificate-use.svg]]

ISO 15118-2:2014는 계약 인증서를 V2G Root CA나 Sub-CA가 EVCC에 발급하는 인증서로, OEM provisioning 인증서를 EVCC가 secondary actor에게서 계약 인증서를 안전하게 요청해 받을 수 있도록 EVCC에 발급하는 인증서로 정의한다.[@iso-15118-2-obp-2014]

## 다른 식별 수단과 사설 환경

ISO 15118-20:2022는 **EIM**(external identification means)을 이 문서 밖에서 다루는 인가 수단으로 정의한다.[@iso-15118-20-obp-2022] ISO 15118-1:2019는 EIM의 예로 신용·직불 카드, 스마트폰이나 웹 앱, 전화 같은 수단을 든다.[@iso-15118-1-obp-2019] ISO 15118-2:2014는 **식별 방식**(Identification Mode)을, EIM으로 식별하는 충전 시나리오와 PnC로 식별하는 충전 시나리오에 관한 필수·선택 메시지와 파라미터로 정의한다.[@iso-15118-2-obp-2014]

ISO 15118-20:2022는 **사설 환경**(PE, private environment)을 소수의 차량만 물리적으로 드나드는, 사적 책임 아래의 구역으로 정의하고, **PE 인증서**를 사설 환경에서 PE private root CA나 PE sub CA가 사설 SECC에 발급해 TLS에서 EVCC가 사설 SECC의 진위를 확인하는 데 쓰는 leaf 인증서로 정의한다.[@iso-15118-20-obp-2022]
