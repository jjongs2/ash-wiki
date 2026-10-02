---
title: TCP
tags:
  - network
aliases:
  - Transmission Control Protocol
verified: 2026-09-29
---

**TCP**(Transmission Control Protocol)는 IP(Internet Protocol) 위에서 동작하는 연결형 전송 계층 프로토콜로, 두 프로세스 사이에 신뢰성 있고 순서를 지키는 양방향 바이트 스트림을 준다. RFC 9293이 정한다.[@ietf-rfc-9293-2022] IP 헤더의 Protocol 값 6이 TCP를 가리킨다.[@iana-protocol-numbers-2026]

TCP는 잃거나 깨진 데이터를 다시 보내고, 순서가 바뀐 데이터를 바로잡고, 중복을 걸러 내어 보낸 순서대로 전달한다. 받는 쪽이 감당할 수 있는 만큼만 보내도록 흐름을 제어하고, 네트워크 혼잡에 맞춰 보내는 양을 조절한다.[@ietf-rfc-9293-2022]

## 헤더

TCP 헤더는 옵션이 없으면 20바이트이고, Data Offset이 4비트 32비트 워드 단위이므로 옵션을 포함해 최대 60바이트다. 헤더 필드는 아래와 같다.[@ietf-rfc-9293-2022]

| 필드                  | 비트 | 뜻                                                                                                               |
| --------------------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
| Source Port           | 16   | 보내는 쪽 [[port-number\|포트 번호]]                                                                             |
| Destination Port      | 16   | 받는 쪽 포트 번호                                                                                                |
| Sequence Number       | 32   | 이 세그먼트의 첫 데이터 바이트의 순서 번호. SYN이 켜져 있으면 ISN(Initial Sequence Number)이고 첫 데이터는 ISN+1 |
| Acknowledgment Number | 32   | ACK가 켜져 있으면 보내는 쪽이 다음에 받기를 기대하는 순서 번호                                                   |
| Data Offset           | 4    | TCP 헤더 길이. 32비트 워드 단위                                                                                  |
| Reserved              | 4    | 예약                                                                                                             |
| Control bits          | 8    | 1비트 플래그 8개: CWR, ECE, URG, ACK, PSH, RST, SYN, FIN                                                         |
| Window                | 16   | 확인 응답 번호가 가리키는 바이트부터 받는 쪽이 더 받을 수 있는 바이트 수                                         |
| Checksum              | 16   | 의사 헤더, TCP 헤더, 데이터를 덮는 [[checksum\|체크섬]]                                                          |
| Urgent Pointer        | 16   | 순서 번호로부터의 오프셋으로 긴급 데이터 바로 다음 바이트를 가리킨다. URG가 켜진 세그먼트에서만 해석             |
| Options               | 가변 | 선택 필드. 예: MSS(Maximum Segment Size) 옵션                                                                    |

![[diagrams/tcp-header-layout.svg]]

제어 비트 가운데 SYN은 순서 번호를 맞추는 세그먼트임을, ACK는 Acknowledgment Number 필드가 유효함을, FIN은 보내는 쪽의 데이터가 더 없음을 나타낸다. RST는 연결을 재설정한다.[@ietf-rfc-9293-2022]

## 연결 설정과 종료

TCP는 3-way handshake로 연결을 맺는다. 연결을 여는 쪽이 SYN을 보내고, 상대가 SYN과 ACK를 함께 보내고, 여는 쪽이 ACK로 답한다. 이 과정에서 양쪽은 각자의 초기 순서 번호를 알리고 확인받는다.[@ietf-rfc-9293-2022] RFC 7413에 따르면 TCP는 3-way handshake가 끝난 뒤에야 데이터를 주고받게 하므로, 연결 설정이 네트워크 지연에 왕복 시간 하나를 더한다. TCP Fast Open은 SYN에 데이터를 실어 이 왕복 시간을 줄이는 실험적 확장이다.[@ietf-rfc-7413-2014]

연결을 정상적으로 끝낼 때는 양쪽이 각자 FIN을 보내고 상대가 이를 ACK로 확인한다. 한쪽이 FIN을 보낸 뒤에도 상대는 남은 데이터를 계속 보낼 수 있다.[@ietf-rfc-9293-2022]

![[diagrams/tcp-connection-setup-teardown.svg]]

## 순서 번호와 확인 응답

TCP는 보내는 데이터의 바이트마다 순서 번호를 매긴다. 받는 쪽은 다음에 받기를 기대하는 순서 번호를 확인 응답으로 돌려보낸다. 확인 응답은 누적 방식이라, 번호 $X$는 $X$ 앞의 바이트를 모두 받았다는 뜻이다.[@ietf-rfc-9293-2022] 그래서 확인 응답 하나를 잃어도 뒤의 확인 응답이 그 몫까지 확인하며, 이렇게 두 세그먼트보다 많은 새 데이터를 한꺼번에 확인하는 확인 응답을 **stretch ACK**라 한다.[@ietf-rfc-3449-2002]

재전송 타이머가 만료되면 보내는 쪽은 아직 확인 응답을 받지 못한 가장 이른 세그먼트를 다시 보낸다.[@ietf-rfc-6298-2011]

중복 확인 응답으로 손실을 찾아 재전송하는 fast retransmit은 TCP 혼잡 제어 알고리즘의 하나로, [[tcp-congestion-control#Fast retransmit와 fast recovery|TCP 혼잡 제어]]에서 다룬다.[@ietf-rfc-5681-2009]

받는 쪽은 확인 응답을 곧바로 보내지 않고 미룰 수 있다. 이때 미루는 시간 $t_\mathrm{d}$는 $t_\mathrm{d} < 0.5\,\mathrm{s}$여야 하고, 적어도 최대 크기 세그먼트 두 개마다 확인 응답을 보내도록 권고된다.[@ietf-rfc-9293-2022]

## 흐름 제어

받는 쪽은 Window 필드로 확인 응답 번호부터 몇 바이트를 더 받을 수 있는지 알린다. 보내는 쪽은 보낼 데이터를 현재 윈도에 맞는 세그먼트로 묶어 보낸다. 윈도는 받는 쪽 연결의 남은 버퍼 공간과 관련된다고 가정한다. 윈도가 0이 되면 보내는 쪽은 주기적으로 데이터를 보내 윈도가 다시 열렸는지 탐색한다.[@ietf-rfc-9293-2022]

RFC 3366은 TCP를 전송 계층의 슬라이딩 윈도 프로토콜로 본다([[automatic-repeat-request#슬라이딩 윈도|ARQ]] 참고).[@ietf-rfc-3366-2002]

## 바이트 스트림

TCP는 주고받은 세그먼트의 경계와 응용이 읽고 쓰는 버퍼의 경계가 서로 대응한다고 보장하지 않는다. 그래서 응용이 여러 번에 나눠 쓴 데이터를 받는 쪽이 한 번에 읽을 수도 있고, 한 번에 쓴 데이터를 여러 번에 나눠 읽을 수도 있다.[@ietf-rfc-9293-2022]

메시지 경계가 필요한 응용은 스스로 레코드 표시를 넣어 메시지를 가른다.[@ietf-rfc-9260-2022] RFC 3117은 메시지를 가르는 흔한 방법 세 가지로, SMTP(Simple Mail Transfer Protocol)처럼 메시지 끝에 표시를 두는 octet-stuffing, HTTP(Hypertext Transfer Protocol)처럼 헤더에 길이를 적는 octet-counting, FTP(File Transfer Protocol)처럼 메시지마다 새 TCP 연결을 여는 connection-blasting을 든다.[@ietf-rfc-3117-2001]

## UDP와의 차이

[[udp|UDP]]는 연결을 맺지 않는 데이터그램 전송 서비스이고, 재전송과 흐름 제어가 필요하면 응용이 직접 맡아야 한다.[@ietf-rfc-1122-1989] UDP 헤더는 8바이트이고[@ietf-rfc-768-1980], TCP 헤더는 최소 20바이트다.[@ietf-rfc-9293-2022]

[[autosar|AUTOSAR]]의 [[doip|DoIP]] 모듈은 진단 메시지를 TCP 연결로 받는다.[@autosar-cp-sws-diagnosticoverip-2025] [[some-ip|SOME/IP]] 명세는 UDP 바인딩의 신뢰성을 "maybe", TCP 바인딩의 신뢰성을 "exactly once"로 정하고, 1400바이트가 넘는 큰 데이터를 보내야 하고 오류 시 지연 요구가 엄하지 않을 때만 TCP를 쓰도록 권한다.[@autosar-fo-prs-someipprotocol-2025]
