---
title: MISRA C
tags:
  - process/sw-testing
verified: 2026-10-03
publisher: MISRA
edition: 2025
status: 유효
---

**MISRA C**는 중요 시스템(critical systems)을 개발할 때 쓰는 C 언어 [[coding-standard|코딩 지침]] 모음이다. 문서 제목은 "Guidelines for the use of the C language in critical systems"다.[@misra-compliance-2020] MISRA C 지침은 C 언어의 부분집합을 정의하며, 이 부분집합에서는 실수할 여지를 없애거나 줄인다.[@misra-c-2023-add3-2025]

MISRA C는 MISRA가 펴낸다. MISRA는 The MISRA Consortium Limited의 상호다.[@misra-c-overview-2025] MISRA는 1990년대 초 영국 정부의 SafeIT 연구 프로그램 안의 프로젝트로 시작했다.[@misra-history-2021] MISRA C는 1994년 MISRA의 차량용 소프트웨어 개발 지침이 요구한 표준 언어의 제한된 부분집합을 채우려고, 차량용 임베디드 소프트웨어에 C가 쓰이기 시작하던 때 만들어졌다.[@misra-home-2026] 1999년 MISRA 사이트는 MISRA를 Motor Industry Software Reliability Association으로 적었다.[@misra-c-1998-intro-1999]

## 범위

MISRA Compliance:2020은 MISRA 지침을 rule과 directive로 나누고, 대부분이 rule이라고 둔다.[@misra-compliance-2020]

- **Rule**: 소스 코드에 대해 완전하고 객관적이며 모호하지 않은 요구를 두는 지침. 그 요구는 프로세스, 설계 문서, 기능 요구사항과 무관하다.
- **Directive**: 소스 코드만으로는 정의되지 않는 지침. 프로세스, 문서, 기능 요구사항을 가리키거나 그것에 요구를 둔다.[@misra-compliance-2020]

MISRA Compliance:2020은 지침마다 Mandatory, Required, Advisory 가운데 하나의 분류를 둔다.[@misra-compliance-2020]

- **Mandatory**: 어떤 경우에도 어길 수 없다.
- **Required**: 명확한 제한, 요구, 예방 조치를 정한 deviation이 뒷받침할 때만 어길 수 있다.
- **Advisory**: 합리적으로 가능한 만큼 따르라는 권고다. 위반은 찾아 두지만 deviation으로 뒷받침하지 않아도 된다.[@misra-compliance-2020]

MISRA Compliance:2020은 rule에 두 가지 성질을 더 둔다.[@misra-compliance-2020]

- **결정 가능성**(decidability): decidable rule은 도구가 바르게 설정되고 결함이 없으면 언제나 준수 여부를 예나 아니요로 답할 수 있다. Undecidable rule은 분석 도구가 모든 경우에 답한다고 보장하지 못한다.
- **분석 범위**: Single Translation Unit rule은 번역 단위를 하나씩 보면 되고, System rule은 시스템 전체의 소스 코드를 봐야 한다.[@misra-compliance-2020]

MISRA Compliance:2020은 지침 위반을 정해진 절차로 승인받고 deviation record로 뒷받침하게 한다. 이 문서는 MISRA 지침을 지켰다고 주장하는 요건과 deviation을 다루며, 그 전 MISRA 지침 문서에 있던 준수, deviation, 프로세스에 대한 요구를 대체한다.[@misra-compliance-2020] MISRA C:2012 Amendment 2는 MISRA Compliance를 반드시 따르도록 했다.[@misra-c-2012-amd2-2020] 도구로 준수를 확인하는 일은 [[static-analysis|정적 분석]]에서 다룬다.

## 개정 이력

- 1998년: 첫판 MISRA C:1998. 4월에 "Guidelines for the Use of the C Language in Vehicle Based Software"라는 제목으로 나왔다.[@misra-c-1998-intro-1999][@misra-publications-2015] ISO/ANSI 표준 C를 대상으로 규칙 127개를 두었다.[@misra-c-1998-intro-1999]
- 2004년: 둘째 판 MISRA C:2004. 사용자 의견과 여러 산업에서의 쓰임을 반영했다.[@misra-faqs-2025] 제목을 "Guidelines for the use of the C language in critical systems"로 바꾸고, 미정의 동작을 포괄적으로 다루던 규칙을 미정의 동작 하나하나를 겨냥한 규칙들로 바꿨다.[@misra-c-overview-2025] C90을 기준으로 규칙 141개를 두었고, C99는 다루지 않았다.[@misra-c-2004-faqs-2004]
- 2013년: 셋째 판 MISRA C:2012. 3월 18일에 나왔다. C99 지원을 넣고 C90 지원도 유지했으며, rule마다 결정 가능성을 밝혔다.[@misra-c-overview-2025] 지침을 rule과 directive로 나누고, Mandatory 분류를 새로 넣었다.[@misra-compliance-2020]
- 2016년: MISRA C:2012 Amendment 1. 4월에 나왔고, 보안 관련 지침을 더했다.[@misra-c-2012-amd1-2016]
- 2019년: MISRA C:2012의 개정본(셋째 판 첫 개정)이 2월에 나왔다. Amendment 1과 Technical Corrigendum 1을 합쳤다.[@misra-c-overview-2025]
- 2020년: MISRA C:2012 Amendment 2. 2월에 나왔고, C11을 지원 범위에 넣었다. C18은 C11과 기능이 같아 함께 지원된다.[@misra-c-2012-amd2-2020]
- 2023년: MISRA C:2023(셋째 판 둘째 개정). 4월에 나왔다. Amendment 2부터 Amendment 4까지와 Technical Corrigendum 2를 합치고, C11과 C18 지원을 담았다.[@misra-c-overview-2025][@misra-c-2023-released-2023]
- 2025년: MISRA C:2025. 3월에 나온 현행판이다.[@misra-faqs-2025] 지침을 조금씩 고친 판이고, C11과 C18, 그 앞의 C 판 지원을 유지한다.[@misra-c-overview-2025] 앞서 나온 모든 판을 대체한다.[@misra-c-2025-product-2025]

![[diagrams/misra-c-edition-lineage.svg]]
