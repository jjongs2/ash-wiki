---
title: 결함 관리
tags:
  - process/sw-testing
verified: 2026-10-03
---

ISTQB(International Software Testing Qualifications Board) 용어집은 결함을 알아채고, 기록하고, 분류하고, 조사하고, 고치고, 처분하는 프로세스를 **결함 관리**(defect management)라 부른다.[@istqb-glossary-defect-management-2026] ISTQB CTFL(Certified Tester Foundation Level) 강의계획서에 따르면 결함을 찾는 것이 테스트의 주된 목적 가운데 하나이므로, 자리 잡힌 결함 관리 프로세스가 꼭 있어야 한다.[@istqb-ctfl-syllabus-2024] 결함과 failure의 정의는 [[fault-error-failure|Fault, error, failure]]에서 다룬다.

## 결함 보고서와 사건 보고서

ISTQB 용어집은 결함이 일어났음과 그 성질, 상태를 적은 문서를 **결함 보고서**(defect report)라 부르고, bug report를 같은 말로 둔다.[@istqb-glossary-defect-report-2026] CTFL 강의계획서에 따르면 결함 보고서는 결함을 처리할 담당자에게 해결에 충분한 정보를 주고, 작업 산출물의 품질을 추적하는 수단이 되며, 개발 프로세스와 테스트 프로세스를 개선할 단서를 준다.[@istqb-ctfl-syllabus-2024]

같은 강의계획서에 따르면 동적 테스트 중에 낸 결함 보고서에는 대개 다음이 들어간다.[@istqb-ctfl-syllabus-2024]

- 고유 식별자
- 제목과 짧은 요약
- 이상을 본 날짜, 보고한 조직, 작성자와 그 역할
- 테스트 대상과 테스트 환경
- 결함의 맥락(실행한 테스트 케이스, 테스트 활동, 개발 단계, 쓴 기법·체크리스트·테스트 데이터 등)
- 재현 단계와 로그·스크린숏 같은 근거를 담은 failure의 설명
- 기대 결과와 실제 결과
- 심각도
- 고칠 우선순위
- 상태
- 참조(이 결함을 드러낸 테스트 케이스 등)[@istqb-ctfl-syllabus-2024]

ISO/IEC/IEEE 24765:2017은 이슈 추적 시스템의 이슈 기록이 식별자와 짧은 설명을 담고, 흔히 환경, 상태, 심각도, 우선순위, 해결을 함께 적는다고 둔다.[@iso-iec-ieee-24765-obp-2017]

[[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-2:2021은 **사건**(incident)을 프로젝트, 제품, 서비스, 시스템의 생명주기 어느 때든 일어나는 이상하거나 예상하지 못한 사건이나 조건으로 정의하고, **사건 보고서**(incident report)를 사건의 발생, 성질, 상태를 적은 문서로 정의하고, 이를 이상 보고서, 버그 보고서, 결함 보고서, 문제 보고서 같은 이름으로도 부른다고 둔다. 같은 표준의 프로세스 모델에서는 테스트 사건 보고 프로세스가 사건 보고를 맡는다.[@iso-iec-ieee-29119-2-obp-2021] 이 모델은 [[test-process|테스트 프로세스]]에서 다룬다.

CTFL 강의계획서에 따르면 보고된 이상은 실제 결함일 수도 있고, 거짓 양성 결과나 변경 요청 같은 다른 것일 수도 있으며, 어느 쪽인지는 결함 보고서를 처리하면서 가린다.[@istqb-ctfl-syllabus-2024] ISTQB 용어집은 테스트 대상에 실제로 없는 결함이 보고된 테스트 결과를 **거짓 양성 결과**(false-positive result)라 부른다.[@istqb-glossary-false-positive-result-2026]

## 결함의 처리 흐름

CTFL 강의계획서에 따르면 결함 관리 프로세스는 적어도 이상 하나하나를 발견부터 종료까지 다루는 워크플로와 분류 규칙을 담는다. 워크플로는 대개 보고된 이상을 기록하고, 분석하고 분류하고, 고칠지 그대로 둘지 대응을 정하고, 결함 보고서를 닫는 활동으로 이루어진다. 강의계획서는 결함 상태의 예로 open, deferred, duplicate, waiting to be fixed, awaiting confirmation testing, re-opened, closed, rejected를 든다.[@istqb-ctfl-syllabus-2024]

ISTQB 용어집에 따르면 결함을 고친 뒤에는 확인 테스트로 그 결함이 일으킨 failure가 다시 일어나지 않는지 본다.[@istqb-glossary-confirmation-testing-2026]

## 분류 속성

IEEE 1044-2009는 소프트웨어 이상이 생명주기의 언제 생기거나 드러나든 그것을 한 가지 방식으로 분류하는 방법을 정했다. failure와 결함을 분류하는 핵심 속성의 집합을 두되, 응용이나 업무마다 고유한 속성이 따로 있을 수 있음을 인정하고, 생명주기에 맞춰 속성 값을 어느 정도 고쳐 쓰리라 보았다. 분류 데이터는 결함 원인 분석, 프로젝트 관리, 그리고 결함이 들어갈 가능성을 줄이거나 일찍 찾을 가능성을 높이는 소프트웨어 프로세스 개선에 쓸 수 있는 것으로 두었다.[@ieee-1044-2009] IEEE SA는 IEEE 1044-2009를 2020년 3월에 비활성(Inactive-Reserved) 표준으로 돌렸다.[@ieee-1044-status-2026]

## 심각도와 우선순위

- **심각도**(severity): ISTQB 용어집은 결함이 컴포넌트나 시스템의 개발, 테스트, 운용에 주는 영향의 정도를 심각도라 부른다.[@istqb-glossary-severity-2026]
- **우선순위**(priority): ISTQB 용어집은 특정 기준에 따라 작업에 매긴 중요도의 수준을 우선순위라 부른다.[@istqb-glossary-priority-2026]

CTFL 강의계획서에 따르면 결함 보고서의 심각도는 이해관계자의 이익이나 요구사항에 미치는 영향의 정도다.[@istqb-ctfl-syllabus-2024]

## 늦게 찾을수록 커지는 비용

NIST 보고서에 따르면 결함은 늦게 찾을수록 고치는 비용이 커지고, 어느 단계에서 들어갔든 뒤 단계에서 고칠수록 비용이 크다. NIST가 2002년 펴낸 Planning Report 02-3은 요구사항 수집·분석과 아키텍처 설계 단계에서 들어간 결함을 고치는 상대 비용을 그 단계에서 1, 코딩과 유닛 테스트 단계에서 5, 통합·컴포넌트·시스템 테스트 단계에서 10, 초기 고객 피드백과 베타 테스트 단계에서 15, 출시 뒤 30으로 예시한다.[@nist-planning-report-02-3-2002]

![[diagrams/nist-defect-fix-relative-cost.svg]]

Boehm과 Basili는 2001년 글에서, 인도한 뒤에 소프트웨어 문제를 찾아 고치는 비용이 요구사항이나 설계 단계에서 찾아 고치는 비용의 100배가 되는 일이 흔하다고 적었다. 작은 비핵심 시스템에서는 그 비율이 100:1보다 5:1에 가깝다고 덧붙였다.[@boehm-defect-reduction-2001] 결함을 일찍 찾는 shift left는 [[v-model|V 모델]]에서 다룬다.

품질 보증 활동은 결함을 다루는 방식에 따라 세 갈래로 나뉜다.[@tian-quality-assurance-alternatives-2001]

- **결함 예방**(defect prevention): 오류를 없애 결함이 들어가지 않게 한다.
- **결함 감소**(defect reduction): 들어간 fault를 찾아 없앤다.
- **결함 봉쇄**(defect containment): fault와 failure의 인과를 끊어, 국소적인 fault가 전역적인 failure로 번지지 않게 한다.[@tian-quality-assurance-alternatives-2001]

![[diagrams/defect-prevention-reduction-containment.svg]]

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

프로세스 목록은 [[automotive-spice-process-reference-model|ASPICE 프로세스 참조 모델]]에서, 변경 요청 관리(SUP.10)는 [[configuration-management|형상 관리]]에서 다룬다.

ASPICE 3.1은 SUP.9에 BP를 아홉 두었다. 그 가운데 문제 해결 관리 전략 수립(BP1), 문제 상태 기록(BP3), 문제 경향 분석(BP9)이 있었고, 상태를 보고하는 BP는 없었다. ASPICE 4.1은 상태 보고를 BP7로 둔다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017] SUP.9의 BP는 ASPICE 4.0에서 일곱이 되었다.[@vda-automotive-spice-pam-4-0-2023]

## 결함 관리 도구

CTFL 강의계획서에 따르면 결함 관리 도구를 쓰면 식별자, 날짜, 작성자, 처음 상태 같은 보고서 데이터 일부가 저절로 채워지기도 한다.[@istqb-ctfl-syllabus-2024] 이슈 추적 도구로는 Redmine과 Jira가 있다.[@redmine-home-2026][@atlassian-jira-bug-tracking-2026]
