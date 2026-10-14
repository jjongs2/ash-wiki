---
title: 퍼즈 테스트
aliases:
  - 퍼징
tags:
  - process/sw-testing
verified: 2026-10-13
---

ISTQB 용어집은 **퍼즈 테스트**(fuzz testing)를 대량의 무작위 데이터로 테스트 입력을 만드는 테스트 기법으로 정의하고, fuzzing을 동의어로 둔다.[@istqb-glossary-fuzz-testing-2026] [[iso-iec-ieee-29119|ISO/IEC/IEEE 29119]]-1:2022는 퍼즈 테스트를 인공지능 영역의 용어로 두고, fuzz라 부르는 대량의 무작위(또는 무작위에 가까운) 데이터로 테스트 항목의 입력을 만드는 [[software-testing|소프트웨어 테스트]] 접근법으로 정의한다.[@iso-iec-ieee-29119-1-obp-2022]

SWEBOK V4.0a는 [[random-testing|무작위 테스트]]에서 잘못되었거나 예상하지 못한 입력과 데이터를 무작위로 고르는 일을 퍼즈 테스트라 부른다. 퍼즈 테스트는 [[cybersecurity|사이버보안]]에서 해킹당할 수 있는 소프트웨어 버그, 코딩 오류, 보안 허점을 찾는 데 널리 쓰인다.[@ieee-swebok-v4-0a-2026]

## 기원

Barton P. Miller는 1988년 가을 자신의 대학원 과목 CS736 Advanced Operating Systems에서 퍼즈 과제를 냈다.[@miller-fuzz-testing-2023] 그는 위스콘신 대학교에서 이 과목을 가르치며 과제 설명을 쓰다가, 무작위하고 구조 없는 데이터라는 느낌을 주려고 이 테스트를 fuzz라 이름 붙였다.[@miller-fuzz-foreword-2008] Miller, Fredriksen, So는 시험한 모든 UNIX 판에서 유틸리티 프로그램의 25\~33%를 충돌시켰다.[@miller-unix-utilities-reliability-1989]
