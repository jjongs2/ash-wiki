---
title: AUTOSAR transformer
tags:
  - platform/autosar
verified: 2026-10-07
---

**Transformer**는 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 BSW(Basic Software) 모듈로, [[autosar-rte|RTE]]가 넘긴 데이터를 변환해 돌려준다. 구조를 가진 데이터를 선형의 바이트 배열로 직렬화하거나, 이미 선형인 데이터를 고치거나 늘린다(예: [[checksum|체크섬]] 덧붙이기). Transformer는 RTE에 통신 서비스를 주는 [[autosar-communication-stack|Communication Services]]에 들고, RTE가 그 서비스를 필요로 할 때 실행한다. 내부 상태를 가질 수 있어 라이브러리로 치지 않지만, 상태 없이 동작할 수도 있다. AUTOSAR R25-11의 transformer 일반 명세는 transformer가 그 기능에 상태가 필요할 때만 상태를 갖도록 정한다.[@autosar-cp-asws-transformergeneral-2025]

## Transformer chain

Transformer는 이어 붙여 **transformer chain**을 이룰 수 있다. RTE가 체인의 실행을 조정해 정해진 순서대로 transformer를 부르며, 변환하도록 설정한 ECU 안 통신과 ECU 사이 통신이 이렇게 변환된다. 이 설정은 System Template에서 한다. 체인의 첫 transformer는 RTE에서 데이터를 받고, 그 뒤의 transformer는 앞 transformer의 출력을 입력으로 받는다. 첫 transformer 뒤의 transformer는 모두 바이트 배열 하나를 입력과 출력으로 하는 일반 시그니처를 가져, 직렬화한 스트림에 안전이나 보안 보호 같은 기능을 덧붙이는 구성을 만들 수 있다. Transformer의 출력은 늘 선형 바이트 배열이다.[@autosar-cp-asws-transformergeneral-2025]

System Template에 적은 순서는 송신 쪽의 순서이고, 수신 쪽은 그 역순으로 실행해 송신 쪽의 변환을 되돌린다. [[autosar-software-component|SW-C]] 쪽에서는 어떤 transformer를 쓰는지, 아예 쓰는지조차 드러나지 않는다.[@autosar-cp-asws-transformergeneral-2025]

Transformer는 기능에 따라 Serializer, Safety, Security, Custom 네 클래스로 나뉘고, 체인 하나에는 클래스마다 transformer를 하나까지만 둔다. Serializer는 데이터를 바이트 배열로 직렬화한다. Safety transformer는 의도하지 않은 변경에 맞서 통신을 보호하고, Security transformer는 의도한 변경에 맞서 통신의 authenticity, 무결성, 신선도를 지킨다. Custom transformer는 AUTOSAR가 정하지 않은 transformer로, CDD(Complex Driver)로 구현할 수 있다.[@autosar-cp-asws-transformergeneral-2025]

버퍼 처리 방식은 in-place와 out-of-place 둘이다. In-place는 입력 버퍼를 출력 버퍼로도 쓰고, out-of-place는 입력 버퍼와 출력 버퍼를 따로 쓰며 입력 버퍼를 바꾸지 않는다. 어느 방식을 쓸지는 System Template의 설정으로 정한다. Transformer가 쓰는 버퍼는 RTE가 최악의 경우에 필요한 출력 크기를 계산해 잡는다. 송신 쪽 첫 transformer는 SW-C context에 있는 원래 데이터를 고칠 수 없고, 수신 쪽 마지막 transformer는 결과를 SW-C의 버퍼에 바로 써야 하므로, 둘은 out-of-place를 쓴다.[@autosar-cp-asws-transformergeneral-2025]

예를 들어 in-place 버퍼를 쓰지 않는 체인에서 RTE는 [[some-ip|SOME/IP]] Transformer를 먼저, [[autosar-e2e-protection#E2E Library와 E2E Transformer|E2E Transformer]]를 그다음으로 부른다. 두 transformer는 저마다 RTE가 준 다른 버퍼에 출력을 쓰고, RTE는 최종 바이트 배열을 [[autosar-com|AUTOSAR COM]]에 넘긴다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

![[diagrams/transformer-chain-send-receive.svg]]

Transformer는 오류를 반환 코드로 RTE에 돌려주고, RTE는 이를 보고 체인을 이어 실행할지 멈출지 정한다. Soft error면 RTE가 체인을 이어 실행하고, hard error면 다음 transformer에 넘길 의미 있는 데이터가 없으므로 체인을 멈춘다. 반환값 `0x00`은 성공, `0x01`부터 `0x7F`까지는 soft error, `0x80`부터 `0xFF`까지는 hard error다. 유효한 출력을 만들 수 없는 transformer는 hard error를 돌려주고 출력 버퍼를 그대로 둔다.[@autosar-cp-asws-transformergeneral-2025]

## 변환 대상과 제약

변환 대상은 [[autosar-sender-receiver-interface|sender-receiver 인터페이스]] 포트의 데이터 요소, [[autosar-client-server-interface|client-server 인터페이스]] 포트의 operation, 큐를 쓰지 않는 trigger 인터페이스 포트의 외부 trigger 이벤트로 한정된다. 변환은 RTE 안에서 일어나는데 PDU(Protocol Data Unit)는 COM 모듈 안에서 만들어지므로, PDU를 통째로 변환할 수는 없다. 변환한 데이터 요소 여럿을 COM에서 큰 PDU 하나에 모을 수는 있지만, 그 PDU의 데이터 요소는 저마다 따로 변환되고 변환이 헤더를 붙이면 저마다 헤더를 단다. 그래서 하위 요소가 서로 다른 포트나 SW-C의 데이터 요소로 채워지는 데이터 구조는 변환할 수 없다.[@autosar-cp-asws-transformergeneral-2025]

Transformer chain의 길이는 이 개념이 고른 해법 때문에 제한되지는 않지만, 메모리를 아끼는 설정과 구현을 위해 최대 255개로 정한다. AUTOSAR R25-11이 나온 2025년의 쓰임새에서는 체인이 길어야 3개였다.[@autosar-cp-asws-transformergeneral-2025]

큰 복합 데이터 요소를 직렬화하는 변환은 [[ethernet|이더넷]]처럼 PDU가 큰 버스에서 가장 효율적이다. [[can|CAN]]처럼 PDU가 작은 버스에서는 직렬화한 바이트 배열을 여러 PDU에 걸쳐 실어야 하므로, 가능은 하지만 비효율적이다.[@autosar-cp-asws-transformergeneral-2025]

## COM Based Transformer

**COM Based Transformer**는 대상 버스가 데이터를 빽빽하게 채운 고정 통신 매트릭스를 쓸 때 transformer chain을 쓸 수 있게 하는 transformer다. 이 transformer는 구조를 가진 데이터를 선형으로 직렬화하므로 체인의 맨 앞에만 둘 수 있어, 송신 쪽에서는 첫째, 수신 쪽에서는 마지막에 놓인다. 송신 쪽 COM Based Transformer는 SW-C의 데이터를 통신 매트릭스 기술에 따라 uint8 배열로 직렬화하고, RTE는 다른 transformer가 덧붙인 것까지 담긴 이 배열을 `Com_SendSignalGroupArray` 한 번으로 COM에 넘긴다. COM은 배열을 I-PDU(Interaction Layer Protocol Data Unit)의 시그널 그룹 자리에 놓고, 설정에 따라 배열을 살펴 전송 모드를 고른다. 수신 쪽 RTE는 체인을 역순으로 실행하고, COM Based Transformer가 선형 데이터를 원래 구조로 되돌려 SW-C에 넘긴다.[@autosar-cp-sws-combasedtransformer-2025]

COM Based Transformer의 목표는 고정 통신 매트릭스로 시그널을 PDU에 최적으로 배치해(예: Boolean 데이터를 1비트로) CAN이나 [[lin|LIN]]처럼 페이로드가 작은 네트워크에서도 transformer chain을 쓰게 하는 것이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 그 밖의 transformer

BSW 모듈 목록에 transformer로 오른 모듈은 COM Based Transformer(ComXf), E2E Transformer(E2EXf), SOME/IP Transformer(SomeIpXf), [[autosar-communication-stack#Data Distribution Service|DDS]] Transformer(DdsXf)이고, 모두 Communication Services 층에 든다.[@autosar-cp-sws-bswgeneral-2025] SOME/IP Transformer가 따르는 형식은 SOME/IP의 [[some-ip#직렬화|직렬화]]에서 다룬다.
