# 같은 규칙의 사본이 어긋나는 것을 기계로 잡거나 막는 방법은 무엇인가

티켓: #713

## 답

DRY는 코드만이 아니라 문서를 포함한 지식마다 권위 있는 표현을 하나 두라는 원칙이고(C1), 그 표현에서 권위 없는 사본을 생성하는 것을 수단으로 든다(C2). 이 저장소에서도 사본이 실제로 어긋났다. 원칙이 문서에 없던 동안 규칙을 옮겨 적은 PR이 여러 세션에서 나왔고(C17), 용어집이 운영 문서의 규칙과 어긋났으며(C18), 프롬프트 넷이 같은 줄을 거의 같은 글로 적었다(C19, C20). 지금은 원칙을 문서로 두고(C21) 사람과 리뷰로 지킨다.

방법은 사본을 없애는 쪽, 생성하고 검사하는 쪽, 사본을 찾는 쪽, 가리키는 쪽에 지문을 다는 쪽으로 나뉜다.

| 방법                           | 막는가, 잡는가                                                    | 비용                                                                                                 | 근거               |
| ------------------------------ | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------ |
| transclusion (include, conref) | 막는다. 사본이 원문을 렌더 때 끌어온다                            | 렌더 도구가 있어야 하고, 끌어온 조각은 따로 읽을 문서가 아니다. 경로가 깨지면 빌드가 실패해야 잡힌다 | C8, C9, C10, C11   |
| 생성 + `--check`               | 막는다. 사본을 손으로 고치거나 다시 생성하지 않으면 CI가 실패한다 | 생성기를 유지한다. 바뀜이 잦을 때 값을 한다                                                          | C3, C4, C5, C6, C7 |
| 사본 찾기 (jscpd 등)           | 잡는다. 되풀이된 토큰 열을 찾는다                                 | 말을 바꿔 다시 적은 사본은 놓칠 수 있다                                                              | C12, C13, C14      |
| 지문 달린 가리킴               | 잡는다. 정본이 바뀌면 가리키는 쪽을 다시 보라고 표시한다          | 가리키는 쪽마다 정본의 ID와 지문을 적고, 다시 본 뒤 표시를 지운다                                    | C15, C16           |

**함의(결정은 #714).**

- 이 저장소에 기록된 사본은 정본 문장을 그대로 옮긴 것이 아니라 거의 같은 글이나 다시 적은 글이다(C19, C20). 사본 찾기는 토큰 열이 같은 사본을 찾아, 말을 바꾼 사본은 놓칠 수 있다(C13, C14). 생성은 여러 곳에 그대로 실을 글에만 쓸 수 있다.
- transclusion은 렌더 단계가 있어야 한다(C8, C10, C11). 운영 문서와 스킬은 GitHub와 에이전트가 원문 그대로 읽어, 끌어올 단계가 없다. 에이전트 쪽의 import는 [에이전트가 읽는 문서의 일관성](agent-doc-consistency.md)에서 다룬다.
- 생성 + `--check`(C4, C6, C7)는 같은 글을 여러 곳에 둘 수밖에 없는 자리, 예컨대 표 하나를 여러 문서가 그대로 싣는 자리에만 값을 한다(C3).
- 지문 달린 가리킴(C15, C16)은 "다시 적지 않고 가리킨다"(C21)와 맞는다. 가리키는 줄에 정본 절의 ID와 지문을 달면, 정본이 바뀐 PR에서 그 절을 가리키는 스킬과 프롬프트가 목록으로 나온다. 비용은 가리키는 줄마다 지문을 갱신하는 손이다.

## 주장

| ID  | 주장                                                                                                      | 출처                             | 인용                                                                                                                                                                                             | 신뢰도 |
| --- | --------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| C1  | DRY는 문서를 포함한 지식마다 권위 있는 표현을 하나만 두라는 원칙이다                                      | S220                             | "DRY says that every piece of system knowledge should have one authoritative, unambiguous representation."                                                                                       | H      |
| C2  | DRY의 저자는 권위 있는 표현 하나에서 권위 없는 산출물을 생성하는 것을 수단으로 든다                       | S220                             | "These let you have single, authoritative representations that then generate non-authoritative work products, like code or DDLs (data description languages)."                                   | H      |
| C3  | DRY의 저자는 생성기를 투자로 보고, 바뀜이 잦을 때 값을 한다고 본다                                        | S220                             | "If you expect a lot of volatility, a code generator can be a good investment."                                                                                                                  | H      |
| C4  | cog는 `--check`로 다시 돌려도 파일이 바뀌지 않는지 검사한다                                               | S221                             | "--check Check that the files would not change if run again."                                                                                                                                    | H      |
| C5  | cog는 생성한 글에 체크섬을 달아, 손으로 고친 생성 글을 덮어쓰지 않고 멈춘다                               | S221 Checksummed output          | "If the generated code is edited by a misguided developer, the next time cog is run, the checksum won’t match, and cog will stop to avoid overwriting the edited output."                        | H      |
| C6  | embedme는 Markdown에 파일 내용을 넣고, `--verify`로 CI에서 다시 넣을 것이 없는지 검사한다                 | S222 CI Checks                   | "If you're using continuous integration, you can pass the flag `--verify` to `embedme` to check that there are no changes expected to your files."                                               | H      |
| C7  | eslint-doc-generator는 ESLint 규칙 문서를 생성하고, CI용 검사 스크립트와 로컬 갱신 스크립트를 함께 권한다 | S223                             | "Automatic documentation generator for ESLint plugins and rules." … "Both a lint script to ensure everything is up-to-date in CI and an update script for contributors to run locally"           | H      |
| C8  | PyMdown Snippets는 Markdown에 다른 파일을 끌어오고, 조각을 못 찾을 때 빌드를 실패시키는 설정을 둔다       | S224 Overview, check_paths       | "Snippets is an extension to insert markdown or HTML snippets into another markdown file." … "Make the build fail if a snippet can't be found."                                                  | H      |
| C9  | Snippets의 표기는 찾아 바꾸기 같은 글 고침에 깨질 수 있다                                                 | S224                             | "A change that rewrites text, such as a find and replace, can rewrite that notation, and the nested snippet will then be lost (or fail if check_paths is enabled), often with a confusing path." | H      |
| C10 | Docusaurus에서 끌어오는 Markdown 조각은 문서 페이지가 되지 않는다                                         | S225 Importing Markdown          | "By convention, using the _ filename prefix will not create any doc page and means the Markdown file is a "partial", to be imported by other files."                                             | H      |
| C11 | DITA conref는 끌어온 내용이 새 자리에서도 유효한지 처리기가 검사하게 한다                                 | S226 2.4.2                       | "When processing content references, DITA processors compare the restrictions of each context to ensure that the conrefed content is valid in its new context."                                  | H      |
| C12 | jscpd는 Markdown을 지원 형식에 둔다                                                                       | S228                             | "Markdown, lightweight markup language. Fenced code blocks are tokenized independently by language."                                                                                             | H      |
| C13 | jscpd는 사본을 글의 되풀이가 아니라 언어 토큰 열의 되풀이로 정의한다                                      | S227 Duplicate detection         | "a clone is a repeated sequence of _language tokens_, never a repeated run of text"                                                                                                              | H      |
| C14 | jscpd의 근사 사본 탐지는 몇 줄을 더하거나 고친 사본까지를 하나로 묶는다                                   | S227 Duplicate detection         | "`--max-gap-lines N` merges a copy with a few inserted or changed lines into one `similar` clone with a similarity score"                                                                        | H      |
| C15 | Doorstop은 링크에 위 항목의 지문을 적고, 위 항목이 바뀌면 그 링크를 suspect로 보고한다                    | S201 Clear Suspect Links         | "When the fingerprint of a parent item changes, the link is reported as suspect during validation."                                                                                              | H      |
| C16 | OFT는 항목의 판을 올리면 그 항목으로 오는 링크를 모두 무효로 해, 가리키는 쪽이 다시 보게 한다             | S202 Specification Item Revision | "Incrementing the revision voids all existing links to this item so that authors linking to the item know they have to check for changes and adapt the covering items."                          | H      |
| C17 | 이 저장소에서 정본 하나 원칙이 문서에 없던 동안 규칙을 옮겨 적은 PR이 여러 세션에서 나왔다                | S229 What to build               | "그래서 리뷰가 근거 문서 없이 원칙을 추론해 왔고, 규칙을 옮겨 적은 PR이 여러 세션에서 나왔다."                                                                                                   | H      |
| C18 | 이 저장소의 용어집이 운영 문서의 규칙을 다시 적어 출처 위계 문서와 어긋난 일이 있다                       | S229 What to build               | "원 논문 항목의 "같은 권위로 친다"는 출처 위계 문서의 "둘이 다르게 말하면 원 논문을 따릅니다"와 어긋난다."                                                                                       | H      |
| C19 | 이 저장소의 에이전트 프롬프트 넷이 출처 여는 법의 공통 줄을 거의 같은 글로 적었다                         | S230 What to build               | "검증자, 출처 경로 검증자, 초안, 도해 프롬프트가 거의 같은 글로 적는다."                                                                                                                         | H      |
| C20 | 이 저장소의 재조사 프롬프트는 약 25%가 다른 문서의 규칙을 다시 적은 것이었다                              | S230 What to build               | "`reinvestigator.md`의 약 25%가 그렇다."                                                                                                                                                         | H      |
| C21 | 이 저장소는 정본 하나 원칙을 문서로 두지만, 그것을 보는 검사는 `npm run check`에 없다                     | S215 14줄; S216 scripts.check    |                                                                                                                                                                                                  | M      |
