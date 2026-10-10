---
title: AUTOSAR Persistency
tags:
  - platform/autosar
verified: 2026-10-07
---

AUTOSAR R25-11 Persistency 명세는 **Persistency**를 Adaptive Application과 다른 functional cluster가 [[autosar-adaptive-platform#Machine과 프로세스|Machine]]의 비휘발성 메모리에 정보를 저장하게 하는 [[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 functional cluster로 정의한다. 저장한 데이터는 부팅과 점화 사이클이 지나도 남는다. Persistency는 대개 Adaptive Application의 프로세스 안에서 그 프로세스의 권한으로 도는 라이브러리로 구현된다.[@autosar-ap-sws-persistency-2025]

Classic Platform의 비휘발성 데이터 관리는 [[nvram-manager|NVRAM Manager]]에서 다룬다.

## 저장소

Persistency의 저장 위치는 Key-Value Storage와 File Storage 두 갈래로 나뉘고, 응용이나 functional cluster는 여러 저장소를 섞어 쓸 수 있다. Persistency API(Application Programming Interface)는 어느 저장 위치인지를 InstanceSpecifier 매개변수로 받는다.[@autosar-ap-exp-platformdesign-2025]

- **Key-Value Storage**: 저장 위치 하나에 키와 값의 짝을 여럿 저장하고 꺼낸다. 키는 Key-Value Storage마다 유일해야 하고, 설계나 배치의 설정에서 정하거나 실행 중에 `SetValue()`로 만든다. 갱신 때 값을 다른 타입으로 옮길 수 있도록, 지금 쓰는 데이터 타입을 같은 키가 이전 버전에서 쓰던 타입들에 대응시키는 데이터 타입 매핑을 둔다.
- **File Storage**: 저장 위치 하나에 고유한 이름의 파일을 하나 이상 만든다. 키와 값의 짝으로 다루기 알맞지 않은 데이터를 위한 것으로, 하위 디렉터리 없이 파일만 만들 수 있는 파일 시스템 디렉터리에 견줄 수 있다.[@autosar-ap-exp-platformdesign-2025]

Key-Value Storage의 모든 작업은 저장소를 열 때 만드는 임시 저장소에서 한다. `SyncToStorage`를 불러야 그동안의 변경이 영구히 저장되고, 저장하지 않은 변경은 저장소를 닫거나 시스템을 재시작하면 버려진다. File Storage의 파일은 읽기 전용, 쓰기 전용, 읽기·쓰기 가운데 하나로 연다.[@autosar-ap-sws-persistency-2025]

![[diagrams/persistency-key-value-sync.svg]]

## 접근 범위

영속 데이터는 언제나 한 응용의 한 프로세스에만 속하고, 서로 다른 프로세스가 Persistency로 데이터를 나누는 메커니즘은 없다. [[autosar-communication-management|Communication Management]]가 주는 기능 밖에 둘째 통신 경로가 생기는 것을 막으려는 결정이다. 같은 프로세스 안의 여러 스레드는 한 Key-Value Storage나 File Storage에 함께 접근할 수 있다.[@autosar-ap-exp-platformdesign-2025]

## 무결성과 보안

Persistency는 중복 정보로 저장한 데이터의 손상을 검출해 무결성을 지킨다. 중복 정보는 [[cyclic-redundancy-check|CRC]], [[cryptographic-hash-function|해시]] 값, "M out of N" 사본이고, 함께 쓰거나 따로 쓸 수 있다. Persistency는 safe storage도 제공한다. safe storage는 기본적으로 중복으로 구현하되, 중복 데이터로 복구할 수 있었더라도 저장한 데이터에 문제가 있었는지를 응용에 알린다. 또 Persistency는 쓰는 자원의 통계를 내고, 정해진 쿼터를 넘지 않게 할 수 있다. 민감한 데이터는 물리 장치에 저장하기 전에 암호화해 기밀성을 지키고, [[message-authentication-code|MAC]]으로 진정성을 지킨다.[@autosar-ap-exp-platformdesign-2025]

응용 설계자는 중복을 요청하거나 쓸 수단을 미리 고르고, 통합자는 Target Configuration에서 실제 수단을 정한다. CRC나 해시 값을 설정하면 Persistency는 저장소나 그 요소를 저장할 때 값을 계산하고 다시 읽을 때 그 값으로 검사한다. M out of N을 설정하면 사본 N개를 저장하고, 다시 읽을 때 적어도 M개가 같은지 검사한다. 저장한 데이터가 손상되었으면 중복으로 복원을 시도하고, 복원하지 못하면 `kValidationFailed`를 알린다.[@autosar-ap-sws-persistency-2025]

암호화와 MAC 가운데 어느 보호를 어떤 알고리즘으로 할지도 Target Configuration에서 정하고, Persistency 사용자는 이를 알지 못한다. 암호화하면 저장소를 저장할 때 암호화하고 열 때 복호화하므로 영구히 저장되는 것은 암호화된 데이터뿐이다. MAC을 쓰면 저장할 때 MAC을 만들고 열 때 검증해, 허가받지 않은 변경을 검출한다. 암호 연산에는 Cryptography의 서비스를 쓴다.[@autosar-ap-sws-persistency-2025]

쿼터로는 저장소마다 하한과 상한을 설정한다. Persistency는 저장소가 실제로 차지한 공간이 상한 `MaximumAllowedSize`를 넘지 않게 하고, 하한은 그 저장소를 쓰는 Executable이 든 Software Package를 설치할 때 검사되는 것으로 본다.[@autosar-ap-sws-persistency-2025]

## 설치와 갱신

[[autosar-update-and-configuration-management|Update and Configuration Management]]가 응용을 다루는 네 쓰임새마다 영속 데이터의 처리가 정해져 있다.[@autosar-ap-exp-platformdesign-2025]

- 새 응용을 설치하거나 기존 응용을 갱신하면, Update and Configuration Management가 [[autosar-execution-management|Execution Management]]를 거쳐 응용에 설치나 갱신을 검증하게 하고, 응용은 Persistency가 [[autosar-manifest|Manifest]]의 Persistency 설정에 따라 영속 데이터를 배치하거나 갱신하게 한다.
- 응용을 재시작하지 않고 설정을 갱신하면, Persistency가 설정 갱신을 확인하고, 갱신된 저장소를 닫았다가 다시 열어 영속 데이터를 갱신하게 한다.
- 응용을 제거하면, Update and Configuration Management가 Persistency 설정의 URI(Uniform Resource Identifier)로 남은 영속 데이터를 지운다.[@autosar-ap-exp-platformdesign-2025]

Persistency는 응용 설계자가 정의한 영속 데이터, 통합자가 바꾸거나 정의한 영속 데이터를 배치할 수 있어야 한다. 새 버전의 응용을 설치하거나 설정을 갱신하면, Key-Value Storage나 File Storage마다 설정한 갱신 전략에 따라 영속 데이터를 덮어쓰거나 그대로 둔다. Persistency 설정은 응용 설계와 배치 단계에서 하고, 배치 단계 설정이 응용 설계의 설정을 덮어쓴다. 배치 단계 설정이 없으면 응용 설계의 설정으로 배치한다.[@autosar-ap-exp-platformdesign-2025]

## Remote Persistency

**Remote Persistency**는 Adaptive Application이 다른 ECU에 있을 수도 있는 비휘발성 메모리에 정보를 저장하게 하는 [[autosar-adaptive-platform#Functional cluster|Vehicle Services]]의 functional cluster다. 저장한 데이터는 부팅과 점화 사이클이 지나도 남고, 여러 Adaptive Application이 접근할 수 있다. Remote Persistency는 대개 아무 ECU에서나 도는 데몬으로 구현되어, Persistency의 서비스를 서비스 인터페이스로 내놓고 그 접근을 [[autosar-identity-and-access-management|IAM]]이 중재한다.[@autosar-ap-sws-remotepersistency-2025]

Remote Persistency는 제공하는 서비스 인터페이스마다 내부 Key-Value Storage를 하나 쓴다. 데이터 항목마다 서비스 인터페이스의 Field 하나로 나타내고, 그 데이터는 해당 Key-Value Storage의 키와 값의 짝에 저장한다. 서비스 인터페이스의 Field와 Method에 대한 접근은 IAM으로 통제한다.[@autosar-ap-sws-remotepersistency-2025]

AUTOSAR R25-11 Adaptive Platform은 Remote Persistency를 차량이나 ECU 안의 여러 응용을 위한 설정·코딩 데이터의 전역 저장소로 들였다. 중앙 인스턴스가 `ara::com` 서비스로 제공하므로, 같은 ECU나 차량의 어느 응용이든 로컬 Persistency와 비슷하게 쓸 수 있다. 이 판의 Remote Persistency는 파일 접근을 지원하지 않아, 하부 Persistency의 File Storage를 쓸 수 없다. 서비스 인터페이스는 아직 예비 상태로, 다른 functional cluster의 서비스 인터페이스처럼 blueprint로 나와 있지 않다.[@autosar-ap-tr-releaseoverview-2025]

AUTOSAR Remote Persistency 명세는 R25-11에서 처음 나왔다.[@autosar-ap-sws-remotepersistency-2025] Adaptive Platform의 개정 이력은 [[autosar-adaptive-platform#개정 이력|AUTOSAR Adaptive Platform]]에서 다룬다.
