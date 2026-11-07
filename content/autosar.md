---
title: AUTOSAR
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR**는 자동차 제조사, Tier 1 부품 공급사, 반도체 회사, 소프트웨어 공급사, 도구 공급사 등이 함께 만든 연합으로, 자동차 소프트웨어 아키텍처의 개방형 산업 표준을 세웠다.[@autosar-history-2026] 이름은 AUTomotive Open System ARchitecture의 머리글자다.[@autosar-faq-2026]

AUTOSAR의 시작은 2002년 8월 BMW, Bosch, Continental, DaimlerChrysler, Volkswagen이 공통 과제와 목표를 처음 논의한 것이고, 곧 Siemens VDO(VDO: Siemens의 자동차 전자 부품 회사)가 이들 회사에 합류했다.[@autosar-history-2026][@siemens-vdo-sale-2007] AUTOSAR는 2003년 7월에 BMW, Bosch, Continental(지금의 AUMOVIO, 자동차 기술·전자 기업), DaimlerChrysler(지금의 Mercedes-Benz), Siemens VDO, Volkswagen이 결성했다.[@autosar-core-partner-2026][@aumovio-listing-2025] 같은 달 Core Partner들이 첫 AUTOSAR Development Agreement에 서명했고, 2003년 9월 Baden-Baden의 VDI(독일의 엔지니어 단체) 학회에서 AUTOSAR를 처음 공식 발표하며 그 목표를 소개했다.[@autosar-history-2026][@vdi-ueber-uns-2026] 2016년 무렵 AUTOSAR 누리집은 "Cooperate on standards, compete on implementation"을 내걸고, AUTOSAR를 하나의 공통 표준을 만드는 파트너십으로 소개했다.[@autosar-home-2016]

AUTOSAR는 소프트웨어 재사용을 목표로 든다. 계층화한 기본 소프트웨어 아키텍처로 ECU의 하드웨어 독립을 이루고, [[ee-architecture|E/E]] 시스템 안에서 기능 [[autosar-software-component|소프트웨어 컴포넌트]]를 옮길 수 있게 하고, 차량 제품군 전체에 걸쳐 확장할 수 있게 하는 것을 내세운다.[@autosar-about-2026]

## 파트너

AUTOSAR는 파트너십 유형마다 다른 권리와 의무를 둔다. 파트너십 유형은 Premium Partner Plus, Premium Partner, Development Partner, Associate Partner, Associate Partner [Light], Attendee, Subscriber이고, 이와 따로 Core Partner가 있다.[@autosar-partners-2026] 그 가운데 일곱의 역할은 아래와 같다.

| 유형                      | 역할                                                                                                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core Partner              | AUTOSAR 개발 파트너십을 조직하고 관리하고 통제한다.[@autosar-core-partner-2026]                                                                                                                                         |
| Premium Partner Plus      | 시장을 이끄는 회사를 위한 유형으로, AUTOSAR의 기술 표준화를 이끈다.[@autosar-partners-2026] 상근 인력 한 명을 Project Leader Team 위원으로 두어, 기술 표준화를 넘어 표준 개발을 이끄는 데 참여한다.[@autosar-home-2026] |
| Premium Partner           | AUTOSAR 표준을 설계하고 쓰며, 작업 그룹을 이끌거나 작업 그룹에 참여한다.[@autosar-home-2026]                                                                                                                            |
| Development Partner       | 작은 회사와 스타트업을 위한 유형으로, AUTOSAR 표준을 설계하고 쓰며 작업 그룹에 참여한다.[@autosar-home-2026] 규격의 기술 개발에 특정 기여를 하기에 특히 알맞다.[@autosar-faq-2026]                                      |
| Associate Partner         | AUTOSAR 표준을 쓴다.[@autosar-home-2026]                                                                                                                                                                                |
| Associate Partner [Light] | 무료 유형으로, AUTOSAR Work 가운데 정해진 일부만 써서 버스 시스템과 호환되고 상호운용되는 제품을 내려는 회사를 위한 것이다.[@autosar-partners-2026]                                                                     |
| Attendee                  | 대학과 비영리 단체를 위한 무료 유형으로, AUTOSAR 표준을 정의하는 일에 협력한다.[@autosar-home-2026]                                                                                                                     |

Core Partner로는 2003년 11월 Ford, 2003년 12월 Peugeot Citroën Automobiles와 Toyota, 2004년 11월 General Motors가 합류했다. 2008년 2월 Siemens VDO가 Continental에 합쳐지면서, Siemens VDO는 따로 된 Core Partner가 아니게 되었다.[@autosar-history-2026] 2026년 1월에는 DENSO, Huawei, Vector Informatik이 Core Partner로 합류했다. 2026년 9월 기준 AUTOSAR 누리집의 Core Partner 명단에는 AUMOVIO, BMW, DENSO, General Motors, Huawei, Mercedes-Benz, Bosch, Toyota, Vector Informatik, Volkswagen의 10곳이 있고, Ford와 Peugeot Citroën Automobiles는 없다.[@autosar-core-partner-2026]

AUTOSAR 소개 자료에 따르면 2025년 말 AUTOSAR 파트너는 339곳이었다. 유형별로는 Core Partner 9곳, Premium Partner Plus 3곳, Premium Partner 64곳, Development Partner 61곳, Associate Partner 154곳, Attendee 48곳이다.[@autosar-exp-introduction-part1-2026]

AUTOSAR는 2016년부터 Openness for non-Automotive Applications로 자동차 밖의 응용에도 AUTOSAR를 열어 두었다. 대상은 자동차 응용에서 파생된 응용과, 초위험 범주에 들지 않는 그 밖의 응용이다. AUTOSAR는 파트너가 사례마다 판단할 바탕으로 모빌리티 인프라, 농기계, 해운, 철도, 도시 모빌리티, 산업 자동화, 빌딩 자동화, 가전, 의료 기술 같은 예시 분야를 들고, 법적 구속력이 있는 내용은 AUTOSAR Development Agreement에 둔다.[@autosar-openness-2026]

AUTOSAR는 AUTOSAR Work를 활용하려는 회사에 AUTOSAR 파트너가 되기를 요구한다. 예를 들어 부품을 통합하거나 더 가공하는 데 AUTOSAR Work가 필요한데 그 부품에 AUTOSAR Work가 완결되게 구현되어 있지 않으면 파트너십이 있어야 한다. AUTOSAR는 AUTOSAR 자료를 바탕으로 만든 파생 자료의 출판을 승인하거나 거절하지 않고, 그 저자가 저작권과 지식재산 규정을 지켜야 한다.[@autosar-faq-2026]

## 조직

AUTOSAR 소개 자료는 AUTOSAR의 공식 역할을 거버넌스(Executive Board), 전략 관리(Steering Committee, Legal Team, Communication Team), 기술 조정(Project Leader Team 등), 표준화(작업 그룹 등)의 층으로 나눈다. 작업 그룹은 표준 사이에 걸친 작업 그룹, [[autosar-classic-platform|Classic Platform]] 작업 그룹, [[autosar-adaptive-platform|Adaptive Platform]] 작업 그룹으로 나뉜다. 작업 그룹에는 Core Partner, Premium Partner Plus, Premium Partner, Development Partner가 참여한다.[@autosar-exp-introduction-part1-2026]

![[diagrams/autosar-organization-layers.svg]]

AUTOSAR의 기구마다 맡는 일과 위원, 모임 주기는 아래와 같다.[@autosar-organization-2026]

| 기구                | 맡는 일                                                                                                                                    | 위원                                                          | 모임               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------ |
| Executive Board     | 파트너십 전체의 전략과 로드맵을 정하고, 의장(Chairperson), 부의장(Deputy Chairperson), Project Leader Team 대변인을 임명하거나 해임한다    | Core Partner의 경영진 대표                                    | 보통 한 해에 한 번 |
| Steering Committee  | AUTOSAR의 전략을 관리하고, 개발 협약과 파트너 연간 분담금의 변경을 권고하며, 파트너 가입과 홍보, 대외 공개 정보를 맡는다                   | Core Partner의 기술 관리 수준 대표                            | 보통 6주마다       |
| Project Leader Team | AUTOSAR 표준 개발 전반에 책임을 지고, 예산 안에서 프로젝트 계획과 재무 계획을 세우며, 작업 그룹을 두고 AUTOSAR 개발의 기술 문제를 결정한다 | Core Partner와 Premium Partner Plus의 프로젝트 관리 수준 대표 | 보통 6주마다       |
| Legal Team          | 개발 협약 같은 파트너십의 법적 문제를 다룬다                                                                                               | Core Partner의 대표                                           | 필요할 때          |
| Communication Team  | 대내외 소통과 보도 자료, 누리집, AUTOSAR 학회를 맡는다                                                                                     | —                                                             | —                  |

작업 그룹은 [[autosar-rte|RTE]]와 그 인터페이스, 기본 소프트웨어 모듈과 운영체제, 방법론과 데이터 교환 형식, 차량 도메인 사이의 [[autosar-application-interfaces|표준 인터페이스]], 인수 시험을 정하고, Adaptive Platform의 예시 구현을 통합한다. 작업 그룹 위원은 Core, Premium, Development Partner와 Attendee다. AUTOSAR User Group은 이미 펴낸 AUTOSAR 문서를 바탕으로 AUTOSAR 커뮤니티 전반에 관련된 주제를 다루고, Core, Premium, Development, Associate Partner와 Attendee가 참여한다. External User Group은 AUTOSAR 파트너로만 이뤄지지만 AUTOSAR가 운영하지 않고, AUTOSAR 표준의 활용에 집중한다.[@autosar-organization-2026]

AUTOSAR 의장은 내부 업무를 맡고 부의장이 돕는다. 두 사람은 Steering Committee 위원이고 임기는 9개월이다. AUTOSAR Spokesperson은 언론 인터뷰와 강연 같은 대외 대표 업무만 맡는다.[@autosar-organization-2026] AUTOSAR 개발 협력은 Core Partner가 관리하며, Core Partner는 만장일치에 기반한 의사 결정 과정을 가진 분산 가상 조직을 꾸렸다.[@autosar-faq-2026]

## 표준

AUTOSAR 표준에는 Classic Platform, Adaptive Platform, Foundation이 있다.[@autosar-standards-2026] AUTOSAR R25-11 용어집은 Classic Platform을 깊이 임베디드된 시스템과, 예측 가능성·안전·응답성 요구가 높은 응용 소프트웨어를 위해 AUTOSAR가 정의한 소프트웨어 플랫폼으로 정의한다.[@autosar-fo-tr-glossary-2025] AUTOSAR Adaptive Platform R25-11은 고도 자동 주행과 자율주행 같은 쓰임새에서 safety-related 시스템을 만드는 고성능 연산 ECU를 위한 AUTOSAR의 해법이다.[@autosar-ap-tr-releaseoverview-2025]

AUTOSAR는 Classic Platform과 Adaptive Platform의 공통 부분을 Foundation이라는 표준으로 따로 펴내며, 버스 프로토콜과 [[autosar-methodology|방법론]]의 공통 측면이 그 예다.[@autosar-standards-2026] [[some-ip|SOME/IP]] 프로토콜 명세와 AUTOSAR 용어집은 Foundation에 속한다.[@autosar-fo-tr-glossary-2025][@autosar-fo-prs-someipprotocol-2025]

AUTOSAR Foundation R25-11은 AUTOSAR 플랫폼 사이의 상호운용을 목적으로 한다. Foundation은 Adaptive Platform과 Classic Platform에 공통인 일반 산출물을 담아, 두 플랫폼 사이와, AUTOSAR가 아닌 플랫폼과 AUTOSAR 플랫폼 사이의 호환을 보장한다. Classic Platform과 Adaptive Platform의 각 릴리스는 정해진 판의 Foundation에 기댄다. R25-11 Foundation의 명세 가운데 PRS(Protocol Specification)는 13개이고, SOME/IP, [[autosar-network-management|네트워크 관리]], [[autosar-time-synchronization|시간 동기화]], 침입 탐지 시스템 등의 프로토콜을 정한다.[@autosar-fo-tr-releaseoverview-2025]

Foundation의 역할은 둘이다. 하나는 두 플랫폼의 직접 범위 밖에 있거나 두 플랫폼과 무관한 산출물을 모으는 것으로, 프로토콜 명세와 Abstract Platform이 그 예다. 다른 하나는 두 플랫폼에 함께 적용되는 산출물의 저장소가 되는 것이다. **Abstract Platform**은 Classic Platform, Adaptive Platform, 오프보드 가운데 어디에 배치하든 상관없이 기능 수준 통신을 정의하려고 AUTOSAR가 정한 소프트웨어 플랫폼이다. 방법론과 모델링에서만 있는 것이고, 실제로 배치하는 플랫폼이 아니다. Classic Platform과 Adaptive Platform에서 기능 수준 통신은 [[virtual-functional-bus|VFB]] 수준 통신을 뜻한다.[@autosar-fo-tr-glossary-2025]

AUTOSAR는 자동차용 소프트웨어 기술을 표준화하므로 관련 표준을 모두 따르려 하고, ISO, ASAM, GENIVI(차량용 소프트웨어의 개방형 표준 단체) 같은 다른 표준화 기구와 정기적으로 접촉한다.[@autosar-faq-2026][@covesa-genivi-rebrand-2021] 쓸 만한 기존 해법이 있으면 적절할 때 통합하거나 참조하거나 채택하고, 겹치는 곳이 있으면 호환성과 책임 분담을 챙긴다. AUTOSAR의 자주 묻는 질문 페이지에 따르면 JasPar 회원 다수가 AUTOSAR 파트너이고 그 반대도 그렇다. JasPar는 AUTOSAR와 [[flexray|FlexRay]] 표준의 활용에 집중해 AUTOSAR 규격을 검토하고 검증하고 구현하며, JasPar 안에는 AUTOSAR와 이어 주는 작업 그룹이 있다. AUTOSAR 파트너가 아닌 JasPar 회원은 공개된 AUTOSAR 규격에만 접근할 수 있다.[@autosar-faq-2026]

두 플랫폼의 차이는 [[autosar-classic-platform#Adaptive Platform과의 차이|AUTOSAR Classic Platform]]에서 다룬다.

## 규격 문서

AUTOSAR 문서는 PDF로 펴내고, 문서마다 문서 종류 약어와 표준 약어를 메타데이터로 둔다. 발행 PDF 파일 이름에는 표준 약어, 문서 종류 약어, 문서 이름이 들어간다.[@autosar-fo-tps-standardizationtemplate-2025] 예를 들어 `AUTOSAR_CP_SWS_PortDriver`는 Classic Platform의 [[autosar-port-driver|Port Driver]] 소프트웨어 명세(Specification of Port Driver)이고, 기능 명세, API 명세, 설정 명세를 담는다.[@autosar-cp-sws-portdriver-2025]

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

예를 들어 [[autosar-layered-architecture|Layered Software Architecture]] 설명서는 요구사항을 담지 않은 정보 제공용 문서다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

[[software-requirements-specification|SRS]]는 이 문서 종류에 없다.[@autosar-fo-tps-standardizationtemplate-2025] Port Driver SWS는 입력 요구사항 문서를 SRS 문서라 부르지만, 그 문서의 파일 이름은 `AUTOSAR_CP_RS_PortDriver`처럼 RS이고, 요구사항 ID에는 SRS_BSW_00358처럼 SRS 접두어가 붙는다.[@autosar-cp-sws-portdriver-2025]

## 규격 항목 ID와 API 명세

AUTOSAR 규격 항목(specification item)의 ID는 표준 약어(생략 가능), 문서 종류 약어, 문서 이름 약어, 특수화(생략 가능), 번호를 밑줄로 이은 꼴이고, 번호는 00000부터 99999까지의 고유 번호다. ID는 [SWS_Port_00140]처럼 대괄호 안에 쓴다.[@autosar-fo-tps-standardizationtemplate-2025] BSW(Basic Software) 모듈의 규격 항목은 BSW 요구사항으로 추적되고, BSW 모듈 구현은 해당 규격 항목까지의 [[traceability|추적성]]을 보장해야 한다.[@autosar-cp-sws-bswgeneral-2025] AUTOSAR R25-11의 Adaptive Platform System Tests 기술 보고서는 [[autosar-adaptive-platform#개정 이력|Adaptive Platform Demonstrator]]가 [[autosar-adaptive-platform#Functional cluster|functional cluster]]의 요구사항을 채우는지 확인하는 [[test-case|테스트 케이스]]를 담는다. 테스트 케이스마다 [STS_CM_00007] 같은 ID가 붙고, 그 테스트 케이스가 확인하는 RS 요구사항과 SWS 규격 항목의 ID가 함께 적힌다.[@autosar-ap-tr-systemtests-2025]

![[diagrams/autosar-specification-item-id.svg]]

AUTOSAR R25-11 BSW 일반 명세(General Specification of Basic Software Modules)는 BSW 모듈의 모듈 약어 `<Ma>`를 이 명세의 BSW 모듈 목록에 정한 것과 같게 쓰도록 정한다. 모듈 구현 접두어 `<Mip>`는 `<Ma>[_<vi>_<ai>]` 꼴로 만들고, `<vi>`는 그 모듈의 `vendorId`, `<ai>`는 `vendorApiInfix`이며, `vendorApiInfix`가 없으면 대괄호 부분을 뺀다. 구현 접두어를 모두 대문자로 쓴 것이 `<MIP>`다. 구현 접두어는 API 이름, 파라미터 이름, 심볼, 파일 이름 같은 식별자를 만드는 데 쓰고, 같은 종류 모듈의 인스턴스를 가려야 할 때 모듈 약어 대신 쓴다. 예를 들어 FlexRay Interface의 구현 접두어는 모듈 약어와 같은 FrIf이고, 벤더 ID 21과 `vendorApiInfix` LDExt를 둔 EEPROM Driver 구현의 접두어는 Eep_21_LDExt다. 이 명세의 BSW 모듈 목록은 모듈마다 uint16 값의 Module ID를 매기며, 예를 들어 Os는 001, CanIf는 060, Can은 080이다.[@autosar-cp-sws-bswgeneral-2025]

![[diagrams/bsw-module-implementation-prefix.svg]]

Classic Platform의 BSW 모듈 SWS는 API 함수마다 표를 둔다. 표에는 Service name, Syntax, Service ID [hex], Sync/Async, Reentrancy, 매개변수(in, inout, out), Return value, Description, Available via(원형을 선언한 헤더)가 들어간다. **Service ID**는 BSW 모듈마다 `0x00`부터 매기는 서비스 번호이고, [[autosar-error-handling#Det|Default Error Tracer]]의 오류 보고 API에 매개변수로 넘긴다. Sync/Async 칸의 값은 Synchronous, Asynchronous, Depends on configuration 가운데 하나다.[@autosar-cp-sws-bswgeneral-2025]

**동기 함수**는 돌아올 때 기능이 끝났음이 보장되고, **비동기 함수**는 그런 보장이 없다. **재진입 가능한 함수**(reentrant function)는 실행 도중에 끼어들림을 당한 뒤, 앞선 호출이 끝나기 전에 다시 안전하게 호출될 수 있다.[@autosar-fo-tr-glossary-2025] 예를 들어 Port Driver SWS는 `Port_Init`의 Service ID를 `0x00`으로 두고, 동기이며 재진입할 수 없다고 정하며, `Port.h`로 제공한다.[@autosar-cp-sws-portdriver-2025]

## 릴리스 생명주기

AUTOSAR Foundation R25-11은 major release 하나의 생명주기를 차례로 이어지는 네 단계로 정한다.[@autosar-fo-tr-releaseoverview-2025]

- **Development**: 생명주기가 시작해 첫 릴리스가 나오기까지의 단계다.
- **Evolution**: 첫 릴리스 뒤에 minor release와 revision이 나오는 단계다.
- **Maintenance**: 새 내용을 더하지 않고, revision으로 기존 내용만 유지보수하는 단계다.
- **Issue Notice**: revision도 내지 않고, 생명주기가 끝날 때까지 알려진 문제 목록만 갱신하는 단계다.[@autosar-fo-tr-releaseoverview-2025]

![[diagrams/autosar-release-lifecycle.svg]]

AUTOSAR는 Ryy-mm 꼴의 플랫폼 릴리스 번호와 따로 `R<major>.<minor>.<revision>` 꼴의 내부 릴리스 번호를 두고, 내부 번호로 릴리스의 종류를 가린다. major release는 valid와 draft 규격 부분을 하위 호환 없이 바꿀 수 있다. minor release는 valid 부분을 하위 호환되게만 바꿀 수 있고, draft 부분은 하위 호환 없이 바꿀 수 있다. revision은 확장 없이 하위 호환되는 버그 수정만 담는다. R19-11부터는 플랫폼 릴리스 하나에 내부 번호 하나가 대응한다. 예를 들어 R25-11의 내부 번호는 R4.11.0이고, R25-11은 minor release다.[@autosar-fo-tr-releaseoverview-2025]

규격 항목의 생명주기 상태는 규격 항목 ID 뒤의 중괄호 안에 있고, 요구사항의 상태는 Status 속성에 있다. 규격 항목과 요구사항의 상태는 같은 셋이다.[@autosar-fo-tr-releaseoverview-2025]

- **VALID**: 문서의 유효한 부분이다. 상태를 따로 적지 않은 항목도 VALID다.
- **DRAFT**: 새로 넣었지만 아직 실험적인 부분이다. 펴내기는 하지만 하위 호환 보장 없이 바뀔 수 있다.
- **OBSOLETE**: 다음 릴리스 가운데 하나에서 따로 알리지 않고 뺄 수 있는 부분이다.[@autosar-fo-tr-releaseoverview-2025]

AUTOSAR R25-11 Classic Platform Release Overview는 규격 항목의 상태와 따로 명세 문서에도 상태를 매겨, 그 릴리스에서 obsolete 상태로 정한 명세의 목록과, removed 상태로 정해 더는 펴내지 않는 명세의 목록을 따로 둔다.[@autosar-cp-tr-releaseoverview-2025]

## Feature와 concept

AUTOSAR R25-11 Features 기술 보고서는 **AUTOSAR Feature**를 사용자 목표를 채우는 AUTOSAR 표준의 특성으로 정의하고, Feature와 그 가지를 나무와 비슷한 그래프인 **Feature Graph**로 나타낸다. 모든 Feature를 합하면 AUTOSAR 표준 전체를 덮는 것이 목표이고, 사용자는 짧은 Feature 이름으로 서로 맞는 AUTOSAR 문서 묶음을 고를 수 있다. 이 보고서의 level 1 Feature는 Basic_Functionality, Communication, Development, Diagnostic, Execution_Environment, Hardware_Support, Safety, Security, Software_Update, Standardized_Application_Interface, Storage, Timing의 12개다.[@autosar-fo-tr-features-2025] AUTOSAR는 Feature Graph에서 Feature 사이의 의존 관계로, 한 Feature가 없으면 다른 Feature가 동작하지 못하는 필수 의존, 골라도 빼도 되는 선택 의존, 여러 Feature 가운데 하나만 고르는 택일 의존을 둔다.[@autosar-features-2026]

AUTOSAR의 **concept**은 AUTOSAR 표준이 다루는 기능을 넓히는 기술 해법을 함께 기술하는 문서 묶음이다. concept은 목적과 쓰임새, 기술 접근을 적은 concept 문서, 바뀔 내용을 담은 유지보수 모드 명세의 가지, 새 기술 기능을 기술하는 evolution 모드의 새 문서, 방법론과 템플릿의 변경을 담은 메타모델 사본으로 이뤄질 수 있다. AUTOSAR는 릴리스마다 들어갈 concept을 Concept Roadmap으로 공개하며, 예를 들어 R25-11에는 [[autosar-persistency#Remote Persistency|Remote Persistency]], COMHandler, Feature Graph 등의 concept이 들었다.[@autosar-concept-roadmap-2026]
