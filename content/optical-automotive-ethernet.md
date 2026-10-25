---
title: 차량용 광 이더넷
tags:
  - network/ethernet
aliases:
  - 1000BASE-RHC
  - IEEE 802.3cz
verified: 2026-10-06
---

**차량용 광 이더넷**은 차량 안에서 광섬유를 매체로 쓰는 [[ethernet|이더넷]] 물리 계층이다. [[ieee-802-3|IEEE 802.3]]-2022는 이중 플라스틱 광섬유(POF, Plastic Optical Fiber)로 1000 Mbit/s를 내는 물리 계층 가운데 차량 응용의 요구사항에 맞춘 것으로 1000BASE-RHC를 둔다.[@ieee-802-3-2022] IEEE 802.3cz-2023은 IEEE 802.3-2022에 대한 개정으로, 차량 환경의 유리 광섬유 위에서 2.5, 5, 10, 25, 50 Gbit/s로 동작하는 물리 계층을 정한다.[@ieee-802-3cz-2023]

## 1000BASE-RHC

IEEE 802.3-2022는 이중 POF 위에서 1000 Mbit/s로 동작하는 PCS(Physical Coding Sublayer)와 PMA(Physical Medium Attachment)를 **1000BASE-H**라 부르고, 이 PCS와 PMA가 지원하는 PMD(Physical Medium Dependent)를 달리한 포트 타입 셋, 1000BASE-RHA, 1000BASE-RHB, 1000BASE-RHC를 두어 이를 **1000BASE-RHx**라 부른다. 셋 모두 약 650 nm의 붉은빛을 쓴다. 1000BASE-RHA는 가정과 소비자 네트워크, 1000BASE-RHB는 산업 응용, 1000BASE-RHC는 차량 응용의 요구사항에서 나왔다.[@ieee-802-3-2022]

![[diagrams/1000base-rhx-port-types.svg]]

1000BASE-RHC의 PMD는 리셉터클과 짝 플러그로 SI-POF(Step Index POF) 매체에 이어지고, PMD, 인라인 커넥터, 케이블은 Kojiri-safe, 먼지 보호, 진동 견딤, 인장 강도처럼 차량에 설치하는 데 필요한 요구를 맞춰야 한다. 1000BASE-H PCS는 [[mii#RMII, GMII, RGMII와의 차이|GMII]]의 송신 데이터를 65비트 블록으로 묶어 스크램블하고, MLCC(Multi-Level Coset Code)로 부호화해 PAM16(Pulse Amplitude Modulation 16) 심볼의 코드워드를 만든다. 심볼은 공칭 325 [[serial-communication#비트율|MBd]]로 보낸다.[@ieee-802-3-2022]

P802.3bv PAR(Project Authorization Request)는 POF가 설치가 쉽고, 차량과 산업 네트워크 같은 거친 환경에서 견고함으로 이점을 주며, 이들 네트워크가 이더넷으로 옮겨 가고 있어 많은 제조사에게 POF를 매체 선택지로 남기는 것이 필요하다고 밝혔다.[@ieee-802-3bv-par-2014]

## BASE-AU

IEEE 802.3cz-2023은 BASE-U PCS와 PMA에 다중 모드 유리 광섬유용 PMD를 붙여 차량 환경에서 동작하는 [[ethernet-phy|PHY]] 묶음을 **BASE-AU**라 부르고, 2.5GBASE-AU, 5GBASE-AU, 10GBASE-AU, 25GBASE-AU, 50GBASE-AU를 이에 넣는다. BASE-AU PMD는 50/125 µm 다중 모드 광섬유(OM3)에서 0.2 m부터 40 m까지를 동작 범위로 둔다.[@ieee-802-3cz-2023]

P802.3cz 수정 PAR(2022)는 차량 산업이 ADAS(Advanced Driver Assistance Systems)를 위해 이더넷으로 옮겨 가면서 1 Gbit/s를 넘는 속도가 필요해졌다고 밝혔다. IEEE 802.3 작업 그룹은 graded-index 유리 광섬유와 플라스틱 광섬유의 기술 수준이 다르고 유리 광섬유만 다루면 더 빨리 끝낼 수 있다고 보아, PAR의 제목, 범위, 필요성을 유리 광섬유만 다루도록 고쳤다.[@ieee-802-3cz-par-2022]

플라스틱 광섬유 위의 멀티기가비트 [[automotive-ethernet|차량용 이더넷]]은 P802.3dh 태스크 포스가 맡았고, 그 작업은 2024년 2월 16일 P802.3dh PAR가 철회되면서 끝났다.[@ieee-802-3dh-tf-2024]

## OPEN Alliance 명세

OPEN Alliance TC7은 차량용 광 멀티기가비트 이더넷을 다루며, 커넥터 인터페이스, 풋프린트, 시험 묶음처럼 IEEE 802.3cz의 범위 밖에 있는 차량 구현용 보충 문서를 만든다. 다루는 영역은 통신 채널, 커넥터·광케이블·광케이블 어셈블리·와이어 하네스, 측정 구성과 절차, 광전 요구사항, EMC(Electromagnetic Compatibility) 요구사항이다.[@open-alliance-tc7-2026]
