---
title: 프로세스 능력 수준
tags:
  - process/sw-process
aliases:
  - capability level
verified: 2026-10-02
---

**프로세스 능력 수준**(process capability level)은 프로세스를 프로세스 능력의 순서 척도 위에서 나타낸 것이다. 프로세스 능력은 프로세스가 현재나 예상되는 비즈니스 목표를 맞추는 능력이다. ISO/IEC 33020:2019는 프로세스 능력 평가를 받치는 측정 프레임워크를 정의하고, 이 프레임워크는 프로세스 속성 등급을 내고 거기서 프로세스 능력 수준을 끌어낸다.[@iso-iec-33020-obp-2019]

## 수준과 프로세스 속성

[[automotive-spice|ASPICE]] 4.1은 ISO/IEC 33020:2019를 고쳐 맞춘 자체 측정 프레임워크를 둔다. 이 프레임워크는 CL(capability level) 0부터 CL 5까지 여섯 능력 수준을 두고, 수준은 프로세스 하나마다 그 프로세스의 프로세스 속성 등급으로 정한다. 수준마다의 뜻은 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| 수준 | 이름                | 뜻                                                                                                                       |
| ---- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CL 0 | Incomplete process  | 프로세스를 수행하지 않았거나 목적을 이루지 못한다.                                                                       |
| CL 1 | Performed process   | 수행한 프로세스가 목적을 이룬다.                                                                                         |
| CL 2 | Managed process     | 프로세스 수행을 계획하고 감시하고 조정하며, 산출물을 적절히 만들고 통제하고 유지한다.                                    |
| CL 3 | Established process | 표준 프로세스를 바탕으로 한 정의된 프로세스로 수행해 프로세스 결과를 이룬다.                                             |
| CL 4 | Predictable process | 정한 한계 안에서 예측할 수 있게 수행한다. 정량 관리 요구를 정하고 측정 데이터를 모아 분석해 변동의 원인을 찾고 시정한다. |
| CL 5 | Innovating process  | 조직의 변화에 대응하도록 프로세스를 지속적으로 개선한다.                                                                 |

이 표준은 CL 1부터 CL 5까지 수준마다 **프로세스 속성**(process attribute, PA)을 배정한다. CL 0에는 프로세스 속성이 없다.[@vda-automotive-spice-pam-4-1-2026]

| 프로세스 속성 | 이름                              | 수준 |
| ------------- | --------------------------------- | ---- |
| PA 1.1        | Process performance               | CL 1 |
| PA 2.1        | Performance management            | CL 2 |
| PA 2.2        | Work product management           | CL 2 |
| PA 3.1        | Process definition                | CL 3 |
| PA 3.2        | Process deployment                | CL 3 |
| PA 4.1        | Quantitative analysis             | CL 4 |
| PA 4.2        | Quantitative control              | CL 4 |
| PA 5.1        | Process innovation                | CL 5 |
| PA 5.2        | Process innovation implementation | CL 5 |

PA 2.1은 프로세스 수행을 계획하고, 감시하고, 계획에 맞게 조정하기를 요구한다.[@vda-automotive-spice-pam-4-1-2026]

## 등급 척도

ASPICE 4.1은 프로세스 속성의 달성 정도 $a$를 N(Not achieved), P(Partially achieved), L(Largely achieved), F(Fully achieved) 네 등급으로 평정한다. N은 $0\% \le a \le 15\%$, P는 $15\% < a \le 50\%$, L은 $50\% < a \le 85\%$, F는 $85\% < a \le 100\%$다. P와 L은 다시 둘로 나누는 세분 척도도 둔다. P-는 $15\% < a \le 32.5\%$, P+는 $32.5\% < a \le 50\%$, L-는 $50\% < a \le 67.5\%$, L+는 $67.5\% < a \le 85\%$다.[@vda-automotive-spice-pam-4-1-2026]

![[diagrams/aspice-pa-rating-scale.svg]]

등급마다의 뜻은 다음과 같다.[@vda-automotive-spice-pam-4-1-2026]

| 등급 | 뜻                                                                        |
| ---- | ------------------------------------------------------------------------- |
| N    | 프로세스 속성을 이뤘다는 증거가 거의 없거나 없다.                         |
| P    | 접근과 달성의 증거가 일부 있으나, 달성의 일부 면은 예측하지 못할 수 있다. |
| L    | 체계적 접근과 상당한 달성의 증거가 있으나, 약점이 일부 있을 수 있다.      |
| F    | 완전하고 체계적인 접근과 완전한 달성의 증거가 있고, 중대한 약점이 없다.   |

## 수준 달성 판정

ASPICE 4.1은 어떤 수준을 이루려면 그 수준의 프로세스 속성이 L이나 F이고, 그보다 낮은 수준의 프로세스 속성이 모두 F여야 한다고 정한다. 예를 들어 CL 2는 PA 1.1이 F이고, PA 2.1, PA 2.2가 모두 L이나 F일 때 이룬다.[@vda-automotive-spice-pam-4-1-2026]

## CL 3과 표준 프로세스

ASPICE 4.1은 CL 3에서 표준 프로세스를 개발·유지하고 테일러링 지침을 정하며(PA 3.1), 표준 프로세스를 고르거나 테일러링해 정의된 프로세스로 배치하기를(PA 3.2) 요구한다.[@vda-automotive-spice-pam-4-1-2026] 두 용어는 ISO/IEC 33001:2015가 다음처럼 정의한다.[@iso-iec-33001-obp-2015]

- **표준 프로세스**(standard process): 조직 안의 프로세스를 이끄는 프로세스 정의의 집합. 프로젝트에서 구현하는 정의된 프로세스에 들어가야 할 기본 프로세스 요소와 그 관계를 담는다.
- **테일러링**(tailoring): 프로젝트가 목표, 제약, 환경에 맞게 조직의 표준 프로세스를 고쳐 정의된 프로세스를 만드는 일. 조직의 테일러링 지침을 따른다.[@iso-iec-33001-obp-2015]

ISO/IEC 33001:2015는 정의된 프로세스가 산출물, 측정치, 프로세스 개선 정보를 조직의 프로세스 자산에 보탠다고 둔다.[@iso-iec-33001-obp-2015]
