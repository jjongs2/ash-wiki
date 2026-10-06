---
title: The Update Framework
tags:
  - security/ota
aliases:
  - TUF
verified: 2026-10-03
publisher: TUF project
edition: 2026
status: 유효
---

**The Update Framework**(TUF)는 소프트웨어 업데이트 시스템을 지키는 프레임워크다. [[digital-signature|서명]] 키 하나나 필요한 서명 수보다 적은 키가 공격자에게 넘어가도, 또 공격자가 클라이언트의 요청에 대신 답할 수 있어도 클라이언트가 공격당하지 않게 하는 것이 목표이고, 이때 공격자가 할 수 있는 최악은 업데이트를 막는 것이다.[@tuf-specification-1-0-36-2026]

## 범위

TUF 명세 1.0.36은 메타데이터가 담을 필드와 클라이언트의 업데이트 절차를 정하고, 메타데이터의 데이터 형식은 구현에 맡긴다.[@tuf-specification-1-0-36-2026]

### 역할과 위임

이 명세는 기본 최상위 역할 넷과 선택 역할인 mirrors를 정한다. 역할마다 키를 하나 이상 두고, 클라이언트가 메타데이터를 믿으려면 그 역할 키의 서명이 정해진 수(임계값)만큼 있어야 한다. 기본 최상위 역할이 서명하는 것은 아래와 같다.[@tuf-specification-1-0-36-2026]

| 역할      | 서명하는 것                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------- |
| root      | 다른 최상위 역할이 쓸 키의 지정. 클라이언트는 믿을 root 키를 갖추고 배포되어 root 메타데이터에서 업데이트를 시작한다. |
| targets   | 내려받을 파일(대상)의 [[cryptographic-hash-function\|해시]]와 크기를 적은 메타데이터                                  |
| snapshot  | 저장소에 있는 모든 targets 메타데이터의 최신 버전을 적은 메타데이터                                                   |
| timestamp | 최신 snapshot 메타데이터의 버전과 해시를 적은 메타데이터. 자주 다시 서명된다.                                         |

targets 역할은 대상 전부나 일부에 대한 신뢰를 다른 역할에 위임할 수 있고, 위임받은 역할도 다시 위임할 수 있다.[@tuf-specification-1-0-36-2026] 역할마다 다른 키를 쓰면, 한 역할의 키가 넘어가도 공격자가 할 수 있는 공격은 그 역할이 맡은 일에 해당하는 것으로 줄어든다. 모든 역할이 같은 키를 쓰면 이 이점은 없다.[@samuel-survivable-key-compromise-2010]

![[diagrams/tuf-roles-delegation.svg]]

### 만료와 최신성

TUF 명세 1.0.36은 모든 메타데이터에 만료 시각을 두고, 클라이언트가 만료된 메타데이터를 믿지 않게 한다. 클라이언트는 메타데이터의 만료 시각이 지났으면 업데이트를 멈추고 freeze 공격일 수 있음을 알린다. 그래서 공격자가 낡은 메타데이터를 계속 보여 주어도 만료 시각이 지나면 드러난다. 클라이언트는 지금 믿는 메타데이터를 버전 번호가 더 낮은 것으로 바꾸지도 않는다.[@tuf-specification-1-0-36-2026]

### 막는 공격

이 명세는 막으려는 공격으로 아래 열 가지를 든다.[@tuf-specification-1-0-36-2026]

| 공격                                 | 내용                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| arbitrary installation               | 다운로드 요청에 아무 파일이나 보내 공격자가 원하는 것을 설치하게 한다.                     |
| endless data                         | 아주 큰 데이터를 보내 클라이언트 시스템을 방해한다.                                        |
| extraneous dependencies              | 의도하지 않은 의존 소프트웨어를 내려받거나 설치하게 한다.                                  |
| fast-forward                         | 메타데이터의 버전 번호를 크게 올려, 뒤에 오는 정상 업데이트를 rollback 공격으로 보게 한다. |
| indefinite freeze                    | 같은 낡은 메타데이터를 계속 보내되 클라이언트가 알아채지 못하게 한다.                      |
| malicious mirrors preventing updates | 악성 미러가 정상 미러에서 오는 업데이트를 막는다.                                          |
| mix-and-match                        | 저장소에 함께 있었던 적이 없는 메타데이터를 섞어 쓰게 한다.                                |
| [[rollback-protection\|rollback]]    | 클라이언트가 받을 수 있다고 알던 것보다 오래된 소프트웨어를 설치하게 한다.                 |
| vulnerability to key compromises     | 키 하나나 필요한 서명 수보다 적은 키를 손에 넣은 공격자가 클라이언트를 공격한다.           |
| wrong software installation          | 클라이언트가 원한 것이 아닌 파일을 보낸다.                                                 |

## 개정 이력

Justin Samuel, Nick Mathewson, Justin Cappos, Roger Dingledine은 2010년 논문에서 TUF를 설계하고 구현했다.[@samuel-survivable-key-compromise-2010]

TUF는 2017년 CNCF(Cloud Native Computing Foundation)에 incubating 프로젝트로 들어갔고, 2019년 graduated 프로젝트가 됐다.[@cncf-tuf-project-2026]
