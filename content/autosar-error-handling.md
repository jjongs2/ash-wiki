---
title: AUTOSAR 오류 처리
tags:
  - platform/autosar
verified: 2026-10-07
---

**AUTOSAR 오류 처리**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 BSW(Basic Software) 모듈이 오류를 유형에 따라 나눠 감지하고 보고하는 방식이다. AUTOSAR R25-11의 BSW 일반 명세는 BSW 모듈이 감지하거나 보고할 수 있는 모든 오류를 development error, runtime error, production error, extended production error로 나누고, 각 오류는 모듈의 SWS(Software Specification) 7장에 정한다.[@autosar-cp-sws-bswgeneral-2025]

## 오류 유형

- **Development error**: 주로 소프트웨어 개발 중에 생기는 버그로, 초기화하지 않은 소프트웨어를 쓰려는 것이 전형적인 예다. `Det_ReportError`로 Det(Default Error Tracer)에 보고하며, assertion처럼 동작해 ECU 전체를 멈추거나 리셋해 정상 실행 흐름을 끊는다.
- **Runtime error**: ECU가 도는 동안 소프트웨어나 하드웨어 문제로 생기는 오류로, [[autosar-memory-stack|메모리 스택]]의 큐 넘침, 잘못된 때의 API 호출, 입자 방사로 [[can|CAN]] 컨트롤러의 제어 레지스터 비트가 뒤집히는 일이 예다. 원인이 사라지면 나을 수도 있다. `Det_ReportRuntimeError`로 Det에 보고하지만 assertion을 일으키지 않아 실행이 이어지고, 대신 대응하는 오류 처리기가 돈다.
- **Production error**: 노화, 열화, 하드웨어의 완전한 고장, 나쁜 생산 품질, 잘못된 조립 같은 하드웨어 문제로 생기는 오류다. 배출가스를 늘려 법규상 감지해야 하거나, 다른 OBD(On-Board Diagnostics) 관련 진단 monitor의 능력을 제한하거나, limp-home 대응을 요구하거나, 정비소가 고장 부품을 찾게 해야 하는 경우가 여기에 든다. [[diagnostic-event-manager|Dem]]에 보고하며, monitor가 fail이면 대개 primary event memory에 항목이 생기고 pass면 그 항목이 취소될 수 있다.
- **Extended production error**: production error처럼 하드웨어 문제나 환경의 이상을 나타내지만, production error의 기준에 들지 않거나 이미 정의된 production error와 근본 원인이 같은 오류다. production error의 실제 원인을 더 알아내는 데 쓴다. Dem에 보고하되, fail 상태가 곧바로 primary event memory의 항목이 되어서는 안 된다.[@autosar-cp-sws-bswgeneral-2025]

Development error의 감지와 보고는 설정 스위치 `<Ma>DevErrorDetect`를 켰을 때만 하고, 이 스위치의 기본값은 꺼짐이다. 스위치를 켜면 API 매개변수 검사도 켜진다. Runtime error는 development error와 달리 설정으로 끌 수 없다. Production error와 extended production error의 감지도 모듈의 SWS가 활성 조건을 따로 정하지 않는 한 끌 수 없다.[@autosar-cp-sws-bswgeneral-2025]

BSW 모듈은 설정된 production error와 extended production error를 Dem의 `Dem_SetEventStatus`로 보고한다. 오류가 일어났으면 `DEM_EVENT_STATUS_FAILED`를, 오류가 없음을 확인했으면 `DEM_EVENT_STATUS_PASSED`를 넘기고, 판정에 debouncing이 더 필요하면 `DEM_EVENT_STATUS_PREFAILED`나 `DEM_EVENT_STATUS_PREPASSED`를 넘긴다. 검사할 수 없으면 아무 결과도 보고하지 않는다.[@autosar-cp-sws-bswgeneral-2025]

![[diagrams/bsw-error-type-reporting.svg]]

## 보고 경로

오류를 알리는 길은 다섯이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 길                                                | 쓰임                                     |
| ------------------------------------------------- | ---------------------------------------- |
| API                                               | 호출자에게 동작의 성공이나 실패를 알린다 |
| 정적으로 정할 수 있는 callback 함수(notification) | 호출자에게 실패를 알린다                 |
| Det의 중앙 error hook                             | 개발 중에 오류를 기록하고 추적한다       |
| Det의 중앙 callout                                | 제품 수명 동안 오류를 처리한다           |
| Dem의 중앙 오류 함수                              | 양산 코드에서 오류에 대응하고 기록한다   |

API로 알릴 때 기본 반환형은 성공을 뜻하는 E_OK(값 0)와 실패를 뜻하는 E_NOT_OK(값 1)다. 양산 코드에서 오류를 서로 구분해야 하면 따로 반환형을 정하되, 호출자가 실제로 그 오류를 다룰 수 있을 때만 쓴다. Development error는 API로 돌려주지 않으며, Det에 보고할 수 있다. Det의 callout에서 Integration Code는 development error 때 ECU가 리셋되기 전에 준비를 할 수 있고, runtime error 때 보고를 더 할 수 있다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] Callout은 [[autosar-layered-architecture#Integration Code와 callout|AUTOSAR 계층 구조]]에서 다룬다.

## Det

**Det**(Default Error Tracer)는 BSW에서 감지한 모든 development error와 runtime error를 보고받는 모듈이다. API 매개변수로 오류를 감지한 모듈, 함수, 오류의 종류를 추적할 수 있다. API 뒤의 기능은 Det 명세의 범위 밖이어서, 디버거 중단점 걸기, 보고된 오류 세기, RAM 버퍼에 호출과 매개변수 기록하기, 통신 인터페이스로 외부 로거에 보내기 같은 전략을 개발자와 통합자가 고른다.[@autosar-cp-sws-defaulterrortracer-2025]

`Det_ReportError`는 인자 넷을 받는다.[@autosar-cp-sws-defaulterrortracer-2025]

| 인자       | 타입   | 뜻                                                                                            |
| ---------- | ------ | --------------------------------------------------------------------------------------------- |
| ModuleId   | uint16 | 호출한 모듈의 모듈 ID(identifier)                                                             |
| InstanceId | uint8  | 인덱스로 구분하는 모듈 인스턴스의 식별자. 0부터 매기고, 인스턴스가 하나뿐인 모듈은 0을 넘긴다 |
| ApiId      | uint8  | 오류를 감지한 API 서비스의 ID. 호출한 모듈의 SWS가 정한다                                     |
| ErrorId    | uint8  | 감지한 development error의 ID. 호출한 모듈의 SWS가 정한다                                     |

`Det_ReportRuntimeError`도 같은 꼴의 인자를 받되 ErrorId는 감지한 runtime error의 ID이고, 설정된 callout이 있으면 그것을 부르며, 늘 E_OK를 돌려준다. 두 보고 함수는 재진입할 수 있고, 설정된 error hook을 모두 곧바로 부른다. `Det_ReportError`는 실행을 멈춘다.[@autosar-cp-sws-defaulterrortracer-2025]

Runtime error가 일어나면 대응하는 오류 처리기가 돌고, 통합자는 이 처리기를 Det 안의 callout으로 구현할 수 있다. 이 처리기는 오류 이벤트를 메모리에 저장하거나, Dem을 부르거나, 짧고 합당한 동작만 한다. 이 callout의 함수 이름은 Det의 설정 파라미터 `DetReportRuntimeErrorCallout`으로 정한다.[@autosar-cp-sws-bswgeneral-2025]
