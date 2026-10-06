---
title: CAN FD
tags:
  - network/can
aliases:
  - CAN with Flexible Data-Rate
verified: 2026-09-27
---

**CAN FD**(CAN with Flexible Data-Rate)는 [[can|CAN]] 프로토콜을 확장한 것으로, 중재가 끝난 뒤 한 프레임 안에서 더 빠른 비트율로 바꿀 수 있고 데이터 필드를 64바이트까지 늘렸다. Bosch가 2012년에 규격 1.0을 공개했다.[@bosch-can-fd-1-0-2012] ISO 11898-1:2015는 CAN FD 프레임 포맷을 새로 넣었다.[@iso-11898-1-obp-2015] 2024년판은 [[can-frame|classic 프레임]] 포맷, CAN FD 프레임 포맷, [[can-xl|CAN XL]] 프레임 포맷을 규정한다.[@iso-11898-1-obp-2024]

## 개발 경위

CiA에 따르면 2011년 초 General Motors와 Bosch가 CAN의 처리량을 높이는 개발을 시작했다. 생산 라인 끝(end-of-line)에서 ECU에 커져 가는 소프트웨어를 내려받는 데 시간이 오래 걸리는 문제가 계기였다. Bosch는 다른 CAN 전문가들과 함께 CAN FD 규격을 먼저 만들었고, 이 규격은 2012년 제13회 iCC(international CAN Conference)에서 공식 발표되었다.[@cia-can-history-2026]

## 두 비트율

CAN FD 프레임은 중재 구간(arbitration phase)과 데이터 구간(data phase)으로 나뉘고, 중재 구간은 classical CAN과 같은 비트율을 쓴다. BRS(Bit Rate Switch) 비트가 [[dominant-and-recessive|recessive]]이면 미리 설정한 데이터 구간 비트율로 바꾸고, dominant이면 바꾸지 않는다. 데이터 구간은 BRS 비트의 [[can-bit-timing#샘플 포인트|샘플 포인트]]에서 시작해 [[can-crc|CRC]] 구분자의 샘플 포인트에서 끝난다.[@bosch-can-fd-1-0-2012]

ISO 11898-1:2024는 **중재 구간**을 공칭 비트 시간을 쓰는 구간으로, **데이터 구간**을 데이터 비트 시간을 쓰는 구간으로 정의한다.[@iso-11898-1-obp-2024]

Bosch CAN FD 1.0은 BRS 비트와 CRC 구분자 비트에서 비트율을 그 샘플 포인트 바로 뒤에 바꾸게 정한다. 그래서 이 두 비트의 길이는 공칭 비트와 데이터 비트의 중간이 되고, BRS 비트와 CRC 구분자 비트의 길이를 $t_\mathrm{BRS}$, $t_\mathrm{CRCdel}$, 공칭 비트 시간과 데이터 비트 시간을 $t_\mathrm{bit,N}$, $t_\mathrm{bit,D}$라 하면 $t_\mathrm{BRS} + t_\mathrm{CRCdel} = t_\mathrm{bit,N} + t_\mathrm{bit,D}$여야 한다.[@bosch-can-fd-1-0-2012]

![[diagrams/can-fd-bit-rate-phases.svg]]

[[can-arbitration|중재]] 구간에서는 송신 노드가 샘플 포인트를 노드 사이의 왕복 전파 지연 뒤에 두어야 하므로, 비트율이 전파 지연에 묶인다. 데이터 구간에서는 송신 노드가 하나만 남아 전파 지연이 비트율을 제한하지 않고, 비트 시간을 더 줄일 수 있다.[@microchip-mcp25xxfd-frm-2020]

두 구간의 비트 타이밍은 서로 다른 설정 레지스터 묶음으로 따로 설정한다.[@bosch-can-fd-1-0-2012] 설정 방법은 [[can-bit-timing#CAN FD와의 차이|CAN 비트 타이밍]]에서 다룬다.

CAN FD의 높은 비트율을 쓰려면 [[can-transceiver|트랜시버]]가 loop delay symmetry를 보장해야 한다.[@microchip-mcp2561-2fd-2014] CAN FD용 트랜시버 데이터시트는 지원하는 CAN FD 비트율을 명시한다. 예를 들어 TCAN1042-Q1은 2 Mbit/s, G 옵션은 5 Mbit/s다.[@ti-tcan1042-q1-2021]

## 데이터 필드

CAN FD 포맷 프레임의 데이터 필드는 0\~64바이트이고, [[data-length-code|DLC]] 9\~15가 8바이트보다 긴 12, 16, 20, 24, 32, 48, 64바이트를 가리킨다.[@bosch-can-fd-1-0-2012] 프레임의 비트 구성은 [[can-fd-frame|CAN FD 프레임]]에서 다룬다.

![[diagrams/can-fd-dlc-data-length.svg]]

Bosch CAN FD 1.0은 모든 구현이 8바이트보다 긴 데이터 필드를 지원하도록 요구하지 않는다. 다만 긴 데이터를 다 다루지 못하는 구현도 받은 긴 프레임을 오류로 보지 않고, 오류 없는 긴 프레임에는 ACK를 보내고 수용 필터링에도 참여해야 한다. 다루지 못하는 데이터 바이트는 버린다.[@bosch-can-fd-1-0-2012]

## 호환성

Bosch CAN FD 1.0은 CAN FD가 Bosch CAN 2.0과 물리 계층을 같이 쓰고 프레임 포맷이 다르다고 정하며, Bosch CAN 2.0 규격을 고치지 않은 채 그대로 유효하게 둔다.[@bosch-can-fd-1-0-2012]

ISO 11898-1:2024는 CAN FD를 지원하는(FD enabled) 구현이 CAN FD 프레임과 classic 프레임을 모두 주고받는다고 정의한다. Classic 포맷만 지원하고 CAN FD 포맷을 용인하지 않는 구현은, CAN FD 구현이나 CAN XL 구현과 classic 포맷만 쓸 때 통신할 수 있다. 이 표준은 CAN FD 프레임을 주고받지 못해도 방해하지 않는 구현을 **FD tolerant**로 정의하고, 구현 옵션 가운데 하나로 둔다.[@iso-11898-1-obp-2024] ISO 11898-1:2015는 CAN FD 포맷을 용인하지 않는 구현을 CAN FD 프레임을 방해하는 FD intolerant로 정의했고, 2024년판은 이 용어를 두지 않는다.[@iso-11898-1-obp-2015][@iso-11898-1-obp-2024] ISO 11898-1:2024는 CAN FD 포맷을 용인하지 않는 classic 구현이 [[can-fd-light|CAN FD light]] responder와 통신할 수 없어, 통신을 시도하면 [[can-error-frame|오류 프레임]]이 생긴다고 정한다.[@iso-11898-1-obp-2024]

Bosch CAN FD 1.0은 한 방법으로, CAN FD를 end-of-line 소프트웨어 다운로드 같은 특정 운용 모드에서만 쓰고 그동안 CAN FD를 지원하지 않는 [[can-controller|컨트롤러]]는 standby로 두는 방식을 든다.[@bosch-can-fd-1-0-2012]

ISO 11898-1:2015의 CAN FD와 Bosch CAN FD 1.0 규격의 차이는 [[iso-11898-1#Bosch CAN FD와의 차이|ISO 11898-1]]에서 다룬다.

## 설계 지침

CiA 601 시리즈는 ISO 11898-1의 CAN FD와 시스템 설계 사이를 메우는 CAN FD 지침과 권고다. 1부는 물리 인터페이스 구현, 3부는 비트 타이밍 설정 규칙을 포함한 시스템 설계 권고, 6부는 CAN FD 케이블의 요건과 시험 방법을 다룬다. 1부와 3부는 TR로 나와 있고, 2부와 4부는 철회되었다.[@cia-601-2026]

## CAN XL과의 차이

ISO 11898-1:2024는 CAN XL 요구사항을 더했고, CAN XL 프레임 포맷의 데이터 필드는 최대 2048바이트다.[@iso-11898-1-obp-2024]
