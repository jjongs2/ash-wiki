---
title: 소프트웨어 프로세스
tags:
  - process/sw-process
verified: 2026-10-02
---

SEI(Software Engineering Institute)는 1993년 CMM(Capability Maturity Model) 1.1에서 **소프트웨어 프로세스**(software process)를, 사람이 소프트웨어와 그에 딸린 산출물(프로젝트 계획, 설계 문서, 코드, 테스트 케이스, 사용자 매뉴얼 등)을 개발하고 유지보수하는 데 쓰는 활동, 방법, 실무, 변환의 집합으로 정의했다.[@paulk-capability-maturity-model-1993] [[iso-iec-ieee-12207|ISO/IEC/IEEE 12207]]:2026은 프로세스를 입력을 출력으로 바꾸는, 서로 관련되거나 상호작용하는 활동의 집합으로 정의한다.[@iso-iec-ieee-12207-obp-2026]

## 세 차원

SEI는 2010년 CMMI for Development 1.3에서 조직이 개선을 위해 흔히 붙잡는 세 차원으로 사람, 절차와 방법, 도구와 장비를 들고, 이 셋을 하나로 묶는 것이 조직의 프로세스라고 보았다.[@cmmi-product-team-cmmi-development-2010]

## 프로세스 모델과 조직의 프로세스

SEI는 CMMI for Development 1.3에서 CMMI 모델을 프로세스나 프로세스 기술서가 아니라 프로세스를 만들 때 쓰는 지침으로 내놓았다. CMMI 모델은 어떤 조직이나 프로젝트에 맞는 프로세스를 정하지 않고, 조직이 고른 프로세스를 계획하고 구현하는 데 필요한 최소 기준을 기술한다고 했다. SEI는 조직이 실제로 쓰는 프로세스가 응용 분야, 조직 구조와 규모 같은 여러 요인에 따라 달라진다고 보았다.[@cmmi-product-team-cmmi-development-2010]

Automotive SPICE 4.1은 PRM(Process Reference Model)과 PAM(Process Assessment Model)을 프로세스가 무엇을 왜 해야 하는지의 수준에 두고, 방법, 도구, 템플릿, 작업 흐름의 순서, 권한 정의 같은 '어떻게'는 정하지 않는다. '어떻게'는 회사, 조직 단위, 제품군 같은 맥락마다 따로 정하는 것으로 두며, 한 맥락의 방식을 다른 맥락에 그대로 옮겨 쓸 수는 없다고 본다.[@vda-automotive-spice-pam-4-1-2026]

## 생명주기와의 관계

ISO/IEC/IEEE 12207:2026은 생명주기 모델을 생명주기에 걸친 프로세스와 활동의 틀로 정의한다. 이 틀은 단계로 짤 수 있고, 소통과 이해의 공통 기준이 된다. 이 표준은 자기 프로세스를 소프트웨어 시스템과 그 요소에 생명주기 전체에 걸쳐 동시에, 반복해, 재귀적으로 적용할 수 있는 것으로 두고, 조직이 제품과 서비스에 맞는 생명주기 모델을 짜는 바탕으로 둔다. 그렇게 짠 생명주기 모델은 고른 프로세스를 쓰는 단계들로 이뤄진다.[@iso-iec-ieee-12207-obp-2026]

생명주기 모델의 종류는 [[software-development-life-cycle|SDLC]]에서 다룬다.
