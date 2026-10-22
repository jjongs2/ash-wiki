---
title: SOVD
tags:
  - network/diagnostics
verified: 2026-10-22
---

ISO 17978-3:2026은 [[ee-architecture#존 아키텍처|HPC]]와 기존 [[electronic-control-unit|ECU]]의 진단, 진단 능력 조회, extended vehicle 안의 **SOVD**(Service-Oriented Vehicle Diagnostics) 메서드 발견을 표준화하는 API를 정한다. 이 SOVD API로 기존 ECU와 HPC에 같은 방식으로 접근한다.[@iso-17978-3-obp-2026]

## API

이 API는 고장 항목 읽기와 지우기, 측정과 식별, 루틴·I/O 제어의 실행, 차량 구성, 제조사별 소프트웨어 업데이트 전략의 캡슐화, HPC의 로그 접근 같은 기능을 준다. SOVD 서버 구현에 딸린 문제, 예를 들어 서비스 거부 같은 공격에 대한 대응, 보안 사고의 인지와 관리, 데이터 프라이버시, 동시 요청의 부하 분산은 이 표준이 다루지 않는다. 이 표준은 **SOVDServer**를 REST(Representational State Transfer) API 서비스의 서버 쪽 구현을 나타내는 개체로 정의한다. 이 표준은 JSON(JavaScript Object Notation) 데이터 교환 형식(RFC 8259)을 인용 규격으로 둔다.[@iso-17978-3-obp-2026]

소개의 NOTE는 이 표준이 일부 API 메서드를 deprecated로 표시한다는 것과, 그 배경이 2022년의 ASAM SOVD 1.0 발표라는 것을 제시한다.[@iso-17978-3-obp-2026]

## 규칙과 기본 원칙

ISO 17978-1:2026은 ISO 17978 시리즈를 개관하고, ISO 20077 시리즈의 extended vehicle(ExVe) 방법론을 따르는 SOVD의 규칙과 기본 원칙을 정한다. 이 표준은 SOVD와 다른 진단 프로토콜 사이를 옮기는 소프트웨어를 **classic diagnostic adapter**로 정의한다.[@iso-17978-1-obp-2026]

![[diagrams/sovd-api-access.svg]]

## ASAM SOVD

ASAM SOVD 1.0.0은 HTTP/REST, JSON, OAuth를 바탕으로 한 API를 정한다. 이 API는 proximity, remote, in-vehicle 세 시나리오에 쓸 수 있고, 외부 기술 파일 없이도 진단할 수 있게 하는 self-describing API다. ASAM은 ASAM SOVD를 [[uds|UDS]]를 대체하지 않고 UDS와 함께 쓰도록 만들었다.[@asam-sovd-2022]
