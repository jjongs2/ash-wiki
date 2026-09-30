---
title: 예시 개념
tags:
  - network/can
aliases:
  - 예시
verified: 2026-09-20
---

픽스처용 첫 문장이다.[@example-spec-2024] 둘째 문장은 쉼표 앞에서 인용하고[@example-manual-2023], 셋째 문장은 같은 출처를 다시 인용한다.[@example-spec-2024]

## 동작

**예시**(Example)는 강조와 조사가 함께 렌더되는 꼴이다. [[example-standard|예시 표준]]으로 가는 위키링크가 있고, title이 슬러그와 같은 [[example-term]]은 표시 이름 없이 건다.

> [!note]
> 보충 설명이다.

![[example-diagram.svg]]

차동 전압 $V_\mathrm{diff} \ge 0.9\,\mathrm{V}$이면 dominant다. 전체 길이 $t_\mathrm{total}$은 세 길이 $t_\mathrm{A}$, $t_\mathrm{B}$, $t_\mathrm{C}$를 더한 값이다.

$$
t_\mathrm{total} = t_\mathrm{A} + t_\mathrm{B} + t_\mathrm{C}
$$

범위 표기는 1\~8 tq, 8\~25 tq처럼 이스케이프한다.

한 문단에 하나뿐인 범위 1~8 tq는 그대로 둔다.

인라인 수식 안의 $a~b$와 $c~d$도 그대로 둔다.

`[@not-a-citation]`과 `[[not-a-link]]`은 코드 안이라 검사하지 않는다.

명사구로 끝나는 목록 항목은 마침표를 따지지 않고, 문장으로 끝나는 항목은 마침표 뒤에 인용을 단다.

- 명사구로 끝나는 항목
- 정의 목록 항목: 명사구 풀이
- 문장으로 끝나는 항목이다.[@example-spec-2024]

## 예시 표준과의 차이

> [!warning]
> 틀리기 쉬운 점이다.

같은 페이지의 [[#동작]]과 다른 페이지의 [[example-standard#개정 이력(2024)|개정 이력]]처럼 있는 절로 가는 링크는 통과한다.
