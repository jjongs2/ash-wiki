---
title: Common Vulnerabilities and Exposures
aliases:
  - CVE
tags:
  - security/cybersecurity
verified: 2026-10-15
---

**CVE**(Common Vulnerabilities and Exposures) 프로그램은 공개된 [[vulnerability-management|취약점]]을 식별하고 목록으로 만드는, 국제적이고 공동체가 이끄는 활동이다.[@cve-glossary-2026] 목록의 취약점마다 CVE Record를 하나 둔다. 세계 여러 조직이 CVE 프로그램의 파트너로서 취약점을 찾아 번호를 매기고 CVE Record를 게시하며, 정보 기술과 [[cybersecurity|사이버보안]] 실무자는 CVE Record로 같은 취약점을 말하고 있는지 확인하고 대응을 조율한다.[@cve-overview-2026]

## CVE Record

**CVE ID**(CVE Identifier)는 공개된 취약점을 식별하는 영숫자 문자열이고, 그 꼴은 CVE Record Format이 정한다. **CVE Record**는 CVE ID에 연결된 취약점의 구조화된 데이터로, CNA(CVE Numbering Authority)가 쓴다. 게시된 CVE Record를 모두 모은 목록을 **CVE List**라 한다.[@cve-glossary-2026] CVE ID는 CVE Record의 번호 부분으로, `CVE-YYYY-NNNN` 꼴이다.[@cve-faqs-2026]

CVE Record는 다음 세 상태 가운데 하나에 있다.[@cve-glossary-2026]

- **Reserved**: CNA가 CVE ID를 예약한 상태로, CVE ID의 첫 상태다.
- **Published**: CNA가 CVE ID에 딸린 데이터를 채워 CVE Record를 게시한 상태
- **Rejected**: CVE ID와 CVE Record를 더는 쓰지 않아야 하는 상태. 사용자가 무효임을 알 수 있게 CVE List에 남겨 둔다.[@cve-glossary-2026]

CVE Record Format은 CNA가 CVE Record를 게시할 때 [[common-vulnerability-scoring-system|CVSS]] 점수를 넣을 수 있게 한다. CVSS는 FIRST가 운영하는, CVE와 별개의 프로그램이다.[@cve-related-efforts-2026]

## CVE Record 생명주기

CVE 프로그램은 CVE Record의 생명주기를 여섯 단계로 둔다.[@cve-process-2026]

1. 발견(Discover): 개인이나 조직이 새 취약점을 찾는다.
2. 보고(Report): 발견자가 CVE 프로그램의 파트너에게 취약점을 알린다.
3. 요청(Request): 파트너가 CVE ID를 매긴다.
4. 예약(Reserve): ID가 예약된다. 이것이 CVE Record의 첫 상태로, 이해관계자는 이 ID로 취약점의 초기 조정과 관리를 하지만 CNA는 아직 취약점을 공개할 준비가 되지 않은 상태다.
5. 제출(Submit): 파트너가 영향받는 제품, 영향받거나 고쳐진 제품 버전, 취약점의 유형이나 근본 원인이나 영향, 하나 이상의 공개 참고 자료 같은 세부를 낸다.
6. 게시(Publish): 최소 필수 데이터 요소가 갖춰지면 책임 CNA가 CVE Record를 CVE List에 게시하고, 누구나 이를 보고 내려받을 수 있다.[@cve-process-2026]

## CNA

**CNA**는 정해진 범위(scope) 안에서 CVE ID를 정기적으로 매기고 그에 맞는 CVE Record를 게시할 권한과 책임을 받은 주체다.[@cve-glossary-2026] CNA는 벤더, 연구자, 오픈소스, CERT, 호스팅 서비스, 버그 바운티 제공자, 컨소시엄 같은 조직으로, CVE 프로그램의 승인을 받아 저마다의 범위 안에서 CVE ID를 매기고 CVE Record를 게시한다.[@cve-cnas-2026]

자동차 분야에서는 연구자 조직인 ASRG(Automotive Security Research Group)가 CNA로 참여하고, 다른 CNA의 범위에 들지 않는 모든 자동차와 관련 인프라의 취약점을 범위로 둔다.[@cve-partner-asrg-2026]

## 구조

CVE Board는 CVE 프로그램의 운영을 감독하고 전략적 방향을 정한다. Secretariat는 CVE Board에 행정·실무 지원을 하고 프로그램의 인프라를 유지하며, 2026년 10월 기준 MITRE가 맡는다.[@cve-structure-2026]

CVE ID를 매기고 CVE Record를 게시하는 일은 CVE Board가 정한 계층 구조 안에서 이뤄진다. **TL-Root**(Top-Level Root)는 CVE Board에 바로 보고하고, 하나 이상의 Root와 CNA를 둘 수 있는 자기 계층을 관리한다. 계층 안에서 Root는 관리 기능을, CNA는 ID를 매기고 Record를 게시하는 운영 기능을 맡는다. 2026년 10월 기준 TL-Root는 CISA와 MITRE 둘이다.[@cve-structure-2026]

![[diagrams/cve-program-hierarchy.svg]]

## 역사

CVE의 공동 창안자인 MITRE의 David E. Mann과 Steven M. Christey는 1999년 1월 미국 Purdue 대학에서 열린 2nd Workshop on Research with Security Vulnerability Databases에서 백서 Towards a Common Enumeration of Vulnerabilities로 CVE List의 처음 개념을 내놓았다. 이 개념에서 작업 그룹이 꾸려지고 첫 CVE Record 321개가 만들어졌으며, CVE List는 1999년 9월 공개됐다. CVE 프로그램은 2016년부터 CNA로 참여하는 조직을 적극 늘려 왔고, 모든 CVE Record는 CNA가 올린다.[@cve-history-2026]

처음에는 목록에 넣을지 검토 중인 후보의 번호에 `CAN-` 접두사를, 정식으로 받아들인 항목의 번호에 `CVE-` 접두사를 붙였으나, 2005년부터는 모든 CVE Record가 `CVE-` 접두사를 쓴다.[@cve-faqs-2026]

## CWE

**CWE**(Common Weakness Enumeration)는 공동체가 만드는, 흔한 소프트웨어·하드웨어 약점(weakness)의 목록이다.[@cwe-about-2026] 약점과 취약점의 정의는 [[vulnerability-management#취약점과 약점의 정의|취약점 관리]]에서 다룬다.

CWE와 CVE는 사명이 따로이면서 서로 보완하는 자매 프로그램이다. 한 종류의 약점이 여러 제품에서 여러 취약점의 근본 원인이 될 수 있어서, CWE 항목 하나가 여러 CVE Record의 근본 원인인 경우가 많다.[@cwe-faq-2026] 첫 CWE 목록과 그 분류 체계는 2006년에 나왔다.[@cwe-history-2026]
