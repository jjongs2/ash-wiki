---
title: Use case
tags:
  - process/sw-process
verified: 2026-10-12
---

UML(Unified Modeling Language) 2.5.1은 **use case**를 시스템의 요구사항, 곧 시스템이 무엇을 해야 하는지를 담는 수단으로 정한다. 이 명세가 use case에 대해 정하는 핵심 개념은 액터(actor), use case, subject다. subject는 use case가 적용되는, 고려 대상인 시스템이고, 액터는 subject와 상호작용할 수 있는 사용자와 다른 시스템을 나타낸다. use case는 행위의 명세이고, use case의 인스턴스는 그 use case를 따르는 창발적 행위가 한 번 일어난 것을 가리킨다.[@omg-uml-2-5-1-2017]

![[diagrams/use-case-subject-actors.svg]]

## 정의

ISO/IEC/IEEE 24765 용어집은 use case를 UML에서 액터에게 가치 있는 측정 가능한 결과를 주는 시스템의 완결된 작업으로, 시스템의 행위 요구사항과 시스템이 사용자와 주고받는 상호작용을 기술한 것으로, 그리고 시스템이나 다른 개체가 액터와 상호작용하며 수행할 수 있는 동작의 순서를 변형까지 포함해 명세한 것으로 정의한다. 더 정형적으로는 use case가 use case 인스턴스나 시나리오의 집합을 정의한다고 주석으로 둔다. 같은 용어집은 **시나리오**(scenario)를 동시에 또는 차례로 일어나는 일련의 사건을 단계별로 기술한 것으로 정의하고, 사용자 스토리, use case, operational concept, 소프트웨어가 마주칠 수 있는 사건의 순서가 시나리오일 수 있다고 주석으로 둔다.[@ieee-cs-sevocab-2026]

## Use case 명세

SWEBOK V4.0a에 따르면 use case 명세 템플릿은 요구사항을 표현하는 방식에 제약을 걸어 정밀하고 간결하게 만드는 [[software-requirements-specification#명세 기법|구조 자연어 요구사항 명세]]의 한 예다. 항공편 예약 use case를 예로 든 템플릿은 use case 번호와 이름, 시작 사건(triggering event), 파라미터, 전제(requires), 보장(guarantees), 정상 흐름, 대안 흐름, 예외를 칸으로 둔다.[@ieee-swebok-v4-0a-2026]

use case 모델링은 상호작용 다이어그램, 상태 모델링과 함께 모델 기반 요구사항 명세가 수행할 프로세스를 명세하는 데 쓰는 행위 모델의 하나다.[@ieee-swebok-v4-0a-2026]

## 아키텍처 평가에서의 쓰임

use case는 아키텍처의 완전성과 일관성을 점검하는 데 자주 쓰인다. use case의 단계를 그 단계를 수행하는 데 관여할 [[software-architecture|소프트웨어 아키텍처]] 요소와 견주는 방식이다.[@ieee-swebok-v4-0a-2026]
