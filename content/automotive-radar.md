---
title: 차량용 레이더
tags:
  - applications/adas
verified: 2026-11-21
---

**레이더**는 전자기파를 내보내고 물체에 반사돼 돌아온 신호를 받아 그 물체의 거리, 속도, 각도를 알아낸다.[@ti-spyy005a-2020][@infineon-radar-sensors-automotive-2026] TI의 AWR1243 레이더 프런트엔드와 NXP의 TEF82xx 레이더 트랜시버는 76\~81 GHz 대역에서 FMCW(frequency-modulated continuous wave) 방식으로 동작한다.[@ti-spyy005a-2020][@ti-spyy003-2017][@nxp-tef82xxfs-2020]

차량에서는 [[adas#기능|ACC]] 같은 [[adas|ADAS]] 기능에 쓴다.[@infineon-radar-sensors-automotive-2026][@nxp-saf85xxfs-2022]

## 쓰는 곳

ADAS에서는 ACC, AEB(automatic emergency braking), blind spot detection, lane change assistance, rear cross traffic alert, 주차 보조 같은 기능에 레이더를 쓴다.[@infineon-radar-sensors-automotive-2026][@nxp-saf85xxfs-2022] 차량용 레이더는 감지 거리에 따라 단거리, 중거리, 장거리 레이더로 나뉜다.[@infineon-radar-sensors-automotive-2026][@nxp-tef82xxfs-2020]

Infineon에 따르면 단거리 레이더는 차가 느리게 움직이거나 장애물이 가까이 있는 blind spot detection과 lane change assistance에 쓴다. 단거리·중거리 레이더를 차의 네 모서리에 둔 것을 **코너 레이더**라 하며, 코너 레이더는 운전자가 보기 전에 장애물이나 보행자를 찾아 AEB를 작동시킬 수 있다. 장거리 레이더는 먼 앞쪽의 교통 변화를 더 잘 감지하므로 주로 차 앞쪽에 둔다.[@infineon-radar-sensors-automotive-2026]

![[diagrams/radar-corner-long-range-placement.svg]]

Infineon의 60 GHz 차량용 레이더 트랜시버는 주로 실내 감시에 쓰며, 차 안에 남겨진 아이를 감지하는 기능과 [[software-defined-vehicle#하드웨어와 소프트웨어의 분리|안전띠 알림]]을 만들 수 있게 한다.[@infineon-radar-sensors-automotive-2026]

## 동작

TI 백서에 따르면 FMCW 레이더는 주파수를 변조한 신호를 끊임없이 보내 거리와 각도, 속도를 잰다. 짧은 펄스를 주기적으로 보내는 펄스 레이더와는 이 점이 다르다.[@ti-spyy005a-2020]

### 거리

FMCW 레이더가 보내는 **chirp**는 주파수가 시간에 따라 선형으로 오르는 신호다. chirp는 시작 주파수 $f_c$, 대역폭 $B$, 지속 시간 $T_c$와, 주파수가 바뀌는 빠르기인 기울기 $S$로 나타낸다. 예를 들어 77 GHz에서 시작해 40 µs 동안 4 GHz를 쓸고 지나는 chirp의 기울기는 100 MHz/µs다.[@ti-spyy005a-2020]

![[diagrams/fmcw-chirp-parameters.svg]]

합성기가 만든 chirp를 송신 안테나로 보내면, 물체에 반사된 chirp를 수신 안테나가 받는다. mixer는 수신 신호와 송신 신호를 섞어, 두 입력의 순간 주파수 차를 주파수로 갖는 IF(intermediate frequency) 신호를 낸다.[@ti-spyy005a-2020]

![[diagrams/fmcw-radar-rf-blocks.svg]]

물체의 속도가 IF 신호의 주파수에 주는 영향을 무시하면, 레이더에서 거리 $d$에 있는 물체 하나가 만든 IF 신호는 주파수가 일정한 사인파이고, 그 주파수 $f_0$는 아래와 같다. $c$는 빛의 속도다.[@ti-spyy005a-2020]

$$
f_0 = \frac{S \cdot 2d}{c}
$$

![[diagrams/fmcw-tx-rx-chirp-if-frequency.svg]]

물체가 여럿이면 물체마다 주파수가 다른 IF 톤이 섞여 나오므로, FFT(Fast Fourier Transform)로 톤을 갈라 거리마다의 물체를 찾는다. 이 FFT를 **range-FFT**라 한다.[@ti-spyy005a-2020][@ti-spyy003-2017]

두 물체를 가려내는 거리 분해능 $d_\mathrm{res}$는 chirp가 쓸고 지나는 대역폭 $B$에만 달려 있다. 대역폭이 4 GHz면 거리 분해능은 3.75 cm다.[@ti-spyy005a-2020]

$$
d_\mathrm{res} = \frac{c}{2B}
$$

### 속도

속도는 간격 $T_c$로 보낸 두 chirp의 range-FFT 봉우리 사이의 위상차로 잰다. 위상차로 재므로 잴 수 있는 최대 속도 $v_\mathrm{max}$가 있고, 파장을 $\lambda$라 하면 아래와 같다.[@ti-spyy005a-2020]

$$
v_\mathrm{max} = \frac{\lambda}{4 T_c}
$$

같은 거리에 속도가 다른 물체가 여럿이면 두 chirp로는 가려낼 수 없다. 이때는 chirp N개로 된 chirp frame을 보내고, range-FFT가 낸 N개의 phasor에 둘째 FFT인 **Doppler-FFT**를 해 물체를 가른다. 속도 분해능은 frame 시간 $T_f = N T_c$에 반비례한다.[@ti-spyy005a-2020]

![[diagrams/fmcw-chirp-frame.svg]]

### 각도

레이더는 반사 신호가 수평면과 이루는 각도인 AoA(angle of arrival)를 수신 안테나 둘 이상으로 추정한다. 물체에서 각 안테나까지의 거리가 조금 다르면 range-FFT나 Doppler-FFT 봉우리의 위상이 달라지고, 이 위상차로 AoA를 구한다. 추정 정확도는 각도가 0°에 가까울수록 높고 90°에 가까울수록 떨어진다. 두 수신 안테나 사이를 $\lambda/2$로 두면 최대 시야가 ±90°로 가장 넓다.[@ti-spyy005a-2020]

## 이미징 레이더

Infineon에 따르면 4D 이미징 레이더는 보통 레이더가 쓰는 다섯 개 미만의 송수신 안테나 대신 MIMO(multi-input, multi-output) 48 안테나 배열을 써, 움직이는 물체와 멈춘 물체를 보통 레이더보다 먼 거리에서 더 정확히 감지한다.[@infineon-radar-sensors-automotive-2026]

TEF82xx는 송신기 3개, 수신기 4개와 ADC(analog-to-digital converter)를 품은 트랜시버로, 레이더 데이터를 [[automotive-serdes#MIPI CSI-2|MIPI CSI-2]] 같은 외부 인터페이스로 NXP S32R 레이더 [[microcontroller|MCU]]에 넘긴다.[@ti-spyy005a-2020][@nxp-tef82xxfs-2020] TEF82xx 칩 4개를 이으면(cascade) 송신기 12개, 수신기 16개까지의 고해상도 이미징 레이더를 꾸릴 수 있다.[@nxp-tef82xxfs-2020]

## 날씨와 분해능

TI 백서에 따르면 레이더는 비, 안개, 눈에서도 믿을 만하다. 이미징 레이더는 스스로 신호를 내므로 밤에도 성능이 높다. 다만 77 GHz 레이더는 파장이 4 mm라 먼 거리의 작은 형상을 가려내기 어렵다.[@ti-slyy150d-2025]
