---
title: Hardware architectural metrics
tags:
  - sw-engineering/functional-safety
verified: 2026-10-12
---

[[iso-26262|ISO 26262]]-1:2018은 **hardware architectural metrics**를 하드웨어 아키텍처가 안전 면에서 얼마나 효과적인지 평가하는 메트릭으로 정의한다. 정의의 주석은 single-point fault 메트릭과 latent fault 메트릭을 hardware architectural metrics로 제시한다.[@iso-26262-1-obp-2018]

ISO 26262-5:2018은 하드웨어 수준 제품 개발의 요구사항을 정하며, 여기에 hardware architectural metrics의 평가와 [[functional-safety#Systematic failure와 random hardware failure|random hardware failure]]로 인한 [[hazard-analysis-and-risk-assessment#Safety goal|safety goal]] 위반의 평가가 든다. 이 표준은 8절에서 hardware architectural metrics의 평가를, 9절에서 random hardware failure로 인한 safety goal 위반의 평가를 다룬다. 이 표준의 하드웨어 요소 요구사항은 프로그래머블 요소와 비프로그래머블 요소에 모두 적용한다.[@iso-26262-5-obp-2018]

## Fault와 failure의 종류

ISO 26262-1:2018은 하드웨어 [[fault-error-failure|fault]]와 그것이 낳는 failure의 종류를 다음처럼 정의한다.[@iso-26262-1-obp-2018]

- **Single-point fault**: 요소 안에서 safety goal 위반에 바로 이르고, 그 요소의 어떤 fault도 [[safety-mechanism|안전 메커니즘]]이 덮지 않는 하드웨어 fault. 정의의 주석은 하드웨어 요소에 안전 메커니즘이 하나라도 정의되어 있으면(예: 마이크로컨트롤러의 [[safety-mechanism#Watchdog|watchdog]]) 그 요소의 fault는 single-point fault가 아니라고 제시한다.
- **Single-point failure**: single-point fault에서 비롯한 failure
- **Residual fault**: 하드웨어 요소에서 일어난 random hardware fault 가운데, 안전 메커니즘이 제어하지 않으면서 그 자체로 safety goal 위반에 이르는 부분. 정의의 주석은 하드웨어 요소의 fault 가운데 일부만 안전 메커니즘이 덮는다는 전제를 제시한다. 정의의 예는 안전과 관련 있고 safe fault가 아닌 fault 집합의 60%를 안전 메커니즘이 덮으면, 그것이 제어하지 않는 나머지 40%가 residual fault라는 것을 든다.
- **Multiple-point fault**: 다른 독립 fault와 겹쳐, 검출되지도 인지되지도 않으면 multiple-point failure에 이를 수 있는 개별 fault. 정의의 주석은 multiple-point fault를 fault tree의 cut set 분석 등으로 multiple-point failure를 찾은 뒤에야 알아볼 수 있다고 제시한다.
- **Multiple-point failure**: 독립된 하드웨어 fault 여럿이 겹쳐 safety goal 위반에 바로 이르는 failure
- **Latent fault**: [[fault-tolerant-time-interval#시간 구간과 운용 모드|multiple-point fault detection time interval]] 안에 안전 메커니즘이 검출하지 못하고 운전자도 인지하지 못한 multiple-point fault
- **Dual-point fault**: 다른 독립 fault와 겹쳐 dual-point failure에 이르는 개별 fault. 정의의 주석은 dual-point fault도 cut set 분석 등으로 dual-point failure를 찾은 뒤에야 알아볼 수 있다고 제시한다.
- **Dual-point failure**: 독립된 하드웨어 fault 둘이 겹쳐 safety goal 위반에 바로 이르는 failure. 정의의 주석은 dual-point failure를 차수 2의 multiple-point failure로 제시하고, ISO 26262 시리즈가 다루는 dual-point failure에 한 fault는 안전 관련 요소에, 다른 fault는 안전 상태를 이루거나 유지하려는 해당 안전 메커니즘에 영향을 주는 경우가 든다고 제시한다.
- **Safe fault**: 일어나도 safety goal 위반 확률을 크게 높이지 않는 fault. 정의의 주석은 안전 관련 요소와 안전과 무관한 요소가 모두 safe fault를 가질 수 있고, single-point fault, residual fault, dual-point fault는 safe fault가 아니며, [[safety-requirement#요구사항의 전개|safety concept]]에서 관련 있다고 보이지 않는 한 차수가 2보다 높은 multiple-point fault는 safe fault로 볼 수 있다고 제시한다.[@iso-26262-1-obp-2018]

![[diagrams/residual-fault-coverage-example.svg]]

이 표준은 fault가 검출되거나 인지되는지에 따라서도 이름을 둔다. **Detected fault**는 정해진 시간 안에 안전 메커니즘이 그 존재를 검출한 fault이고, **perceived fault**는 차량 수준에서 벗어난 거동을 거쳐 간접으로 인지될 수 있는 fault다. Detected fault 정의의 주석은 그 정해진 시간으로 [[fault-tolerant-time-interval#시간 구간과 운용 모드|FDTI]]나 multiple-point fault detection time interval을 제시한다.[@iso-26262-1-obp-2018]

## 진단 커버리지와 failure rate

이 표준은 **진단 커버리지**(diagnostic coverage)를 하드웨어 요소의 failure rate, 또는 하드웨어 요소의 한 [[safety-analysis#FMEA|failure mode]]의 failure rate 가운데 구현된 안전 메커니즘이 검출하거나 제어하는 비율로 정의한다. 정의의 주석은 진단 커버리지를 residual fault나 latent multiple-point fault에 대해 평가할 수 있고, 아키텍처의 여러 수준에 구현된 안전 메커니즘을 고려할 수 있으며, 따로 밝히지 않으면 안전 관련 하드웨어 요소의 safe fault 비율은 진단 커버리지를 정할 때 고려하지 않는다고 제시한다. **FMC**(Failure Mode Coverage)는 하드웨어 요소의 한 failure mode의 failure rate 가운데 구현된 안전 메커니즘이 검출하거나 제어하는 비율이다.[@iso-26262-1-obp-2018]

이 표준은 **failure rate**를 하드웨어 요소의 failure 확률 밀도를 생존 확률로 나눈 것으로 정의하고, 주석은 failure rate를 상수로 가정하며 흔히 $\lambda$로 나타낸다고 제시한다. **BFR**(Base Failure Rate)은 주어진 응용 use case에서 하드웨어 요소의 failure rate로, [[safety-analysis|안전 분석]]의 입력으로 쓴다.[@iso-26262-1-obp-2018]

이 표준은 **dedicated measure**를 safety goal 위반 확률을 평가할 때 내세운 failure rate를 보장하는 조치로 정의한다. 정의의 예는 하드웨어 부품의 과설계(전기·열 스트레스 정격)나 물리적 분리(인쇄 회로 기판의 접점 간격) 같은 설계 특징, safety goal 위반에 기여하는 failure mode가 일어날 리스크를 줄이는 입고 자재의 특별 샘플 시험, 번인 시험, 전용 관리 계획을 든다.[@iso-26262-1-obp-2018]
