---
title: AUTOSAR Execution Management
tags:
  - platform/autosar
verified: 2026-10-07
---

AUTOSAR R25-11 Adaptive Platform 설계 설명서는 **Execution Management**(EM)를 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 초기화와 프로세스의 시작·종료를 비롯한 시스템 실행 관리 전반을 맡는 functional cluster로 정의한다. Execution Management는 운영체제와 함께 프로세스의 실행 중 스케줄링을 설정한다.[@autosar-ap-exp-platformdesign-2025]

## 시스템 시작

[[autosar-adaptive-platform#Machine과 프로세스|Machine]]이 시작되면 운영체제가 초기화된 뒤 Execution Management가 플랫폼의 첫 프로세스로 실행된다. Execution Management는 [[autosar-adaptive-platform#Functional cluster|Adaptive Platform Foundation]]의 functional cluster를 나타내는 플랫폼 수준 프로세스를 띄우고, Foundation이 돌기 시작하면 Adaptive Application의 프로세스를 이어 띄운다. 플랫폼 수준과 응용 수준 프로세스의 시작 순서는 Execution Management가 [[autosar-manifest#종류|Machine Manifest]]와, [[autosar-manifest#종류|Execution Manifest]]에 적은 의존성을 바탕으로 정한다.[@autosar-ap-exp-platformdesign-2025]

운영체제는 Execution Management를 Adaptive Platform의 첫 프로세스로 시작할 수 있어야 한다.[@autosar-ap-sws-operatingsysteminterface-2025]

준비를 마친 Execution Management는 [[autosar-state-management#Machine State와 Function Group State|Machine State]]를 Off에서 Startup으로 바꾸고, 그동안 Startup Machine State에 속한 프로세스의 시작을 요청한다. Off는 Execution Management가 시작되기 전의 기본 상태다. 전이 조건이 채워지면 Execution Management는 [[autosar-state-management|State Management]]에 Startup 전이를 확인해 주고, 이때부터 [[autosar-state-management#Machine State와 Function Group State|Function Group]] 상태 변경을 시작하는 책임을 State Management에 넘긴다. 다만 운영체제의 init 프로세스나 마이크로커널의 사용자 수준 드라이버처럼 Adaptive Platform 밖에서 시작하고 관리하는 프로세스가 Execution Management보다 먼저 있을 수 있다.[@autosar-ap-sws-executionmanagement-2025]

![[diagrams/execution-management-startup.svg]]

## 책임

Execution Management의 책임은 셋으로 나뉜다.[@autosar-ap-exp-platformdesign-2025]

- **Platform Lifecycle Startup**: Adaptive Platform 시작 단계에 실행되어 Adaptive Platform과 배치된 응용을 초기화한다.
- **Application Lifecycle Management**: 배치된 응용을 순서대로 시작하고 종료한다. 배치된 응용이 무엇인지 파악하고, 선언된 실행 의존성에서 시작·종료 순서를 끌어낸다.
- **State Management Support**: 플랫폼 생명주기 시작을 마친 뒤, Function Group State를 바꿔 플랫폼과 응용의 생명주기 관리를 제어하는 서비스를 제공한다. 이로써 프로젝트마다 다른 정책은 State Management가 맡는다.[@autosar-ap-exp-platformdesign-2025]

응용의 실행 중 스케줄링은 운영체제가 맡고, Execution Management는 운영체제의 설정을 맡는다. 어느 응용을 언제 시작하고 끝낼지는 Execution Management가 아니라 State Management가 정해 Execution Management에 명령한다.[@autosar-ap-exp-platformdesign-2025]

## 프로세스

Modelled Process는 [[autosar-adaptive-platform#Machine과 프로세스|Executable]]의 인스턴스이고, Adaptive Platform에서 실행 중에 운영체제 프로세스로 실현된다. Execution Management는 응용의 경계와 상관없이 모든 Executable과 그로부터 나온 Modelled Process를 똑같이 다룬다. 이 릴리스는 대체로, 프로세스가 코드 안에서 운영체제 인터페이스 API를 불러 자기 스레드의 생성과 스케줄링을 스스로 제어한다고 가정한다. 그래서 Execution Management는 프로세스를 시작하고 끝내기만 하고, 프로세스가 도는 동안에는 State Management 메커니즘을 제공하는 것으로만 프로세스와 상호작용한다.[@autosar-ap-sws-executionmanagement-2025]

프로세스가 보는 자기 생명주기는 Execution State이고, Execution Management가 보는 프로세스의 생명주기는 Process State다. 프로세스가 Execution Management에 알릴 수 있는 Execution State는 시작된 뒤 알리는 `kRunning` 하나이고, 이를 알리지 않는 프로세스도 있다. Execution Management는 프로세스가 알려 오는 Execution State 변화로 Process State를 만들고 유지하며, Process State로 실행 의존성을 풀고 프로세스의 시작·종료 타임아웃 등을 관리한다. Process State에는 아래 다섯이 있고, 구현은 이와 충돌하거나 이를 대신하지 않는 Process State를 더 정의할 수 있다.[@autosar-ap-sws-executionmanagement-2025]

- **Idle**: 프로세스를 만들고 자원을 할당하기 전
- **Starting**: 프로세스를 만들고 자원을 할당한 뒤
- **Running**: 상태를 알리는 프로세스는 `kRunning` Execution State를 알린 뒤, 알리지 않는 프로세스는 Starting에서 곧바로 암묵적으로
- **Terminating**: Execution Management가 프로세스에 `SIGTERM` 시그널을 보낸 뒤
- **Terminated**: 프로세스가 끝나고 그 자원을 해제한 뒤[@autosar-ap-sws-executionmanagement-2025]

자원 할당만 보면 Terminated는 Idle과 같지만, Terminated는 프로세스가 이미 실행되고 끝나 필요하면 다시 시작할 수 있음을 Execution Management에 알린다.[@autosar-ap-sws-executionmanagement-2025]

![[diagrams/execution-management-process-states.svg]]

## Resource group

Execution Management는 응용의 프로세스를 하나 이상의 resource group에 배정하는 설정으로 [[freedom-from-interference|FFI]]를 지원한다. resource group마다 CPU 시간이나 메모리의 한도를 두어 응용이 쓸 수 있는 자원을 제한할 수 있다. 한 Machine에서 여러 Adaptive Application이 돌 수 있으므로, 잘못 동작하는 응용의 프로세스가 정해진 것보다 많은 CPU 시간을 써서 다른 응용의 동작에 영향을 주지 않게 하려는 것이다.[@autosar-ap-exp-platformdesign-2025]

Execution Management는 Machine을 올바르게 설정하는 일만 맡는다. 그에 따른 제한은 대개 운영체제가 강제하거나, [[autosar-persistency|Persistency]] 서비스 같은 다른 응용이 강제한다.[@autosar-ap-sws-executionmanagement-2025] Execution Management가 보기에는 Persistency를 비롯한 functional cluster도 모두 응용이다.[@autosar-ap-exp-platformdesign-2025]

## Trusted Platform

Execution Management는 인증된 시작을 선택적으로 지원한다. 인증된 시작에서는 Trust Anchor에서 출발해 [[secure-boot#신뢰 사슬|신뢰 사슬]]을 유지하며 Adaptive Platform을 시작하고, Execution Management가 응용의 진정성과 무결성을 검증해 위반을 찾으면 그 응용의 실행을 막을 수 있다. 이런 메커니즘으로 Trusted Platform을 세울 수 있다.[@autosar-ap-exp-platformdesign-2025]

Trusted Platform의 핵심은 Trust Anchor다. Trust Anchor는 [[secure-boot#Root of trust|root of trust]]라고도 부르며, 흔히 바꿀 수 없는 영속 메모리나 [[hardware-security-module|HSM]] 같은 안전한 환경에 저장한 공개 키로 구현한다. 시스템 설계자는 적어도 시스템이 Trust Anchor에서 시작하고 Execution Management가 실행될 때까지 신뢰가 유지되게 해야 한다. 운영체제는 Execution Management를 실행하기 전에, 이미 인증된 개체가 Execution Management의 진정성을 확인했는지 보장해야 한다. 그 뒤로는 Execution Management가 Adaptive Application을 실행하기 전에 인증하는 책임을 맡는다.[@autosar-ap-exp-platformdesign-2025]

Execution Management는 [[autosar-manifest#Processed Manifest|Processed Manifest]]에 든 Machine 정보를 쓰기 전에 그 무결성과 진정성을 확인한다. 프로세스를 시작하기 전에는 그 Executable, 관련된 공유 객체, 해당 Processed Manifest의 무결성과 진정성을 확인한다. Machine에 Trust Anchor가 없으면 이 확인은 하지 않아도 된다. 확인에 실패했을 때 시작을 어떻게 이어 갈지는 `Machine.trustedPlatformExecutableLaunchBehavior`의 값 `monitorMode`, `noTrustedPlatformSupport`, `strictMode` 가운데 하나로 정한다. `monitorMode`에서는 확인을 하되 시작 과정에 영향을 주지 않고, `strictMode`에서는 확인에 실패한 Executable을 시작하지 않는다. `noTrustedPlatformSupport`는 Machine이 Trusted Platform을 지원하지 않을 때 쓰는 값이고, 이 값에서 확인에 실패한 Executable을 시작하는지는 정해져 있지 않다.[@autosar-ap-sws-executionmanagement-2025]
