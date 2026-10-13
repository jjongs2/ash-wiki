---
title: 결함 관리
tags:
  - process/sw-testing
verified: 2026-10-03
---

ISTQB 용어집은 결함을 알아채고, 기록하고, 분류하고, 조사하고, 고치고, 처분하는 프로세스를 **결함 관리**(defect management)라 부른다.[@istqb-glossary-defect-management-2026] ISTQB CTFL 강의계획서에 따르면 결함을 찾는 것이 테스트의 주된 목적 가운데 하나이므로, 자리 잡힌 결함 관리 프로세스가 꼭 있어야 한다.[@istqb-ctfl-syllabus-2024] 결함과 장애(failure)의 정의는 [[fault-error-failure|Fault, error, failure]]에서 다룬다.

## 결함 보고서와 사건 보고서

ISTQB 용어집은 결함이 일어났음과 그 성질, 상태를 적은 문서를 **결함 보고서**(defect report)라 부르고, bug report를 같은 말로 둔다.[@istqb-glossary-defect-report-2026] CTFL 강의계획서에 따르면 결함 보고서는 결함을 처리할 담당자에게 해결에 충분한 정보를 주고, 작업 산출물의 품질을 추적하는 수단이 되며, 개발 프로세스와 테스트 프로세스를 개선할 단서를 준다.[@istqb-ctfl-syllabus-2024]

같은 강의계획서에 따르면 동적 테스트 중에 낸 결함 보고서에는 대개 다음이 들어간다.[@istqb-ctfl-syllabus-2024]

- 고유 식별자
- 제목과 짧은 요약
- 이상을 본 날짜, 보고한 조직, 작성자와 그 역할
- 테스트 대상과 테스트 환경
- 결함의 맥락(실행한 [[test-case|테스트 케이스]], 테스트 활동, 개발 단계, 쓴 기법·체크리스트·테스트 데이터 등)
- 재현 단계와 로그·스크린숏 같은 근거를 담은 failure의 설명
- 기대 결과와 실제 결과
- 심각도
- 고칠 우선순위
- 상태
- 참조(이 결함을 드러낸 테스트 케이스 등)[@istqb-ctfl-syllabus-2024]

ISO/IEC/IEEE 24765:2017은 이슈 추적 시스템의 이슈 기록이 식별자와 짧은 설명을 담고, 흔히 환경, 상태, 심각도, 우선순위, 해결을 함께 적는다고 둔다.[@iso-iec-ieee-24765-obp-2017]

[[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-2:2021은 **사건**(incident)을 프로젝트, 제품, 서비스, 시스템의 생명주기 어느 때든 일어나는 이상하거나 예상하지 못한 사건이나 조건으로 정의하고, **사건 보고서**(incident report)를 사건의 발생, 성질, 상태를 적은 문서로 정의하고, 이를 이상 보고서, 버그 보고서, 결함 보고서, 문제 보고서 같은 이름으로도 부른다고 둔다. 같은 표준의 프로세스 모델에서는 테스트 사건 보고 프로세스가 사건 보고를 맡는다.[@iso-iec-ieee-29119-2-obp-2021] 이 모델은 [[test-process|테스트 프로세스]]에서 다룬다.

CTFL 강의계획서에 따르면 보고된 이상은 실제 결함일 수도 있고, false-positive result나 변경 요청 같은 다른 것일 수도 있으며, 어느 쪽인지는 결함 보고서를 처리하면서 가린다.[@istqb-ctfl-syllabus-2024] ISTQB 용어집은 테스트 대상에 실제로 없는 결함이 보고된 테스트 결과를 **false-positive result**라 부른다.[@istqb-glossary-false-positive-result-2026] ISTQB CTAL-TA(Certified Tester Advanced Level Test Analyst) 강의계획서에 따르면 테스트 실행에서 나온 이상은 테스트 대상의 결함 말고도 갖춰지지 않은 사전 조건, 잘못된 테스트 데이터, 테스트 스크립트나 테스트 환경의 결함, 명세를 잘못 이해한 것 때문에 생길 수 있다.[@istqb-ctal-ta-syllabus-2025]

## 결함의 처리 흐름

CTFL 강의계획서에 따르면 결함 관리 프로세스는 적어도 이상 하나하나를 발견부터 종료까지 다루는 워크플로와 분류 규칙을 담는다. 워크플로는 대개 보고된 이상을 기록하고, 분석하고 분류하고, 고칠지 그대로 둘지 대응을 정하고, 결함 보고서를 닫는 활동으로 이루어진다. 강의계획서는 결함 상태의 예로 open, deferred, duplicate, waiting to be fixed, awaiting confirmation testing, re-opened, closed, rejected를 든다.[@istqb-ctfl-syllabus-2024] Bugzilla의 기본 워크플로는 해결(resolution) 값으로 FIXED, DUPLICATE, WONTFIX, WORKSFORME, INVALID를 두고[@bugzilla-editing-a-bug-2026], Jira는 기본 해결 값으로 Done, Won't do, Duplicate, Cannot reproduce를 둔다.[@atlassian-jira-statuses-resolutions-2026]

ISTQB 용어집에 따르면 결함을 고친 뒤에는 [[regression-testing#확인 테스트와의 차이|확인 테스트]]로 그 결함이 일으킨 장애가 다시 일어나지 않는지 본다.[@istqb-glossary-confirmation-testing-2026] 확인 테스트에서 고쳐지지 않은 것으로 드러나면 결함 보고서를 다시 연다.[@bugzilla-editing-a-bug-2026][@istqb-ctal-tm-syllabus-2024]

## 분류 속성

IEEE 1044-2009는 소프트웨어 이상이 생명주기의 언제 생기거나 드러나든 그것을 한 가지 방식으로 분류하는 방법을 정한다. 장애와 결함을 분류하는 핵심 속성의 집합을 두되, 응용이나 업무마다 고유한 속성이 따로 있을 수 있음을 인정하고, 생명주기에 맞춰 속성 값을 어느 정도 고쳐 쓰리라 본다. 분류 데이터는 결함 원인 분석, 프로젝트 관리, 그리고 결함이 들어갈 가능성을 줄이거나 일찍 찾을 가능성을 높이는 [[software-process|소프트웨어 프로세스]] 개선에 쓸 수 있는 것으로 둔다.[@ieee-1044-2009] IEEE SA는 IEEE 1044-2009를 2020년 3월에 비활성(Inactive-Reserved) 표준으로 돌렸다.[@ieee-1044-status-2026]

ISTQB CTAL-TM(Certified Tester Advanced Level Test Management) 강의계획서에 따르면 결함 보고서에 결함이 들어간 단계와 찾은 단계를 적어 두면, 결함을 들어간 단계 안에서 없애는지(phase containment)를 평가할 수 있다. 들어간 단계의 정보로는 결함이 가장 많이 들어가는 단계를 가려 결함 예방을 위한 개선을 그 단계에 겨눌 수 있다.[@istqb-ctal-tm-syllabus-2024]

## 심각도와 우선순위

- **심각도**(severity): ISTQB 용어집은 결함이 컴포넌트나 시스템의 개발, 테스트, 운용에 주는 영향의 정도를 심각도라 부른다.[@istqb-glossary-severity-2026]
- **우선순위**(priority): ISTQB 용어집은 특정 기준에 따라 작업에 매긴 중요도의 수준을 우선순위라 부른다.[@istqb-glossary-priority-2026]

CTFL 강의계획서에 따르면 결함 보고서의 심각도는 이해관계자의 이익이나 요구사항에 미치는 영향의 정도다.[@istqb-ctfl-syllabus-2024]

## 늦게 찾을수록 커지는 비용

RTI가 NIST의 위탁으로 쓴 2002년 보고서 Planning Report 02-3은 결함을 고치는 상대 비용을 결함이 들어간 단계와 고치는 단계에 따라 예시했다. 이 예시에서는 어느 단계에서 들어간 결함이든 뒤 단계에서 고칠수록 비용이 크고, 요구사항 수집·분석과 아키텍처 설계 단계에서 들어간 결함을 고치는 상대 비용은 그 단계에서 1, 코딩과 단위 테스트 단계에서 5, 통합·컴포넌트·시스템 테스트 단계에서 10, 초기 고객 피드백과 베타 테스트 단계에서 15, 출시 뒤 30이다.[@rti-economic-impacts-software-testing-2002]

![[diagrams/nist-defect-fix-relative-cost.svg]]

Boehm과 Basili는 2001년 글에서, 인도한 뒤에 소프트웨어 문제를 찾아 고치는 비용이 요구사항이나 설계 단계에서 찾아 고치는 비용의 100배가 되는 일이 흔하다고 적었다. 작은 비핵심 시스템에서는 그 비율이 100:1보다 5:1에 가깝다고 덧붙였다.[@boehm-defect-reduction-2001] 결함을 일찍 찾는 shift left는 [[v-model|V 모델]]에서 다룬다.

[[software-quality#품질 보증|품질 보증]] 활동은 결함을 다루는 방식에 따라 세 갈래로 나뉜다.[@tian-quality-assurance-alternatives-2001]

- **결함 예방**(defect prevention): 실수를 없애 결함이 들어가지 않게 한다.
- **결함 감소**(defect reduction): 들어간 fault를 찾아 없앤다.
- **결함 봉쇄**(defect containment): fault와 failure의 인과를 끊어, 국소적인 fault가 전역적인 failure로 번지지 않게 한다.[@tian-quality-assurance-alternatives-2001]

![[diagrams/defect-prevention-reduction-containment.svg]]

## 결함 예방과 결함 데이터 분석

CTAL-TA 강의계획서에 따르면 결함 예방의 목표는 작업 산출물에 결함이 생기거나 다시 생길 가능성을 낮추고, 결함이 개발 생명주기의 뒤 단계로 번지는 것을 줄이는 조치를 하는 것이며, 결함 예방은 팀 전체의 책임이다. 결함 예방 조치가 원하는 효과를 냈는지 평가하는 데 쓰는 메트릭의 예는 다음과 같다.[@istqb-ctal-ta-syllabus-2025]

- **DRE**(Defect Removal Efficiency): 릴리스 전에 없앤 결함 수와 전체 결함 수의 비. 알 수 없는 분모는 추정하거나, 릴리스 뒤 6개월까지처럼 어느 시점까지 찾은 결함의 총수로 대신할 수 있다. DRE가 높으면 운영으로 새는 결함이 적다는 뜻이지만, 예방으로 막은 결함과 검출로 잡은 결함을 가리지 못한다.
- **PCE**(Phase Containment Effectiveness): 어느 단계에 들어간 결함의 총수에 대한, 같은 단계에서 들어가고 없앤 결함 수의 비. PCE가 높으면 뒤 단계로 새는 결함이 적다.
- **품질 비용**(cost of quality): 결함 예방 비용과 결함 검출·제거 비용 사이의 관계를 보인다.[@istqb-ctal-ta-syllabus-2025]

![[diagrams/dre-pce-defect-ratios.svg]]

테스트 결과를 분석하면 결함 검출의 효과를 높일 단서를 얻는다. **DDP**(Defect Detection Percentage)는 [[software-testing#테스트 레벨|테스트 레벨]]의 테스트 효과를 재는 가장 중요한 척도 가운데 하나다. DDP를 셀 때는 빠져나간 결함을 그 테스트 레벨이 찾을 수 있었던 것으로만 한정하고, 릴리스 뒤 정한 기간처럼 셀 시간 범위와, 제3자 컴포넌트나 특정 고객 환경의 결함처럼 뺄 기준을 미리 정해 둔다. 어느 테스트 레벨의 DDP가 낮으면 빠져나간 결함의 비율이 높아 결함 검출이 효과적이지 않다는 뜻이다. 빠져나간 결함을 줄일 우선순위는 대개 심각도에 달려 있으므로, DDP는 심각도별로 나누어 보는 것이 가장 좋다.[@istqb-ctal-ta-syllabus-2025]

**Test gap analysis**는 최근의 코드 변경을 테스트가 얼마나 실행했는지 평가한다. 오래 바뀌지 않았고 앞 릴리스에서 테스트한 코드까지 [[test-coverage|커버리지]]가 낮은 곳을 모두 겨누는 대신, 한 번도 테스트하지 않은 새 변경처럼 특히 결함이 생기기 쉬운 곳에 테스트 노력을 더 모을 수 있다.[@istqb-ctal-ta-syllabus-2025]

이런 분석은 결함 수나 DDP 같은 결함 메트릭을 쓰지만, 이 메트릭은 테스트 결과에서 보이는 만큼 쉽게 읽히지 않는다. 여러 테스트가 같은 결함을 찾기도 하고 한 테스트가 결함 여럿을 찾기도 해서 테스트 결과와 결함의 관계는 다대다일 수 있으므로, 실패한 테스트 수는 그 테스트가 찾은 결함 수와 같지 않을 수 있다. 찾은 결함의 실제 수를 세려면 [[software-testing#테스트와 디버깅|디버깅]]의 결과를 꼼꼼히 분석해야 한다. 결함의 심각도가 테스트의 중요도와 다를 수도 있어, 중요한 테스트 케이스가 사소한 결함 때문에 실패하기도 한다.[@istqb-ctal-ta-syllabus-2025]

**근본 원인 분석**(root cause analysis)은 결함의 증상만이 아니라 그 밑에 있는 근본적인 원인을 찾아 다루는 기법이고, 주된 목표는 결함이 다시 생기지 않게 하는 것이다. 결함과 장애의 근본 원인을 찾는 기법으로는 결함 분류법(defect taxonomy), five whys 기법, 원인-결과 다이어그램, 파레토 분석이 있다. 분석할 결함은 대개 많아 결함마다 예방 조치를 계획하면 아주 비효율적이므로, 결함을 분류한 뒤 나타난 결함 유형마다 근본 원인 분석을 하는 방법이 있다. 결함 분류는 결함에 담긴 개발 프로세스의 정보를 프로세스 측정으로 바꾸어, 정량적인 결함 통계와 정성적인 근본 원인 분석 사이를 잇는다. 근본 원인 분석을 제대로 뒷받침하려면 초기 테스트부터 운영까지 개발 생명주기 전체에서 결함을 같은 방식으로 분류해야 한다.[@istqb-ctal-ta-syllabus-2025]

결함 분류 방법의 예는 다음과 같다.[@istqb-ctal-ta-syllabus-2025]

- **ODC**(Orthogonal Defect Classification): 결함마다 서로 배타적인 속성으로 분류하고, 속성은 결함을 보고할 때와 고칠 때 모은다.
- IEEE 1044: 앞의 분류 속성 절에서 다룬다.
- 심각도 기반 분류: 결함을 critical, major, minor, trivial 같은 심각도로 분류한다.
- 결함 분류법 모델(defect taxonomy model)[@istqb-ctal-ta-syllabus-2025]

ISO/IEC 25010:2023 같은 [[software-quality-model|소프트웨어 품질 모델]]로 결함을 품질 속성에 대응시킬 수도 있다.[@istqb-ctal-ta-syllabus-2025]

## ASPICE의 SUP.9

[[automotive-spice|ASPICE]] 4.1은 문제 해결 관리를 SUP.9(Problem Resolution Management)로 지원 프로세스 범주에 둔다. SUP.9의 목적은 문제가 식별, 기록, 분석되고 그 해결이 관리·통제되게 하는 것이다. SUP.9의 BP(base practice)는 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| BP  | 하는 일                    |
| --- | -------------------------- |
| BP1 | 문제 식별과 기록           |
| BP2 | 문제의 원인과 영향 결정    |
| BP3 | 급한 해결 조치 승인        |
| BP4 | 경보 알림                  |
| BP5 | 문제 해결 시작             |
| BP6 | 문제가 닫힐 때까지 추적    |
| BP7 | 문제 해결 활동의 상태 보고 |

프로세스 목록은 [[automotive-spice-process-reference-model#프로세스 범주와 그룹|ASPICE 프로세스 참조 모델]]에서, 변경 요청 관리(SUP.10)는 [[configuration-management#ASPICE|형상 관리]]에서 다룬다.

ASPICE 3.1은 SUP.9에 BP를 아홉 두었다. 그 가운데 문제 해결 관리 전략 수립(BP1), 문제 상태 기록(BP3), 문제 경향 분석(BP9)이 있었고, 상태를 보고하는 BP는 없었다. ASPICE 4.1은 상태 보고를 BP7로 둔다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017] SUP.9의 BP는 ASPICE 4.0에서 일곱이 되었다.[@vda-automotive-spice-pam-4-0-2023]

## 결함 관리 도구

CTAL-TM 강의계획서에 따르면 발견한 이상은 결함 관리 도구에 기록한다.[@istqb-ctal-tm-syllabus-2024] CTFL 강의계획서에 따르면 결함 관리 도구를 쓰면 식별자, 날짜, 작성자, 처음 상태 같은 보고서 데이터 일부가 저절로 채워지기도 한다.[@istqb-ctfl-syllabus-2024] 이슈 추적 도구로는 Redmine과 Jira가 있다.[@redmine-home-2026][@atlassian-jira-bug-tracking-2026]
