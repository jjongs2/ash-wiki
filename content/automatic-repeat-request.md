---
title: ARQ
tags:
  - network
aliases:
  - 자동 재전송 요청
verified: 2026-09-29
---

**ARQ**(Automatic Repeat Request)는 수신 측이 오류 검출 부호로 찾아낸 오류를 되돌림 통로로 송신 측에 알리고, 송신 측이 그 데이터를 다시 보내게 하는 오류 정정 방식이다.[@iec-60050-721-08-21-1991][@ietf-rfc-3819-2004] RFC 3366에 따르면 링크 계층의 ARQ는 프레임마다 [[cyclic-redundancy-check|CRC]] 같은 무결성 검사로 오류를 찾고, 잃거나 깨진 프레임을 다시 보낸다.[@ietf-rfc-3366-2002] RFC 9293은 TCP가 [[checksum|체크섬]] 검사에 실패한 세그먼트처럼 잃은 세그먼트를 재전송으로 메우도록 정한다.[@ietf-rfc-9293-2022]

## 구조·동작

### 확인 응답

**ACK**(positive acknowledgement)는 정보를 바르게 받았음을 알리는 메시지이고, **NAK**(negative acknowledgement)는 잘못 받았음을 알리는 메시지다.[@iec-60050-371-04-01-1984][@iec-60050-371-04-02-1984] RFC 3366에 따르면 링크 계층 ARQ의 송신 측은 링크 타이머, 오지 않은 ACK, NAK, 수신 측 상태의 폴링으로 프레임을 잃은 것을 알아채고 다시 보낸다.[@ietf-rfc-3366-2002]

### Stop-and-wait

RFC 3366에 따르면 **stop-and-wait ARQ**의 송신 측은 프레임 하나를 보내고 그 ACK를 기다린다. ACK가 오면 다음 프레임을 보내고, 앞의 프레임이 사라졌거나 깨졌다고 알려 오면 같은 프레임을 다시 보낸다. 구현이 간단하지만 효율이 낮아서, 링크 계층에서는 대역폭·지연 곱이 작은 링크에만 알맞다.[@ietf-rfc-3366-2002]

### 슬라이딩 윈도

RFC 3366에 따르면 **슬라이딩 윈도**(sliding window) ARQ의 송신 측은 전송 윈도가 허락하는 만큼 프레임을 ACK를 기다리지 않고 잇달아 보낸다. 윈도가 작으면 타이머가 끝나거나 ACK 같은 제어 프레임이 올 때까지 새 프레임을 보내지 못한다. 프레임마다 모듈러 순서 번호를 붙여 전송 중인 프레임을 하나하나 가려내는데, 순서 번호 공간은 윈도보다 커야 하고 selective repeat에서는 윈도의 두 배보다 커야 한다. TCP도 전송 계층의 슬라이딩 윈도 프로토콜이다.[@ietf-rfc-3366-2002]

### Go-back-N과 selective repeat

RFC 3366에 따르면 슬라이딩 윈도 ARQ를 쓰는 기법에는 **Go-back-N**과 **selective repeat**이 있고, 각각 REJ(Reject), SREJ(Selective Reject)라고도 부른다.[@ietf-rfc-3366-2002]

ITU-T V.42는 모뎀용 링크 절차인 LAPM(Link Access Procedure for Modems)에 두 방식을 모두 정한다. REJ 프레임을 받은 쪽은 REJ가 가리키는 정보 프레임부터 차례로 모두 다시 보내고, SREJ 프레임을 받은 쪽은 SREJ가 가리키는 정보 프레임만 다시 보낸다. 수신 측은 순서 번호가 맞지 않는 정보 프레임을 받으면, 선택적 재전송을 합의하지 않았을 때는 그 정보 필드를 버리고, 합의했을 때는 기대한 프레임이 올 때까지 쥐고 있다가 넘긴다.[@itu-t-v-42-2002]

![[diagrams/arq-rej-srej-retransmission.svg]]

CCSDS(Consultative Committee for Space Data Systems) 232.1-B-2는 우주 링크의 COP-1(Communications Operation Procedure-1)이 Go-back-N형 ARQ를 쓰도록 정한다. 수신 측은 순서가 처음 어긋난 뒤로 기대한 순서 번호가 아닌 순서 제어 프레임을 모두 거부하고, 송신 측은 재전송 요청이나 타임아웃이 오면 확인받지 못한 순서 제어 프레임을 모두 다시 보낸다.[@ccsds-232-1-b-2-2010]

### CAN의 재전송

Bosch CAN 2.0 규격은 깨진 메시지를 오류를 찾은 노드가 표시하고, 그 메시지는 중단된 뒤 자동으로 다시 보내지도록 정한다. 재전송은 버스가 비는 즉시 시작해야 한다.[@bosch-can-2-0-1991] 오류를 표시하는 방법은 [[can-error-frame|CAN 오류 프레임]]에서 다룬다.

[[can|CAN]] 컨트롤러는 기본 설정에서 중재에서 졌거나 오류로 깨진 프레임을 자동으로 다시 보내고, 이 동작을 설정으로 끌 수 있다.[@bosch-m-can-2023][@microchip-mcp2515-2019]

## 비교·한계

ARQ는 되돌림 통로가 있어야 한다.[@iec-60050-721-08-21-1991][@ietf-rfc-3366-2002] 반면 [[error-correction-code|오류 정정 부호]]는 되돌림 통로 없이 오류를 고친다.[@iec-60050-702-05-20-2016]

IETF의 RFC 3819에 따르면 ARQ는 지연 변동을 키우지만 FEC(Forward Error Correction)는 그렇지 않다.[@ietf-rfc-3819-2004] RFC 3366에 따르면 ARQ가 더하는 지연 변동은 재전송하는 링크를 함께 쓰는 모든 흐름에 미친다.[@ietf-rfc-3366-2002]
