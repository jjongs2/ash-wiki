---
title: AUTOSAR 메모리 스택
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 메모리 스택**은 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 BSW(Basic Software)에서 내부·외부 비휘발성 메모리에 표준화된 접근을 주는 모듈들의 묶음이다. 위에서부터 Memory Services의 [[nvram-manager|NvM]], MemIf(Memory Abstraction Interface), Fee(Flash EEPROM Emulation)와 Ea(EEPROM Abstraction), MemAcc(Memory Access), Mem(Memory Driver)이 층을 이룬다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-memoryabstractioninterface-2025] NvM은 응용에 비휘발성 데이터를 한결같은 방식으로 주고 메모리의 위치와 성질을 감춘다. [[autosar-layered-architecture#층 사이 접근|Complex Driver]]가 메모리 스택에 접근할 때 거치는 곳은 NvM이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] AUTOSAR R25-11의 BSW 일반 명세는 Memory Services에 NvM과 함께 BndM(Bulk NvData Manager)도 둔다.[@autosar-cp-sws-bswgeneral-2025]

## 층

- **Memory Services**: 이 층의 NvM과 BndM은 둘 다 자기가 쓰는 비휘발성 메모리를 추상화해 비휘발성 데이터를 다룬다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
- **Memory Hardware Abstraction**: MemIf, Fee, Ea, MemAcc로 이루어진다. 메모리 장치가 칩 안에 있는지 보드 위에 있는지와 ECU 하드웨어 배치를 감추고, 위 층에 메모리 장치와 상관없는 인터페이스를 준다.
- **Memory Drivers**: Mem이 [[flash-memory|플래시]], EEPROM 같은 메모리 장치를 읽고, 쓰고, 지우고, 비었는지 검사하는 기본 서비스를 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-memorydriver-2025]

![[diagrams/autosar-memory-stack-layers.svg]]

칩 안의 메모리 장치와 메모리 맵 외부 장치의 드라이버는 [[microcontroller-abstraction-layer|MCAL]]의 Memory Drivers에, 그 밖의 외부 메모리 장치를 다루는 [[ecu-abstraction-layer#External driver|external driver]]는 ECU Abstraction Layer에 놓인다. AUTOSAR Classic Platform R25-11의 [[autosar-layered-architecture|Layered Software Architecture]]는 이전 릴리스에 있던 Fls(Flash Driver)와 Eep(EEPROM Driver)를 뺐다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## Mem

Mem에서 **write page**는 메모리 장치에 한 번에 써야 하는 가장 작은 단위다. **Sector batch**는 크기가 같은 연속 섹터를 논리적으로 묶은 것이고, **뱅크**(bank)는 sector batch들의 묶음이고, 한 뱅크 안에서는 read-while-write가 허용되지 않는다. 플래시 메모리 장치에서 뱅크는 대개 플래시 컨트롤러 하나에 대응한다. Mem에서 [[flash-memory#뱅크와 RWW|RWW]]는 한 뱅크를 쓰거나 지우는 동안 다른 뱅크를 읽는 메모리 장치의 능력이다.[@autosar-cp-sws-memorydriver-2025]

![[diagrams/mem-device-bank-sector-batch.svg]]

메모리 하드웨어가 [[error-correction-code#메모리의 ECC|ECC]] 정보를 주면, Mem은 고칠 수 없는 ECC 오류를 검사해 [[autosar-memory-stack#비동기 job|job]] 결과를 MEM_ECC_UNCORRECTED로 두고 처리하던 job을 멈춘다. 고칠 수 있는 ECC 오류면 job 처리를 이어 가고, job이 끝나면 결과를 MEM_ECC_CORRECTED로 둔다.[@autosar-cp-sws-memorydriver-2025]

ECC 오류도 오류 반응처럼 시스템 수준에서 다룬다. 시스템의 ECC 오류 처리기는 Mem이 주는 `Mem_PropagateError` API를 불러 메모리 ECC 오류를 위 층에 넘길 수 있다.[@autosar-cp-sws-memorydriver-2025]

## MemIf

MemIf, Fee, Ea는 NvM에 16비트 블록 번호와 16비트 블록 오프셋으로 된 32비트 가상 선형 주소 공간을 준다.[@autosar-cp-sws-nvrammanager-2025] MemIf는 장치 번호(`DeviceIndex`)로 Fee나 Ea를 골라 NvM의 요청을 넘긴다. 메모리 추상화 모듈이 하나만 구성되면 MemIf는 `DeviceIndex`를 무시하고, MemIf API를 그 모듈의 API로 옮기는 매크로 묶음으로 구현된다. Fee와 Ea의 쓰기 서비스는 설정한 논리 블록 전체에만 작동한다.[@autosar-cp-sws-memoryabstractioninterface-2025]

## Fee와 Ea

Fee는 플래시 위에 EEPROM을 흉내 내어, MemIf를 거쳐 두 종류의 장치에 같은 방식으로 접근하게 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] Mem 명세는 섹터를 가장 작은 지우기 단위로 정하며, 어떤 메모리 기술은 쓰기 전에 따로 지워야 한다.[@autosar-cp-sws-memorydriver-2025]

TI 앱노트에 따르면 플래시로 EEPROM을 흉내 내는 루틴은 대개 값이 바뀔 때마다 새 항목을 연결 리스트에 덧붙여 쓰고, 섹터가 이런 항목으로 차면 가장 새 항목만 다른 섹터로 옮긴 뒤 앞 섹터를 지운다.[@ti-spna139-2011]

Fee는 16비트 블록 번호와 16비트 오프셋을 합쳐 아래 드라이버에 넘길 물리 주소를 얻는다. 플래시가 설정한 쓰기 횟수를 견디지 못하면, Fee는 쓰기를 여러 메모리 영역에 나눠 한 자리가 지나치게 지워지지 않게 한다. Fee는 블록 쓰기를 시작할 때 블록을 깨짐으로 표시하고, 성공적으로 끝나면 표시를 거둔다. 그래서 쓰기가 중단된 블록을 알아채고, 그런 블록의 job 결과로 MEMIF_BLOCK_INCONSISTENT를 돌려준다.[@autosar-cp-sws-flasheepromemulation-2025]

Ea는 EEPROM 장치의 주소 체계와 분할을 감추고, 위 층에 가상 주소 체계와 분할을 준다. Ea도 16비트 블록 번호와 16비트 블록 오프셋을 합쳐 EEPROM 물리 주소를 얻는다. 또 Fee처럼 쓰기가 중단된 블록을 알아채, 그런 블록의 job 결과로 MEMIF_BLOCK_INCONSISTENT를 돌려준다.[@autosar-cp-sws-flasheepromemulation-2025][@autosar-cp-sws-eepromabstraction-2025]

NvM 블록에서 Fee와 Ea의 블록 번호를 구하는 방법은 [[nvram-block#블록 번호|NVRAM 블록]]에서 다룬다.

## 비동기 job

NvM은 요청을 큐를 쓰는 비동기 인터페이스로 받아, 우선순위에 따라 하나씩 처리한다.[@autosar-cp-sws-nvrammanager-2025] Fee와 Ea의 쓰기 API는 요청을 받으면 인자를 모듈 안에 복사하고 job을 시작해 둔 뒤 E_OK로 돌아온다.[@autosar-cp-sws-flasheepromemulation-2025][@autosar-cp-sws-eepromabstraction-2025]

NvM, Fee, Ea의 job은 각 모듈의 MainFunction이 처리한다. 세 모듈의 MainFunction은 모두 설정한 주기마다 불리고, Fee의 내부 관리 작업은 `Fee_MainFunction` 호출 여러 번에 걸칠 수 있다.[@autosar-cp-sws-nvrammanager-2025][@autosar-cp-sws-flasheepromemulation-2025][@autosar-cp-sws-eepromabstraction-2025]

NvM은 NVRAM 블록마다 설정한 장치 ID로 메모리 추상화 모듈을 고르고, MemIf를 거쳐 Fee나 Ea에 접근한다.[@autosar-cp-sws-nvrammanager-2025] Fee나 Ea는 MemAcc에 job을 내리고, MemAcc의 MainFunction이 Mem에 job을 내린다. Job이 끝나면 MemAcc가 Fee나 Ea의 완료 notification 함수를 부르고, Fee나 Ea는 설정되어 있으면 NvM의 완료 notification 함수를 부른다.[@autosar-cp-sws-flasheepromemulation-2025][@autosar-cp-sws-eepromabstraction-2025]

![[diagrams/memory-stack-job-sequence.svg]]

## BndM

AUTOSAR R25-11의 Bulk NvData Manager 명세는 **BndM**을 자주 읽히지만 드물게 고쳐지는 큰 비휘발성 데이터를 위한 모듈로 정의한다. 예로 생산 때 차량마다 계산해 저장하는 variant coding 데이터가 있다. BndM은 NvM과 달리 데이터를 플래시에서 직접 읽는 API를 주어 [[nvram-manager#동기화|RAM mirror]]를 두지 않는 대신, 쓰기가 더 복잡하다. 이 명세는 고성능 마이크로컨트롤러가 갖춘 A/B 섹터 전환 기능으로만 쓰기를 지원하므로, BndM은 이 기능이 있는 아키텍처에서만 사용할 수 있다.[@autosar-cp-sws-bulknvdatamanager-2025]

BndM은 블록을 포인터로 바로 접근할 수 있는 메모리에 두고, `BndM_GetBlockPtr`는 지금 활성인 파티션에 있는 블록의 기준 포인터를 준다. 플래시를 어떻게 관리할지는 벤더가 정하지만, 기본 생각은 데이터 블록의 A/B 전환이다. 데이터 전체를 파티션 A에 두고, `BndM_WriteStart`가 비어 있는 파티션 B를 준비한다. `BndM_WriteBlock`은 고친 블록을 파티션 B에 쓰고, `BndM_WriteFinalize`는 고치지 않은 블록을 파티션 B로 복사해 일관되게 만든 뒤 활성 파티션을 B로 바꾼다. 준비와 블록 쓰기가 끝나면 BndM은 `BndM_MainFunction`의 context에서 사용자의 완료 callback을 부르고, 마무리가 끝나면 마무리 완료 callback을 부른다.[@autosar-cp-sws-bulknvdatamanager-2025]

![[diagrams/bndm-ab-partition-write.svg]]

BndM을 쓰는 예에서 쓰기는 외부 진단 요청 [[uds#서비스|WriteDataByIdentifier]]로 시작된다. Dcm(Diagnostic Communication Manager)이 받은 직렬화 데이터를 [[autosar-transformer|transformer]]로 풀어 `BndM_WriteStart`, `BndM_WriteBlock_<shortname>`, `BndM_WriteFinalize`를 차례로 부른다. [[autosar-software-component|SW-C]]는 `BndM_GetBlockPtr`로 데이터를 읽고, BndM은 MemIf와 Fee를 거치지 않고 Mem으로 플래시에 접근한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

NvM, BndM을 포함한 메모리 관리자 셋을 견주면 아래와 같다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

- NvM은 오류 정보, 특수 설정, 상태, 진단 데이터 같은 모듈 데이터를 저장한다. 여러 BSW와 SW-C가 함께 읽고 쓰며, 대개 시동 때 읽고 종료 때 쓰지만 정상 동작 중에도 읽고 쓸 수 있다. 사용자마다 바이트에서 몇 KiB를 다룬다. 메모리에 직접 접근하거나 SPI(Serial Peripheral Interface)처럼 간접으로 접근하며, 같은 하드웨어 구역에 쓰는 동안 읽기가 안 될 수 있어 늘 데이터를 버퍼에 둔다. 하드웨어의 예는 내부 데이터 플래시(Fee를 거쳐)와 외부 EEPROM·데이터 플래시다.
- BndM은 차량별 데이터를 저장한다. 쓰기는 정비소 같은 통제된 환경에서 진단으로만 아주 드물게 하고, 여러 SW-C가 포인터로 함께 바로 읽는다. 크기는 대개 여러 KiB다. 하드웨어의 예는 내부 데이터 플래시와 코드 플래시다.
- FOTA(Firmware Over the Air) 관리자는 차종별 데이터나 코드를 저장하며, 사용자는 대개 하나이고 크기는 MiB 단위다. 끊고 선점할 수 있는 갱신 절차로 새 데이터를 이를테면 여러 주행 사이클에 걸쳐 백그라운드에서 쓰고, 쓰는 동안 읽을 수 있어야 한다. 하드웨어의 예는 내부·외부 코드 플래시다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]
