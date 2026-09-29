---
title: TCP 혼잡 제어
tags:
  - network
verified: 2026-09-29
---

**TCP 혼잡 제어**(TCP congestion control)는 [[tcp|TCP]] 송신 측이 네트워크의 혼잡에 맞춰 네트워크로 내보내는 데이터의 양을 조절하는 방법이다.[@ietf-rfc-5681-2009][@ietf-rfc-2914-2000] RFC 5681은 slow start, congestion avoidance, fast retransmit, fast recovery 네 알고리즘을 정한다.[@ietf-rfc-5681-2009]

혼잡 제어가 없으면 송신 측이 아직 전달 중이거나 이미 도착한 패킷까지 불필요하게 다시 보내느라, 부하가 늘수록 네트워크가 해내는 쓸모 있는 일이 오히려 줄어드는 **혼잡 붕괴**(congestion collapse)가 일어날 수 있다. 이때 처리량은 평소의 작은 일부로 떨어진다.[@ietf-rfc-2914-2000][@ietf-rfc-9293-2022]

## 구조·동작

### 혼잡 윈도

송신 측은 확인 응답을 받지 않고 보낼 수 있는 양을 수신 윈도(rwnd)와, 송신 측이 스스로 유지하는 **혼잡 윈도**(cwnd, congestion window) 가운데 작은 쪽으로 제한한다.[@ietf-rfc-5681-2009] 수신 윈도는 받는 쪽이 TCP 헤더의 Window 필드로 알린 값이다.[@ietf-rfc-9293-2022][@ietf-rfc-5681-2009]

송신 측은 slow start 임계값(ssthresh)을 함께 유지한다. cwnd가 ssthresh보다 작으면 slow start를, 크면 congestion avoidance를 쓴다. RFC 5681은 초기 cwnd의 상한을 SMSS(Sender Maximum Segment Size)에 따라 2\~4세그먼트로 정하고, 초기 ssthresh는 임의로 크게 두도록 권한다.[@ietf-rfc-5681-2009]

### Slow start와 congestion avoidance

slow start에서는 새 데이터를 확인하는 확인 응답을 받을 때마다 cwnd를 최대 SMSS만큼 늘린다.[@ietf-rfc-5681-2009] 그래서 cwnd는 왕복 시간마다 많아야 두 배로 커진다.[@ietf-rfc-3465-2003]

congestion avoidance에서는 cwnd를 왕복 시간마다 약 SMSS 하나만큼 늘린다.[@ietf-rfc-5681-2009]

재전송 타이머로 손실을 알아채면, ssthresh를 보냈지만 확인받지 못한 데이터 양(FlightSize)의 절반과 2 SMSS 가운데 큰 값 이하로 낮춘다. cwnd는 1세그먼트 이하로 줄여 slow start부터 다시 한다.[@ietf-rfc-5681-2009]

### Fast retransmit와 fast recovery

받는 쪽은 순서가 어긋난 세그먼트를 받으면 곧바로 중복 확인 응답을 보내도록 권고된다. 송신 측은 중복 확인 응답을 세 번 받으면 재전송 타이머를 기다리지 않고 빠진 것으로 보이는 세그먼트를 다시 보낸다. 이것이 **fast retransmit**이다.[@ietf-rfc-5681-2009]

fast retransmit 뒤에는 **fast recovery**로 들어간다. ssthresh를 확인받지 못한 데이터 양의 절반과 2 SMSS 가운데 큰 값 이하로 낮추고, cwnd를 ssthresh에 3 SMSS를 더한 값으로 둔다. 중복 확인 응답이 더 올 때마다 cwnd를 SMSS만큼 늘린다. 새 데이터를 확인하는 확인 응답이 오면 cwnd를 ssthresh로 되돌린다. 이때처럼 cwnd와 ssthresh가 같으면 송신 측은 slow start와 congestion avoidance 가운데 어느 쪽을 써도 된다.[@ietf-rfc-5681-2009]

중복 확인 응답이 온다는 것은 뒤의 세그먼트가 받는 쪽에 닿고 있다는 뜻이므로, 이때는 slow start로 돌아가지 않는다.[@ietf-rfc-5681-2009]

![[diagrams/tcp-cwnd-over-time.svg]]

### AIMD

손실이 없으면 cwnd를 왕복 시간마다 많아야 한 패킷씩 더해 늘리고, 손실이 나면 절반으로 줄이는 TCP의 방식을 **AIMD**(Additive Increase Multiplicative Decrease)라 부른다.[@ietf-rfc-2914-2000]

## 비교·한계

RFC 5681의 알고리즘은 패킷 손실을 혼잡의 신호로 본다.[@ietf-rfc-5681-2009]

[[udp|UDP]] 자체에는 혼잡 제어 방법이 없다. RFC 8085는 UDP를 쓰는 응용이 스스로 혼잡을 제어하도록 권한다.[@ietf-rfc-8085-2017]

RFC 9438은 cwnd를 3차 함수로 늘리는 CUBIC을 정한다.[@ietf-rfc-9438-2023]
