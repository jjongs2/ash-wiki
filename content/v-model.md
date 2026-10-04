---
title: V 모델
tags:
  - process/sw-process
verified: 2026-10-02
---

**V 모델**(V-model)은 개발 단계와 그에 대응하는 테스트 단계를 하나씩 짝지은 개발 생명주기 모델이다.[@istqb-glossary-v-model-2026][@weit-v-modell-xt-2-4-2024] ISTQB 용어집은 V 모델을 순차 개발 생명주기 모델로 분류한다.[@istqb-glossary-v-model-2026]

## 왼쪽과 오른쪽의 대응

V-Modell XT 2.4는 V자 절차의 내려가는 가지에서 시스템을 명세하며 분해하고, 올라가는 가지에서 구현하며 통합하며, 수평 단계마다 검증과 확인을 둔다. 시험 명세는 내려가는 가지에서 같은 수평 단계의 요구사항, 명세, 아키텍처로부터 만들고, 시험 기록은 올라가는 가지에서 남긴다.[@weit-v-modell-xt-2-4-2024]

## 테스트 기준

ISTQB 용어집은 **테스트 기준**(test basis)을 테스트 분석과 테스트 설계의 바탕이 되는 지식의 총체로 정의한다.[@istqb-glossary-test-basis-2026] Automotive SPICE 4.1은 시스템 통합과 소프트웨어 통합의 검증 조치를 각각 시스템 아키텍처와 소프트웨어 아키텍처의 정적·동적 측면에 맞춰 정하게 한다.[@vda-automotive-spice-pam-4-1-2026]

## 테스트 프로세스

ISTQB 용어집에 따르면 V 모델이 개발 단계마다 짝짓는 테스트 레벨은 각각 [[test-process|테스트 프로세스]]의 한 인스턴스다.[@istqb-glossary-v-model-2026][@istqb-glossary-test-level-2026]

## 테스트 설계를 앞당김

V 모델에서는 테스트 설계를 코딩이 끝난 뒤가 아니라 대응하는 개발 단계에서 시작한다.[@weit-v-modell-xt-2-4-2024][@istqb-ctfl-syllabus-2024] ISTQB CTFL 강의계획서는 이를 개발 생명주기 모델과 상관없이 지킬 좋은 관행으로 권한다. 이 강의계획서에 따르면 순차 모델에서는 초기 단계에 테스터가 요구 검토, 테스트 분석, 설계에 참여한다.[@istqb-ctfl-syllabus-2024]

ISTQB 용어집은 테스트와 품질 보증 활동을 [[software-development-life-cycle|SDLC]]에서 가능한 한 일찍 수행하는 테스트 접근법을 shift left라 부른다.[@istqb-glossary-shift-left-2026] CTFL 강의계획서에 따르면 일찍 테스트하면 시간과 비용이 준다. 일찍 없앤 결함은 뒤 산출물에 결함을 낳지 않고, 뒤에 생기는 실패가 줄어 품질 비용이 준다.[@istqb-ctfl-syllabus-2024]

## 기원

V-Modell XT는 V자 모양의 개발 절차를 내용의 바탕으로 삼았고 이름도 거기서 땄다.[@weit-v-modell-xt-2-4-2024] 독일 연방정부의 V-Modell은 1992년 처음 발표되어 국방 기술 분야에서 쓰였다. 후속판 V-Modell 97은 연방 행정의 소프트웨어 개발에 쓰도록 지정되었고, 2005년 2월부터는 V-Modell XT가 쓰인다.[@bmds-v-modell-xt-2026]

## 반복 적용

V-Modell XT 2.4는 V를 한 번이 아니라 반복마다 여러 번 거치게 하여 기능을 점진적으로 늘리고, 점진 개발 전략과 프로토타입 개발 전략마다 V를 거치는 순서를 달리 둔다.[@weit-v-modell-xt-2-4-2024]

Automotive SPICE 4.1의 프로세스 참조 모델과 프로세스 평가 모델은 생명주기 모델이 아니어서 프로세스나 BP(base practice)를 수행할 순서를 정하지도 막지도 않고, 프로젝트 생명주기는 MAN.3.BP2에 따라 프로젝트가 정하게 둔다.[@vda-automotive-spice-pam-4-1-2026]

## Automotive SPICE의 V 컨셉

Automotive SPICE 4.1의 프로세스 참조 모델은 시스템 엔지니어링 프로세스와 소프트웨어 엔지니어링 프로세스를 각각 V 모양으로 배치한다. 시스템 V에서는 SYS.2 System Requirements Analysis와 SYS.5 System Verification, SYS.3 System Architectural Design과 SYS.4 System Integration and Integration Verification이 마주 본다. 소프트웨어 V에서는 SWE.1 Software Requirements Analysis와 SWE.6 Software Verification, SWE.2 Software Architectural Design과 SWE.5 Software Component Verification and Integration Verification이 마주 보고, 꼭짓점에는 SWE.3 Software Detailed Design and Unit Construction과 SWE.4 Software Unit Verification이 함께 놓인다. 마주 보는 짝마다 오른쪽의 검증 조치와 왼쪽 산출물 사이에 일관성과 양방향 추적성을 요구한다.[@vda-automotive-spice-pam-4-1-2026]

![[diagrams/automotive-spice-v-concept.svg]]
