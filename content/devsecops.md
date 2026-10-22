---
title: DevSecOps
tags:
  - sw-engineering
verified: 2026-10-03
---

**DevSecOps**는 소프트웨어 개발(Dev), 보안(Sec), 운영(Ops)을 하나로 묶는 실천이자 문화로, 보안을 [[software-development-life-cycle|SDLC]]의 모든 단계에 넣는다. DevSecOps는 보안 도구와 실천을 [[devops|DevOps]] 파이프라인에 넣고 자동화한다.[@nist-sp-800-204c-2022][@dod-devsecops-fundamentals-2-5-2024]

## 정의

DoD Enterprise DevSecOps Fundamentals는 DevSecOps를 소프트웨어 개발, 보안, 운영을 하나로 묶는 [[software-engineering|소프트웨어 공학]] 방법론, 실천, 도구의 조합으로 정의한다. DoD는 DevSecOps 문화로 옮겨 가는 원칙의 하나로, 보안을 끝에 덧붙이지 않고 처음부터 넣는 것을 든다.[@dod-devsecops-fundamentals-2-5-2024]

NIST SP 800-204C에 따르면 DevSecOps라는 말은 보안 팀의 역할과, 보안을 SDLC의 모든 단계에서 시험하고 넣어야 함을 강조하려고 만들어졌다. 이 말에는 업계 전체의 합의가 없고, 따로 이름을 둘 필요 없이 DevOps라는 이름을 계속 쓰는 쪽도 있다.[@nist-sp-800-204c-2022]

## 보안의 shift left

보안 활동을 SDLC의 앞쪽으로 당기는 것도 shift left라 한다.[@dod-devsecops-fundamentals-2-5-2024][@nist-sp-800-218-2022] NIST SP 800-218에 따르면 SDLC에서 보안을 일찍 다룰수록 같은 수준의 보안에 드는 노력과 비용이 줄고, 초기 보안 결함을 개발 후반이나 운영 중에 고쳐야 하는 [[software-maintenance#비용과 기술 부채|기술 부채]]도 줄어든다.[@nist-sp-800-218-2022] 테스트를 앞당기는 shift left 자체는 [[v-model#테스트 설계를 앞당김|V 모델]]에서, 결함을 늦게 찾을수록 커지는 비용은 [[defect-management#늦게 찾을수록 커지는 비용|결함 관리]]에서 다룬다.

SSDF(Secure Software Development Framework) 1.1을 담은 NIST SP 800-218은 어느 SDLC 모델에도 넣을 수 있는 상위 수준의 보안 소프트웨어 개발 실천의 묶음을 권고한다. 이 문서는 실천을 네 묶음으로 나누고, 묶음마다 조직이 할 일을 다음처럼 권고한다.[@nist-sp-800-218-2022]

| 묶음                              | 조직이 할 일                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| PO(Prepare the Organization)      | 조직 수준에서 사람, 프로세스, 기술이 보안 소프트웨어 개발을 할 준비를 갖춘다.         |
| PS(Protect the Software)          | 소프트웨어의 모든 구성 요소를 변조와 무단 접근에서 보호한다.                          |
| PW(Produce Well-Secured Software) | 릴리스에 보안 취약점이 최소인, 보안이 잘 된 소프트웨어를 만든다.                      |
| RV(Respond to Vulnerabilities)    | 릴리스에 남은 취약점을 찾아 알맞게 대응하고, 비슷한 취약점이 다시 생기지 않게 막는다. |

실천의 정의는 저마다 Practice(실천의 이름과 식별자, 설명), Tasks, Notional Implementation Examples, References를 둔다.[@nist-sp-800-218-2022]

2026년 10월 기준 SSDF 1.2를 담은 NIST SP 800-218 Rev. 1은 2025년 12월 17일에 나온 초안(Initial Public Draft)이다.[@nist-sp-800-218r1-ipd-2025] 최종판은 여전히 SSDF 1.1을 담은 SP 800-218(2022년 2월)이다.[@nist-sp-800-218-csrc-2022]

## 단계마다의 보안 활동

DevSecOps는 운영 중에도 시스템을 지속적으로 모니터링한다.[@nist-sp-800-204c-2022][@dod-devsecops-fundamentals-2-5-2024]

DoD의 DevSecOps Activities & Tools 가이드북이 생명주기 단계에 두는 보안 활동은 다음과 같다.[@dod-devsecops-activities-tools-2-2-2023]

| 보안 활동                                                                                           | 두는 단계 |
| --------------------------------------------------------------------------------------------------- | --------- |
| 위협 모델링                                                                                         | Plan      |
| IDE(Integrated Development Environment) 보안 플러그인의 커밋 전 [[static-analysis\|정적 코드 스캔]] | Develop   |
| 의존성 취약점 검사                                                                                  | Build     |
| SBOM(Software Bill of Materials)의 SCA(Software Composition Analysis)                               | Build 뒤  |
| DAST(Dynamic Application Security Testing)                                                          | Test      |
| [[penetration-testing\|침투 테스트]] 같은 수동 보안 테스트                                          | Test      |
| 배포 뒤 보안 스캔                                                                                   | Deploy    |
| 시스템 보안 모니터링                                                                                | Monitor   |
| RASP(Runtime Application Self-Protection)                                                           | Monitor   |

같은 가이드북은 [[software-review|코드 리뷰]]를 Develop 단계의 [[configuration-management|형상 관리]] 활동으로, [[regression-testing|회귀 테스트]]를 Build와 Test 단계의 테스트 활동으로 둔다.[@dod-devsecops-activities-tools-2-2-2023] NIST SP 800-204C에 따르면 정적 분석 도구는 IDE나 빌드 도구에, SCA 도구는 빌드 산출물을 받는 패키징 도구에 붙인다.[@nist-sp-800-204c-2022] 위협 모델링에서 STRIDE를 쓰는 방식은 [[stride#위협 모델링에서의 쓰임|STRIDE]]에서 다룬다.

## CI/CD 환경을 노리는 위협

NSA와 CISA는 2023년 6월 사이버보안 정보 시트 Defending Continuous Integration/Continuous Delivery (CI/CD) Environments를 펴내, [[continuous-integration|CI]]/CD 환경을 노리는 위협과 대책을 정리했다. 이 자료가 드는 위협은 다음과 같다.[@nsa-cisa-defending-ci-cd-2023]

- 안전하지 않은 코드(자체 코드와 서드파티 코드)
- 파이프라인 실행 오염(poisoned pipeline execution): 빌드 파이프라인 설정에 악성 코드나 명령을 넣어 빌드 중에 실행되게 하는 것
- 파이프라인 접근 통제의 부족
- 안전하지 않은 시스템 구성
- 안전하지 않은 서드파티 서비스의 사용
- 비밀 정보(개인 키, 비밀번호 등)의 노출: IaC(Infrastructure as Code) 템플릿에 접근 키나 비밀번호를 박아 두는 것 등[@nsa-cisa-defending-ci-cd-2023]

이 자료가 드는 대책은 다음과 같다.[@nsa-cisa-defending-ci-cd-2023]

- 강한 암호 알고리즘을 쓰고, 오래 쓰는 자격증명을 줄이며, 다요소 인증을 쓴다.
- 코드에 [[digital-signature|서명]]하고 CI/CD 과정 내내 서명을 검증하며, 모든 코드 변경에 두 사람 규칙을 적용한다.
- CI/CD 접근에 최소 권한을 적용하고, 비밀 정보를 평문으로 넘기거나 소프트웨어에 박아 두지 않고 비밀 관리 기능으로 다룬다.
- 개발 시스템과 CI/CD 도구를 최신으로 유지하고, 불필요한 애플리케이션을 지운다.
- 보안 스캔을 CI/CD 과정에 일찍 넣고, 신뢰할 수 없는 라이브러리와 도구를 제한한다. 보안 스캔에는 테스트 환경에 배포한 애플리케이션의 DAST도 든다.
- SBOM과 SCA로 서드파티·오픈소스 구성 요소를 추적하고, 감사 로그를 남긴다.[@nsa-cisa-defending-ci-cd-2023]
