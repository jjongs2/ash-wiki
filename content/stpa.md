---
title: STPA
tags:
  - sw-engineering/functional-safety
aliases:
  - System-Theoretic Process Analysis
verified: 2026-10-12
---

**STPA**(System-Theoretic Process Analysis)는 확장된 사고 인과 모델에 바탕을 둔 [[hazard-analysis-and-risk-assessment#용어|해저드]] 분석 기법이다. 부품 failure에 더해, 어느 것도 고장 나지 않은 시스템 구성 요소 사이의 안전하지 않은 상호작용도 사고를 일으킬 수 있다고 본다. 분석에 소프트웨어와 사람 운용자를 넣고, 초기 개념 분석부터 쓸 수 있어 [[safety-requirement|안전 요구사항]]과 제약을 찾는 데 쓰인다.[@leveson-stpa-handbook-2018]

## 이론적 바탕

STPA의 이론적 바탕은 시스템 이론에 기반한 사고 인과 모델인 **STAMP**(System-Theoretic Accident Model and Processes)다. STAMP는 인과를 직접 이어진 failure 사건이나 부품 failure의 사슬 너머로 넓혀, 더 복잡한 프로세스와 구성 요소 사이의 안전하지 않은 상호작용까지 넣는다. STAMP에서 안전은 failure 예방 문제가 아니라 동적 제어 문제이고, 강조점은 failure 예방에서 시스템 거동에 제약을 강제하는 것으로 옮겨 간다. STAMP는 분석 방법이 아니라 사고가 어떻게 일어나는지에 대한 모델, 곧 가정의 묶음이다. [[safety-analysis#FTA|FTA]] 같은 기존 [[safety-analysis|안전 분석]] 기법이 바탕으로 하는 failure 사건 사슬 모델의 대안이며, failure 사건 사슬 모델은 STAMP의 부분집합이다.[@leveson-stpa-handbook-2018]

## 기본 STPA의 네 단계

Leveson과 Thomas는 2018년 3월 STPA Handbook을 펴냈다.[@leveson-stpa-handbook-2018]

기본 STPA는 네 단계로 이뤄진다.[@leveson-stpa-handbook-2018]

1. 분석의 목적 정의: 분석이 막으려는 loss와, 분석할 시스템과 그 경계를 정한다. Loss 식별, 시스템 수준 hazard 식별, 시스템 수준 제약 식별, hazard 세분(선택)의 네 부분으로 이뤄진다.
2. 제어 구조 모델링: 시스템을 피드백 제어 루프의 집합으로 모델링해 기능 관계와 상호작용을 담는다. 제어 구조는 대개 아주 추상적인 수준에서 시작해 되풀이하며 세분된다.
3. 제어 동작 분석: 제어 구조의 제어 동작이 첫 단계의 loss로 어떻게 이어질 수 있는지 살핀다. 여기서 찾은 unsafe control action으로 시스템의 기능 요구사항과 제약을 만든다.
4. Loss scenario 식별: 시스템에서 안전하지 않은 제어가 왜 일어날 수 있는지 밝힌다.[@leveson-stpa-handbook-2018]

## Loss와 hazard

STPA에서 **loss**는 이해관계자에게 가치 있는 것을 잃는 것이다. 사람의 죽음이나 부상, 재산 피해, 환경 오염, 임무 실패, 평판 손실, 민감 정보의 유출처럼 이해관계자가 받아들일 수 없는 모든 손실이 든다. **Hazard**는 특정한 최악의 환경 조건과 함께 loss로 이어질 시스템 상태나 조건의 집합이다. Loss에는 시스템 설계자가 일부만 제어하거나 전혀 제어하지 못하는 환경이 걸릴 수 있다는 것이 hazard와 loss를 가르는 주된 까닭이다.[@leveson-stpa-handbook-2018]

[[iso-26262|ISO 26262]]-1:2018은 hazard를 아이템의 오동작이 일으키는 해의 잠재적 원천으로 정의한다.[@iso-26262-1-obp-2018]

## 제어 구조와 unsafe control action

**계층적 제어 구조**(hierarchical control structure)는 피드백 제어 루프로 이뤄진 시스템 모델이다. 효과적인 제어 구조는 전체 시스템의 거동에 제약을 강제한다. 제어 루프에서 제어기는 목표를 이루려고 결정을 내리고, 제어 동작을 내어 피제어 프로세스를 제어하며 그 거동에 제약을 강제한다.[@leveson-stpa-handbook-2018]

![[diagrams/stpa-control-loop.svg]]

**UCA**(Unsafe Control Action)는 특정 context와 최악의 환경에서 hazard로 이어질 제어 동작이다. 제어 동작이 안전하지 않게 되는 방식은 네 가지다.[@leveson-stpa-handbook-2018]

- 제어 동작을 내지 않아 hazard로 이어진다.
- 제어 동작을 내서 hazard로 이어진다.
- 안전할 수 있는 제어 동작을 너무 이르게, 너무 늦게, 또는 잘못된 순서로 낸다.
- 연속 제어 동작이 너무 오래 이어지거나 너무 일찍 멈춘다.[@leveson-stpa-handbook-2018]

UCA는 저마다 하나 이상의 hazard로 추적할 수 있고, 그 추적을 UCA 끝에 대괄호로 적어 두는 것이 좋은 관행이다. **Loss scenario**는 UCA와 hazard로 이어질 수 있는 인과 요인을 기술한 것이다. Loss scenario는 잘못된 피드백, 부적절한 요구사항, 설계 오류, 부품 failure 같은 요인이 어떻게 UCA를 낳아 loss에 이르는지와, 안전한 제어 동작이 주어졌는데도 제대로 따르거나 실행되지 않아 loss에 이르는지를 설명한다.[@leveson-stpa-handbook-2018]

## 다른 시스템 성질로의 확장

STAMP는 어떤 창발적 성질에도 적용되므로, STPA는 [[cybersecurity|사이버보안]]을 포함한 어떤 시스템 성질에도 쓸 수 있다. 분석의 목적을 정하는 단계에서 사람의 생명 같은 전통적 안전 목표 말고도 보안, 프라이버시, 성능 같은 성질로 넓힐지를 정하고, 제어 구조 모델링과 제어 동작 분석 단계는 어느 성질에 적용하든 바뀌지 않는다.[@leveson-stpa-handbook-2018]

## 자동차 예

부록 B는 자동차 적응형 순항 제어 시스템과 auto-hold 시스템의 제어 구조를, 부록 C는 auto-hold 시스템의 UCA 표를 예로 든다.[@leveson-stpa-handbook-2018]

## SAE의 STPA 표준

SAE J3187:2022는 자동차 관련 safety-critical 시스템의 평가에 STPA를 적용하는 권고 실무로 2022년 2월 처음 나왔다.[@sae-j3187-2022] SAE J3187:2023은 2023년 5월에 나온 개정판으로, 어느 산업의 safety-critical 시스템에든 STPA를 적용하는 권고 실무를 둔다.[@sae-j3187-2023] SAE J3187-2:2023은 STPA를 [[sotif|SOTIF]] 평가에 적용하는 권고 실무를 둔다.[@sae-j3187-2-2023] SAE J3307:2025는 모든 산업의 safety-critical 제품과 시스템에 STPA를 수행하는 데 필요한 것을 정하는 기술 표준으로, 용어, STPA의 단계, 활동 흐름, 산출물을 정한다.[@sae-j3307-2025]
