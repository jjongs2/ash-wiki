---
title: TLS
tags:
  - security
verified: 2026-10-03
---

**TLS**(Transport Layer Security)는 클라이언트와 서버가 인터넷에서 도청, 변조, 메시지 위조를 막도록 설계된 방식으로 통신하게 하는 프로토콜이다. 핸드셰이크로 키 재료를 설정한 뒤 그 키로 오가는 데이터의 기밀성과 무결성을 지킨다. TLS가 아래 전송에 요구하는 것은 신뢰성 있고 순서를 지키는 데이터 스트림뿐이다.[@ietf-rfc-9846-2026] TLS는 그런 전송 채널, 대개 [[tcp|TCP]] 위에서 동작한다.[@ietf-rfc-9147-2022] RFC 9846은 TLS 1.3을 정하고, TLS 1.2를 비롯한 이전 판을 대체한다.[@ietf-rfc-9846-2026]

## 판의 이력

Netscape는 SSL(Secure Sockets Layer) 3.0을 만들었다.[@ietf-rfc-6101-2011] TLS 1.0은 Netscape가 펴낸 SSL 3.0 명세를 바탕으로 했다.[@ietf-rfc-2246-1999] TLS의 판과 그 판을 정한 RFC는 아래와 같다.

| 판      | RFC                | 발행 연도                                            |
| ------- | ------------------ | ---------------------------------------------------- |
| TLS 1.0 | RFC 2246           | 1999[@ietf-rfc-2246-1999]                            |
| TLS 1.1 | RFC 4346           | 2006[@ietf-rfc-4346-2006]                            |
| TLS 1.2 | RFC 5246           | 2008[@ietf-rfc-5246-2008]                            |
| TLS 1.3 | RFC 8446, RFC 9846 | 2018, 2026[@ietf-rfc-9846-2026][@ietf-rfc-8446-2018] |

TLS 1.3은 2018년에 RFC 8446이 처음 정했고, 2026년에 RFC 9846이 판 번호를 그대로 둔 채 RFC 8446을 대체했다. RFC 8446은 TLS 1.2를 정한 RFC 5246을 대체했고, RFC 9846도 RFC 5246을 대체한다.[@ietf-rfc-9846-2026][@ietf-rfc-8446-2018]

RFC 8996은 TLS 1.0과 1.1을 퇴역시키고, 두 판을 협상하지 말라고 정한다.[@ietf-rfc-9846-2026][@ietf-rfc-8996-2021]

## 구성 요소

RFC 9846은 TLS를 두 주요 구성 요소로 나눈다.[@ietf-rfc-9846-2026]

- 핸드셰이크 프로토콜: 통신하는 두 쪽을 인증하고, 암호 알고리즘과 매개변수를 협상하며, 공유 키 재료를 설정한다.
- 레코드 프로토콜: 핸드셰이크가 설정한 매개변수로 트래픽을 레코드 단위로 나눠 저마다 보호한다.[@ietf-rfc-9846-2026]

경고(alert) 프로토콜은 연결을 닫는다는 알림과 오류를 알리는 메시지를 나른다.[@ietf-rfc-9846-2026]

## TLS 1.3 핸드셰이크

TLS 1.3의 전체 핸드셰이크에서 공유 키는 ClientHello와 ServerHello 한 번의 왕복으로 정해지고, 그 뒤의 메시지는 모두 암호화된다.[@ietf-rfc-9846-2026]

1. 클라이언트는 ClientHello에 지원하는 판, cipher suite 목록, 그리고 key_share 확장에 담은 비대칭 키 교환 값이나 pre_shared_key 확장에 담은 PSK(Pre-Shared Key) 라벨, 또는 둘 다를 넣어 보낸다.
2. 서버는 ServerHello로 협상한 연결 매개변수를 알리고, 비대칭 키 교환을 쓰면 자기의 임시 키 교환 값을 key_share 확장에 담아 보낸다.
3. 서버는 이어서 EncryptedExtensions, 클라이언트 인증을 원하면 CertificateRequest, 인증서로 인증하면 Certificate와 CertificateVerify, 그리고 Finished를 보낸다. CertificateVerify는 Certificate의 공개키에 대응하는 개인키로 핸드셰이크 전체에 단 서명으로, 보낸 쪽이 그 개인키를 가졌음을 보인다.
4. 클라이언트는 서버의 CertificateVerify 서명과 Finished를 확인하고, 요청받았으면 자기 Certificate와 CertificateVerify를 보낸 뒤 Finished를 보낸다.[@ietf-rfc-9846-2026]

![[diagrams/tls-1-3-handshake.svg]]

TLS 1.3의 기본 키 교환 방식은 비대칭 키 교환, PSK, PSK와 비대칭 키 교환을 함께 쓰는 방식 셋이다. RFC 9846의 비대칭 키 교환은 유한체나 타원 곡선 위의 [[diffie-hellman-key-exchange|Diffie-Hellman]]이고, KEM(Key Encapsulation Mechanism)은 다른 확장이 정한다. 키는 HKDF(HMAC-based Extract-and-Expand Key Derivation Function)의 Extract와 Expand로 유도한다. TLS 1.3은 정적 RSA(Rivest-Shamir-Adleman)와 정적 Diffie-Hellman cipher suite를 없애, 공개키 기반의 키 교환은 모두 [[key-establishment|forward secrecy]]를 준다.[@ietf-rfc-9846-2026]

## 인증

TLS 1.3은 서버를 늘 인증하고, 클라이언트는 서버가 CertificateRequest를 보냈을 때만 인증서로 인증한다. 인증은 RSA, ECDSA(Elliptic Curve Digital Signature Algorithm), EdDSA(Edwards-curve Digital Signature Algorithm) 같은 비대칭 서명이나 대칭 PSK로 한다.[@ietf-rfc-9846-2026]

## Cipher suite

TLS 1.3의 cipher suite는 레코드 보호에 쓰는 [[block-cipher-mode-of-operation|AEAD]](Authenticated Encryption with Associated Data) 알고리즘과, HKDF와 Transcript-Hash에 쓰는 해시 알고리즘의 짝을 정한다. 예: TLS_AES_128_GCM_SHA256. 키 교환 그룹과 서명 알고리즘은 cipher suite와 따로 supported_groups, key_share, signature_algorithms 확장으로 협상한다.[@ietf-rfc-9846-2026]

RFC 5246은 cipher suite 하나가 키 교환 알고리즘, 대량 암호 알고리즘(비밀 키 길이 포함), MAC 알고리즘, PRF(Pseudorandom Function)를 정하게 했다. RFC 9846은 인증·키 교환 방식을 레코드 보호 알고리즘과 떼어 cipher suite의 뜻을 바꿨다.[@ietf-rfc-9846-2026][@ietf-rfc-5246-2008]

## TLS 1.2의 키 교환

RFC 5246은 클라이언트가 premaster secret을 서버 인증서의 RSA 공개키로 암호화해 보내는 RSA 키 교환과, DHE_DSS·DHE_RSA(임시 Diffie-Hellman), DH_DSS·DH_RSA(인증서에 든 고정 Diffie-Hellman), DH_anon(익명 Diffie-Hellman)을 정했다. RFC 9846은 정적 RSA와 정적 Diffie-Hellman cipher suite를 없앴다.[@ietf-rfc-9846-2026][@ietf-rfc-5246-2008]

RFC 5246은 양쪽이 보안 매개변수를 합의한 뒤 Finished 앞에 ChangeCipherSpec 메시지를 보내, 이후 레코드를 새로 협상한 방식과 키로 보호함을 알리게 했다. RFC 9846은 ChangeCipherSpec을 미들박스와의 호환을 위해서만 남겼다.[@ietf-rfc-9846-2026][@ietf-rfc-5246-2008]

## DTLS

**DTLS**(Datagram Transport Layer Security)는 [[udp|UDP]] 같은 데이터그램 전송 위에서 쓰도록 TLS를 본뜬 프로토콜이다. RFC 9147은 DTLS 1.3을 정하고 DTLS 1.2(RFC 6347)를 대체한다. DTLS 1.3은 TLS 1.3을 바탕으로 하며, 순서 보호와 재전송 방지를 빼면 TLS 1.3과 같은 보안 보장을 준다. 데이터그램은 잃거나 순서가 바뀔 수 있으므로, DTLS는 레코드에 순서 번호를 명시하고 핸드셰이크 메시지의 재전송과 조각 재조립을 스스로 맡는다. 응용 데이터의 손실과 순서 바뀜은 바로잡지 않는다.[@ietf-rfc-9147-2022]
