---
title: MPU
tags:
  - hardware/mcu-soc
verified: 2026-11-13
---

**MPU**(Memory Protection Unit)는 메모리를 주소 범위로 된 영역으로 나누고 영역마다 접근 권한을 정해, 권한을 벗어난 접근을 막는 하드웨어다.[@arm-dui-0553-2011][@infineon-aurix-tc3xx-cpu-training-2020] Arm Cortex-M4 사용자 가이드에 따르면 임베디드 운영체제는 대개 MPU로 메모리를 보호하고, 운영체제의 커널은 실행할 프로세스에 따라 MPU의 영역 설정을 바꿀 수 있다. Cortex-M4에서 프로그램이 MPU가 금지한 곳에 접근하면 프로세서는 MemManage fault를 일으킨다.[@arm-dui-0553-2011]

## 쓰는 곳

MPU로 메모리의 영역을 하나씩 제어하면, 응용이 여러 특권 수준을 쓰고 [[task|태스크]]마다 코드, 데이터, 스택을 나누어 지킬 수 있다. 이 가이드가 나온 2011년 무렵 이런 요구는 차량 같은 여러 임베디드 응용에서 중요해지고 있었다.[@arm-dui-0553-2011]

Infineon AURIX TC3xx의 CPU에서는 [[real-time-system|실시간 시스템]]의 태스크마다 쓸 메모리 자원을 정해 두고, 프로그램이 배정된 메모리 영역을 넘으면 메모리 보호가 막는다. 데이터 접근 권한은 쓰기 허가와 읽기 허가의 조합으로, 명령어 가져오기 권한은 접근 허가로 정한다. 데이터 범위 최대 18개와 코드 범위 최대 10개를 보호 세트 6개에 배정하고, 세트를 바꿔 권한을 빨리 전환한다.[@infineon-aurix-tc3xx-cpu-training-2020]

[[autosar-os|AUTOSAR OS]]의 메모리 보호는 [[autosar-os-application#Memory protection|memory protection]]에서 다룬다.

## 영역과 접근 권한

Arm Cortex-M4에서는 MPU가 영역 8개(0\~7)와 background region을 둔다. 영역이 겹치면 번호가 가장 큰 영역의 속성을 따른다. Background region은 기본 메모리 맵과 속성이 같지만 특권 소프트웨어만 쓸 수 있다. 명령어 접근과 데이터 접근은 같은 영역 설정을 쓴다.[@arm-dui-0553-2011]

![[diagrams/cortex-m4-mpu-region-overlap.svg]]

Armv7-M은 비특권 소프트웨어와 특권 소프트웨어를 나누는 실행 모델을 지원하려고 PMSAv7(Protected Memory System Architecture)을 두고, 그 시스템 주소 공간을 MPU가 지킨다. Armv7-M에서 MPU는 선택 사항이다. PMSAv7 영역의 크기는 $2^N$바이트이고 $N$은 5에서 32까지이며, 영역의 기준 주소는 영역 크기에 맞춰 정렬된다. 256바이트 이상인 영역은 크기가 같은 하위 영역 8개로 나뉘어, 하위 영역마다 따로 끌 수 있다. MPU의 접근 권한 필드 `AP`는 특권 접근과 비특권 접근에 저마다 접근 없음, 읽기 전용, 읽기·쓰기 가운데 하나를 준다. XN(Execute Never) 비트가 1인 영역에서는 명령어를 실행할 수 없고, 실행하려 하면 MemManage fault가 난다. Armv7-M의 MPU는 물리 주소에 대한 접근 권한을 다스리고, 주소 변환은 하지 않는다.[@arm-ddi-0403-2021]

Arm Cortex-R52에서는 영역마다 기준 주소(base address)와 끝 주소(limit address), 접근 권한, 메모리 속성을 정한다. 권한이 없는 접근은 permission fault가 된다. 한 MPU에서 영역 둘 이상에 걸리는 접근과, 어느 영역에도 걸리지 않으면서 background region도 쓸 수 없는 접근은 translation fault가 된다. 이 프로세서에는 주소 변환 기능이 없어 가상 주소와 물리 주소가 늘 같다.[@arm-100026-2024]

NXP의 SYSMPU(System Memory Protection Unit)는 기기 안에서 생기는 모든 메모리 참조의 접근을 다스린다. Region descriptor로 메모리 공간과 그 접근 권한을 정하고, 버스 마스터마다 접근 권한을 따로 줄 수 있다. 초기화한 뒤에는 시스템 버스의 트랜잭션을 지켜보며 적절한지 판단한다.[@nxp-mcuxpresso-sdk-sysmpu-2016]

## 가상화 지원

Arm Cortex-R52는 코어마다 [[hypervisor#AArch64의 가상화 지원|EL1]]이 다스리는 MPU와 EL2가 다스리는 MPU를 둔다. EL1이 다스리는 MPU에는 프로그래밍할 수 있는 영역이 16, 20, 24개 있고, EL2가 다스리는 MPU에는 선택에 따라 0, 16, 20, 24개 있다. EL2가 다스리는 MPU와 가상화를 켜면, EL0·EL1의 변환 체계(translation regime)를 쓰는 모든 접근이 두 MPU를 모두 거치고, 두 MPU의 속성 가운데 덜 허용하는 쪽을 따른다. 이 두 단계 보호로 [[hypervisor|하이퍼바이저]]가 EL0·EL1의 변환 체계를 계속 다스려 가상화를 지원한다. EL2의 변환 체계로 도는 소프트웨어에는 EL2가 다스리는 MPU만 쓰인다.[@arm-100026-2024]

![[diagrams/cortex-r52-el1-el2-mpu.svg]]
