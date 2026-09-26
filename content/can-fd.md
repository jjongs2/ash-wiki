---
title: CAN FD
tags:
  - network/can
aliases:
  - CAN with Flexible Data-Rate
verified: 2026-09-26
---

## 정의

**CAN FD**(CAN with Flexible Data-Rate)는 [[can|CAN]] 프로토콜을 확장한 것으로, 중재가 끝난 뒤 한 프레임 안에서 더 빠른 비트율로 바꿀 수 있고 데이터 필드를 64바이트까지 늘렸다. Bosch가 2012년에 규격 1.0을 공개했다.[@bosch-can-fd-1-0-2012] ISO 11898-1:2015는 Classical CAN 프레임 포맷과 함께 새로 들어온 CAN FD 프레임 포맷을 규정한다.[@iso-11898-1-obp-2015]

## 구조·동작

### 두 비트율

CAN FD 프레임은 중재 구간(arbitration phase)과 데이터 구간(data phase)으로 나뉘고, 중재 구간은 classical CAN과 같은 비트율을 쓴다. BRS(Bit Rate Switch) 비트가 recessive이면 미리 설정한 데이터 구간 비트율로 바꾸고, dominant이면 바꾸지 않는다. 데이터 구간은 BRS 비트의 샘플 포인트에서 시작해 [[can-crc|CRC]] 구분자의 샘플 포인트에서 끝난다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-bit-rate-phases.svg]]

[[can-arbitration|중재]] 구간에서는 송신 노드가 샘플 포인트를 노드 사이의 왕복 전파 지연 뒤에 두어야 하므로, 비트율이 전파 지연에 묶인다. 데이터 구간에서는 송신 노드가 하나만 남아 전파 지연이 비트율을 제한하지 않고, 비트 시간을 더 줄일 수 있다.[@microchip-mcp25xxfd-frm-2020]

두 구간의 비트 타이밍은 서로 다른 설정 레지스터 묶음으로 따로 설정한다.[@bosch-can-fd-1-0-2012] 설정 방법은 [[can-bit-timing|CAN 비트 타이밍]]에서 다룬다.

### 데이터 필드

CAN FD 포맷 프레임의 데이터 필드는 0\~64바이트이고, [[data-length-code|DLC]] 9\~15가 8바이트보다 긴 12, 16, 20, 24, 32, 48, 64바이트를 가리킨다.[@bosch-can-fd-1-0-2012] 프레임의 비트 구성은 [[can-fd-frame|CAN FD 프레임]]에서 다룬다.

![[diagrams/can-fd-dlc-data-length.svg]]

### 호환성

ISO 11898-1:2015는 CAN FD를 지원하는(FD enabled) 구현이 CAN FD 프레임과 classical 프레임을 모두 주고받는다고 정의한다. Classical 포맷만 지원하고 CAN FD 포맷을 받아들이지 못하는 구현은 CAN FD 프레임이 쓰이면 오류 프레임을 낸다.[@iso-11898-1-obp-2015]

Bosch CAN FD 1.0은 한 방법으로, CAN FD를 end-of-line 소프트웨어 다운로드 같은 특정 운용 모드에서만 쓰고 그동안 CAN FD를 지원하지 않는 컨트롤러는 standby로 두는 방식을 든다.[@bosch-can-fd-1-0-2012]

## 비교·한계

ISO 11898-1:2015의 CAN FD와 Bosch CAN FD 1.0 규격의 차이는 [[iso-11898-1|ISO 11898-1]]에서 다룬다.

CAN FD의 높은 비트율을 쓰려면 트랜시버가 loop delay symmetry를 보장해야 한다.[@microchip-mcp2561-2fd-2014] CAN FD용 트랜시버 데이터시트는 지원하는 CAN FD 비트율을 명시한다. 예를 들어 TCAN1042-Q1은 2 Mbit/s, G 옵션은 5 Mbit/s다.[@ti-tcan1042-q1-2021]

ISO 11898-1:2024는 CAN FD 프레임을 주고받지 못해도 방해하지 않는 구현을 **FD tolerant**로 정의하고, 구현 옵션 가운데 하나로 둔다. 같은 판은 CAN XL 요구사항을 더했고, CAN XL 프레임 포맷의 데이터 필드는 최대 2048바이트다.[@iso-11898-1-obp-2024]
