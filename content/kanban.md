---
title: Kanban
tags:
  - sw-engineering/sw-process
verified: 2026-10-12
---

The Kanban Guide 2025.5는 **Kanban**을, 프로세스를 거쳐 가는 가치의 흐름을 최적화하는 전략으로 정의한다. 이 가이드는 Kanban과 같은 이론에 바탕을 둔 기존의 가치 지향 접근법이 많으므로, Kanban으로 그 접근법들의 인도 기법을 보강할 수 있고 그래야 한다고 둔다.[@kanbanguides-kanban-guide-2025] Kanban University의 Kanban Method 가이드는 Kanban을 방법론이나 프로세스 프레임워크가 아닌 관리 방법으로 둔다. Kanban은 이미 쓰고 있는 프로세스나 일하는 방식을 대신하지 않고, 그 위에 더해 쓴다.[@kanban-university-kanban-guide-2026]

ISO/IEC/IEEE 24765 용어집은 Kanban board를, 병목과 지나친 약속을 찾도록 진행 중인 작업을 보여 주어 팀이 워크플로를 최적화하게 하는 시각화 도구로 정의한다. 소프트웨어 개발에서는 개발자가 태스크 백로그에서 태스크를 끌어오는(pull) 작업을 시각적으로 나타낸 것으로도 정의한다.[@ieee-cs-sevocab-2026]

## 실천

The Kanban Guide 2025.5는 Kanban을 함께 맞물려 돌아가는 세 실천, 곧 워크플로의 정의와 시각화, 워크플로 안 항목의 능동적 관리, 워크플로의 개선으로 구성한다. 이 실천을 구현한 것을 **Kanban 시스템**이라 하고, Kanban 시스템으로 가치를 인도하는 데 참여하는 사람을 **Kanban 시스템 구성원**이라 한다.[@kanbanguides-kanban-guide-2025]

### 워크플로의 정의와 시각화

가이드는 주어진 맥락에서 흐름이 무엇인지를 구성원이 명시적으로 함께 이해한 것을 **Definition of Workflow**라 하고, 이를 Kanban의 기본 개념으로 둔다. 구성원은 적어도 아래 요소를 모두 갖춰 Definition of Workflow를 만들어야 하고, 요소를 갖추는 순서는 상관없다.[@kanbanguides-kanban-guide-2025]

- 워크플로를 거쳐 가는 가치의 개별 단위, 곧 작업 항목(work item)의 정의
- 작업 항목이 워크플로에서 시작되고 끝나는 시점의 정의. 작업 항목에 따라 시작점이나 끝점이 둘 이상일 수 있다.
- 작업 항목이 시작부터 끝까지 거쳐 가는 상태 하나 이상. 시작점과 끝점 사이에 있는 작업 항목을 **WIP**(work in progress)라 한다.
- 시작부터 끝까지 WIP를 어떻게 통제할지의 정의
- 작업 항목이 각 상태를 어떻게 거쳐 갈 수 있는지에 대한 명시적인 정책
- **SLE**(service level expectation): 작업 항목 하나가 시작부터 끝까지 가는 데 얼마나 걸릴지의 예측. 경과 시간과 그 시간에 붙는 확률 두 부분으로 이루어지며(예: 작업 항목의 85%가 8일 안에 끝난다), 과거의 cycle time에 바탕을 둔다.[@kanbanguides-kanban-guide-2025]

가이드는 Definition of Workflow를 시각화한 것을 **Kanban 보드**라 하고, Definition of Workflow의 최소 요소만이라도 Kanban 보드에 드러내는 것을 흐름을 최적으로 운영하고 계속 개선하는 데 꼭 필요한 일로 둔다. 시각화가 어떤 모양이어야 하는지는 정하지 않는다.[@kanbanguides-kanban-guide-2025]

### 항목의 능동적 관리

가이드는 워크플로 안의 항목을 능동적으로 관리해야 한다고 정한다. 관리에는 WIP 통제, SLE를 기준 삼아 작업 항목이 쓸데없이 오래 머물지 않게 하는 일, 막힌 작업을 푸는 일이 든다. 구성원은 시작부터 끝까지 워크플로 안의 작업 항목 수를 명시적으로 통제해야 하고, 그 통제를 Kanban 보드에 어떻게 나타낼지는 구성원이 정한다.[@kanbanguides-kanban-guide-2025]

The Kanban Guide 2025.5와 Kanban University의 Kanban Method 가이드는 모두 WIP 제한이 pull 시스템을 만든다고 보고, 용량이 있다는 신호가 있을 때만 새 작업 항목을 끌어와 시작하도록 둔다.[@kanbanguides-kanban-guide-2025][@kanban-university-kanban-guide-2026]

### 워크플로의 개선

The Kanban Guide 2025.5는 구성원이 효과성, 효율성, 예측 가능성의 균형을 더 낫게 하도록 워크플로를 계속 개선할 책임을 진다고 둔다. 정해진 주기의 회의를 기다리지 않고 맥락에 따라 그때그때 Definition of Workflow를 바꿀 수 있고, 개선이 작거나 점진적이어야 한다는 규정도 없다.[@kanbanguides-kanban-guide-2025]

## 흐름 지표

가이드는 Kanban을 적용하려면 흐름 지표의 최소 집합을 모으고 분석해야 한다고 정하고, 반드시 추적할 지표로 아래 넷을 둔다.[@kanbanguides-kanban-guide-2025]

| 지표          | 뜻                                              |
| ------------- | ----------------------------------------------- |
| WIP           | 시작했지만 끝나지 않은 작업 항목의 수           |
| Throughput    | 단위 시간마다 끝난 작업 항목의 수               |
| Work Item Age | 작업 항목이 시작된 때부터 지금까지 지난 시간    |
| Cycle Time    | 작업 항목이 시작된 때부터 끝난 때까지 지난 시간 |

이 지표는 세 실천 가운데 하나 이상에 쓸 정보를 줄 때만 의미가 있다. 가이드가 정한 대로 쓰기만 하면 지표를 다른 이름으로 불러도 되고, 맥락에 맞는 지표를 더 써도 된다.[@kanbanguides-kanban-guide-2025]

![[diagrams/kanban-flow-metrics.svg]]

## Kanban Method

Kanban University의 Kanban Method 가이드는 모든 Kanban 구현에 공통인 변화 관리 원칙 셋을 둔다.[@kanban-university-kanban-guide-2026]

- 지금 하는 일에서 시작한다.
- 진화적 변화로 개선을 추구하기로 합의한다.
- 모든 수준에서 리더십 행동을 북돋운다.[@kanban-university-kanban-guide-2026]

이 가이드는 일반 실천으로 아래 여섯을 둔다.[@kanban-university-kanban-guide-2026]

| 실천                      | 내용                                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 시각화                    | 드러나지 않던 작업과 그 흐름을 보이게 해 투명성을 높인다.                                                                     |
| WIP 제한                  | 진행 중인 작업 항목의 수를 제한해 이용률과 흐름의 균형을 잡는다.                                                              |
| 흐름 관리                 | 지속 가능한 속도를 지키면서 작업을 되도록 매끄럽고 예측 가능하게 끝낸다.                                                      |
| 정책 명시                 | Kanban 보드 채우기, 작업 항목을 다음으로 넘기는 기준, WIP 한도처럼 작업을 조직하는 정책을 관련된 모두가 함께 합의해 드러낸다. |
| 피드백 루프 구현          | Kanban 보드, 지표, cadence라 부르는 정기 회의와 리뷰로 인도를 조율하고 개선한다.                                              |
| 협력적 개선과 실험적 진화 | 모델과 과학적 방법에 바탕을 둔 실험으로 변화를 만들고, 결과가 좋지 않으면 이전 상태로 되돌린다.                               |

## 기원

Kanban은 Lean에 바탕을 둔다.[@kanbanguides-kanban-guide-2025][@kanban-university-kanban-guide-2026]

The Kanban Guide 2025.5에 따르면 Kanban은 Toyota Production System과 그 앞선 것들, Taiichi Ohno와 W. Edwards Deming 같은 사람들의 작업으로 거슬러 올라간다. 지식 노동을 위한 실천 묶음은 주로 2006년 Corbis의 한 팀에서 나왔다.[@kanbanguides-kanban-guide-2025]

## 가이드의 판

The Kanban Guide는 2020년 7월, 2020년 12월, 2025년 5월에 판이 나왔다.[@kanbanguides-history-2026] The Kanban Guide 2025.5 페이지의 판 선택기는 세 판을 v2020.7, v2020.12, v2025.5로 부른다.[@kanbanguides-kanban-guide-2025]

The Kanban Guide 2025.5는 앞 판에서 다음을 바꿨다.[@kanbanguides-kanban-guide-2025]

- Kanban, Kanban 시스템, 이해관계자, 가치, 리스크, 시각화 같은 용어의 쓰임을 정한 규약을 더했다.
- 가치를 실현하는 대상을 고객에 한정하지 않고 이해관계자로 넓혔다.
- Kanban의 정의를 지식 노동에 맞춰 더 단순하게 했다.
- SLE를 Definition of Workflow 절로 옮겼다.
- WIP를 어떻게 통제하는지를 덜 명시적으로, 곧 더 유연하게 했다.
- Definition of Workflow를 여럿 두는 것, 변동, 흐름과 가치 실현의 연결을 더 분명히 했다.
- 세 실천을 단순하게 하고, 항목을 고른다(select)는 말을 더 자주 쓴다.
- Kanban Measures를 Flow Metrics로 이름을 바꿨다.
- 흐름 지표의 이름을 유연하게 쓸 수 있음을 더 분명히 했다.
- Kanban이 바뀌지 않는다는 언급을 지웠다.[@kanbanguides-kanban-guide-2025]
