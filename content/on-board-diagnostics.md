---
title: OBD
tags:
  - network/diagnostics
verified: 2026-10-22
---

규정 (EU) 2024/1257은 **OBD**(On-Board Diagnostics) 시스템을, 차량의 OBD 정보를 만들고 그 정보를 차량 밖으로 보낼 수 있는 차량 탑재 시스템으로 정의한다.[@eu-2024-1257-2024] 규정 (EC) No 715/2007은 OBD 시스템을, 컴퓨터 메모리에 저장한 고장 코드로 고장 났을 법한 곳을 찾아낼 수 있는 배출가스 제어용 시스템으로 정의한다.[@eu-715-2007-2007]

## WWH-OBD

ISO 27145-1:2012는 ISO 27145 시리즈가 WWH-OBD(World-Wide Harmonized On-Board Diagnostics) GTR(Global Technical Regulations)의 범위 안에서 차량의 OBD 시스템과 외부 시험 장비 사이의 통신을 다루도록 둔다.[@iso-27145-1-obp-2012]

ISO 27145 시리즈는 OBD 관련 정보에 접근하는 단일 통신 표준이 되는 것을 목표로 한다. 이 시리즈의 WWH-OBD 통신은 [[iso-15765-2|DoCAN]](ISO 15765 시리즈)과 [[doip|DoIP]](ISO 13400 시리즈)에 바탕을 둔다.[@iso-27145-1-obp-2012]

## AUTOSAR의 OBD 지원

[[autosar|AUTOSAR]] R25-11의 Dcm(Diagnostic Communication Manager) 명세는 Dcm이 SAE J1979와 ISO 15031-5가 정한 OBD 서비스 `$01`~`$0A`를 지원하는 수단을 두도록 정한다. Dcm은 OBD 프로토콜을 가장 높은 우선순위로 둔다. OBD 서비스는 법규상 인증 상태와 상관없이 늘 쓸 수 있어야 하므로, Dcm은 OBD 서비스를 인증 검사에서 뺀다.[@autosar-cp-sws-diagnosticcommunicationmanager-2025]
