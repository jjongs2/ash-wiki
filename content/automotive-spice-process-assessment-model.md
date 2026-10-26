---
title: ASPICE 프로세스 평가 모델
tags:
  - sw-engineering/sw-process
verified: 2026-10-02
---

**ASPICE 프로세스 평가 모델**(process assessment model, PAM)은 [[automotive-spice|ASPICE]]의 [[automotive-spice-process-reference-model|프로세스 참조 모델]]이 정의한 프로세스에 지표를 더해, 평가자가 프로세스 성과와 프로세스 속성 달성이 있는지 판단할 [[process-assessment#평가의 요소|객관적 증거]]를 모으게 하는 모델이다. ASPICE 4.1의 프로세스 평가 모델이 담는 프로세스는 프로세스 참조 모델의 것과 같고, 프로세스마다 참조 모델의 프로세스 ID(identifier), 이름, 목적, 성과를 함께 싣는다.[@vda-automotive-spice-pam-4-1-2026]

## 프로세스 차원과 능력 차원

프로세스 평가 모델로 프로세스 능력을 판정하는 개념은 두 차원의 틀에 바탕을 둔다. 첫째 차원인 [[process-assessment#프로세스 모델|프로세스 차원]]은 프로세스 참조 모델이 정의한 프로세스로 이뤄지고, 둘째 차원인 능력 차원은 [[process-capability-level|능력 수준]]과 그것을 다시 나눈 프로세스 속성으로 이뤄진다. 프로세스 속성은 프로세스 능력을 잴 수 있는 특성이다.[@vda-automotive-spice-pam-4-1-2026]

## 지표의 두 종류

이 모델은 지표를 두 종류로 둔다.[@vda-automotive-spice-pam-4-1-2026]

- **프로세스 수행 지표**(process performance indicators): 프로세스 성과가 얼마나 이뤄졌는지 보이는 지표로, 프로세스마다 다르고 능력 수준 1([[process-capability-level#수준과 프로세스 속성|CL]] 1)에 쓴다.
- **프로세스 능력 지표**(process capability indicators): 프로세스 속성이 얼마나 이뤄졌는지 보이는 지표로, 모든 프로세스에 공통이고 능력 수준 1\~5에 쓴다.[@vda-automotive-spice-pam-4-1-2026]

![[diagrams/aspice-assessment-indicators.svg]]

지표는 프로세스 성과와 속성 달성이 있는지 가리고 객관적 증거를 모으는 데 쓰는 안내이며, 꼭 따라야 할 점검표가 아니다.[@vda-automotive-spice-pam-4-1-2026]

평가 지표의 꼴로 보면 이 모델은 프랙티스와 정보 항목만 쓰고, 자원과 인프라는 지표로 쓰지 않는다. 프랙티스는 아래의 base practice와 generic practice를 함께 이르는 말로 활동 쪽 지표이고, 정보 항목은 결과 쪽 지표다.[@vda-automotive-spice-pam-4-1-2026]

## 프로세스 수행 지표

이 모델의 프로세스 수행 지표는 BP(base practice)와 출력 정보 항목이다.[@vda-automotive-spice-pam-4-1-2026]

- **BP**: 프로세스 목적과 성과를 이루려고 하는 활동을 정한다. 활동 쪽 지표다.
- **정보 항목**(information item): 결과 쪽 지표다. [[process-assessment#ISO/IEC 330xx 계열|ISO/IEC 33001]]을 따라 사람이 사용하도록 만들고 저장하고 전달하는, 따로 식별되는 정보로 정의한다.[@vda-automotive-spice-pam-4-1-2026]

이 모델은 정보 항목을 평가받는 조직이 만든 작업 산출물과 구별하고, 둘 사이에 일대일 대응을 두지 않는다. BP는 하나 이상의 프로세스 성과에 연결되고, 프로세스마다 BP와 출력 정보 항목이 어느 성과에 닿는지 표로 보인다. 예를 들어 [[automotive-spice-process-reference-model#프로세스 범주와 그룹|SWE.1]]에는 소프트웨어 요구사항을 구조화하고 우선순위를 매기는 BP(SWE.1.BP2)가 있다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 결과 쪽 수행 지표로 작업 산출물(WP, work product)과 그 특성(WPC, work product characteristics)을 두었다. ASPICE 4.1은 그 자리에 정보 항목과 정보 항목 특성(IIC, information item characteristics)을 둔다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

ASPICE 4.1의 Annex B는 정보 항목마다 IIC를 표로 싣는다. 평가자는 [[process-assessment#평가의 요소|조직 단위]]가 낸 표본을 평가할 때 IIC를 쓸 수 있지만, IIC는 점검표로 쓰라고 둔 것이 아니다. 일부 특성은 평가받는 조직의 다른 작업 산출물에 들어 있을 수 있다. IIC를 그에 대응하는 작업 산출물이 갖춰야 할 구조로 해석해서도 안 된다. 작업 산출물의 구조는 프로젝트와 조직이 정한다.[@vda-automotive-spice-pam-4-1-2026]

## 객관적 증거와 작업 산출물

이 모델에서 평가는 프로세스 성과와 프로세스 속성 달성이 있는지 판단하려고 객관적 증거를 얻는다. 증거는 모두 평가 대상 프로세스의 출력에 관련된 작업 산출물을 살펴보거나, 프로세스를 수행하고 관리하는 사람의 진술을 들어서 얻는다.[@vda-automotive-spice-pam-4-1-2026]

증거로 삼는 작업 산출물은 평가 대상 프로세스의 출력이 아니어도 된다. 조직의 다른 프로세스에서 나온 것이라도 평가 대상 프로세스를 수행하는 데 쓰였으면, 평가자가 객관적 증거로 볼 수 있다. 작업 산출물은 사양서, 보고서, 기록, 아키텍처 설계, 소프트웨어 코드처럼 문서의 면을 지닌 것이 많지만, 소프트웨어 바이너리, 원시 데이터, 물리적 전자 하드웨어처럼 문서의 면이 없는 것도 있다.[@vda-automotive-spice-pam-4-1-2026]

## 프로세스 능력 지표

프로세스 능력 지표는 GP와 정보 항목이다. **GP**(generic practice)는 프로세스 속성을 이루려고 하는 활동으로, 프로세스 속성마다 적어 둔 달성 항목(process attribute achievement) 가운데 하나 이상에 연결되며 모든 프로세스에 쓴다. 능력 수준 1에서는 프로세스 성과가 얼마나 이뤄졌는지만으로 프로세스 능력을 나타낸다. 이 수준의 프로세스 속성 PA(process attribute) 1.1에는 GP 1.1.1 하나만 두고, GP 1.1.1은 그 프로세스의 수행 지표를 가리키는 편집상의 참조(editorial reference)다. 능력 수준 2 이상의 프로세스 속성마다 GP와 정보 항목을 둔다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 프로세스 능력 지표로 GP와 GR(generic resource)을 두고, 이를 능력 수준 2\~5에 썼다. GR은 인프라 쪽 지표로, GP처럼 프로세스 속성의 달성 항목 가운데 하나 이상에 연결되었다. 예: PA 2.2의 [[configuration-management|형상 관리]] 시스템. ASPICE 4.1은 GR을 두지 않고 GP와 정보 항목만 쓰며, GP를 능력 수준 1\~5에 쓴다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## 지표와 성과의 관계

ASPICE 4.1이 ISO/IEC 33020:2019에서 가져온 [[process-assessment#평정 방법|평정 방법]] R1에서는 프로세스 성과의 특성 판정을 모아 프로세스 수행 속성(PA 1.1)을 평정한다.[@vda-automotive-spice-pam-4-1-2026]

## 전략과 계획

이 모델은 PA 2.1의 GP 2.1.1에서 프로세스 수행 목표와 프로세스 수행 전략을 정하게 하고, GP 2.1.2에서 그 목표, 기준, 전략에 따라 수행을 계획하게 한다. 프로세스 수행 전략(정보 항목 19-01)은 수행 목표를 이루는 방안이다.[@vda-automotive-spice-pam-4-1-2026]

GP 2.1.1의 주석은 프로세스 수행 목표가 프로젝트 목표와 같지 않고, 능력 수준 1의 프로세스 성과를 되풀이한 것도 아니라는 점을 제시한다. 그 예로 SUP.10에서 들어오는 변경 요청을 모두 정한 날수 안에 분석한다는 목표를 든다. 다른 주석은 프로세스 수행 전략을 프로세스마다 따로 문서화하지 않아도 되고, 여러 프로세스에 걸치는 요소는 공통 프로젝트 핸드북이나 공동 테스트 전략처럼 한 문서에 함께 담아도 된다는 점을 제시한다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 SYS.4, SYS.5, SWE.4, SWE.5, SWE.6, SUP.1, SUP.8, SUP.9, SUP.10의 BP1을 전략 수립으로 두고, 그 전략을 프로세스별 계획에 대응시켰다. ASPICE 4.1은 이 BP를 두지 않고 GP 2.1.1에서 프로세스 수행 전략을 정하게 한다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

## BP에 되풀이되는 개념

ASPICE 4.1은 여러 엔지니어링 프로세스에 같은 이름의 BP를 되풀이해 둔다.[@vda-automotive-spice-pam-4-1-2026]

### 합의와 의사소통

이 모델은 SYS.2, SYS.3, SWE.1, SWE.2, SWE.3의 마지막 BP로 합의된 산출물을 영향받는 당사자 모두에게 알리게 하고, SYS.4, SYS.5, SWE.4, SWE.5, SWE.6의 마지막 BP로 검증 결과를 요약해 알리게 한다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 Annex D(Key concepts)에서 [[v-model|V 모델]] 왼쪽의 정보 흐름을 합의된 산출물을 알리는 BP에, 오른쪽을 결과를 요약해 알리는 BP에 대응시켰다. 합의는 영향받는 당사자 사이의 공통 이해로 두고, 정식 승인은 GP 2.1.7에 맡겼다. ASPICE 4.1은 같은 꼴의 BP를 두지만 Annex C(Key concepts)에 이 절이 없다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

### 추적성과 일관성

ASPICE 4.1은 SYS.2\~SYS.5, SWE.1\~SWE.6, HWE.1\~HWE.4, MLE.1\~MLE.4에 [[traceability#일관성|일관성]]을 보장하고 [[traceability#양방향 추적성|양방향 추적성]]을 세우는 BP를 하나씩 둔다.[@vda-automotive-spice-pam-4-1-2026]

### Evaluate, verification criteria, ensuring compliance

ASPICE 3.1은 Annex D(Key concepts)에서 평가(evaluate), 검증 기준(verification criteria), 준수 보장(ensuring compliance)을 핵심 개념 하나로 묶었다. ASPICE 4.1은 이 셋을 다음처럼 바꿨다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

- 평가: 3.1은 시스템·[[software-architecture|소프트웨어 아키텍처]]와 [[software-unit-design|소프트웨어 상세 설계]]에서 대안을 정한 기준으로 평가하고 선택 근거를 기록하게 했다(SYS.3.BP5, SWE.2.BP6, SWE.3.BP4). 4.1은 대안 평가 BP 대신 시스템·소프트웨어 아키텍처를 기술적 측면에서 분석하고 설계 결정의 근거를 기록하게 하고(SYS.3.BP3, SWE.2.BP3), 상세 설계(SWE.3)에는 평가나 분석 BP를 두지 않는다.
- 검증 기준: 3.1은 SYS.2와 SWE.1에서 요구사항마다 검증 기준을 세우게 했고, 4.1은 이 BP를 두지 않는다. 검증 기준은 [[requirements-engineering#검증 기준|요구 공학]]에서 다룬다.
- 준수 보장: 3.1은 시험 프로세스의 BP가 시험 명세를 V 모델 왼쪽의 대응 산출물에 대한 준수를 입증하기에 알맞게 만들게 했다. 4.1은 이를 아키텍처나 요구사항에 맞춰 검증 수단(verification measure)을 명세하는 BP로 둔다(예: SYS.4.BP1).[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]
