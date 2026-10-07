---
title: 비주기 서버
tags:
  - platform/rtos
verified: 2026-10-07
---

**비주기 서버**(aperiodic server)는 주기적이지 않은 태스크를 실행 용량이 정해진 서버 태스크가 처리하게 하여, 비주기 태스크를 엄격한 [[periodic-task-model|주기 태스크 모델]] 안에서 다루게 하는 방식이다.[@sha-real-time-scheduling-theory-2004] [[ieee-1003-1|POSIX]] 근거 문서에 따르면 sporadic server는 비주기 프로세스나 스레드를 주기적인 것처럼 다루게 해 실시간 시스템의 스케줄 가능성 분석을 단순하게 한다.[@ieee-1003-1-rationale-sporadic-server-2024]

## Background 처리와 polling

주기적이지 않은 태스크를 다루는 간단한 방법은 hard 마감 시한이 있는 태스크보다 낮은 우선순위를 주어 background 처리로 돌리는 것이다. 그런 태스크가 여럿이고 서비스 품질이나 평균 응답 시간 요구가 있으면 background 처리로는 대개 부족하다.[@sha-real-time-scheduling-theory-2004] background 처리는 프로세서가 주기 태스크를 실행하지 않고 놀 때만 비주기 요청을 처리하므로, 주기 태스크의 부하가 높으면 처리할 기회가 드물고 평균 응답 시간이 길어질 수 있다.[@sprunt-sporadic-aperiodic-1989]

**polling server**는 우선순위와 실행 용량이 고정된 주기 태스크로, 주기마다 release되어 그 용량으로 비주기 태스크를 처리한다. 용량은 오프라인으로 계산하며, 대개 hard 마감 시한의 주기 태스크 집합의 스케줄 가능성을 보장할 수 있는 가장 큰 값으로 정한다. 용량을 다 쓰면 다음 release까지 실행을 멈춘다. polling server는 주기 태스크처럼 동작하므로 주기 태스크의 스케줄 가능성 분석을 그대로 쓸 수 있다. 다만 비주기 job이 용량을 넘는 버스트로 도착하면 일부는 다음 release까지 기다려야 하고, release될 때 준비된 job이 없으면 그 주기에 예약한 높은 우선순위 용량은 버려진다.[@sha-real-time-scheduling-theory-2004]

## Bandwidth preserving 서버

priority exchange, deferrable server, sporadic server는 polling server와 비슷한 원리에 바탕을 두지만, release될 때 처리할 job이 없으면 용량을 버리지 않고 보존해 낭비를 줄인다. 이 성질 때문에 이 세 알고리즘을 **bandwidth preserving** 알고리즘이라 부른다. 세 알고리즘은 용량을 보존하고 보충하는 방법과, 최대 용량을 정하는 데 필요한 스케줄 가능성 분석이 다르다.[@sha-real-time-scheduling-theory-2004]

### Deferrable server

**deferrable server**는 비주기 처리용 실행 시간을 서버 주기 동안 유지하여, 그 주기의 실행 시간이 남아 있는 한 언제든 서버의 높은 우선순위로 비주기 요청을 처리한다. 서버의 실행 시간은 서버 주기가 시작될 때마다 가득 보충된다.[@sprunt-sporadic-aperiodic-1989]

deferrable server는 처리할 요청이 없으면 실행 시간을 보존하는데, 이는 주기 태스크가 실행을 미루는 것과 같다. 그래서 deferrable server는 우선순위가 가장 높은 준비된 주기 태스크는 곧바로 실행되어야 한다는 Liu와 Layland의 가정을 어기며, 이 때문에 원래 스케줄 가능한 태스크 집합에서도 더 낮은 우선순위 태스크가 마감 시한을 놓칠 수 있다. deferrable server는 priority exchange보다 구현이 훨씬 간단하지만, 주기 태스크 수가 한없이 많아질 때, 같은 서버 크기에서 [[rate-monotonic-scheduling|RM]]이 주기 태스크를 늘 스케줄할 수 있는 이용률 상한이 priority exchange보다 낮다.[@sprunt-sporadic-aperiodic-1989]

### Priority exchange

**priority exchange**는 서버의 높은 우선순위 실행 시간을 더 낮은 우선순위 주기 태스크의 실행 시간과 맞바꿔 보존한다. 서버 주기가 시작되면 실행 시간을 가득 채우고, 그때 비주기 요청이 있으면 처리한다. 요청이 없으면 기다리는 주기 태스크 가운데 우선순위가 가장 높은 것이 서버의 우선순위로 실행되고, 서버의 실행 시간은 그 주기 태스크의 우선순위 수준에 쌓인다. 이 교환은 비주기 요청이 와서 그 실행 시간을 쓰거나, 실행 시간이 background 수준까지 내려갈 때까지 이어진다.[@sprunt-sporadic-aperiodic-1989]

### Sporadic server

**sporadic server**는 deferrable server, priority exchange처럼 비주기 처리용 높은 우선순위 태스크를 만들고 비주기 요청이 올 때까지 실행 시간을 그 우선순위에 보존하지만, 실행 시간을 주기마다 가득 채우지 않고 비주기 처리에 쓴 뒤에만 보충한다.[@sprunt-sporadic-aperiodic-1989]

Sprunt, Sha, Lehoczky는 1989년 기술 보고서에서 sporadic server의 보충을 우선순위 수준의 active와 idle로 정했다. 시스템이 지금 실행하는 우선순위가 어떤 우선순위 수준 이상이면 그 수준은 active이고, 그보다 낮으면 idle이다. 서버에 실행 시간이 남아 있으면 서버의 우선순위 수준이 active가 되는 시각에 그 시각과 서버 주기의 합을 보충 시각으로 정하고, 그 수준이 idle이 되거나 서버의 실행 시간이 바닥나면 그동안 쓴 만큼의 실행 시간을 그 보충 시각에 다시 채우도록 예약한다.[@sprunt-sporadic-aperiodic-1989]

이들은 같은 보고서에서 서로 독립이고 선점할 수 있으며 마감 시한이 주기 끝인 주기 태스크를 RM으로 스케줄할 때, 스케줄 가능한 태스크 집합의 한 태스크를 주기와 실행 시간이 같은 sporadic server로 바꿔도 태스크 집합이 스케줄 가능하다는 것을 Theorem 4로 제시했다. 곧 스케줄링에서 sporadic server를 같은 주기와 실행 시간의 주기 태스크로 볼 수 있다는 것이다.[@sprunt-sporadic-aperiodic-1989] Sprunt, Sha, Lehoczky가 1989년 Real-Time Systems 논문에 실은 원래 sporadic server 기술에는 결함이 있었다.[@sha-real-time-scheduling-theory-2004]

## Slack stealing

hard 마감 시한의 주기 태스크에서 남는 처리 시간을 되도록 빨리 비주기 요청에 내주는 알고리즘을 **slack stealing** 알고리즘이라 부른다. 이 알고리즘은 남는 용량을 곧바로 내주면서 모든 hard 마감 시한을 지키는 알고리즘 가운데 비주기 태스크의 응답 시간을 가장 짧게 한다. 정적 slack stealing 알고리즘은 주기들의 [[periodic-task-model#파라미터|hyperperiod]] 동안 hard 마감 시한 주기 태스크의 release마다 남는 시간을 표로 저장해 두므로, release jitter가 없는 엄격한 주기 태스크에서만 남는 시간을 가져올 수 있다.[@sha-real-time-scheduling-theory-2004]

## POSIX SCHED_SPORADIC

POSIX.1-2024는 Process Sporadic Server나 Thread Sporadic Server 옵션을 지원하는 구현에 `SCHED_SPORADIC` 정책을 두게 한다. 이 정책은 보충 주기 `sched_ss_repl_period`와 사용 가능한 실행 용량을 바탕으로 하고, 실행 용량의 처음 값은 `sched_ss_init_budget`이다. 스레드는 실행 용량이 남아 있고 대기 중인 보충 연산의 수가 `sched_ss_max_repl`보다 적으면 `sched_priority`로, 그렇지 않으면 `sched_ss_low_priority`로 실행된다. 보충 연산을 예약할 때마다 보충할 양은 스레드가 `sched_priority` 목록의 맨 뒤에 들어간 시각(activation time)부터 쓴 실행 시간이고, 보충은 그 시각에 `sched_ss_repl_period`를 더한 때에 일어난다.[@ieee-1003-1-process-scheduling-2024] POSIX.1-2024는 sporadic server를 일정한 우선순위 수준에서 비주기 사건을 처리할 실행 용량을 예약하는 스케줄링 정책으로 정의한다.[@ieee-1003-1-definitions-2024]

POSIX 근거 문서에 따르면 sporadic server는 비주기 사건을 높은 우선순위로 처리할 실행 용량을 한정된 양만큼 예약하고, 그 안에서 처리하지 못한 비주기 사건은 낮은 우선순위의 background로 실행한다. 그래서 비주기 요청이 짧은 시간에 몰려도 주기 태스크를 처리할 실행 용량을 보장할 수 있다. sporadic server는 polling의 예측 가능성과, 비주기 사건을 도착하는 대로 높은 고정 우선순위로 처리하는 방식의 짧은 응답 시간을 합친다. 대기 중인 보충 연산의 수는 그것을 저장할 시스템 자원과, 보충 연산이 우선순위 역전의 원인이 될 수 있다는 점 때문에 제한한다. POSIX.1-2024는 그 상한 `{SS_REPL_MAX}`가 그 이상이어야 하는 값 `{_POSIX_SS_REPL_MAX}`를 4로 정한다.[@ieee-1003-1-rationale-sporadic-server-2024]

## EDF에서

[[earliest-deadline-first|EDF]]로 스케줄하는 주기 태스크 시스템에서 비주기 요청을 다루는 알고리즘 가운데 일부는 고정 우선순위 서버를 넓힌 것이고, 일부는 EDF를 위해 따로 설계한 것이다.[@sha-real-time-scheduling-theory-2004]

### TBS

**TBS**(Total Bandwidth Server)는 비주기 job마다 마감 시한을 매기되, 비주기 부하 전체가 정해진 최댓값 $U_s$를 넘지 않게 매긴다.[@sha-real-time-scheduling-theory-2004] 원 논문의 가정은 주기 태스크의 hard 마감 시한이 주기의 끝과 같고 주기와 최악 실행 시간이 일정하며, 비주기 태스크에는 마감 시한이 없고 도착 시각을 알 수 없다는 것이다. $k$번째 비주기 요청이 시각 $r_k$에 도착하면, 그 요청의 실행 시간을 $C_k$, 서버의 이용률(대역폭)을 $U_s$, $d_0 = 0$이라 할 때 아래 마감 시한 $d_k$를 받고, 다른 주기 job과 똑같이 EDF로 스케줄된다.[@spuri-efficient-aperiodic-service-1994]

$$
d_k = \max(r_k, d_{k-1}) + \frac{C_k}{U_s}
$$

같은 가정에서 주기 태스크의 이용률을 $U_p$라 하면, 주기 태스크 집합과 TBS 전체는 $U_p + U_s \le 1$일 때 그리고 그때만 EDF로 스케줄 가능하다.[@spuri-efficient-aperiodic-service-1994] TBS는 실행 시간이 가변적이거나 알려지지 않은 job에는 쓸 수 없어, 그런 job이 hard 태스크의 스케줄 가능성을 해치지 않게 하려면 예산 관리 수단이 필요하다.[@sha-real-time-scheduling-theory-2004]

### CBS

**CBS**(Constant Bandwidth Server)는 예산 $c_s$와 최대 예산 $Q_s$, 서버 주기 $T_s$로 정해지는 서버이고, $U_s = Q_s / T_s$를 **서버 대역폭**이라 한다. 서버는 언제나 마감 시한 $d_{s,k}$를 하나 갖고, 서버가 처리하는 job은 지금의 서버 마감 시한을 마감 시한으로 받는다. job이 실행되는 만큼 예산이 줄고, 예산이 0이 되면 곧바로 $Q_s$로 다시 채워지며 서버 마감 시한이 $d_{s,k+1} = d_{s,k} + T_s$로 늦춰진다. 서버가 쉬는 동안 job이 시각 $r$에 도착하면, $c_s \ge (d_{s,k} - r) U_s$일 때 새 서버 마감 시한 $r + T_s$를 만들고 예산을 $Q_s$로 채우며, 아니면 지금의 마감 시한과 예산으로 처리한다.[@abeni-integrating-multimedia-1998]

hard 태스크마다 최악 실행 시간과 최소 도착 간격 $T_i$를 두고 각 job의 마감 시한을 도착 시각에 $T_i$를 더한 값으로 둘 때, hard 주기 태스크의 이용률이 $U_p$이고 CBS의 이용률이 $U_s$이면, 전체는 $U_p + U_s \le 1$일 때 그리고 그때만 EDF로 스케줄 가능하다. 원 논문은 이를 **격리 성질**(isolation property)이라 부르며, 이 성질 덕분에 계산 시간을 묶기 어려운 soft 태스크에 CPU 시간의 일부를 예약해 hard 태스크와 함께 스케줄해도, soft 요청이 예상 부하를 넘을 때조차 hard 태스크의 사전 보장이 깨지지 않는다.[@abeni-integrating-multimedia-1998]

Linux 커널의 `SCHED_DEADLINE` 정책은 runtime, period, deadline 세 파라미터로 태스크를 스케줄한다. 태스크가 깨어날 때마다 스케줄러는 CBS 알고리즘으로 스케줄링 마감 시한을 계산하고, 이 마감 시한에 EDF를 적용해 가장 이른 태스크를 고른다. 남은 runtime이 0 이하가 되면 태스크는 throttled 상태가 되어 스케줄링 마감 시한까지 스케줄되지 않고, 그 시각에 스케줄링 마감 시한에는 period가, 남은 runtime에는 runtime이 더해진다.[@linux-sched-deadline-2026]

RTEMS(Real-Time Executive for Multiprocessor Systems)의 CBS 스케줄러는 단일 코어 응용을 위한 스케줄러로, EDF에 예산을 더해 태스크마다 시간 격리를 보장하려 한다. 서버는 주기(마감 시한)와 예산을 갖고 지금 구현은 서버 하나에 태스크 하나만 붙인다. 태스크가 등록한 예산을 넘거나, 남은 예산과 남은 마감 시한의 비가 선언한 대역폭보다 클 때 블록에서 풀리면, 그 태스크의 우선순위는 그 주기가 끝날 때까지 background로 내려간다.[@rtems-cbs-scheduler-2025]
