---
title: Scrum
tags:
  - process/sw-process
verified: 2026-10-03
---

ISO/IEC/IEEE 24765 용어집은 **Scrum**을, [[agile-software-development|애자일 개발]]에서 팀이 요구사항 백로그에서 개발할 항목을 합의하고 몇 주 정도의 짧은 기간 안에 만들어 내는 반복형 프로젝트 관리 프레임워크로 정의한다.[@ieee-cs-sevocab-2026] SWEBOK V4.0a에 따르면 Scrum은 널리 쓰이게 된 애자일 방법 가운데 하나로, 다른 애자일 방법보다 프로젝트 관리에 잘 맞는다.[@ieee-swebok-v4-0a-2026]

The Scrum Guide 2020은 Scrum을, 복잡한 문제에 맞춰 해결책을 바꿔 가며 가치를 내도록 사람과 팀, 조직을 돕는 가벼운 프레임워크로 정의한다. Ken Schwaber와 Jeff Sutherland는 1990년대 초에 Scrum을 만들어 1995년 OOPSLA(Object-Oriented Programming, Systems, Languages, and Applications) 학회에서 처음 함께 발표했고, 2010년에 Scrum의 정의를 담은 The Scrum Guide를 처음 썼다.[@scrumguides-scrum-guide-2020]

## 이론

The Scrum Guide 2020은 Scrum의 바탕을 경험주의와 린 사고에 둔다. 가이드에서 경험주의는 지식이 경험에서 나오고, 결정은 관찰한 것에 근거한다는 생각이다. 가이드는 투명성, 점검, 적응을 Scrum의 세 기둥으로 둔다.[@scrumguides-scrum-guide-2020]

## Scrum Team

The Scrum Guide 2020은 Scrum Team을 Scrum Master 한 명, Product Owner 한 명, Developers로 구성하고, 팀 안에 하위 팀이나 위계를 두지 않는다. 팀은 대개 10명 이하다. Scrum Team은 여러 기능을 갖추어 매 Sprint 가치를 만드는 데 필요한 기술을 모두 가지며, 누가 무엇을 언제 어떻게 할지 팀 안에서 스스로 정한다(self-managing).[@scrumguides-scrum-guide-2020]

가이드는 Scrum Team 안에 세 책임(accountability)을 둔다.[@scrumguides-scrum-guide-2020]

- **Product Owner**: Scrum Team의 작업에서 나오는 제품의 가치를 최대로 할 책임을 진다. Product Backlog를 잘 관리할 책임도 지는데, 여기에는 Product Goal을 세워 알리는 일, 항목을 만들어 알리는 일, 항목의 순서를 정하는 일이 든다. 이 일을 남에게 맡겨도 책임은 Product Owner에게 남는다. Product Owner는 위원회가 아니라 한 사람이다.
- **Scrum Master**: 가이드가 정의한 대로 Scrum을 자리 잡게 하고, Scrum Team의 효과성에 책임을 진다.
- **Developers**: 매 Sprint 쓸 수 있는 Increment를 만드는 데 몰두하는 사람들이다. Sprint Backlog를 세우고, Definition of Done을 지켜 품질을 넣고, Sprint Goal을 향해 날마다 계획을 조정할 책임을 진다.[@scrumguides-scrum-guide-2020]

## 이벤트

The Scrum Guide 2020은 이벤트 다섯을 두며, 그 가운데 Sprint가 나머지 넷을 담는다.[@scrumguides-scrum-guide-2020]

- **Sprint**: 길이가 고정된 한 달 이하의 이벤트다. 한 Sprint가 끝나면 곧바로 다음 Sprint가 시작된다. Sprint Goal이 쓸모없어지면 Sprint를 취소할 수 있고, 그 권한은 Product Owner에게만 있다.
- **Sprint Planning**: Sprint에서 할 일을 정하며 Sprint를 연다. 이 Sprint가 왜 가치 있는지(Sprint Goal), 무엇을 할지, 어떻게 할지를 다루고, 한 달짜리 Sprint에서 최대 8시간이다.
- **Daily Scrum**: Developers가 Sprint Goal을 향한 진척을 점검하고 필요하면 Sprint Backlog를 조정하는 15분짜리 이벤트다. Sprint의 근무일마다 같은 시간, 같은 장소에서 연다.
- **Sprint Review**: Sprint의 결과를 점검하고 앞으로 무엇을 조정할지 정한다. 한 달짜리 Sprint에서 최대 4시간이다.
- **Sprint Retrospective**: 품질과 효과성을 높일 방법을 계획하며 Sprint를 닫는다. 한 달짜리 Sprint에서 최대 3시간이다.[@scrumguides-scrum-guide-2020]

![[diagrams/scrum-sprint-events.svg]]

## 산출물과 약속

The Scrum Guide 2020은 산출물 셋을 두고, 산출물마다 진척을 잴 기준이 되는 약속(commitment)을 하나씩 붙인다.[@scrumguides-scrum-guide-2020]

- **Product Backlog**: 제품을 낫게 하는 데 필요한 것을 순서대로 늘어놓은 목록으로, Scrum Team이 하는 일의 유일한 원천이다. 약속은 **Product Goal**로, Scrum Team이 계획의 목표로 삼는 제품의 미래 상태다.
- **Sprint Backlog**: Sprint Goal, 이번 Sprint에 고른 Product Backlog 항목, Increment를 인도할 실행 계획으로 이루어진다. 약속은 **Sprint Goal**로, Sprint의 단일한 목표다.
- **Increment**: Product Goal을 향한 구체적인 디딤돌로, 쓸 수 있어야 한다. 한 Sprint 안에 Increment가 여럿 만들어질 수 있다. 약속은 **Definition of Done**으로, Increment가 제품에 요구되는 품질 기준을 충족한 상태를 공식으로 적은 것이다. Definition of Done을 충족하지 못한 작업은 Increment에 들지 않는다.[@scrumguides-scrum-guide-2020]

## 가이드의 판

The Scrum Guide는 2010년판 뒤로 2011년, 2013년, 2016년, 2017년, 2020년에 새 판이 나왔다.[@scrumguides-revisions-2026]

- The Scrum Guide 2017은 Scrum Team을 Product Owner, Development Team, Scrum Master로 나눴다. 2020판은 Development Team 대신 Developers를 두어, 하위 팀 없는 Scrum Team 하나로 묶는다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017] ScrumGuides.org의 개정 이력에 따르면 이 변경은 Product Owner와 Development Team 사이에 '우리와 그들'식 태도를 낳은, 팀 안의 별도 팀이라는 개념을 없애려는 것이었다.[@scrumguides-revisions-2026]
- The Scrum Guide 2017에는 Product Goal이 없었고, Sprint Goal과 Definition of Done을 산출물의 약속으로 두지 않았다. 2020판은 Product Goal을 새로 두고, Product Backlog, Sprint Backlog, Increment에 각각 Product Goal, Sprint Goal, Definition of Done을 약속으로 붙인다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017]
- The Scrum Guide 2017은 Scrum Team을 self-organizing 팀이라 했다. 2020판은 Scrum Team을 self-managing이라 한다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017]
- The Scrum Guide 2017은 Daily Scrum에서 쓸 수 있는 세 질문을 예로 들었다. 2020판에는 이 질문이 없고, Sprint Goal을 향한 진척에 집중하는 한 Developers가 구조와 기법을 고른다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017] ScrumGuides.org의 개정 이력에 따르면 2020판은 규정적인 표현을 빼거나 누그러뜨려 Scrum을 최소한으로 충분한 프레임워크로 되돌리려 했다.[@scrumguides-revisions-2026]
- The Scrum Guide 2017은 Product Owner, Development Team, Scrum Master를 역할(role)이라 불렀다. 2020판은 역할이라는 말을 쓰지 않고, Developers, Product Owner, Scrum Master를 책임으로 둔다.[@scrumguides-scrum-guide-2020][@scrumguides-scrum-guide-2017]
