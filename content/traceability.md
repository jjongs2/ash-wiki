---
title: 추적성
tags:
  - sw-engineering/sw-process
verified: 2026-10-02
---

ISO/IEC/IEEE 24765 용어집은 **추적성**(traceability)을 요구사항, 시스템 요소, 검증, 작업 같은 논리적 실체 둘 이상, 특히 서로 앞뒤 관계에 있는 실체 사이에 관계를 세울 수 있는 정도로 정의한다. 요구사항 추적성은 요구사항과 그에 관련된 요구사항, 구현, 검증 사이의 식별 가능한 연관으로 정의한다.[@ieee-cs-sevocab-2026] [[iso-iec-ieee-29148|ISO/IEC/IEEE 29148]]:2018은 요구사항 추적성을, 요구사항 집합 안에서 요구사항이 위로 어디서 도출되었고 아래로 어디에 할당·전개되는지를 식별하고 문서화하는 것으로 정의한다.[@iso-iec-ieee-29148-obp-2018]

## 양방향 추적성

ISO/IEC/IEEE 24765 용어집은 **양방향 추적성**(bidirectional traceability)을 둘 이상의 논리적 실체 사이의 연관을 어느 쪽에서든, 곧 그 실체로 향하는 쪽에서도 그 실체에서 나가는 쪽에서도 알아볼 수 있는 것으로 정의한다.[@ieee-cs-sevocab-2026]

소프트웨어 요구사항은 backward 방향으로는 시스템 요구사항이나 표준 문서 같은 원천 문서로 거슬러 추적하고, forward 방향으로는 설계 요소, 요구사항 기반 [[test-case|테스트 케이스]], 구현한 기능을 설명하는 사용자 매뉴얼의 절로 추적할 수 있다. 테스트 스크립트를 그에 딸린 요구사항과 설계에 잇는 링크는 backward 추적성의 예다.[@ieee-swebok-v4-0a-2026]

![[diagrams/requirements-backward-forward-traceability.svg]]

[[automotive-spice|ASPICE]] 4.1은 산출물 사이에 다음과 같은 연결을 요구한다. 표의 행은 모두 SYS(시스템 엔지니어링)·SWE(소프트웨어 엔지니어링) 프로세스와 VAL.1(Validation)의 "Ensure consistency and establish bidirectional traceability" BP(base practice), 변경 요청 관리(SUP.10)의 "Establish bidirectional traceability" BP에 들어 있다. 이름이 같은 BP라도 요구는 연결마다 달라, 검증 결과와 확인 결과에는 일관성은 빼고 양방향 추적성만 요구하고, [[software-unit-design|소프트웨어 상세 설계]]와 소프트웨어 요구사항 사이에는 양방향이라 하지 않고 일관성과 추적성을 요구한다.[@vda-automotive-spice-pam-4-1-2026]

| 산출물                                         | 상대                                      | 요구                  |
| ---------------------------------------------- | ----------------------------------------- | --------------------- |
| 시스템 요구사항                                | 이해관계자 요구사항                       | 일관성, 양방향 추적성 |
| [[system-architecture\|시스템 아키텍처]] 요소  | 시스템 요구사항                           | 일관성, 양방향 추적성 |
| 소프트웨어 요구사항                            | 시스템 요구사항, 시스템 아키텍처          | 일관성, 양방향 추적성 |
| [[software-architecture\|소프트웨어 아키텍처]] | 소프트웨어 요구사항                       | 일관성, 양방향 추적성 |
| 소프트웨어 상세 설계                           | 소프트웨어 아키텍처                       | 일관성, 양방향 추적성 |
| 소프트웨어 상세 설계                           | 소프트웨어 요구사항                       | 일관성, 추적성        |
| 소프트웨어 유닛                                | 소프트웨어 상세 설계                      | 일관성, 양방향 추적성 |
| 검증 수단                                      | 검증 대상(요구사항, 아키텍처, 설계, 유닛) | 일관성, 양방향 추적성 |
| 검증 결과                                      | 검증 수단                                 | 양방향 추적성         |
| 확인 수단(해당할 때)                           | 이해관계자 요구사항                       | 일관성, 양방향 추적성 |
| 확인 결과                                      | 확인 수단                                 | 양방향 추적성         |
| 변경 요청                                      | 영향받는 작업 산출물, 문제 보고           | 양방향 추적성         |

![[diagrams/aspice-traceability-work-products.svg]]

법규나 형식 승인 요구사항에서 도출된 확인 수단에는 단방향 추적성으로 충분하다.[@vda-automotive-spice-pam-4-1-2026] 변경 요청은 [[configuration-management#변경 통제|형상 관리]]에서 다룬다.

SYS.2(System Requirements Analysis), SWE.1(Software Requirements Analysis), SWE.2(Software Architectural Design)의 추적성 BP 주석은 하위 산출물이 추적하지 않는 상위의 비기능 요구사항이 있을 수 있다고 하고, 그 예로 프로세스 요구사항을 들며(SWE.1은 인시던트 처리처럼 뒤 소프트웨어 제품 생명주기 단계에 걸린 요구사항도 든다), 그런 요구사항도 검증 대상이라고 제시한다. SWE.1의 주석은 중복 추적을 의도하지 않는다고 하고, SWE.3(Software Detailed Design and Unit Construction)의 주석은 세 추적 경로를 조합해 중복을 피하라고 제시한다. SWE.3의 주석은 상세 설계의 소프트웨어 유닛을 소프트웨어 요구사항에 바로 추적하는 경우의 예로 통신 매트릭스와, [[autosar|AUTOSAR]] 설정에 든 진단 식별자 목록을 든다.[@vda-automotive-spice-pam-4-1-2026]

## Vertical 추적성과 horizontal 추적성

추적성은 링크로 잇는 산출물이 같은 추상화 수준에 있는지에 따라 나누기도 한다. 같은 수준의 산출물을 잇는 것(예: 요구사항끼리)을 **horizontal 추적성**(horizontal traceability), 다른 수준의 산출물을 잇는 것(예: 요구사항에서 설계로)을 **vertical 추적성**(vertical traceability)이라 부른다.[@tian-traceability-maintenance-2021]

## Pre-RS 추적성과 post-RS 추적성

Gotel과 Finkelstein은 1994년 논문에서 요구사항 추적성을, 요구사항이 요구사항 명세에 들어가기 전의 일을 다루는 **pre-RS 추적성**(pre-requirements specification traceability)과, 명세에 들어간 뒤에 생기는 일을 다루는 **post-RS 추적성**(post-requirements specification traceability)으로 나누었다. 이들은 100명이 넘는 실무자를 조사해, 낮은 요구사항 추적성 탓으로 돌려지던 문제 대부분이 pre-RS 추적성이 없거나 모자란 데서 온다고 보고했다.[@gotel-requirements-traceability-1994]

## 일관성

ISO/IEC/IEEE 24765 용어집은 **일관성**(consistency)을 문서들 사이, 또는 시스템이나 구성요소의 부분들 사이에 균일하고 표준화되어 있으며 서로 모순이 없는 정도로 정의한다.[@ieee-cs-sevocab-2026]

ASPICE 4.1은 추적성과 함께 일관성을 요구하며, 일관성은 [[automotive-spice-process-reference-model#프로세스 범주와 그룹|MAN.3]]과 SYS·SWE·HWE 프로세스의 추적성·일관성 BP대로 갖추게 한다. 링크가 있다는 것 같은 추적성만으로는 정보가 일관됨을 뜻하지 않는다고 하고, 일관성 증거([[automotive-spice-process-assessment-model#프로세스 수행 지표|정보 항목]] 13-51)를 관련 산출물을 따라 정보가 의미상 맞는다는 증거로 정한다. 일관성 증거에는 하이퍼링크, 저장소 위치, 편집상 참조 같은 추적 정보와 명명 규칙이 든다.[@vda-automotive-spice-pam-4-1-2026]

ASPICE 3.1은 추적성과 일관성을 서로 다른 두 BP로 두고, 추적성을 산출물 사이에 참조나 링크가 있는 것으로, 일관성을 내용과 의미의 문제로 정의했다. 4.1은 둘을 한 BP로 묶고, 연결마다 둘 가운데 무엇을 요구할지 그 BP 안에서 정한다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

일관성은 개발 산출물 사이에만 걸리지 않는다. ASPICE 4.1은 MAN.3에서 프로젝트의 추정, 자원, 기술, 작업 패키지와 그 의존성, 일정, 계획, 인터페이스, 약속을 정기적으로 조정해 작업 범위와 일관되게 하라고 요구한다.[@vda-automotive-spice-pam-4-1-2026]

소프트웨어 품질 계획의 품질 활동과 작업은 비용, 자원 요구, 목표, 일정과 함께 소프트웨어 공학 관리 계획, 개발 계획, 유지보수 계획에 명시된다. SWEBOK V4.0a는 품질 계획이 형상 관리 계획이나 그 밖의 프로젝트 계획 산출물과 어긋나지 않기를 권한다.[@ieee-swebok-v4-0a-2026]

## 쓸모

ASPICE 3.1은 추적성이 돕는 일로 [[test-coverage|커버리지]], [[configuration-management#변경 통제|영향 분석]], 요구사항 구현 상태의 추적을 들었다. ASPICE 4.1은 추적성 BP의 주석에서 양방향 추적성이 일관성을 뒷받침하고, 변경 요청의 영향 분석과 커버리지 입증을 쉽게 한다고 둔다.[@vda-automotive-spice-pam-4-1-2026][@vda-automotive-spice-pam-3-1-2017]

추적성으로 요구사항마다 그것을 만족시킬 설계 요소가 있는지, 설계 요소마다 그것을 있게 한 요구사항이 있는지 따질 수 있다. 제안된 요구사항 변경의 영향을 분석할 때는 바뀌는 시스템 요구사항에서 링크된 소프트웨어 요구사항으로, 그 가운데 영향받는 것에서 설계 요소로, 다시 코드와 테스트 케이스로 링크를 따라가며, 이는 변경을 반영하는 데 드는 작업량의 footprint를 정하는 데 도움이 된다.[@ieee-swebok-v4-0a-2026] 테스트 케이스와 요구사항 사이의 추적성으로 요구사항이 테스트 케이스로 다뤄졌는지 확인할 수 있다.[@istqb-ctfl-syllabus-2024]

## 추적표

ISO/IEC/IEEE 29148:2018은 **요구사항 추적표**(requirements traceability matrix, RTM)를 요구사항을 상위 요구사항이나 요구(needs), 또는 하위 구현과 잇는 구조화된 정보 산출물로 정의한다.[@iso-iec-ieee-29148-obp-2018]

ISO/IEC/IEEE 24765 용어집은 추적표(traceability matrix)를 개발 과정의 산출물 둘 이상 사이의 관계를 기록하는 행렬로 정의하고, 한 소프트웨어 구성요소의 요구사항과 설계 사이의 관계를 기록하는 행렬을 예로 든다. 요구사항 추적 도구는 항목별 [[software-requirements-specification|소프트웨어 요구사항 명세]], 설계 요소, 코드 요소, 테스트 케이스 사이에 추적성을 세우는 개발 도구로 정의하고, 관련 질의, 분석, 보고서 생성도 지원한다고 둔다.[@ieee-cs-sevocab-2026]

요구사항 관리 도구는 요구사항 속성 저장, 추적, 문서 생성, 변경 통제를 지원한다. SWEBOK V4.0a에 따르면 추적과 변경 통제는 도구의 지원이 있어야 실용적일 수 있다.[@ieee-swebok-v4-0a-2026]
