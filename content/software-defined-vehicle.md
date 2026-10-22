---
title: SDV
tags:
  - platform
aliases:
  - 소프트웨어 정의 차량
verified: 2026-10-03
---

**SDV**(Software-Defined Vehicle)는 소프트웨어를 하드웨어에서 떼어 내고[@bosch-software-defined-mobility-2026][@ti-slyy236-2025], 출고 뒤에도 소프트웨어 업데이트로 새 기능을 더하는 차량이다.[@ti-slyy236-2025][@nxp-future-of-sdvs-2024] Bosch에 따르면 SDV는 차량의 동작과 기능이 대부분 소프트웨어로 정해지는 차량이다.[@bosch-software-defined-mobility-2026]

## 하드웨어와 소프트웨어의 분리

SDV에서는 하드웨어를 바꾸지 않고 소프트웨어만 갱신해 기능을 더할 수 있다.[@ti-slyy236-2025][@bosch-software-defined-vehicle-2026] SDV는 응용 소프트웨어를 특정 하드웨어에 묶지 않는 플랫폼 위에서 개발해, 같은 소프트웨어를 여러 차종에 다시 쓸 수 있게 한다.[@ti-slyy236-2025][@nxp-future-of-sdvs-2024] NXP에 따르면 하드웨어와 소프트웨어를 떼어 내면 시제품 하드웨어가 나오기 전에도 소프트웨어를 개발할 수 있다.[@nxp-future-of-sdvs-2024]

![[diagrams/sdv-software-reuse-across-vehicles.svg]]

## 생명주기

SDV에서는 소프트웨어 개발이 차량의 생명주기 내내 이어진다.[@nxp-future-of-sdvs-2024][@bosch-software-defined-vehicle-2026] Bosch에 따르면 2026년 10월 기준 차량은 공장을 떠날 때 가장 좋은 상태이고, 구성 선택지는 구매 시점에 한정된다.[@bosch-software-defined-vehicle-2026] NXP에 따르면 기존 차량의 펌웨어 업데이트는 대개 정비 때만 적용하는 필수적이거나 제한된 것이었다.[@nxp-future-of-sdvs-2024]

TI 백서에 따르면 자동차 제조사는 SDV가 보낸 데이터로 특정 차종에 공통된 문제를 찾아, 큰 문제가 되기 전에 고칠 수 있다.[@ti-slyy236-2025]

SDV에서는 소프트웨어로 켤 수 있는 기능을 구독 모델로 제공할 수 있다.[@ti-slyy236-2025][@bosch-software-defined-vehicle-2026] Bosch에 따르면 이런 기능은 따로 사게 할 수도 있다.[@bosch-software-defined-vehicle-2026]

## E/E 아키텍처와 OTA

SDV는 소프트웨어를 소수의 고성능 중앙 컴퓨터로 모으는 중앙 집중형 [[ee-architecture|E/E 아키텍처]]를 바탕으로 하고, 출고 뒤의 기능 변경을 [[over-the-air-update|OTA 업데이트]]로 차량에 전달한다.[@bosch-software-defined-mobility-2026][@ti-slyy236-2025]

## 오픈소스 플랫폼

Eclipse SDV는 Eclipse Foundation이 호스트하는 오픈소스 생태계로, 참여 조직들이 차량 아키텍처용 소프트웨어 building block을 함께 개발한다. 그 프로젝트 가운데 하나인 Eclipse S-CORE(Eclipse Safe Open Vehicle Core)는 임베디드 고성능 [[electronic-control-unit|ECU]]를 겨냥해 SDV용 오픈소스 코어 스택을 개발하는 것을 목표로 한다.[@eclipse-sdv-2026]
