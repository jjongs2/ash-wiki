---
title: PKI
tags:
  - security/cryptography
aliases:
  - 공개 키 기반 구조
verified: 2026-10-22
---

FIPS 186-5는 **PKI**(Public Key Infrastructure)를 [[public-key-cryptography|공개 키]] 인증서를 발급하고 유지하고 폐지하려고 세운 틀로 정의한다.[@nist-fips-186-5-2023] 인터넷에서 쓸 X.509 v3 인증서와 X.509 v2 CRL(Certificate Revocation List)의 프로파일은 RFC 5280이 정한다.[@ietf-rfc-5280-2008]

## 공개 키 인증서

공개 키를 쓰는 쪽은 짝이 되는 개인 키를 맞는 주체(사람이나 시스템)가 가졌다는 확신이 있어야 하고, 이 확신은 공개 키 인증서로 얻는다. **공개 키 인증서**(public key certificate)는 공개 키 값을 주체에 묶는 데이터 구조다. 믿을 수 있는 CA(Certification Authority)가 인증서마다 [[digital-signature|디지털 서명]]을 해서 이 묶음을 보증한다. 인증서에는 유효 기간이 있고, 그 기간은 서명된 내용 안에 적힌다.[@ietf-rfc-5280-2008]

## 인증 경로

공개 키를 쓰는 쪽은 믿을 수 있는 CA 공개 키를 몇 개만 갖고 시작한다. 그래서 필요한 공개 키를 얻으려면 인증서 여러 장을 이은 사슬이 필요할 수 있다. 이 사슬을 **인증 경로**(certification path)라 하며, 한 CA가 서명한 공개 키 소유자(최종 개체)의 인증서와, 다른 CA가 서명한 CA 인증서 0장 이상으로 이루어진다.[@ietf-rfc-5280-2008]

![[diagrams/pki-certification-path.svg]]

## 폐지

인증서는 유효 기간 내내 쓰일 것으로 보고 발급하지만, 이름이 바뀌거나 주체와 CA의 관계가 바뀌거나, 대응하는 개인 키가 노출되었거나 노출이 의심되면 유효 기간이 끝나기 전에 무효가 될 수 있다. 이때 CA는 인증서를 폐지해야 한다. 폐지를 알리는 방법 하나로, CA는 **CRL**이라 부르는 서명된 목록을 주기적으로 내고, CRL은 폐지된 인증서를 인증서 일련번호로 가리킨다.[@ietf-rfc-5280-2008]

## 쓰는 곳

[[transport-layer-security#인증|TLS 1.3]], [[autosar-crypto-stack#Key Manager|AUTOSAR 암호 스택]], [[secure-boot#구현 예|Secure boot]]가 인증서를 쓰는 방식은 각 페이지에서 다룬다.
