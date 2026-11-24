---
title: ITS-G5
tags:
  - network/v2x
verified: 2026-11-21
---

**ITS-G5**는 유럽의 ITS(Intelligent Transport Systems) 전용 주파수 대역에서 쓰는 접속 계층(access layer) 기술, 곧 프로토콜 스택의 가장 아래 두 계층인 물리 계층과 데이터 링크 계층을 통틀어 부르는 이름이다. 5.9 GHz 대역에서 ad hoc 네트워크로 차량끼리 통신하는 데 쓴다.[@etsi-en-302-663-2020]

ITS-G5 접속 계층은 IEEE 802.11-2016, IEEE/ISO/IEC 8802-2-1998, IEEE 802-2014와 혼잡 제어 명세 ETSI TS 102 687로 이루어진다. 데이터 링크 계층은 MAC(Medium Access Control)과 LLC(Logical Link Control) 두 부계층으로 나뉘고, 물리 계층과 MAC은 IEEE 802.11-2016이, LLC는 IEEE/ISO/IEC 8802-2-1998이 맡는다.[@etsi-en-302-663-2020]

## 주파수 대역

ETSI EN 302 571 V2.1.1은 5 GHz ITS 주파수 대역을 **ITS-G5B**(5855\~5875 MHz), **ITS-G5A**(5875\~5905 MHz), **ITS-G5D**(5905\~5925 MHz)로 정의하고, 각각의 쓰임을 ITS 비안전 응용, ITS 도로 안전, 앞으로의 ITS 응용으로 둔다. 장비는 5860 MHz부터 5920 MHz까지 10 MHz 간격으로 놓인 반송파 중심 주파수 7개에서 동작하고, 채널 대역폭은 최대 10 MHz다. 실제 반송파 중심 주파수는 공칭값의 ±20 ppm 안에 있어야 하고, 최대 출력은 송신 버스트 동안의 평균 EIRP(equivalent isotropically radiated power)로 33 dBm을 넘지 않아야 한다.[@etsi-en-302-571-2017]

EU 시행 결정 2020/1426은 회원국이 2021년 6월 30일까지 5875\~5935 MHz를 ITS에 지정하되, 5925\~5935 MHz는 urban rail ITS(도시 철도 ITS)에만 쓰도록 요구한다. 5915 MHz 아래에서는 도로 ITS 응용이, 위에서는 urban rail ITS 응용이 우선이고, 5915\~5925 MHz에서 도로 ITS는 I2V(infrastructure-to-vehicle) 연결 응용만 쓸 수 있다.[@eu-2020-1426-2020]

![[diagrams/its-g5-frequency-bands.svg]]

EU 시행 결정 2026/1800은 2020/1426의 Annex를 바꿨다. 바뀐 Annex는 이 대역의 ITS 장비에 평균 EIRP로 스펙트럼 전력 밀도 최대 23 dBm/MHz와 전체 송신 전력 최대 33 dBm을 두고, TPC(transmit power control)가 전체 전력을 최대에서 3 dBm EIRP까지 낮출 수 있어야 한다고 정한다. 도로 ITS 응용은 5875 MHz부터 10 MHz씩 나눈 블록 하나 안에 드는 채널을 쓰고, 두 블록을 이어 20 MHz 채널 하나로 쓸 수 있다. 5905\~5925 MHz의 두 블록으로 만든 20 MHz 채널은 I2V 통신에만 쓴다.[@eu-2026-1800-2026]

CEPT(유럽 우편·전기통신 주관청 회의)의 ECC/DEC/(08)01(2025년 3월 7일 개정, ECC: 유럽의 전자통신 정책과 주파수 조화를 맡는 CEPT 위원회)은 CEPT 주관청이 차량에 단 ITS 장비와 이동 ITS 장비를 모두 개별 면허에서 면제하도록 정한다.[@cept-ecc-dec-08-01-2025][@cept-leaflet-2025]

## 물리 계층

ETSI EN 302 663 V1.3.1은 ITS-G5의 물리 계층을 IEEE 802.11-2016 clause 17의 OFDM(orthogonal frequency division multiplexing) "half-clocked" 동작으로 정하고, 10 MHz 주파수 채널을 쓰게 한다. 필수 전송 속도는 3, 6, 12 Mbit/s다.[@etsi-en-302-663-2020]

## 데이터 링크 계층

LLC는 Type 1, 곧 확인 없는 비연결 모드로 동작하고, [[ethernet-frame#IP 캡슐화|SNAP]]은 IEEE 802-2014를 따른다. IEEE 802.11-2016 Annex E.2.4의 EtherType protocol discrimination은 쓰지 않는다.[@etsi-en-302-663-2020]

MAC 부계층은 IEEE 802.11-2016의 MIB(Management Information Base) 파라미터 dot11OCBActivated를 true로 두어 켠다.[@etsi-en-302-663-2020]

Annex C(informative)는 ITS-G5의 [[v2x-security|보안]]을 협력 ITS 분야의 다른 표준이 맡는다고 제시한다.[@etsi-en-302-663-2020]

## 혼잡 제어

**DCC**(Decentralized Congestion Control)는 현재 부하에 따라 ITS station의 송신 기회 수를 조절하는 식으로 망 부하를 다스리는 관리 개체다. DCC는 상호 운용을 위한 프로토콜이 아니라, 한 ITS station이 채널의 자원을 다 쓰지 못하게 하는 알고리즘이다.[@etsi-en-302-663-2020]

ETSI EN 302 571 V2.1.1은 IEEE 802.11-2012에 바탕한 접속 계층 기술을 쓰는 장비에 DCC를 의무 메커니즘으로 둔다. 장비는 채널이 얼마나 차 있는지에 따라 송신 동작을 바꾸고, 그 기준으로 CBR(Channel Busy Ratio)을 쓴다. **CBR**은 $T_\mathrm{CBR} = 100\,\mathrm{ms}$ 동안 받은 신호의 세기가 −85 dBm을 넘은 시간을 $T_\mathrm{busy}$라 할 때 다음과 같다.[@etsi-en-302-571-2017]

$$
\mathrm{CBR} = \frac{T_\mathrm{busy}}{T_\mathrm{CBR}}
$$

송신 한 번의 길이를 $T_\mathrm{on}$, 연이은 두 송신 사이의 간격을 $T_\mathrm{off}$, 1초 동안 한 반송파에서 송신한 시간의 비율을 **duty cycle**이라 하면, 셋은 $0 < T_\mathrm{on} \le 4\,\mathrm{ms}$, $\mathrm{duty\ cycle} \le 3\,\%$, $T_\mathrm{off} \ge 25\,\mathrm{ms}$를 지켜야 한다. $\mathrm{CBR} \ge 0.62$이면 $T_\mathrm{off}$는 아래 식도 지켜야 한다.[@etsi-en-302-571-2017]

$$
T_\mathrm{off} \ge \min\left\{1000\,\mathrm{ms},\ T_\mathrm{on} \times \left(4000 \times \frac{\mathrm{CBR} - 0.62}{\mathrm{CBR}} - 1\right)\right\}
$$

ETSI TS 102 687 V1.2.1은 망 부하를 다스리는 기법으로 TPC, TRC(Transmit rate control), TDC(Transmit datarate control)를 두고, DCC 알고리즘이 이 가운데 하나나 여럿을 함께 쓸 수 있게 한다. DCC 알고리즘은 ETSI EN 302 571이 정한 주파수 채널마다 따로, 적어도 200 ms마다 돌아야 한다. 알고리즘은 그때의 CBR에 따라 여러 상태 가운데 하나에 드는 reactive 방식과, ITS station이 송신해도 되는 시간 비율의 상한을 고쳐 CBR이 목표값을 따라가게 하는 adaptive 방식 가운데 하나로 구현하고, adaptive 방식의 CBR 목표값 기본 설정은 0.68이다.[@etsi-ts-102-687-2018]

## CEN DSRC 보호

ETSI EN 302 571 V2.1.1은 5795\~5815 MHz의 전자 요금 징수를 해로운 간섭에서 지키도록, 장비가 ETSI TS 102 792가 정한 완화 기법을 구현하게 한다.[@etsi-en-302-571-2017]

> [!warning]
> 이 명세는 **DSRC**(Dedicated Short Range Communication)를 5.8 GHz 요금 징수에 쓰는 CEN DSRC로 정의한다.[@etsi-en-302-571-2017] 2024년 당시 미국 FCC 규칙은 [[ieee-1609#미국 5.9 GHz 대역|DSRC]]를 노변 장치와 이동 장치 사이 등에서 짧은 거리로 데이터를 보내 교통 흐름과 교통 안전 같은 ITS 응용에 쓰는 무선 기술로 정의했다.[@fcc-24-123-2024]

## IEEE 802.11의 물리 계층과 MAC

IEEE 802.11-2024는 clause 17의 OFDM 물리 계층에서 채널 간격이 10 MHz일 때 부반송파를 52개(데이터 48개, 파일럿 4개)로, OFDM 심볼 간격을 8 µs로 둔다.[@ieee-802-11-2024]

dot11OCBActivated가 true인 스테이션은 IEEE 802.11 LAN의 기본 구성 단위인 BSS(Basic Service Set)에 속하지 않고, BSS 밖에서 Data 프레임을 보낸다. 이 스테이션은 IEEE 802.11의 인증, 연결(association), data confidentiality 서비스를 쓰지 않고, BSS에 들거나 BSS를 시작하지 않는다. BSS의 구성원이 아니므로 공통 클럭에 동기화할 필요도 없다. 처음에는 규제로 지정되었거나 다른 대역 밖 통신으로 미리 알려진 채널에서 송수신한다.[@ieee-802-11-2024]

이 스테이션은 모든 관리 프레임과 Data 프레임의 BSSID(Basic Service Set Identifier) 필드를 모든 비트가 1인 wildcard BSSID로 둔다.[@ieee-802-11-2024]

이 표준은 DMG(Directional Multi-Gigabit) 스테이션이 아닌 스테이션의 기본 MAC 접근 방식을 CSMA/CA(Carrier Sense Multiple Access with Collision Avoidance)인 DCF(Distributed Coordination Function)로 정한다. 스테이션은 송신하기 전에 매체를 감지하고, 정해진 최소 시간 동안 매체가 비어 있어야 송신한다. 매체가 차 있으면 지금의 송신이 끝날 때까지 미룬 뒤, backoff 카운터를 무작위 값으로 두고 매체가 비어 있는 동안 slot 시간마다 하나씩 줄인다. **EDCA**(Enhanced Distributed Channel Access)는 QoS BSS의 QoS 스테이션과 BSS 밖에서 동작하는 스테이션이 쓰는, 우선순위를 둔 CSMA/CA 접근 메커니즘이다. EDCA에서는 access category마다 따로 도는, DCF를 고친 접근 함수가 자기 EDCA 파라미터로 송신 기회를 다툰다.[@ieee-802-11-2024]

이 표준이 dot11OCBActivated가 true일 때 QoS 프레임을 보내는 스테이션에 정한 기본 EDCA 파라미터는 아래와 같다. access category마다의 대기 시간 AIFS(Arbitration Interframe Space)는 AIFSN(AIFS Number)으로 $\mathrm{AIFS} = \mathrm{AIFSN} \times \mathrm{aSlotTime} + \mathrm{aSIFSTime}$이다. 채널 간격이 10 MHz인 OFDM 물리 계층에서는 aCWmin이 15, aCWmax가 1023, aSIFSTime이 32 µs이고, aSlotTime은 dot11OperatingClassesRequired가 false면 13 µs다.[@ieee-802-11-2024]

| access category | 쓰임        | CWmin                     | CWmax                     | AIFSN |
| --------------- | ----------- | ------------------------- | ------------------------- | ----- |
| AC_BK           | background  | aCWmin                    | aCWmax                    | 9     |
| AC_BE           | best effort | aCWmin                    | aCWmax                    | 6     |
| AC_VI           | video       | aCWmin                    | aCWmax                    | 4     |
| AC_VO           | voice       | $(\mathrm{aCWmin}+1)/4-1$ | $(\mathrm{aCWmin}+1)/2-1$ | 2     |

## 이력

EU 집행위원회는 2016년 협력 ITS 전략에서, ETSI의 단거리 무선 통신 ITS-G5가 쓰는 주파수의 지정을 안전 관련 ITS 서비스에 유지하자고 제안했다. 업계의 노력으로 차량과 주변 사이의 단거리 통신에는 서로 경쟁하는 두 기술, ITS-G5와 [[c-v2x#쓰는 곳|LTE-V2X]]가 개발되었다.[@eu-2020-1426-2020]

IEEE 802.11p-2010은 차량 환경에서 무선 통신을 할 수 있도록 IEEE 802.11 무선 LAN을 넓혔고, 2026년 11월 기준 Superseded 상태다.[@ieee-802-11p-2010] IEEE 802.11bd-2022는 5.9 GHz와 60 GHz 대역의 차세대 [[v2x|V2X]] 통신을 위해 IEEE 802.11의 물리 계층과 MAC 부계층을 고쳤고, 역시 Superseded 상태다.[@ieee-802-11bd-2022] 같은 때 IEEE 802.11-2024는 Active 상태다.[@ieee-802-11-2024]

ETSI EN 302 663은 2010년 1월 ETSI ES 202 663 V1.1.0으로 처음 나왔다. 2013년 7월의 V1.2.1은 ES 202 663을 처음 European Norm으로 낸 판으로, 802.11p의 마지막 변경과 802.11p의 802.11 편입을 반영했다. V1.3.1은 2020년 1월에 나왔다.[@etsi-en-302-663-2020]
