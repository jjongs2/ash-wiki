---
title: 해밍 거리
tags:
  - network
verified: 2026-09-29
---

**해밍 거리**(Hamming distance)는 길이가 같은 두 비트열에서 값이 서로 다른 자리의 수다. 예를 들어 `10110`과 `11100`은 둘째와 넷째 자리가 달라 해밍 거리가 2다. 오류로 비트 $k$개가 뒤집히면 받은 비트열과 원래 비트열의 해밍 거리는 $k$다.[@iec-60050-721-08-25-1991] Microchip 앱노트 AN2632에 따르면 해밍 거리는 두 값을 XOR한 결과에 있는 1의 개수로 나타낼 수 있다.[@microchip-an2632-2019]

![[diagrams/hamming-distance-bit-comparison.svg]]

## 기하 모델

Hamming은 1950년 논문에서 부호를 이루는 0과 1의 열을 $n$차원 단위 정육면체의 꼭짓점으로 보는 기하 모델을 세우고 이 거리를 정의했다. 두 점 $x$, $y$의 거리 $D(x, y)$는 $x$에서 $y$로 가는 데 지나야 하는 모서리의 최소 개수와 같다. 또 $D(x, y) = 0$은 $x = y$일 때뿐이고, $D(x, y) = D(y, x)$이며, 삼각 부등식을 만족해 거리 함수(metric)의 세 조건을 갖춘다.[@hamming-error-detecting-1950]

![[diagrams/hamming-cube-distance.svg]]

## 최소 해밍 거리와 검출·정정 능력

TI 앱노트 SPRA530에 따르면 부호의 **최소 해밍 거리** $d_\mathrm{min}$은 서로 다른 두 [[error-correction-code|부호어]] 사이의 해밍 거리 가운데 가장 작은 값이다. 블록 부호는 오류를 $d_\mathrm{min} - 1$개까지 찾아내고, 오류 개수 $t$가 $2t + 1 \le d_\mathrm{min}$을 만족하면 고친다. 예를 들어 부호어가 `00000`과 `11111`뿐인 부호는 $d_\mathrm{min} = 5$라 오류 비트 4개까지 찾아내고 2개까지 고친다.[@ti-spra530-1999]

![[diagrams/hamming-distance-dmin-detect-correct.svg]]

최소 해밍 거리가 같은 부호에서는 정정 능력의 일부를 검출 능력으로 바꿔 쓸 수 있다. 위 예처럼 $d_\mathrm{min} = 5$인 부호는 오류 2개까지 정정, 오류 1개까지 정정하면서 3개까지 검출, 오류 4개까지 검출 가운데 하나로 쓸 수 있다.[@hamming-error-detecting-1950]

최소 해밍 거리가 4인 SECDED(Single Error Correction, Double Error Detection) 부호는 비트 하나의 오류를 고치면서 비트 두 개의 오류를 찾아낸다.[@ti-spna139-2011][@microchip-coreedac-2025] SECDED는 [[error-correction-code#SECDED|ECC]]에서 다룬다. TI Hercules MCU의 플래시 ECC는 SECDED라서 비트 하나의 오류를 가장 가까운 유효한 값으로 되돌려 고치지만, 3비트 오류는 잘못 고칠 수 있다. 이 ECC는 3비트 오류 검출이 더 중요하면 오류 검출 전용 모드로 둘 수 있다.[@ti-spna139-2011]

[[cyclic-redundancy-check|CRC]]의 최소 해밍 거리는 생성 다항식이 같아도 CRC를 뺀 데이터 워드의 길이에 따라 달라서, 데이터 워드가 길수록 작아진다.[@koopman-32-bit-crc-2002] [[can|CAN]]이 쓰는 CRC의 해밍 거리는 [[can-crc#검출 능력|CAN CRC]]에서 다룬다.
