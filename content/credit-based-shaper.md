---
title: Credit-based shaper
tags:
  - network/ethernet
aliases:
  - CBS
  - IEEE 802.1Qav
verified: 2026-09-29
---

**Credit-based shaper**(CBS)는 큐가 내보내는 속도를 그 큐에 예약한 대역폭까지로 제한하는 shaper다.[@microchip-ksz9477s-2019][@st-rm0436-2025] IEEE 802.1Q가 정하는 알고리즘으로, 브리지와 종단국에 쓰인다.[@ieee-802-1q-2022] IEEE 802.1Qav-2009가 CBS를 정했고, 이 개정은 IEEE 802.1Q-2014에 합쳐졌다.[@ieee-802-1-tsn-tg-2017] 현행판은 IEEE 802.1Q-2022다.[@ieee-802-1q-2022]

IEEE 802.1Qav 프로젝트는 브리지가 시간에 민감한 오디오·비디오 트래픽에 지연과 전달 변동의 상한을 보장하게 하는 것을 목표로 했다.[@ieee-802-1qav-project-2009] IEEE 802.1 작업 그룹의 [[tsn|TSN]] 요약은 CBS를 지연 상한을 위한 도구로 분류한다.[@ieee-802-1-tsn-summary-2026] CBS는 [[avb|AVB]]의 [[avb#SR 클래스|SR(Stream Reservation) 클래스]] 트래픽을 내보내는 데 쓰인다.[@microchip-ksz9477s-2019][@intel-i210-2019]

## 구조·동작

### credit

CBS는 큐마다 credit 값을 둔다.[@intel-i210-2019][@microchip-sam-e70-2026]

- 큐에 보낼 프레임이 있지만 다른 큐가 전송하는 동안 기다리면 credit은 idleSlope의 비율로 오른다.[@intel-i210-2019][@microchip-sam-e70-2026]
- 큐가 프레임을 내보내는 동안 credit은 sendSlope의 비율로 내려간다.[@st-rm0436-2025][@microchip-sam-e70-2026]
- 큐가 비었을 때 $\mathrm{credit} > 0$이면 credit은 0이 된다.[@st-rm0436-2025][@intel-i210-2019]
- 큐는 보낼 프레임이 있고 $\mathrm{credit} \ge 0$일 때 전송할 수 있다.[@intel-i210-2019][@microchip-sam-e70-2026]

![[diagrams/cbs-credit-timeline.svg]]

idleSlope는 큐에 예약한 대역폭에 해당한다.[@st-rm0436-2025][@intel-i210-2019] sendSlope의 크기는 포트의 전송 속도 portTransmitRate에서 idleSlope를 뺀 값, 곧 $\mathrm{portTransmitRate} - \mathrm{idleSlope}$다.[@st-rm0436-2025][@microchip-sam-e70-2026] I210 데이터시트는 sendSlope를 $\mathrm{idleSlope} - \mathrm{portTransmitRate}$로 계산하며, $\mathrm{idleSlope} < \mathrm{portTransmitRate}$여야 하므로 sendSlope는 음수다.[@intel-i210-2019]

credit에는 위 한계 hiCredit이 있다.[@st-rm0436-2025][@intel-i210-2019] I210 데이터시트는 우선순위가 가장 높은 큐의 hiCredit을 최대 전송 패킷 크기와 그 큐의 예약 대역폭으로 계산하게 하고, 다음 큐의 식에는 앞 큐의 프레임도 더한다.[@intel-i210-2019] STM32MP157의 이더넷은 아래 한계 loCredit도 둔다. RM0436은 hiCredit의 최댓값으로 best-effort 트래픽의 최대 패킷 크기를, loCredit 크기의 최댓값으로 그 큐가 내보내는 최대 프레임 크기를 제시한다.[@st-rm0436-2025]

### 트래픽 클래스와의 관계

CBS를 쓰는 트래픽 클래스는 [[traffic-class|strict priority]]를 쓰는 트래픽 클래스보다 우선순위가 높은 큐에 둔다.[@microchip-ksz9477s-2019][@intel-i210-2019] CBS 큐가 credit 때문에 전송할 수 없는 동안에는 낮은 우선순위의 큐가 전송한다.[@intel-i210-2019][@microchip-sam-e70-2026] CBS를 쓰는 트래픽 클래스가 예약 대역폭을 다 쓰지 않으면, 남는 대역폭을 strict priority의 낮은 트래픽 클래스가 쓸 수 있다.[@microchip-ksz9477s-2019][@st-rm0436-2025]

## 비교·한계

KSZ9477S 데이터시트에 따르면 best-effort 큐의 큰 패킷 전송은 CBS의 성능을 떨어뜨릴 수 있다.[@microchip-ksz9477s-2019]

Microchip AN1185에 따르면 credit-based shaper는 우선순위에 따라 큐가 쓰는 대역폭을 조절하고, [[time-aware-shaper|time-aware shaper]]는 큐마다 전송을 전역 시간 척도에 맞춰 스케줄한다.[@microchip-an1185-2025]
