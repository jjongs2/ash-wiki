---
title: 동적 메모리 할당
tags:
  - platform/rtos
verified: 2026-10-07
---

**동적 메모리 할당**은 실행 중에 메모리를 얻고, 다 쓴 뒤 돌려주는 일이다.[@renesas-res05b0008-2010][@micrium-ucos-iii-memory-management-2026] Renesas 앱노트에 따르면 MCU의 물리 메모리에서 프로그램 코드, 프로그램 데이터, 시스템 스택이 차지하고 남은 부분을 **힙**이라 하고, [[rtos|RTOS]] 커널은 흔히 힙에서 태스크의 데이터 공간을 동적으로 할당한다.[@renesas-res05b0008-2010]

## malloc과 free의 한계

µC/OS-III 문서에 따르면 임베디드 실시간 시스템에서 C 컴파일러의 `malloc()`과 `free()`를 쓰는 것은 위험할 수 있다. 빈 메모리 전체가 서로 이어지지 않은 작은 조각으로 쪼개지는 것을 **단편화**(fragmentation)라 하고, 단편화가 쌓이면 이어진 메모리 영역 하나를 얻지 못하게 될 수 있다. `malloc()` 요청을 채울 만큼 큰 빈 블록을 찾는 알고리즘 때문에 `malloc()`과 `free()`의 실행 시간은 대개 비결정적이다.[@micrium-ucos-iii-memory-management-2026]

![[diagrams/heap-fragmentation.svg]]

FreeRTOS 커널 책에 따르면 C 라이브러리의 `malloc()`과 `free()`는 작은 임베디드 시스템에 늘 있지는 않고, 구현이 비교적 클 수 있어 코드 공간을 차지하며, thread-safe한 경우가 드물다. 또 호출마다 실행 시간이 달라 결정적이지 않고, 단편화를 겪을 수 있어 FreeRTOS에 맞지 않을 수 있다.[@freertos-heap-memory-management-2026]

## 고정 크기 블록

Renesas 앱노트에 따르면 RTOS는 흔히 힙을 고정 크기 메모리 블록으로 나눠 두고, 태스크가 블록을 요청해 쓰다가 다 쓰면 풀에 돌려주게 한다.[@renesas-res05b0008-2010]

µC/OS-III는 `malloc()`과 `free()` 대신, 이어진 메모리 영역으로 만든 파티션에서 고정 크기 메모리 블록을 얻게 한다. 한 파티션의 블록은 크기가 모두 같고, 블록의 할당과 해제는 상수 시간에 결정적으로 이루어진다. 파티션은 대개 배열로 정적으로 잡지만, 해제하지 않는다면 `malloc()`으로 잡아도 된다. 응용은 블록 크기와 개수가 다른 파티션을 여럿 둘 수 있고, 꺼낸 블록은 반드시 그 블록이 나온 파티션에 돌려준다. 이 방식은 블록이 바닥날 수는 있어도 단편화를 겪지 않는다.[@micrium-ucos-iii-memory-management-2026]

CMSIS-RTOS2는 thread-safe한 고정 크기 메모리 블록인 메모리 풀을 정한다. 메모리 풀은 크기가 같은 빈 블록을 이은 연결 리스트로 볼 수 있어, `osMemoryPoolAlloc`은 리스트에서 블록 하나를 떼어 넘기고 `osMemoryPoolFree`는 블록을 리스트에 다시 잇는다. 메모리 풀은 동적으로 할당하는 힙보다 훨씬 빠르게 동작하고 단편화를 겪지 않으며, 할당과 해제 함수는 ISR(Interrupt Service Routine)에서도 부를 수 있다.[@arm-cmsis-rtos2-memory-pool-2026]

![[diagrams/memory-pool-free-list.svg]]

## FreeRTOS의 힙 구현

FreeRTOS에서 태스크, 큐, 세마포어 같은 커널 객체의 RAM(Random-Access Memory)은 컴파일할 때 정적으로 잡거나 실행 중에 동적으로 할당할 수 있다. 동적 할당은 설계와 계획의 수고를 줄이고 API(Application Programming Interface)를 단순하게 하며 RAM 사용량을 줄인다. 정적 할당은 더 결정적이고, 할당 실패를 처리할 필요와 힙 단편화의 위험을 없앤다.[@freertos-heap-memory-management-2026]

FreeRTOS는 메모리 할당을 핵심 코드가 아니라 포팅 계층에 둔다. 시스템마다 동적 할당과 타이밍 요구가 달라 한 알고리즘이 일부 응용에만 맞기 때문이다. 커널은 RAM이 필요하면 `malloc()` 대신 `pvPortMalloc()`을, RAM을 풀 때는 `free()` 대신 `vPortFree()`를 부른다.[@freertos-heap-memory-management-2026]

FreeRTOS는 `pvPortMalloc()`과 `vPortFree()`의 예시 구현 다섯을 둔다.[@freertos-heap-memory-management-2026]

| 구현   | 특징                                                                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| heap_1 | `vPortFree()`를 구현하지 않는다. 늘 결정적이고 메모리를 단편화하지 않는다.                                                                                                                                       |
| heap_2 | best-fit 알고리즘을 쓰고 이웃한 빈 블록을 합치지 않아 heap_4보다 단편화에 취약하다. 결정적이지 않지만 대부분의 표준 라이브러리 `malloc()`·`free()` 구현보다 빠르다. heap_4로 대체되어 새 설계에는 권하지 않는다. |
| heap_3 | 표준 라이브러리의 `malloc()`과 `free()`를 쓰되, 실행하는 동안 스케줄러를 멈춰 thread-safe하게 만든다.                                                                                                            |
| heap_4 | first-fit 알고리즘을 쓰고 이웃한 빈 블록을 하나로 합쳐 단편화 위험을 줄인다. 결정적이지 않지만 대부분의 표준 라이브러리 `malloc()`·`free()` 구현보다 빠르다.                                                     |
| heap_5 | heap_4와 같은 알고리즘으로, 떨어져 있는 여러 메모리 영역을 힙 하나로 묶는다.                                                                                                                                     |
