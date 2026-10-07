# 용어 표기 결정

위키 페이지의 용어 표기에 대한 소유자 결정의 목록입니다. 표기를 고르는 순서와 결정을 더하는 절차는 [위키 규약](wiki-conventions.md#용어)에 있습니다.

약어를 풀이하느냐 마느냐는 [풀이하지 않는 약어](wiki-abbreviations.md) 목록이 정합니다. 이 목록은 풀이할 때 어느 풀이 문자열을 쓰는지와, 원어·한국어·음차 가운데 무엇을 쓰는지를 정합니다.

한 줄에 결정 하나를 `- <쓰는 표기>: <쓰지 않는 표기> (#<결정 이슈나 PR>)`로 적습니다. 조건이나 예외가 있으면 줄 끝에 `. <조건이나 예외>`를 붙입니다.

- 약어의 풀이는 쓰는 표기를 `<약어> 풀이 <풀이>`로 적습니다.
- 통일하지 않기로 한 결정은 쓰는 표기 칸에 원어를, 쓰지 않는 표기 칸에 `통일하지 않음`을 적고, 어디에 무엇을 쓰는지를 조건에 적습니다.
- 버린 표기가 기록되지 않은 결정은 쓰지 않는 표기 칸을 `-`로 둡니다.
- `aliases`와 인용한 문서의 제목은 이 목록에 걸리지 않습니다. alias는 다른 표기로도 찾아오게 하는 자리이고, 문서 제목은 원문 그대로 씁니다.

줄은 쓰는 표기의 가나다순으로 둡니다. 라틴 문자는 한글보다 앞에 두고 대소문자를 가리지 않으며, 기호와 공백은 글자보다 앞에 둡니다. 결정을 더하는 PR끼리 같은 줄을 고치지 않게 하려는 꼴입니다.

- Annex: 부속서, 부록 (#301). 원문이 Annex일 때. 원문이 Appendix인 "부록"은 그대로
- API 풀이 Application Programming Interface: Application Program Interface (#165)
- ASPICE: Automotive SPICE, A-SPICE (#231). 판을 붙이면 `ASPICE 4.1` 꼴. 정식 이름은 `automotive-spice` 머리말의 풀이에만, A-SPICE는 그 페이지의 alias로만. 문서 이름 "Automotive SPICE for Cybersecurity"와 슬러그는 예외
- cascading failure: 연쇄 고장 (#291)
- channel: 채널 (#257). MCAL I/O 드라이버(ADC·DIO·ICU·OCU·PWM)의 channel일 때. 그 밖의 채널은 "채널". 예: ComM·NM의 채널, FlexRay 채널
- classic: classical (#311). ISO 11898-1:2024를 주어로 한 문장에서 이 판의 이름(약어 CC)을 쓸 때. 위키의 개념 이름 "Classical CAN"은 그대로
- common cause failure: 공통 원인 고장 (#291)
- context: 문맥 (#142)
- context switch: 문맥 전환 (#142)
- counter: 카운터 (#257). OSEK·AUTOSAR OS 객체일 때. 다른 counter는 이 결정에 들지 않음
- cybersecurity goal: 사이버보안 목표 (#288)
- Diffie-Hellman: Diffie–Hellman (#288)
- dominant: 도미넌트 (#165). 조사는 원어의 발음대로. 예: "dominant가"
- edge: 에지 (#257). AUTOSAR 드라이버가 설정과 API로 다루는 edge일 때. 그 밖의 신호 에지는 "에지". 예: CAN 동기화의 에지
- failure: 실패, 고장, 장애 (#291). 합성어 포함. 예: dependent failure, failure mode, target failure measure. 동사("고장 나다", "실패하다"), 테스트의 pass/fail, 일반 낱말 "실패"는 그대로. ISTQB의 error·defect와 같은 문장, 곧 "실수"나 "결함"과 같은 문장에서는 "장애", 페이지에서 처음 쓸 때 "장애(failure)"
- false positive: 거짓 양성 (#291). ISTQB 용어 이름은 false-positive result
- GMII 풀이: 통일하지 않음 (#196). 페이지마다 그대로. `mii`는 Gigabit MII, `1000base-t1`은 Gigabit Media Independent Interface
- MAC 풀이 Medium Access Control: Media Access Control (#165). 출처마다의 풀이를 비교하는 문장은 예외
- notification: 통지 (#257). AUTOSAR 모듈이 부르는 notification 콜백일 때. 동사로 쓴 자리("통지받는다")와 그 밖의 통지는 "통지"
- OOPSLA 풀이 Object-Oriented Programming, Systems, Languages, and Applications: Object-Oriented Programming, Systems, Languages & Applications (#291)
- OSEK OS: OSEK/VDX OS (#257). OS를 가리킬 때. 명세를 가리키는 "OSEK/VDX OS"는 그대로. 예: "OSEK/VDX OS 2.2.3 명세"
- prototyping: 프로토타이핑 (#291). prototype도 같다. AUTOSAR의 prototype은 이 결정에 들지 않음
- RAM 풀이 Random-Access Memory: Random Access Memory (#165)
- recessive: 리세시브 (#165). 조사는 원어의 발음대로. 예: "recessive이고"
- resource: 리소스 (#165). OSEK 객체일 때. 일반적인 뜻이면 "자원"
- root of trust: 신뢰의 뿌리 (#288)
- RSA 풀이 Rivest-Shamir-Adleman: Rivest–Shamir–Adleman (#288)
- TDC 풀이 Transceiver Delay Compensation: Transmitter Delay Compensation (#311)
- Timing Analysis and Design 보고서: AUTOSAR 타이밍 분석 보고서 (#257). 본문에서 AUTOSAR 문서를 부르는 이름
- Timing Extensions 명세: 타이밍 확장 명세 (#257). 본문에서 AUTOSAR 문서를 부르는 이름. "명세" 없이 쓴 "Timing Extensions"도 그대로
- USART 풀이 Universal Synchronous/Asynchronous Receiver/Transmitter: Universal Synchronous and Asynchronous Receiver Transmitter (#196)
- V2X 풀이 Vehicle-to-X: Vehicle-to-Everything (#257)
- validation: 통일하지 않음 (#288). "확인"과 원어 cybersecurity validation을 맥락에 따라. 페이지 `cybersecurity-verification-and-validation`의 title과 정의는 "확인"
- wakeup: 웨이크업 (#257). AUTOSAR가 다루는 wakeup일 때. 예: EcuM에 알리는 wakeup. 트랜시버와 버스의 웨이크업은 "웨이크업"
- 개인 키: 개인키 (#288)
- 결함 허용: - (#223)
- 공개 키: 공개키 (#288)
- 단위 테스트: 유닛 테스트 (#291)
- 대칭 키: 대칭키 (#288)
- 리프 노드: 잎 노드 (#250)
- 비대칭 키: 비대칭키 (#288)
- 비밀 키: 비밀키 (#288)
- 사이버보안 속성: cybersecurity property (#252)
- 생명주기: 수명주기 (#288)
- 서명 키: 서명키 (#288)
- 소스: 원천 (#346). 신호나 사건을 내는 하드웨어·기능일 때. 예: 인터럽트 소스, 클록 소스, 트리거 소스. 802.1AS의 timing source는 원어로. 기원을 뜻하는 일반 낱말 "원천"(원천 문서, 원천 모델)과 검증 자료인 "출처"는 그대로
- 송신 정지: 서스펜드 트랜스미션 (#68). 원어는 병기하지 않음
- 실수: 오류 (#291). ISTQB의 error(사람의 실수)일 때. 기법 이름 "오류 추정"과 일반적인 error는 "오류"
- 안전 메커니즘: 안전 기제 (#223)
- 암호 primitive: 암호 프리미티브 (#169)
- 엔드 스테이션: 종단국 (#196)
- 위협 시나리오: threat scenario (#252)
- 자산: asset (#252)
- 타원 곡선 암호: ECC (#289). 타원 곡선 암호를 가리킬 때. ECDSA·ECDH 같은 알고리즘 이름은 그대로. 예: SP 800-56A의 ECC CDH는 "타원 곡선 CDH"
- 태스크 그룹: 태스크 묶음 (#349). OSEK OS 명세의 group of tasks일 때
- 테스트 기준: test basis (#291)
- 테스트 케이스: 시험 사례, 시험 케이스 (#291)
- 트랜시버 지연 보상: 송신 지연 보상 (#311). 약어와 함께 쓰면 `트랜시버 지연 보상(TDC, Transceiver Delay Compensation)`
- 프레임 간 공간: 인터프레임 공간 (#68). 원어는 병기하지 않음
- 플래시: Flash (#257). 일반 낱말일 때. 모듈과 구성 요소의 이름(Fls(Flash Driver), Flash EEPROM Emulation, Flashing Adapter)은 예외
- 하위 호환: 역호환 (#257)
