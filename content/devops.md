---
title: DevOps
tags:
  - process
verified: 2026-10-03
---

ISO/IEC/IEEE 24765 용어집은 IEEE 2675-2021의 정의를 따라 **DevOps**를, 소프트웨어와 시스템 제품·서비스를 명세하고, 개발하고, 운용하고, 생명주기의 모든 면을 계속 개선하려고 관련 이해관계자 사이의 소통과 협업을 낫게 하는 원칙과 실천의 집합으로 정의한다.[@ieee-cs-sevocab-2026]

## 표준

IEEE 2675-2021은 시스템과 애플리케이션을 신뢰할 수 있고 안전하게 빌드하고, 패키징하고, 배포하는 기술 원칙과 프로세스를 정한다.[@ieee-2675-2021] ISO/IEC/IEEE 32675:2022는 소프트웨어 생명주기 프로세스를 정의하고 통제하고 개선하려고 DevOps를 구현하는 요구사항과 지침을 준다.[@iso-iec-ieee-32675-2022] 이 표준은 IEEE Computer Society의 위원회가 IEEE 2675-2021로 만든 것을, ISO/IEC JTC 1/SC 7이 ISO와 IEEE의 PSDO(Partner Standards Development Organization) 협약에 따른 신속 절차로 채택한 것이다.[@iso-iec-ieee-32675-obp-2022]

## 목적

SWEBOK V4.0a에 따르면 전통적인 [[software-process|소프트웨어 프로세스]]에서는 개발 팀이 배포할 준비가 된 애플리케이션을 운영 팀에 넘기고, 운영 팀이 대개 손으로 배포해 시간과 품질 양쪽에서 비효율적이었다.[@ieee-swebok-v4-0a-2026] DoD의 보고서 The State of DevSecOps(2025)에 따르면 DoD에서 소프트웨어 개발자는 소프트웨어를 만들고 인도해 임무 요구를 맞추는 속도를 가장 먼저 따지고, IT(information technology) 운영은 모든 이해관계자가 쓰는 인프라의 안정성, 접근성, 가용성을 주된 목표로 둔다.[@dod-state-of-devsecops-2025] DevOps는 개발과 운영 사이의 조직 벽(사일로)을 없애고 두 쪽의 협업을 늘리려 하며, 배포 단계를 자동화해 개발과 배포에 드는 시간을 줄이려 한다.[@ieee-swebok-v4-0a-2026][@nist-sp-800-204c-2022] DevOps라는 이름의 Dev는 개발(development)을, Ops는 운영(operations)을 가리킨다.[@nist-sp-800-204c-2022][@dod-devsecops-fundamentals-2-5-2024]

Flickr의 John Allspaw와 Paul Hammond는 Velocity 2009에서 하루 10번의 배포를 제목으로 내건 발표로, Flickr에서 개발과 운영이 도구와 문화로 협력하는 방식을 소개했다.[@flickr-10-deploys-per-day-2009]

SWEBOK V4.0a에 따르면 [[agile-software-development|애자일 개발]]은 잦은 반복으로 구현에 이른 피드백을 주고, DevOps는 운영에서 오는 피드백으로 개발자가 자기 코드가 운영 환경에서 어떻게 동작하는지 더 빨리 알게 한다. DevOps는 여러 변경을 묶어 정해진 간격으로 내는 릴리스 대신, 작은 변경 단위를 필요할 때 서로 독립적으로 내보내려 한다.[@ieee-swebok-v4-0a-2026]

![[diagrams/devops-feedback-loops.svg]]

## 원칙과 실천

IEEE 2675-2021은 DevOps 원칙으로 임무 우선(mission first), 고객 중심(customer focus), 왼쪽으로 당기기(left-shift), 모든 것의 지속화(continuous everything), 시스템 사고(systems thinking)를 든다.[@ieee-2675-2021]

DevOps의 실천에는 다음이 있다.[@ieee-swebok-v4-0a-2026][@nist-sp-800-204c-2022]

- 빌드, 테스트, 배포, 인프라 구성의 자동화
- [[continuous-integration|지속적 통합]]과 지속적 전달·배포
- 운영 중인 시스템의 모니터링과 로깅
- 운영에서 얻은 정보를 다음 개발에 되먹이는 피드백[@ieee-swebok-v4-0a-2026][@nist-sp-800-204c-2022]

보안을 이 흐름의 처음부터 모든 단계에 넣기를 강조하는 이름이 [[devsecops|DevSecOps]]다.[@ieee-swebok-v4-0a-2026][@nist-sp-800-204c-2022]
