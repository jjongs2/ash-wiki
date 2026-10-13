---
title: IEEE 802.1AE
tags:
  - network/ethernet
aliases:
  - MACsec
verified: 2026-10-06
publisher: IEEE
edition: 2018
status: 개정 중
---

**IEEE 802.1AE**는 IEEE 802 LAN의 MAC(Medium Access Control) 서비스를 쓰는 상위 프로토콜 실체에 드러나지 않게, 네트워크의 전부나 일부를 보호하는 방법을 정하는 IEEE 표준이다. 정식 제목은 "IEEE Standard for Local and metropolitan area networks—Media Access Control (MAC) Security"이다. 이 표준이 정하는 보안을 **MACsec**(MAC Security)이라 한다.[@ieee-802-1ae-2018]

## 범위

이 표준은 MAC 클라이언트에 드러나지 않게 동작하고 매체 접근 방식에 매이지 않는 프로토콜과 실체로, 비연결형 사용자 데이터의 기밀성, 프레임 데이터의 무결성, 데이터 출처의 진정성을 제공하는 것을 정한다. 이 표준은 MACsec을 네트워크 기반 구조의 신뢰하는 구성 요소 사이의 통신을 보호하는 수단으로 두며, 그 구성 요소 자체를 이용한 공격은 막지 못하므로 응용 사이의 종단 간 보안 프로토콜을 대신하지 않고 보완한다고 둔다.[@ieee-802-1ae-2018]

이 표준이 쓰는 보안 관계와 식별자는 아래와 같다.[@ieee-802-1ae-2018]

- **SecY**(MAC Security Entity): 한 시스템 안에서 MACsec 프로토콜을 운용하는 실체.
- **CA**(secure Connectivity Association): 키 합의 프로토콜이 세우고 유지하는 보안 관계. 한 LAN에 붙은 스테이션들의 서비스 접근점 가운데 MACsec으로 보호할, 서로 모두 이어진 부분 집합이다.
- **SA**(Secure Association): CA의 한 구성원이 나머지 구성원에게 보내는 프레임을 보호하는 보안 관계로, 비밀 키 하나(한 프레임을 보호하는 데 키가 여럿 필요하면 키 한 벌)가 받친다. 이 키가 **SAK**(Secure Association Key)다.
- **SC**(Secure Channel): CA의 한 구성원이 나머지 구성원에게 보내는 프레임을 보호하는 보안 관계. SA가 차례로 이어 받치므로 관계를 끝내지 않고 키를 새로 바꿀 수 있다. SC는 MAC 주소와 포트 식별자로 된 SCI(Secure Channel Identifier)로 가린다.
- **AN**(Association Number): 보호한 프레임 머리의 SecTAG(MAC Security TAG)에 실리는 2비트 정수로, SC 안의 SA를 넷까지 가린다.
- **PN**(Packet Number): SecTAG에 하위 32비트가 실리는 번호로, 같은 SA로 보내는 MPDU(MACsec Protocol Data Unit)마다 암호 계산에 넣는 IV(Initialization Vector)를 다르게 하고 재전송 공격을 막는 데 쓴다.
- **ICV**(Integrity Check Value): 보호한 프레임에 붙는 무결성 검사 값. 길이는 cipher suite에 따라 8옥텟에서 16옥텟이다.[@ieee-802-1ae-2018]

![[diagrams/macsec-ca-sc-sa.svg]]

이 표준은 SecTAG가 MACsec EtherType `0x88E5`로 시작하도록 정한다.[@ieee-802-1ae-2018] IEEE 등록기관의 EtherType 공개 목록도 `0x88E5`를 IEEE 802.1AE의 MACsec 태그에, `0x888E`를 IEEE 802.1X가 정하는 EAPOL(EAP over LAN)용 PAE(Port Access Entity)에 배정한다.[@ieee-ra-ethertype-2024]

IEEE 802.1AE-2018은 [[symmetric-key-cryptography#AES|AES]]-128 블록 암호를 [[block-cipher-mode-of-operation#인증 암호 모드|GCM]]으로 운용하는 GCM-AES-128을 기본 cipher suite로 정한다. 키는 128비트 SAK이고, 96비트 IV의 상위 64비트는 SCI, 하위 32비트는 PN이고, ICV는 128비트다.[@ieee-802-1ae-2018]

![[diagrams/macsec-gcm-aes-128-iv.svg]]

IEEE 802.1X-2020은 포트 기반 네트워크 접근 제어를 정하는 표준으로, 서로 통신할 시스템이 EAP(Extensible Authentication Protocol)와 그 LAN 캡슐화인 EAPOL로 상호 인증하게 하고, MACsec으로 통신을 보호하는 데 쓰는 MKA(MACsec Key Agreement) 프로토콜을 정한다.[@ieee-802-1x-project-2026][@ieee-802-1x-2020] MKA는 서로 인증된 MACsec 피어를 찾고 그 가운데 하나를 Key Server로 뽑으며, Key Server가 MACsec이 프레임 보호에 쓰는 대칭 SAK를 나눠 준다.[@ieee-802-1ae-project-2026] [[ieee-802-1q|IEEE 802.1Q]]-2022의 Annex R(참고)은 CA 구성원이 공유하는 비밀 키인 CAK(Connectivity Association Key)를 가져야 CA에 참여할 수 있고, MKA가 이 키로 CA 구성원을 서로 확인하고 SAK를 나눈다는 설명을 제시한다.[@ieee-802-1q-2022]

Annex R은 [[frame-preemption|프레임 선점]]과 MACsec을 함께 쓸 때의 물음에 답을 제시한다. 이 Annex는 선점으로 프레임이 조각나도 ICV가 프레임 전체를 보호하므로 조각을 빼거나 바꿔치기할 수 없고, 그 값은 프레임 전체를 보호한 뒤 보낼 때와 같다는 답을 제시한다. 또 MKA Key Server가 새 SAK로 바꾸라고 알린 뒤 3초 동안은 이전 수신 SA와 새 수신 SA를 함께 받을 수 있으므로, 새 SAK로 보호한 express 프레임을 받은 뒤에도 이전 SAK로 보호한 선점 프레임을 마지막 조각까지 받아 검증할 수 있다는 답도 제시한다.[@ieee-802-1q-2022]

TI의 DP83TC817S-Q1은 IEEE 802.1AE MACsec 하드웨어 엔진을 내장한 [[100base-t1|100BASE-T1]] 차량용 이더넷 [[ethernet-phy|PHY]]로, 송신과 수신 경로 모두에서 선로 속도로 암호화와 인증을 한다. cipher suite는 GCM-AES-128/256과, 확장 패킷 번호(XPN, Extended Packet Numbering)를 쓰는 GCM-AES-XPN-128/256을 지원하고, SAK를 16개까지 두어 송수신 SC 8개를 지원한다.[@ti-dp83tc817s-q1-2024]

OPEN Alliance의 TC17은 IEEE 802.1AE의 MACsec과 IEEE 802.1X의 MKA를 차량용으로 정리한 프로파일을 정하는 것을 목표로 둔다. 10BASE-T1S에서의 MACsec 배치 전략, 벤더 사이에서 보안을 해치지 않는 키 분배 방식, [[ptp|PTP]]와 [[tsn|TSN]], [[virtual-lan|VLAN]], 진단 같은 네트워크 쓰임과의 상호작용도 목표에 든다.[@open-alliance-tc17-2026]

## 개정 이력

- 2006년: 첫판이 나왔다.
- 2011년: 개정 802.1AEbn-2011이 GCM-AES-256 cipher suite를 선택 사항으로 더했다.
- 2013년: 개정 802.1AEbw-2013이 확장 패킷 번호 cipher suite를 더해, SAK 하나로 $2^{32}$개보다 많은 프레임을 보호할 수 있게 했다.
- 2017년: 개정 802.1AEcg-2017이 provider 네트워크의 서비스 선택을 유지하면서 투명한 보안 연결을 주는 EDE(Ethernet Data Encryption device)를 정했다. 우선순위가 다른 프레임의 순서가 바뀔 수 있는 경우(프레임 선점 등)에 엄격한 재전송 보호를 위해 송신 SC를 여럿 쓰는 방식도 정했다.
- 2018년: 2판. 첫판과 그 개정들을 합쳐 대체했다. 이 판 뒤로 정오표 802.1AE-2018/Cor 1-2020과 MAC 프라이버시 보호를 정한 개정 802.1AEdk-2023이 나왔다.[@ieee-802-1ae-2018][@ieee-802-1ae-project-2026]
- 2025년: 2018년판과 그 정오표, 개정을 합치는 유지보수 개정 프로젝트 P802.1AE-2018-Rev의 PAR(Project Authorization Request)이 2025년 9월에 승인되어 진행 중이다.[@ieee-p802-1ae-rev-2025]

## AUTOSAR의 MACsec 지원

[[autosar-classic-platform|AUTOSAR Classic Platform]] R25-11의 MKA 명세는 MKA 모듈이 MACsec 피어를 찾고 링크를 보호할 보안 키를 협상하도록 정한다. MKA 모듈은 MKPDU(MACsec Key Agreement Protocol Data Unit)를 만들고 처리하며, 같은 CA에 속한 상대를 확인하고 인증한다. 세운 SC와 SA에 맞는 파라미터와 암호 데이터를 소프트웨어나 하드웨어로 된 SecY에 설정해 주고, SC와 SA 정보를 최신으로 유지하며, 통신을 끊지 않고 SAK를 바꿀 수 있게 키를 새로 한다. MKA 모듈은 키를 유도하고 쓰려고 [[autosar-crypto-stack#Crypto Service Manager|Csm]]과 이어지며, CAK에서 키를 유도하는 KDF(Key Derivation Function)와, MKPDU의 ICV를 만들고 검증하는 128비트 AES-[[message-authentication-code#블록 암호 기반: CMAC|CMAC]]을 암호 BSW(Basic Software)에서 받는다. MKPDU는 PDU(Protocol Data Unit)로 오가며, [[pdu-router#상위 모듈과 하위 모듈|L-SDU(Link Layer Service Data Unit) Router]](LSduR)를 거쳐 EthIf(Ethernet Interface)와 주고받는다. 이 명세는 EAP 기반 인증을 다루지 않고, 미리 나눠 둔 CAK로 하는 인증만 다룬다.[@autosar-cp-sws-macseckeyagreement-2025]

AUTOSAR Classic Platform R25-11은 MACsec 지원을 고치는 개념을 들여, MKA 모듈의 송수신을 LSduR로 하게 하고 이더넷 스위치 포트와 이더넷 컨트롤러에서도 MACsec을 지원하게 했다.[@autosar-cp-tr-releaseoverview-2025]

AUTOSAR R25-11의 Adaptive Platform 설계 설명서는 Communication Management 기능 클러스터의 보안 수단에 [[secure-onboard-communication|SecOC]], [[transport-layer-security|TLS]]와 DTLS(Datagram Transport Layer Security), IPsec(Internet Protocol Security)과 함께 MACsec을 넣는다.[@autosar-ap-exp-platformdesign-2025]
