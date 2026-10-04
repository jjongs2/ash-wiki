---
title: xUnit
tags:
  - process/sw-testing
verified: 2026-10-03
---

**xUnit** 계열(xUnit family)은 JUnit, NUnit, PHPUnit, Test::Unit 같은 단위 테스트 프레임워크를 함께 부르는 이름이다.[@garousi-smells-test-code-2018] JUnit은 Java와 JVM(Java Virtual Machine)용 테스트 프레임워크로[@junit-home-2026], 단위 테스트 프레임워크의 xUnit 아키텍처를 따르는 한 사례다.[@junit-4-faq-2025] NUnit은 .NET 언어 전체를 위한 단위 테스트 프레임워크로, 처음에 JUnit을 옮겨 만들었다.[@nunit-home-2026] Python의 unittest는 JUnit에서 영감을 받아 만들어졌다.[@psf-python-unittest-2026]

## 기원

Kent Beck은 Smalltalk 테스트 프레임워크를 만들었고, 1994년 10월 The Smalltalk Report의 칼럼 "Simple Smalltalk Testing"에서 그 테스트 전략과 프레임워크를 설명했다. 프레임워크는 literate program 꼴로 실었다.[@beck-simple-smalltalk-testing-1997] SUnit은 Beck의 이 프레임워크에서 시작했고, 처음에는 클래스 4개와 메서드 10개였다.[@sunit-manual-2006] JUnit은 Erich Gamma와 Kent Beck이 처음 만들었다.[@junit-4-faq-2025]

## 공통 구성

JUnit, GoogleTest, Python unittest 같은 프레임워크는 다음 구성 요소를 둔다.

| 구성 요소       | 하는 일                                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| test case       | 특정 입력에 대한 응답 하나를 검사하는 개별 테스트 단위[@psf-python-unittest-2026][@google-googletest-primer-2026]                                          |
| test suite      | 함께 실행할 테스트를 묶는 단위[@psf-python-unittest-2026][@google-googletest-primer-2026]                                                                  |
| fixture         | 여러 테스트가 같은 구성으로 쓰는 객체와 데이터. 테스트마다 새로 만들어 테스트끼리 상태를 나누지 않는다.[@junit-4-faq-2025][@google-googletest-primer-2026] |
| setup, teardown | 테스트마다 앞에서 fixture를 준비하고 뒤에서 정리하는 루틴[@junit-4-faq-2025][@google-googletest-primer-2026]                                               |
| assertion       | 결과가 기대와 맞는지 검사하는 문. 실패하면 테스트가 실패한다.[@junit-4-faq-2025][@google-googletest-primer-2026]                                           |
| test runner     | 테스트 실행을 맡고 결과를 사용자에게 보여 주는 구성 요소[@psf-python-unittest-2026][@junit-4-test-runners-2020]                                            |

![[diagrams/xunit-test-runner-setup-teardown.svg]]

## C·C++ 프레임워크

- GoogleTest: Google이 만든 C++ 테스트 프레임워크로, xUnit 아키텍처를 바탕으로 한다.[@google-googletest-primer-2026]
- Unity: ThrowTheSwitch.org 프로젝트의 C용 단위 테스트 프레임워크로, 임베디드 소프트웨어를 겨냥하며 C 파일 하나와 헤더 파일 둘로 이루어진다.[@throwtheswitch-unity-2026]
- CppUTest: C와 C++용 xUnit 테스트 프레임워크다. C++로 작성됐지만 C와 C++ 프로젝트에 쓰이고, 임베디드 시스템에서 자주 쓰인다.[@cpputest-home-2026]

## Fatal과 non-fatal assertion

GoogleTest의 assertion은 같은 것을 검사하되 실패했을 때 현재 함수에 주는 영향이 다른 짝으로 나온다.[@google-googletest-primer-2026]

- fatal assertion(`ASSERT_*`): 실패하면 fatal failure를 내고 현재 함수에서 곧바로 빠져나간다.
- non-fatal assertion(`EXPECT_*`): 실패하면 non-fatal failure를 기록하고 현재 함수를 계속 실행하므로, 한 테스트에서 실패를 여럿 보고할 수 있다.[@google-googletest-primer-2026]

![[diagrams/googletest-fatal-nonfatal-assertion.svg]]

비교 assertion도 짝으로 나온다. 예를 들어 `EXPECT_EQ`와 `ASSERT_EQ`는 `val1 == val2`를, `EXPECT_LT`와 `ASSERT_LT`는 `val1 < val2`를 검사한다.[@google-googletest-assertions-2026]
