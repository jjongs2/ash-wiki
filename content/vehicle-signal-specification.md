---
title: Vehicle Signal Specification
aliases:
  - VSS
tags:
  - hardware/ee-architecture
verified: 2026-11-07
publisher: COVESA
edition: 2026
status: 유효
---

**VSS**(Vehicle Signal Specification)는 COVESA(커넥티드 차량을 위한 공통 접근법과 기술을 개발하는 비영리 단체)가 펴내는 명세로, 차량 신호를 구조적으로 정의하는 문법과 차량 신호의 카탈로그를 정한다.[@covesa-about-2026] VSS는 공통 이름 공간으로 차량 데이터를 주고받게 해, 차량마다 다른 구현 세부를 가린다. 표준 카탈로그의 신호는 `Vehicle`을 뿌리로 한 트리 하나에 두고 뿌리부터 점으로 이은 경로로 부르며, 리프 노드인 신호는 sensor, actuator, attribute로 나뉜다.[@covesa-vss-6-1-2026]

COVESA는 GENIVI Alliance(GENIVI: 차량 내 시스템용 개방형 표준과 소프트웨어를 개발하던 단체)가 2021년 10월 이름을 바꾼 조직이다.[@covesa-genivi-rebrand-2021]

## 범위

VSS 6.1은 VSS를 이루는 세 요소로, 데이터 정의를 문법적으로 적는 규칙 집합(rule set), 도메인을 단순한 그래프로 기술한 데이터 정의, 데이터 정의에서 직렬화 형식을 만드는 도구를 둔다. 구체적인 인터페이스 정의는 VSS의 범위 밖이다.[@covesa-vss-6-1-2026]

### 명세 파일

명세는 VSS 규칙 집합을 따르는 YAML 파일인 vspec 파일로 적고, vspec 파일은 `include` 지시자로 다른 vspec 파일을 끌어온다. 뿌리 파일은 `VehicleSignalSpecification.vspec`이다. 원본 vspec 파일은 도구로 다른 형식으로 바꿀 수 있고, 바꾼 형식은 VSS 릴리스마다 릴리스 산출물로 함께 나온다.[@covesa-vss-6-1-2026]

### 트리와 노드 이름

VSS는 트리 하나만 두므로 모든 신호가 같은 뿌리에 속하고, 표준 카탈로그의 뿌리 branch는 `Vehicle`이다. 노드는 뿌리에서 그 노드까지의 이름을 점(.)으로 이어 부른다. 예를 들어 실내 룸미러의 dimming 상태는 `Vehicle.Cabin.RearviewMirror.Dimmed`다. 새 리프 노드를 정의하면 그 이름에 든 부모 branch도 모두 정의해야 한다.[@covesa-vss-6-1-2026]

![[diagrams/vss-tree-node-name.svg]]

표준 카탈로그의 노드 이름은 대문자로 시작하는 camel case로 쓰고 A-Z, a-z, 0-9만 쓴다. Boolean 신호의 이름은 `Is`로 시작해야 한다. 노드 이름은 비교할 때 대소문자를 가리지 않으므로, 전체 경로가 그 기준으로 겹치면 안 된다. 예를 들어 `Vehicle.Abc`와 `Vehicle.ABC`는 함께 둘 수 없다.[@covesa-vss-6-1-2026]

문짝이나 축처럼 되풀이되는 branch와 데이터 항목은 정의를 되풀이해 적지 않고, 노드에 그 노드가 몇 번 나오는지를 적는 instance 개념으로 적는다.[@covesa-vss-6-1-2026]

### 노드 종류

**branch**는 다른 branch와 신호를 담는 트리의 가지다. 리프 노드인 데이터 항목은 셋으로 나뉜다.[@covesa-vss-6-1-2026]

- **sensor**: VSS 쪽에서 보면 읽기만 하는 속성이다. 값은 대개 시간에 따라, 점화 사이클(주행) 안에서도 바뀐다.
- **actuator**: VSS 쪽에서 보면 읽고 쓸 수 있는 속성이다. 쓴 값(원하는 목표)과 실제 값이 다를 수 있다. 예: 좌석 위치처럼 기계 동작이 느린 속성
- **attribute**: 값이 점화 사이클 안에서 바뀌지 않는, 흔히 고정된 특성이다. 예: 차의 색과 모델[@covesa-vss-6-1-2026]

데이터 항목마다 `type`, `datatype`, `description`을 반드시 적는다.[@covesa-vss-6-1-2026]

### 규범과 하위 호환

VSS 저장소에서 규범인 것은 VSS 문서의 규칙과 지금 정의된 신호로, VSS를 "지원"한다는 구현은 그 규칙대로 정의한 신호와 지금 VSS에 정의된 신호를 지원해야 한다. overlay와 profile은 비규범이다. **overlay**는 표준 카탈로그에 노드를 더하거나 지우고 기존 메타데이터의 값을 바꾸는 층으로, 카탈로그를 차량이나 배치에 맞추는 데 쓴다.[@covesa-vss-6-1-2026]

VSS 프로젝트는 하위 호환을 될 수 있는 대로 지키며, 하위 호환을 깨는 변경(신호의 삭제·이름 변경, datatype이나 단위의 변경 등)은 대개 major 릴리스에서만 넣는다. 신호를 옮기거나 이름을 바꿀 때 옛 신호를 deprecated로 남기면 minor 릴리스에 넣을 수 있다. 옮기거나 없앨 노드는 `deprecation` 키워드로 표시한다.[@covesa-vss-6-1-2026]

## 개정 이력

COVESA는 VSS의 판을 버전 번호로 매기고, 현행판은 2026년 9월에 나온 VSS 6.1이다.[@covesa-vss-releases-2026]

- VSS 4.0(2023년 5월)은 VSS 3.1에서 실험적이던 struct 문법을 정식으로 지원했다.
- VSS 5.0(2024년 10월)은 `Vehicle.OBD` branch를 deprecated로 했다.
- VSS 6.0(2026년 1월)은 `Vehicle.OBD` branch를 빼고, 문자열 값을 정규식으로 제한하는 `pattern` 키워드를 더했다.
- VSS 6.1(2026년 9월)은 허용값(`allowed`)의 대안으로 정수 바탕의 `enum`을 더하고, 대부분의 단위가 QUDT(Quantities, Units, Dimensions, and Data Types) 단위를 참조하게 했다.[@covesa-vss-6-1-2026][@covesa-vss-releases-2026][@covesa-vss-changelog-6-1-2026]

## 쓰는 곳

COVESA에 따르면 VSS는 차량 안과 클라우드에서 차량 데이터를 기술하는 공통 언어 구실을 하고, 프로토콜과 기술에 매이지 않는 것을 설계 원칙의 하나로 둔다. VSS 파일(`.vspec`)은 사람과 기계가 함께 읽을 수 있다.[@covesa-vss-2026]

VSS는 차량 응용에서 의미가 잘 정해진 차량 정보를 주고받는 표준으로 쓸 수 있다. [[vehicle-bus|차량 버스]]로 오가는 원시 데이터인 속성, 센서, 액추에이터와 인포테인먼트 쪽 데이터를 함께 다룬다. 표준 카탈로그의 데이터는 벤더에 매이지 않는 것을 목표로 하고, VSS 문법을 따르는 벤더 고유의 확장과 조정은 따로 정의할 수 있다. VSS 데이터에 접근하는 프로토콜로는 COVESA의 VISS(Vehicle Information Service Specification)가 있다. VISS는 판에 따라 WebSocket, HTTP, [[mqtt|MQTT]], gRPC 같은 전송 프로토콜 위에서 JSON 메시지로 VSS 데이터에 접근하는 프로토콜을 정한다.[@covesa-vss-6-1-2026]

AUTOSAR R25-11의 [[autosar-adaptive-platform|Adaptive Platform]]은 [[autosar-adaptive-platform#그 밖의 functional cluster|Automotive API Gateway]]가 외부 인터페이스(VISS/VSS)의 차량 데이터를 차량 안 `ara::com` 서비스 인터페이스의 데이터에 대응시키도록 정한다.[@autosar-ap-exp-platformdesign-2025]

Eclipse Kuksa Databroker는 차량 안의 마이크로프로세서 기반 플랫폼에서 돌도록 만든, 자원을 적게 쓰는 VSS 신호 트리 구현이다. 차량의 응용은 Databroker의 gRPC API로 신호를 조회하고, 센서와 액추에이터의 값을 갱신하고, 관심 있는 신호의 변경을 통지받는다. Kuksa provider는 [[electronic-control-unit|ECU]]와 대개 [[can|CAN]] 버스나 [[some-ip|SOME/IP]] 같은 [[ethernet|이더넷]] 기반 프로토콜로 데이터를 주고받으며, 이 프로토콜의 저수준 메시지와 Databroker의 gRPC API 호출 사이를 변환해 Databroker와 ECU를 잇는다.[@eclipse-kuksa-databroker-2026]

![[diagrams/kuksa-databroker-connections.svg]]
