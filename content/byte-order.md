---
title: 바이트 순서
tags:
  - network
aliases:
  - 엔디언
  - endianness
  - 네트워크 바이트 순서
verified: 2026-09-28
---

**바이트 순서**(byte order)는 여러 바이트로 이루어진 값을 메모리에 둘 때 바이트를 주소 순서로 늘어놓는 순서다. 가장 낮은 주소에 최상위 바이트를 두는 방식을 **빅 엔디언**(big-endian), 최하위 바이트를 두는 방식을 **리틀 엔디언**(little-endian)이라 한다.[@ieee-1003-1-be16toh-2024][@autosar-cp-tps-systemtemplate-2025] 엔디언(endianness)이라고도 한다.[@ieee-1003-1-endian-h-2024][@arm-ddi-0487-2026] 예를 들어 `uint32_t` 값 `0x01020304`는 빅 엔디언에서 `01 02 03 04`, 리틀 엔디언에서 `04 03 02 01` 네 바이트로 표현된다.[@ieee-1003-1-be16toh-2024]

![[diagrams/byte-order-big-little-endian.svg]]

AUTOSAR System Template에 따르면 바이트 순서는 서로 다른 처리 장치나 ECU 사이의 통신에서 중요하다.[@autosar-cp-tps-systemtemplate-2025]

## 구조·동작

### 네트워크 바이트 순서

IP 명세인 RFC 791은 헤더와 데이터의 옥텟을 번호 순서대로 보내고, 여러 옥텟으로 된 수는 최상위 옥텟을 먼저 보내도록 정한다.[@ietf-rfc-791-1981] glibc 매뉴얼은 네트워크로 보내는 데이터에 쓰는 표준 바이트 순서를 **네트워크 바이트 순서**라 부른다.[@gnu-glibc-manual-2026] POSIX는 네트워크 바이트 순서를 빅 엔디언으로 둔다.[@ieee-1003-1-be16toh-2024]

POSIX는 호스트 바이트 순서와 네트워크 바이트 순서 사이에서 값을 변환하는 함수 `htonl`, `htons`, `ntohl`, `ntohs`를 둔다. `htonl`과 `ntohl`은 32비트 값을, `htons`와 `ntohs`는 16비트 값을 다룬다.[@ieee-1003-1-htonl-2024]

### 프로세서

Intel 64와 IA-32(Intel Architecture, 32-bit) 프로세서는 리틀 엔디언이며, 워드의 바이트에 최하위 바이트부터 번호를 매긴다.[@intel-sdm-vol1-2026]

Arm A-profile 아키텍처의 AArch64는 명시적 데이터 접근의 엔디언을 시스템 레지스터 필드 `SCTLR_ELx.EE`와 `SCTLR_EL1.E0E`로 정한다. 구현은 예외 수준마다 빅 엔디언과 리틀 엔디언을 섞어 쓰게 하거나 한쪽만 지원할 수 있다. A64 명령어는 늘 리틀 엔디언이다.[@arm-ddi-0487-2026]

### 차량 통신

[[some-ip|SOME/IP]] 명세는 헤더 필드를 모두 네트워크 바이트 순서로 인코딩하도록 정한다. 페이로드 파라미터의 바이트 순서는 설정 파라미터 `BYTE_ORDER`가 정하며, 값은 `mostSignificantByteFirst`, `mostSignificantByteLast`, `opaque`이고 기본값은 `mostSignificantByteFirst`(빅 엔디언)다. 길이 필드, TLV(Tag-Length-Value) 태그, 유니언의 타입 필드 같은 일부 페이로드 필드는 `BYTE_ORDER`와 상관없이 네트워크 바이트 순서다.[@autosar-fo-prs-someipprotocol-2025]

AUTOSAR COM은 시그널마다 네트워크 표현의 엔디언을 설정 파라미터 `ComSignalEndianness`로 정하며, 값으로 `BIG_ENDIAN`, `LITTLE_ENDIAN`, `OPAQUE`를 둔다.[@autosar-cp-sws-com-2025] AUTOSAR System Template은 빅 엔디언을 Motorola 형식, 리틀 엔디언을 Intel 형식이라고도 부른다.[@autosar-cp-tps-systemtemplate-2025]

## 비교·한계

IEN 137에 따르면 비트 순서와 바이트 순서는 같을 수도 있고 다를 수도 있다. 이 글에서 Danny Cohen은 1980년, 워드의 어느 쪽 끝부터 보낼지로 나뉜 두 진영을 걸리버 여행기의 달걀 논쟁에 빗대어 Little-Endians와 Big-Endians라 불렀다.[@ietf-ien-137-1980]
