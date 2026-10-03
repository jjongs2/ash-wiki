---
title: Uptane
tags:
  - security/ota
verified: 2026-10-03
---

**Uptane**은 지상 차량의 소프트웨어 업데이트를 지키는 보안 프레임워크다. 여러 종류의 침해에 버티는 것이 목표로, 공격자가 업데이트 메커니즘을 뚫으려면 모듈을 둘 이상 침해해야 하게 한다.[@uptane-standard-2-1-0-2023] Uptane은 [[the-update-framework|TUF]]의 기본 설계를 출발점으로 삼아 개발됐다.[@uptane-history-2026]

## 원 논문과 Uptane Standard

Kuppusamy 외는 자동차 고유의 취약점과 한계를 다루려고 TUF에 기능을 더해 Uptane을 만들었고, 2016년 escar Europe에서 발표했다.[@kuppusamy-uptane-2016] Kuppusamy, DeLong, Cappos는 2018년 IEEE Vehicular Technology Magazine에 Uptane을 다룬 글을 실었다.[@kuppusamy-uptane-customizability-2018]

Uptane Alliance는 2018년 IEEE-ISTO 아래 비영리 단체로 세워졌다. Uptane은 Standard 1.0.0을 낸 뒤 Linux Foundation의 Joint Development Foundation 프로젝트가 됐다.[@uptane-about-2026] Uptane Standard 1.0.0은 2019년 IEEE-ISTO 6100.1.0.0이라는 이름으로 Uptane Alliance가 펴냈고, 2.1.0은 Joint Development Foundation Projects, LLC, Uptane Series의 이름으로 나왔다.[@uptane-standard-2-1-0-2023][@uptane-standard-1-0-0-2019] 판은 2019년 1.0.0, 2021년 1.1.0과 1.2.0, 2022년 2.0.0, 2023년 2.1.0 순으로 나왔다.[@uptane-history-2026]

## 두 저장소

Uptane Standard 2.1.0은 저장소 둘을 정한다.[@uptane-standard-2-1-0-2023]

- **Image repository**: OEM(Original Equipment Manufacturer)이나 공급사가 올린 설치용 이미지와 그 [[digital-signature|서명]]된 메타데이터를 차량에 내준다. 주로 사람이 관리하고 드물게 갱신된다.
- **Director repository**: 차량 버전 매니페스트와 비공개 인벤토리 데이터베이스를 보고 어느 ECU에 어느 이미지를 설치할지 정하고, 그 지시를 담은 메타데이터를 그때그때 서명해 만든다. 대개 자동화된 온라인 프로세스가 다룬다.[@uptane-standard-2-1-0-2023]

Uptane Deployment Best Practices 2.1.0은 image repository의 root, targets와 위임 역할의 키를 오프라인에 두어, 저장소가 뚫려도 full verification을 하는 ECU에 곧바로 영향이 가지 않게 하기를 권한다. Director repository에는 timestamp, snapshot, targets 메타데이터를 온라인 키로 서명해 자동으로 곧바로 새 메타데이터를 만들고, root 메타데이터만 오프라인 키로 서명하기를 권한다.[@uptane-deployment-best-practices-2-1-0-2023]

## Primary ECU와 secondary ECU

Uptane Standard 2.1.0은 두 ECU의 일을 아래처럼 나눈다.[@uptane-standard-2-1-0-2023]

- **Primary ECU**는 자신과 secondary ECU의 몫으로 최신 메타데이터와 이미지를 받아 검증하고, secondary ECU에 시간, 메타데이터, 이미지를 보낸다.
- **Secondary ECU**는 primary ECU에게서 받은 메타데이터와 이미지를 설치하기 전에 스스로 검증한다.[@uptane-standard-2-1-0-2023]

![[diagrams/uptane-repositories-primary-secondary.svg]]

## Full verification과 partial verification

Uptane Standard 2.1.0은 primary ECU가 full verification을 하게 하고, secondary ECU는 할 수 있으면 full verification을, 못 하면 적어도 partial verification을 하게 한다.[@uptane-standard-2-1-0-2023]

- **Full verification**: 두 저장소의 root, timestamp, snapshot, targets 메타데이터를 차례로 검증한 뒤, 두 저장소의 targets 메타데이터가 같은 이미지에 대해 일치하는지 대조한다.
- **Partial verification**: 적어도 시간을 확인하고 director repository의 targets 메타데이터를 검증한다. ECU는 검사를 더할 수 있다.[@uptane-standard-2-1-0-2023]

Uptane Deployment Best Practices 2.1.0은 partial verification을 느리거나 메모리가 적은 마이크로컨트롤러의 ECU를 위한 선택지로 둔다. 이 문서에 따르면 partial verification을 하는 ECU는 image repository의 메타데이터를 보지 않아, director repository의 targets 키를 가진 공격자가 악성 소프트웨어를 설치하게 할 수 있으므로 full verification보다 덜 안전하다.[@uptane-deployment-best-practices-2-1-0-2023]

## 차량 버전 매니페스트

Uptane Standard 2.1.0은 각 ECU가 지금 설치된 이미지의 파일 이름, 길이, [[cryptographic-hash-function|해시]]를 담아 서명한 ECU version report를 primary ECU에 보내게 한다. 또 primary ECU가 이를 모아 서명한 **차량 버전 매니페스트**(vehicle version manifest)를 director repository에 보내고, director repository가 여기서 설치된 이미지 정보를 읽어 차량이 최신인지와 무엇을 설치할지 정하게 한다.[@uptane-standard-2-1-0-2023]

![[diagrams/uptane-vehicle-version-manifest.svg]]

## 위협 모델

Uptane Standard 2.1.0은 공격자의 목표를 심각도가 낮은 것부터 넷으로 나누고, 위협 모델의 공격을 이 목표로 분류한다.[@uptane-standard-2-1-0-2023]

| 목표            | 내용                                                                                   | 공격                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 업데이트 읽기   | 기밀 정보를 알아내거나 펌웨어를 역공학하거나, 두 이미지를 견주어 고친 취약점을 찾는다. | eavesdrop                                                                                             |
| 설치 막기       | 차량이 업데이트를 설치하지 못하게 한다.                                                | drop-request, slow retrieval, freeze, partial bundle installation, 저장소와 인프라에 대한 서비스 거부 |
| ECU 기능 방해   | ECU가 제대로 동작하지 못하게 한다.                                                     | [[rollback-protection\|rollback]], endless data, mix-and-match                                        |
| ECU나 차량 제어 | 공격자가 고른 코드를 ECU가 설치하고 실행하게 한다. 가장 심각한 목표다.                 | arbitrary software                                                                                    |
