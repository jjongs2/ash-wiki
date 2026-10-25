---
title: DHCP
tags:
  - network/tcp-ip
aliases:
  - Dynamic Host Configuration Protocol
verified: 2026-10-22
---

**DHCP**(Dynamic Host Configuration Protocol)는 [[internet-protocol-suite|TCP/IP]] 네트워크의 호스트에 설정 정보를 넘기는 틀이다. RFC 2131이 정하며, BOOTP(Bootstrap Protocol)를 바탕으로 다시 쓸 수 있는 네트워크 주소의 자동 할당과 설정 옵션을 더했다.[@ietf-rfc-2131-1997]

## 주소 할당 방식

DHCP는 IP 주소 할당 방식 셋을 지원한다. 네트워크는 관리자의 정책에 따라 이 가운데 하나 이상을 쓴다.[@ietf-rfc-2131-1997]

- **자동 할당**(automatic allocation): DHCP가 클라이언트에 영구 IP 주소를 준다.
- **동적 할당**(dynamic allocation): DHCP가 클라이언트에 정해진 기한 동안 IP 주소를 준다. 기한이 끝나기 전이라도 클라이언트가 주소를 스스로 내놓으면 할당은 거기서 끝난다.
- **수동 할당**(manual allocation): 네트워크 관리자가 정한 클라이언트의 IP 주소를 DHCP가 클라이언트에 전달하기만 한다.[@ietf-rfc-2131-1997]

## 주소를 얻는 교환

클라이언트가 새 네트워크 주소를 얻는 교환은 아래와 같다.[@ietf-rfc-2131-1997]

1. 클라이언트가 자기 로컬 물리 서브넷에 DHCPDISCOVER를 브로드캐스트한다.
2. 각 서버는 쓸 수 있는 네트워크 주소를 담은 DHCPOFFER로 응답할 수 있다.
3. 클라이언트는 받은 DHCPOFFER 가운데 서버 하나를 골라 DHCPREQUEST를 브로드캐스트한다. 이 메시지에는 고른 서버를 가리키는 server identifier 옵션을 담아야 한다(MUST).
4. 고른 서버는 클라이언트의 바인딩을 저장하고, 설정 파라미터를 담은 DHCPACK로 응답한다.[@ietf-rfc-2131-1997]

![[diagrams/dhcp-address-acquisition.svg]]

## 전송

DHCP는 전송 프로토콜로 [[udp|UDP]]를 쓴다. 클라이언트가 서버로 보내는 메시지는 DHCP server [[port-number|포트]] 67로, 서버가 클라이언트로 보내는 메시지는 DHCP client 포트 68로 간다.[@ietf-rfc-2131-1997]

## DHCPv6

[[ipv6|IPv6]]용 DHCP인 DHCPv6는 RFC 9915가 정한다. DHCPv6는 노드에 네트워크 설정 파라미터, IP 주소, 접두사를 설정하는 확장 가능한 메커니즘이고, [[ipv6#주소 자동 설정|상태 없는 주소 자동 설정]] 대신 또는 그와 함께 동작할 수 있다.[@ietf-rfc-9915-2026]

DHCPv6에서는 클라이언트가 UDP 포트 546에서, 서버가 UDP 포트 547에서 메시지를 받는다.[@ietf-rfc-9915-2026]
