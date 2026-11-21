---
title: DMS
tags:
  - applications/adas
aliases:
  - Driver State Monitoring
verified: 2026-11-21
---

**DMS**(Driver Monitoring System)는 주의 분산, 피로, 무반응 같은 운전자의 상태를 판단하는 차량 시스템이다.[@onsemi-tnd6416-2023][@euroncap-driver-engagement-2026] TI 앱노트에 따르면 DMS는 판단한 경계 수준에 따라 경고를 내거나 차를 감속시킬 수 있다.[@ti-snvaa88-2023] [[automotive-camera|카메라]] 기반 DMS는 근적외선으로 비춘 운전자의 영상을 처리해 상태를 판단한다.[@onsemi-tnd6416-2023][@ti-snvaa88-2023]

## 쓰는 곳

TI 앱노트에 따르면 DMS는 판단한 경계 수준에 따라 시각·음향 경고나 핸들 진동을 내거나, 차를 감속시켜 운전자가 다시 운전에 집중하게 한다.[@ti-snvaa88-2023]

EU 위임 규정 2023/2590은 [[ddaw-and-addw|ADDW]]가 운전자의 시선이 정해진 영역에 있는지 감시하도록 정한다.[@eu-2023-2590-2023]

## 동작

카메라 기반 DMS는 근적외선 LED(light-emitting diode)로 운전자를 비추고, 그 반사를 이미지 센서로 받아 영상을 처리한다. 근적외선은 사람 눈에 보이지 않지만, 출력이 높으면 눈을 해칠 수 있다.[@onsemi-tnd6416-2023][@ti-snvaa88-2023][@onsemi-tnd6449-2024]

TI 앱노트에 따르면 이 빛은 보이지 않아 운전자의 눈을 부시게 하거나 운전자의 주의를 흩뜨리지 않는다. DMS는 영상에서 얼굴 위치, 눈의 움직임과 깜빡임 반복, 동공 확장, 좌석에서 무너지듯 내려앉은 자세를 찾고, 이를 바탕으로 운전자의 경계 수준을 정한다.[@ti-snvaa88-2023]

TI 앱노트에 따르면 머리 자세만 보는 단순한 DMS는 머리는 도로를 향한 채 눈만 휴대전화 같은 다른 곳을 보는 경우를 다루지 못한다. 눈과 눈꺼풀은 빠르게 움직이므로, 이를 보려면 대개 약 30 fps(frames per second)로 영상을 분석한다.[@ti-spradp7a-2025]

RGB-IR 센서는 카메라 하나로 컬러 영상과 IR(infrared) 영상을 함께 찍는다. 외부 IR 조명을 주기적으로 켜고 끄면 컬러가 우세한 프레임과 IR이 우세한 프레임을 찍을 수 있고, 센서를 조명에 맞춰 두 프레임을 서로 다른 가상 채널로 보낼 수 있다. DMS는 대개 IR 프레임을 써서, 보이지 않는 빛으로 실내를 비추면서 운전자의 야간 시야를 지킨다.[@ti-spradp7a-2025]

onsemi 레퍼런스 디자인에 따르면 문서가 나온 2023년 무렵 DMS의 근적외선 조명은 940 nm 부근의 좁은 대역이 가장 흔한 선택이었다. 940 nm는 850 nm보다 햇빛의 간섭이 적고 850 nm에서 보이는 붉은 빛(red glow)을 크게 줄이지만, 파장이 850 nm에서 940 nm로 길어지면 이미지 센서의 양자 효율이 떨어진다.[@onsemi-tnd6416-2023]

DMS는 흔히 근적외선 LED를 짧고 큰 전류 펄스로 켜고, 이미지 센서가 내는 전용 strobe 제어 신호로 global shutter 이미지 센서의 프레임 노출 시간에 맞춘다. LED는 전력을 아끼려고 프레임 시간의 일부에서만 켜므로(예: 듀티 3%), 짧은 순간에는 큰 광출력을 내지만 평균 출력은 낮다. 조명은 DMS 카메라에 넣거나 카메라와 따로 둔다. 근적외선 조명이 눈 안전을 위한 IEC 62471을 따르는 것이 DMS 동작에 꼭 필요하다.[@onsemi-tnd6416-2023]

![[diagrams/dms-nir-led-strobe-timing.svg]]

## 시스템 구성

TI 자료에 따르면 DMS 카메라 모듈은 계기판, 대시보드, 조향 칼럼, 실내 거울, A 필러 같은 여러 자리에 둘 수 있다.[@ti-snvaa88-2023][@ti-sszt567-2018]

DMS [[electronic-control-unit|ECU]]는 원격 카메라 모듈에 전원을 주고, [[automotive-serdes|SerDes]] 링크로 카메라 모듈의 영상 데이터를 받는다. [[automotive-serdes#동작|Power-over-Coax]]를 쓰면 동축 케이블 하나로 영상 데이터와 전원을 함께 나른다.[@onsemi-tnd6416-2023][@ti-snvaa88-2023]

![[diagrams/dms-camera-ecu-connection.svg]]

## Euro NCAP Driver Engagement 프로토콜

Euro NCAP(차량의 안전을 높이는 데 힘쓰는 유럽의 독립 기관)의 Driver Engagement 프로토콜 v1.2는 운전자 상태를 transient와 non-transient로 나눈다.[@euroncap-driver-engagement-2026][@euroncap-about-2026] transient는 운전에 대한 집중이 잠시 줄었지만 바로 되돌릴 수 있는 상태로, long distraction, short distraction인 VATS(Visual Attention Time Sharing), phone use가 든다. non-transient는 운전을 멈추고 알맞은 회복 시간을 거쳐야 되돌릴 수 있는 상태로, impairment, microsleep, sleep, unresponsive driver가 든다. impairment는 운전 수행 능력을 떨어뜨려 충돌 위험을 높이는 상태로, 시간이 지나며 쌓이거나(대개 졸음) 주행을 시작할 때부터 있다(알코올이나 약물 같은 피로와 무관한 원인). 이 프로토콜은 머리를 돌려 시선을 도로에서 옮기는 owl 움직임과, 머리와 얼굴은 앞을 향한 채 주로 눈만 도로에서 떼는 lizard 움직임을 나눠 정의한다.[@euroncap-driver-engagement-2026]

이 프로토콜은 long distraction을 앞 도로에서 시선을 한 번 길게 떼는 것으로 정하고, 시선을 뗀 시간 $t_\mathrm{off}$를 $3\,\mathrm{s} \le t_\mathrm{off} \le 4\,\mathrm{s}$로 둔다. VATS는 30초 동안 시선을 뗀 시간을 모두 더한 값 $T_\mathrm{off}$가 $T_\mathrm{off} = 10\,\mathrm{s}$에 이르는 것이다. 눈을 감은 시간 $t_\mathrm{closed}$가 $1\,\mathrm{s} \le t_\mathrm{closed} \le 2\,\mathrm{s}$이면 microsleep, $t_\mathrm{closed} \ge 3\,\mathrm{s}$이면 sleep이다. 주의 분산 경고 뒤 시선이 앞 도로로 돌아오기까지의 시간 $t_\mathrm{return}$이 $t_\mathrm{return} > 3\,\mathrm{s}$이거나 $t_\mathrm{closed} \ge 6\,\mathrm{s}$이면 운전자를 unresponsive로 분류할 수 있다. drowsiness 항목에서는 늦어도 [[ddaw-and-addw#DDAW|KSS]] 수준이 7을 넘은 운전자를 감지하거나, 위험한 졸음을 가늠할 수 있는 그에 준하는 지표로 감지하는 시스템이 점수를 받을 수 있다.[@euroncap-driver-engagement-2026]

![[diagrams/euro-ncap-driver-state-time-thresholds.svg]]

이 프로토콜은 Driver Engagement 30점 가운데 Driver Monitoring에 25점을 둔다. 이 점수를 받으려면 DMS가 매 주행을 시작할 때 기본으로 켜져 있어야 하고, 버튼을 한 번 눌러서는 끌 수 없어야 하며, 운전자 상태 감지 민감도를 수동으로 바꿀 수 없어야 한다. 주의 분산, microsleep, sleep, unresponsive 상태에는 차속 $v$가 $v \ge 20\,\mathrm{km/h}$일 때 경고하거나 개입해야 한다.[@euroncap-driver-engagement-2026]

이 프로토콜은 넓은 범위의 운전자와 가림에서 DMS가 동작해야 점수를 주고, 제조사가 증빙 문서(dossier)로 이를 보이게 한다. 덮어야 하는 범위와, 동작하지 않을 때 운전자에게 알리기만 하면 되는 가림은 다음과 같다.[@euroncap-driver-engagement-2026]

| 갈래   | 항목                     | 범위                            | 요구                            |
| ------ | ------------------------ | ------------------------------- | ------------------------------- |
| 운전자 | 나이                     | 16\~18세부터 80세까지           | 동작                            |
| 운전자 | 성별                     | 남성, 여성                      | 동작                            |
| 운전자 | 체격                     | 프로토콜이 정한 범위            | 동작                            |
| 운전자 | 피부 유형                | Fitzpatrick 1\~6                | 동작                            |
| 운전자 | 눈꺼풀 틈                | 6\~12 mm                        | 동작                            |
| 가림   | 조명                     | 낮 100,000 lux부터 밤 1 lux까지 | 동작                            |
| 가림   | 안경                     | 투과율 70% 넘음                 | 동작                            |
| 가림   | 수염, 마스크             | —                               | 동작                            |
| 가림   | 선글라스                 | 투과율 15% 미만                 | 동작하지 않으면 운전자에게 알림 |
| 가림   | 핸들 위의 손             | 12시 방향에 한 손               | 동작하지 않으면 운전자에게 알림 |
| 가림   | 모자, 눈을 가리는 앞머리 | —                               | 동작하지 않으면 운전자에게 알림 |
| 가림   | 속눈썹 화장              | 짙은 화장                       | 동작하지 않으면 운전자에게 알림 |

이 프로토콜은 운전자가 주의 분산이나 impairment로 분류되면, [[adas#기능|FCW]]나 AEB(autonomous emergency braking), 또는 둘 다를 운전자 상태와 묶어, 주의를 기울인 운전자일 때보다 작동 시점을 앞당기는 시간 $\Delta t$가 $\Delta t \ge 200\,\mathrm{ms}$가 되게 한다.[@euroncap-driver-engagement-2026][@euroncap-about-2026] 운전자의 반응 시간이 길어지는 것을 감안하려는 것이다. impairment에는 Lane Support의 민감도도 함께 바꾸게 하고, 주의 분산 같은 transient 상태에는 함께 바꿔도 되게 한다. 운전자가 반응하지 않으면 Emergency Function이 앞차와의 거리와 차로를 지키며 차를 자동으로 감속시켜 안전하게 세우거나 $v < 10\,\mathrm{km/h}$로 늦춘다.[@euroncap-driver-engagement-2026]
