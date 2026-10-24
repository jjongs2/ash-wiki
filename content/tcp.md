---
title: TCP
tags:
  - network/tcp-ip
aliases:
  - Transmission Control Protocol
verified: 2026-09-29
---

**TCP**(Transmission Control Protocol)는 IP 위에서 동작하는 [[osi-model#연결형과 비연결형|연결형]] 전송 계층 프로토콜로, 두 프로세스 사이에 신뢰성 있고 순서를 지키는 양방향 바이트 스트림을 준다. RFC 9293이 정한다.[@ietf-rfc-9293-2022] IP 헤더의 Protocol 값 6이 TCP를 가리킨다.[@iana-protocol-numbers-2026]

TCP는 잃거나 깨진 데이터를 다시 보내고, 순서가 바뀐 데이터를 바로잡고, 중복을 걸러 내어 보낸 순서대로 전달한다. 받는 쪽이 감당할 수 있는 만큼만 보내도록 흐름을 제어하고, 네트워크 혼잡에 맞춰 보내는 양을 조절한다.[@ietf-rfc-9293-2022]

RFC 793은 1981년에 TCP를 문서로 정했다. RFC 9293은 2022년에, 그 뒤 여러 문서에 흩어져 기록된 고침을 RFC 793의 프로토콜 명세와 한데 모아, RFC 793과 그 일부를 고친 문서들을 대체했다. 이때 RFC 793의 헤더 제어 비트도 RFC 3168에 따라 고쳐 실었다.[@ietf-rfc-9293-2022]

## 헤더

TCP 헤더는 옵션이 없으면 20바이트이고, Data Offset이 4비트 32비트 워드 단위이므로 옵션을 포함해 최대 60바이트다.[@ietf-rfc-9293-2022] 헤더 필드는 아래와 같다. Reserved 행과 그다음 플래그 행은 RFC 9768과 IANA TCP Header Flags(IANA: 인터넷 식별자 레지스트리를 관리하는 기관) 레지스트리를, 나머지 행은 RFC 9293을 따른다.[@iana-about-2026]

| 필드                  | 비트 | 뜻                                                                                                                                    |
| --------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Source Port           | 16   | 보내는 쪽 [[port-number\|포트 번호]][@ietf-rfc-9293-2022]                                                                             |
| Destination Port      | 16   | 받는 쪽 포트 번호[@ietf-rfc-9293-2022]                                                                                                |
| Sequence Number       | 32   | 이 세그먼트의 첫 데이터 바이트의 순서 번호. SYN이 켜져 있으면 ISN(Initial Sequence Number)이고 첫 데이터는 ISN+1[@ietf-rfc-9293-2022] |
| Acknowledgment Number | 32   | ACK가 켜져 있으면 보내는 쪽이 다음에 받기를 기대하는 순서 번호[@ietf-rfc-9293-2022]                                                   |
| Data Offset           | 4    | TCP 헤더 길이. 32비트 워드 단위[@ietf-rfc-9293-2022]                                                                                  |
| Reserved              | 3    | 예약[@ietf-rfc-9768-2026][@iana-tcp-parameters-2026]                                                                                  |
| AE                    | 1    | AE(Accurate ECN) 플래그[@ietf-rfc-9768-2026][@iana-tcp-parameters-2026]                                                               |
| Control bits          | 8    | 1비트 플래그 8개: CWR, ECE, URG, ACK, PSH, RST, SYN, FIN[@ietf-rfc-9293-2022]                                                         |
| Window                | 16   | 확인 응답 번호가 가리키는 바이트부터 받는 쪽이 더 받을 수 있는 바이트 수[@ietf-rfc-9293-2022]                                         |
| Checksum              | 16   | 의사 헤더, TCP 헤더, 데이터를 덮는 [[checksum\|체크섬]][@ietf-rfc-9293-2022]                                                          |
| Urgent Pointer        | 16   | 순서 번호로부터의 오프셋으로 긴급 데이터 바로 다음 바이트를 가리킨다. URG가 켜진 세그먼트에서만 해석[@ietf-rfc-9293-2022]             |
| Options               | 가변 | 선택 필드. 예: MSS(Maximum Segment Size) 옵션[@ietf-rfc-9293-2022]                                                                    |

![[diagrams/tcp-header-layout.svg]]

제어 비트 가운데 SYN은 순서 번호를 맞추는 세그먼트임을, ACK는 Acknowledgment Number 필드가 유효함을, FIN은 보내는 쪽의 데이터가 더 없음을 나타낸다. RST는 연결을 재설정한다.[@ietf-rfc-9293-2022]

TCP 끝점은 MSS 옵션을 보내는 것과 받는 것을 모두 구현해야 한다. 연결 설정에서 MSS 옵션을 받지 못하면, 보내는 쪽 MSS를 [[ipv4|IPv4]]에서는 536바이트($576 - 40$), [[ipv6|IPv6]]에서는 1220바이트($1280 - 60$)로 가정해야 한다.[@ietf-rfc-9293-2022]

## 연결 설정과 종료

TCP는 3-way handshake로 연결을 맺는다. 연결을 여는 쪽이 SYN을 보내고, 상대가 SYN과 ACK를 함께 보내고, 여는 쪽이 ACK로 답한다. 이 과정에서 양쪽은 각자의 초기 순서 번호를 알리고 확인받는다.[@ietf-rfc-9293-2022] RFC 7413에 따르면 TCP는 3-way handshake가 끝난 뒤에야 데이터를 주고받게 하므로, 연결 설정이 네트워크 지연에 왕복 시간 하나를 더한다. TCP Fast Open은 SYN에 데이터를 실어 이 왕복 시간을 줄이는 실험적 확장이다.[@ietf-rfc-7413-2014]

연결을 정상적으로 끝낼 때는 양쪽이 각자 FIN을 보내고 상대가 이를 ACK로 확인한다. 한쪽이 FIN을 보낸 뒤에도 상대는 남은 데이터를 계속 보낼 수 있다.[@ietf-rfc-9293-2022]

![[diagrams/tcp-connection-setup-teardown.svg]]

연결은 수명 동안 LISTEN, SYN-SENT, SYN-RECEIVED, ESTABLISHED, FIN-WAIT-1, FIN-WAIT-2, CLOSE-WAIT, CLOSING, LAST-ACK, TIME-WAIT 상태를 거친다. 여기에 연결 상태 변수를 담는 레코드인 TCB(Transmission Control Block)가 없어 연결도 없는 상태를 나타내는 가상의 상태 CLOSED가 더해진다. TIME-WAIT는 상대가 자기 연결 종료 요청의 확인 응답을 받았다고 확신할 만큼, 그리고 이전 연결의 늦은 세그먼트가 새 연결에 영향을 주지 않을 만큼 시간이 지나기를 기다리는 상태다. 연결을 능동적으로 닫은 쪽은 TIME-WAIT 상태에 MSL(Maximum Segment Lifetime)의 두 배인 $2 \times \mathrm{MSL}$ 동안 머물러야 한다.[@ietf-rfc-9293-2022]

## 순서 번호와 확인 응답

TCP는 보내는 데이터의 바이트마다 순서 번호를 매긴다. 받는 쪽은 다음에 받기를 기대하는 순서 번호를 확인 응답으로 돌려보낸다. 확인 응답은 누적 방식이라, 번호 $X$는 $X$ 앞의 바이트를 모두 받았다는 뜻이다.[@ietf-rfc-9293-2022] 그래서 확인 응답 하나를 잃어도 뒤의 확인 응답이 그 몫까지 확인하며, 이렇게 두 세그먼트보다 많은 새 데이터를 한꺼번에 확인하는 확인 응답을 **stretch ACK**라 한다.[@ietf-rfc-3449-2002]

중복 확인 응답으로 손실을 찾아 재전송하는 fast retransmit은 TCP 혼잡 제어 알고리즘의 하나로, [[tcp-congestion-control#Fast retransmit와 fast recovery|TCP 혼잡 제어]]에서 다룬다.[@ietf-rfc-5681-2009]

받는 쪽은 확인 응답을 곧바로 보내지 않고 미룰 수 있다. 이때 미루는 시간 $t_\mathrm{d}$는 $t_\mathrm{d} < 0.5\,\mathrm{s}$여야 하고, 적어도 최대 크기 세그먼트 두 개마다 확인 응답을 보내도록 권고된다.[@ietf-rfc-9293-2022]

## 흐름 제어

받는 쪽은 Window 필드로 확인 응답 번호부터 몇 바이트를 더 받을 수 있는지 알린다. 보내는 쪽은 보낼 데이터를 현재 윈도에 맞는 세그먼트로 묶어 보낸다. 윈도는 받는 쪽 연결의 남은 버퍼 공간과 관련된다고 가정한다. 윈도가 0이 되면 보내는 쪽은 주기적으로 데이터를 보내 윈도가 다시 열렸는지 탐색한다.[@ietf-rfc-9293-2022]

RFC 3366은 TCP를 전송 계층의 슬라이딩 윈도 프로토콜로 본다([[automatic-repeat-request#슬라이딩 윈도|ARQ]] 참고).[@ietf-rfc-3366-2002]

## 재전송 타임아웃

TCP는 RTO(retransmission timeout)를 Karn 알고리즘을 포함한 RFC 6298의 알고리즘으로 계산한다.[@ietf-rfc-9293-2022]

이 알고리즘은 RTO 계산에 송신 측의 상태 변수 SRTT(smoothed round-trip time)와 RTTVAR(round-trip time variation)를 두고, 클록 단위를 $G$초로 둔다. 송신 측은 RTT(round-trip time)를 처음 재기 전에는 RTO를 1초로 두도록 권고되고, 첫 측정값 $R$을 얻으면 $\mathrm{SRTT} = R$, $\mathrm{RTTVAR} = R/2$로 두고 $\mathrm{RTO} = \mathrm{SRTT} + \max(G,\ 4\,\mathrm{RTTVAR})$로 두어야 한다. RTO를 계산할 때마다 1초보다 작으면 1초로 올리도록 권고된다.[@ietf-rfc-6298-2011]

재전송 타이머가 만료되면 보내는 쪽은 아직 확인 응답을 받지 못한 가장 이른 세그먼트를 다시 보낸다. 이때 RTO를 두 배로 늘려야 한다. 재전송한 세그먼트로는 RTT를 재지 않아야 한다(Karn 알고리즘). 확인 응답이 어느 전송에 대한 것인지 가릴 수 있는 TCP Timestamps 옵션을 쓸 때만 예외다.[@ietf-rfc-6298-2011]

## 혼잡 알림 피드백

RFC 9768은 RFC 3168의 ECN(Explicit Congestion Notification) 피드백 방식을 고친 AccECN(More Accurate ECN)을 정하고, 예전에 NS(Nonce Sum)라 부르던 비트 7의 이름을 AE로 바꿔 AccECN에 쓴다. 두 끝은 핸드셰이크에서 AE, CWR, ECE 세 플래그로 AccECN 지원을 협상하고, 그 뒤에는 이 세 비트를 CE(Congestion Experienced) 표시를 받은 패킷 수를 되돌려 주는 3비트 카운터 하나로 쓴다.[@ietf-rfc-9768-2026]

## 바이트 스트림

TCP는 주고받은 세그먼트의 경계와 응용이 읽고 쓰는 버퍼의 경계가 서로 대응한다고 보장하지 않는다. 그래서 응용이 여러 번에 나눠 쓴 데이터를 받는 쪽이 한 번에 읽을 수도 있고, 한 번에 쓴 데이터를 여러 번에 나눠 읽을 수도 있다.[@ietf-rfc-9293-2022]

메시지 경계가 필요한 응용은 스스로 레코드 표시를 넣어 메시지를 가른다.[@ietf-rfc-9260-2022] RFC 3117은 메시지를 가르는 흔한 방법 세 가지로, SMTP(Simple Mail Transfer Protocol)처럼 메시지 끝에 표시를 두는 octet-stuffing, HTTP처럼 헤더에 길이를 적는 octet-counting, FTP(File Transfer Protocol)처럼 메시지마다 새 TCP 연결을 여는 connection-blasting을 든다.[@ietf-rfc-3117-2001]

## UDP와의 차이

[[udp|UDP]]는 연결을 맺지 않는 데이터그램 전송 서비스이고, 재전송과 흐름 제어가 필요하면 응용이 직접 맡아야 한다.[@ietf-rfc-1122-1989] UDP [[udp#헤더|헤더]]는 8바이트이고[@ietf-rfc-768-1980], TCP 헤더는 최소 20바이트다.[@ietf-rfc-9293-2022]

[[autosar|AUTOSAR]]의 [[doip|DoIP]] 모듈은 진단 메시지를 TCP 연결로 받는다.[@autosar-cp-sws-diagnosticoverip-2025] [[some-ip|SOME/IP]] 명세는 UDP 바인딩의 신뢰성을 "maybe", TCP 바인딩의 신뢰성을 "exactly once"로 정하고, 1400바이트가 넘는 큰 데이터를 보내야 하고 오류 시 지연 요구가 엄하지 않을 때만 TCP를 쓰도록 권한다.[@autosar-fo-prs-someipprotocol-2025]
