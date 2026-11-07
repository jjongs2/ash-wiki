---
title: Eclipse S-CORE
tags:
  - hardware/ee-architecture
aliases:
  - S-CORE
  - Eclipse Safe Open Vehicle Core
verified: 2026-11-07
---

**Eclipse S-CORE**(Eclipse Safe Open Vehicle Core)는 [[software-defined-vehicle|SDV]]용 오픈소스 코어 스택을 개발하는 Eclipse Foundation의 오픈소스 프로젝트로, 임베디드 고성능 [[electronic-control-unit|ECU]]를 겨냥한다. 이런 ECU는 프로세서를 여럿 싣기 때문에, S-CORE는 프로세서 사이의 상호운용도 겨냥한다.[@eclipse-score-project-2026][@eclipse-score-docs-2026]

Eclipse S-CORE는 업계 전체가 바탕으로 삼을 차량 탑재 ECU용 소프트웨어 플랫폼을 목표로 하며, 그대로 양산에 넣는 제품이 아니라 상용 배포판의 바탕이다.[@eclipse-score-docs-2026] S-CORE는 QNX, Linux 같은 기존 POSIX 호환 운영체제 위에 선다.[@eclipse-score-architecture-2026]

## 쓰는 곳

S-CORE를 세운 업계 회원들의 공동 목표는 업계 전체가 바탕으로 삼을, 차량 탑재 ECU용 code-first 오픈소스 소프트웨어 플랫폼이다. S-CORE는 그대로 통합해 양산에 쓰는 제품이 아니라 상용 배포판을 위한 일반 바탕이며, 최종 시스템이 [[automotive-spice|ASPICE]], [[iso-sae-21434|ISO/SAE 21434]], [[iso-26262|ISO 26262]]를 따르는지는 늘 양산 프로젝트가 책임진다.[@eclipse-score-docs-2026]

Eclipse S-CORE는 응용 계층 아래, board support package 위의 소프트웨어 플랫폼 계층을 모두 쌓는 것을 목표로 한다.[@eclipse-score-website-2026] S-CORE는 주로 차량용 고성능 컴퓨팅 플랫폼에 맞춰 설계하고 최적화했으며, 구성 요소는 동적 메모리 관리, 프로세스 격리와 Linux, QNX 같은 안전 중요 운영체제의 기능을 쓰도록 짜였다.[@eclipse-score-faq-2026]

## 동작

Eclipse S-CORE 플랫폼은 위에서부터 다음 계층으로 이루어지고, 그 아래에 기존 운영체제와 하이퍼바이저·하드웨어가 있다. 아키텍처는 계속 다듬어지며 앞으로의 릴리스에서 바뀐다.[@eclipse-score-architecture-2026]

- **Frameworks**: 응용이 그 위에 만들어지는 분야별 framework
- **Platform API**: 응용이 쓰는 C++·Rust 네이티브 API
- **Platform services**: Platform API 뒤의 구현. Base Services, Application Management, Communication, Diagnosis, Security로 묶인다.
- **Common**: 다른 모든 부분이 함께 쓰는 기능. 예: 기본 라이브러리(baselibs)와 설정 관리[@eclipse-score-architecture-2026]

2026년 11월 기준 아키텍처 그림은 블록마다 개발 중, 앞으로 개발, 개발 대상 아님, 범위 밖, 운영체제·하드웨어별 구현 가운데 하나의 상태를 색으로 표시한다. 개발 중인 블록은 아래와 같다.[@eclipse-score-architecture-2026]

- Frameworks: FEO(Fixed Execution Order), DAAL(Deterministic App Abstraction Layer), AI Platform
- Platform API: Baselibs, Config Management, Logging, Persistency, Time, Lifecycle, Communication, Diagnostics, Crypto의 API
- Platform services: Logging, Persistency, Time, Lifecycle, zero-copy communication, [[some-ip|SOME/IP]] Gateway, Diagnostics, Diagnostic Handler([[service-oriented-vehicle-diagnostics|SOVD]], [[uds|UDS]]), Crypto
- Common: Baselibs, Config Management
- 하이퍼바이저·하드웨어: Inter-Partition Communication[@eclipse-score-architecture-2026]

S-CORE는 아키텍처를 두 수준으로 적는다. **feature**는 플랫폼의 논리 단위(예: Persistency, Communication)로, feature 요구사항과 feature 아키텍처를 가진다. **module**은 feature 하나 이상을 구현해 실제로 빌드하고 릴리스하는 단위로, module마다 저장소가 따로 있다.[@eclipse-score-architecture-2026]

Eclipse S-CORE가 지원하는 언어는 C++17(필요하면 C++20의 요소를 더함)과 Rust의 safe subset이다.[@eclipse-score-faq-2026] S-CORE 프로젝트 전체는 Bazel 빌드 시스템으로 빌드한다.[@eclipse-score-technologies-2026]

## 안전 등급

2026년 11월 기준 S-CORE는 feature마다 안전 등급을 [[automotive-safety-integrity-level|ASIL]] B나 [[automotive-safety-integrity-level#S·E·C 파라미터|QM]]으로 매긴다. 진단, 보안·암호, 트레이싱 feature는 QM이고, 나머지는 ASIL B다.[@eclipse-score-features-2026]

## 역사와 상태

Eclipse S-CORE는 2024년 9월 자동차 업계 회원들이 세웠다.[@eclipse-score-docs-2026] 결성 회원으로는 Accenture, BMW, ETAS, Mercedes-Benz, Qorix 등이 있다.[@eclipse-score-website-2026]

S-CORE는 [[software-defined-vehicle#오픈소스 플랫폼|Eclipse SDV]]의 integration project 가운데 하나다.[@eclipse-sdv-integration-projects-2026] Eclipse SDV에 따르면 2025년 6월 유럽의 주요 자동차 회사 11곳이 SDV 오픈소스 협력을 다짐하는 양해각서에 서명했고, 그 노력은 먼저 S-CORE에 모였다.[@eclipse-sdv-about-2026]

S-CORE의 첫 공개 릴리스는 2025년 11월의 v0.5.0-alpha로, 실험, 프로젝트 프로세스 시험, 릴리스 경험 쌓기와 피드백 수집만을 위한 초기 alpha 버전이었다.[@eclipse-score-v0-5-alpha-release-note-2025]

2026년 11월 기준 S-CORE는 Eclipse 프로젝트로서 Incubating 단계에 있다.[@eclipse-score-project-2026] 같은 때 가장 최근의 플랫폼 릴리스는 v0.10이다.[@eclipse-score-releases-2026] 2026년 11월 2일에 나온 v0.10.0은 안전 논증과 수행된 안전 평가를 갖추지 않았으므로 양산용 출시가 아니다.[@eclipse-score-v0-10-release-note-2026]
