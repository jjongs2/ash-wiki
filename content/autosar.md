---
title: AUTOSAR
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR**는 자동차 제조사, Tier 1 부품 공급사, 반도체 회사, 소프트웨어 공급사, 도구 공급사 등이 함께 만든 연합으로, 자동차 소프트웨어 아키텍처의 개방형 산업 표준을 세웠다.[@autosar-history-2026] 이름은 AUTomotive Open System ARchitecture의 머리글자다.[@autosar-faq-2026]

AUTOSAR는 2003년 7월에 BMW, Bosch, Continental(지금의 AUMOVIO), DaimlerChrysler(지금의 Mercedes-Benz), Siemens VDO, Volkswagen이 결성했다.[@autosar-core-partner-2026] 2016년 무렵 AUTOSAR 누리집은 "Cooperate on standards, compete on implementation"을 내걸고, AUTOSAR를 하나의 공통 표준을 만드는 파트너십으로 소개했다.[@autosar-home-2016]

AUTOSAR는 소프트웨어 재사용을 목표로 든다. 계층화한 기본 소프트웨어 아키텍처로 ECU의 하드웨어 독립을 이루고, [[ee-architecture|E/E]] 시스템 안에서 기능 소프트웨어 컴포넌트를 옮길 수 있게 하고, 차량 제품군 전체에 걸쳐 확장할 수 있게 하는 것을 내세운다.[@autosar-about-2026]

## 파트너

AUTOSAR는 파트너십 유형마다 다른 권리와 의무를 둔다. 파트너십 유형은 Premium Partner Plus, Premium Partner, Development Partner, Associate Partner, Associate Partner [Light], Attendee, Subscriber이고, 이와 따로 Core Partner가 있다.[@autosar-partners-2026] 그 가운데 다섯의 역할은 아래와 같다.

| 유형                | 역할                                                                                                                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core Partner        | AUTOSAR 개발 파트너십을 조직하고 관리하고 통제한다.[@autosar-core-partner-2026]                                                                                                                                             |
| Premium Partner     | AUTOSAR 표준을 설계하고 쓰며, 작업 그룹을 이끌거나 작업 그룹에 참여한다.[@autosar-home-2026]                                                                                                                                |
| Development Partner | 작은 회사와 스타트업을 위한 유형으로, AUTOSAR 표준을 설계하고 쓰며 작업 그룹에 참여한다.[@autosar-home-2026] AUTOSAR의 자주 묻는 질문 페이지에 따르면 규격의 기술 개발에 특정 기여를 하기에 특히 알맞다.[@autosar-faq-2026] |
| Associate Partner   | AUTOSAR 표준을 쓴다.[@autosar-home-2026]                                                                                                                                                                                    |
| Attendee            | 대학과 비영리 단체를 위한 무료 유형으로, AUTOSAR 표준을 정의하는 일에 협력한다.[@autosar-home-2026]                                                                                                                         |

## 표준

AUTOSAR 표준에는 Classic Platform, Adaptive Platform, Foundation이 있다.[@autosar-standards-2026] AUTOSAR 용어집은 [[autosar-classic-platform|Classic Platform]]을 깊이 임베디드된 시스템과, 예측 가능성·안전·응답성 요구가 높은 응용 소프트웨어를 위해 AUTOSAR가 정의한 소프트웨어 플랫폼으로 정의한다.[@autosar-fo-tr-glossary-2025] Adaptive Platform은 자율 주행 같은 쓰임새에서 fail-operational 시스템을 만드는 고성능 연산 ECU를 위한 AUTOSAR의 해법이다.[@autosar-standards-2026] Adaptive Platform은 주로 고성능 연산과 통신 메커니즘을 제공하고, 무선 소프트웨어 업데이트처럼 유연한 소프트웨어 구성을 지원하며, 서비스 지향 아키텍처를 따른다.[@autosar-ap-exp-platformdesign-2025]

Foundation은 Classic Platform과 Adaptive Platform의 공통 부분을 따로 펴내는 표준으로, 버스 프로토콜과 [[autosar-methodology|방법론]]의 공통 측면이 그 예다.[@autosar-standards-2026] [[some-ip|SOME/IP]] 프로토콜 명세와 AUTOSAR 용어집은 Foundation에 속한다.[@autosar-fo-tr-glossary-2025][@autosar-fo-prs-someipprotocol-2025]

두 플랫폼의 차이는 [[autosar-classic-platform#Adaptive Platform과의 차이|AUTOSAR Classic Platform]]에서 다룬다.

## 규격 문서

AUTOSAR 문서는 PDF(Portable Document Format)로 펴내고, 문서마다 문서 종류 약어와 표준 약어를 메타데이터로 둔다. 발행 PDF 파일 이름에는 표준 약어, 문서 종류 약어, 문서 이름이 들어간다.[@autosar-fo-tps-standardizationtemplate-2025] 예를 들어 `AUTOSAR_CP_SWS_PortDriver`는 Classic Platform의 Port Driver 소프트웨어 명세(Specification of Port Driver)이고, 기능 명세, API(Application Programming Interface) 명세, 설정 명세를 담는다.[@autosar-cp-sws-portdriver-2025]

![[diagrams/autosar-document-file-name.svg]]

Standardization Template은 문서 종류를 열 가지로 정한다. 그 가운데 여섯은 아래와 같다.[@autosar-fo-tps-standardizationtemplate-2025]

| 약어 | 이름                      | 내용                                                                            |
| ---- | ------------------------- | ------------------------------------------------------------------------------- |
| SWS  | Software Specification    | AUTOSAR 소프트웨어를 명세한다.                                                  |
| EXP  | Explanation               | 다른 문서에 이미 나온 내용을 설명한다.                                          |
| TPS  | Template Specification    | 메타모델 정보와 제약 등을 담아 AUTOSAR 템플릿을 명세한다.                       |
| PRS  | Protocol Specification    | AUTOSAR가 표준화한 프로토콜을 명세한다. Foundation에서 펴낸다.                  |
| RS   | Requirement Specification | 소프트웨어 명세와 따로 요구사항을 적는다. PRS와 SWS는 RS의 요구사항을 구현한다. |
| TR   | Technical Report          | AUTOSAR에 관한 임의의 주제를 다루는 일반 기술 보고서                            |

예를 들어 Layered Software Architecture 설명서는 요구사항을 담지 않은 정보 제공용 문서다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

SRS(Software Requirements Specification)는 이 문서 종류에 없다.[@autosar-fo-tps-standardizationtemplate-2025] Port Driver SWS는 입력 요구사항 문서를 SRS 문서라 부르지만, 그 문서의 파일 이름은 `AUTOSAR_CP_RS_PortDriver`처럼 RS이고, 요구사항 ID에는 SRS_BSW_00358처럼 SRS 접두어가 붙는다.[@autosar-cp-sws-portdriver-2025]

## 규격 항목 ID와 API 명세

AUTOSAR 규격 항목(specification item)의 ID는 표준 약어(생략 가능), 문서 종류 약어, 문서 이름 약어, 특수화(생략 가능), 번호를 밑줄로 이은 꼴이고, 번호는 00000부터 99999까지의 고유 번호다. ID는 [SWS_Port_00140]처럼 대괄호 안에 쓴다.[@autosar-fo-tps-standardizationtemplate-2025] BSW(Basic Software) 모듈의 규격 항목은 BSW 요구사항으로 추적되고, BSW 모듈 구현은 해당 규격 항목까지의 추적성을 보장해야 한다.[@autosar-cp-sws-bswgeneral-2025]

![[diagrams/autosar-specification-item-id.svg]]

Classic Platform의 BSW 모듈 SWS는 API 함수마다 표를 둔다. 표에는 Service name, Syntax, Service ID [hex], Sync/Async, Reentrancy, 매개변수(in, inout, out), Return value, Description, Available via(원형을 선언한 헤더)가 들어간다. **Service ID**는 BSW 모듈마다 `0x00`부터 매기는 서비스 번호이고, Default Error Tracer의 오류 보고 API에 매개변수로 넘긴다. Sync/Async 칸의 값은 Synchronous, Asynchronous, Depends on configuration 가운데 하나다.[@autosar-cp-sws-bswgeneral-2025]

**동기 함수**는 돌아올 때 기능이 끝났음이 보장되고, **비동기 함수**는 그런 보장이 없다. **재진입 가능한 함수**(reentrant function)는 실행 도중에 끼어들림을 당한 뒤, 앞선 호출이 끝나기 전에 다시 안전하게 호출될 수 있다.[@autosar-fo-tr-glossary-2025] 예를 들어 Port Driver SWS는 `Port_Init`의 Service ID를 `0x00`으로 두고, 동기이며 재진입할 수 없다고 정하며, `Port.h`로 제공한다.[@autosar-cp-sws-portdriver-2025]
