---
title: 지속적 통합
tags:
  - sw-engineering
aliases:
  - CI
verified: 2026-10-03
---

**지속적 통합**(continuous integration, CI)은 개발자들의 변경을 공용 주 줄기(mainline)에 계속 합치고, 합칠 때마다 자동으로 빌드하고 테스트하는 개발 기법이다.[@ieee-cs-sevocab-2026][@istqb-glossary-continuous-integration-2026] CI를 하는 팀은 작업을 하루에도 여러 번 통합하고, 파이프라인이 통합마다 빌드하고 테스트해 오류를 찾아 빠르게 알려 준다. CI의 근본 목표는 문제가 있는 변경을 되도록 일찍 자동으로 잡는 것이다.[@ieee-swebok-v4-0a-2026]

## 기원

Kent Beck은 1999년 『Extreme Programming Explained: Embrace Change』에서 지속적 통합을 XP(Extreme Programming)의 실천 항목 가운데 하나로 두고, 하루에도 여러 번 통합하고 테스트하는 것으로 설명했다.[@beck-extreme-programming-explained-1999] Martin Fowler와 Matthew Foemmel은 2000년에 지속적 통합을 설명하는 글을 냈고[@fowler-continuous-integration-2000], Fowler는 2006년과 2024년에 이 글을 고쳐 썼다.[@fowler-continuous-integration-2024]

## 실천 항목

Fowler는 지속적 통합을, 팀원 각자가 적어도 하루에 한 번 변경을 공동 코드베이스에 합치고 통합마다 테스트를 포함한 자동 빌드로 확인해 통합 오류를 되도록 빨리 찾는 관행으로 정의하고, 지속적 통합에 익숙한 사람은 실제로 이보다 자주 통합한다고 본다. 2024년판 글에서 그가 드는 실천 항목은 다음과 같다.[@fowler-continuous-integration-2024]

- 모든 것을 [[version-control|버전 관리]]되는 주 줄기에 둔다.
- 빌드를 자동화한다.
- 빌드가 스스로 테스트하게 한다.
- 모든 개발자가 날마다 주 줄기에 push한다.
- 주 줄기에 push가 들어올 때마다 빌드한다.
- 깨진 빌드는 곧바로 고친다.
- 빌드를 빠르게 유지한다.
- 작업 중인 기능은 주 줄기에 합치되, 운영 환경에서 실행되지 않게 숨긴다.
- 운영 환경을 본뜬 환경에서 테스트한다.
- 누구나 진행 상황을 볼 수 있게 한다.
- 배포를 자동화한다.[@fowler-continuous-integration-2024]

Fowler는 브랜치에서 일하는 개발자가 주 줄기의 변경을 정기적으로 당겨 와 빌드하고 테스트해 자기 작업이 깨지지 않는지 확인하는 것을 **semi-integration**이라 부르고, 지속적 통합이 아니라고 본다. 그가 말하는 지속적 통합은 주 줄기로 완전히 통합하는 것이어서, 브랜치의 코드는 몇 시간 안에 주 줄기로 push되어야 한다. 그는 기능 브랜치(feature branch)에서 CI 서비스로 자동 빌드를 돌리는 것도 쓸모는 있지만 semi-integration일 뿐 지속적 통합이 아니라고 하고, 트렁크 기반 개발(trunk-based development)은 대체로 지속적 통합의 동의어로 본다.[@fowler-continuous-integration-2024]

![[diagrams/semi-integration-vs-continuous-integration.svg]]

## 파이프라인에 넣는 검사

지속적 통합에서는 서버에서 도는 도구가 소스 저장소를 지켜보다가, 저장소의 특정 브랜치나 영역에 변경이 커밋될 때마다 단계로 이은 파이프라인을 시작해 코드를 컴파일하고 링크한다. 여기에 [[static-analysis|정적 분석]]으로 [[coding-standard|코딩 표준]]을 확인하는 단계와, [[unit-testing|단위 테스트]]를 돌리고 코드 [[test-coverage|커버리지]]를 재는 단계를 함께 두는 일이 많다.[@ieee-swebok-v4-0a-2026] 지속적 통합에서는 자동화한 [[regression-testing|회귀 테스트]]도 함께 돌린다.[@ieee-swebok-v4-0a-2026][@istqb-ctfl-syllabus-2024]

![[diagrams/continuous-integration-pipeline.svg]]

Jenkins는 지속적 통합을 지원하는 자동화 엔진이다.[@jenkins-pipeline-2026]

## 지속적 전달·배포·테스트

- **지속적 전달**(continuous delivery): ISTQB 용어집은 코드 변경을 자동으로 빌드하고 테스트해 운영 환경 출시를 준비하는 자동화된 개발 절차로 정의한다.[@istqb-glossary-continuous-delivery-2026] ISO/IEC/IEEE 24765 용어집은 자동화 도구로 새 시스템을 스테이징이나 여러 테스트 환경에 자주 내보낼 수 있게 하는 실천으로 정의한다.[@ieee-cs-sevocab-2026] 자동 테스트와 품질 검사를 통과한 애플리케이션을 늘 운영 환경에 내보낼 수 있는 상태로 두는 실천을 지속적 전달이라 부른다. 지속적 전달은 운영 환경으로의 마지막 배포를 사람이 하는 단계로 남긴다는 점에서 지속적 배포와 갈린다.[@shahin-continuous-integration-delivery-deployment-2017]
- **지속적 배포**(continuous deployment): 정해진 테스트와 검증을 통과한 변경을 자동으로 운영 환경에 배포하는 절차다.[@ieee-cs-sevocab-2026][@istqb-glossary-continuous-deployment-2026]

![[diagrams/continuous-delivery-vs-deployment.svg]]

**지속적 테스트**(continuous testing)는 [[software-development-life-cycle|소프트웨어 개발 생명주기]]의 모든 단계에서 소프트웨어를 테스트하는 실천이다. 일찍 자주 테스트해 지속적 전달 과정의 단계마다 [[software-quality|소프트웨어 품질]]을 평가하는 것이 목표다.[@ieee-swebok-v4-0a-2026]

## 빅뱅 통합과의 대비

SWEBOK V4.0a에 따르면 점진적 통합은 프로그램을 작은 조각으로 나눠 작성하고 테스트한 뒤 조각을 하나씩 합치는 방식이다. 이 방식은 내보낼 부분이 모두 완성될 때까지 통합을 미루는 [[integration-testing#통합 전략|빅뱅 통합]]보다 오류의 위치를 찾기 쉬운 것으로 여겨진다.[@ieee-swebok-v4-0a-2026]
