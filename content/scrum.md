---
title: Scrum
tags:
  - process/sw-process
verified: 2026-10-03
---

ISO/IEC/IEEE 24765 용어집은 **Scrum**을, [[agile-software-development|애자일 개발]]에서 팀이 요구사항 백로그에서 개발할 항목을 합의하고 몇 주 정도의 짧은 기간 안에 만들어 내는 반복형 프로젝트 관리 프레임워크로 정의한다. 이 용어집은 **backlog refinement**를, 애자일 방법에서 백로그의 항목에 우선순위를 매기고, 스토리를 더 잘게 나누어 자세히 고쳐 쓰고, 노력을 추정해 다음 반복에서 할 항목을 고를 준비를 하는 일로 정의한다.[@ieee-cs-sevocab-2026] ISO/IEC/IEEE 24765:2017은 sprint를, 소프트웨어 기능 묶음을 개발해 이해관계자에게 시연할 수 있는 동작하는 제품을 내는 짧은 기간으로 정의한다.[@iso-iec-ieee-24765-obp-2017] SWEBOK V4.0a에 따르면 Scrum은 널리 쓰이게 된 애자일 방법 가운데 하나로, 다른 애자일 방법보다 프로젝트 관리에 잘 맞는다.[@ieee-swebok-v4-0a-2026]

The Scrum Guide 2020은 Scrum을, 복잡한 문제에 맞춰 해결책을 바꿔 가며 가치를 내도록 사람과 팀, 조직을 돕는 가벼운 프레임워크로 정의한다. Ken Schwaber와 Jeff Sutherland는 1990년대 초에 Scrum을 만들어 1995년 OOPSLA(Object-Oriented Programming, Systems, Languages, and Applications) 학회에서 처음 함께 발표했고, 2010년에 Scrum의 정의를 담은 The Scrum Guide를 처음 썼다.[@scrumguides-scrum-guide-2020]

이 가이드는 Scrum이 돌아가는 방식을 네 단계로 둔다. Product Owner가 복잡한 문제를 푸는 일을 Product Backlog에 순서대로 늘어놓고, Scrum Team이 Sprint 동안 그 가운데 고른 일을 가치 있는 Increment로 만들며, Scrum Team과 이해관계자가 결과를 점검해 다음 Sprint를 조정하고, 이를 되풀이한다. 가이드는 Scrum 프레임워크를 일부러 완전하지 않게 두어, Scrum 이론을 구현하는 데 필요한 부분만 정의한다. 프레임워크 안에서는 여러 프로세스, 기법, 방법을 쓸 수 있고, Scrum의 규칙은 자세한 지시를 주는 대신 사람들의 관계와 상호작용을 이끈다. Scrum의 일부만 구현하면 그 결과는 Scrum이 아니며, Scrum은 온전할 때만 존재하고 다른 기법, 방법론, 실천을 담는 그릇으로 잘 작동한다.[@scrumguides-scrum-guide-2020]

## 이론

이 가이드는 Scrum의 바탕을 경험주의와 린 사고에 둔다. 가이드에서 경험주의는 지식이 경험에서 나오고, 결정은 관찰한 것에 근거한다는 생각이다. 가이드는 투명성, 점검, 적응을 Scrum의 세 기둥으로 둔다.[@scrumguides-scrum-guide-2020]

Scrum은 예측 가능성을 높이고 리스크를 통제하려고 [[software-development-life-cycle|반복·점진]] 접근을 쓴다.[@scrumguides-scrum-guide-2020]

가이드는 Scrum을 잘 쓰려면 사람들이 Commitment, Focus, Openness, Respect, Courage라는 다섯 가치를 몸에 익혀야 한다고 둔다. Scrum Team과, 이 팀과 함께 일하는 사람들이 이 가치를 체화하면 투명성, 점검, 적응이라는 세 기둥이 살아나 신뢰를 쌓는다.[@scrumguides-scrum-guide-2020]

## Scrum Team

이 가이드는 Scrum Team을 Scrum Master 한 명, Product Owner 한 명, Developers로 구성하고, 팀 안에 하위 팀이나 위계를 두지 않는다. 팀은 대개 10명 이하다. Scrum Team은 여러 기능을 갖추어 매 Sprint 가치를 만드는 데 필요한 기술을 모두 가지며, 누가 무엇을 언제 어떻게 할지 팀 안에서 스스로 정한다(self-managing).[@scrumguides-scrum-guide-2020]

Scrum Team이 너무 커지면 같은 제품에 집중하는 여러 Scrum Team으로 다시 짜는 것을 검토하고, 이 팀들은 Product Goal, Product Backlog, Product Owner를 함께 써야 한다. 여러 Scrum Team이 한 제품을 함께 만들면 모두 같은 Definition of Done을 함께 정하고 지켜야 한다.[@scrumguides-scrum-guide-2020]

가이드는 Scrum Team 안에 세 책임(accountability)을 둔다.[@scrumguides-scrum-guide-2020]

- **Product Owner**: Scrum Team의 작업에서 나오는 제품의 가치를 최대로 할 책임을 진다. Product Backlog를 잘 관리할 책임도 지는데, 여기에는 Product Goal을 세워 알리는 일, 항목을 만들어 알리는 일, 항목의 순서를 정하는 일이 든다. 이 일을 남에게 맡겨도 책임은 Product Owner에게 남는다. Product Owner는 위원회가 아니라 한 사람이다.
- **Scrum Master**: 가이드가 정의한 대로 Scrum을 자리 잡게 하고, Scrum Team의 효과성에 책임을 진다. Scrum Team과 더 넓은 조직을 섬기는 리더로, Scrum Team에게는 자기 관리와 다기능성을 코칭하고 진척을 막는 장애를 없애게 하며, Product Owner에게는 Product Goal을 정의하고 Product Backlog를 관리하는 기법을 찾도록 돕고, 조직에게는 Scrum 도입을 이끌고 이해관계자와 Scrum Team 사이의 장벽을 없앤다.
- **Developers**: 매 Sprint 쓸 수 있는 Increment를 만드는 데 몰두하는 사람들이다. Sprint Backlog를 세우고, Definition of Done을 지켜 품질을 넣고, Sprint Goal을 향해 날마다 계획을 조정할 책임을 진다.[@scrumguides-scrum-guide-2020]

## 이벤트

이 가이드는 이벤트 다섯을 두며, 그 가운데 Sprint가 나머지 넷을 담는다.[@scrumguides-scrum-guide-2020]

- **Sprint**: 길이가 고정된 한 달 이하의 이벤트다. 한 Sprint가 끝나면 곧바로 다음 Sprint가 시작된다. Sprint Goal이 쓸모없어지면 Sprint를 취소할 수 있고, 그 권한은 Product Owner에게만 있다. Sprint 동안에는 Sprint Goal을 위태롭게 하는 변경을 하지 않고, 품질을 낮추지 않으며, Product Backlog는 필요한 만큼 정제하고, 더 알게 되면 Product Owner와 범위를 분명히 하거나 다시 협상할 수 있다.
- **Sprint Planning**: Sprint에서 할 일을 정하며 Sprint를 연다. 이 Sprint가 왜 가치 있는지(Sprint Goal), 무엇을 할지, 어떻게 할지를 다루고, 한 달짜리 Sprint에서 최대 8시간이다.
- **Daily Scrum**: Developers가 Sprint Goal을 향한 진척을 점검하고 필요하면 Sprint Backlog를 조정하는 15분짜리 이벤트다. Sprint의 근무일마다 같은 시간, 같은 장소에서 연다.
- **Sprint Review**: Sprint의 결과를 점검하고 앞으로 무엇을 조정할지 정한다. 발표에 그치지 않는 작업 회의다. 한 달짜리 Sprint에서 최대 4시간이다.
- **Sprint Retrospective**: 품질과 효과성을 높일 방법을 계획하며 Sprint를 닫는다. 한 달짜리 Sprint에서 최대 3시간이다.[@scrumguides-scrum-guide-2020]

![[diagrams/scrum-sprint-events.svg]]

## 산출물과 약속

이 가이드는 산출물 셋을 두고, 산출물마다 진척을 잴 기준이 되는 약속(commitment)을 하나씩 붙인다.[@scrumguides-scrum-guide-2020]

- **Product Backlog**: 제품을 낫게 하는 데 필요한 것을 순서대로 늘어놓은 목록으로, Scrum Team이 하는 일의 유일한 원천이다. Product Backlog 정제는 Product Backlog 항목을 더 작고 정확한 항목으로 나누고 더 자세히 정의하는 일로, 설명, 순서, 크기 같은 세부를 계속 더해 간다. 크기 추정은 그 일을 할 Developers의 책임이고, Product Owner는 Developers가 트레이드오프를 이해하고 고르도록 도와 영향을 줄 수 있다. 약속은 **Product Goal**로, Scrum Team이 계획의 목표로 삼는 제품의 미래 상태다.
- **Sprint Backlog**: Sprint Goal, 이번 Sprint에 고른 Product Backlog 항목, Increment를 인도할 실행 계획으로 이루어진다. 약속은 **Sprint Goal**로, Sprint의 단일한 목표다.
- **Increment**: Product Goal을 향한 구체적인 디딤돌로, 쓸 수 있어야 한다. 한 Sprint 안에 Increment가 여럿 만들어질 수 있다. 약속은 **Definition of Done**으로, Increment가 제품에 요구되는 품질 기준을 충족한 상태를 공식으로 적은 것이다. Definition of Done을 충족하지 못한 작업은 Increment에 들지 않는다. Increment는 Sprint가 끝나기 전에도 이해관계자에게 인도할 수 있고, Sprint Review를 가치를 출시하는 관문으로 여겨서는 안 된다. Definition of Done이 조직 표준의 일부면 모든 Scrum Team이 그것을 최소한으로 따라야 하고, 조직 표준이 아니면 Scrum Team이 제품에 맞는 Definition of Done을 만들어야 한다.[@scrumguides-scrum-guide-2020]

## 가이드의 판

The Scrum Guide는 2010년판 뒤로 2011년, 2013년, 2016년, 2017년, 2020년에 새 판이 나왔다.[@scrumguides-revisions-2026]

- The Scrum Guide 2017은 Scrum Team을 Product Owner, Development Team, Scrum Master로 나눴다. 2020판은 Development Team 대신 Developers를 두어, 하위 팀 없는 Scrum Team 하나로 묶는다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017] ScrumGuides.org의 개정 이력에 따르면 이 변경은 Product Owner와 Development Team 사이에 '우리와 그들'식 태도를 낳은, 팀 안의 별도 팀이라는 개념을 없애려는 것이었다.[@scrumguides-revisions-2026]
- The Scrum Guide 2017에는 Product Goal이 없었고, Sprint Goal과 Definition of Done을 산출물의 약속으로 두지 않았다. 2020판은 Product Goal을 새로 두고, Product Backlog, Sprint Backlog, Increment에 각각 Product Goal, Sprint Goal, Definition of Done을 약속으로 붙인다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017]
- The Scrum Guide 2017은 Scrum Team을 self-organizing 팀이라 했다. 2020판은 Scrum Team을 self-managing이라 한다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017]
- The Scrum Guide 2017은 Daily Scrum에서 쓸 수 있는 세 질문을 예로 들었다. 2020판에는 이 질문이 없고, Sprint Goal을 향한 진척에 집중하는 한 Developers가 구조와 기법을 고른다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017] ScrumGuides.org의 개정 이력에 따르면 2020판은 규정적인 표현을 빼거나 누그러뜨려 Scrum을 최소한으로 충분한 프레임워크로 되돌리려 했다.[@scrumguides-revisions-2026]
- The Scrum Guide 2017은 Product Owner, Development Team, Scrum Master를 역할(role)이라 불렀다. 2020판은 역할이라는 말을 쓰지 않고, Developers, Product Owner, Scrum Master를 책임으로 둔다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017]
