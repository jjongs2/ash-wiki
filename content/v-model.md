---
title: V 모델
tags:
  - sw-engineering/sw-process
verified: 2026-10-02
---

**V 모델**은 개발 단계와 그에 대응하는 테스트 단계를 하나씩 짝지은 개발 생명주기 모델이다.[@istqb-glossary-v-model-2026][@weit-v-modell-xt-2-4-2024] ISTQB 용어집은 V 모델을 순차 개발 생명주기 모델로 분류한다.[@istqb-glossary-v-model-2026]

## 왼쪽과 오른쪽의 대응

[[v-modell-xt|V-Modell XT]] 2.4는 V자 절차의 내려가는 가지에서 시스템을 명세하며 분해하고, 올라가는 가지에서 구현하며 통합하며, 수평 단계마다 [[verification-and-validation|검증과 확인]]을 둔다. 시험 명세는 내려가는 가지에서 같은 수평 단계의 요구사항, 명세, 아키텍처로부터 만들고, 시험 기록은 올라가는 가지에서 남긴다.[@weit-v-modell-xt-2-4-2024]

V의 가장 아래 단계에서는 [[automotive-spice-process-reference-model#Element, component, unit|유닛]]을 구현한다.[@weit-v-modell-xt-2-4-2024][@vda-automotive-spice-pam-4-1-2026]

## 테스트 기준

**테스트 기준**(test basis)은 테스트 분석과 테스트 설계의 바탕이 되는 지식의 총체다.[@istqb-glossary-test-basis-2026] V 모델에서는 오른쪽 단계의 검증을 같은 수평 단계에 있는 왼쪽 단계의 산출물, 곧 요구사항, 아키텍처, 설계를 바탕으로 명세한다.[@weit-v-modell-xt-2-4-2024][@vda-automotive-spice-pam-4-1-2026] [[automotive-spice|ASPICE]] 4.1은 시스템 통합과 소프트웨어 통합의 검증 조치를 각각 시스템 아키텍처와 [[software-architecture|소프트웨어 아키텍처]]의 정적·동적 측면에 맞춰 정하게 한다.[@vda-automotive-spice-pam-4-1-2026]

## 테스트 프로세스

V 모델이 개발 단계마다 짝짓는 [[software-testing#테스트 레벨|테스트 레벨]] 하나하나를 ISTQB 용어집은 [[test-process|테스트 프로세스]]의 한 인스턴스로 정의한다.[@istqb-glossary-v-model-2026][@istqb-glossary-test-level-2026]

## 테스트 설계를 앞당김

V 모델에서는 테스트 설계를 코딩이 끝난 뒤가 아니라 대응하는 개발 단계에서 시작한다.[@weit-v-modell-xt-2-4-2024][@istqb-ctfl-syllabus-2024] ISTQB CTFL v4.0.1 강의계획서는 이를 개발 생명주기 모델과 상관없이 지킬 좋은 관행으로 권한다. 순차 모델에서는 초기 단계에 테스터가 요구 검토, 테스트 분석, 설계에 참여한다.[@istqb-ctfl-syllabus-2024]

테스트와 [[software-quality#품질 보증|품질 보증]] 활동을 [[software-development-life-cycle|SDLC]]에서 가능한 한 일찍 수행하는 테스트 접근법을 **shift left**라 부른다.[@istqb-glossary-shift-left-2026] CTFL 강의계획서에 따르면 일찍 테스트하면 시간과 비용이 주는데, 일찍 없앤 결함은 뒤 산출물에 결함을 낳지 않고 뒤에 생기는 장애(failure)가 줄어 품질 비용이 주기 때문이다.[@istqb-ctfl-syllabus-2024]

## 기원

Barry Boehm은 1979년 글에서 소프트웨어 생명주기 전체에 걸친 검증과 확인 활동의 맥락을 보이는 "V-chart"를 내놓고, 그 출처로 System Development Corporation의 J. B. Munson과 1977년에 나눈 개인 교신을 들었다.[@boehm-guidelines-verifying-validating-1979]

V-Modell XT는 V자 모양의 개발 절차를 내용의 바탕으로 삼았고 이름도 거기서 땄다. 이 절차는 Boehm이 1970년대 말에 처음 기술했다고 본다.[@weit-v-modell-xt-2-4-2024] [[v-modell-xt#개정 이력|V-Modell XT]]에 앞서 독일 연방정부의 V-Modell이 1992년에 나왔고 V-Modell 97이 그 뒤를 이었다.[@bmds-v-modell-xt-2026]

Forsberg와 Mooz는 1991년 논문에서 시스템 공학이 프로젝트에서 맡는 역할을 밝히려고 프로젝트 주기의 기술적 측면을 V 모양 그림으로 나타냈다.[@forsberg-relationship-system-engineering-1991]

V 모델은 [[waterfall-model|폭포수 모델]]에서 나온 여러 변형과 확장의 한 예다.[@ieee-swebok-v4-0a-2026]

## 반복 적용

V-Modell XT 2.4는 V를 반복마다 여러 번 거쳐 기능을 점진적으로 늘린다.[@weit-v-modell-xt-2-4-2024] 점진 개발 전략과 prototype 개발 전략은 [[v-modell-xt#개발 전략|V-Modell XT]]에서 다룬다.

ASPICE 4.1의 [[automotive-spice-process-reference-model|프로세스 참조 모델]]과 [[automotive-spice-process-assessment-model|프로세스 평가 모델]]은 생명주기 모델이 아니어서 프로세스나 BP(base practice)를 수행할 순서를 정하지도 막지도 않고, 프로젝트 생명주기는 [[automotive-spice-process-reference-model#관리와 공급 프로세스의 BP|MAN.3.BP2]]에 따라 프로젝트가 정하게 둔다.[@vda-automotive-spice-pam-4-1-2026]

## ASPICE의 V 컨셉

프로세스 참조 모델은 시스템 엔지니어링 프로세스와 소프트웨어 엔지니어링 프로세스를 각각 V 모양으로 배치해, 왼쪽의 요구사항 분석과 설계 프로세스가 오른쪽의 검증 프로세스와 짝을 이뤄 마주 보게 한다. 마주 보는 짝마다 오른쪽의 검증 조치와 왼쪽 산출물 사이에 [[traceability#일관성|일관성]]과 [[traceability#양방향 추적성|양방향 추적성]]을 요구한다.[@vda-automotive-spice-pam-4-1-2026] 프로세스마다의 ID와 이름은 프로세스 참조 모델의 [[automotive-spice-process-reference-model#프로세스 범주와 그룹|프로세스 범주와 그룹]]에서 다룬다.

![[diagrams/automotive-spice-v-concept.svg]]
