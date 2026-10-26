---
title: 정적 분석
tags:
  - sw-engineering/sw-testing
verified: 2026-10-03
---

**정적 분석**(static analysis)은 구성 요소나 시스템을 그 형태, 구조, 내용, 문서를 근거로 평가하는 일이다.[@istqb-glossary-static-analysis-2026][@ieee-cs-sevocab-2026] ISTQB 용어집은 정적 분석을, 구성 요소나 시스템을 실행하지 않고 이런 것을 근거로 평가하는 자동화된 프로세스로 정의한다.[@istqb-glossary-static-analysis-2026] ISO/IEC/IEEE 24765 용어집은 정적 분석을 같은 근거로 하는 평가 프로세스로 정의하고, 실행 중의 동작을 근거로 한 평가를 동적 분석(dynamic analysis)으로 정의한다. 이 용어집은 사람이 하는 [[software-inspection|인스펙션]], [[software-inspection#워크스루와의 차이|워크스루]], [[software-review#여러 이름|데스크 체크]]도 정적 분석 기법으로 정의한다.[@ieee-cs-sevocab-2026]

ISTQB CTFL v4.0.1 강의계획서는 [[software-testing#정적 테스트와 동적 테스트|정적 테스트]]에 사람이 살피는 [[software-review|리뷰]]와, 흔히 도구를 쓰는 정적 분석을 따로 넣는다.[@istqb-ctfl-syllabus-2024] 정적 기법과 동적 기법의 구분은 [[verification-and-validation#정적 기법과 동적 기법|검증과 확인]]에서 다룬다.

## 찾는 것

정적 분석 도구는 다음을 찾는다.[@absint-astree-2026][@cppcheck-home-2026]

- [[misra-c|MISRA C]] 같은 [[coding-standard|코딩 표준]]의 규칙 위반[@absint-astree-2026][@cppcheck-manual-2026]
- 0으로 나누기, 배열 경계 넘기, 널 포인터 역참조, 초기화하지 않은 변수 읽기 같은 [[coding-standard#C 언어에서 피하려는 동작|미정의 동작]][@absint-astree-2026][@cppcheck-home-2026]

제품마다 더 찾는 것도 있다. AbsInt의 C·C++ 정적 분석 도구 Astrée는 dead code를 찾고, Astrée에 통합된 코딩 표준 검사기 RuleChecker는 주석 밀도, [[cyclomatic-complexity|순환 복잡도]] 같은 코드 [[software-metric|메트릭]]도 검사한다.[@absint-astree-2026] Cppcheck는 값을 대입하고 쓰지 않는 변수를 알린다.[@cppcheck-manual-2026]

## False positive와 false negative

- **False positive**: 실제로는 없는 결함을 결함으로 보고한 결과
- **False negative**: 실제로 있는 결함을 찾아내지 못한 결과[@istqb-glossary-false-positive-result-2026][@istqb-glossary-false-negative-result-2026]

NIST의 OSAC(Organization of Scientific Area Committees for Forensic Science) 용어집에 따르면 통계적 가설 검정에서 참인 귀무가설을 기각하는 1종 오류(type I error)를 false positive라고도 하고, 거짓인 귀무가설을 받아들이는 2종 오류(type II error)를 false negative라고도 한다.[@nist-osac-type-i-error-2026][@nist-osac-type-ii-error-2026]

ISO/IEC/IEEE 24765 용어집은 검증 도구의 false positive가 분석 규칙의 정밀도가 모자라서 생길 수 있다고 둔다.[@ieee-cs-sevocab-2026] Coverity 논문에 따르면 Coverity의 정적 분석 제품을 쓰는 곳에서 false positive가 30%를 넘으면 사람들이 도구를 무시했고, 진짜 버그가 false positive 속에 묻혔다.[@coverity-few-billion-lines-2010]

## 건전성과 abstract interpretation

프로그램의 구체적 의미가 보일 수 있는 모든 경우를 추상 의미가 덮으면, 그 추상화를 건전하다(sound)고 한다. 건전한 추상화는 일어날 수 있는 오류를 빠짐없이 알리므로, 알리지 않은 오류는 실제 실행에서 일어날 수 없다.[@cousot-abstract-interpretation-nutshell-2026]

Rice는 1953년 논문에서, 재귀적으로 열거 가능한 집합들의 클래스 가운데 공집합도 아니고 모든 집합을 담지도 않는 것은 어느 것도 결정 가능하지 않음을 보였다.[@rice-classes-recursively-enumerable-1953] 건전한 분석은 가능한 실행의 상위 집합을 다루므로(over-approximation) 실제로 일어나지 않는 실행도 고려하게 되고, 그 가운데 오류 상태에 닿는 것이 false alarm이 된다. 분석하려는 질문이 결정 불가능하므로, 자동화된 건전한 분석은 어느 것이든 실제로는 오류가 없는 프로그램 가운데 무수히 많은 것에 false alarm을 낸다. 그래서 false alarm을 모든 프로그램에서 없앨 수는 없다. 더 정밀한 추상 의미를 고르면 false alarm을 줄일 수 있지만 계산 비용이 커진다.[@cousot-abstract-interpretation-nutshell-2026]

![[diagrams/sound-analysis-false-alarm.svg]]

Cousot와 Cousot는 1977년 논문에서 abstract interpretation을 형식적으로 정의했다. Abstract interpretation은 프로그램의 의미를 추상 대상의 세계에서 계산하도록 다시 해석하고, 그 계산 결과로 실제 계산에 대한 정보를 얻는다. 결과는 대개 부정확하지만 얻기 쉽다. 프로그램의 추상 성질은 complete semilattice로 모델링하고, 순서를 보존하는 함수로 만든 방정식계의 극단 고정점(fixpoint)으로 전역 성질을 정의한다. 고정점을 구하는 Kleene 수열이 무한하면 고정점을 근사로 구한다. 이 논문은 데이터 흐름 분석, 타입 검사, 프로그램 검증 같은 여러 프로그램 분석 기법을 abstract interpretation으로 보고, 하나의 격자 모델로 묶었다.[@cousot-abstract-interpretation-1977]

## 의존성 분석

ISO/IEC/IEEE 24765 용어집은 **호출 그래프**(call graph)를, 시스템이나 프로그램의 모듈들을 보이고 어느 모듈이 어느 모듈을 부르는지 나타내는 그림으로 정의한다.[@ieee-cs-sevocab-2026]

DSM(Design Structure Matrix)은 Dependency Structure Matrix라고도 부른다.[@browning-dsm-survey-2016]

Sangal, Jordan, Sinha, Jackson은 2005년 논문에서 DSM으로 소프트웨어 아키텍처의 모듈 간 의존을 관리하는 방법을 내놓고, 이를 LDM이라는 도구로 구현했다. 이 방법은 정적 분석으로 코드에서 모듈 사이의 의존을 뽑는다. 의존은 한 모듈이 다른 모듈의 구문 요소를 명시적으로 참조하는 것이다. 어떤 의존을 허용하는지 design rule로 적어 두고, 시스템이 바뀔 때마다 다시 적용해 위반을 찾는다.[@sangal-dependency-models-2005]

- DSM: Sangal 외의 DSM은 모듈을 가로축과 세로축에 같은 순서로 놓은 인접 행렬이다. $i$번째 모듈이 $j$번째 모듈에 의존하면 $j$행 $i$열에 표시하고, 대각선은 비운다.
- 계층 위반: 아래 계층이 위 계층을 쓰지 못한다(cannot-use)는 design rule을 두면, 그 규칙이 걸린 칸에 있는 의존이 계층 위반으로 드러난다.
- 순환 의존: DSM을 partitioning(행과 열을 다시 정렬하고 모듈을 묶음)하면 계층이 드러나고 순환 의존이 부각된다. 서로 의존하는 모듈은 하삼각 행렬로 정렬할 수 없고, 하나로 묶어야 순환이 없어진다.[@sangal-dependency-models-2005]

계층과 uses 관계는 [[software-architecture#구조 관계|소프트웨어 아키텍처]]에서, AUTOSAR 계층 사이의 호출 방향은 [[autosar-layered-architecture|AUTOSAR 계층 구조]]에서, 모듈 사이의 결합 정도는 [[cohesion-and-coupling#결합도|응집도와 결합도]]에서 다룬다.

## 개발 흐름 안의 자리

정적 분석은 흔히 [[continuous-integration|CI]] 체계에 넣어 돌린다. ISTQB CTFL v4.0.1 강의계획서에 따르면 테스트를 일찍 하면 결함이 뒤 산출물로 번지지 않아 시간과 비용을 아낀다. 이 강의계획서는 동적 테스트 전에 또는 자동화된 프로세스 안에서 소스 코드의 정적 분석을 마치는 것을 [[v-model#테스트 설계를 앞당김|shift left]] 관행으로 든다.[@istqb-ctfl-syllabus-2024]
