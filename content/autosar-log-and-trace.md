---
title: AUTOSAR Log and Trace
tags:
  - platform/autosar
verified: 2026-10-07
---

**AUTOSAR Log and Trace**는 [[autosar|AUTOSAR]] 응용이 로그와 트레이스 정보를 통신 버스, 콘솔, 파일 시스템으로 내보내도록 인터페이스를 주는 기능이다.[@autosar-fo-tr-glossary-2025] AUTOSAR [[autosar-classic-platform|Classic Platform]] R25-11의 Dlt 명세는 로그·트레이스 정보를 통신 버스로 내보내는 일을 Dlt(Diagnostic Log and Trace) 모듈에 맡기고, Dlt 메시지 형식, 명령, 외부 로깅·트레이스 도구와 주고받는 프로토콜은 Foundation의 Log and Trace 프로토콜 명세에 맡긴다.[@autosar-cp-sws-diagnosticlogandtrace-2025] AUTOSAR [[autosar-adaptive-platform|Adaptive Platform]] R25-11의 Log and Trace 명세는 이 일을 Log and Trace functional cluster에 맡기고, 로깅 정보를 표준 전달 형식으로 묶는 데 같은 프로토콜 명세의 LT(Log and Trace) 프로토콜을 쓸 수 있게 한다.[@autosar-ap-sws-logandtrace-2025]

## Classic Platform의 Dlt

AUTOSAR Classic Platform R25-11의 Dlt 명세는 Dlt가 Det(Default Error Tracer), Dem, [[autosar-software-component|SW-C]]의 로그 정보와 [[autosar-rte|RTE]]의 트레이스 정보를 받아 통신 버스로 보내, 이 정보를 ECU 밖에서 볼 수 있게 하도록 정한다. Dlt는 [[pdu-router|PduR]] 위, RTE 아래에 놓인다. 필터 설정을 [[nvram-manager|NvM]]에 저장해 두면, ECU를 켤 때마다 로깅 도구가 설정을 다시 요청하지 않아도 원하는 수준으로 로그와 트레이스를 보낼 수 있다.[@autosar-cp-sws-diagnosticlogandtrace-2025]

로그·트레이스 메시지를 만드는 쪽을 **Dlt User**라 하며, SW-C, RTE([[virtual-functional-bus|VFB]] 트레이스), Dem, Det가 여기에 든다. Log Message는 상태나 값의 변화 같은 디버그 정보를 담고, Trace Message는 VFB를 지난 정보를 담는다. 메시지의 출처는 Application ID와 Context ID의 쌍으로 가린다. Application ID는 메시지를 만든 응용이나 SW-C를 가리키고, Context ID는 한 응용이 만든 메시지를 묶는 사용자 정의 식별자다. 둘 다 8비트 문자 네 개로 이루어진다. Application ID 하나가 Context ID 여럿을 가질 수 있고, Context ID는 한 Application ID 안에서 고유해야 한다.[@autosar-cp-sws-diagnosticlogandtrace-2025]

Dlt의 기능은 SW-C의 오류·경고·정보 메시지와 Dem 메시지의 logging, RTE 활동의 tracing, 개별 메시지를 켜고 끄고 로그 수준을 back channel로 하나하나 조정하는 제어다. Dlt는 개발 단계와 생산 단계 모두에서 쓸 수 있고, 생산 단계에서 잘못 쓰이지 않도록 보안 메커니즘을 둔다. Dlt 통신 모듈은 외부 클라이언트가 켠다. SW-C가 Dlt의 인터페이스로 로그 메시지를 넘기면 Dlt가 이를 Dlt 프로토콜로 인코딩해 통신 버스로 보내고, 외부 Dlt 클라이언트가 이 메시지를 모아 나중에 분석할 수 있게 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## Adaptive Platform의 Log and Trace

AUTOSAR Adaptive Platform R25-11의 Log and Trace 명세는 Log and Trace가 Adaptive Application에 로깅 정보를 통신 버스, 콘솔, 파일 시스템, 시스템의 트레이스 기능으로 내보내는 인터페이스를 주도록 정한다. 로깅 정보마다 심각도 수준을 두고, 응용과 `ara::com` 같은 functional cluster는 심각도마다 마련된 메서드로 로그를 남긴다.[@autosar-ap-sws-logandtrace-2025]

Log and Trace는 개발 중뿐 아니라 생산 중과 생산 뒤에도 쓸 수 있고, 로깅 정보는 설정에 따라 통신 버스, 파일, 시리얼 콘솔, 하드웨어나 소프트웨어 tracer 같은 여러 sink로 보낼 수 있다. 정한 심각도 이상의 정보만 남기도록 설정할 수 있다. 인터페이스는 `ara::log` 네임스페이스에 있다.[@autosar-ap-exp-platformdesign-2025]

Log and Trace functional cluster의 로그 메시지는 modeled 메시지와 non-modeled 메시지 둘로 나뉜다. **Non-modeled 메시지**는 모든 인자를 내부 버퍼에 담아 직렬화하고 메시지의 모든 부분을 네트워크로 보내는 전통적인 방식으로, LT 프로토콜에서는 verbose 메시지라 부른다. **Modeled 메시지**는 바뀌지 않는 정적 부분을 응용의 AUTOSAR 모델에 두고 네트워크로 보내지 않아 트래픽을 줄이며, LT 프로토콜에서는 non-verbose 메시지라 부른다. 로그 뷰어는 모델의 정적 부분과 받은 메시지의 동적 부분을 합쳐 전체 메시지를 보여 준다. Non-modeled 메시지는 미리 모델링할 필요가 없어 쓰기 쉽지만 CPU 시간과 네트워크 부하가 더 크다. 그래서 알고리즘과 제어 흐름을 빠르게 분석할 때는 non-modeled 메시지를 쓸 수 있지만, 타이밍에 관련된 용도와 양산 시스템에서는 modeled 메시지를 써야 한다.[@autosar-ap-exp-platformdesign-2025]

![[diagrams/log-modeled-non-modeled-messages.svg]]

## Log and Trace 프로토콜

AUTOSAR R25-11의 Log and Trace 프로토콜 명세는 Dlt 프로토콜의 형식, 메시지 순서, 의미를 정한다. Dlt 모듈은 응용이나 다른 소프트웨어 모듈의 디버그 정보를 모아 메타데이터를 붙여 통신 버스로 보낸다. 디버그 정보는 fatal, error, information 같은 심각도로 거를 수 있고, 외부 로깅 도구가 보내는 Dlt 제어 메시지로 실행 중에 이 필터를 바꿀 수 있다.[@autosar-fo-prs-logandtraceprotocol-2025]

이 명세가 정한 프로토콜 버전 2는 버전 1과 하위 호환되는 방식으로는 더할 수 없던 기능을 들였다. 메시지 필터링용 태그와 개인정보 플래그, 나노초 해상도의 타임스탬프, 헤더에 담는 긴 ECU·응용·컨텍스트 이름, 소스 파일 이름과 줄 번호가 그렇다. 버전 1도 계속 유효하다.[@autosar-fo-prs-logandtraceprotocol-2025]

디버그 데이터와 제어 정보는 같은 Dlt 메시지 형식을 쓰며, 메시지는 Base Header, 선택 항목인 Extension Header, Payload로 이루어진다. 두 헤더는 늘 네트워크 바이트 순서, 곧 [[byte-order|빅 엔디언]]을 쓴다. Verbose 모드의 데이터 메시지와 제어 메시지에는 Base Header에 메시지 정보와 인자 수 필드를 더하고, non-verbose 모드의 데이터 메시지에는 Message ID를 더한다.[@autosar-fo-prs-logandtraceprotocol-2025]

이 명세는 Dlt 프로토콜을 ECU 개발 단계에 쓰도록 의도하고, 개발 단계가 끝나면 Dlt 기능을 끄기를 강하게 권한다. Dlt 기능을 켜고 끄는 일에는 보안 메커니즘을 쓰기를 권한다.[@autosar-fo-prs-logandtraceprotocol-2025]

## Logging, tracing, profiling

Logging, tracing, profiling의 뜻은 아래와 같다.[@autosar-fo-tr-glossary-2025]

- **Logging**: 시스템이 실행되는 동안 서로 관련이 없을 수도 있는 사건의 정보를 모으는 활동이다. 프로그램의 결함을 찾아 고치는 데 쓸 정보를 얻는 것이 목적이어서, 출시한 제품에서도 쓸 수 있어야 하고 사람이 읽을 수 있는 로그를 만든다. 프로그램 내부의 흐름이나 상태 변수를 기록하는 tracing과 달리, 개발자가 소스 코드에 넣은 사건을 모은다.
- **Tracing**: 일정한 시간 동안 시스템 안에서 프로그램의 관찰 가능한 상태와 실행 경로를 기록하는 활동이다. 정한 종류의 사건을 시간에 따라 trace buffer에 모으며, 타이밍 측정과 성능 최적화를 위해 타임스탬프를 함께 저장하기도 한다. 주로 개발 단계에서 쓴다.
- **Profiling**: 성능을 평가하는 과정이다. 측정이나 트레이스 같은 기록을 바탕으로, 함수, 태스크, [[runnable-entity|runnable]], 모듈, 버스 등의 성능 지표를 기술 통계로 모은다.[@autosar-fo-tr-glossary-2025]
