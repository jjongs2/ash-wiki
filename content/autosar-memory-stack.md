---
title: AUTOSAR 메모리 스택
tags:
  - platform/autosar
verified: 2026-09-30
---

**AUTOSAR 메모리 스택**은 [[autosar-classic-platform|AUTOSAR Classic Platform]]의 BSW(Basic Software)에서 내부·외부 비휘발성 메모리에 표준화된 접근을 주는 모듈들의 묶음이다. 위에서부터 [[nvram-manager|NvM]], MemIf(Memory Abstraction Interface), Fee(Flash EEPROM Emulation)와 Ea(EEPROM Abstraction), MemAcc(Memory Access), Mem(Memory Driver)이 층을 이룬다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-memoryabstractioninterface-2025] NvM은 메모리 스택의 유일한 접근점으로, 응용에 비휘발성 데이터를 한결같은 방식으로 주고 메모리의 위치와 성질을 감춘다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## 층

- **Memory Services**: NvM 한 모듈로 이루어지며, 비휘발성 데이터를 관리한다.
- **Memory Hardware Abstraction**: MemIf, Fee, Ea, MemAcc로 이루어진다. 메모리 장치가 칩 안에 있는지 보드 위에 있는지와 ECU 하드웨어 배치를 감추고, 위 층에 메모리 장치와 상관없는 인터페이스를 준다.
- **Memory Drivers**: Mem이 플래시, EEPROM(Electrically Erasable Programmable Read-Only Memory) 같은 메모리 장치를 읽고, 쓰고, 지우고, 비었는지 검사하는 기본 서비스를 준다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025][@autosar-cp-sws-memorydriver-2025]

![[diagrams/autosar-memory-stack-layers.svg]]

칩 안의 메모리 장치와 메모리 맵 외부 장치(예: 외부 플래시)의 드라이버는 [[microcontroller-abstraction-layer|MCAL]]의 Memory Drivers에 있다. 그 밖의 외부 메모리 장치(예: SPI(Serial Peripheral Interface)로 붙은 외부 EEPROM)의 드라이버는 [[ecu-abstraction-layer|ECU Abstraction Layer]]에 있으며, MCAL 드라이버를 거쳐 장치에 접근한다. AUTOSAR Classic Platform R25-11의 [[autosar-layered-architecture|Layered Software Architecture]]는 이전 릴리스에 있던 Fls(Flash Driver)와 Eep(EEPROM Driver)를 뺐다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025]

## MemIf

MemIf, Fee, Ea는 NvM에 16비트 블록 번호와 16비트 블록 오프셋으로 된 32비트 가상 선형 주소 공간을 준다.[@autosar-cp-sws-nvrammanager-2025] MemIf는 장치 번호(`DeviceIndex`)로 Fee나 Ea를 골라 NvM의 요청을 넘긴다. 메모리 추상화 모듈이 하나만 구성되면 MemIf는 `DeviceIndex`를 무시하고, MemIf API(Application Programming Interface)를 그 모듈의 API로 옮기는 매크로 묶음으로 구현된다. Fee와 Ea의 쓰기 서비스는 설정한 논리 블록 전체에만 작동한다.[@autosar-cp-sws-memoryabstractioninterface-2025]

## Fee와 Ea

Fee는 플래시 위에 EEPROM을 흉내 내어, MemIf를 거쳐 두 종류의 장치에 같은 방식으로 접근하게 한다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] Mem 명세는 섹터를 가장 작은 지우기 단위로 정하며, 어떤 메모리 기술은 쓰기 전에 따로 지워야 한다.[@autosar-cp-sws-memorydriver-2025]

TI 앱노트에 따르면 플래시로 EEPROM을 흉내 내는 루틴은 대개 값이 바뀔 때마다 새 항목을 연결 리스트에 덧붙여 쓰고, 섹터가 이런 항목으로 차면 가장 새 항목만 다른 섹터로 옮긴 뒤 앞 섹터를 지운다.[@ti-spna139-2011]

Fee는 16비트 블록 번호와 16비트 오프셋을 합쳐 아래 드라이버에 넘길 물리 주소를 얻는다. 플래시가 설정한 쓰기 횟수를 견디지 못하면, Fee는 쓰기를 여러 메모리 영역에 나눠 한 자리가 지나치게 지워지지 않게 한다. Fee는 블록 쓰기를 시작할 때 블록을 깨짐으로 표시하고, 성공적으로 끝나면 표시를 거둔다. 그래서 쓰기가 중단된 블록을 알아채고, 그런 블록의 job 결과로 MEMIF_BLOCK_INCONSISTENT를 돌려준다.[@autosar-cp-sws-flasheepromemulation-2025]

Ea는 EEPROM 장치의 주소 체계와 분할을 감추고, 위 층에 가상 주소 체계와 분할을 준다. Ea도 16비트 블록 번호와 16비트 블록 오프셋을 합쳐 EEPROM 물리 주소를 얻는다. 블록 쓰기를 시작할 때 블록을 불일치로 표시하고, 성공적으로 끝나면 일치로 되돌린다.[@autosar-cp-sws-eepromabstraction-2025]

NvM 블록에서 Fee와 Ea의 블록 번호를 구하는 방법은 [[nvram-block#블록 번호|NVRAM(Non-Volatile Random-Access Memory) 블록]]에서 다룬다.

## 비동기 job

NvM은 요청을 큐를 쓰는 비동기 인터페이스로 받아, 우선순위에 따라 하나씩 처리한다.[@autosar-cp-sws-nvrammanager-2025] Fee와 Ea의 쓰기 API는 요청을 받으면 인자를 모듈 안에 복사하고 job을 시작해 둔 뒤 E_OK로 돌아온다.[@autosar-cp-sws-flasheepromemulation-2025][@autosar-cp-sws-eepromabstraction-2025]

NvM, Fee, Ea의 job은 각 모듈의 MainFunction이 처리한다. NvM과 Fee의 MainFunction은 설정한 주기마다 불리고, Fee의 내부 관리 작업은 `Fee_MainFunction` 호출 여러 번에 걸칠 수 있다.[@autosar-cp-sws-nvrammanager-2025][@autosar-cp-sws-flasheepromemulation-2025][@autosar-cp-sws-eepromabstraction-2025]

NvM은 NVRAM 블록마다 설정한 장치 ID로 메모리 추상화 모듈을 고르고, MemIf를 거쳐 Fee나 Ea에 접근한다.[@autosar-cp-sws-nvrammanager-2025] Fee나 Ea는 MemAcc에 job을 내리고, MemAcc의 MainFunction이 Mem에 job을 내린다. Job이 끝나면 MemAcc가 Fee나 Ea의 완료 통지 함수를 부르고, Fee나 Ea는 설정되어 있으면 NvM의 완료 통지 함수를 부른다.[@autosar-cp-sws-flasheepromemulation-2025][@autosar-cp-sws-eepromabstraction-2025]

![[diagrams/memory-stack-job-sequence.svg]]
