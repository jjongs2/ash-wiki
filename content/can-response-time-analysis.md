---
title: CAN 응답 시간 분석
tags:
  - network/can
  - platform/rtos
verified: 2026-10-05
---

**CAN 응답 시간 분석**은 [[can|CAN]] 메시지마다 최악 응답 시간을 구해 그 메시지의 [[deadline|마감 시한]]과 견주는 [[schedulability-analysis|스케줄 가능성 분석]]이다. 메시지의 최악 응답 시간 $R_m$은 메시지를 보내게 한 사건이 일어난 때부터 그 메시지가 필요한 수신 노드에 받아지기까지 걸릴 수 있는 가장 긴 시간이다. 메시지는 $R_m$이 마감 시한 $D_m$ 이하일 때 스케줄 가능하고, 시스템은 모든 메시지가 스케줄 가능할 때 스케줄 가능하다.[@davis-can-schedulability-2007]

## 모델과 가정

CAN의 [[can-arbitration|중재]] 방식 때문에, 메시지는 모든 노드가 우선순위 큐 하나를 함께 쓰는 것처럼 버스에 나간다. 곧 CAN은 메시지를 비선점 [[fixed-priority-scheduling|고정 우선순위 스케줄링]]으로 보낸다. 이렇게 되려면 중재가 시작될 때마다 노드마다 큐에서 우선순위가 가장 높은 메시지가 중재에 들어가야 한다.[@davis-can-schedulability-2007]

분석은 아래 가정을 둔다.[@davis-can-schedulability-2007]

- 메시지 집합은 고정되어 있고, 메시지 $m$마다 고정된 [[can-identifier|식별자]], 곧 고유한 우선순위가 있다.
- 메시지는 호스트의 태스크나 인터럽트 처리기가 큐에 넣는다. 사건이 일어난 뒤 메시지가 큐에 들어가기까지는 0부터 큐잉 지터 $J_m$까지 걸린다.
- 메시지를 보내게 하는 사건 사이의 최소 간격 $T_m$을 메시지의 **주기**라 한다. 주기적 사건, 최소 간격이 $T_m$인 산발적 사건, 한 번만 일어나는 사건($T_m$이 무한대)을 모두 다룬다.
- 마감 시한 $D_m$은 사건이 일어난 때부터 메시지 송신을 성공적으로 마칠 때까지 허용되는 가장 긴 시간이다.[@davis-can-schedulability-2007]

컨트롤러의 송신 슬롯에 버퍼가 하나뿐이면 앞 인스턴스가 나가기 전에 새 데이터를 쓰면 앞 메시지를 잃으므로, 마감 시한이 주기 이하($D_m \le T_m$)라는 제약이 더 붙는다.[@davis-can-schedulability-2007]

## 전송 시간

[[can-bit-stuffing|스터프 비트]]가 가장 많이 들어가는 경우와 프레임 간 공간까지 넣으면, 데이터가 $s_m$바이트인 메시지 $m$의 최대 전송 시간 $C_m$은 아래와 같다. $t_\mathrm{bit}$는 한 비트의 전송 시간이고, $g$는 기본 포맷(11비트 식별자)에서 34, 확장 포맷(29비트 식별자)에서 54다.[@davis-can-schedulability-2007]

$$
C_m = \left( g + 8 s_m + 13 + \left\lfloor \frac{g + 8 s_m - 1}{4} \right\rfloor \right) t_\mathrm{bit}
$$

이 식은 기본 포맷에서 $C_m = (55 + 10 s_m)\,t_\mathrm{bit}$, 확장 포맷에서 $C_m = (80 + 10 s_m)\,t_\mathrm{bit}$가 된다.[@davis-can-schedulability-2007]

Bosch 기사에 따르면 Classical CAN에서 스터프 비트가 가장 많이 들어가는 비트열에서는 넣은 스터프 비트가 뒤따르는 같은 값 비트 4개와 함께 다시 같은 값 5비트를 이루어, 그 뒤에 또 스터프 비트가 들어간다.[@bosch-can-xl-clock-tolerances-2024]

## 응답 시간

메시지 $m$의 최악 응답 시간은 큐잉 지터 $J_m$, 큐잉 지연 $w_m$, 전송 시간 $C_m$의 합이다. **큐잉 지연**은 메시지가 컨트롤러의 슬롯이나 드라이버 큐에 머물다가 송신을 성공적으로 시작하기까지 걸리는 가장 긴 시간이다.[@davis-can-schedulability-2007]

$$
R_m = J_m + w_m + C_m
$$

큐잉 지연은 블로킹과 간섭으로 이루어진다. 블로킹은 메시지 $m$이 큐에 들어갈 때 이미 송신 중인 더 낮은 우선순위 메시지 때문에 생기고, 간섭은 중재에서 이겨 먼저 나가는 더 높은 우선순위 메시지 때문에 생긴다. 더 낮은 우선순위 메시지가 $m$이 큐에 들어가기 바로 직전에 송신을 시작할 때 블로킹이 가장 크다. 그래서 $m$보다 우선순위가 낮은 메시지의 집합을 $\mathrm{lp}(m)$이라 하면, 최대 블로킹 시간은 $B_m = \max_{k \in \mathrm{lp}(m)} C_k$다.[@davis-can-schedulability-2007]

![[diagrams/can-response-time-components.svg]]

최악 큐잉 지연은 가장 긴 더 낮은 우선순위 메시지가 송신을 시작한 직후에 시작하는 priority level-$m$ busy period 안의 어느 인스턴스에서 나온다. 이 busy period는 $m$이 더 높은 우선순위 메시지 모두와 함께 큐에 들어가고, 그 메시지들이 가장 짧은 간격으로 다시 큐에 들어가는 critical instant로 시작한다.[@davis-can-schedulability-2007] 선점 스케줄링의 busy period와 critical instant는 [[response-time-analysis|응답 시간 분석]]에서 다룬다.

## 여러 인스턴스

비선점이라, $m$이 송신을 마칠 때 더 높은 우선순위 메시지가 기다리고 있을 수 있고, busy period가 $T_m$을 넘어 이어질 수 있다. 그러면 busy period 안의 $m$의 인스턴스를 모두 따져야 한다.[@davis-can-schedulability-2007]

$m$ 이상의 우선순위를 가진 메시지의 집합을 $\mathrm{hep}(m)$이라 하면, busy period의 길이 $t_m$은 $t_m^0 = C_m$에서 시작해 값이 바뀌지 않을 때까지 아래 식을 되풀이해 구한다. 이 반복은 $\mathrm{hep}(m)$의 버스 이용률 $U_m$이 $U_m < 1$이면 끝난다.[@davis-can-schedulability-2007]

$$
U_m = \sum_{k \in \mathrm{hep}(m)} \frac{C_k}{T_k}
$$

$$
t_m^{n+1} = B_m + \sum_{k \in \mathrm{hep}(m)} \left\lceil \frac{t_m^n + J_k}{T_k} \right\rceil C_k
$$

busy period가 끝나기 전에 송신 준비가 되는 $m$의 인스턴스 수 $Q_m$은 아래와 같다.[@davis-can-schedulability-2007]

$$
Q_m = \left\lceil \frac{t_m + J_m}{T_m} \right\rceil
$$

인스턴스 $q$($q = 0, 1, \ldots, Q_m - 1$)가 busy period 시작부터 송신을 성공적으로 시작하기까지의 가장 긴 시간 $w_m(q)$는, $m$보다 우선순위가 높은 메시지의 집합을 $\mathrm{hp}(m)$이라 할 때 아래 식을 되풀이해 구한다.[@davis-can-schedulability-2007]

$$
w_m^{n+1}(q) = B_m + q\, C_m + \sum_{k \in \mathrm{hp}(m)} \left\lceil \frac{w_m^n(q) + J_k + t_\mathrm{bit}}{T_k} \right\rceil C_k
$$

인스턴스 $q$의 응답 시간 $R_m(q)$는 아래와 같고, 최악 응답 시간 $R_m$은 그 가운데 가장 큰 값이다. 이 분석은 마감 시한이 주기보다 긴 메시지에도 맞지만, 그때는 드라이버나 컨트롤러가 한 메시지의 인스턴스를 둘 이상 버퍼에 담아야 할 수 있다.[@davis-can-schedulability-2007]

$$
R_m(q) = J_m + w_m(q) - q\, T_m + C_m
$$

## 충분조건 검사

마감 시한이 주기 이하인 메시지에는 더 단순하지만 더 비관적인 충분조건 검사를 쓸 수 있다. 이 검사가 스케줄 가능하다고 판정한 시스템은 실제로 스케줄 가능하지만, 스케줄할 수 없다고 판정한 시스템이 실제로는 스케줄 가능할 수 있다.[@davis-can-schedulability-2007]

첫째 검사는 큐잉 지연 반복식의 블로킹 항을 $\max(B_m, C_m)$으로 둔다. 인스턴스 하나는 더 낮은 우선순위 메시지로 $B_m$만큼, 또는 자기 앞 인스턴스의 비선점 송신으로 $C_m$만큼 블로킹될 수 있다는 뜻이다.[@davis-can-schedulability-2007]

$$
w_m^{n+1} = \max(B_m, C_m) + \sum_{k \in \mathrm{hp}(m)} \left\lceil \frac{w_m^n + J_k + t_\mathrm{bit}}{T_k} \right\rceil C_k
$$

둘째 검사는 블로킹 항을 시스템과 상관없이 가장 긴 CAN 메시지(데이터 8바이트)의 전송 시간 $B^\mathrm{MAX}$로 둔다.[@davis-can-schedulability-2007]

## 오류 모델

길이 $t$인 구간에서 버스에 생길 수 있는 오류의 최대 수를 $t$에 대해 줄지 않는 함수 $F(t)$로 둔다. 비트 오류 하나는 최악의 경우 오류 복구에 31비트를 더 쓰고 그 메시지를 다시 보내게 하며, $m$을 늦추는 것은 $m$이나 더 높은 우선순위 메시지에 생긴 오류뿐이다. 그래서 오류 복구로 더해지는 최대 지연 $E_m(t)$는 아래와 같다.[@davis-can-schedulability-2007]

$$
E_m(t) = \left( 31\, t_\mathrm{bit} + \max_{k \in \mathrm{hep}(m)} C_k \right) F(t)
$$

busy period 식에는 $E_m(t_m^n)$을, 인스턴스마다의 큐잉 지연 식에는 $m$의 전송 시간까지 넣은 구간의 $E_m(w_m^n(q) + C_m)$을 더한다.[@davis-can-schedulability-2007]

## 우선순위 배정

다른 어떤 우선순위 배정 정책으로 스케줄할 수 있는 시스템을 모두 스케줄할 수 있는 정책을 최적이라 한다. [[fixed-priority-scheduling#우선순위 배정|deadline monotonic]] 배정과, 마감 시한에서 지터를 뺀 값으로 정하는 (D−J)-monotonic 배정은 비선점 스케줄링인 CAN에서 최적이 아니다.[@davis-can-schedulability-2007]

125 kbit/s, 11비트 식별자인 버스에서, 데이터 8바이트인 메시지 A·B(전송 시간 1.08 ms, 주기와 마감 시한 3.0 ms와 4.0 ms)와 데이터 1바이트인 메시지 C(0.52 ms, 4.5 ms)가 있고, 데이터 8바이트인 더 낮은 우선순위 메시지들도 있다고 하자. deadline monotonic 순서인 A, B, C로 우선순위를 주면 C는 최악의 경우 마감 시한 전에 송신을 시작하지도 못한다. A, C, B로 주면 최악 응답 시간이 A 2.16 ms, C 2.68 ms, B 3.76 ms로 모두 마감 시한을 지킨다.[@davis-can-schedulability-2007]

이 분석의 식에서 메시지의 최악 응답 시간은 더 높은 우선순위 메시지들의 순서에 좌우되지 않고, 우선순위를 높여도 길어지지 않는다. 그래서 CAN 메시지의 최적 우선순위 순서는 Audsley의 최적 우선순위 배정 알고리즘으로 정할 수 있다.[@davis-can-schedulability-2007] 이 알고리즘은 [[fixed-priority-scheduling#우선순위 배정|고정 우선순위 스케줄링]]에서 다룬다.

## 옛 분석과의 차이

Tindell, Burns, Wellings는 1995년 논문에서 CAN 메시지의 최악 응답 시간에 상한을 주는 분석을 내놓았다.[@tindell-calculating-can-1995] Tindell과 Burns(1994)와 Tindell 외(1994, 1995)의 분석은 busy period 안의 첫 인스턴스만 보았다. $D_m \le T_m$일 때 메시지가 스케줄 가능하면 busy period가 $T_m$ 안에 끝난다고 암묵적으로 가정한 것인데, 선점 스케줄링에서는 맞지만 비선점인 CAN에서는 맞지 않는다.[@davis-can-schedulability-2007]

Davis, Burns, Bril, Lukkien은 2007년 논문에서 이 결함을 보이는 반례를 들고, 여러 인스턴스를 따지는 분석으로 고쳤다. 125 kbit/s 버스에 전송 시간이 모두 1 ms인 메시지 A, B, C(주기 2.5 ms, 3.5 ms, 3.5 ms, 마감 시한 2.5 ms, 3.25 ms, 3.25 ms)가 있으면, 옛 분석은 최악 응답 시간을 2 ms, 3 ms, 3 ms로 내어 버스 이용률이 97%인데도 스케줄 가능하다고 판정했다. 실제로는 C의 둘째 인스턴스가 3.5 ms 걸려 마감 시한을 놓친다.[@davis-can-schedulability-2007]

옛 분석이 내는 최악 응답 시간은 우선순위가 가장 높은 메시지와 둘째로 높은 메시지에는 맞지만, 셋째로 높은 메시지부터 가장 낮은 메시지까지는 실제보다 짧을 수 있다. 다만 마감 시한이 주기 이하일 때, 전송 시간이 같거나 더 긴 더 낮은 우선순위 메시지가 하나라도 있는 메시지에는 옛 분석도 맞는 값을 낸다.[@davis-can-schedulability-2007]
