---
title: Runnable entity
tags:
  - platform/autosar
verified: 2026-09-30
---

**Runnable entity**는 원자 [[autosar-software-component|SW-C]]의 일부로, 같은 SW-C의 다른 runnable entity와 따로 실행되고 스케줄될 수 있다. [[autosar-rte|RTE]]는 runnable entity를 명령의 한 흐름으로 보고 그 실행을 시작한다.[@autosar-fo-tr-glossary-2025] RTE 명세는 runnable entity를 줄여 runnable이라 부른다.[@autosar-cp-sws-rte-2025]

runnable은 SW-C의 internal behavior에 여럿 둘 수 있으며, 원자 SW-C만 runnable을 가질 수 있다. [[rte-event|RTE 이벤트]]가 runnable을 가리키면, 그 이벤트가 일어날 때 RTE가 runnable의 실행을 시작한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## Symbol과 시그니처

runnable은 진입점 하나를 가진 코드 조각이며, C나 C++로 구현한 SW-C에서는 전역 범위의 함수 하나가 그 진입점을 구현한다.[@autosar-cp-sws-rte-2025] runnable의 symbol 속성은 그 진입점을 기술한다.[@autosar-cp-tps-softwarecomponenttemplate-2025] 진입점 함수의 이름은 symbol이며, SW-C 타입의 SymbolProps에 symbol이 있으면 그 값을 앞에 붙인다.[@autosar-cp-sws-rte-2025]

runnable의 시그니처는 runnable을 시작하는 RTE 이벤트마다 정해진다. TimingEvent, DataReceivedEvent 같은 대부분의 이벤트에서 runnable은 인스턴스 핸들 말고는 인자를 받지 않고 `void`를 돌려준다. 인스턴스 핸들은 SW-C의 supportsMultipleInstantiation이 참일 때만 첫 인자로 둔다. OperationInvokedEvent로 시작하는 서버 runnable은 operation의 argument를 정해진 순서대로 받고, operation에 application error가 정해져 있으면 Std_ReturnType을, 없으면 `void`를 돌려준다.[@autosar-cp-sws-rte-2025]

## Access point

runnable은 자기가 하는 접근을 access point로 밝히고, access point에는 저마다 짝이 되는 RTE API가 있다. runnable의 access point에는 data send point, data receive point, data read access, data write access, server call point, asynchronous server call result point, mode switch point, mode access point, external triggering point, internal triggering point 등이 있다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

RTE는 runnable에 access point가 있으면 그에 맞는 API를 생성한다. 예를 들어 data send point에는 `Rte_Write`나 `Rte_Send`를, server call point에는 `Rte_Call`을 만든다.[@autosar-cp-sws-rte-2025]

## 동시 호출

canBeInvokedConcurrently 속성은 SW-C 인스턴스 하나 안에서도 runnable을 동시에 호출할 수 있는지를 정한다. 참이면 이 동시성은 runnable 구현이 감당하고, 거짓이면 RTE는 그 runnable이 동시에 시작되지 않게 한다. minimumStartInterval은 RTE가 같은 runnable의 연이은 두 실행을 스케줄할 때 그보다 짧아지지 않게 보장하는 시간 간격이다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

## Inter-runnable 변수

**inter-runnable 변수**는 원자 SW-C 안의 runnable끼리 통신하는 수단이며, 그 SW-C의 runnable만 접근할 수 있다.[@autosar-cp-sws-rte-2025] 같은 SW-C 타입이라도 서로 다른 인스턴스에 속한 runnable끼리는 [[software-component-port|포트]]로만 통신한다.[@autosar-cp-tps-softwarecomponenttemplate-2025]

inter-runnable 변수는 명시적인 것과 암묵적인 것 두 종류가 있다. 암묵적 inter-runnable 변수의 값은 그 변수를 읽는 runnable이 실행되는 동안 바뀌지 않는다.[@autosar-cp-tps-softwarecomponenttemplate-2025] RTE는 명시적 변수에 `Rte_IrvWrite`와 `Rte_IrvRead`를, 암묵적 변수에 `Rte_IrvIWrite`와 `Rte_IrvIRead`를 만든다.[@autosar-cp-sws-rte-2025]

## Exclusive area

**exclusive area**는 [[critical-section|임계 구역]]을 구현하며, 동시 접근을 막아 SW-C가 안에서 쓰는 데이터의 일관성을 지킨다. runnable은 `Rte_Enter`와 `Rte_Exit`로 코드 일부만 exclusive area 안에서 실행하거나, runnable 전체를 exclusive area 안에서 실행하게 할 수 있다.[@autosar-cp-sws-rte-2025]

RTE가 데이터 일관성을 지키는 메커니즘에는 runnable을 한 태스크에 차례로 두어 서로 끼어들지 못하게 하는 순차 스케줄링, 인터럽트 막기, 운영체제의 [[osek-resource|resource]] 사용, 관련 태스크끼리 서로 선점하지 못하게 하는 태스크 블로킹, 복사 전략이 있다. 데이터 불일치가 생길 수 없으면 RTE는 메커니즘을 적용하지 않는다.[@autosar-cp-sws-rte-2025]

exclusive area의 구현 방법은 ECU를 통합할 때 설정 파라미터 `RteExclusiveAreaImplMechanism`으로 고른다. 값으로는 모든 인터럽트를 막는 `ALL_INTERRUPT_BLOCKING`, 운영체제 인터럽트를 막는 `OS_INTERRUPT_BLOCKING`, `OS_RESOURCE`, `OS_SPINLOCK`, `NONE`, `RTE_PLUGIN`이 있다.[@autosar-cp-sws-rte-2025]

## 태스크 안의 순서

[[osek-task|태스크]]에 매핑한 runnable마다 설정 파라미터 `RtePositionInTask`로 태스크 안에서의 위치를 정한다.[@autosar-cp-sws-rte-2025] 매핑과 위치의 뜻은 [[rte-event#태스크 매핑|RTE 이벤트]]에서 다룬다.
