---
title: 시나리오 기반 테스트
aliases:
  - 시나리오 테스트
tags:
  - sw-engineering/sw-testing
verified: 2026-10-13
---

[[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-4:2021은 **시나리오 테스트**(scenario testing)를 테스트 대상과 다른 시스템 사이의 상호작용의 열을 실행하는 데 바탕을 둔 [[black-box-testing|명세 기반]] [[test-case|테스트 케이스]] 설계 기법으로 정의한다. 이 정의에서는 사용자도 다른 시스템으로 본다.[@iso-iec-ieee-29119-4-obp-2021]

ISTQB CTAL-TA v4.0 강의계획서는 현실적인 시나리오에서 테스트 대상의 동작을 평가하는 기법을 **시나리오 기반 테스트**(scenario-based testing)라 부르고, 테스트 대상의 동적 동작에 대한 명세에서 테스트 케이스를 끌어내는 [[black-box-testing#기법|behavior-based]] 블랙박스 기법으로 분류한다.[@istqb-ctal-ta-syllabus-2025]

## 시나리오 모델

시나리오 기반 테스트에서는 테스트 대상을 지나는 작업 흐름을 이루는 동작의 열로 시나리오 모델을 만든다. 사용자 조사, 사용자 스토리, 페르소나, 사용자 여정 지도 같은 기법이 가치 있는 시나리오를 찾는 데 도움이 될 수 있다. 시나리오 모델의 예로는 활동 다이어그램과 [[use-case|use case]]가 있다. 순서도, BPMN(Business Process Model and Notation) 다이어그램, 시퀀스 다이어그램, 협력 다이어그램도 시나리오 모델로 쓰인다.[@istqb-ctal-ta-syllabus-2025]

**활동 다이어그램**(activity diagram)은 시스템 안의 작업 흐름을 그림으로 나타낸 것이다. 업무 프로세스를 모델링하는 데 특히 쓸모가 있지만 제어 흐름도 모델링할 수 있다. 활동 다이어그램은 순서도의 표기를 넓혀 동시성을 모델링할 수 있게 한다. 주요 요소는 시작·끝 노드, 동작, 전이, 결정 노드, 병합 노드, 분기(fork) 노드, 결합(join) 노드, 스윔 레인이다.[@istqb-ctal-ta-syllabus-2025]

## Use case 테스트

**use case 테스트**는 use case의 동작을 실행하도록 테스트 케이스를 설계하는 블랙박스 기법이다.[@istqb-glossary-use-case-testing-2026]

use case는 사용자와 시스템 사이, 또는 시스템끼리의 상호작용을 나타내는 동작을 글이나 그림으로 기술한 것이다. use case 모델은 시나리오를 세 갈래로 가른다.[@istqb-ctal-ta-syllabus-2025]

- **주 시나리오**(main scenario): 사용자가 보기에 특정 목표를 이루는, 전형적이고 예상된 동작의 열이다. 흔히 "happy path"라 부른다. use case 하나에 주 시나리오는 하나뿐이다.
- **확장**(extension): 주 시나리오가 아닌 동작의 열로, 결국 주 시나리오의 목표를 이룬다. 대체 시나리오(alternative scenario)라고도 한다.
- **예외**(exception): 비정상적인 사용이나 무효 입력 같은 예상하지 못한 동작 때문에 주 시나리오의 목표를 이루지 못하는 동작의 열이다.[@istqb-ctal-ta-syllabus-2025]

![[diagrams/use-case-main-extension-exception.svg]]

## 커버리지

시나리오 기반 테스트에서는 시나리오를 [[test-coverage|커버리지 항목]]으로 삼아 테스트 케이스를 설계하고, 흔히 [[risk-based-testing|리스크 기반]]으로 우선순위를 매긴다. 시나리오 모델에 루프가 없으면 시나리오마다 따로 테스트 케이스를 두어, 모델의 모든 시나리오를 [[test-case#테스트 스위트|테스트 스위트]]로 실행할 수 있다. 루프가 있으면 시나리오(경로)의 수가 무한할 수 있고, 그때는 시나리오 모델에 simple loop 커버리지를 쓸 수 있다. **simple loop 커버리지**는 루프마다 다음 경우를 테스트하도록 요구한다.[@istqb-ctal-ta-syllabus-2025]

- 루프를 한 번도 실행하지 않음(건너뜀)
- 정확히 한 번 반복
- 한 번보다 많이, 곧 전형적인 횟수만큼 반복
- 할 수 있으면 최대 횟수만큼 반복[@istqb-ctal-ta-syllabus-2025]

식별한 시나리오의 수가 $N$이고 그 가운데 실행한 시나리오의 수가 $N_\mathrm{exec}$이면, 시나리오 기반 커버리지는 다음과 같다.[@istqb-ctal-ta-syllabus-2025]

$$
C = \frac{N_\mathrm{exec}}{N}
$$

시나리오는 시나리오 모델에 여러 커버리지 기준을 적용해 식별할 수 있다. 커버리지 기준에 따라서는 한 시나리오를 여러 번 테스트해야 한다. 예를 들어 시나리오에 나오는 변수에 [[equivalence-partitioning|동치 분할]]이나 [[boundary-value-analysis|경계값 분석]]의 커버리지를 더 요구하면, 한 시나리오를 테스트 케이스 여럿으로 테스트한다.[@istqb-ctal-ta-syllabus-2025]

## 테스트 레벨

시나리오 기반 테스트는 흔히 [[system-testing|시스템 테스트]]나 [[acceptance-testing|인수 테스트]]에서, 사용자 관점에서 시스템의 기능 적합성에 초점을 둔 종단 간(end-to-end) 테스트로 수행한다. 다른 [[software-testing#테스트 레벨|테스트 레벨]]에도 쓸 수 있다. 예를 들어 [[integration-testing|컴포넌트 통합 테스트]]에서는 상호작용 프로토콜에 바탕을 둔 시나리오를, [[unit-testing|컴포넌트 테스트]]에서는 상태를 갖는 객체 지향 클래스의 여러 메서드를 부르는 시나리오를 쓴다. 비기능 테스트에서도 쓰여, 신뢰성·유연성·호환성 테스트에 쓰는 [[test-type#신뢰성 테스트와 운용 프로파일|운용 프로파일]]의 요소가 시나리오가 되기도 한다.[@istqb-ctal-ta-syllabus-2025]
