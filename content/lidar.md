---
title: 라이다
tags:
  - applications/adas
aliases:
  - Light detection and ranging
verified: 2026-11-21
---

**라이다**(light detection and ranging)는 대상까지의 거리를 재는 감지 방식이다.[@ti-slyy150d-2025][@onsemi-tnd6254-2024] TI 백서에 따르면 라이다는 빛으로 대상을 비추고 돌아온 반사 신호의 특성을 재어 물체를 감지하고 그 거리를 알아내며, ToF(time of flight), laser scanning, laser radar라고도 부른다.[@ti-slyy150d-2025]

onsemi 백서에 따르면 라이다는 차량의 [[adas|ADAS]]에 쓴다. 라이다의 direct ToF 방식은 레이저 펄스를 쏘아 반사광이 돌아오기까지의 시간 $t$를 재고, 대상까지의 거리 $d$를 아래 식으로 구한다. $c$는 빛의 속도다.[@onsemi-tnd6254-2024]

$$
d = \frac{c \, t}{2}
$$

![[diagrams/lidar-direct-tof-pulse-timing.svg]]

## 구성

direct ToF 라이다는 시준(collimation) 광학계를 단 펄스 레이저, 검출 광학계를 단 센서, 타이밍·데이터 처리 회로로 이뤄진다.[@onsemi-tnd6254-2024]

센서는 돌아온 레이저 광자를 주변광의 잡음과 가려내야 한다. 레이저 펄스 하나에서 타임스탬프를 하나 이상 잡는 것을 **단발 측정**이라 하고, 단발 측정을 많이 모아 거리 측정 하나를 만들면 신호 대 잡음비가 크게 나아진다.[@onsemi-tnd6254-2024]

TI 백서에 따르면 라이다 신호 체인은 송신 시스템, 수신 시스템, 점군(point cloud) 정보를 뽑는 디지털 처리 시스템으로 이뤄진다. 수신 경로에서는 광검출기의 신호를 TIA(transimpedance amplifier)로 받아 ADC(analog-to-digital converter)나 TDC(time-to-digital converter)로 넘긴다.[@ti-slyy150d-2025]

![[diagrams/lidar-signal-chain.svg]]

## FMCW 라이다

FMCW(frequency-modulated continuous wave) 라이다는 주파수를 변조한 레이저 빛의 짧은 [[automotive-radar#거리|chirp]]를 보내는 코히어런트 방식이다. 돌아온 chirp의 위상과 주파수를 재면 도플러 원리로 거리와 속도를 함께 잴 수 있다. FMCW 라이다에 드는 레이저 출력은 펄스 ToF 라이다보다 훨씬 적다.[@ti-slyy150d-2025]

## 분해능과 환경

라이다는 905\~1550 nm의 적외선을 쓰고 레이저 빛을 시준할 수 있어 약 0.1°의 공간 분해능을 낼 수 있다. 이 분해능으로 뒤 처리를 많이 하지 않고도 장면의 물체를 3차원으로 높은 해상도로 그릴 수 있다. 라이다는 방위각과 고도 모두의 각 분해능을 준다.[@ti-slyy150d-2025]

라이다 성능은 대개 비, 안개, 눈에서 떨어지며, 1550 nm 적외선을 쓰면 나아진다. 라이다는 주변광에 영향을 받지만, 스스로 빛을 내므로 밤에는 성능이 높다.[@ti-slyy150d-2025]

## 종류

라이다는 빔을 조향하는 방식에 따라 둘로 나뉜다. **기계식 라이다**는 고급 광학계와 회전 조립체로 보통 360°의 넓은 시야를 얻고, 넓은 시야에서 높은 신호 대 잡음비를 내지만 부피가 크다. **고체 라이다**(solid-state lidar)는 회전하는 기계 부품이 없고 시야가 좁아 값이 싸다. 고체 라이다를 차의 앞, 뒤, 옆에 여럿 두고 데이터를 합치면 기계식 라이다에 견줄 시야를 얻는다.[@ti-slyy150d-2025]

고체 라이다를 구현하는 방법에는 아래가 있다.[@ti-slyy150d-2025]

- **MEMS**(microelectromechanical systems) 라이다: 전압 같은 자극을 주면 기울기가 바뀌는 작은 거울로 빔을 움직인다.
- **플래시 라이다**: 넓은 레이저 펄스 하나로 앞의 장면 전체를 비추고, 레이저 가까이 둔 광검출기의 초점면 배열로 되돌아온 빛을 받는다. 장면 전체를 비추고 멀리 보려면 레이저의 첨두 출력이 매우 높아야 하므로, 눈 안전 요구를 지키려 주로 단거리와 중거리 감지에 쓴다.
- **OPA**(optical phase array): 광 위상 변조기가 렌즈를 지나는 빛의 속도를 바꿔 파면의 모양을 조절하고, 이것으로 레이저 빔을 조향한다.[@ti-slyy150d-2025]
