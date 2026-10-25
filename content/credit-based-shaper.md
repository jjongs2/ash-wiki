---
title: Credit-based shaper
tags:
  - network/ethernet
aliases:
  - CBS
  - IEEE 802.1Qav
verified: 2026-09-29
---

**Credit-based shaper**(CBS)는 큐가 내보내는 속도를 그 큐에 예약한 대역폭까지로 제한하는 shaper다.[@microchip-ksz9477s-2019][@st-rm0436-2025] [[ieee-802-1q|IEEE 802.1Q]]가 정하는 알고리즘으로, 브리지와 엔드 스테이션에 쓰인다.[@ieee-802-1q-2022] IEEE 802.1Qav-2009가 CBS를 정했고[@ieee-802-1-tsn-tg-2017], 이 개정은 IEEE 802.1Q-2011에 합쳐졌다.[@ieee-802-1q-2011] 현행판은 IEEE 802.1Q-2022다.[@ieee-802-1q-2022]

IEEE 802.1Qav 프로젝트는 브리지가 시간에 민감한 오디오·비디오 트래픽에 지연과 전달 변동의 상한을 보장하게 하는 것을 목표로 했다.[@ieee-802-1qav-project-2009] IEEE 802.1 작업 그룹의 [[tsn|TSN]] 요약은 CBS를 지연 상한을 위한 도구로 분류한다.[@ieee-802-1-tsn-summary-2026] CBS는 AVB의 [[avb#SR 클래스|SR(Stream Reservation) 클래스]] 트래픽을 내보내는 데 쓰인다.[@microchip-ksz9477s-2019][@intel-i210-2019]

## Credit

CBS는 큐마다 credit 값을 둔다.[@intel-i210-2019][@microchip-sam-e70-2026]

- 큐에 보낼 프레임이 있지만 다른 큐가 전송하는 동안 기다리면 credit은 idleSlope의 비율로 오른다.[@intel-i210-2019][@microchip-sam-e70-2026]
- 큐가 프레임을 내보내는 동안 credit은 sendSlope의 비율로 내려간다.[@st-rm0436-2025][@microchip-sam-e70-2026]
- 큐가 비었을 때 $\mathrm{credit} > 0$이면 credit은 0이 된다.[@st-rm0436-2025][@intel-i210-2019] credit이 0으로 되돌려지는 것은 $\mathrm{credit} > 0$일 때뿐이다. 큐가 전송하지 않는 동안([[time-aware-shaper|scheduled traffic]]을 쓰면 [[time-aware-shaper#게이트|게이트]]가 열려 있는 동안) credit은 큐가 비어 있어도 idleSlope의 비율로 오르므로, 큐가 비었을 때 음수인 credit은 0이 될 때까지 오른다.[@ieee-802-1q-2022]
- 큐는 보낼 프레임이 있고 $\mathrm{credit} \ge 0$일 때 전송할 수 있다.[@intel-i210-2019][@microchip-sam-e70-2026]

![[diagrams/cbs-credit-timeline.svg]]

idleSlope는 큐에 예약한 대역폭에 해당한다.[@st-rm0436-2025][@intel-i210-2019] sendSlope의 크기는 포트의 전송 속도 portTransmitRate에서 idleSlope를 뺀 값, 곧 $\mathrm{portTransmitRate} - \mathrm{idleSlope}$다.[@st-rm0436-2025][@microchip-sam-e70-2026] I210(Intel의 [[ethernet|이더넷]] 컨트롤러) 데이터시트는 sendSlope를 $\mathrm{idleSlope} - \mathrm{portTransmitRate}$로 계산하며, $\mathrm{idleSlope} < \mathrm{portTransmitRate}$여야 하므로 sendSlope는 음수다.[@intel-i210-2019]

credit에는 위 한계 hiCredit이 있다.[@st-rm0436-2025][@intel-i210-2019] I210 데이터시트는 우선순위가 가장 높은 큐의 hiCredit을 최대 전송 패킷 크기와 그 큐의 예약 대역폭으로 계산하게 하고, 다음 큐의 식에는 앞 큐의 프레임도 더한다.[@intel-i210-2019] STM32MP157(STMicroelectronics의 Arm 기반 32비트 마이크로프로세서)의 이더넷은 아래 한계 loCredit도 둔다. STM32MP157 참조 매뉴얼은 hiCredit의 최댓값으로 best-effort 트래픽의 최대 패킷 크기를, loCredit 크기의 최댓값으로 그 큐가 내보내는 최대 프레임 크기를 제시한다.[@st-rm0436-2025]

IEEE 802.1Q-2022의 Annex L(참고)은 loCredit과 hiCredit을 아래 식으로 제시한다. maxFrameSize는 그 트래픽 클래스가 포트로 보낼 수 있는 가장 큰 프레임의 크기이고, maxInterferenceSize는 그 트래픽 클래스의 프레임 전송을 늦출 수 있는 트래픽 버스트의 가장 큰 크기(비트)다.[@ieee-802-1q-2022]

$$
\mathrm{loCredit} = \mathrm{maxFrameSize} \cdot \frac{\mathrm{sendSlope}}{\mathrm{portTransmitRate}}
$$

$$
\mathrm{hiCredit} = \mathrm{maxInterferenceSize} \cdot \frac{\mathrm{idleSlope}}{\mathrm{portTransmitRate}}
$$

이 Annex는 maxInterferenceSize로, 번호가 가장 큰 트래픽 클래스에서는 포트로 보낼 수 있는 가장 큰 프레임의 크기를 제시하고, 다른 트래픽 클래스에서는 더 높은 트래픽 클래스의 CBS 큐가 전송을 늦출 수 있는 것까지 셈에 넣는다고 제시한다. 이 Annex의 알고리즘에서 credit 값은 hiCredit을 넘지 않는다.[@ieee-802-1q-2022]

## 트래픽 클래스와의 관계

이 표준은 모든 브리지가 기본으로 지원해야 하는 [[traffic-class|strict priority]]에 더해 지원할 수 있는 [[traffic-class#전송 선택|전송 선택 알고리즘]]의 하나로 CBS를 두고, 포트의 전송 선택 알고리즘 표로 트래픽 클래스마다 쓸 알고리즘을 정한다. 이 표에서 CBS의 식별자는 1이다. 이 표준이 권하는 기본 설정은 SR 클래스 A(우선순위 3)와 SR 클래스 B(우선순위 2)를 CBS를 쓰는 트래픽 클래스에 대응시킨다. 트래픽 클래스가 셋 이상이면 두 SR 클래스를 서로 다른 트래픽 클래스에, 둘뿐이면 한 트래픽 클래스에 둔다. CBS는 트래픽 클래스 N의 큐에 지금 예약된 대역폭인 operIdleSlope(N)을 idleSlope로 써서 나가는 트래픽을 셰이핑한다.[@ieee-802-1q-2022]

이 표준은 CBS가 뜻대로 동작하려면 CBS를 쓰는 트래픽 클래스가 strict priority를 쓰는 어느 트래픽 클래스보다도 번호가 커야 한다고 정한다.[@ieee-802-1q-2022] CBS 큐가 credit 때문에 전송할 수 없는 동안에는 낮은 우선순위의 큐가 전송한다.[@intel-i210-2019][@microchip-sam-e70-2026] CBS를 쓰는 트래픽 클래스가 예약 대역폭을 다 쓰지 않으면, 남는 대역폭을 strict priority의 낮은 트래픽 클래스가 쓸 수 있다.[@microchip-ksz9477s-2019][@st-rm0436-2025]

가장 높은 SR 클래스의 CBS 큐도 바로 전에 전송을 시작한 다른 프레임이 끝나기를 기다려야 하므로, 그 큐의 프레임은 매체가 지원하는 가장 긴 프레임을 보내는 시간만큼 늦어질 수 있다. 저전력 모드에서 돌아오는 매체 접근 지연이 그보다 길면 그만큼 늦어진다. 낮은 SR 클래스의 프레임은 여기에 더해 더 높은 SR 클래스가 몰아 보내는 프레임만큼 기다린다.[@ieee-802-1q-2022] KSZ9477S(Microchip의 7포트 기가비트 [[ethernet-switch|이더넷 스위치]]) 데이터시트에 따르면 best-effort 큐의 큰 패킷 전송은 CBS의 성능을 떨어뜨릴 수 있다.[@microchip-ksz9477s-2019]

## 예약할 수 있는 대역폭

IEEE 802.1Q-2022는 SR 클래스로 설정한 트래픽 클래스 $N$마다, [[srp|SRP]]가 그 트래픽 클래스의 큐에 예약할 수 있는 대역폭을 portTransmitRate에 대한 백분율 deltaBandwidth($N$)으로 둔다. lockClassBandwidth($N$)이 기본값인 거짓이면, deltaBandwidth($N$)은 lockClassBandwidth가 거짓인 더 높은 트래픽 클래스들의 deltaBandwidth에 더해 예약할 수 있는 몫이다. 트래픽 클래스 $N$이 예약할 수 있는 대역폭은 $N$과, lockClassBandwidth가 거짓인 그보다 높은 트래픽 클래스들의 deltaBandwidth를 합한 것에서, 더 높은 트래픽 클래스가 이미 예약한 대역폭을 뺀 것이다. deltaBandwidth($N$)의 기본값은 번호가 가장 큰 트래픽 클래스에서 75%, 그보다 낮은 트래픽 클래스에서 0%다.[@ieee-802-1q-2022]

이 표준은 deltaBandwidth의 합을 예약하지 않는 트래픽(best-effort, strict priority)에 대역폭이 충분히 남도록 고르기를 권한다. 기본값의 합은 75%이므로, 기본 설정에서는 포트 대역폭의 25% 이상이 예약하지 않는 트래픽에 남는다. 이 기본값은 관리로 바꿀 수 있다.[@ieee-802-1q-2022]

## Time-aware shaper와의 차이

Microchip AN1185에 따르면 credit-based shaper는 우선순위에 따라 큐가 쓰는 대역폭을 조절하고, [[time-aware-shaper|time-aware shaper]]는 큐마다 전송을 전역 시간 척도에 맞춰 스케줄한다.[@microchip-an1185-2025]
