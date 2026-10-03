---
title: Attack tree
tags:
  - security/cybersecurity
verified: 2026-10-03
---

**Attack tree**는 시스템에 대한 공격을 트리 구조로 나타낸 것이다. 루트 노드는 공격의 목표이고, 각 노드는 하위 목표이며, 노드의 자식은 그 하위 목표를 이루는 방법이다. 잎에서 목표까지 이어지는 노드의 계층 하나가 공격 하나다.[@schneier-attack-trees-1999]

## AND 노드와 OR 노드

노드는 OR 노드와 AND 노드로 나뉜다. OR 노드의 자식은 서로 바꿔 쓸 수 있는 대안이고, AND 노드의 자식은 같은 목표로 가는 여러 단계여서 모두 이뤄야 목표가 이뤄진다. 그래서 OR 노드는 자식 가운데 하나라도 가능하면 가능하고, AND 노드는 자식이 모두 가능해야 가능하다.[@schneier-attack-trees-1999]

## 노드의 값

잎 노드에 가능한지, 쉬운지 어려운지, 비싼지 싼지, 특별한 장비가 필요한지 같은 값을 매기면 그 값을 트리를 따라 위로 올려 계산할 수 있다. 비용처럼 연속인 값도 매길 수 있다. OR 노드의 비용은 자식 가운데 가장 싼 값이고, AND 노드의 비용은 자식 비용의 합이다. 이렇게 하면 가장 싼 공격이나, 특별한 장비 없이 할 수 있는 가장 싼 공격처럼 조건에 맞는 공격을 찾을 수 있다.[@schneier-attack-trees-1999]

![[diagrams/attack-tree-and-or-cost.svg]]

## 기원

J. D. Weiss는 1991년 National Computer Security Conference 논문에서 위협을 threat logic tree로 분해했고, 이 트리의 중간 노드는 자식의 AND나 OR이다.[@weiss-system-security-engineering-1991] Bruce Schneier는 1999년 12월 Dr. Dobb's Journal의 글 "Attack Trees"에서 attack tree를 소개했다.[@schneier-attack-trees-1999]

## 차량 사이버보안에서의 쓰임

Automotive SPICE for Cybersecurity 2.0은 리스크를 분석하는 방법의 예로 ATA(Attack Tree Analysis)를 든다.[@vda-automotive-spice-cybersecurity-2025] 이 예가 있는 MAN.7은 [[threat-analysis-and-risk-assessment#Automotive SPICE for Cybersecurity의 MAN.7|TARA]]에서 다룬다.

## FTA와의 차이

IEC 61025:2006은 FTA(Fault Tree Analysis)를 정해 둔 top event를 일으키는 조건과 요인을 찾아, 입력 사건의 조합을 게이트로 나타내는 [[safety-analysis|안전 분석]] 기법으로 둔다.[@iec-61025-preview-2006] Attack tree도 AND·OR로 하위 노드를 묶지만, 루트는 공격자가 노리는 목표이고, 노드는 그 목표를 이루는 하위 목표이며, 잎에서 루트까지의 경로 하나가 공격 하나다.[@schneier-attack-trees-1999]
