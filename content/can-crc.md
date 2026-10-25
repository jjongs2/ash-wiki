---
title: CAN CRC
tags:
  - network/can
verified: 2026-09-27
---

**CAN CRC**는 [[can|CAN]] 송신 노드가 계산해 프레임에 싣는 값이다. 수신 노드는 같은 방식으로 [[cyclic-redundancy-check|CRC]]를 계산해 받은 값과 비교하고, 이것으로 프레임에 생긴 오류를 찾아낸다.[@bosch-can-2-0-1991] [[can-frame|Classical CAN 프레임]]은 15비트 CRC를 쓴다.[@bosch-can-fd-1-0-2012]

## CRC 필드

**CRC 필드**는 15비트 CRC 시퀀스와 CRC 구분자로 이루어지고, **CRC 구분자**는 [[dominant-and-recessive|recessive]] 비트 하나다. CRC 구분자는 모양이 고정된 필드라 [[can-bit-stuffing|비트 스터핑]]을 하지 않는다.[@bosch-can-2-0-1991]

![[diagrams/can-crc-field.svg]]

## 계산

Bosch CAN 2.0 규격은 CRC 시퀀스를 비트 수 $n$이 $n < 127$인 프레임에 가장 알맞은 BCH 부호에서 얻도록 정한다. CRC 시퀀스를 만들 때는 SOF(Start of Frame), 중재 필드, 제어 필드, 데이터 필드(있으면)의 스터핑하기 전 비트를 계수로 삼는다. 이 비트열 뒤에 0을 15자리 붙인 다항식을 [[cyclic-redundancy-check#다항식 나눗셈|생성 다항식]]으로 나눈 나머지가 **CRC 시퀀스**다. 생성 다항식은 차수가 15, 14, 10, 8, 7, 4, 3, 0인 항으로 이루어진다.[@bosch-can-2-0-1991]

$$
x^{15} + x^{14} + x^{10} + x^{8} + x^{7} + x^{4} + x^{3} + 1
$$

수신 노드는 송신 노드와 같은 방식으로 CRC를 계산하고, 계산한 값이 받은 CRC 시퀀스와 다르면 **CRC 오류**로 판정한다.[@bosch-can-2-0-1991]

## 오류를 알리는 시점

[[can-acknowledgement|ACK]] 슬롯에 dominant 비트를 내서 수신을 알리는 것은 CRC 시퀀스가 일치한 노드다. CRC 오류를 찾은 노드는 ACK 구분자 다음 비트에서 [[can-error-frame#오류 플래그|오류 플래그]]를 내기 시작하는데, 다른 오류로 이미 오류 플래그를 내기 시작했으면 그렇지 않다.[@bosch-can-2-0-1991] 다른 오류와의 비교는 [[can-error-detection#오류를 알리는 시점|CAN 오류 검출]]에서 다룬다.

## 검출 능력

CRC를 포함한 CAN의 오류 검출 수단(모니터링, CRC, 비트 스터핑, 프레임 검사)은 한 메시지 안에서 임의로 흩어진 오류 5개까지와, 길이 $l$(비트)이 $l < 15$인 [[cyclic-redundancy-check#쓰는 곳|버스트 오류]]를 모두 찾아낸다. 이 수단들은 전역 오류, 송신 노드의 국부 오류, 홀수 개의 오류도 모두 찾아낸다. 찾지 못한 채 남는 오류의 확률 $p_\mathrm{res}$는 메시지 오류율 $p_\mathrm{msg}$에 대해 $p_\mathrm{res} < 4.7 \times 10^{-11}\, p_\mathrm{msg}$이다.[@bosch-can-2-0-1991]

Bosch CAN FD 1.0에 따르면 classical CAN 프레임의 15비트 CRC도 [[can-fd|CAN FD]]의 17비트·21비트 CRC와 마찬가지로 [[hamming-distance|해밍 거리]] 6을 준다.[@bosch-can-fd-1-0-2012] 해밍 거리 6은 길이가 정해진 프레임에서 비트 반전 5개까지를 찾아낸다는 뜻이다.[@bosch-icc-can-fd-error-detection-2015][@ti-spra530-1999] Bosch 논문에 따르면 classical CAN에서는 스터프 조건을 만들고 없애는 비트 반전 두 개를 CRC가 찾지 못하는 드문 경우가 있다. 이 두 반전으로 수신 노드가 데이터 비트를 스터프 비트로, 스터프 비트를 데이터 비트로 읽는 경우다. CAN FD는 동적 스터프 비트를 CRC 계산에 넣고 [[can-bit-stuffing#CAN FD 프레임과의 차이|stuff bit count]]를 프레임에 실어 이 경우를 찾는다.[@bosch-icc-can-fd-error-detection-2015]

## CAN FD 프레임과의 차이

CAN FD 포맷 프레임은 데이터 필드의 바이트 수 $n$이 $n \le 16$이면 17비트 CRC를, $n > 16$이면 21비트 CRC를 쓴다. 프레임이 시작되면 송신 노드를 포함한 모든 노드가 세 CRC를 함께 계산하고, 프레임의 EDL(Extended Data Length) 비트와 [[data-length-code|DLC]]가 그중 하나를 고른다. 수신 노드는 고른 CRC로만 CRC 오류를 판정한다.[@bosch-can-fd-1-0-2012]

CAN FD 포맷 프레임은 스터프 비트도 CRC 계산에 넣지만, classical 포맷 프레임은 넣지 않는다.[@bosch-can-fd-1-0-2012]

Bosch CAN FD 1.0은 17비트 CRC(CRC_17)와 21비트 CRC(CRC_21)의 생성 다항식을 아래처럼 정한다.[@bosch-can-fd-1-0-2012]

$$
x^{17} + x^{16} + x^{14} + x^{13} + x^{11} + x^{6} + x^{4} + x^{3} + x + 1
$$

$$
x^{21} + x^{20} + x^{13} + x^{11} + x^{7} + x^{4} + x^{3} + 1
$$
