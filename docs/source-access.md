# 출처 여는 법

출처를 받아 읽는 법과 호스트마다 다른 여는 법입니다. 봇 차단 응답을 출처 상태에서 어떻게 세는지와 봇 차단 호스트 목록은 [위키 검증](wiki-verification.md#봇-차단-호스트)에 있습니다. 받은 파일을 둘 폴더와 열리지 않을 때 할 일은 에이전트마다 달라 각 프롬프트가 정합니다.

- 받은 파일은 자기 폴더에만 두고, 브라우저는 자기 탭을 새로 열어 씁니다. 다른 에이전트가 같은 브라우저와 `.work/`를 함께 쓰기 때문입니다.
- 브리프의 `## 사본 목록`에 있는 출처는 사본만 읽고 다시 받지 않습니다. 인용할 주소는 원래 URL입니다.
- PDF와 정적 페이지는 `curl`로 받아서 읽습니다.
- 막히면 아래 [호스트별 여는 법](#호스트별-여는-법)을 먼저 씁니다. 브라우저는 호스트별 여는 법 표가 브라우저를 적은 호스트에만 씁니다.

## 호스트별 여는 법

호스트마다 자동 요청(`curl`)에 다르게 답합니다. "봇 차단"은 [봇 차단 호스트](wiki-verification.md#봇-차단-호스트)가 돌려주는 [봇 차단 응답](wiki-verification.md#출처-상태)입니다.

| 호스트                                          | 자동 요청에 오는 것                                            | 여는 법                                                                                                                                                                                                                                                               |
| ----------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ieeexplore.ieee.org`                           | 봇 차단                                                        | 브라우저로 문서 페이지(초록, Scope, Purpose, DOI, 판 목록)만 봅니다                                                                                                                                                                                                   |
| `standards.ieee.org`, `1.ieee802.org`           | 대개 200, 가끔 Cloudflare 403                                  | 403이면 Wayback                                                                                                                                                                                                                                                       |
| `www.nxp.com`의 PDF                             | "page not available" 404가 가끔 옵니다                         | Wayback. User-Agent에 따라 결과가 갈리기도 하니 다른 User-Agent도 시도합니다                                                                                                                                                                                          |
| `onsemi.com`                                    | 봇 차단이 오기도 합니다                                        | 브라우저로 엽니다                                                                                                                                                                                                                                                     |
| `marvell.com`, `dl.acm.org`                     | 403                                                            | Wayback                                                                                                                                                                                                                                                               |
| `www.autosar.org`                               | SSL 오류(60). 서버가 중간 인증서를 보내지 않습니다             | `curl -k`                                                                                                                                                                                                                                                             |
| `www.iso.org`(`/obp/ui/`)                       | 봇 차단                                                        | 화면 있는 브라우저로 엽니다. headless 브라우저는 Cloudflare 챌린지를 받습니다. 첫 화면의 약관에 체크한 뒤 "anonymous user"를 눌러 본문을 읽습니다. 사본으로 저장할 때는 목차의 Tables와 Figures 목록을 하나씩 펼친 뒤 저장합니다. 접혀 있으면 표·그림 제목이 빠집니다 |
| `www.iso.org`(`/standard/<n>.html`)             | 봇 차단(403)                                                   | 브라우저로 엽니다. 단계별 날짜는 접힌 Life cycle 목록 안에 있어 `innerText` 사본에 나오지 않으므로, 목록을 펼친 뒤 저장하거나 `.stage-date` 요소를 읽습니다                                                                                                           |
| `link.springer.com`                             | `curl`에 가끔 JS 챌린지(200 HTML)                              | 챌린지면 Wayback                                                                                                                                                                                                                                                      |
| `www.iec.ch`                                    | 403이나 WAF 챌린지                                             | Wayback. `assets.iec.ch`의 PDF는 그대로 열립니다                                                                                                                                                                                                                      |
| `www.electropedia.org`                          | 봇 차단                                                        | 브라우저로 엽니다. Wayback 스냅샷에도 본문이 있습니다                                                                                                                                                                                                                 |
| `webstore.iec.ch`                               | 레코드와 미리보기는 200. 옛 미리보기 주소(`/preview/…`)는 301  | 레코드(`/en/publication/<번호>`)와 미리보기(`/en/iec_catalog/product/preview/?id=<미리보기 PDF 경로의 base64>`)는 연 주소 그대로 인용합니다. 레코드 HTML에 다음 판의 단계와 발행 예정일이 있습니다                                                                    |
| `openstd.samr.gov.cn`(중국 국가표준 미리보기)   | `curl`은 레코드로 되돌아갑니다                                 | 화면 있는 Chrome으로 레코드(`newGbInfo?hcno=<hcno>`)를 연 뒤, 그 레코드를 referer로 `showGb?type=online&hcno=<hcno>`로 갑니다. 쪽이 텍스트 층 없는 이미지라 스크린숏으로 읽습니다                                                                                     |
| `www.sae.org/standards/content/…`               | 봇 확인, 리다이렉트, 내용 없는 페이지                          | `https://saemobilus.sae.org/standards/<문서>_<판>-<제목>`으로 열고 그 주소로 인용합니다. 현행판은 판 목록(revisions)에서 고릅니다                                                                                                                                     |
| `glossary.istqb.org`                            | 본문 없는 SPA 셸                                               | API(`https://api.glossary.istqb.org/v1/terms/<slug>`)의 JSON으로 읽고, `https://glossary.istqb.org/en_US/term/<slug>` 꼴로 인용합니다. 아래 ISTQB 용어집 문단을 봅니다                                                                                                |
| `unece.org`                                     | 봇 차단. 브라우저로도 Cloudflare 챌린지가 풀리지 않기도 합니다 | 문서 기호가 있는 문서(UN 규정 원문 등)는 `https://documents.un.org/api/symbol/access?s=<문서 기호>&l=en&t=pdf`로 PDF를 받습니다. 그 밖의 문서는 Wayback으로 엽니다. 아래 UN 규정 문단을 봅니다                                                                        |
| `eur-lex.europa.eu`                             | 봇 차단(202 WAF 챌린지). Node `fetch`와 Wayback도 같습니다     | EU 출판국 Cellar(`http://publications.europa.eu/resource/celex/<CELEX 번호>`)에 헤더 `Accept: application/pdf`(또는 `application/xhtml+xml`)와 `Accept-Language: eng`를 붙여 받습니다. 인용 주소는 eur-lex 주소 그대로 둡니다                                         |
| `www.law.go.kr`(`lsInfoP.do`, `admRulInfoP.do`) | 200이지만 본문 없는 페이지                                     | 같은 쿼리로 `lsInfoR.do`(법령)나 `admRulInfoR.do`(행정규칙)를 받아 읽고, `…InfoP.do` 주소로 인용합니다                                                                                                                                                                |
| `laws.e-gov.go.jp`(`/law/<법령 번호>`)          | 본문 없는 SPA 셸                                               | API(`https://laws.e-gov.go.jp/api/2/law_data/<법령 번호>`)의 JSON으로 읽고, `https://laws.e-gov.go.jp/law/<법령 번호>` 꼴로 인용합니다                                                                                                                                |
| `trustedcomputinggroup.org`                     | 봇 차단                                                        | Wayback                                                                                                                                                                                                                                                               |
| `www.nhtsa.gov`                                 | `curl`에는 User-Agent와 상관없이 Akamai 403                    | Node `fetch`로 받습니다. `static.nhtsa.gov`(리콜 PDF)와 `api.nhtsa.gov`는 `curl`로도 열립니다                                                                                                                                                                         |
| `www.markey.senate.gov`                         | `curl`에는 User-Agent와 상관없이 Akamai 403                    | Node `fetch`로 받습니다                                                                                                                                                                                                                                               |
| `opensig.org`(위원회 페이지)                    | 슬러그가 바뀌어 옛 주소는 404                                  | 사이트맵(`https://opensig.org/tech-committee-sitemap.xml`)에서 현재 주소를 찾습니다                                                                                                                                                                                   |

ISO와 IEC의 미리보기는 대개 서문, 소개, 적용 범위, 용어 정의(3절)까지만 보입니다. 4절 이후의 요구사항과 표에만 있는 주장은 미리보기로 검증하지 못하므로 사유가 `공개 범위 밖`입니다.

ISTQB 용어집의 슬러그는 용어와 다를 수 있습니다. 예: checklist-based reviewing은 `checklist-based-review`. 응답의 `version`이 2 이상이면 정의가 바뀐 용어이고, 옛 정의의 본문은 응답에 없습니다. 요청 한도(`X-RateLimit-Limit`)는 IP 하나에 걸려 병렬로 부르면 나눠 쓰므로, `X-RateLimit-Remaining`을 보고 간격을 둡니다.

UN 규정의 문서 기호는 Add 번호가 규정 번호와 다릅니다. 예: R155는 `E/ECE/TRANS/505/Rev.3/Add.154`, R156은 `Add.155`. `https://docs.un.org/en/<문서 기호>`는 본문 없는 문서 뷰어입니다. `documents.un.org`에는 원본과 개정(Amend)만 있으므로, UNECE가 올린 통합본은 Wayback으로 엽니다.

Wayback 스냅샷 가운데에는 403 페이지를 저장한 것도 있으니, 원래 문서가 담긴 가장 최근 스냅샷을 고릅니다. CDX(`https://web.archive.org/cdx/search/cdx?url=<원래 URL>&filter=statuscode:200`)는 200을 저장한 스냅샷의 시각과 MIME type을 오래된 것부터 줍니다. 고른 시각에 `id_`를 붙여 `https://web.archive.org/web/<시각>id_/<원래 URL>`로 받으면 툴바와 링크 재작성이 없는 원래 파일이 옵니다. `id_`는 받을 때만 붙이고 인용 주소에는 넣지 않습니다. CDX는 가끔 504를 주니 그때는 다시 요청합니다. 옛 주소가 새 판으로 넘어가는 호스트에서는 스냅샷도 새 판으로 넘어가 그 판을 놓칠 수 있습니다. 예: `unece.org`의 R155 `2021-03/R155e.pdf`는 `2023-02/R155e (2).pdf`로 넘어갑니다. 엔트리의 `url`에는 스냅샷 주소를, `note`에는 원래 URL을 적습니다. 예: `bib/nxp-tja1100-2017.bib`

## 접속 확인

검증자들은 출처가 열리지 않으면 `접근 실패`로 판정하고 넘어갑니다. 그래서 환경 때문에 호스트가 통째로 막히면 `접근 실패`가 무더기로 나오는데도 정상 결과처럼 보이고, 검증은 열리는 출처(벤더 문서 등)로 쏠립니다. 인제스트와 보강은 출처를 열기 전에 이를 확인합니다. 대상 호스트는 각 스킬이 정합니다.

1. 호스트마다 출처 하나를 `curl`로 요청하고, Wayback은 스냅샷 하나를 `curl -L`로 요청합니다.
2. 응답을 [봇 차단 호스트](wiki-verification.md#봇-차단-호스트) 표, 호스트별 여는 법 표와 견줍니다. 표에 적힌 응답이면 표의 여는 법으로 열어 봅니다. 표에 없는 실패(연결 실패, 시간 초과, 표에 없는 403이나 429)가 오거나 표의 여는 법으로도 열리지 않으면 그 호스트는 막힌 것입니다.
3. 아래 가운데 하나라도 해당하면 멈추고 소유자에게 막힌 호스트를 알립니다. 둘 다 검증이 열리는 출처로 쏠리는 경우입니다.
   - Wayback이 막혔습니다. 열리지 않는 출처를 대신할 길이 없어집니다.
   - 막힌 호스트에 [규범 주장의 1층](source-hierarchy.md#1층-출처) 출처 후보가 있습니다. 규범 주장을 검증할 출처가 사라지고 벤더 문서만 남습니다.

막힌 호스트가 그 밖의 출처만 가졌으면 멈추지 않습니다.
