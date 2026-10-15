---
title: STRIDE
tags:
  - security/cybersecurity
verified: 2026-10-03
---

**STRIDE**는 Microsoft가 위협의 유형을 분류하는 데 쓰는 모델로, 위협을 여섯 범주로 나눈다.[@microsoft-tmt-threats-2022] 이름은 여섯 범주 Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege의 머리글자다.[@microsoft-msdn-stride-2006] Microsoft의 Loren Kohnfelder와 Praerit Garg는 1999년 사내 문서 "The threats to our products"에서 STRIDE를 내놓았다.[@microsoft-threat-modeling-devops-2022][@microsoft-threats-to-our-products-2009]

## 여섯 위협

아래 표의 설명은 Microsoft Threat Modeling Tool 문서를 따르고, 막는 속성은 위협마다 [[cybersecurity-property|보안 속성]]을 하나씩 짝지은 Microsoft의 2006년 MSDN Magazine 기사를 따른다.[@microsoft-tmt-threats-2022][@microsoft-msdn-stride-2006]

| 위협                   | 설명                                                                          | 막는 속성       |
| ---------------------- | ----------------------------------------------------------------------------- | --------------- |
| Spoofing               | 다른 사용자의 사용자 이름이나 비밀번호 같은 인증 정보를 불법으로 얻어 쓴다.   | Authentication  |
| Tampering              | 데이터베이스에 저장된 데이터나 열린 네트워크로 오가는 데이터를 악의로 바꾼다. | Integrity       |
| Repudiation            | 한 행위를 부인하고, 상대는 이를 반증할 수단이 없다.                           | Non-repudiation |
| Information disclosure | 접근 권한이 없는 사람에게 정보가 드러난다.                                    | Confidentiality |
| Denial of service      | 웹 서버를 잠시 쓸 수 없게 만드는 것처럼 정당한 사용자에게 서비스를 거부한다.  | Availability    |
| Elevation of privilege | 권한이 없는 사용자가 권한 있는 접근을 얻는다.                                 | Authorization   |

## 위협 모델링에서의 쓰임

Microsoft의 2006년 MSDN 기사에 따르면 STRIDE는 시스템을 구성 요소로 나누고, 요소마다 여섯 위협에 취약한지 분석해 완화하고, 남은 위협을 받아들일 수 있을 때까지 이를 되풀이하는 데 쓴다. 기사는 데이터 흐름도의 요소 종류마다 해당하는 위협을 표로 둔다.[@microsoft-msdn-stride-2006]

Microsoft Threat Modeling Tool은 Microsoft SDL(Security Development Lifecycle)의 핵심 요소이고, SDL의 위협 모델링은 설계를 분석하는 기법이다. 이 도구는 요소마다 STRIDE를 적용해(STRIDE per Element) 위협과 완화책을 안내한다.[@microsoft-tmt-overview-2022] 데이터 흐름도를 그리고 분석 화면을 열면, STRIDE를 쓰는 기본 템플릿으로 만든 위협 목록이 나온다.[@microsoft-tmt-getting-started-2022]

Microsoft patterns & practices의 2003년 위협 모델링 지침에 따르면 Microsoft는 위협의 리스크 등급을 매기는 데 DREAD(Damage potential, Reproducibility, Exploitability, Affected users, Discoverability) 모델을 쓴다.[@microsoft-pnp-threat-modeling-2003]

Islam 외는 2016년 논문에서 [[threat-analysis-and-risk-assessment#EVITA와 HEAVENS의 방법|HEAVENS]] 프로젝트의 결과를 바탕으로 차량용 리스크 평가 틀을 내놓으며, 보안 비전문가가 쓰기 쉽다는 까닭으로 위협 식별에 STRIDE를 쓰자고 했다.[@islam-risk-assessment-framework-2016]

Tony UcedaVélez와 Marco M. Morana는 STRIDE와는 별개인 위협 모델링 방법론 PASTA(Process for Attack Simulation and Threat Analysis)를 함께 만들었다.[@versprite-pasta-methodologies-2026]
