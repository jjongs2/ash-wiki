# 엔진

사이트 엔진은 Quartz v5를 복제해 쓴다([ADR 0003](adr/0003-engine-and-citation-stack.md)).

## 기준선

| 항목       | 값                                                      |
| ---------- | ------------------------------------------------------- |
| 저장소     | https://github.com/jackyzha0/quartz                     |
| 브랜치     | `v5`                                                    |
| 기준선 SHA | `97a2d05f80c4c50534959b1d0d41cc4b3895625e` (2026-09-20) |

기준선 트리 중 다음은 가져오지 않았다. 업스트림의 문서 사이트(`docs/`), 업스트림 CI와 템플릿(`.github/`), `Dockerfile`, `CODE_OF_CONDUCT.md`, `README.md`, `content/.gitkeep`이다.

## 고친 파일

고친 파일 목록은 따로 적지 않고 기준선과의 `git diff`로 계산한다. 고친 이유는 각 파일 안의 주석에 있다.

```sh
git fetch https://github.com/jackyzha0/quartz.git 97a2d05f80c4c50534959b1d0d41cc4b3895625e
git diff --name-only --diff-filter=M 97a2d05f80c4c50534959b1d0d41cc4b3895625e HEAD -- . ':!README.md'
```

`README.md`는 이 저장소의 소개라 엔진 파일로 보지 않고 뺀다. 엔진 트리(`quartz/`) 안에 더한 파일은 `--diff-filter=A`로 본다. 더한 이유는 파일 맨 위의 주석에 있다.

```sh
git diff --name-only --diff-filter=A 97a2d05f80c4c50534959b1d0d41cc4b3895625e HEAD -- quartz
```

JSON 파일은 주석을 달 수 없어서, npm 관례에 따라 최상위 `"//"` 키에 이유를 적는다. `tsconfig.json`은 주석을 허용하는 JSONC라 주석으로 적는다.

이미지와 폰트도 주석을 달 수 없어서 이유를 여기 적는다.

- `quartz/static/icon.png`: 소유자의 손글씨 아이콘이다(#85). favicon과 OG 이미지가 이 파일을 읽는다.
- `quartz/static/fonts/monoplex-kr/`: 코드 폰트 Monoplex KR의 WOFF2와 받은 그대로 둔 `LICENSE.md`다(#612). 까닭은 같은 폴더의 `monoplex-kr.css` 머리 주석과 [팔레트](palette.md#폰트)에 있다.

## npm 플러그인 패치

고칠 것이 npm 플러그인 코드 안에 있을 때(컴포넌트에 박힌 문구나 값, 클라이언트 스크립트의 결함)는 `patches/`의 패치를, 플러그인이 낸 결과에 단계를 더할 때(거르기, 바꾸기, 덧붙이기)는 로컬 플러그인(`plugins/`)을 쓴다. 로컬 플러그인으로 컴포넌트를 감싸지 않는 까닭은 [ADR 0021](adr/0021-ui-locale-and-csl-locale.md)에 있다. 플러그인의 동작을 패치로 감당하지 못할 만큼 바꿀 때는 로컬 플러그인으로 fork한다([그래프](#그래프), [검색](#검색)). `npm ci`의 `postinstall`이 patch-package로 패치를 입힌다. 고친 플러그인은 `ls patches/`로 보고, 고친 이유는 패치가 더한 `// ash-wiki:` 주석에 있다.

- 패치는 `node_modules`의 파일을 고친 뒤 `npx patch-package <패키지>`로 만든다.
- 플러그인을 올려 패치가 맞지 않으면 `npm ci`가 실패한다. 새 버전에서 같은 자리를 다시 고쳐 패치를 만든다. Dependabot PR이면 그 브랜치에 커밋한다. 업스트림이 같은 자리를 고쳤으면 그 패치를 지운다.

## 설정

사이트 설정은 `quartz.config.yaml`에 둔다. 업스트림 기본값인 `quartz.config.default.yaml`은 고치지 않고, 설정 로더가 `quartz.config.yaml`을 먼저 읽는다. 기본값과 다르게 둔 항목 가운데 값만 봐서 이유를 알 수 없는 것은 `quartz.config.yaml`의 주석에 이유를 적는다.

## 태그 목록

태그 목록 페이지는 tag-page 플러그인이 만든다. 태그의 한국어 표시 이름은 `content/tags/<구역>.md`, `content/tags/<구역>/<주제>.md`의 `title`로 주고, 본문은 비워 둔다.

- 표시 이름 파일이 있으면, 그 태그를 쓰는 페이지가 없어도 태그 목록 페이지가 생긴다. 이때 목록은 비어 있다.
- 상위 태그 목록(`tags/network`)은 하위 태그 목록(`tags/network/can`)으로 링크하지 않는다. 대문이 두 층을 모두 직접 링크하는 이유다.
- 대문의 링크는 `[[tags/network|네트워크]]`처럼 표시 이름을 한 번 더 적는다. 별칭이 없는 위키링크는 대상 페이지의 `title`이 아니라 경로의 마지막 부분(`network`)을 보여 주기 때문이다.
- 표시 이름 파일은 태그 경로를 따라 `content/tags/` 아래 폴더에 둘 수밖에 없다. 슬러그를 폴더 없는 한 네임스페이스로 두는 규칙에서 `tags/`는 예외다.
- `content/tags/index.md`의 `title`은 브레드크럼에서 태그 목록으로 가는 마디의 이름이다. 없으면 경로 이름(`tags`)이 나온다.
- 태그 칩(태그 목록의 행, 본문 속성 표)과 태그 전체 목록의 제목은 슬러그 대신 표시 이름으로 쓴다. 칩은 대문의 주제 칩처럼 주제 이름만 쓰고, 전체 목록의 주제 제목만 `소프트웨어 플랫폼 › AUTOSAR`처럼 구역 이름을 붙인다. 태그 목록에서 지금 목록의 태그는 링크 없는 칩으로 흐리게 둔다. 두 플러그인이 슬러그를 그대로 찍어, `patches/`의 tag-page와 note-properties 패치가 고친다([npm 플러그인 패치](#npm-플러그인-패치)).

## 대문

대문(`content/index.md`)의 본문은 위키 링크로 쓴 구역 표 하나다. 행은 구역, 둘째 칸의 링크는 주제이고, 표 위에 제목을 두지 않는다. 대문만 그리는 로컬 페이지 타입(`plugins/front-page`)이 빌드할 때 구역 이름을 구역 색으로 칠하고, 주제 칩마다 그 주제의 페이지 수를 붙인다.

- 구역(행)과 한 행의 주제(링크)는 기반에서 응용 순으로 둔다. 예: 소프트웨어 플랫폼 행의 RTOS → AUTOSAR, 보안·업데이트 행의 암호 → 사이버보안 → OTA.
- 새 주제는 그 구역 행에 링크로, 새 구역은 표에 행으로 이 기준에 맞는 자리에 더한다. 페이지 수와 탐색기 순서는 따라오고, 구역 색은 [팔레트](palette.md#새-구역에-색을-더할-때)의 절차로 더한다.
- 페이지 수는 태그 목록 페이지와 같은 규칙으로 센다. 계산 규칙은 `plugins/front-page`에 있다.
- 본문 아래는 2단이다. 왼쪽은 주간 소식, 오른쪽은 최근 변경이다. 좁은 화면에서는 1단으로 쌓고, 비어 있는 칸은 숨긴다.
- 주간 소식 칸은 최신 호의 주요 소식을 최근 변경과 같은 타임라인으로 보인다. 발행일마다 최근 날부터 마디를 두고, 그 아래 호의 그 소식 항목으로 가는 제목과 제목 아래의 구역 칩을 둔다. 칸 제목 줄에는 그 호로 가는 "N건 모두 보기"(N은 그 호의 소식 항목 수)와 지난 호 링크가 있다. 주간 소식 플러그인(`plugins/weekly-news`)이 파일마다 읽어 둔 소식 항목에서 고른다. 주요 소식이 없는 호면 그렇다는 한 줄과 제목 줄 링크만 두고, 주간 소식이 없으면 칸을 비워 둔다. 주요 소식을 고르는 기준은 [소식 조사](../.claude/skills/wiki-news/SKILL.md#6-주요-소식)에, 형식과 노출 범위는 [주간 소식](weekly-news.md)에 있다.
- 최근 변경은 `content:` 커밋을 PR 단위로 묶어 날짜별 타임라인으로 보이고, 묶음 제목은 그 PR로 링크한다. 묶는 규칙과 개수는 `plugins/front-page`에 있다. 빌드할 때 git 기록에서 읽으므로 배포 빌드도 전체 기록을 받는다([배포](deploy.md#커밋-기록)).

## 탐색기

탐색기는 폴더 대신 태그로 구역 › 주제 › 페이지 트리를 그린다. 트리 규칙과 탐색기에 잇는 방식은 `plugins/explorer-tree`에 있다.

- 구역과 주제의 이름은 표시 이름 파일의 `title`에서 온다. 새 태그는 표시 이름 파일과 대문 구역 표의 링크만 더하면 트리에 따라온다.
- 구역과 주제의 순서는 대문에서 그 링크(`tags/<구역>`, `tags/<구역>/<주제>`)가 처음 나온 순서로 읽는다. 대문의 구역 표 위에 태그 링크를 두면 탐색기의 순서가 바뀐다. 대문에 없는 구역과 주제는 대문에 있는 것 뒤에 이름순으로 둔다.
- 페이지는 한국어 정렬(가나다 뒤에 로마자)의 오름차순이다.

## locale

사이트 locale(`quartz.config.yaml`의 `locale`)은 `ko-KR`이고, 참고문헌의 CSL만 `en-US`이다([ADR 0021](adr/0021-ui-locale-and-csl-locale.md)).

- UI 문구, 화면의 날짜, 문서의 `lang`이 사이트 locale을 따른다.
- 읽는 시간은 본문 위에도 OG 이미지에도 보이지 않는다. 위키는 절을 골라 읽고, 한글 음절을 단어 하나로 세는 추정은 길게 잡힌다(#460).
- 참고문헌의 고정 문구(`Accessed`, `[Online]. Available` 등)와 인용 번호는 CSL의 `en-US`로 낸다. 빌드는 CSL locale 파일을 원격에서 받지 않는다.
- 화면의 날짜 하나는 ISO 8601(`2026-10-05`)로 쓴다. 폭이 늘 같아 목록에서 세로로 맞고, 프론트매터와 인용하는 표준 문서의 꼴과 같다. 기간은 `10월 5일 ~ 10월 11일`로 쓰고, 기준 해와 다른 날짜에만 연도를 붙인다(`2025년 12월 29일 ~ 1월 4일`). RSS의 `pubDate`는 RFC 822라 영어 그대로다.
- UI 이름은 [위키 규약의 용어](wiki-conventions.md#용어) 순서로 고른다. 검색, 탐색기, 그래프 뷰, 목차, 백링크 같은 이름은 기술 용어가 아니라 화면의 안내 말이라, 한국어 화면에서 원어가 자연스럽지 않아 한국어로 쓴다. 원어로 두는 것은 고유 이름(Æ wiki, Quartz, GitHub)과 푸터의 출처 표시 줄(`Created with Quartz`)이다. 출처 표시 줄은 한국어 사이트에서도 원어로 두는 일이 흔하고, 한국어 문구(`제작:`)를 앞에 붙이면 Quartz가 사이트를 만든 주체로 읽힌다.
- npm 플러그인은 저마다 번역 사본을 품고 있어, 엔진의 번역 파일을 고쳐도 플러그인 문구는 바뀌지 않는다. 플러그인 문구는 [npm 플러그인 패치](#npm-플러그인-패치)로 고친다.
- 엔진의 번역(`quartz/i18n/locales/ko-KR.ts`)은 엔진 파일이라 패치 없이 직접 고치고, 이유를 주석에 적는다([고친 파일](#고친-파일)).

## 그래프

그래프는 그래프 플러그인을 fork한 로컬 플러그인(`plugins/graph`)이 그린다. 업스트림에는 노드 색을 묶는 기능도, 그래프에서만 페이지를 빼는 기능도 없다.

local graph는 태그 노드 없이 링크로 이은 페이지를 그리고, 칸을 넘으면 다 보이게 줄인다. global graph는 주제 노드를 구역끼리 모아 구역 영역과 구역 이름 위에 그린다. 노드는 구역 색으로 칠한다([팔레트](palette.md#구역-색)). 주간 소식(`news/`)은 그래프에 오르지 않는다. 노드와 선을 고르는 규칙은 `plugins/graph/model.ts`에, 노드 크기와 펼치기 같은 그리기는 `plugins/graph/script.js`에 있다.

| 항목       | 값                                                      |
| ---------- | ------------------------------------------------------- |
| 저장소     | https://github.com/quartz-community/graph               |
| 버전       | 1.0.0 (태그 `v1.0.0`)                                   |
| 기준선 SHA | `e647019c05ab2a3279c9cddd7bc2f18acb9858b8` (2026-09-15) |
| 라이선스   | MIT (`plugins/graph/LICENSE`)                           |

기준선의 파일은 다음처럼 옮겼다. 고친 이유는 각 파일의 주석에 있다.

- `script.js`: `src/components/scripts/graph.inline.ts`를 저장소의 Prettier 꼴로 바꾼 것이다. 업스트림 빌드처럼 esbuild로 묶어 싣는다.
- `style.css`: `src/components/styles/graph.scss`를 sass로 컴파일한 것이다.
- `index.ts`: `src/components/Graph.tsx`를 JSX 없이 preact의 `h`로 옮긴 것이다.

업스트림이 바뀌면 기준선과 새 판을 비교하고, 기준선과 fork를 비교해 고친 곳을 본다. 업스트림 저장소를 `graph/`에 받아 기준선을 checkout한 뒤 다음을 돌린다.

```sh
npx prettier --stdin-filepath plugins/graph/script.js < graph/src/components/scripts/graph.inline.ts | diff - plugins/graph/script.js
npx sass --no-source-map graph/src/components/styles/graph.scss | npx prettier --stdin-filepath plugins/graph/style.css | diff - plugins/graph/style.css
```

## 검색

검색은 검색 플러그인을 fork한 로컬 플러그인(`plugins/search`)이 그린다. 업스트림은 별칭을 색인하지 않고, 영문과 숫자를 공백에서만 끊고, 결과를 FlexSearch 순서로만 보인다.

별칭은 content-index 패치가 색인에 싣는다([npm 플러그인 패치](#npm-플러그인-패치)). 텍스트 검색은 모든 페이지의 제목·별칭·본문을 훑어, 검색어의 낱말을 담은 페이지를 찾는다(띄어 쓰거나 문장부호가 끼어든 꼴 포함). FlexSearch는 한글을 음절로 끊어 흩어진 음절에도 맞고, 필드마다 모든 낱말이 맞는 페이지만 내며, 순위에 쓸 낱말별 페이지 수를 주지 않기 때문이다. FlexSearch는 검색어 없이 태그로만 찾을 때 쓴다.

결과는 검색어와 제목·별칭이 정확히 맞는 페이지, 낱말을 모두 담은 위키 페이지와 태그 페이지, 일부만 담은 위키 페이지와 태그 페이지, 주간 소식의 호 순이다. 낱말을 모두 담은 페이지는 모두 제목에 있는 페이지, 모두 별칭에 있는 페이지, 나머지 순이고, 일부만 담은 페이지는 담은 낱말 수 순이다. 그 안에서는 본문의 BM25 점수 순이고, 호는 최신 주차부터다. BM25는 길이로 깎지 않는다(b = 0). 이 위키는 한 개념을 다루는 주 페이지가 길어, 길이로 깎으면 그 페이지가 밀린다. 정확히 맞는 기준, 맞춤 규칙, 결과 순서, 순위, 강조할 자리는 `plugins/search/model.ts`에 있다.

| 항목       | 값                                                      |
| ---------- | ------------------------------------------------------- |
| 저장소     | https://github.com/quartz-community/search              |
| 버전       | 1.0.0 (태그 `v1.0.0`)                                   |
| 기준선 SHA | `f425045ac21f74210f858b10c8ab3a40f70b76eb` (2026-09-15) |
| FlexSearch | 0.8.212 (업스트림 lock의 판)                            |
| 라이선스   | MIT (`plugins/search/LICENSE`)                          |

기준선의 파일은 다음처럼 옮겼다. 고친 이유는 각 파일의 주석에 있다.

- `script.ts`: `src/components/scripts/search.inline.ts`를 저장소의 Prettier 꼴로 바꾼 것이다. 업스트림 빌드처럼 esbuild로 묶어 싣는다.
- `style.css`: `src/components/styles/search.scss`를 sass로 컴파일한 것이다.
- `index.ts`: `src/components/Search.tsx`를 JSX 없이 preact의 `h`로 옮긴 것이다.

업스트림이 바뀌면 [그래프](#그래프)와 같은 절차로 비교한다. 업스트림 저장소를 `search/`에 받아 기준선을 checkout한 뒤 다음을 돌린다.

```sh
npx prettier --stdin-filepath plugins/search/script.ts < search/src/components/scripts/search.inline.ts | diff - plugins/search/script.ts
npx sass --no-source-map search/src/components/styles/search.scss | npx prettier --stdin-filepath plugins/search/style.css | diff - plugins/search/style.css
```

## 인용

`[@키]`를 citations 플러그인이 IEEE 스타일의 번호로 바꾸고, 페이지 하단에 참고문헌을 붙인다([ADR 0003](adr/0003-engine-and-citation-stack.md)). 표기 규칙은 [위키 규약](wiki-conventions.md)에 있다.

- `npm run build`의 prebuild(`npm run bib`)가 `bib/`의 엔트리 파일을 합본 `bibliography.bib`로 합친다. 합본은 추적하지 않는다.
- citations 플러그인은 참고문헌의 URL을 텍스트로 둔다. 그 뒤에 도는 로컬 플러그인(`plugins/bibliography-links`)이 참고문헌 항목 안의 URL을 새 탭 링크로 바꾼다. 본문의 외부 링크는 crawl-links의 `openLinksInNewTab`이 새 탭으로 연다. 위키링크, 인용 번호 같은 내부 링크는 같은 탭에서 열린다.
- 페이지 설명(메타 설명, OG 이미지, 피드)과 검색 본문에는 인용 표시가 없다. 로컬 플러그인(`plugins/citation-free-description`)이 인용 표시를 뺀 본문 글로 만든다. 까닭은 `quartz.config.yaml`의 주석에 있다.
- 인용 번호는 대괄호째 위첨자로 보이고, 참고문헌은 "참고문헌" 라벨 아래 번호 열과 항목 열로 보인다. 모양은 `quartz/styles/custom.scss`가 맡는다.
- CSL은 저장소가 소유한다(`csl/ieee.csl`). 고치지 않고 가져온 그대로 둔다.

| 항목     | 값                                                      |
| -------- | ------------------------------------------------------- |
| 저장소   | https://github.com/citation-style-language/styles       |
| 파일     | `ieee.csl`                                              |
| 커밋     | `1ccf4696be22ea0b55f83cc9163bde3061fddb0a` (2026-01-07) |
| 라이선스 | [README 라이선스 절](../README.md#라이선스)             |
