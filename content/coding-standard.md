---
title: 코딩 표준
tags:
  - process/sw-testing
verified: 2026-10-03
---

ISTQB 용어집은 **코딩 표준**(coding standard)을 코드가 갖춰야 할 특성을 정하는 품질 표준으로 정의한다.[@istqb-glossary-coding-standard-2026] SWEBOK V4.0a에 따르면 코딩 표준에는 이름 짓기 관례, 코드 배치와 들여쓰기 같은 규칙이 들고, 알맞은 코딩 표준을 따르는 팀은 읽기 쉽고 유지보수하기 쉬운 코드를 만든다.[@ieee-swebok-v4-0a-2026]

## C 언어에서 피하려는 동작

ISO/IEC 9899:2024는 C 프로그램의 동작 가운데 표준이 결과를 하나로 정하지 않는 것을 네 가지로 정의한다.[@iso-iec-9899-obp-2024]

- **미정의 동작**(undefined behavior): 이식성이 없거나 잘못된 프로그램 구성, 또는 잘못된 데이터를 쓸 때 표준이 아무 요구도 두지 않는 동작
- **미지정 동작**(unspecified behavior): 표준이 둘 이상의 가능성을 두고, 어느 것을 고를지는 더 정하지 않는 동작. 함수 인자를 평가하는 순서가 그 예다.
- **구현 정의 동작**(implementation-defined behavior): 구현마다 무엇을 골랐는지 문서로 밝히는 미지정 동작
- **로캘 특정 동작**(locale-specific behavior): 국적, 문화, 언어의 지역 관례에 따라 달라지고, 구현마다 문서로 밝히는 동작[@iso-iec-9899-obp-2024]

![[diagrams/c-undefined-unspecified-behavior.svg]]

SEI CERT C 코딩 표준은 C 언어의 보안 코딩 규칙을 담고, 미정의 동작을 없애는 것 등으로 안전하고 믿을 수 있으며 보안이 갖춰진 시스템을 만드는 것을 목표로 한다. 이 표준은 미정의 동작이 악용할 수 있는 취약점으로 이어질 수 있다고 본다.[@sei-cert-c-introduction-2026]

## 대표 표준

[[misra-c|MISRA C]]는 주로 안전 관련 응용을 겨냥해, 특히 임베디드 시스템에서 C 언어의 취약점을 다루는 데 초점을 두어 왔다.[@misra-c-2023-add3-2025]

CERT는 C 표준 위원회 WG14의 위원을 포함한 커뮤니티의 참여로 위키에서 CERT C 보안 코딩 표준을 만들었고, 2008년 책으로 낸 1.0판에 이어 2014년 2판과 2016년 판을 펴냈다.[@sei-cert-c-history-2026] SEI CERT C 코딩 표준의 지침은 규칙(rule)과 권고(recommendation)로 이뤄진다. 규칙은 코드에 대한 규범적 요구이고, 권고는 따르면 안전성, 신뢰성, 보안을 높일 지침이다.[@sei-cert-c-rules-versus-recommendations-2026]

## MISRA C와 CERT C의 대응

MISRA는 MISRA C:2012 Addendum 3에서 Amendment 1을 포함한 MISRA C:2012가 CERT C 2016년 판의 지침을 어디까지 다루는지 보였다.[@misra-c-2012-add3-2018] MISRA C:2023 Addendum 3에서는 MISRA C:2023이 CERT C 2016년 판을 다루는 범위를 지침마다 보이고, MISRA C가 안전 환경만큼 보안 환경에도 들어맞는다고 주장했다. 이 문서는 MISRA C 지침이 언어 기능을 제한해 CERT C 지침을 다루는 경우를 Restrictive 대응으로 분류했다.[@misra-c-2023-add3-2025]

## 준수 확인

MISRA Compliance:2020은 MISRA 지침 대부분의 위반은 분석 도구나 컴파일러로 찾는 것이 가장 쉽고 믿을 만하며 비용이 적다고 보고, 도구로 완전히 검사할 수 없는 지침에는 수작업 [[software-review|리뷰]]가 필요할 수 있다고 둔다.[@misra-compliance-2020] SEI CERT C 코딩 표준은 규칙의 요건 하나로, 자동 분석(정적이나 동적), 형식 기법, 수작업 검사로 준수 여부를 판정할 수 있을 것을 든다.[@sei-cert-c-rules-versus-recommendations-2026] 이 표준은 규칙을 손으로 검사할 수도 있지만 프로그램이 크고 복잡해지면 곧 감당할 수 없으므로, 정적 분석 도구를 쓰기를 권한다.[@sei-cert-c-tool-selection-and-validation-2026] 도구로 하는 검사는 [[static-analysis|정적 분석]]에서 다룬다.

ISTQB CTFL 강의계획서에 따르면 코딩 표준의 이름 짓기 관례를 지키지 않은 것 같은 표준 위반은 [[software-testing#정적 테스트와 동적 테스트|정적 테스트]]로 찾기가 더 쉽고 비용이 적으며, 코딩 표준 검사는 [[test-automation|테스트 자동화]]로 얻는 이점에 든다.[@istqb-ctfl-syllabus-2024]

MISRA Compliance:2020은 코드 배치와 들여쓰기, 중괄호 위치, 이름 짓기 관례, 주석처럼 코드의 정확성에 직접 영향을 주지 않는 겉모양은 조직의 사내 스타일 가이드로 다루기를 권하고, 그 시행은 문서의 범위 밖에 둔다.[@misra-compliance-2020]

## ISO 26262-6

[[iso-26262|ISO 26262]]-6:2018은 5절(소프트웨어 수준 제품 개발의 일반 주제)에 모델링·코딩 지침이 다룰 주제의 표를 두고, 참고문헌에 MISRA C:2012를 든다.[@iso-26262-6-obp-2018] 유닛 설계와 구현의 원칙은 [[software-unit-design|소프트웨어 유닛 설계]]에서 다룬다.
