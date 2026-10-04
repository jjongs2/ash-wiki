---
title: 키 설정
tags:
  - security
aliases:
  - Key exchange
verified: 2026-10-03
---

**키 설정**(key establishment)은 서로 다른 당사자들이 함께 쓰는 비밀 키 재료를 만들어 내는 절차다.[@nist-sp-800-56a-r3-2018] ISO/IEC 11770-3:2021은 키 설정을 하나 이상의 개체가 공유 비밀 키를 쓸 수 있게 하는 과정으로 정의하고, 이 과정에 키 합의와 키 전송이 든다고 한다. 이 표준은 [[symmetric-key-cryptography|대칭 암호]] 기법에 쓸 공유 비밀 키를 두 개체 사이에 키 합의나 키 전송으로 설정하는 메커니즘을 정한다.[@iso-iec-11770-3-obp-2021]

## 키 합의와 키 전송

NIST SP 800-56B Rev. 2는 키 설정 방식을 키 합의 방식과 키 전송 방식 둘로 나눈다.[@nist-sp-800-56b-r2-2019]

- **키 합의**(key agreement): 두 당사자가 내놓은 정보로 공유 비밀 키를 정하며, 어느 쪽도 그 값을 혼자 미리 정하지 못한다. SP 800-56A Rev. 3과 ISO/IEC 11770-3:2021이 이렇게 정의한다.[@nist-sp-800-56a-r3-2018][@iso-iec-11770-3-obp-2021]
- **키 전송**(key transport): 한 당사자가 키를 정해 다른 당사자에게 안전하게 보낸다. SP 800-56B Rev. 2와 ISO/IEC 11770-3:2021이 이렇게 정의한다.[@iso-iec-11770-3-obp-2021][@nist-sp-800-56b-r2-2019]

NIST SP 800-56A Rev. 3은 이산 로그 기반의 키 합의 방식인 [[diffie-hellman-key-exchange|Diffie-Hellman]]과 MQV(Menezes-Qu-Vanstone)를 정한다.[@nist-sp-800-56a-r3-2018] SP 800-56B Rev. 2는 RSA(Rivest-Shamir-Adleman) 기반의 키 합의 방식과 키 전송 방식을 정한다.[@nist-sp-800-56b-r2-2019] NIST SP 800-175B Rev. 1은 미국 연방 정부가 NIST의 암호 표준을 고르고 쓰는 방법을 안내하며, SP 800-56A와 SP 800-56B의 키 설정 방식도 다룬다.[@nist-sp-800-175b-r1-2020]

## 공개키로 감싼 키 전송

SP 800-56B Rev. 2의 KTS-OAEP(Key-Transport Scheme with Optimal Asymmetric Encryption Padding) 방식에서 보내는 쪽은 받는 쪽의 RSA [[public-key-cryptography|공개키]]로 키 재료를 RSA-OAEP 암호화해 보내고, 받는 쪽은 자기 개인키로 복호해 키 재료를 꺼낸다. SP 800-56B Rev. 2에 따르면 받는 쪽의 RSA 개인키가 드러나지 않는 한, 받는 쪽 말고는 누구도 암호문에서 키 재료를 꺼내지 못한다.[@nist-sp-800-56b-r2-2019]

## 정적 키, 임시 키, 세션 키

SP 800-56A Rev. 3은 키 설정에 쓰는 키 쌍을 정적 키 쌍과 임시 키 쌍으로 나눈다.[@nist-sp-800-56a-r3-2018]

- **정적 키 쌍**(static key pair): 비교적 오랜 기간, 대개 여러 키 설정 거래에 걸쳐 쓰는 키 쌍이다. SP 800-56A Rev. 3에 따르면 정적 키 쌍은 키를 함께 설정할 상대를 바르게 식별했다는 확신을 어느 정도 준다.
- **임시 키 쌍**(ephemeral key pair): 아주 짧은 기간, 보통 거래 하나에만 쓰는 키 쌍이다. SP 800-56A Rev. 3은 임시 개인키를 키 설정 거래 하나에만 쓰고 되도록 빨리 없애게 정한다.[@nist-sp-800-56a-r3-2018]

IETF의 보안 용어집 RFC 4949는 대칭 암호에서 임시로 또는 비교적 짧은 기간 쓰는 키를 **세션 키**라 부른다. 세션 키는 한 연결이나 트랜잭션 묶음처럼 정해진 통신 기간 동안 쓰며, Diffie-Hellman 같은 키 합의로 계산한 공유 비밀 값에서 유도하기도 한다.[@ietf-rfc-4949-2007]

## 안전성 성질

**Forward secrecy**는 장기 개인키가 나중에 드러나도 그 전에 설정한 키가 지켜지는 성질이다.[@nist-sp-800-52-r2-2019] ISO/IEC 11770-3:2021은 개체 A에 대한 forward secrecy를, 키 합의 연산 뒤에 공격자가 A의 장기 개인키를 알아도 앞서 유도된 키를 다시 계산하지 못하는 성질로 정의한다. 두 개체의 장기 개인키를 모두 알아도 그런 성질은 mutual forward secrecy로 따로 정의한다.[@iso-iec-11770-3-obp-2021]

SP 800-56B Rev. 2에 따르면 KTS-OAEP에서 받는 쪽의 RSA 개인키를 손에 넣은 공격자가 지난 거래의 암호문도 얻으면, 그 거래로 전송된 키 재료를 알아낼 수 있다.[@nist-sp-800-56b-r2-2019] NIST SP 800-52 Rev. 2는 [[transport-layer-security|TLS]]의 RSA 키 전송이 forward secrecy를 주지 못한다는 점 등을 들어, RSA 키 전송을 쓰는 [[transport-layer-security#Cipher suite|cipher suite]]를 권하지 않는다.[@nist-sp-800-52-r2-2019]

**Key compromise impersonation 저항**은 A의 장기 개인키가 드러나도, 공격자가 그 키로 다른 개체인 척하며 A와 통신하지 못하는 성질이다. ISO/IEC 11770-3:2021이 이 성질을 정의한다.[@iso-iec-11770-3-obp-2021] SP 800-56A Rev. 3에 따르면 키 합의 참여자는 상대 개체의 행동과, 그 개체의 개인키를 아는 이의 행동을 구별하지 못한다. C(2e, 2s) 방식에서 어떤 개체의 정적 개인키를 손에 넣은 공격자는 그 개체인 척할 수 있고, Full Unified model과 dhHybrid1에서는 그 개체에게 다른 개체인 척할 수도 있다.[@nist-sp-800-56a-r3-2018]

**Unknown key share 저항**은 세션 키를 A와 B만 알지만, 둘이 그 키를 누구와 공유하는지를 서로 다르게 아는 공격을 견디는 성질이다. ISO/IEC 11770-3:2021이 이 성질을 정의한다.[@iso-iec-11770-3-obp-2021]

키 합의 프로토콜이 실행마다 서로 다른 세션 키를 만들고, 공격자가 다른 세션 키 몇 개를 알아도 프로토콜이 여전히 목표를 이루는 성질을 **known-key security**라 부른다.[@blake-wilson-authenticated-diffie-hellman-1999]

**Session state reveal 저항**은 공격자가 다른 세션의 내부 상태, 예를 들어 Diffie-Hellman의 지수 같은 임시 비밀 값을 알아내도, 노출되지 않은 세션의 키가 지켜지는 성질이다. 이 성질은 장기 비밀을 다루는 연산이 세션 상태와 분리된 모듈에서 이뤄진다고 가정한다.[@canetti-key-exchange-2001]
