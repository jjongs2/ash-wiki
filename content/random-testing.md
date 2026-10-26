---
title: 무작위 테스트
tags:
  - sw-engineering/sw-testing
verified: 2026-10-13
---

**무작위 테스트**(random testing)는 무작위로 고른 입력 값으로 [[test-case|테스트 케이스]]를 만드는 [[black-box-testing|블랙박스]] 테스트 기법이다.[@iso-iec-ieee-29119-4-obp-2021][@istqb-glossary-random-testing-2026] [[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-4:2021은 무작위 테스트를 명세 기반 테스트 케이스 설계 기법으로 정의한다.[@iso-iec-ieee-29119-4-obp-2021]

SWEBOK V4.0a에 따르면 무작위 테스트는 테스트 케이스를 순전히 무작위로 만든다. 입력 영역 안에서 무작위로 점을 고르려면 입력 영역을 알아야 하므로, 무작위 테스트는 입력 영역 테스트에 든다. 이 지식 체계에 따르면 무작위 테스트는 [[test-automation|테스트 자동화]]에 비교적 단순한 접근이다. 다만 적응형 무작위 테스트(adaptive random testing)처럼 다른 입력 선택 기준이 무작위 입력 추출을 이끄는 발전된 형태도 제안되었다.[@ieee-swebok-v4-0a-2026]

## 확률 분포

무작위 테스트는 정한 확률 분포에 따라 테스트 항목의 입력 영역에서 테스트 데이터를 무작위로 고른다. [[verification-and-validation|확인]](validation)이 목적이면 [[test-type#신뢰성 테스트와 운용 프로파일|운용 프로파일]]에 바탕을 둔 분포를, 검증(verification)이 목적이면 치우침을 피하도록 사용과 무관한 분포를 쓴다.[@istqb-ctal-ta-syllabus-2025]

무작위 테스트는 유도형과 비유도형으로 나뉜다. **비유도형**(unguided)은 확률 분포가 과정 내내 그대로인 무작위 테스트다. **유도형**(guided)은 앞서 고른 값에 따라 분포를 고쳐 가는 무작위 테스트로, 결함이 입력 영역의 특정 구역에 몰리는 일이 많다는 점을 고려해 입력 영역을 효과적으로 덮으려 한다. 적응형 무작위 테스트가 유도형의 예다.[@istqb-ctal-ta-syllabus-2025]

## 종료 기준과 오라클

무작위 테스트에는 인정된 커버리지 기준이 없다. 그래서 종료 기준은 실행한 테스트의 수, 테스트 시간 같은 완료 척도에만 기댈 수 있다. 테스트 케이스의 기대 결과는 [[test-case#판정과 테스트 오라클|테스트 오라클]]로 더할 수 있는데, 이때는 대개 자동화된 테스트 오라클이 필요하다.[@istqb-ctal-ta-syllabus-2025]

![[diagrams/random-testing-distribution.svg]]

## 쓰임

무작위 테스트는 [[fuzz-testing|퍼즈 테스트]]와 카오스 엔지니어링(chaos engineering)에도 쓰이고, [[metamorphic-testing|메타모픽 테스트]]와 결합해 쓸 수도 있다.[@istqb-ctal-ta-syllabus-2025]
