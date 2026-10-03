---
title: 사이버보안 속성
tags:
  - security/cybersecurity
aliases:
  - CIA triad
verified: 2026-10-03
---

**사이버보안 속성**(cybersecurity property)은 보호할 가치가 있을 수 있는 속성이다. [[iso-sae-21434|ISO/SAE 21434:2021]]은 이렇게 정의하고, 그 예로 기밀성, 무결성, 가용성을 든다.[@iso-sae-21434-obp-2021] 사이버보안 속성을 지니는 자산(asset)과, 그 속성을 침해하는 위협 시나리오(threat scenario)의 정의는 [[threat-analysis-and-risk-assessment#용어|TARA]]에서 다룬다.

NIST는 기밀성, 무결성, 가용성 셋을 CIA triad라 부른다.[@nist-sp-1800-28-2024]

## 기밀성, 무결성, 가용성

FIPS 199는 미국 연방법(44 U.S.C. § 3542)의 정의를 따라 정보와 정보 시스템의 보안 목표 셋을 둔다.[@nist-fips-199-2004]

- **기밀성**(confidentiality): 정보에 접근하고 정보를 공개하는 것에 둔 인가된 제한을 지키는 것. 개인 프라이버시와 독점 정보를 보호하는 수단을 포함한다. 기밀성을 잃는 것은 정보가 인가 없이 공개되는 것이다.
- **무결성**(integrity): 정보가 부적절하게 수정되거나 파괴되지 않게 지키는 것. 정보의 부인 방지와 authenticity를 보장하는 것을 포함한다. 무결성을 잃는 것은 정보가 인가 없이 수정되거나 파괴되는 것이다.
- **가용성**(availability): 정보에 제때 믿을 수 있게 접근하고 정보를 쓸 수 있게 하는 것. 가용성을 잃는 것은 정보나 정보 시스템에 접근하거나 그것을 쓰는 일이 방해받는 것이다.[@nist-fips-199-2004]

## Authenticity, 부인 방지, 인가

- **Authenticity**: NIST SP 800-53 Rev. 5는 진짜이며 검증되고 신뢰될 수 있는 성질, 곧 전송, 메시지, 메시지 발신자가 유효하다는 확신으로 정의한다.[@nist-sp-800-53-r5-2020]
- **부인 방지**(non-repudiation): NIST SP 800-60 Vol. 1 Rev. 1은 정보를 보낸 쪽은 전달되었다는 증거를, 받은 쪽은 발신자의 신원 증거를 얻어, 누구도 나중에 그 정보를 처리했다는 것을 부인하지 못하게 하는 보증으로 정의한다.[@nist-sp-800-60-v1-r1-2008]
- **인가**(authorization): NIST SP 800-53 Rev. 5는 사용자, 프로그램, 프로세스에 주는 접근 권한, 또는 그 권한을 주는 일로 정의한다.[@nist-sp-800-53-r5-2020]

ISO/IEC 25010:2023의 제품 품질 특성 security와 그 부특성은 [[software-quality-model|소프트웨어 품질 모델]]에서 다룬다.[@iso-iec-25010-obp-2023]
