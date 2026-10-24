---
title: SOVD
tags:
  - network/diagnostics
verified: 2026-10-22
---

**SOVD**(Service-Oriented Vehicle Diagnostics)는 [[ee-architecture#존 아키텍처|HPC]]와 기존 [[electronic-control-unit|ECU]]를 같은 방식으로 진단하는 서비스 지향 진단 API다.[@iso-17978-3-obp-2026][@asam-sovd-2022] ISO 17978 시리즈와 ASAM SOVD 1.0.0이 이 API를 정한다.[@asam-sovd-2022][@iso-17978-1-obp-2026]

## ASAM SOVD

ASAM SOVD 1.0.0은 HTTP/REST, JSON, OAuth를 바탕으로 한 API를 정한다. 이 API는 proximity, remote, in-vehicle 세 시나리오에 쓸 수 있고, 외부 기술 파일 없이도 진단할 수 있게 하는 self-describing API다. ASAM(자동차 개발·시험 시스템의 표준화 단체)은 ASAM SOVD를 [[uds|UDS]]를 대체하지 않고 UDS와 함께 쓰도록 만들었다.[@asam-sovd-2022][@asam-home-2026]

ISO 17978-3:2026의 소개 NOTE는 이 표준이 일부 API 메서드를 deprecated로 표시한다는 것과, 그 배경이 2022년의 ASAM SOVD 1.0 발표라는 것을 제시한다.[@iso-17978-3-obp-2026]

## ISO 17978 시리즈

ISO 17978-1:2026은 ISO 17978 시리즈를 개관하고, ISO 20077 시리즈의 extended vehicle(ExVe) 방법론을 따르는 SOVD의 규칙과 기본 원칙을 정한다. 이 표준은 **extended vehicle**을 차량 제조사의 명세를 따르면서 도로 차량의 물리적 경계 밖까지 이어지는 개체로 정의하고, 그 구성을 도로 차량, 차량 밖 시스템, 외부 인터페이스, 도로 차량과 차량 밖 시스템 사이의 데이터 통신으로 둔다. 이 표준은 SOVD와 다른 진단 프로토콜 사이를 옮기는 소프트웨어를 **classic diagnostic adapter**로 정의한다.[@iso-17978-1-obp-2026]

## API

ISO 17978-3:2026은 SOVD API를 HPC와 기존 ECU의 진단, 진단 능력 조회, extended vehicle 안의 SOVD 메서드 발견을 표준화하는 API로 정의한다. 이 API는 고장 항목 읽기와 지우기, 측정과 식별, 루틴·I/O 제어의 실행, 차량 구성, 제조사별 소프트웨어 업데이트 전략의 캡슐화, HPC의 로그 접근 같은 기능을 준다.[@iso-17978-3-obp-2026]

[[autosar-adaptive-platform|AUTOSAR Adaptive Platform]]의 SOVD 지원은 [[autosar-diagnostic-management|Diagnostic Management]]에서 다룬다.
