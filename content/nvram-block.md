---
title: NVRAM 블록
tags:
  - platform/autosar
verified: 2026-09-30
---

**NVRAM 블록**은 [[nvram-manager|NvM]]이 비휘발성 데이터 한 덩이를 관리하고 저장하는 데 필요한 구조 전체다. NVRAM 블록에는 NV 블록, RAM(Random-Access Memory) 블록, administrative block이 반드시 있고, ROM(Read-Only Memory) 블록은 없어도 된다. 구성은 설정 때 NVRAM block descriptor가 정한다. 응용은 NvM API에 블록 ID를 넘겨 다룰 NVRAM 블록 하나를 고른다.[@autosar-cp-sws-nvrammanager-2025]

## 기본 저장 객체

- **NV block**: 비휘발성 메모리에 있는 저장 객체로, 사용자 데이터에 더해 [[cyclic-redundancy-check|CRC]]와 NV block header를 선택적으로 담는다.
- **RAM block**: RAM에 있는 저장 객체로, 사용자 데이터에 더해 CRC와 NV block header를 선택적으로 담는다. NvM과 응용이 모두 데이터 영역에 접근한다. 영구 RAM 블록은 설정 때 주소가 정해지고, 임시 RAM 블록은 설정 때 주소를 알 수 없어 실행 중에 요청과 함께 NvM에 넘긴다.
- **ROM block**: ROM(플래시)에 있는 저장 객체로, NV 블록이 비었거나 깨졌을 때 쓸 기본값을 담는다.
- **Administrative block**: RAM에 있고, dataset 블록에 쓰는 블록 인덱스와 블록의 속성·오류·상태 정보를 담는다. RAM 블록이 유효한지, 마지막 요청의 결과, 쓰기 보호 속성이 여기에 든다. 응용에는 보이지 않고 NvM만 쓴다.[@autosar-cp-sws-nvrammanager-2025]

## Management type

NvM은 management type으로 `NVM_BLOCK_NATIVE`, `NVM_BLOCK_REDUNDANT`, `NVM_BLOCK_DATASET` 셋을 둔다. 어느 type이든 RAM 블록과 administrative block은 하나씩이다.[@autosar-cp-sws-nvrammanager-2025]

- **Native**: NV 블록 하나와 ROM 블록 0개나 1개를 둔다.
- **Redundant**: NV 블록 둘과 ROM 블록 0개나 1개를 둔다. 같은 내용을 두 NV 블록에 써서 데이터가 깨지는 데 버틴다.
- **Dataset**: 같은 크기의 NV 블록 1개 이상 256개 미만과 ROM 블록 0개 이상을 두며, 둘을 합친 수는 1개에서 255개다.[@autosar-cp-sws-nvrammanager-2025]

Redundant 블록을 읽을 때 첫째 NV 블록을 읽지 못하면 둘째 NV 블록을 읽는다. 둘 가운데 하나라도 RAM으로 옮기면 요청은 `NVM_REQ_OK`로 끝나고, 두 NV 블록이 모두 무효면 블록 전체를 무효로 한다. NV 블록 하나가 무효로 판정되면 NvM은 성한 쪽의 데이터로 그 NV 블록을 되살리려 하고, 되살리지 못하면 DEM(Diagnostic Event Manager)에 `NVM_E_LOSS_OF_REDUNDANCY`를 알린다.[@autosar-cp-sws-nvrammanager-2025]

Dataset 블록은 administrative block의 인덱스로 한 번에 원소 하나를 골라 읽고 쓴다. ROM 블록이 있으면 인덱스 범위가 ROM 블록까지 넓어져, 0부터 NV 블록 수에서 1을 뺀 값까지가 NV 블록이고 그 뒤가 ROM 블록이다. ROM 블록은 읽기만 할 수 있다.[@autosar-cp-sws-nvrammanager-2025]

## CRC

CRC를 쓸지(`NvMBlockUseCrc`)와 CRC의 종류(`NvMBlockCrcType`: `NVM_CRC8`, `NVM_CRC16`, `NVM_CRC32`)는 블록마다 설정한다. RAM 블록의 CRC는 짝을 이루는 NV 블록에 CRC가 있을 때만 쓸 수 있고, 종류도 NV 블록의 CRC와 같아야 한다.[@autosar-cp-sws-nvrammanager-2025]

NvM은 CRC를 설정한 블록을 쓸 때 CRC를 다시 계산해 NV 블록에 함께 저장한다. 읽을 때는 CRC를 다시 계산해 저장된 CRC와 비교하고, 맞지 않으면 기본값을 불러오거나, 기본값이 없으면 `NVM_REQ_INTEGRITY_FAILED`로 끝낸다. Immediate 우선순위 블록에 CRC를 설정하는 것은 권하지 않는다. CRC 계산이 main function 여러 번에 걸쳐 immediate 데이터 쓰기를 늦출 수 있기 때문이다.[@autosar-cp-sws-nvrammanager-2025]

## 블록 번호

Fee·Ea 블록 번호는 16비트다. `NvMDatasetSelectionBits`는 모든 블록에 공통인 설정으로, 블록 번호의 하위 몇 비트를 dataset이나 redundant 블록의 NV 블록을 고르는 데이터 인덱스로 쓸지 정한다. 블록마다 두는 `NvMNvBlockBaseNumber`는 SW-C가 쓰는 NvM 블록 ID와 Fee·Ea가 기대하는 블록 번호를 잇는 값으로, 블록 번호의 나머지 상위 비트에 놓인다. Dataset이나 redundant 블록이 없으면 `NvMDatasetSelectionBits`를 0으로, redundant 블록만 있으면 1로 둔다. 블록 번호는 base number를 데이터 인덱스 비트 수만큼 왼쪽으로 민 값에 데이터 인덱스를 더한 것으로, $\mathrm{FEE/EA\_BLOCK\_NUMBER} = (\mathrm{NvMNvBlockBaseNumber} \ll \mathrm{NvMDatasetSelectionBits}) + \mathrm{DataIndex}$다.[@autosar-cp-sws-nvrammanager-2025]

Fee와 Ea는 [[autosar-memory-stack#Fee와 Ea|AUTOSAR 메모리 스택]]에서 다룬다.
