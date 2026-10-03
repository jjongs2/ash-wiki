---
title: 사이버보안 생명주기
tags:
  - security/cybersecurity
verified: 2026-10-03
---

도로 차량 E/E(Electrical/Electronic) 시스템의 사이버보안은 개념부터 폐기까지 차량의 생명주기 전체에 걸쳐 다룬다.[@iso-sae-21434-obp-2021][@nhtsa-cybersecurity-best-practices-2022] ISO/SAE 21434:2021은 도로 차량 E/E 시스템과 그 컴포넌트, 인터페이스의 concept, product development, production, operation, maintenance, decommissioning에 걸친 사이버보안 리스크 관리의 엔지니어링 요구사항을 정한다.[@iso-sae-21434-obp-2021] UN R155는 차량 형식의 단계를 development phase, production phase, post-production phase로 나누어 정의하고, post-production phase를 차량 형식의 생산이 끝난 뒤부터 그 형식의 차량이 모두 운행을 마칠 때까지로 둔다.[@unece-r155-2021]

## ISO/SAE 21434의 단계

ISO/SAE 21434:2021은 9절부터 14절까지에 단계별 활동을 두고, 이를 세 단계로 묶는다. 이 묶음은 활동의 실행 순서를 정하지 않는다.[@iso-sae-21434-obp-2021]

- Concept 단계: 9절. Item definition, cybersecurity goals, cybersecurity concept이 든다.
- Product development 단계: 10절의 설계, 통합과 검증, 11절의 cybersecurity validation이 든다.
- Post-development 단계: 12절 production, 13절 operations and maintenance, 14절 end of cybersecurity support and decommissioning이 든다. 13절에는 cybersecurity incident response와 updates가 있다.[@iso-sae-21434-obp-2021]

8절과 15절은 이 단계들 밖에 둔다. 8절의 지속 활동은 cybersecurity monitoring, cybersecurity event evaluation, vulnerability analysis, vulnerability management로 이루어지며, 진행 중인 리스크 평가에 정보를 대고 사이버보안 지원이 끝날 때까지의 취약점 관리를 정한다. 15절은 TARA를 모듈식 분석·평가 방법으로 정한다.[@iso-sae-21434-obp-2021]

Tailoring과 out-of-context 컴포넌트처럼 프로젝트의 활동을 정하는 데 쓰는 개념은 [[cybersecurity-assessment|cybersecurity assessment]]에서 다룬다. ISO 26262의 아이템과 안전 생명주기는 [[safety-lifecycle|안전 생명주기]]에서 다룬다.

## 아이템과 운용 환경

ISO/SAE 21434:2021은 사이버보안 활동의 대상을 다음 용어로 정의한다.[@iso-sae-21434-obp-2021]

- **아이템**(item): 차량 수준의 기능을 구현하는 컴포넌트나 컴포넌트의 집합
- **컴포넌트**(component): 논리적·기술적으로 떼어 낼 수 있는 부분
- **운용 환경**(operational environment): 운용 중의 상호작용을 고려한 맥락. 아이템이나 컴포넌트의 운용에는 차량 기능, 생산, 서비스와 수리가 들 수 있다.[@iso-sae-21434-obp-2021]

## Cybersecurity incident와 대응

ISO/SAE 21434:2021은 **cybersecurity incident**를 취약점의 악용이 관련될 수 있는 현장의 상황으로 정의한다.[@iso-sae-21434-obp-2021]

NHTSA 지침은 제조사가 제품 사이버보안의 incident 대응 프로세스를 두기를 권한다. 이 프로세스에는 문서로 남긴 대응 계획, 조직 안의 역할과 책임, 조직 밖과의 연락 경로, 이 정보를 최신으로 유지하는 절차가 들고, 대응 프로세스의 효과를 재는 지표도 둔다.[@nhtsa-cybersecurity-best-practices-2022]

## 업데이트

ISO 24089:2023은 도로 차량의 소프트웨어 업데이트 엔지니어링에 대한 요구사항과 권고를 조직 수준과 프로젝트 수준에서 정한다.[@iso-24089-obp-2023] UN R156은 소프트웨어 업데이트와 SUMS(software update management system)를 다룬다.[@unece-r156-2021]
