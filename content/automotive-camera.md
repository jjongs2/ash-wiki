---
title: 차량용 카메라
tags:
  - applications/adas
verified: 2026-11-21
---

**차량용 카메라**는 영상을 찍는 차량의 센서로, [[adas|ADAS]]가 그 영상을 기능에 쓴다.[@onsemi-tnd6449-2024][@ti-slyy150d-2025] onsemi 백서에 따르면 ADAS는 카메라 영상으로 차량 주위의 물체를 식별하고 스테레오 카메라로 거리를 계산해, 자동 제동, 고속도로 순항 제어, 차로 이탈, 주차 보조 같은 기능에 쓴다.[@onsemi-tnd6449-2024]

차량용 카메라의 이미지 센서는 명암 차가 큰 장면을 찍는 HDR(high dynamic range)과, LED(light-emitting diode) 광원의 깜빡임을 줄이는 LFM(LED flicker mitigation)을 갖춘다.[@onsemi-tnd6449-2024][@sony-hdr-automotive-2026][@sony-lfm-automotive-2026]

## 쓰는 곳

카메라용 [[automotive-serdes|SerDes]] 직렬화기는 전방 카메라, 서라운드 뷰, 후방 카메라, DMS 같은 차량 카메라 시스템에 쓴다.[@adi-max96717-2025][@ti-ds90ub953-q1-2024]

## LED 깜빡임

신호등, 교통 표지, 차량 조명의 LED는 사람 눈이 알아채지 못하는 빠르기로 켜지고 꺼진다. 이미지 센서의 노출 시간이 이 켜짐과 꺼짐의 주기보다 짧으면 LED가 꺼진 동안 찍혀, 불이 꺼진 것처럼 보일 수 있다.[@onsemi-tnd6449-2024][@sony-lfm-automotive-2026]

![[diagrams/led-flicker-short-exposure.svg]]

Sony에 따르면 이 때문에 켜진 신호를 깜빡이는 신호로 잘못 알아볼 위험이 있다. 노출 시간을 LED의 켜짐과 꺼짐의 주기보다 길게 하면 LED를 찍을 수 있지만, 상황에 따라 픽셀이 포화해 밝은 곳이 날아갈 수 있다.[@sony-lfm-automotive-2026]

onsemi 백서에 따르면 전조등, 후미등, 교통 표지의 LED는 전력을 줄이려 PWM(pulse-width modulation)을 쓴다. 동영상에서는 LED가 끊임없이 켜졌다 꺼졌다 하는 것처럼 보이는데, 이를 **LED 깜빡임**(LED flicker)이라 한다. LED 깜빡임은 디지털 속도 표지의 숫자, 신호등의 색, 브레이크등을 알아내는 알고리즘을 그르칠 수 있다.[@onsemi-tnd6449-2024]

## HDR

Sony에 따르면 차량용 HDR은 역광이나 낮의 터널 출입구처럼 명암 차가 큰 장면에서도 밝은 곳이 날아가거나 어두운 곳이 뭉개지지 않게 한다.[@sony-hdr-automotive-2026] onsemi 백서에 따르면 차량용 이미지 센서는 깜빡이는 LED에 대응하면서 140 dB를 넘는 HDR을 내고, 접합(junction) 온도 +125 °C까지에서 동작해야 한다.[@onsemi-tnd6449-2024]

노출 시간이 다른 영상 여러 장을 찍어 한 장으로 합치는 다중 노출 HDR에서, 긴 노출은 어두운 곳의 정보를, 짧은 노출은 밝은 곳의 쓸 만한 정보를 더 많이 담는다. 다중 노출 HDR은 노출을 차례로 찍는다. 그래서 카메라 자신이 빨리 움직이는 차량 장면에서는 노출 사이에 물체가 움직여, 합친 영상의 물체가 일그러지고 색 artifact가 생길 수 있다.[@onsemi-tnd6449-2024]

한 픽셀에 감도가 높은 부분 픽셀과 잘 포화하지 않는 부분 픽셀을 두고 두 신호를 동시에 얻어 합치면, 노출 사이의 시간 차 없이 넓은 다이내믹 레인지를 얻는다.[@onsemi-tnd6449-2024][@sony-hdr-automotive-2026]

![[diagrams/hdr-multi-exposure-split-pixel-timing.svg]]

## 다른 감지 센서와의 차이

TI 백서에 따르면 카메라는 값이 싸고 구하기 쉽지만, 쓸 만한 정보를 뽑으려면 처리가 많이 들고 주변광에 크게 좌우된다. 카메라는 [[automotive-radar|레이더]], [[lidar|라이다]], [[ultrasonic-sensor|초음파 센서]]와 달리 색을 볼 수 있는 유일한 감지 기술이다.[@ti-slyy150d-2025]
