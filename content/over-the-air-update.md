---
title: OTA 업데이트
tags:
  - security/ota
aliases:
  - OTA
verified: 2026-10-03
---

[[un-r156|UN R156]]에서 **OTA**(Over-The-Air) 업데이트는 케이블이나 다른 로컬 연결 대신 무선으로 데이터를 전송하는 모든 방법이다.[@unece-r156-2021]

## 유선 업데이트와의 차이

[[iso-24089|ISO 24089]]:2023의 소개에 따르면 차량 소프트웨어는 정비소에서 숙련자가 업데이트하거나, 차량 사용자가 무선으로 업데이트한다. ISO 24089:2023은 소프트웨어 업데이트 배포 방법의 예로 유선(도구, USB 플래시 드라이브), 무선(셀룰러, Wi-Fi), 하드웨어 교체를 든다.[@iso-24089-obp-2023]

산업통상자원부에 따르면 전에는 정비소를 찾아야만 전자제어장치의 소프트웨어를 업데이트할 수 있었고, OTA 업데이트는 정비소에 가지 않고 원하는 시간과 장소에서 무선 통신으로 업데이트하게 한다.[@motie-sandbox-ota-2020] 정비소에서 진단 통신으로 하는 재프로그래밍은 [[ecu-reprogramming|ECU 재프로그래밍]]에서 다룬다.

## 업데이트 대상

현대자동차그룹은 무선 소프트웨어 업데이트를 내비게이션과 인포테인먼트 시스템을 업데이트하는 SOTA(Software Over the Air)와, 차량의 여러 제어기를 개선하는 FOTA(Firmware Over the Air)로 나눈다. 현대자동차그룹에 따르면 제네시스 GV60은 제네시스 차량 가운데 처음 FOTA를 적용했고, 구동, 브레이크, 조향, 전자제어 서스펜션 제어기 등을 FOTA로 업데이트한다.[@hyundai-motor-group-gv60-ota-2021]

## 시스템 구성

Uptane은 지상 차량의 소프트웨어 업데이트 시스템을 보호하는 보안 프레임워크다. Uptane 표준 2.1.0은 차량의 버전 정보를 모아 서버에 보내고 자기와 다른 ECU를 위한 메타데이터와 이미지를 내려받아 검증하는 ECU를 primary ECU라 하고, primary ECU에게서 이미지를 받아 검증한 뒤 설치하는 ECU를 secondary ECU라 한다. primary ECU는 서버와 통신하는 ECU와 같은 ECU여도 된다.[@uptane-standard-2023]

[[autosar|AUTOSAR]] R25-11의 Adaptive Platform에서는 기능 클러스터 UCM(Update and Configuration Management)이 Adaptive Platform 하나의 소프트웨어 변경을 맡는다. 백엔드는 소프트웨어 패키지를 보관하는 서버이고, 백엔드에서 패키지를 내려받는 일은 UCM이 아닌 OTA Client가 맡는다.[@autosar-ap-sws-updateandconfigurationmanagement-2025] V-UCM(Vehicle Update and Configuration Management)은 차량 안의 업데이트 캠페인을 조율하는 기능 클러스터로, 차량 패키지를 해석해 각 머신의 UCM이나 Flashing Adapter에 소프트웨어 패키지를 보내고 처리, 활성화, 롤백을 조율한다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025] AUTOSAR R23-11은 UCM Master를 V-UCM이라는 별도 명세로 나눴다.[@autosar-ap-sws-updateandconfigurationmanagement-2025] 진단으로 플래시하는 ECU를 V-UCM이 업데이트하는 방식은 [[ecu-reprogramming#정비소와 OTA|ECU 재프로그래밍의 정비소와 OTA]]에서 다룬다.

기능을 중앙 컴퓨터에 모은 [[ee-architecture|E/E 아키텍처]]는 OTA 업데이트로 차량 기능을 바꾸거나 더하기 쉽게 한다.[@bosch-ee-architecture-2026][@ti-slyy236-2025]

## 단계

ISO 24089:2023은 차량, 차량 시스템, ECU에서 업데이트 패키지를 다루는 소프트웨어 업데이트 작업을 세 단계로 정의한다.[@iso-24089-obp-2023]

- **수신**(receipt): 패키지를 받는 단계. 내려받기가 그 예다.
- **설치**(installation): 패키지의 해당 부분을 쓰되 아직 활성화하지 않은 단계
- **활성화**(activation): 설치된 부분이 실행 가능해지는 단계[@iso-24089-obp-2023]

패키지를 대상 차량에 배포하고 결과를 기록하는 일은 [[iso-24089#용어|ISO 24089의 소프트웨어 업데이트 캠페인]]에 든다.[@iso-24089-obp-2023] UN R156에서 실행(execution)은 내려받은 업데이트를 설치하고 활성화하는 과정이다.[@unece-r156-2021] AUTOSAR R25-11의 UCM은 업데이트 한 주기를 패키지를 전송하고 처리하는 준비 단계, 의존성을 검사하고 활성화하고 검증하는 활성화 단계, 정리 단계로 나눈다.[@autosar-ap-sws-updateandconfigurationmanagement-2025]

### 안전 조건과 사용자

ISO 24089:2023은 업데이트 작업을 위험 없이 할 수 있는 차량 운전 모드를 안전한 차량 상태로 정의하고, 원동기가 꺼지고 주차 브레이크가 걸린 상태를 예로 든다.[@iso-24089-obp-2023] Uptane 표준 2.1.0은 전제 조건이 갖춰졌을 때 설치하기를 권하며, 특정 ECU를 업데이트할 때 차량이 주차된 상태를 예로 든다.[@uptane-standard-2023] AUTOSAR R25-11의 V-UCM은 정차, 시동 꺼짐, 문 닫힘 같은 안전 조건을 활성화 전에 확인할 수 있고, 차량 패키지에 설정되어 있으면 운전자에게 승인이나 동의를 받는다.[@autosar-ap-sws-vehicleupdateandconfigurationmanagement-2025]

UN R156 원판과 01 시리즈는 OTA 업데이트를 하는 차량 형식에 실행 전후의 사용자 통지, 실행 중의 주행 제한, 실패하거나 중단될 때 이전 버전이나 안전한 상태로의 복귀 등을 요구한다.[@unece-r156-2021] 요구의 목록은 [[un-r156#차량 형식 요구|UN R156의 차량 형식 요구]]에서 다룬다.

GV60은 시동을 끄면 업데이트를 진행할지 묻고 예상 소요 시간을 보여 주며, 설치 중에는 주행과 충전을 할 수 없다. 업데이트에 실패하면 다시 시도하고, 두 번째에도 실패하면 이전 버전으로 롤백한다.[@hyundai-motor-group-gv60-ota-2021]

## 프로토콜

OMA(Open Mobile Alliance)의 LwM2M 1.2.2 Core 명세는 LwM2M 서버와 클라이언트 사이의 장치 관리 프로토콜을 정하고, 펌웨어 패키지의 설치와 업데이트를 관리하는 Firmware Update 객체를 둔다.[@oma-lwm2m-core-v1-2-2-2024] MQTT 5.0은 M2M(Machine to Machine)과 IoT(Internet of Things) 환경을 위한 가벼운 클라이언트·서버 발행·구독 메시징 프로토콜이다.[@oasis-mqtt-5-0-2019]

## 국내 제도

산업통상자원부 산업융합 규제특례심의위원회는 2020년 6월 25일 현대자동차가 신청한 자동차 전자제어장치 무선 업데이트 서비스에 임시허가를 내주었다. 산업통상자원부는 당시 자동차관리법 시행규칙으로는 무선 업데이트가 정비 작업에 드는지 분명하지 않고, 정비 작업이라면 등록된 정비 사업장 밖에서 할 수 없다고 보았다. 심의위원회는 무선 업데이트를 정비 작업으로 보면서도 정비소에 가지 않고 서비스를 받을 수 있게 임시허가했고, 국토교통부는 임시허가 기간에 무선 업데이트를 정비업의 작업에서 빼도록 법령을 정비하기로 했다.[@motie-sandbox-ota-2020]

2025년 4월 28일 공포되고 시행된 자동차관리법 시행규칙 개정(국토교통부령 제1484호)은 자동차정비업에서 빠지는 작업에 자동차제작자 등의 무선 소프트웨어 업데이트를 더해, 정비업소에 가지 않고도 무선 업데이트를 할 수 있게 했다.[@kr-motor-vehicle-management-act-rule-2025]

2024년 2월 13일 공포되어 2025년 8월 14일 시행된 자동차관리법 개정(법률 제20298호)은 자동차 사이버보안 관리체계 인증과 소프트웨어 업데이트 준수사항을 들였다. 이 개정은 자동차제작자 등이 소프트웨어 업데이트를 할 때 실시 전후에 업데이트 정보를 자동차 사용자에게 알리게 했다.[@kr-motor-vehicle-management-act-2024]
