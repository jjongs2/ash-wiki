---
title: TCP 혼잡 제어
tags:
  - network/tcp-ip
verified: 2026-09-29
---

**TCP 혼잡 제어**(TCP congestion control)는 [[tcp|TCP]] 송신 측이 네트워크의 혼잡에 맞춰 네트워크로 내보내는 데이터의 양을 조절하는 방법이다.[@ietf-rfc-5681-2009][@ietf-rfc-2914-2000] RFC 5681은 slow start, congestion avoidance, fast retransmit, fast recovery 네 알고리즘을 정한다.[@ietf-rfc-5681-2009]

혼잡 제어가 없으면 송신 측이 아직 전달 중이거나 이미 도착한 패킷까지 불필요하게 다시 보내느라, 부하가 늘수록 네트워크가 해내는 쓸모 있는 일이 오히려 줄어드는 **혼잡 붕괴**(congestion collapse)가 일어날 수 있다. 이때 처리량은 평소의 작은 일부로 떨어진다.[@ietf-rfc-2914-2000][@ietf-rfc-9293-2022]

## 혼잡 윈도

송신 측이 확인 응답을 받지 않고 보낼 수 있는 양에 스스로 두는 한도를 **혼잡 윈도**(cwnd, congestion window)라 한다. 송신 측은 보내는 양을 수신 윈도(rwnd)와 cwnd 가운데 작은 쪽으로 제한한다.[@ietf-rfc-5681-2009] 수신 윈도는 수신 측이 TCP [[tcp#헤더|헤더]]의 Window 필드로 알린 값이다.[@ietf-rfc-5681-2009][@ietf-rfc-9293-2022]

송신 측은 slow start 임계값(ssthresh)을 함께 유지한다. $\mathrm{cwnd} < \mathrm{ssthresh}$이면 slow start를, $\mathrm{cwnd} > \mathrm{ssthresh}$이면 congestion avoidance를 쓴다. RFC 5681은 초기 cwnd의 상한을 SMSS(Sender Maximum Segment Size)에 따라 2\~4세그먼트로 정하고, 초기 ssthresh는 임의로 크게 두도록 권한다.[@ietf-rfc-5681-2009]

## Slow start와 congestion avoidance

slow start에서는 새 데이터를 확인하는 확인 응답을 받을 때마다 cwnd를 최대 SMSS만큼 늘린다.[@ietf-rfc-5681-2009] 그래서 cwnd는 왕복 시간마다 많아야 두 배로 커진다.[@ietf-rfc-3465-2003]

congestion avoidance에서는 cwnd를 왕복 시간마다 약 SMSS 하나만큼 늘린다.[@ietf-rfc-5681-2009]

재전송 타이머로 손실을 알아채면, 보냈지만 확인받지 못한 데이터 양 FlightSize에 대해 ssthresh를 아래 식을 만족하도록 낮춘다.[@ietf-rfc-5681-2009]

$$
\mathrm{ssthresh} \le \max\left(\frac{\mathrm{FlightSize}}{2},\ 2\,\mathrm{SMSS}\right)
$$

cwnd는 1세그먼트 이하로 줄여 slow start부터 다시 한다.[@ietf-rfc-5681-2009]

## Fast retransmit와 fast recovery

이 RFC는 보낸 뒤 확인받지 못한 데이터가 있고, 들어온 확인 응답이 데이터를 싣지 않고 SYN과 FIN이 꺼져 있으며, 확인 응답 번호가 그 연결에서 받은 가장 큰 확인 응답 번호와 같고, 광고한 윈도가 직전과 같을 때 이를 **중복 확인 응답**(duplicate acknowledgment)으로 정의한다. 수신 측은 순서가 어긋난 세그먼트를 받으면 곧바로 중복 확인 응답을 보내도록 권고된다. 송신 측은 중복 확인 응답을 세 번 받으면 재전송 타이머를 기다리지 않고 빠진 것으로 보이는 세그먼트를 다시 보낸다. 이것이 **fast retransmit**이다.[@ietf-rfc-5681-2009]

fast retransmit 뒤에는 **fast recovery**로 들어간다. ssthresh를 재전송 타이머 때와 같은 식으로 낮추고, $\mathrm{cwnd} = \mathrm{ssthresh} + 3\,\mathrm{SMSS}$로 둔다. 중복 확인 응답이 더 올 때마다 cwnd를 SMSS만큼 늘린다. 새 데이터를 확인하는 확인 응답이 오면 cwnd를 ssthresh로 되돌린다. 이때처럼 cwnd와 ssthresh가 같으면 송신 측은 slow start와 congestion avoidance 가운데 어느 쪽을 써도 된다.[@ietf-rfc-5681-2009]

중복 확인 응답이 온다는 것은 뒤의 세그먼트가 수신 측에 닿고 있다는 뜻이므로, 이때는 slow start로 돌아가지 않는다.[@ietf-rfc-5681-2009]

![[diagrams/tcp-cwnd-over-time.svg]]

## AIMD

손실이 없으면 cwnd를 왕복 시간마다 많아야 한 패킷씩 더해 늘리고, 손실이 나면 절반으로 줄이는 TCP의 방식을 **AIMD**(Additive Increase Multiplicative Decrease)라 부른다.[@ietf-rfc-2914-2000]

RFC 5681의 알고리즘은 패킷 손실을 혼잡의 신호로 본다.[@ietf-rfc-5681-2009]

RFC 9438은 cwnd를 3차 함수로 늘리는 CUBIC을 정한다.[@ietf-rfc-9438-2023]

## UDP와의 차이

[[udp|UDP]] 자체에는 혼잡 제어 방법이 없다. RFC 8085는 UDP를 쓰는 응용이 스스로 혼잡을 제어하도록 권한다.[@ietf-rfc-8085-2017]
