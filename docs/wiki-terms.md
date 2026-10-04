# 용어 표기 결정

위키 페이지의 용어 표기에 대한 소유자 결정의 목록입니다. 표기를 고르는 순서와 결정을 더하는 절차는 [위키 규약](wiki-conventions.md#용어)에 있습니다.

약어를 풀이하느냐 마느냐는 [풀이하지 않는 약어](wiki-abbreviations.md) 목록이 정합니다. 이 목록은 풀이할 때 어느 풀이 문자열을 쓰는지와, 원어·한국어·음차 가운데 무엇을 쓰는지를 정합니다.

한 줄에 결정 하나를 `- <쓰는 표기>: <쓰지 않는 표기> (#<결정 이슈나 PR>)`로 적습니다. 조건이나 예외가 있으면 줄 끝에 `. <조건이나 예외>`를 붙입니다.

- 약어의 풀이는 쓰는 표기를 `<약어> 풀이 <풀이>`로 적습니다.
- 통일하지 않기로 한 결정은 쓰는 표기 칸에 원어를, 쓰지 않는 표기 칸에 `통일하지 않음`을 적고, 어디에 무엇을 쓰는지를 조건에 적습니다.
- 버린 표기가 기록되지 않은 결정은 쓰지 않는 표기 칸을 `-`로 둡니다.
- `aliases`와 인용한 문서의 제목은 이 목록에 걸리지 않습니다. alias는 다른 표기로도 찾아오게 하는 자리이고, 문서 제목은 원문 그대로 씁니다.

줄은 쓰는 표기의 가나다순으로 둡니다. 라틴 문자는 한글보다 앞에 두고 대소문자를 가리지 않으며, 기호와 공백은 글자보다 앞에 둡니다. 결정을 더하는 PR끼리 같은 줄을 고치지 않게 하려는 꼴입니다.

- API 풀이 Application Programming Interface: Application Program Interface (#165)
- ASPICE: Automotive SPICE, A-SPICE (#231). 판을 붙일 때는 `ASPICE 4.1`처럼 쓴다. 정식 이름은 `automotive-spice` 머리말의 풀이에만, A-SPICE는 그 페이지의 alias로만 둔다. 문서 이름 "Automotive SPICE for Cybersecurity"와 슬러그는 예외
- asset: 통일하지 않음 (#252). `cybersecurity-property`는 "자산", `threat-analysis-and-risk-assessment`는 원어
- cybersecurity property: 통일하지 않음 (#252). `cybersecurity-property`는 "사이버보안 속성", `threat-analysis-and-risk-assessment`는 원어
- dominant: 도미넌트 (#165). 조사는 원어의 발음에 맞춘다. 예: "dominant가"
- GMII 풀이: 통일하지 않음 (#196). MII를 풀이한 페이지는 RMII, RGMII와 같은 꼴로 Gigabit MII, 그렇지 않은 페이지는 Gigabit Media Independent Interface
- MAC 풀이 Medium Access Control: Media Access Control (#165). 출처마다의 풀이를 비교하는 문장은 예외
- RAM 풀이 Random-Access Memory: Random Access Memory (#165)
- recessive: 리세시브 (#165). 조사는 원어의 발음에 맞춘다. 예: "recessive이고"
- resource: 리소스 (#165). OSEK 객체일 때. 일반적인 뜻이면 "자원"
- threat scenario: 통일하지 않음 (#252). `cybersecurity-property`는 "위협 시나리오", `threat-analysis-and-risk-assessment`는 원어
- USART 풀이 Universal Synchronous/Asynchronous Receiver/Transmitter: Universal Synchronous and Asynchronous Receiver Transmitter (#196)
- 결함 허용: - (#223)
- 리프 노드: 잎 노드 (#250)
- 송신 정지: 서스펜드 트랜스미션 (#68)
- 안전 메커니즘: 안전 기제 (#223)
- 엔드 스테이션: 종단국 (#196)
- 프레임 간 공간: 인터프레임 공간 (#68)
