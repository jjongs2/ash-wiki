---
title: Automotive Threat Matrix
aliases:
  - ATM
tags:
  - security/cybersecurity
verified: 2026-10-15
publisher: Auto-ISAC
edition: 2025
status: 유효
---

[[vulnerability-management#취약점 보고와 정보 공유|Auto-ISAC]]의 **Automotive Threat Matrix**(ATM)는 검증된 차량 공격과, 동료 심사를 거쳐 재현할 수 있는 차량 익스플로잇 연구 같은 실제 관찰을 바탕으로 차량 공격자의 전술(tactic)과 그것을 뒷받침하는 기법(technique)을 열거한다.[@auto-isac-about-us-2026]

## 범위

ATM v4.02는 차량을 노리는 공격자의 전술과 기법을 모은 온라인 도구이자 데이터 세트로, 자동차 업계에 공통 위협 분류 체계를 준다. 전술은 공격자가 어떤 행동을 하는 까닭, 곧 전술적 의도를 나타내고, 기법은 공격자가 그 전술 목표를 어떻게 이루는지를 나타낸다. 매트릭스는 첫 행에 전술을 두고, 기법은 저마다의 전술 아래 열에 둔다.[@auto-isac-atm-2025]

전술은 ATM-TA0000부터 ATM-TA0013까지 14개로, 차례로 Reconnaissance, Manipulate Environment, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, Affect Vehicle Function이다. 마지막 Affect Vehicle Function은 공격자가 추진 제어, 에어백 전개, 오디오, 디스플레이 같은 차량 기능과 시스템에 영향을 주려는 전술이다.[@auto-isac-atm-2025]

![[diagrams/automotive-threat-matrix-layout.svg]]

OASIS 표준 STIX(Structured Threat Information Expression) 2.1은 사이버 위협 정보를 주고받는 데 쓰는 언어이자 직렬화 형식을 정한다.[@oasis-stix-2-1-2021] ATM의 최신 버전은 MITRE ATT&CK처럼 STIX 2와 호환되는 파일로 내려받을 수 있고, 이전 버전도 받을 수 있다.[@auto-isac-atm-2025]

누구나 도구 곳곳의 contribute 기능으로 전술, 기법, 예의 수정, 추가, 삭제를 제안할 수 있다. 제안은 업계 전문가의 검토를 거친 뒤 투표로 ATM에 넣을지 정한다.[@auto-isac-atm-2025]

## 개정 이력

- 2024년: v1.00. 1월 23일 처음 나왔다.[@auto-isac-atm-2025]
- 2024년: 3월 27일 Auto-ISAC이 ATM을 발표했다. Auto-ISAC은 ATM을 MITRE ATT&CK 프레임워크를 본떠, 차량에 특화한 공격 전술과 기법의 표준 분류 체계로 내놓았다.[@auto-isac-atm-launch-2024]
- 2024년: v3.00. 8월 30일에 나왔고, 승인된 기여를 반영한 첫 큰 내용 변경이었다.
- 2025년: v4.02이자 현행 릴리스. 12월 4일에 나왔다.[@auto-isac-atm-2025]

## 쓰임

Auto-ISAC은 ATM을 차량 [[cybersecurity|사이버보안]] 거버넌스의 모든 측면을 빠르게 하려는 공통 위협 분류 체계로 두고, 그 쓰임으로 [[threat-analysis-and-risk-assessment|위협·리스크 평가]] 모델링, 정보 공유, 공격 동향 분석, incident 대응, 규제 보고, 사이버보안 테스트, [[vulnerability-management|취약점 관리]]를 든다.[@auto-isac-about-us-2026]

Auto-ISAC의 2025년 2월 백서에 따르면 ATM의 칸 하나하나로 [[threat-analysis-and-risk-assessment#용어|attack path]]의 단계를 정의할 수 있다. 사용자가 칸마다 기본 [[attack-feasibility-rating|attack feasibility]]를 매겨 두면, ATM의 칸을 골라 attack path를 짜는 대로 전체 attack feasibility가 정해지고, 설계의 차이 같은 사정에 따라 고칠 수 있다. 또 [[penetration-testing|침투 테스트]]처럼 창의적이고 적응적인 접근이 필요한 탐색적 활동을 테스트 계획에 넣을 때 ATM의 전술과 기법이 믿을 만한 출발점이 되고, 대상 시스템의 정보로 이를 다듬어 대상별 공격 시나리오를 만들 수 있다.[@auto-isac-atm-white-paper-2025]
