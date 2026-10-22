---
title: AUTOSAR 라이브러리
tags:
  - platform/autosar
verified: 2026-10-07
---

AUTOSAR R25-11 Layered Software Architecture는 **AUTOSAR 라이브러리**를 관련된 목적의 함수를 모은 것으로 정의한다. 라이브러리는 BSW(Basic Software) 모듈([[autosar-rte|RTE]] 포함), [[autosar-software-component|SW-C]], 다른 라이브러리, Integration Code가 부를 수 있고, 라이브러리끼리만 부를 수 있으며 BSW 모듈은 부르지 못한다. 라이브러리는 재진입할 수 있고, 내부 상태가 없으며, 초기화가 필요 없고, 대기 지점이 없는 동기 함수로 이루어진다. 설정을 둘 수는 있지만 권하지 않는다. 라이브러리는 부른 쪽의 context에서, 부른 쪽과 같은 [[autosar-os-application#Memory protection|보호 환경]]으로 실행된다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 요구사항

라이브러리는 모든 BSW 모듈과 응용 SW-C보다 먼저 동작할 수 있어야 한다. ECU 초기화의 맨 첫 단계에서 [[autosar-os|OS]]나 [[ecu-state-manager|EcuM]]도 라이브러리 함수를 부를 수 있기 때문이다. SW-C는 [[software-component-port|포트]]와 RTE를 거치지 않고 라이브러리 헤더 파일을 포함해 라이브러리 함수를 직접 부른다. 라이브러리 호출은 클라이언트-서버 operation이 아니라 기본 연산이어서 일관성 검사, 큐잉, ECU 밖 통신이 필요 없고, 자주 쓰이므로 효율적으로 불려야 한다.[@autosar-cp-rs-libraries-2025]

라이브러리 함수는 모두 재진입할 수 있어, 동시에 겹치거나 섞여 들어오는 요청을 여럿 처리할 수 있어야 한다. 그러려면 재진입할 수 없는 함수를 부르지 않고, 전역 변수와 static 변수에 쓰지 않으며, 다룰 데이터는 호출자가 만들어 매개변수로 넘긴다. 라이브러리 함수는 부른 코어에서 실행된다. 라이브러리마다 공개 인터페이스를 담은 헤더 파일 하나(`<library short name>.h`)를 두고, 함수 이름과 타입 이름은 라이브러리 짧은 이름과 밑줄로 시작한다.[@autosar-cp-rs-libraries-2025]

## 목록

라이브러리는 열 개가 있다.[@autosar-cp-sws-bswgeneral-2025]

이 라이브러리들이 하는 일은 아래와 같다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

| 라이브러리 | 하는 일                                             |
| ---------- | --------------------------------------------------- |
| Mfx        | 고정소수점 수학 함수                                |
| Mfl        | 부동소수점 수학 함수                                |
| Ifx        | 고정소수점 데이터의 보간                            |
| Ifl        | 부동소수점 데이터의 보간                            |
| Efx        | 64비트 계산, 필터링 같은 확장 함수                  |
| Bfx        | 비트 다루기                                         |
| E2E        | [[autosar-e2e-protection\|E2E]] 통신                |
| Crc        | [[cyclic-redundancy-check#계산 매개변수\|CRC 계산]] |
| Bmc        | 멀티코어에서 안전한 원자적 연산                     |
| Msf        | 메모리 표준 함수                                    |

## BSW 모듈과의 차이

라이브러리와 BSW 모듈은 둘 다 SWS(Software Specification)로 명세하되, 초기화, 사용자, 호출, 오류 처리가 다르다. 라이브러리에는 `Init()`도 `DeInit()`도 없어 함수를 곧바로 쓸 수 있지만, BSW 모듈은 초기화가 필요하고 초기화하지 않은 모듈의 함수를 부르면 E_UNINIT 오류가 날 수 있다. SW-C는 라이브러리 함수를 직접 부를 수 있지만, BSW 모듈의 기능에는 포트로만 접근한다. 라이브러리는 BSW 모듈을 부를 수 없으므로 [[autosar-error-handling#Det|Det]]나 [[diagnostic-event-manager|Dem]]에 오류를 보고할 수 없고 OS도 부를 수 없다. 오류 처리도 거의 없어, 호출자가 책임 있게 부른다고 본다. 라이브러리는 상태가 없어, 상태가 필요하면 사용자가 handle 같은 것으로 넘긴다. 라이브러리의 긴 제목에는 Library라는 말이 들어, BSW 모듈과 쉽게 가릴 수 있다.[@autosar-cp-sws-bswgeneral-2025]

대부분의 AUTOSAR 라이브러리는 설정이 없다. 라이브러리는 전역 범위를 가져 모든 SW-C와 BSW 모듈이 직접 쓰고, 설정 포인터를 받을 `Init()` 함수도 없기 때문이다. 설정이 필요하면 pre-compile 설정만 쓸 수 있다. 라이브러리 코드는 서로 다른 메모리 파티션의 호출자가 함께 쓸 수 있게 구현해야 하고, C 시작 과정이 끝나는 대로 쓸 수 있어야 한다. 라이브러리는 사용자의 잘못과 범위 밖 값을 다루지 않으며, 그런 입력의 동작은 정해지지 않는다.[@autosar-cp-sws-bswgeneral-2025]
