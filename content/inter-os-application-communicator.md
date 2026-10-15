---
title: Inter OS-Application Communicator
tags:
  - platform/autosar
aliases:
  - IOC
verified: 2026-09-30
---

**IOC**(Inter OS-Application Communicator)는 [[autosar-os|AUTOSAR OS]]가 제공하는, [[autosar-os-application|OS-Application]] 사이의 통신 수단이며, IOC 구현은 OS의 일부다. 특히 [[autosar-os-application#Memory protection|memory protection]] 경계를 넘는 통신과, 멀티코어에서 코어 경계를 넘는 통신을 맡는다.[@autosar-cp-sws-os-2025]

## 통신 범위

같은 OS-Application 안의 통신은 [[autosar-rte|RTE]]가, ECU 사이의 통신은 [[autosar-com|COM]]이 맡고, IOC는 같은 ECU나 [[autosar-software-cluster|Software Cluster]] 안에서 OS-Application 경계를 넘는 통신을 맡는다. IOC 서비스는 RTE가 부르며, RTE 밖의 클라이언트가 IOC를 직접 부르는 것은 지원하지 않는다. [[autosar-software-component|SW-C]]는 RTE를 거쳐서만 IOC에 접근하고, CDD(Complex Driver)에서 IOC를 쓰는 것은 권하지 않는다.[@autosar-cp-sws-os-2025]

![[diagrams/ioc-communication-scope.svg]]

## 통신 형태

IOC는 [[autosar-sender-receiver-interface|sender-receiver]] 통신만 제공하며, [[autosar-client-server-interface|client-server]] 호출은 RTE가 sender-receiver 통신으로 바꾼다. 통신 형태는 다음과 같다.[@autosar-cp-sws-os-2025]

- queued 통신과 unqueued 통신을 모두 제공한다. queued는 FIFO 순서의 event semantics이고, unqueued는 last-is-best인 data semantics다. queued 통신을 구성하면 queue 길이를 정해야 한다.
- 보내는 쪽과 받는 쪽의 수로는 1:1, N:1, N:M을 지원하되, N:M은 unqueued 통신에서만 된다.
- data item은 기본 데이터 타입이면 값, 복합 데이터 구조면 참조다. 복합 구조는 한 메모리 블록으로 구현해야 하고, IOC는 내부 구조를 몰라도 시작 주소와 길이만으로 옮긴다.
- 원자적 통신 동작 하나는 data item 하나를 옮긴다. 한 동작에 data item 여럿을 옮기는 것은 1:1 통신에만 허용된다.[@autosar-cp-sws-os-2025]

## 인터페이스

IOC는 범용 API를 두지 않고, 통신마다 전용 인터페이스를 생성한다. 각 통신은 설정에서 sender, receiver, 데이터 타입, notification, queuing으로 따로 정해지고, 서비스 API는 통신마다의 고유 Id로 구별된다. queued 통신에는 `IocSend_<IocId>`와 `IocReceive_<IocId>`가, unqueued 통신에는 `IocWrite_<IocId>`와 `IocRead_<IocId>`가 생성된다. N:1 통신에서는 송신자마다 자기 API를 쓰며, 송신 API 이름에 `_<SenderId>`가 붙는다.[@autosar-cp-sws-os-2025]

![[diagrams/ioc-queued-unqueued.svg]]

이 명세는 구현 예로, IOC 송신 서비스가 받는 쪽과 공유하는 메모리 영역의 버퍼에 데이터를 쓰고 받는 쪽이 그 버퍼에서 읽는 방식을 든다. 구현 방식은 하드웨어에 따라 다를 수 있고, RTE에는 드러나지 않아야 한다.[@autosar-cp-sws-os-2025]

## Notification

IOC는 받는 쪽에서 전송된 데이터에 접근할 수 있게 되는 즉시, 통신 사용자가 제공하고 설정한 callback 함수를 불러 받는 쪽에 알릴 수 있다. 이 notification은 선택이며, IOC가 아니라 IOC의 클라이언트인 RTE가 맡을 수도 있다. 이 명세는 예로 두 방식을 든다. IOC notification 없이 받는 쪽 [[runnable-entity|runnable]]을 [[osek-alarm|알람]] 등으로 주기적으로 불러 데이터를 받게 하는 방식과, RTE가 받는 쪽 [[osek-task|태스크]]를 활성화해 알리는 방식이다.[@autosar-cp-sws-os-2025]
