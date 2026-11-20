---
title: ISO/TS 5083
tags:
  - applications/adas
verified: 2026-11-20
publisher: ISO
edition: 2025
status: 유효
---

**ISO/TS 5083**은 도로 차량에 통합된 [[levels-of-driving-automation|ADS]]의 안전을 이루고 입증하는 지침을 주는 ISO의 Technical Specification이다. 정식 제목은 "Road vehicles — Safety for automated driving systems — Design, verification and validation"이고, ISO/TC 22/SC 32가 맡는다.[@iso-ts-5083-2025] 부품 공급사부터 차량 OEM, 운송 서비스 사업자, 규제 기관까지 ADS의 설계와 배치에 관여하는 모두가 쓰도록 만들어졌고, 운전 자동화 레벨 3·4의 ADS feature를 대상으로 설계, [[verification-and-validation|검증과 확인]], 배치 뒤 운용에 걸친 안전 지침과 요구사항을 준다.[@iso-ts-5083-obp-2025]

## 범위

이 문서는 전 세계에 적용되는 출판물에서 끌어낸 안전 원칙과 최상위 안전 목표에 바탕을 두고, ISO/SAE PAS 22736이 정의한 레벨 3·4의 ADS feature에 대해 설계에 의한 안전, 검증과 확인, 배치 뒤 활동을 다루며, [[cybersecurity|사이버보안]] 고려 사항도 개관한다. 트럭과 버스를 포함한 도로 차량에 적용하고, 모터사이클과 모페드는 뺀다. 이 문서가 나오기 전에 이미 운용 중이거나 개발 중인 ADS와 그 요소에는 적용하지 않는다. 이 문서는 개발 활동을 하는 동안의 안전(safety during development activities)을 자기가 다루지 않는 중요한 고려 사항으로 제시한다.[@iso-ts-5083-obp-2025]

이 문서는 ISO/SAE PAS 22736:2021의 ADS 정의를 고쳐 가져오고, 정의의 주석에서 ADS라는 말을 레벨 3·4 운전 자동화 시스템을 가리키는 데 쓴다고 제시한다. **ADS feature**는 주어진 운전 자동화 레벨에서, 해당하면 특정 [[operational-design-domain|ODD]] 안에서 ADS가 갖는 설계 고유의 기능이다. 이 문서는 highway pilot과 automated valet parking을 예로 들고, ADS 하나가 저마다 특정 레벨과 [[levels-of-driving-automation#ADS|DDT]](Dynamic Driving Task) 명세에 묶인 ADS feature를 여럿 가질 수 있다고 제시한다. **ADS safety case**는 ADS를 단 차량이 주어진 환경에서 ADS feature의 안전을 이루도록 개발됐다는 주장을 증거로 뒷받침하는 구조화된 논증이다.[@iso-ts-5083-obp-2025]

이 문서는 **확인**(validation)을 ADS를 단 차량의 운용이 의도된 환경에서 ADS feature의 안전을 이루는지 정하는 활동으로, 안전에 한정해 정의하고, [[iso-26262|ISO 26262]]-1:2018의 정의를 고쳐 가져와 **검증**(verification)을 검사 대상이 명세된 안전 요구사항을 만족하는지 정하는 활동으로 정의한다. **Safety capability**는 ADS가 안전하게 운용되는 데 필요한 속성이고, 정의의 주석은 safety capability를 DDT뿐 아니라 DDT fallback과 incident 뒤의 거동에도 정의한다고 제시한다.[@iso-ts-5083-obp-2025]

이 문서는 risk acceptance criterion을 [[iso-21448|ISO 21448]]:2022의 [[sotif#Acceptance criterion과 validation target|acceptance criterion]]에서 고쳐 가져온다. ISO 26262-1:2018의 정의 가운데 failure와 fault는 item and element를 ADS로 바꿔 고쳐 쓰고, harm, safety, unreasonable risk는 그대로 가져온다. cybersecurity는 [[iso-sae-21434|ISO/SAE 21434]]:2021의 정의를 item을 ADS로 바꿔 쓴다.[@iso-ts-5083-obp-2025]

## 개정 이력

- 2025년: ISO/TS 5083:2025(1판)가 4월에 나왔다.[@iso-ts-5083-2025] 이 판은 ISO/TR 4804:2020(Road vehicles — Safety and cybersecurity for automated driving systems — Design, verification and validation)을 취소하고 대체했다. 범위를 전면 고치고, 규범 절에 목표와 요구사항을 넣었으며, ADS 개발에 적용하는 상위 안전 전략의 서술을 고쳐 ADS 밖에 할당할 가정과 요구사항을 분명히 했다. 사이버보안과의 연결을 더하고, 적용 예와 AI 안전 고려를 더 담도록 Annex를 고쳤다.[@iso-ts-5083-obp-2025]
- 2026년 11월 기준 ISO/TS 5083:2025는 개정 대상(90.92)이고, 다음 판이 개발 중이다.[@iso-ts-5083-2025]
