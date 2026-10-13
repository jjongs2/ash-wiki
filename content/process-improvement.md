---
title: 프로세스 개선
tags:
  - process/sw-process
verified: 2026-10-12
---

ISO/IEC 33001:2015는 **프로세스 개선**(process improvement)을 조직 프로세스의 품질을 사업 요구와 다른 관련 당사자의 요구에 맞춰 높이려고 하는 조치로 정의한다.[@iso-iec-33001-obp-2015]

## Process Improvement 프로세스

[[automotive-spice|ASPICE]] 4.1은 프로세스 개선을 PIM.3(Process Improvement) 프로세스로 둔다. PIM.3의 목적은 조직이 쓰는 프로세스를 통해 조직의 효과성과 효율을 계속 높이고, 프로세스를 사업 요구에 맞추는 것이다.[@vda-automotive-spice-pam-4-1-2026]

PIM.3은 다음 여덟 BP(base practice)를 둔다.[@vda-automotive-spice-pam-4-1-2026]

| BP  | 이름                                        | 내용                                                                                        |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| BP1 | Establish a commitment                      | 개선 인력을 지원하고, 개선 조치를 이어 가는 데 필요한 자원과 수단을 주겠다는 의지를 세운다. |
| BP2 | Identify improvement measures               | 프로세스 수행을 분석해 문제를 찾고, 변경 근거를 갖춘 개선 기회를 끌어낸다.                  |
| BP3 | Establish process improvement goals         | 기존 프로세스의 현재 상태를 분석하고 개선 목표를 세운다.                                    |
| BP4 | Prioritize the improvements                 | 개선 목표와 개선 조치의 우선순위를 정한다.                                                  |
| BP5 | Define process improvement measures         | 프로세스 개선 조치를 정의한다.                                                              |
| BP6 | Implement the process improvement measures  | 개선을 프로세스에 구현해 적용하고, 프로세스 문서를 갱신하고, 필요하면 사람을 교육한다.      |
| BP7 | Confirm the process improvements            | 프로세스 구현의 효과를 살피고 재어, 정한 개선 목표를 이뤘는지 확인한다.                     |
| BP8 | Communicate the results of the improvements | 개선에서 얻은 지식과 개선 구현의 진행을 영향을 받는 모든 당사자에게 알린다.                 |

BP3의 Note 7은 프로세스의 현재 상태를 정하는 수단으로 [[process-assessment|프로세스 평가]]를 제시한다.[@vda-automotive-spice-pam-4-1-2026]

## ISO/IEC TR 33014

ISO/IEC TR 33014:2013은 지속적 개선 활동의 하나로 프로세스 개선을 수행하는 완전한 틀과 방법 안에서 프로세스 평가를 쓰는 지침을 제시한다. 프로세스 개선을 전략(무슨 목표를 왜 이룰지), 전술(목표를 어떻게 이룰지), 운영(개선을 어떻게 수행할지)의 세 수준으로 다룬다. 지속적 프로세스 개선을 성공시키는 능력인 개선 능력(improvability)을 강화하고 유지하는 지침도 제시하고, 개선 능력을 조직 관점과 프로젝트 관점에서 다룬다.[@iso-iec-tr-33014-2013]

## 틀 기반 방법

SWEBOK V4.0a에 따르면 실행한 프로세스는 무엇이든 개선할 수 있다는 생각은 Shewhart와 Deming의 [[pdca-cycle|PDCA]] 패러다임에 이미 있었고, [[software-engineering|소프트웨어 공학]] 프로세스에도 여러 접근이 나왔다. 평가 방법 가운데 일부는 [[process-assessment#프로세스 모델|프로세스 참조 모델]]과 평가 모델을 쓰는 틀에 기댄다. 예로 CMM(Capability Maturity Model), [[cmmi|CMMI]], SPICE라고도 부르는 [[process-assessment#ISO/IEC 330xx 계열|ISO/IEC 330xx 계열]]을 든다. 이 계열의 평가는 지속적 개선을 꾀한다는 생각을 바탕에 둔다.[@ieee-swebok-v4-0a-2026]

## 회고

회고(retrospective)는 지속적 개선을 이루는 수단으로 쓰인다.[@ieee-swebok-v4-0a-2026][@istqb-ctfl-syllabus-2024] SWEBOK V4.0a에 따르면 [[scrum|Scrum]] 같은 [[agile-software-development|애자일]] 방법은 반복마다 끝에 회고를 둔다. 회고에서는 무엇이 잘되고 무엇이 잘되지 않았는지와 그 까닭을 분석하고, 배우고 개선할 조치를 정한다. 그렇게 팀은 지속적인 학습의 고리 안에 있게 된다.[@ieee-swebok-v4-0a-2026]
