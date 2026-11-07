---
title: SDV
tags:
  - hardware/ee-architecture
aliases:
  - 소프트웨어 정의 차량
verified: 2026-10-03
---

**SDV**(Software-Defined Vehicle)는 소프트웨어를 하드웨어에서 떼어 내고[@bosch-software-defined-mobility-2026][@ti-slyy236-2025], 출고 뒤에도 소프트웨어 업데이트로 새 기능을 더하는 차량이다.[@ti-slyy236-2025][@nxp-future-of-sdvs-2024] Bosch에 따르면 SDV는 차량의 동작과 기능이 대부분 소프트웨어로 정해지는 차량이다.[@bosch-software-defined-mobility-2026]

## 하드웨어와 소프트웨어의 분리

SDV에서는 하드웨어를 바꾸지 않고 소프트웨어만 갱신해 기능을 더할 수 있다.[@ti-slyy236-2025][@bosch-software-defined-vehicle-2026] SDV는 응용 소프트웨어를 특정 하드웨어에 묶지 않는 플랫폼 위에서 개발해, 같은 소프트웨어를 여러 차종에 다시 쓸 수 있게 한다.[@ti-slyy236-2025][@nxp-future-of-sdvs-2024]

![[diagrams/sdv-software-reuse-across-vehicles.svg]]

TI 백서에 따르면 하드웨어와 소프트웨어를 떼어 내려면 추상화 계층이 여럿 필요하고, 계층 사이를 표준 API로 이으면 응용 소스 코드를 여러 분산 [[electronic-control-unit|ECU]]에서 다시 쓸 수 있다. 특정 응용을 위해 설계한 센서와 액추에이터를 소프트웨어로 새 기능에 다시 쓸 수도 있다. 예를 들어 탑승 감지용으로 설계한 실내 레이더 센서를 침입·도난 감지와 안전띠 알림에도 쓸 수 있다.[@ti-slyy236-2025]

NXP에 따르면 SDV에서는 가상화와 소프트웨어 컨테이너로 소프트웨어 모듈을 서로 떼어 놓고 하드웨어에서 추상화할 수 있다. 임베디드 환경에서는 가상화가 격리층을 하나 더 주며, 하이퍼바이저가 같은 프로세서에서 도는, 기능상 서로 독립인 작업 사이의 격리를 지키도록 돕는다.[@nxp-future-of-sdvs-2024]

## 생명주기

SDV에서는 소프트웨어 개발이 차량의 생명주기 내내 이어진다.[@nxp-future-of-sdvs-2024][@bosch-software-defined-vehicle-2026] Bosch에 따르면 기존 차량은 공장을 떠날 때 가장 좋은 상태였고, 구성 선택지가 구매 시점에 한정됐다.[@bosch-software-defined-vehicle-2026] NXP에 따르면 기존 차량의 펌웨어 업데이트는 대개 정비 때만 적용하는 필수적이거나 제한된 것이었다.[@nxp-future-of-sdvs-2024]

NXP는 하드웨어와 소프트웨어를 떼어 내 시제품 하드웨어가 없어도 소프트웨어를 개발 주기 앞쪽에서 끝내는 것을 **shift left**, 판매한 뒤에도 차량을 업데이트하는 것을 **stretch right**라 부른다. 디지털 트윈으로 하드웨어 없이 대부분의 시험을 하더라도, 디지털 트윈 시뮬레이션의 동작을 실제 조건과 견주는 [[x-in-the-loop#HiL|HiL]](hardware-in-the-loop) 시험은 여전히 필요하다.[@nxp-future-of-sdvs-2024]

TI 백서에 따르면 자동차 제조사는 SDV가 보낸 데이터로 특정 차종에 공통된 문제를 찾아, 큰 문제가 되기 전에 고칠 수 있다.[@ti-slyy236-2025]

SDV에서는 소프트웨어로 켤 수 있는 기능을 구독 모델로 제공할 수 있다.[@ti-slyy236-2025][@bosch-software-defined-vehicle-2026] Bosch에 따르면 이런 기능은 따로 사게 할 수도 있다.[@bosch-software-defined-vehicle-2026]

## E/E 아키텍처와 OTA

SDV는 소프트웨어를 소수의 고성능 [[high-performance-computer|중앙 컴퓨터]]로 모으는 중앙 집중형 [[ee-architecture|E/E 아키텍처]]를 바탕으로 하고, 출고 뒤의 기능 변경을 [[over-the-air-update|OTA 업데이트]]로 차량에 전달한다.[@bosch-software-defined-mobility-2026][@ti-slyy236-2025]

## 오픈소스 플랫폼

Eclipse SDV는 Eclipse Foundation이 호스트하는 오픈소스 생태계로, 참여 조직들이 차량 아키텍처용 소프트웨어 building block을 함께 개발한다.[@eclipse-sdv-2026] Eclipse SDV working group의 프로젝트들이 공용 building block을 개발하는 영역으로는 middleware, orchestration, safety, simulation 등이 있다.[@eclipse-sdv-about-2026] Eclipse SDV는 생태계의 기술을 한데 묶는 integration project로 Linux 기반 배포판인 Eclipse Leda, [[eclipse-s-core|Eclipse S-CORE]], 실제 쓰임새를 모듈로 보이는 Eclipse SDV Blueprints를 둔다.[@eclipse-sdv-integration-projects-2026]

[[vehicle-signal-specification|VSS]]는 차량 안과 클라우드에서 차량 데이터를 같은 방식으로 기술하는 공통 언어 구실을 하는 데이터 모델이다.[@covesa-vss-2026]
