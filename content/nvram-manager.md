---
title: NVRAM Manager
tags:
  - platform/autosar
aliases:
  - NvM
verified: 2026-09-30
---

**NVRAM Manager**(NvM)는 [[autosar-memory-stack|AUTOSAR 메모리 스택]]의 맨 위 층인 Memory Services에서 비휘발성 데이터를 관리하는 모듈이다.[@autosar-cp-exp-layeredsoftwarearchitecture-2025] [[autosar-software-component|SW-C]]와 BSW(Basic Software) 모듈은 [[nvram-block|NVRAM 블록]] 단위로 NvM에 읽기와 쓰기를 요청하고, NvM은 요청을 MemIf(Memory Abstraction Interface)로 내려 비휘발성 메모리와 RAM 사이에서 블록을 옮긴다.[@autosar-cp-sws-nvrammanager-2025]

## Job 큐와 우선순위

NvM은 비동기 단일 블록 요청을 큐에 넣고, `NvM_MainFunction`에서 하나씩 차례로 처리한다.[@autosar-cp-sws-nvrammanager-2025]

우선순위 처리(`NvMJobPrioritization`)를 켜면 NvM은 블록마다 설정된 job 우선순위(`NvMBlockJobPriority`, 0에서 255)를 쓰고, 우선순위 0은 immediate 우선순위다. 이때 NvM은 큐를 둘 쓴다. 하나는 immediate 쓰기 job을, 다른 하나는 immediate 읽기·지우기를 포함한 그 밖의 모든 job을 담는다. Immediate 쓰기 job은 진행 중인 job을 끊고 먼저 처리되며, 끊긴 job은 그 뒤 다시 시작된다. 우선순위 처리를 끄면 immediate 쓰기 job을 지원하지 않고 모든 job을 온 순서대로 처리한다.[@autosar-cp-sws-nvrammanager-2025]

![[diagrams/nvm-job-queues.svg]]

## API configuration class

NvM은 API configuration class 1, 2, 3을 둔다. Class 1은 하드웨어 자원이 매우 적은 시스템을 위해 꼭 필요한 최소 API만 주고, class 2는 중간 집합을, class 3은 명세된 API를 모두 준다.[@autosar-cp-sws-nvrammanager-2025]

- **Class 1**: `NvM_Init`, `NvM_GetErrorStatus`, `NvM_SetRamBlockStatus`(`NvMSetRamBlockStatusApi`로 켰을 때만), `NvM_ReadAll`, `NvM_WriteAll`, `NvM_CancelWriteAll`을 준다. 블록 하나를 다루는 비동기 API는 하나도 주지 않는다. 그래서 큐가 필요 없고, immediate 데이터와 dataset 블록을 쓸 수 없다.
- **Class 2**: class 1에 `NvM_SetDataIndex`, `NvM_GetDataIndex`, `NvM_ReadBlock`, `NvM_WriteBlock`, `NvM_RestoreBlockDefaults`, `NvM_CancelJobs`, `NvM_ReadPRAMBlock`, `NvM_WritePRAMBlock`, `NvM_RestorePRAMBlockDefaults`, `NvM_ValidateAll`을 더한다.
- **Class 3**: class 2에 `NvM_SetBlockProtection`, `NvM_EraseNvBlock`, `NvM_InvalidateNvBlock`, `NvM_FirstInitAll`을 더한다.[@autosar-cp-sws-nvrammanager-2025]

## 단일 블록 요청과 다중 블록 요청

- **단일 블록 요청**: `NvM_ReadBlock`, `NvM_WriteBlock`, `NvM_RestoreBlockDefaults`, `NvM_EraseNvBlock`, `NvM_InvalidateNvBlock` 등은 NVRAM 블록 하나를 다루는 비동기 요청이다.
- **다중 블록 요청**: `NvM_ReadAll`은 시동 때 영구 RAM 블록이 설정된 블록들에 데이터를 채우고, `NvM_WriteAll`은 종료 때 영구 RAM 블록의 내용을 NV(Non-Volatile) 블록에 쓴다. 둘 다 [[basic-software-mode-manager|BswM]]이 부른다.[@autosar-cp-sws-nvrammanager-2025]

## 결과 조회

비동기 요청의 결과는 `NvM_GetErrorStatus`로 물어보거나(polling), job이 끝난 뒤 NvM이 부르는 블록별 콜백으로 알 수 있다. 요청 결과를 나타내는 NvM_RequestResultType은 uint8 기반 타입으로, 아래 값을 둔다. `0x07`은 쓰지 않는다.[@autosar-cp-sws-nvrammanager-2025]

| 이름                      | 값     |
| ------------------------- | ------ |
| NVM_REQ_OK                | `0x00` |
| NVM_REQ_NOT_OK            | `0x01` |
| NVM_REQ_PENDING           | `0x02` |
| NVM_REQ_INTEGRITY_FAILED  | `0x03` |
| NVM_REQ_BLOCK_SKIPPED     | `0x04` |
| NVM_REQ_NV_INVALIDATED    | `0x05` |
| NVM_REQ_CANCELED          | `0x06` |
| NVM_REQ_RESTORED_DEFAULTS | `0x08` |

## 동기화

NvM과 응용이 RAM 블록의 데이터를 주고받는 방식은 두 가지다.[@autosar-cp-sws-nvrammanager-2025]

- **Implicit synchronization**: 응용과 NvM이 같은 RAM 블록을 쓴다. 쓰기 요청 뒤에는 요청이 끝날 때까지 응용이 RAM 블록을 고치면 안 되지만 읽을 수는 있다. 읽기 요청과 기본값 복원 요청 뒤에는 끝날 때까지 RAM 블록을 읽지도 쓰지도 않는다.
- **Explicit synchronization**: NvM이 RAM mirror를 두고, NvM이 부르는 콜백으로 응용의 RAM 블록과 mirror 사이에서 데이터를 복사한다. 응용은 NvM이 복사 콜백을 부르기 전까지 RAM 블록을 고칠 수 있고, 쓰기 요청이면 콜백으로 복사가 끝난 뒤 요청이 끝나기 전이라도 RAM 블록을 다시 읽고 쓸 수 있다.[@autosar-cp-sws-nvrammanager-2025]

![[diagrams/nvm-implicit-explicit-sync.svg]]

## 블록 압축

NvM은 블록 데이터를 NV 메모리에 쓰기 전에 압축하는 블록 압축을 둔다. 주행 사이클 기록처럼 큰 블록에서 작은 부분만 바뀌는 경우를 위한 것으로, 블록 전체를 NV 메모리에 쓰지 않아 쓰기 횟수를 줄이는 것이 목적이다. 블록을 하위 블록 여럿으로 나눠 바뀐 하위 블록만 쓰거나 바뀐 차이만 쓸 수 있고, 어떤 압축 알고리즘이든 쓸 수 있다. 압축의 종류(블록 나누기, 압축, 차이)는 벤더가 정한다. 대신 데이터를 쓰고 읽는 데 실행 시간이 늘 더 든다. `NvMBlockUseCompression`이 참이면 NvM은 NV 메모리에 저장하는 데이터를 압축하며, 이 요구사항은 draft다.[@autosar-cp-sws-nvrammanager-2025]

## Service port

SW-C는 [[autosar-rte|RTE]]를 거쳐 NvM의 서비스를 쓴다. NvM은 `NvMBlockUsePort`가 켜진 NVRAM 블록마다 NvMService 인터페이스의 service port 하나를 두고, 포트마다 그 블록의 ID를 port-defined argument로 정해 둔다. 그래서 SW-C는 블록 ID를 인자로 넘기지 않는다.[@autosar-cp-sws-nvrammanager-2025]
