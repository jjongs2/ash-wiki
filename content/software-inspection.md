---
title: 소프트웨어 인스펙션
tags:
  - process/sw-testing
aliases:
  - 인스펙션
  - Fagan inspection
verified: 2026-10-03
---

**소프트웨어 인스펙션**(software inspection)은 정해진 팀 역할과 측정을 써서 작업 산출물의 결함을 찾는 공식 리뷰다. ISTQB 용어집은 인스펙션을 이런 방법으로 작업 산출물의 결함을 찾고, 리뷰 프로세스와 개발 프로세스를 개선하는 공식 리뷰로 정의한다.[@istqb-glossary-inspection-2026] ISO/IEC/IEEE 24765 용어집은 인스펙션을 개발 산출물을 눈으로 살펴 오류, 개발 표준 위반 같은 문제를 찾는 [[static-analysis|정적 분석]] 기법으로 정의한다.[@ieee-cs-sevocab-2026]

인스펙션은 [[software-review|소프트웨어 리뷰]]의 한 유형이다.[@istqb-glossary-inspection-2026]

## Fagan 인스펙션

IBM의 Michael Fagan은 프로그램 개발에 인스펙션을 처음 썼다. 그는 1976년 IBM Systems Journal 논문 "Design and code inspections to reduce errors in program development"에서 설계 인스펙션과 코드 인스펙션의 절차와 역할을 기술했고, 이 논문은 1999년 같은 학술지에 다시 실렸다.[@fagan-design-code-inspections-1999] Fagan은 1986년 논문에서 IBM이 1972년 뉴욕주 Kingston에서 소프트웨어 인스펙션 프로세스를 만들었다고 적었다.[@fagan-advances-software-inspections-1986]

### 절차

Fagan은 1976년 논문에서 인스펙션을 다섯 작업으로 나누고, 작업마다 목적을 하나씩 두었다.[@fagan-design-code-inspections-1999]

1. 개요(overview): 설계자가 다룰 영역 전체를 설명한 뒤 자기가 설계한 부분을 자세히 설명하고, 설계 문서를 나눠 준다. 코드 인스펙션에서는 개요를 두지 않는다.
2. 준비(preparation): 참여자가 각자 설계 문서를 읽고 설계의 의도와 논리를 이해한다.
3. 인스펙션(inspection): 팀 전체가 모이고, 진행자가 고른 reader(대개 구현자)가 설계를 풀어 설명한다. 목적은 오류를 찾는 것이고, 해결책은 찾지 않는다.
4. 재작업(rework): 인스펙션 보고서에 적힌 오류와 문제를 설계자나 구현자가 고친다.
5. 후속 조치(follow-up): 진행자가 모든 문제가 해결됐는지 확인한다. 대상의 5%가 넘게 재작업됐으면 팀이 다시 모여 전체를 다시 인스펙션한다.[@fagan-design-code-inspections-1999]

Fagan은 1986년 논문에서 개요 앞에 계획(planning)을 더해 여섯 작업으로 기술했다. 계획에서는 대상이 인스펙션 진입 기준을 충족하는지 보고, 참여자와 회의 장소를 마련한다.[@fagan-advances-software-inspections-1986]

![[diagrams/fagan-inspection-operations.svg]]

### 역할

Fagan은 1976년 논문에서 진행자(moderator), 설계자(designer), 구현자(coder/implementor), 테스터(tester)의 네 역할을 두고, 네 명을 알맞은 팀 크기로 보았다. 사정에 따라 달라질 수 있지만 일부러 넷보다 늘리지는 않는다. 진행자는 객관성을 위해 관련 없는 프로젝트에서 데려오는 편이 대개 낫고, 가장 좋은 결과를 내려면 특별히 훈련받아야 한다.[@fagan-design-code-inspections-1999] 1986년 논문에서도 진행자는 특별한 훈련을 받아야 하고, 이상적으로는 대상의 개발에 관여하지 않은 비슷한 다른 프로젝트의 사람이어야 한다고 했다.[@fagan-advances-software-inspections-1986]

## 기준과 측정

Fagan의 인스펙션은 개발 작업마다 정한 종료 기준을 그 작업의 산출물이 충족하는지 확인한다.[@fagan-design-code-inspections-1999] 1986년 논문에서는 계획 단계에서 대상이 진입 기준을 충족하는지도 본다.[@fagan-advances-software-inspections-1986]

Fagan의 인스펙션은 찾은 오류를 유형과 심각도로 나누고, 들인 사람과 시간을 기록하며, 그 결과를 분석해 프로세스 개선에 쓴다.[@fagan-design-code-inspections-1999] ISTQB 용어집과 ISO/IEC/IEEE 24765 용어집도 인스펙션이 측정 결과를 써서 리뷰 프로세스를 개선한다고 정의한다.[@istqb-glossary-inspection-2026][@ieee-cs-sevocab-2026]

## 결함 발견 효과

Fagan은 1976년 논문에서 IBM 대형 운영체제 구성요소의 일부를 표본으로, 설계 인스펙션과 코드 인스펙션을 더하자 코딩 작업의 생산성이 23% 올랐다고 보고했다. 같은 연구에서 인스펙션 표본은 워크스루를 쓴 비교 표본보다, 단위 테스트 뒤 7개월 동안의 테스트에서 오류가 38% 적었다.[@fagan-design-code-inspections-1999]

Fagan은 1986년 논문에서 인스펙션이 대개 기계 테스트보다 더 많은 결함을 더 적은 비용으로 찾는다고 했다. 결함을 고치는 비용이 테스트나 유지보수 때보다 10배에서 100배 적은 초기 단계에서 결함을 찾아 고치는 편이 유리하다고도 했다.[@fagan-advances-software-inspections-1986]

## 워크스루와의 차이

ISTQB 용어집은 워크스루를 저자가 리뷰 참여자를 이끌며 작업 산출물을 함께 짚고, 참여자가 질문하고 의견을 내는 리뷰로 정의한다.[@istqb-glossary-walkthrough-2026] ISO/IEC/IEEE 24765 용어집은 인스펙션을, 인스펙션 기법을 훈련받은 공정한 진행자가 이끄는 동료 리뷰로 둔다.[@ieee-cs-sevocab-2026] ISTQB CTFL 강의계획서에 따르면 인스펙션에서는 저자가 리뷰 리더나 기록자를 맡을 수 없다.[@istqb-ctfl-syllabus-2024]

Fagan은 1976년 논문에서 두 방법을 견주었다. 인스펙션은 훈련받은 진행자가 이끌고 역할이 정해져 있지만, 워크스루는 대상의 저자(설계자나 구현자)가 이끌고 진행자 훈련도 정해진 역할도 없다. 워크스루 회의는 교육, 설계 대안 논의, 오류 찾기를 함께 하지만, 인스펙션 회의는 오류 찾기만을 목적으로 둔다.[@fagan-design-code-inspections-1999]
