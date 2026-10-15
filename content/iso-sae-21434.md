---
title: ISO/SAE 21434
tags:
  - security/cybersecurity
aliases:
  - ISO 21434
verified: 2026-10-03
publisher: ISO/SAE
edition: 2021
status: 개정 중
---

**ISO/SAE 21434**는 도로 차량의 [[cybersecurity|사이버보안]] 엔지니어링을 다루는 국제 표준이다. 제목은 "Road vehicles — Cybersecurity engineering"이고, ISO와 SAE International이 함께 만들었다.[@iso-sae-21434-2021] ISO/SAE 21434:2021은 ISO/TC 22/SC 32와 SAE의 Vehicle Cybersecurity Systems Engineering Committee가 함께 마련했다.[@iso-sae-21434-obp-2021] ISO 기사에 따르면 ISO/TC 22/SC 32 산하의 작업반 WG 11은 도로 차량 전기·전자 컴포넌트의 사이버보안을 다루고, 이 작업반의 프로젝트 리더들이 ISO/SAE 21434 개발에 참여했다.[@iso-cybersecurity-drivers-seat-2020]

## 범위

ISO/SAE 21434:2021은 도로 차량의 E/E(Electrical/Electronic) 시스템과 그 컴포넌트, 인터페이스에 대해, 개념, 제품 개발, 생산, 운용, 정비, 폐기에 걸친 사이버보안 리스크 관리의 엔지니어링 요구사항을 정한다. 양산 도로 차량의 E/E 시스템과 그 컴포넌트, 인터페이스 가운데 이 표준이 나온 뒤에 개발이나 변경을 시작한 것에 적용하고, 특정 사이버보안 기술이나 해결책은 정하지 않는다. 이 표준이 정하는 틀은 사이버보안 프로세스의 요구사항과, 사이버보안 리스크를 전하고 관리하는 공통 언어를 담는다.[@iso-sae-21434-obp-2021] (1 Scope)

이 표준은 공급망 전체가 함께 이해할 바탕으로 사이버보안 엔지니어링의 용어, 목표, 요구사항, 지침을 준다. 사이버보안을 알맞게 고려하게 해, 도로 차량 E/E 시스템의 엔지니어링이 최신 기술과 진화하는 공격 방법을 따라가게 하려는 것이다.[@iso-sae-21434-obp-2021] (Introduction, "Purpose of this document")

이 표준의 4절부터 15절까지가 다루는 것은 다음과 같다. 4절은 정보 제공용이다.[@iso-sae-21434-obp-2021]

| 절  | 다루는 것                     |
| --- | ----------------------------- |
| 4   | 일반 고려 사항                |
| 5   | 조직 사이버보안 관리          |
| 6   | 프로젝트 의존 사이버보안 관리 |
| 7   | 분산 사이버보안 활동          |
| 8   | 지속적 사이버보안 활동        |
| 9   | 개념 단계                     |
| 10  | 제품 개발                     |
| 11  | 사이버보안 확인(validation)   |
| 12  | 생산                          |
| 13  | 운용과 정비                   |
| 14  | 사이버보안 지원 종료와 폐기   |
| 15  | 위협 분석과 리스크 평가 방법  |

이 표준은 5절부터 15절까지 절마다 목표, 조항, 작업 산출물을 둔다. 조항은 요구사항, 권고, 허용으로 나뉜다. 조항과 작업 산출물에는 RQ(requirement), RC(recommendation), PM(permission), WP(work product) 뒤에 절 번호와 절 안의 순번을 붙인 식별자를 매긴다. 예를 들어 RQ-05-14는 5절의 열네 번째 요구사항이다.[@iso-sae-21434-obp-2021]

![[diagrams/iso-sae-21434-provision-identifier.svg]]

작업 산출물은 하나 이상의 요구사항을 채우는 사이버보안 활동의 결과다. 이 표준은 앞 단계의 작업 산출물로 이루어진 필수 입력을 prerequisites라 하고, 사이버보안 활동을 맡은 사람이 아닌 다른 곳에서 얻을 수 있어 고려할 만한 정보를 further supporting information이라 한다.[@iso-sae-21434-obp-2021] (Introduction, "Organization of this document")

조직 수준의 사이버보안 관리가 [[un-r155|UN R155]]의 [[cybersecurity-management-system|CSMS]]와 어떻게 이어지는지는 [[cybersecurity-management-system#ISO/SAE 21434와의 관계|CSMS와 ISO/SAE 21434의 관계]]에서 다룬다. 15절의 TARA 방법과 Annex의 impact rating 기준 예는 [[threat-analysis-and-risk-assessment#ISO/SAE 21434의 TARA 방법|TARA]]에서 다룬다.

이 표준은 Annex A부터 H까지 여덟 Annex를 둔다.[@iso-sae-21434-obp-2021] (목차 Annex A\~H)

- Annex A: 사이버보안 활동과 작업 산출물의 요약
- Annex B: 사이버보안 문화의 예
- Annex C: [[cybersecurity-interface-agreement|cybersecurity interface agreement]] 템플릿의 예
- Annex D: 사이버보안 관련성(cybersecurity relevance)을 판단하는 방법과 기준의 예
- Annex E: CAL(cybersecurity assurance level). CAL과 targeted attack feasibility를 다루는 ISO/SAE PAS(Publicly Available Specification) 8475는 발간 단계(60.00)에 있다.[@iso-sae-pas-8475-2026] (머리 "Publicly Available Specification", General information의 Stage)
- Annex F: impact rating 지침
- Annex G: [[attack-feasibility-rating|attack feasibility rating]] 지침
- Annex H: 헤드램프 시스템에 TARA 방법을 적용한 예[@iso-sae-21434-obp-2021] (목차 Annex A\~H; Annex A는 Introduction "Organization of this document"도; CAL 풀이는 3.2)

## 개정 이력

- 2021년: 1판. 8월에 나왔다.[@iso-sae-21434-2021] [[sae-j3061|SAE J3061]]:2016을 대체했고, 내용과 구조를 새로 짰다.[@iso-sae-21434-obp-2021]
- ISO/SAE 21434:2021은 개정 대상이고, 2판이 ISO/SAE AWI(Approved Work Item) 21434로 개발 중이며, 새 프로젝트로 등록된 단계(20.00)에 있다.[@iso-sae-21434-2021][@iso-sae-awi-21434-2026] (21434-R: General information의 Stage 90.92, Life cycle의 "Will be replaced by"; 21434-AWI: 머리 "Approved Work Item", Edition 2, Stage 20.00) (기존: 2026년 10월: ISO가 1판을 개정 대상으로 정했다. 1판이 현행판이고, 이를 대체할 2판이 새 프로젝트로 등록되어 개발 중이다. [@iso-sae-21434-2021][@iso-sae-awi-21434-2026] (21434-R: General information의 Stage 90.92, Life cycle; 21434-AWI: Edition 2, Stage 20.00))

## ISO 26262와의 관계

[[iso-26262|ISO 26262]]:2018은 [[functional-safety|기능 안전]]을, ISO/SAE 21434:2021은 사이버보안을 다루며, 두 표준은 서로 보완한다.[@iso-sae-21434-2021] ISO/SAE 21434:2021은 인용 규격으로 ISO 26262-3:2018 하나를 두고, [[cybersecurity-lifecycle#아이템과 운용 환경|아이템]](item)과 [[cybersecurity-management-system#감사|감사]](audit)의 정의를 ISO 26262-1:2018의 정의를 고쳐 가져온다.[@iso-sae-21434-obp-2021]
