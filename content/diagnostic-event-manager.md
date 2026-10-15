---
title: Diagnostic Event Manager
tags:
  - platform/autosar
  - network/diagnostics
aliases:
  - Dem
verified: 2026-10-07
---

AUTOSAR R25-11의 Dem 명세는 **Diagnostic Event Manager**(Dem)를 진단 이벤트(오류)와 그에 딸린 데이터를 처리하고 저장하는 서비스 컴포넌트로 정의한다. Dem은 event memory에 저장된 DTC(Diagnostic Trouble Code)를 모두 읽어 주는 일처럼 고장 정보를 Dcm(Diagnostic Communication Manager)에 주고, 응용 계층과 다른 BSW(Basic Software) 모듈에 인터페이스를 준다. 이 명세는 완성차 업체와 부품 공급자가 함께 쓰는 "진단 고장 메모리"의 공통 접근을 목표로 하며, 내부 동작의 일부는 제조사마다 정한다.[@autosar-cp-sws-diagnosticeventmanager-2025]

## 진단 이벤트

진단 이벤트는 Dem이 다루는 가장 작은 단위로, 그 상태는 monitor의 결과를 나타낸다. Dem은 monitor의 결과를 [[autosar-rte|RTE]]를 거쳐 [[autosar-software-component|SW-C]]에서 받거나 다른 BSW 모듈에서 받는다. Dem은 진단 이벤트마다 EventId와 EventName을 두며, 둘은 ECU 설정이 나타내는 Dem 모듈 안에서 유일해야 한다. monitor와 BSW 모듈은 EventId를 기호 이름으로 쓰고, Dem 설정 도구가 그 기호를 숫자로 바꾼다. monitor 여럿이 EventId 하나를 함께 쓰는 경우는 Dem이 다루지 않는다.[@autosar-cp-sws-diagnosticeventmanager-2025]

Dem에 넘기는 이벤트 ID(identifier)는 ECU 전체에서, 정적으로 정하고, 효율을 위해 촘촘한 값 범위에 둔다. Dem이 이 ID를 ROM 배열의 첨자로 쓰기 때문이다. 각 BSW 모듈은 필요한 양산 관련 오류를 ECU 설정 기술에 적고, Dem의 설정 도구가 그 기술을 읽어 모듈들이 쓸 전역 상수를 담은 파일 하나를 만든다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

production error와 extended production error의 이벤트 ID 값은 Dem 설정이 바깥에서 정한다. 이 ID는 Dem이 `Dem.h`로 주는 기호 이름 값이며, production error의 기호는 BSW 모듈의 ServiceNeeds 짧은 이름 앞에 `DemConf_DemEventParameter_`를 붙인 꼴이다.[@autosar-cp-sws-bswgeneral-2025] BSW 모듈이 Dem에 이벤트를 보고하는 길은 [[autosar-error-handling#오류 유형|AUTOSAR 오류 처리]]에서 다룬다.

## Debouncing

debouncing 알고리즘은 이벤트마다 설정할 수 있다(`DemDebounceAlgorithmClass`). Dem 안에서 돌리는 알고리즘을 설정한 이벤트는 Dem이 debouncing을 하고, 그렇지 않은 이벤트는 SW-C나 BSW의 monitor가 debouncing을 마친 뒤 상태를 보고한다. 알고리즘에는 counter 기반, time 기반, monitor 안에서 하는 것이 있다. Counter 기반 알고리즘은 이벤트마다 내부 debounce counter를 두고, 그 값과 범위를 [[uds|UDS]]의 fault detection counter(−128…+127)로 선형으로 옮긴다. Failed 상태를 나타내는 문턱값과 passed 상태를 나타내는 문턱값은 각각 이벤트마다 설정한다.[@autosar-cp-sws-diagnosticeventmanager-2025]

## Event memory와 DTC

**Event memory**는 전용 메모리 블록에 놓인 event record의 모음이고, event record는 적어도 UDS 상태와 event related data를 담는다. Dem은 primary event memory를 반드시 지원하고, 설정하면 user defined와 permanent event memory도 지원한다. Event memory의 크기는 ECU의 메모리에 맞춰 설정하며, 비휘발성 메모리에 저장할 때는 [[nvram-manager|NVRAM Manager]]를 쓴다.[@autosar-cp-sws-diagnosticeventmanager-2025]

DTC는 진단 테스터에 보이는 고유 식별자로, Dem의 진단 이벤트에 대응한다. Dem은 DTC의 상태를 Dcm에 준다. 같은 event memory를 가리키는 DTC끼리는 DTC 값이 달라야 한다.[@autosar-cp-sws-diagnosticeventmanager-2025] UDS의 DTC 형식은 [[uds#데이터 식별자와 고장 코드|UDS]]에서 다룬다.

## Freeze frame

Event related data는 이벤트가 생길 때 함께 저장하는 센서 값, 시각, 주행 거리 같은 추가 데이터로, [[iso-14229-1|ISO 14229-1]]에 따라 snapshot data(freeze frame)와 extended data로 나뉜다. 어느 데이터를 몇 벌 저장할지는 OEM과 고장에 따라 크게 달라 설정으로 정하고, 데이터는 SW-C나 다른 BSW 모듈이 준다. Dem은 이벤트마다 freeze frame을 저장하고, freeze frame 레코드 하나에 설정된 DID(Data Identifier)를 하나 이상 담는다. 배출과 무관한 freeze frame은 이벤트마다 설정하고 레코드 번호도 그 이벤트 안에서만 유일하다. 배출 관련 freeze frame은 OBD(On-Board Diagnostics) 법규가 freeze frame class 하나만 요구하므로 ECU 전체에 하나로 설정한다.[@autosar-cp-sws-diagnosticeventmanager-2025]

## FiM

**FiM**(Function Inhibition Manager)은 SW-C와 그 안의 기능을 제어하는 수단을 주는 모듈이다. 여기서 기능은 같은 허용·금지 조건을 갖는 [[runnable-entity|runnable]] 하나나 여럿, 또는 그 일부로 이루어진다. 기능마다 FID(Function Identifier)와 그 금지 조건을 배정하고, 기능은 실행하기 전에 자기 FID의 허용 상태를 묻는다. 어느 FID의 금지 조건이 참이 되면 그 기능은 더는 실행되지 않는다. 금지는 설정으로 정하고, 실행 중에도 post-build 설정으로 바꿀 수 있다. FiM의 서비스는 SW-C의 기능을 주로 겨누지만 BSW의 기능도 쓸 수 있다.[@autosar-cp-sws-functioninhibitionmanager-2025]

FiM은 진단 이벤트와 그 상태를 금지 조건으로 쓰므로 Dem과 밀접하다. 어느 센서의 고장처럼 고장이 나면 멈춰야 하는 기능을 FID 하나로 나타내 두면, 그 고장이 감지되어 Dem에 보고될 때 FiM이 그 FID를 금지해 해당 기능을 막는다. 진단 이벤트 여럿을 summarized event 하나로 묶어 금지 조건으로 쓸 수도 있다.[@autosar-cp-sws-functioninhibitionmanager-2025]

![[diagrams/dem-monitor-dcm-fim.svg]]
