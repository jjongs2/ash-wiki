---
title: OSEK/VDX
tags:
  - platform/rtos
verified: 2026-09-30
---

**OSEK/VDX**는 차량의 분산 제어 유닛을 위한 개방형 구조를 산업 표준으로 만들려는 자동차 업계의 공동 프로젝트다. 그 프로젝트가 펴낸 명세의 묶음도 OSEK/VDX라 부른다.[@osek-binding-1-4-2-2004] OSEK은 독일어 "Offene Systeme und deren Schnittstellen für die Elektronik im Kraftfahrzeug"(차량 전자 장치를 위한 개방형 시스템과 그 인터페이스)의 머리글자이고, VDX는 Vehicle Distributed eXecutive의 머리글자다.[@osek-binding-1-4-2-2004][@osek-vdx-whats-osekvdx-2000]

OSEK/VDX에 따르면 OSEK은 1993년 5월 독일 자동차 업계의 공동 프로젝트로 시작됐다. 1994년에 프랑스의 PSA와 Renault가 OSEK에 합류하면서, 프랑스 자동차 업계의 비슷한 프로젝트인 VDX의 방식을 들여왔다. 1995년 10월 첫 워크숍에서 OSEK/VDX 그룹은 OSEK과 VDX를 맞춘 명세의 결과를 발표했다.[@osek-vdx-whats-osekvdx-2000]

## 명세

OSEK/VDX 명세는 운영체제(OSEK OS, OSEKtime OS), 통신인 COM(Communication)과 FTCom(Fault-Tolerant Communication), 네트워크 관리인 NM(Network Management), 시스템 기술 언어인 [[osek-implementation-language|OIL]], 디버깅·감시 도구용 인터페이스인 ORTI(OSEK/VDX Run Time Interface)를 다룬다. Binding 명세는 인터페이스가 서로 맞는 것을 보장하는 명세 판의 묶음을 표로 정하고, 공통 요구사항과 OSEK 공통 용어집을 담는다.[@osek-binding-1-4-2-2004]

이 가운데 Binding, OS, COM, NM, OIL 명세는 ISO 17356의 2부부터 6부까지가 됐다.[@osek-vdx-iso-standardisation-2002]

| 명세    | 다루는 것                                                                              | ISO 표준                                                             |
| ------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Binding | 서로 맞물려 쓰는 명세 판의 묶음, 공통 요구사항, 공통 용어집                            | ISO 17356-2[@osek-binding-1-4-2-2004][@iso-17356-2-2005]             |
| OS      | 단일 프로세서용 실시간 멀티태스킹 운영체제의 개념과 API(Application Program Interface) | [[iso-17356-3\|ISO 17356-3]][@osek-os-2-2-3-2005][@iso-17356-3-2005] |
| COM     | ECU 안과 ECU 사이의 메시지 전달 인터페이스                                             | ISO 17356-4[@osek-binding-1-4-2-2004][@iso-17356-4-2005]             |
| NM      | 네트워크의 구성 파악과 노드 감시                                                       | ISO 17356-5[@osek-binding-1-4-2-2004][@iso-17356-5-2006]             |
| OIL     | CPU 하나에 올라가는 애플리케이션의 구성을 기술하는 언어                                | ISO 17356-6[@osek-oil-2-5-2004][@iso-17356-6-2006]                   |

구현에 관한 사항은 OSEK/VDX 명세가 규정하지 않는다.[@osek-binding-1-4-2-2004] OS 명세와 OIL 명세는 개념을 기술한 문서이며, 특정 구현을 다룬 제품 설명이 아니다.[@osek-os-2-2-3-2005][@osek-oil-2-5-2004]

OSEK/VDX 명세의 판에는 ISO 17356 표준화 과정에서 바뀐 문구가 반영됐다.[@osek-binding-1-4-2-2004] OS 명세의 판과 ISO 17356-3의 관계는 [[iso-17356-3#OSEK/VDX OS 명세와의 관계|ISO 17356-3]]에서 다룬다.

OS 명세는 [[osek-os|OSEK OS]]에서 다룬다. OSEK/VDX NM은 노드를 직접 감시할 때 노드들을 논리 링으로 엮는다.[@osek-nm-2-5-3-2004] 논리 링은 [[bus-access-method|버스 접근 방식]]에서 다룬다.
