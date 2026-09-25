---
title: 분할과 재조립
tags:
  - network
aliases:
  - segmentation
  - reassembly
verified: 2026-09-25
---

## 정의

[[osi-model|OSI 참조 모델]]에서 **분할**(segmenting)은 (N) 개체가 (N) SDU(Service Data Unit) 하나를 여러 (N) PDU(Protocol Data Unit)에 나눠 담는 기능이다. 재조립(reassembling)은 여러 (N) PDU를 (N) SDU 하나로 되돌리는 기능으로, 분할의 역이다.[@itu-t-x-200-1994]

(N) SDU가 (N) PDU 하나에 담을 수 있는 사용자 데이터의 최대 크기를 넘으면 분할한다. 받는 쪽 개체가 SDU를 재조립할 수 있으려면 SDU의 조각을 식별하는 기능이 있어야 한다.[@itu-t-x-200-1994]

## 구조·동작

### 계층 안의 분할

분할하면 (N) SDU가 여러 (N) PDU로 나뉘고, PDU마다 (N) 계층의 PCI(Protocol Control Information)가 붙는다. 연결 모드에서 전송 계층의 기능에는 종단 간 분할이 들어갈 수 있다.[@itu-t-x-200-1994]

![[diagrams/segmentation-reassembly.svg]]

### CAN의 전송 프로토콜

[[can|CAN]]에서는 ISO 15765-2가 ISO 11898-1의 CAN을 쓰는 차량 네트워크를 위한 전송 프로토콜과 네트워크 계층 서비스를 규정한다.[@iso-15765-2-2024] 2016년판은 Classical CAN 프레임과 CAN FD(CAN with Flexible Data-Rate) 프레임을 모두 다룬다.[@iso-15765-2-2016]

## 비교·한계

Classical CAN 프레임의 데이터는 최대 8바이트이고[@iso-11898-1-2015], CAN FD 프레임의 데이터는 최대 64바이트다.[@iso-15765-2-2016]

![[diagrams/can-max-data-length.svg]]
