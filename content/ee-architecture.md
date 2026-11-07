---
title: E/E 아키텍처
tags:
  - hardware/ee-architecture
aliases:
  - 존 아키텍처
verified: 2026-09-29
---

차량의 **E/E 아키텍처**(electrical/electronic architecture)는 기능 도메인으로 [[electronic-control-unit|ECU]]를 묶는 도메인 아키텍처에서, 차량 안의 위치로 ECU를 묶는 존 아키텍처와 소수의 [[high-performance-computer|중앙 컴퓨터]]를 쓰는 구조로 옮겨 가고 있다.[@bosch-ee-architecture-2026][@ti-spry345-2024] Renesas 백서에 따르면 ECU가 늘면서 ECU를 기능 도메인이나 차량 안의 위치로 묶어 연결을 계층화하는 방식으로 복잡도를 줄인다.[@renesas-ipd-power-distribution-2025]

## 기능별 ECU

기능마다 ECU를 따로 두는 E/E 아키텍처를 **분산 아키텍처**(distributed architecture)라 부른다.[@guo-virtualisation-technologies-2025] NXP 백서에 따르면 백서가 나온 2017년 무렵 차량 네트워크의 ECU는 대개 엔진 제어, 윈도 리프터, 전동 조향처럼 응용 하나만 맡았고, 센서 처리와 알고리즘도 그 ECU 안에서 돌았다.[@nxp-fvnecua4wp-2017]

NXP 백서에 따르면 백서가 나온 2018년 무렵 차량에는 [[can|CAN]], [[lin|LIN]], [[flexray|FlexRay]], [[ethernet|이더넷]] 같은 여러 네트워크로 이어진 ECU가 100개 넘게 들 수 있었다.[@nxp-autogwdevwpus-2018] Bosch에 따르면 2026년 11월 기준 E/E 아키텍처는 제어기 100개 이상으로 이뤄진다.[@bosch-ee-architecture-2026][@bosch-vehicle-computer-2026] ECU 수가 늘수록 전원 분배, 네트워크, 배선이 복잡해진다.[@ti-spry345-2024][@renesas-ipd-power-distribution-2025]

ISO 17978-1:2026의 소개는 차량에 [[high-performance-computer|HPC]]가 들어오는 것이 고전적인 차량 E/E 아키텍처의 변화와 이어지고, 고전적인 분산 임베디드 ECU 아키텍처 밖에 도메인·존 기반 아키텍처도 있다고 제시한다.[@iso-17978-1-obp-2026]

## 도메인 아키텍처

ECU는 파워트레인, 바디, 인포테인먼트 같은 기능 도메인으로 나뉜다.[@guo-virtualisation-technologies-2025][@ti-sszt211-2023] **도메인 아키텍처**는 도메인마다 [[domain-controller|도메인 제어기]]를 두어 그 도메인의 기능을 모으고, 도메인 아래의 ECU는 도메인 제어기에 붙어 계층을 이룬다.[@renesas-ipd-power-distribution-2025][@ti-sszt211-2023]

TI 기술 기사는 ECU를 기능에 따라 다섯 도메인으로 나눈다.[@ti-sszt211-2023]

| 도메인                  | 맡는 것                                      |
| ----------------------- | -------------------------------------------- |
| 파워트레인              | 모터·배터리·엔진·변속기·조향 제어            |
| 첨단 운전자 보조 시스템 | 카메라·레이더·초음파 모듈과 센서 퓨전        |
| 인포테인먼트            | 헤드 유닛, 디지털 콕핏, 텔레매틱스 제어 모듈 |
| 바디 전자·조명          | 바디 제어 모듈, 도어 모듈, 전조등 제어 모듈  |
| 수동 안전               | 에어백·제동·섀시 제어 모듈                   |

도메인마다 네트워크가 다를 수 있어 [[gateway|게이트웨이]]가 도메인 사이를 잇고, [[gateway#중앙 게이트웨이|중앙 게이트웨이]] 모듈이 여러 도메인에 붙는다.[@nxp-autogwdevwpus-2018][@ti-sszt211-2023] NXP 백서에 따르면 도메인 기반 네트워크에서는 이더넷이 도메인 제어기들을 잇는 통신 백본이 된다. 센서 데이터 처리와 알고리즘을 도메인 제어기가 맡을 수 있어, 그 아래 ECU는 덜 강력한 마이크로컨트롤러를 쓸 수 있다.[@nxp-fvnecua4wp-2017]

TI 백서에 따르면 도메인 아키텍처에서는 차량 기능의 제어가 나뉘어 있어 여러 도메인에 걸친 기능의 소프트웨어를 개발하기 어렵고, 그 시스템들은 서로 다른 Tier-1 공급사가 서로 다른 반도체 회사의 프로세서와 MCU로 설계하고 만들어 소프트웨어를 갱신하기도 어렵다.[@ti-slyy236-2025]

## 존 아키텍처

**존 아키텍처**(zonal architecture)는 ECU를 기능 도메인이 아니라 차량 안의 물리적 위치로 묶는다.[@renesas-ipd-power-distribution-2025][@ti-sszt211-2023] 차량을 여러 구역으로 나누고, 구역마다 둔 [[zone-controller|존 제어기]]가 그 구역의 센서, 액추에이터, ECU를 중앙 컴퓨터에 잇는다.[@ti-ssztd02-2025][@infineon-zcu-2026]

존 아키텍처는 ECU 수를 줄인다.[@ti-spry345-2024][@bosch-zone-ecu-2026] Bosch에 따르면 존 아키텍처로 임베디드 제어기를 최대 20% 줄이고, 재료와 하드웨어를 아껴 비용을 최대 10% 낮출 수 있다.[@bosch-ee-architecture-2026]

존 아키텍처는 배선의 길이와 무게를 줄인다.[@bosch-ee-architecture-2026][@nxp-s32g2zoneconfs-2021] Renesas 백서에 따르면 가까이 있는 ECU를 그 구역의 존 제어기가 맡으므로 배선이 오가지 않아도 되어 배선량이 준다. 도메인 아키텍처는 비슷한 기능을 묶어 통합이 쉽고 가까운 기능 사이의 통신이 도메인 안에 머무르지만, 존 아키텍처에서는 같은 기능 도메인에 속한 ECU들이 서로 다른 위치에 있어 그 사이의 통신이 늘고, 존 제어기를 잇는 백본 네트워크의 통신 대역도 커진다.[@renesas-ipd-power-distribution-2025]

TI 자료에 따르면 존 아키텍처에서는 센서와 액추에이터가 중앙 컴퓨터와 독립해, 하드웨어와 소프트웨어의 갱신 주기를 따로 가져갈 수 있다.[@ti-spry345-2024][@ti-ssztd02-2025]

존 제어기들은 고속 이더넷 백본으로 중앙 컴퓨터에 이어진다.[@bosch-ee-architecture-2026][@ti-ssztd02-2025] 존 아키텍처는 차량 기능의 처리를 중앙 컴퓨터로 모으는 쪽으로 간다.[@ti-sszt211-2023][@bosch-zone-ecu-2026]

![[diagrams/domain-zonal-architecture.svg]]

TI 자료에 따르면 존 제어기는 스마트 센서·액추에이터와 [[can-fd|CAN FD]]나 LIN 같은 저속 버스로 잇고[@ti-spry345-2024], 대역폭이 작은 바디 모듈에는 CAN, LIN과 10 Mbit/s 이더넷([[10base-t1s|10BASE-T1S]])을 쓴다. 바디 도메인 기능은 대개 10 Mbit/s 이하면 되지만, 레이더, 라이다, 오디오, 카메라 같은 ADAS(Advanced Driver Assistance System)와 인포테인먼트 기능이 존 아키텍처에 들어오면 백본의 속도와 대역 요구가 커지거나 이더넷 백본의 토폴로지가 스타에서 링으로 바뀔 수 있다.[@ti-ssztd02-2025]

## 보안

Bosch에 따르면 존 아키텍처에서는 차량 시스템 사이의 물리적 분리가 줄어 소프트웨어 수준의 새 보안 대책이 필요하고, 차량 컴퓨터와 존 제어기의 칩에 [[hardware-security-module|하드웨어 보안 모듈]] 펌웨어로 보안 기능을 둔다.[@bosch-ee-architecture-2026]

TI 백서에 따르면 존 아키텍처는 입출력과 계산을 떼어 놓으므로, 차량 네트워크의 보안이 깨져 믿을 수 있는 통신을 할 수 없으면 그 구조 자체가 무너진다. 대역을 적게 쓰는 제어·센서 데이터는 IP 패킷을 지키는 기존 방식으로 보호할 수 있지만, 오디오나 카메라·레이더 데이터의 연속 스트림을 소프트웨어로 인증하면 프로세서 자원을 많이 써서 더 낮은 계층의 암호화와 인증이 필요하다. 그 예가 이더넷 MAC(Medium Access Control)이나 [[ethernet-phy|PHY]]에 넣어 회선 속도로 인증과 암호화를 하는 [[ieee-802-1ae|MACsec]]이다.[@ti-spry345-2024]

## 중앙 컴퓨터

Bosch에 따르면 [[software-defined-vehicle|SDV]]는 소프트웨어를 하드웨어에서 떼어 내, 차량의 동작과 기능이 대부분 소프트웨어로 정해지는 차량이며, [[over-the-air-update|OTA]] 업데이트로 기능을 더하거나 고친다.[@bosch-software-defined-mobility-2026]

기능을 중앙 컴퓨터에 모으면 OTA 소프트웨어 업데이트로 차량 기능을 바꾸거나 더하기 쉬워진다.[@bosch-ee-architecture-2026][@ti-slyy236-2025] 중앙 컴퓨터의 정의와 쓰이는 칩은 [[high-performance-computer|HPC]]에서 다루고, 기능을 모을 때 따지는 안전 등급과 간섭은 [[automotive-safety-integrity-level|ASIL]]과 [[freedom-from-interference|freedom from interference]]에서 다룬다.

## 이행

기존 차량 플랫폼에서는 E/E 아키텍처를 한 번에 바꾸지 않고 단계적으로 옮겨 간다.[@bosch-ee-architecture-2026][@ti-slyy236-2025] Bosch에 따르면 이때는 여러 도메인을 아우르는 차량 컴퓨터를 기존 도메인 아키텍처에 넣는다. 새 플랫폼에서는 차량 컴퓨터와 존 ECU로 된 존 아키텍처를 체계적으로 구현하는 편이 이점이 가장 크다.[@bosch-ee-architecture-2026]

TI 기술 기사에 따르면 존 아키텍처는 바디 도메인 데이터를 모으고 전원 분배를 넣으며 계산을 중앙으로 모으는 데서 시작해, 차츰 ADAS와 인포테인먼트 같은 다른 도메인의 데이터도 모으게 될 것이다. 기사가 개정된 2025년 무렵에는 실내 스피커의 오디오 재생이 이더넷 백본에 먼저 오른 도메인 간 데이터의 하나였다.[@ti-ssztd02-2025] TI 백서에 따르면 분산된 액추에이터·센서 ECU가 많은 바디 도메인은 존 아키텍처로 먼저 옮겨 갈 도메인의 하나이고, ADAS, 파워트레인, 섀시 제어를 존 아키텍처로 옮기는 데는 시간이 더 걸릴 수 있다.[@ti-spry345-2024]

TI 백서에 따르면 존 아키텍처에서 차량 기능을 다스리는 소프트웨어를 어디에 둘지는 OEM마다 다르며, 소프트웨어 제어를 모으는 방식으로는 중앙 컴퓨터에 모두 두는 것, 중앙 컴퓨터와 존 제어기가 나눠 맡는 것, 소수의 도메인 제어기와 존 제어기로 나누는 것 셋이 있다.[@ti-slyy236-2025]

백서가 나온 2025년 무렵 일부 OEM은 ADAS와 인포테인먼트처럼 계산이 많은 도메인을 중앙에 모으고, 그 밖의 실시간 제어는 존 제어기나 에지 ECU에 두었다. 컴퓨터 하나가 모든 차량 기능을 다스리는 중앙 집중 방식은 OEM에게 가장 매력적일 수 있지만, 능동 서스펜션이나 창 끼임 방지 같은 실시간 제어 루프의 지연과, 통신 링크가 끊길 때의 [[functional-safety|기능 안전]]에 과제가 따를 수 있다.[@ti-slyy236-2025]
