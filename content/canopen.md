---
title: CANopen
tags:
  - network/can
verified: 2026-10-06
---

**CANopen**은 [[can|CAN]] 기반 통신 시스템으로, [[can-higher-layer-protocol|상위 계층 프로토콜]]과 프로파일 규격으로 이뤄진다. CAN CC(classic)를 바탕으로 한 CANopen CC와, 그 뒤에 [[can-fd|CAN FD]]를 바탕으로 만든 CANopen FD가 있다.[@cia-canopen-2026] CANopen CC는 CiA 301이, CANopen FD는 CiA 1301이 정한다. CiA에 따르면 CANopen CC는 EN 50325-4로 국제 표준이 되었다.[@cia-standardized-hlp-2026]

CiA에 따르면 CANopen CC는 처음에 핸들링 시스템 같은 동작 중심의 기계 제어용으로 설계되었고, 지금은 의료 장비, 비도로 차량, 선박 전자 장비, 철도, 빌딩 자동화 등에 쓰인다.[@cia-canopen-2026]

## 하위 계층

CiA 301 version 4.2.0은 CANopen CC가 [[iso-11898-1|ISO 11898-1]]에 따른 데이터 링크 계층을 쓰고, [[iso-11898-2|ISO 11898-2]]에 따른 물리 계층을 전제하되 다른 물리 계층도 배제하지 않게 정한다. [[can-bit-timing|비트 타이밍]]도 이 규격이 정하며, 비트율 $R_\mathrm{b}$는 $10\,\mathrm{kbit/s} \le R_\mathrm{b} \le 1000\,\mathrm{kbit/s}$에서 고를 수 있다. 정해진 CAN 식별자(CAN-ID) 배정은 모두 11비트 [[can-identifier|식별자]]를 바탕으로 하지만, 29비트 식별자도 지원한다.[@cia-canopen-2026]

## 장치 구조

CANopen은 장치의 내부 구조를 정한다.[@cia-canopen-2026] CANopen 장치는 세 논리 부분으로 이뤄진다. 프로토콜 스택은 CAN 네트워크로 통신을 맡고, 응용 소프트웨어는 내부 제어 기능과 프로세스 하드웨어 인터페이스를 맡는다. **object dictionary**는 둘을 잇는 부분이다.[@cia-canopen-device-architecture-2026]

object dictionary는 장치의 동작을 정하는 모든 통신 파라미터와 응용 파라미터를 표준화된 목록으로 관리한다. 항목마다 16비트 인덱스와 8비트 서브 인덱스로 된 24비트 주소가 있고, 모든 항목은 CANopen 통신 서비스로 읽을 수 있다.[@cia-canopen-device-architecture-2026] 인덱스 `1000h`\~`1FFFh`는 통신 동작을 정하는 파라미터, `2000h`\~`9FFFh`는 응용 파라미터를 가리키고, 응용 파라미터 가운데 `2000h`\~`5FFFh`는 제조사 고유, `6000h`\~`9FFFh`는 표준화된 파라미터다.[@cia-canopen-2026]

![[diagrams/canopen-device-object-dictionary.svg]]

## 통신 객체

CiA 301 version 4.2.0은 CANopen CC의 프로토콜로 SDO(Service Data Object), PDO(Process Data Object), NMT(Network Management), 특수 기능 프로토콜, 오류 제어 프로토콜을 정한다.[@cia-canopen-2026]

**SDO**는 장치의 object dictionary의 모든 항목에 접근하게 하는 확인형 서비스로, CAN 식별자가 다른 [[can-frame|데이터 프레임]] 두 개로 이뤄진다. object dictionary를 가진 장치가 SDO 서버, 그 사전에 접근하는 장치가 SDO 클라이언트가 된다. SDO 전송에는 4바이트 이하의 데이터를 시작 단계에서 바로 보내는 expedited 전송, 세그먼트마다 응용 데이터를 7바이트까지 실어 양에 제한 없이 보내는 normal(segmented) 전송, 세그먼트를 127개까지 묶은 블록 단위로만 확인받는 block 전송이 있다. 첫 SDO 서버 채널은 규격이 미리 정해 두고, 모든 CANopen CC 장치가 지원해야 한다.[@cia-sdo-protocol-2026]

**PDO**는 우선순위가 높은 제어·상태 정보를 브로드캐스트하는 데 쓴다. CANopen CC의 PDO는 CAN 프레임 하나로 응용 데이터만 8바이트까지 나른다. PDO는 장치 내부 이벤트나 타이머, 리모트 요청, SYNC(Synchronization) 메시지 수신에 맞춘 주기·비주기 동기 송신으로 보낸다. PDO에 어떤 응용 객체를 어떤 순서와 길이로 싣는지는 PDO 매핑이 정하고, 매핑은 정적, 가변(NMT pre-operational 상태에서 바꿈), 동적(operational 상태에서도 바꿈) 세 가지다.[@cia-pdo-protocol-2026]

NMT 상태 기계는 모든 CANopen CC 장치가 지원해야 하고, 초기화, pre-operational, operational, stopped 상태로 이뤄진다. 장치는 초기화를 마치면 boot-up 메시지를 보내고 pre-operational 상태로 넘어간다. pre-operational 상태에서는 SDO로 통신할 수 있지만 PDO는 operational 상태에서만 쓸 수 있고, stopped 상태의 장치는 NMT 명령에만 반응한다. NMT 프로토콜은 활성 NMT manager가 보내고, 데이터 2바이트짜리 프레임 하나에 명령 지정자와 대상 장치의 node-ID를 싣는다. NMT 프로토콜을 받은 장치는 명령받은 NMT 상태로 넘어가고, node-ID가 0이면 모든 노드가 명령을 따른다.[@cia-network-management-2026]

![[diagrams/canopen-nmt-state-machine.svg]]

특수 기능 프로토콜은 셋이다. SYNC 프로토콜은 동기 동작을 위해 SYNC producer가 주기적으로 보내고, 기본으로는 데이터가 없다. EMCY(Emergency) 프로토콜은 장치 내부 오류를 알리며, 오류 사건마다 한 번 보낸다. TIME(Time Stamp) 프로토콜은 네트워크 시각을 맞추며, 자정 뒤의 밀리초와 1984년 1월 1일 뒤의 날수를 6바이트에 싣는다.[@cia-special-function-protocols-2026]

오류 제어 프로토콜에는 heartbeat, node/life guarding, boot-up 프로토콜이 있다. heartbeat 프로토콜은 producer가 주기적으로 보내 자기가 살아 있음과 NMT 상태를 알린다. node/life guarding은 [[remote-frame|리모트 프레임]]으로 장치를 하나씩 불러 상태를 묻는 방식이다. CiA에 따르면 이는 옛 방식이라 새 설계에서는 heartbeat를 쓴다.[@cia-error-control-protocols-2026]

통신 객체가 쓰는 CAN-ID는 아래와 같다.

| 통신 객체                                         | CAN-ID                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| NMT                                               | `0`[@cia-network-management-2026]                                   |
| SYNC                                              | 기본값 `80h`[@cia-special-function-protocols-2026]                  |
| EMCY                                              | 기본값 `80h` + node-ID[@cia-special-function-protocols-2026]        |
| TIME                                              | 기본값 `100h`[@cia-special-function-protocols-2026]                 |
| 오류 제어(heartbeat, node/life guarding, boot-up) | 감시받는 장치의 `700h` + node-ID[@cia-error-control-protocols-2026] |

CiA는 리모트 프레임을 아예 쓰지 않기를 권한다.[@cia-canopen-history-2026]

## 프로파일

CANopen 프로파일은 PDO에 매핑할 프로세스 데이터, SDO로 접근하는 설정 파라미터, EMCY나 SDO로 얻는 진단 정보를 정하고, 장치가 구현한 프로파일은 인덱스 `1000h`의 장치 종류 파라미터가 알려 준다.[@cia-canopen-profiles-2026]

- **장치 프로파일**: 논리 장치의 인터페이스로 object dictionary `6000h`\~`9FFFh` 항목을 정한다. CiA에 따르면 가장 많이 쓰는 것은 범용 I/O 모듈의 CiA 401과 모션 컨트롤러·드라이브의 CiA 402다.
- **인터페이스 프로파일**: 응용 기능이 없는 장치를 위해, 응용과 무관한 다른 네트워크 기술의 기능을 정한다. 예: AS-interface(Actuator Sensor Interface)에 접근하는 CiA 446
- **응용 프로파일**: 네트워크에서 쓰는 모든 기능 인터페이스를 가상 장치의 집합으로 정한다. 예: CiA 417(CANopen Lift), CiA 422(CleANopen), 택시·구급차·경찰차 같은 특수 목적 차량의 CiA 447[@cia-canopen-profiles-2026]

## 역사

CiA는 1994년 11월에 첫 CANopen 규격인 CiA 301을 펴냈다. CiA에 따르면 이 규격은 유럽 공동체의 연구 프로그램 Esprit의 ASPIC(Automation and Control Systems for Production Units using an Installation Bus Concept) 프로젝트에서 Bosch가 이끈 기업과 연구 기관들이 CiA의 CAL(CAN Application Layer)을 바탕으로 만들었고, 첫판부터 PDO, SDO, PDO의 동기 송신, NMT, emergency 메시지를 정했다. 제품에 쓰인 첫 판은 1996년부터 1999년까지 유효했던 version 3.0이다.[@cia-canopen-history-2026]

CiA는 CANopen에서 master/slave라는 말 대신 NMT manager와 NMT server라는 말을 쓴다.[@cia-can-knowledge-2026]

## CANopen FD와의 차이

CiA에 따르면 CANopen FD는 CAN FD의 높은 처리량을 쓰면서 CANopen CC의 주요 특성을 지키려고 만들어졌다.[@cia-canopen-fd-2026]

CiA 1301 version 1.1.0은 CANopen FD의 응용 계층과 통신 프로파일을 정한다.[@cia-technical-documents-2026] 이 규격은 CANopen FD가 모든 통신 프로토콜에 [[can-fd-frame|CAN FD 프레임]] 포맷을 쓰고, 비트율 전환 여부를 가리지 않으며, CANopen CC와 달리 리모트 프레임을 지원하지 않게 정한다. 비트 타이밍도 이 규격이 정하며, 데이터 구간 비트율을 10 Mbit/s까지 지원한다. 장치 내부 구조는 CANopen CC와 같고, 통신 객체로 SDO가 아니라 USDO(Universal Service Data Object)를 둔다.[@cia-canopen-fd-2026] USDO로는 어떤 CANopen FD 장치든 읽고 쓸 수 있고, 유니캐스트나 브로드캐스트로 어떤 크기의 데이터든 보낼 수 있다.[@cia-standardized-hlp-2026]
