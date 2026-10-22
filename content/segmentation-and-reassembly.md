---
title: 분할과 재조립
tags:
  - network
verified: 2026-09-27
---

**분할**(segmenting)은 한 계층이 SDU(Service Data Unit) 하나를 여러 PDU(Protocol Data Unit)로 나누는 기능이고, **재조립**(reassembling)은 받는 쪽이 그 PDU들을 원래 SDU로 되돌리는 기능이다. 계층 사이에서 데이터 단위의 크기가 맞지 않을 때 쓴다.[@itu-t-x-200-1994]

![[diagrams/sdu-segmentation-into-pdus.svg]]

[[osi-model|OSI 참조 모델]]은 분할을 네트워크 계층의 기능과 연결형 전송 계층의 기능으로 둔다. [[osi-model#연결형과 비연결형|비연결형]] 전송 계층은 분할과 재조립을 제공하지 않는다. 분할과 반대로 묶기가 필요할 수도 있다. **묶기**(blocking)는 $(N)$ SDU 여럿을 $(N)$ PDU 하나에 담는 기능이고, **묶음 풀기**(deblocking)는 $(N)$ PDU 하나에 담긴 $(N)$ SDU들을 가려내는 그 반대 기능이다. **연접**(concatenation)은 $(N)$ PDU 여럿을 $(N-1)$ SDU 하나에 담는 기능이고, **분리**(separation)는 $(N-1)$ SDU 하나에 담긴 $(N)$ PDU들을 가려내는 그 반대 기능이다. 분할과 연접은 비연결형 전송에서도 쓰일 수 있지만, 묶기와 묶음 풀기는 비연결형 전송에서 허용되지 않는다.[@itu-t-x-200-1994]

![[diagrams/blocking-and-concatenation.svg]]

## CAN의 전송 프로토콜

Classical [[can|CAN]] [[can-frame|데이터 프레임]]의 데이터 필드는 0에서 8바이트다.[@bosch-can-2-0-1991]

[[iso-15765-2|ISO 15765-2]]:2024는 CAN을 쓰는 차량 네트워크에서 진단 통신에 쓰는 전송 프로토콜과 네트워크 계층 서비스를 정한다. 이 프로토콜은 분할된 PDU를 첫 프레임 FF(FirstFrame)와 여러 연속 프레임 CF(ConsecutiveFrame)에 나눠 보낸다.[@iso-15765-2-obp-2024]

[[autosar|AUTOSAR]]의 CAN 전송 계층 모듈 CanTp가 다루는 전송 프로토콜 프레임은 단일 프레임 SF(Single Frame), FF, CF, 흐름 제어 프레임 FC(Flow Control)이고, 이 프레임들을 다음처럼 쓴다.[@autosar-cp-sws-cantransportlayer-2025]

- **SF**: 보낼 데이터 N-SDU(Network Service Data Unit)가 CAN 프레임 하나에 실리는 단위 N-PDU(Network Protocol Data Unit)에 들어가면 SF로 보낸다.
- **FF**: 분할된 메시지의 첫 부분과 메시지 전체 길이 FF_DL을 싣는다. $\mathrm{FF\_DL} \le 4095$이면 FF_DL을 첫 바이트 하위 4비트와 둘째 바이트에 싣고, $\mathrm{FF\_DL} > 4095$이면 그 자리를 0으로 두고 FF_DL을 셋째부터 여섯째 바이트에 싣는다. 두 형식 모두 CAN 2.0과 [[can-fd|CAN FD]]에 쓴다.
- **CF**: 나머지 페이로드를 SN(Sequence Number)과 함께 싣는다.
- **FC**: 수신 쪽이 송신 쪽 CF의 흐름을 조절한다. **BS**(Block Size)는 FC 하나 뒤에 이어지는 CF 수이고, **STmin**(Separation Time minimum)은 송신 쪽이 두 CF 사이에 기다릴 최소 시간이다.[@autosar-cp-sws-cantransportlayer-2025]

![[diagrams/cantp-segmented-transfer.svg]]

CanTp는 분할된 메시지를 받는 동안 SN이 맞는지 검사하고, 틀리면 수신을 중단한다. 빠진 연속 프레임과 뒤바뀐 연속 프레임은 오류로 알린다.[@autosar-cp-sws-cantransportlayer-2025]

CanTp는 연속 프레임을 받을 때마다 N_Cr 타이머를 시작한다(블록의 마지막 연속 프레임은 뺀다). 다음 연속 프레임이 오기 전에 N_Cr이 끝나면 수신을 중단한다. CanTp에서 흐름 제어는 송신 쪽을 수신 쪽의 처리 능력에 맞춘다.[@autosar-cp-sws-cantransportlayer-2025]

## IP 단편화

[[ipv4|IPv4]] 데이터그램이 최대 패킷 크기가 더 작은 네트워크를 지나야 하면 단편으로 나눈다. 단편마다 식별(Identification) 필드, 원래 데이터그램 안에서의 위치를 나타내는 단편 오프셋, 마지막 단편인지 나타내는 MF(More Fragments) 플래그가 있다. 받는 쪽 IP 모듈은 식별, 출발지, 목적지, 프로토콜 네 필드가 같은 단편을 모아, 단편 오프셋이 가리키는 자리에 데이터를 놓아 합친다.[@ietf-rfc-791-1981]

RFC 1122는 IPv4 호스트의 IP 계층이 재조립을 구현하고, 재조립할 수 있는 가장 큰 데이터그램 크기 $\mathrm{EMTU\_R}$을 $\mathrm{EMTU\_R} \ge 576$으로 두도록 정한다. 호스트에는 재조립 타임아웃이 있어야 하고, 그 값은 남은 Time to Live에서 정하지 않은 고정값으로 두도록 권고되며, 60\~120초 사이가 권장된다. 타임아웃이 지나면 재조립 중이던 데이터그램을 버리고, 오프셋이 0인 단편을 받았으면 출발 호스트에 [[icmp|ICMP]] Time Exceeded 메시지를 보낸다.[@ietf-rfc-1122-1989]
