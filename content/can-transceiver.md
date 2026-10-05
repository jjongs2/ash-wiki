---
title: CAN 트랜시버
tags:
  - network/can
verified: 2026-09-27
---

**CAN 트랜시버**는 [[can-controller|CAN 컨트롤러]]가 쓰는 디지털 신호와 CAN_H·CAN_L 버스의 [[differential-signaling|차동 신호]] 사이를 변환한다.[@ti-tcan1042-q1-2021] 컨트롤러 쪽으로는 송신 데이터 입력 TXD와 수신 데이터 출력 RXD 핀을, 버스 쪽으로는 CAN_H와 CAN_L 핀을 둔다.[@nxp-tja1042-2023]

ISO 11898-1:2024는 트랜시버를 CAN 노드를 버스에 잇고 [[can-physical-layer|PMA]] 부계층을 구현하는 회로로 정의하고, bus comparator와 bus driver로 이뤄진다고 정한다. bus driver는 디지털 신호를 버스로 보낼 아날로그 신호로 바꾸고, bus comparator는 버스의 아날로그 신호를 디지털 신호로 되돌린다.[@iso-11898-1-obp-2024]

ISO 11898-2:2026은 TXD를 PCS(Physical Coding Sublayer)가 구동해 PMA가 버스 상태에 미치는 작용을 정하는 AUI(Attachment Unit Interface) 포트로, RXD를 버스의 실제 상태를 이진 값으로 PCS에 넘기는 AUI 포트로 정의한다.[@iso-11898-2-obp-2026]

![[diagrams/can-node-bus.svg]]

## 송신과 수신

TCAN1042의 Normal 모드에서 TXD가 low이면 드라이버가 버스를 차동으로 구동해 [[dominant-and-recessive|dominant]]로 만든다. high이면 구동하지 않고, 버스는 수신기 내부 저항으로 0.5 VCC에 바이어스된 recessive가 된다.[@ti-tcan1042-q1-2021] 모드에 따른 버스 바이어스는 [[can-physical-layer#고속 CAN|CAN 물리 계층]]에서 다룬다. ISO 11898-2:2026은 PMA가 중재 모드에 있을 때 dominant와 recessive를 동시에 보내면 버스가 dominant가 된다고 정한다.[@iso-11898-2-obp-2026]

![[diagrams/hs-can-bus-voltage.svg]]

수신기는 CAN_H와 CAN_L의 차동 전압 $V_\mathrm{diff}$를 판정해 RXD로 내보낸다.[@ti-tcan1042-q1-2021] 고속 트랜시버는 Normal 모드에서 $V_\mathrm{diff} \ge 0.9\,\mathrm{V}$이면 dominant, $V_\mathrm{diff} \le 0.5\,\mathrm{V}$이면 recessive로 판정한다.[@ti-tcan1042-q1-2021][@nxp-tja1042-2023]

![[diagrams/tja1042-receiver-threshold.svg]]

Normal 모드에서는 드라이버와 수신기가 함께 켜져 있어, 송신 중에도 RXD가 버스 상태를 따른다.[@ti-tcan1042-q1-2021] 송신 노드는 내보낸 비트를 버스에서 되읽어 대조하고, 중재 구간에서 자기가 낸 recessive 비트가 dominant로 읽히면 [[can-arbitration|중재]]에서 밀려난다.[@bosch-can-2-0-1991]

TI 앱노트에 따르면 송신 노드가 자기 비트를 되읽을 수 있도록 드라이버의 CANH·CANL 출력이 트랜시버 안에서 수신기 입력에 이어져 있다. 드라이버 입력에서 이 내부 루프를 거쳐 수신기 출력까지 걸리는 전파 지연을 **루프 지연**(loop time)이라 하고, 트랜시버의 성능을 견주는 척도로 흔히 쓴다. TI 데이터시트는 이를 tLOOP라 부르고, 벤더마다 부르는 이름이 다르다.[@ti-sloa101b-2016]

TJA1462의 루프 지연은 TXD에서 버스까지의 지연과 버스에서 RXD까지의 지연으로 이뤄진다. 전원 전압이 $4.75\,\mathrm{V} \le \mathrm{VCC} \le 5.25\,\mathrm{V}$일 때 앞의 지연은 최대 80 ns, 뒤의 지연은 최대 110 ns이고, TXD low에서 RXD low까지는 최대 190 ns다.[@nxp-tja1462-2025]

![[diagrams/tja1462-loop-delay.svg]]

트랜시버 지연 보상(TDC, Transceiver Delay Compensation)이 없으면, [[can-fd|CAN FD]] 데이터 구간의 비트율은 송신 노드가 자기가 낸 비트를 그 비트의 [[can-bit-timing#샘플 포인트|샘플 포인트]]까지 되받아야 한다는 조건에 묶인다.[@bosch-can-fd-1-0-2012] CAN FD 트랜시버는 데이터 구간의 높은 비트율을 지원하려고 loop delay symmetry를 보증한다.[@microchip-mcp2561-2fd-2014][@nxp-tja1145-2018]

CAN FD의 데이터 구간에서 TCAN1042는 모든 변종이 2 Mbit/s를, G 변종이 5 Mbit/s를 지원하고[@ti-tcan1042-q1-2021], TJA1042는 데이터 구간에서 5 Mbit/s까지 타이밍을 보증한다.[@nxp-tja1042-2023]

MCP2551은 슬루율 제어 모드에서 RFI(Radio Frequency Interference) 방사를 줄이는데, 슬루율이 낮아지는 만큼 같은 버스 길이에서는 비트율이, 같은 비트율에서는 버스 길이가 줄어든다.[@microchip-an228-2002] TI 앱노트에 따르면 드라이버 출력의 슬루율을 제어하면 dominant 비트의 상승이 완만해져 신호 품질이 나아지고, 스텁을 더 길게 둘 수 있으며 비트 오류율도 낮아진다.[@ti-sloa101b-2016]

## SIC와 FAST 모드

ISO 11898-2:2026은 SIC 모드와 FAST 모드를 갖춘 PMA를 Annex A에 따로 규정한다.[@iso-11898-2-obp-2026]

### SIC

ISO 11898-2:2026은 **SIC**(Signal Improvement Capability)를 MDI(Medium Dependent Interface)의 링잉을 억제하는 능력으로 정의한다. 이 표준은 dominant나 [[dominant-and-recessive#트랜시버 모드와 버스 상태|level_0]]에서 recessive로 넘어갈 때 정해진 시간 동안 공칭보다 낮은 임피던스로 구동하는 중간 출력을 **active recessive**로, 그 뒤 공칭 임피던스로 구동하는 마지막 출력을 **passive recessive**로 정의한다.[@iso-11898-2-obp-2026]

TJA1462는 ISO 11898-2:2024 파라미터 세트 C의 SIC를 갖춰 망의 링잉을 크게 줄이고, 그만큼 더 큰 토폴로지에서도 CAN FD 통신이 안정되게 한다.[@nxp-tja1462-2025]

전원 전압이 $4.75\,\mathrm{V} \le \mathrm{VCC} \le 5.25\,\mathrm{V}$일 때, TJA1462의 Normal 모드에서 TXD가 low에서 high로 바뀌면 버스는 70\~120 ns 뒤 active recessive를 시작해 355\~480 ns 뒤 끝내고, 415\~530 ns 뒤 passive recessive로 들어간다. active recessive 동안 CAN_H와 CAN_L의 입력 저항은 저마다 37.5\~62.5 Ω이다.[@nxp-tja1462-2025]

![[diagrams/tja1462-sic-recessive-timing.svg]]

TJA1462는 표준 CAN FD 트랜시버보다 비트 타이밍 대칭을 더 좁게 맞춰 8 Mbit/s까지의 CAN FD를 지원한다. 전원 전압이 같은 범위이고 TXD의 비트 시간 $t_\mathrm{bit}$이 $t_\mathrm{bit} \ge 125\,\mathrm{ns}$일 때 버스로 나간 recessive 비트의 폭은 TXD의 비트 폭과 ±10 ns 안에서, RXD로 받은 recessive 비트의 폭은 −30\~+20 ns 안에서 다르다.[@nxp-tja1462-2025]

### FAST 모드

ISO 11898-2:2026은 PMA가 버스를 level_0과 level_1 두 상태로 구동하는 모드를 **FAST TX 모드**로 정의한다. PMA가 버스를 recessive로 두고 수신 문턱을 level_0과 level_1을 가르도록 맞추는 모드는 **FAST RX 모드**로 정의한다.[@iso-11898-2-obp-2026]

CiA는 SIC 모드와 FAST 모드를 함께 지원하는 트랜시버를 **CAN SIC XL 트랜시버**라 부른다.[@cia-physical-layer-options-2026]

## 보호 기능

CAN 트랜시버는 과열되면 출력 드라이버를 끄고, 버스 선 단락으로부터 드라이버를 보호한다.[@ti-tcan1042-q1-2021][@microchip-mcp2561-2fd-2014]

TXD가 정해진 시간보다 오래 low로 머물면 송신기를 끄는 트랜시버가 있다(TXD dominant time-out). 고장 난 노드가 버스를 계속 망가뜨리는 것을 막기 위해서다.[@nxp-tja1042-2023][@microchip-an228-2002] TJA1042는 이때 버스를 recessive로 풀어 준다.[@nxp-tja1042-2023] ISO 11898-2:2026은 송신 dominant time-out을 선택 기능으로 둔다.[@iso-11898-2-obp-2026] TCAN1042는 버스 선이 단락되면 드라이버 전류를 제한한다.[@ti-tcan1042-q1-2021]

TI CAN 트랜시버는 전원이 있든 없든 출력 임피던스가 높아, 회로에서 전원이나 접지가 빠져도 버스를 해치지 않는다. TI 앱노트에 따르면 시중의 많은 트랜시버는 전원이 없을 때 출력 임피던스가 낮아 버스의 신호를 끌어들이고 데이터 전송을 모두 막는다.[@ti-sloa101b-2016] TJA1462도 공급 전압이 문턱 아래로 떨어지면 Off 모드로 들어가 CAN 핀을 고임피던스로 둔다.[@nxp-tja1462-2025]

## 저전력 모드와 웨이크업

ISO 11898-2:2026은 트랜시버가 송수신할 수 있는 모드를 **normal-power mode**로, 웨이크업 패턴(WUP, wake-up pattern)이나 웨이크업 프레임(WUF, wake-up frame)을 받는지 가리는 것 말고는 프레임을 송수신하지 못하는 모드를 **low-power mode**로 정의한다.[@iso-11898-2-obp-2026]

TCAN1042의 Standby 모드에서는 드라이버와 일반 수신기를 끄고 저전력 수신기만 버스를 감시한다. 웨이크업 패턴을 감지하면 RXD를 low로 내려 MCU에 웨이크업 요청을 알린다.[@ti-tcan1042-q1-2021] TJA1042는 Standby 모드에서 버스의 dominant가 정해진 시간보다 오래 이어지면 RXD를 high로 되돌려, 단락된 버스가 웨이크업 요청을 계속 만들지 않게 한다.[@nxp-tja1042-2023]

TJA1462가 받아들이는 웨이크업 패턴은 dominant 구간, recessive 구간, dominant 구간이 차례로 이어진 것이고, 구간마다 정해진 최소 길이를 넘어야 한다. 구간 사이에 끼인 그보다 짧은 dominant나 recessive 비트는 무시하고, 패턴 전체를 정해진 시간 안에 받지 못하면 웨이크업 논리를 초기화한다.[@nxp-tja1462-2025]

![[diagrams/tja1462-wake-up-pattern.svg]]

TJA1463은 Listen-only 모드에서 수신기만 켜고 송신기는 끈다.[@nxp-tja1463-2025]

선택적 웨이크업을 켠 트랜시버는 웨이크업 패턴만으로는 깨어나지 않고, [[can-identifier|식별자]]가 미리 설정한 값과 맞는 웨이크업 프레임을 받으면 깨어난다.[@nxp-tja1145-2018][@ti-tcan1145-q1-2022] TJA1465는 웨이크업 프레임을 식별자만으로 거르거나, 식별자에 [[data-length-code|DLC]]와 데이터 마스크를 더해 거른다.[@nxp-tja1465-2024]

선택적 웨이크업 기능을 갖춘 고속 트랜시버는 이 기능을 위해 CAN 데이터 링크 계층의 일부를 구현한다. [[iso-16845-2|ISO 16845-2:2018]]은 동적 시험에 이렇게 부분 구현된 Classical CAN과 CAN FD 프로토콜의 시험 케이스를 둔다.[@iso-16845-2-obp-2018]

## 저속 내결함성 트랜시버와의 차이

recessive 출력 전압은 고속 트랜시버 TJA1042가 Normal 모드에서 두 선 모두 약 0.5 VCC(2~3 V)이고[@nxp-tja1042-2023], 저속 내결함성 트랜시버 TJA1055가 $V_\mathrm{CAN\_H} \le 0.2\,\mathrm{V}$, $V_\mathrm{CAN\_L} \ge \mathrm{VCC} - 0.2\,\mathrm{V}$이다.[@nxp-tja1055-2013]

![[diagrams/can-recessive-voltage-hs-ls.svg]]

TJA1055는 dominant에서는 반대로 CAN_H를 CAN_L보다 높게 구동한다.[@nxp-tja1055-2013] TJA1055T로 꾸린 내결함성 CAN 망은 고속 트랜시버와 종단 저항을 단 CAN 도구가 이어지면 두 선 사이에 종단 저항이 생겨, 줄곧 [[can-physical-layer#저속 내결함성 CAN|단선 모드]]로 동작한다.[@nxp-ah0801-2016]
