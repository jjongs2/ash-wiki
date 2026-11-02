# 매체 목록과 검색 질의

[소식 조사](SKILL.md)가 실행마다 살피는 매체(원문을 펴내는 곳)와 검색 질의다. 쓰는 순서는 [3. 찾기](SKILL.md#3-찾기)가 정한다.

## 열

- **매체**: 원문을 펴내는 곳의 이름. 소식 항목의 `매체` 필드는 이 열의 이름을 그대로 쓴다. 목록에 줄이 없는 곳은 같은 곳을 실은 가장 최근 호의 표기를 쓰고, 리콜이 아닌 NHTSA 문서는 `NHTSA`다. 소식 조사의 기계 검사가 목록의 이름과 비슷하지만 다른 값을 실패로 낸다([7. 쓰기](SKILL.md#7-쓰기)).
- **구역**: 그 매체가 주로 다루는 구역 태그(`content/tags/<구역>.md`)나 기타. 여러 구역을 고루 다루면 `전체`.
- **찾는 법**: 피드 URL, 뉴스룸 URL, 그 매체를 대상으로 한 검색 질의 가운데 하나.
- **거르기**: `없음`은 찾는 법이 내놓는 글이 모두 범위 안이라는 뜻이다. `제목으로 고름`은 범위가 넓어서, 그 주의 글 제목을 모두 읽고 고른다는 뜻이다. `질의`는 검색 질의 자체가 거르기라는 뜻이다.
- **비고**: 피드 깊이(항목 수, 거슬러 보는 법), 브라우저 필요, 배포처, 섞이는 글.

## 더하는 기준

조사로 더하는 매체와 목록 추가 후보에 같은 잣대를 쓴다. 목록에 둘 곳이면서 실행마다 살필 가치가 있는 곳을 받는다. 목록 추가 후보를 언제 확인하고 어느 표에 적는지는 [7. 쓰기](SKILL.md#7-쓰기)가 정한다.

목록에 둘 곳은 다음 가운데 하나다. 소식 항목을 고르는 기준(제품·인증 발표 문턱 포함)은 따로 있는 [4. 고르기](SKILL.md#4-고르기)이고, 1층 출처만 받지는 않는다([ADR 0015](../../../docs/adr/0015-weekly-news-outside-wiki-content.md)).

- **1차 발표를 내는 곳**: 표준 단체, 규제 기관, 벤더 등.
- **원 보도를 하는 믿을 만한 매체**: 보도자료를 옮기기보다 직접 취재하거나 해설하는 매체.

실행마다 살필 가치는 다음 둘로 보고, 비고에 적는다.

- **꾸준함**: 최근 3개월에 낸 자동차 임베디드 글의 수. 한 달에 두어 건은 되어야 한다.
- **찾는 비용**: 찾는 법과 피드 깊이. 피드면 항목 수, 가장 오래된 글까지의 기간, 거슬러 보는 법이고, 브라우저가 필요하면 그것도 적는다. 루틴 환경에서 열리지 않는 곳은 찾는 법을 검색 질의로 둔다.

드물게 내도 1차 발표를 내는 규제 기관, 표준 단체, 보안 연구(Federal Register 등)는 꾸준함에 못 미쳐도, 좁은 검색 질의 하나로 살필 수 있으면 받는다. 찾는 법은 그 검색 질의로 두고, 비고에 `드물게 냄`을 적는다.

비고에는 **무료**(구독이나 결제 없이 본문 전체가 열리는지, 일부만 열리면 그 비율)도 적는다.

## 빼는 기준

줄이 다음 가운데 하나에 들면, 실행이 PR에 목록 제외 후보로 이유와 함께 적는다([9. PR](SKILL.md#9-pr)). 빼는 것은 소유자가 PR에서 정하고, 실행은 줄을 지우지 않는다.

- 찾는 법이 열리지 않고, 대신할 검색 질의도 없다.
- 유료로 바뀌었거나, 광고성 글만 남았다.
- main에 있는 최근 3개월치 주간 소식(호의 주차 기준, 실행일 전 13주)에 그 매체의 소식 항목이 없다. 소식 항목의 `매체` 필드로 센다. 비고에 `드물게 냄`이나 `배포처`가 있는 줄은 이 조건으로 빼지 않는다. 배포처(PR Newswire 등)는 1차 발표를 찾는 실마리라, [1차 발표 우선](SKILL.md#4-고르기) 때문에 `매체`에 오르지 않는다.

## 접속

- curl에는 브라우저 User-Agent를 붙인다(`-A 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'`). 기본 User-Agent는 막는 매체가 있다.
- curl이 막히면 Node `fetch`(같은 User-Agent), 그것도 막히면 브라우저 순으로 연다. 비고의 "브라우저 필요"는 Playwright headless Chromium으로 연다는 뜻이다. 루틴 환경에는 `/opt/pw-browsers` 아래 Chromium이 있고, 설치한 Playwright가 다른 판을 찾으면 `executablePath`로 그 Chromium을 준다.
- 같은 호스트에는 요청 사이를 1초 이상(arXiv는 [검색 질의 절](#검색-질의)의 간격) 띄우고, 병렬 요청을 몰지 않는다.
- 브라우저는 여러 에이전트가 함께 쓴다. 자기 탭을 열어 쓰고 끝나면 닫는다.
- 루틴 환경은 네트워크 접근이 Full인 환경이어야 한다. 허용 호스트가 정해진 기본 환경에서는 매체가 모두 막힌다.

## 매체 목록

확인일 2026-10-12. 찾는 법은 확인일에 열어 확인했다(확인일에 있던 줄은 루틴 환경에서, 뒤에 더한 줄은 더한 날에). 그 뒤 비고와 다른 접속 결과는 소식 조사가 그 줄을 고친다([7. 쓰기](SKILL.md#7-쓰기)). 꾸준함은 2026-07-12\~10-11에 낸 자동차 임베디드 글 수를 제목으로 센 어림값이다.

<!-- prettier-ignore -->
| 매체 | 구역 | 찾는 법 | 거르기 | 비고 |
|---|---|---|---|---|
| AUTOSAR | platform | 뉴스룸 `https://www.autosar.org/news-events` | 없음 | 3개월 6건. 피드 없음. 쪽 넘김 `/news-events/page-2`. 날짜 꼴 `DD.MM.YYYY`. 무료. |
| SAE International | 전체 | 검색 질의 `https://news.google.com/rss/search?q=site:sae.org/news+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 표준 소식(Standards Newsroom)과 보도자료. 3개월 약 17건이 며칠에 몰려 올라오고, 자동차 임베디드는 5건 안팎이며 항공·소재가 많다. 피드 없음. 루틴 환경에서 뉴스룸(`https://www.sae.org/standards/news-room`)은 curl, Node fetch, 브라우저 모두 빈 틀이라 검색 질의로 찾는다. 무료. |
| CAN in Automation (CiA) | network | 뉴스룸 `https://www.can-cia.org/services/publications/can-community-news` | 제목으로 고름 | CAN Community News가 3주 간격으로 나오고, 한 호에 소식 5\~8건. 최신 호로 넘어가며 호 목록은 아래에 있다. 보도자료 목록(`/news/pr-english`)은 6월 뒤로 새 글이 없다. 산업용 CAN 소식이 섞인다. 무료. |
| ASAM | sw-engineering, 기타 | 뉴스룸 `https://www.asam.net/news-media/news/` | 없음 | 3개월 0건, 2026년 1건(2025년 6건). 피드 없음. 연도별 목록 `/news-media/news/2026/`. 루틴 환경에서는 curl과 Node fetch가 빈 틀이라 브라우저 필요. 무료. |
| ISO | 전체 | 검색 질의 `https://isopublicstorageprod.blob.core.windows.net/opendata/_latest/iso_deliverables_metadata/json/iso_deliverables_metadata.jsonl`(ISO 오픈 데이터. `publicationDate`가 그 주이고 `ownerCommittee`가 `ISO/TC 22`나 그 분과(`ISO/TC 22/SC …`), `ISO/TC 204`인 발행물) | 제목으로 고름 | 확인일 2026-10-21. 오픈 데이터는 매일 갱신되는 약 80MB JSONL이고 curl로 열린다(로컬에서만 확인). 두 위원회의 2026-09 발행물은 4건이었다. 항목의 `id`로 표준 페이지(`https://www.iso.org/standard/<id>.html`)를 만들고, 페이지는 봇 차단이라 `docs/source-access.md`대로 연다. 뉴스(`iso.org/news`)는 한 달에 4건쯤이고 자동차는 드물다. 무료. |
| UNECE | 전체 | 검색 질의 `https://news.google.com/rss/search?q=site:unece.org/media+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 보도자료 전반이라 넓다. 차량 규정 소식은 WP.29 회기(3·6·11월)에 몰린다. 루틴 환경에서 curl, WebFetch, 브라우저 모두 Cloudflare 403이라 검색 질의로 찾는다. 무료. |
| IEC | 전체 | 뉴스룸 `https://www.iec.ch/blog` | 제목으로 고름 | IEC Today 블로그, 주 1\~2건이고 자동차 소식은 드물다. 브라우저 필요(curl과 Node fetch는 AWS WAF 챌린지). `/news-resources`와 `/press-releases`는 브라우저에서도 목록이 비어 있다. 무료. |
| Microchip Technology | network, 기타 | 피드 `https://ir.microchip.com/news-events/press-releases/rss` | 제목으로 고름 | 3개월 약 15건 가운데 자동차 3\~4건. 10항목(약 2개월), 거슬러 볼 수 없음. `www.microchip.com`은 Akamai 403이라 IR 사이트를 쓴다. 보도자료는 GlobeNewswire로도 나감. 무료. |
| TASKING | sw-engineering, platform | 뉴스룸 `https://www.tasking.com/newsroom` | 제목으로 고름 | 3개월 약 19건 가운데 자동차 8건 안팎. 항공 글이 섞인다. 피드(`/feed/`)는 404이고(2026-10-26, 사이트 이전으로 기사 주소가 `/content/`에서 `/news/`로 바뀜) 쪽 넘김은 `?page_n1=N`, 보조로 `sitemap.xml`. 무료. |
| TIER IV | 기타, platform | 피드 `https://tier4.co.jp/en/updates/rss.xml` | 없음 | 3개월 약 25건. 10항목(약 1개월), 피드는 거슬러 볼 수 없고 HTML 목록 `/en/updates/page/2`로 거슬러 본다. 행사 안내가 섞인다. 무료. |
| AUTOCRYPT | security | 피드 `https://autocrypt.io/feed/` | 제목으로 고름 | 3개월 6건. 로봇 보안, 충전 PKI가 섞인다. 10항목(약 5개월), `?paged=2`. 보도자료는 PR Newswire로도 나감. 무료. |
| Vector | 전체 | 뉴스룸 `https://www.vector.com/en/company/press/press-releases/` | 제목으로 고름 | 꾸준함: 3개월 약 6건(CANoe AI 에이전트, vSECC, Coretura, SCSK 번들 등). 무료. 피드 없음. 목록의 처음 8\~9건만 날짜와 함께 HTML에 있고 그 뒤는 스크립트로 불러온다(주 1회에는 충분). 옛 주소 `/int/en/news/`는 406·404. 406이 한 번 나면 다시 받는다 |
| ETAS | 전체 | 검색 질의 `https://news.google.com/rss/search?q=site:etas.com/ww/en+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 꾸준함: 3개월 약 10건(CRA, AUTOSAR 부트로더, ECU 검증 등. ESCRYPT 보안 사업 포함). 무료. 뉴스룸은 스크립트로 그려 curl로 목록이 보이지 않고 피드도 없어 검색 질의를 쓴다. 제품 파일과 문서 페이지가 섞이고 색인이 늦을 수 있다 |
| dSPACE | sw-engineering | 뉴스룸 `https://www.dspace.com/en/pub/home/company/press-newsroom/press-releases.cfm` | 제목으로 고름 | 꾸준함: 3개월 약 7건(보안 시험을 넣은 SIL·HIL, AI 에이전트 연결, 레이더 시험기 등). 무료. 목록에 날짜가 없어 본문 첫 줄("Paderborn, October 1, 2026 –")로 확인한다. 한 쪽 약 20건(약 2년). 루틴 환경에서 curl이 429를 받으면 브라우저로 연다 |
| Kvaser | network | 피드 `https://kvaser.com/feed/` | 없음 | 꾸준함: 3개월 약 8건(CAN·LIN 분석 도구, 차량 Ethernet 변환기 등). 무료. 10항목(약 3개월), `?paged=2` |
| Automotive Grade Linux | platform | 피드 `https://www.automotivelinux.org/feed/` | 없음 | 꾸준함: 3개월 약 6건(참조 플랫폼, SDV 인터뷰, 행사 보고). 무료. 10항목(약 10개월), `?paged=2` |
| Sonatus | platform | 피드 `https://www.sonatus.com/feed/` | 없음 | 꾸준함: 3개월 13건(SDV·차량 AI 블로그). 무료. 10항목(약 2.5개월), `?paged=2`. 보도자료는 Business Wire로만 나가 이 피드에 없다 |
| VicOne | security | 뉴스룸 `https://vicone.com/blog/` | 제목으로 고름 | 꾸준함: 3개월 약 9건(헤드유닛 취약점, 차량 악성코드, 자동차 위협 보고서 등). 절반쯤은 로봇 보안. 무료. 피드 없음. 한 쪽 13건(약 2.5개월), `/blog/page/2/`. 보도자료는 `/company/press-releases/`에 따로 있다(3개월 자동차 2건) |
| Automotive Testing Technology International | sw-engineering | 피드 `https://www.automotivetestingtechnologyinternational.com/feed` | 제목으로 고름 | 꾸준함: 3개월 약 80건 가운데 SIL·HIL·소프트웨어 검증 약 15건. 벤더 보도자료를 다시 쓴 기사가 많다. 무료. 10항목(약 1주), `?paged=N`. 루틴 환경에서 curl은 403이라 Node fetch로 받는다 |
| EE Times | 기타 | 검색 질의 `https://news.google.com/rss/search?q=site:eetimes.com+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 한 주 약 27건 가운데 자동차는 일부. 자동차 피드(`/designline/automotive-designline/feed/`, 3개월 약 28건)는 루틴 환경에서 curl, Node fetch, 브라우저 모두 막혀(503, 빈 페이지) 검색 질의로 찾는다. 무료. |
| Semiconductor Engineering | 기타 | 피드 `https://semiengineering.com/category/automotive/feed/` | 없음 | 3개월 4건(대부분 대학 논문 소개). 10항목(약 5개월), `?paged=2`. 자동차 기획 기사는 태그 피드 `/tag/automotive/feed/`(3개월 6건)에도 있다. 무료. |
| Automotive World | 전체 | 피드 `https://www.automotiveworld.com/topics/software-defined-vehicle/feed/` | 제목으로 고름 | SDV 주제. 한 주 약 20건, 보도자료를 다시 쓴 짧은 뉴스가 많다. 20항목(약 1주), `?paged=N`. 기본 User-Agent는 Cloudflare 403. 무료. |
| PR Newswire | 기타 | 뉴스룸 `https://www.prnewswire.com/news-releases/automotive-transportation-latest-news/automotive-list/?page=1&pagesize=100` | 제목으로 고름 | 배포처. 자동차 보도자료 배포 목록. 한 주 약 140건이고 자동차 임베디드는 소수. `page=1\~2`로 한 주를 덮는다. RSS는 20항목(하루치 안 됨)이라 쓰지 않는다. 무료. |
| EDN | 기타 | 피드 `https://www.edn.com/feed/` | 제목으로 고름 | 꾸준함: 3개월 약 215건 가운데 자동차 약 30건. 무료, 피드에 본문 전체. 10항목(2\~3일), `?paged=N`(한 주 약 2쪽). 기사 페이지와 분류 피드는 curl이 끊겨 피드로 읽는다 |
| Power Electronics News | 기타 | 피드 `https://www.powerelectronicsnews.com/feed/` | 제목으로 고름 | 꾸준함: 3개월 약 169건 가운데 자동차(트랙션 인버터, BMS, 차량 전원 부품) 약 25건. 무료, 피드에 본문 전체. 10항목(약 3일), `?paged=N`(한 주 약 2쪽) |
| embedded.com | 전체 | 피드 `https://www.embedded.com/feed/` | 제목으로 고름 | 꾸준함: 3개월 약 122건 가운데 자동차 약 12건(CAN XL 트랜시버, 10BASE-T1S, SDV 보안, Zephyr 등). 무료, 피드에 본문 전체. 10항목(약 1주), `?paged=N`. 기사 페이지는 curl이 끊겨 피드로 읽는다 |
| Electronic Design | 기타 | 피드 `https://www.electronicdesign.com/__rss/website-scheduled-content.xml?input=%7B%22sectionAlias%22%3A%22markets%2Fautomotive%22%7D` | 제목으로 고름 | 꾸준함: 7주 25건 가운데 자동차 임베디드 약 11건(RTOS 비교, A-PHY 등). 드론·배터리 업계 글이 섞인다. 무료(브라우저에서는 무료 가입을 요구할 수 있음). 25항목(약 7주), 거슬러 볼 수 없음 |
| EE World Online | 기타 | 피드 `https://www.eeworldonline.com/category/applications/transportation/feed/` | 제목으로 고름 | 꾸준함: 3개월 약 30건(EV 전력전자, BMS, MCU, 센서, zonal 해설). 철도 글이 섞인다. 무료. 10항목(약 3주), `?paged=N`. 루틴 환경에서 curl은 Cloudflare 챌린지라 Node fetch로 받는다 |
| ADAS & Autonomous Vehicle International | 기타 | 피드 `https://www.autonomousvehicleinternational.com/feed` | 제목으로 고름 | 꾸준함: 3개월 91건 가운데 자동차 임베디드(ADAS 칩·센서·SDV·cockpit) 약 30건. 나머지는 로보택시 운행·사업. 무료. 10항목(약 9일), `?paged=N` |
| Charged EVs | 기타 | 피드 `https://chargedevs.com/tag/automotive-power-electronics/feed/` | 제목으로 고름 | 자동차 전력전자 태그. 꾸준함: 3개월 29건(인버터, SiC·GaN, BMS). 충전기 기사와 스폰서 글이 섞인다. 무료. 10항목(약 4주), `?paged=N` |
| Electronics Weekly | 기타 | 피드 `https://www.electronicsweekly.com/market-sectors/automotive-electronics/feed/` | 제목으로 고름 | 꾸준함: 3개월 21건 가운데 자동차 임베디드 약 12건(센서, 차량용 칩, PMIC). 무료. 10항목(약 6주), `?paged=2` |
| eeNews Europe | 기타 | 피드 `https://www.eenewseurope.com/en/feed/` | 제목으로 고름 | 꾸준함: 3개월 약 290건 가운데 자동차 임베디드 약 12건. 무료. 10항목(약 4일), `?paged=N`(한 주 약 3쪽). 자동차 도메인 피드는 3개월 5건만 묶여 전체 피드를 고른다 |
| Embedded Computing Design | 기타 | 뉴스룸 `https://embeddedcomputing.com/application/automotive` | 없음 | 꾸준함: 3개월 약 14건(보도자료를 다시 쓴 글이 많음). 무료. 한 쪽 약 27건(약 5개월), `?page=2` |
| 오토모티브일렉트로닉스 | 전체 | 피드 `https://www.autoelectronics.co.kr/rss/` | 제목으로 고름 | 7주에 자동차 임베디드 약 25건. 한국어 기사와 영어 번역이 짝으로 올라오고, 업계 동향이 섞인다. 100항목(약 7주), 거슬러 볼 수 없음. 기획과 뉴스 두 묶음이 날짜순이 아니라 이어 붙어 있다. 무료. |
| e4ds news | 전체 | 뉴스룸 `https://www.e4ds.com/indust.asp?c=0` | 제목으로 고름 | 자동차/모빌리티 분류. 꾸준함: 3개월 75건 가운데 약 35건(차량용 칩, 10BASE-T1S, 차량 Ethernet 시험, CANoe 등). 무료(`e4ds+` 표시 글은 요약만 무료). 피드 없음. 한 쪽 7\~9건(약 1주), `&page=N` |
| 테크월드뉴스 | platform, security, 기타 | 뉴스룸 `https://www.epnc.co.kr/news/articleList.html?sc_sub_section_code=S2N142&view_type=sm` | 제목으로 고름 | 모빌리티 분류. 꾸준함: 3개월 54건 가운데 약 16건(SDV 플랫폼, 충전 PKI, 진단 등). 무료. 하위 분류 피드 없음. 한 쪽 20건(약 1개월), `&page=N` |
| 전자신문 | 기타, platform | 피드 `https://rss.etnews.com/17.xml` | 제목으로 고름 | 모빌리티 분류. 꾸준함: 3개월 약 20건(SDV 콕핏, 차량 AI 플랫폼, 차량용 보안반도체 등). 신차·수입차 기사가 대부분(주 약 60건). 무료. 50항목(약 6일), 거슬러 볼 수 없음. 분류 페이지는 스크립트로 그려 curl로 목록이 나오지 않는다 |
| 지디넷코리아 | 기타, platform | 뉴스룸 `https://zdnet.co.kr/news/?lstcode=0057` | 제목으로 고름 | 카테크 분류. 꾸준함: 3개월 477건 가운데 약 12건(SDV 출시 계획, 자율주행 칩 등). 주 약 37건. 무료. 한 쪽 20건(약 4일), `&page=N` |
| 데일리시큐 | security | 검색 질의 `https://www.dailysecu.com/news/articleList.html?sc_area=A&view_type=sm&sc_word=차량` | 질의 | 사이트 검색. 꾸준함: 3개월 37건 가운데 약 13건(차량 Ethernet 공격, 자동차 침해사고 훈련, 차량 보안 검증 등). 무료. 분류 피드가 없고 전체 피드는 보안 전반이다. 한 쪽 20건, `&page=N` |
| 盖世汽车 | 기타, platform | 피드 `https://auto.gasgoo.com/Rss/ClassRss.aspx?ClassId=601` | 제목으로 고름 | 智能网联 분류. 꾸준함: 3개월 약 50건(AUTOSAR, RISC-V MCU, 4D 레이더, 舱驾融合 칩 등). 로봇·투자 글이 많이 섞인다. 무료. 100항목(약 4주), 피드는 거슬러 볼 수 없고 HTML `https://auto.gasgoo.com/smart-connected/C-601/<n>`로 거슬러 본다. 피드가 웹보다 1\~2일 늦다 |
| 地平线 Horizon Robotics | 기타, platform | 뉴스룸 `https://www.horizon.auto/news` | 제목으로 고름 | 꾸준함: 3개월 약 12건(征程6 양산, ISO 26262 인증 등). 자회사·강좌·행사 글이 섞인다. 무료. 분류마다 최근 약 14건, 거슬러 볼 수 없음. 날짜가 없는 항목은 본문에서 확인한다 |
| 普华基础软件 | platform, sw-engineering | 뉴스룸 `https://www.i-soft.com.cn/news/dynamic.html` | 제목으로 고름 | 꾸준함: 3개월 약 12건(AUTOSAR CAPI, AUTOSAR 프리인티그레이션, RISC-V 협력, 차량 OS 등). 무료. 한 쪽 12건, `?page=N`. 루틴 환경에서는 Node fetch로 받는다 |
| 雷锋网 | 기타, platform | 피드 `https://www.leiphone.com/feed/categoryRss/name/transportation` | 제목으로 고름 | 新智驾 분류. 꾸준함: 3개월 약 8건(智驾 칩, 线控底盘 등). 신차·인사·판매가 대부분. 무료, 피드에 본문 전체. 항목 수가 조회마다 20\~50건(약 2주\~3개월)으로 달라지고, `?page=2`는 다른 묶음이라 거슬러 볼 수 없다 |
| AUTOMOBIL-ELEKTRONIK | 전체 | 피드 `https://www.all-electronics.de/automotive?lab_viewport=rss` | 제목으로 고름 | 꾸준함: 3개월 29건 가운데 약 15건(SDV, AUTOSAR, HiL·SiL, RISC-V, MIPI A-PHY 등). 무료. 43항목(약 4개월), 거슬러 볼 수 없음. 독일어 |
| Hanser automotive | 전체 | 뉴스룸 `https://www.hanser-automotive.de/news` | 제목으로 고름 | 꾸준함: 3개월 102건 가운데 약 40건(SDV, 개발 도구, ECU 보안, ASA-ML, RISC-V 등). 무료. 피드 없음. 목록 페이지(약 10MB) 안의 JSON에 모든 글이 `title`, `publicationDate`, `slug`로 들어 있다. 기사 주소는 `/a/<slug>`이고 본문이 스크립트로 그려져 브라우저가 편하다. 독일어 |
| L'Embarqué | 전체 | 뉴스룸 `https://lembarque.com/categorie/secteurs-dactivites/automobile` | 없음 | Automobile 분류. 꾸준함: 3개월 15건, 모두 자동차 임베디드(Vector, dSPACE, MIPI, 차량 Ethernet 등). 무료는 일부(15건 가운데 5건이 구독자용). 피드 없음. 한 쪽 12건(약 2.5개월), `?page=N`. 프랑스어 |
| MONOist | 전체 | 피드 `https://rss.itmedia.co.jp/rss/2.0/mn_carele.xml` | 제목으로 고름 | モビリティ 분류. 꾸준함: 3개월 약 40건으로 추정(12일 동안 7건: SDV, STPA, DMS 등). 일반 제조 글이 섞인다. 무료(일부 연재는 무료 회원 등록). 30항목(약 9일), 거슬러 볼 수 없음. `carele/archive.html`은 최근 30건뿐이고 쪽 넘김이 없다. 지난 글은 사이트 전체 월별 목록 `https://monoist.itmedia.co.jp/mn/subtop/archive/<YYMM>.html`. 일본어 |
| マイナビ TECH+ | 기타, security | 피드 `https://news.mynavi.jp/rss/techplus/technology/carelectronics` | 제목으로 고름 | カーエレクトロニクス 분류. 꾸준함: 3개월 19건 가운데 약 13건(차량 이미지 센서, UWB 디지털 키, 차량 AI 보안 등). 무료. 50항목(약 6개월)이라 거슬러 볼 일이 없다. 일본어 |
| EE Times Japan | 기타 | 뉴스룸 `https://eetimes.itmedia.co.jp/ee/subtop/archive/` | 제목으로 고름 | 그달 기사 목록(지난달은 `archive/<YYMM>.html`). 꾸준함: 3개월 약 15\~20건(차량 반도체, 센서, A-PHY). 월 약 140건 가운데 비중은 낮다. 무료. 대부분 자체 기사라 EE Times와 겹침이 적다. 피드는 20항목(약 4일)이라 쓰지 않는다. HTML은 Shift_JIS. 일본어 |
| NHTSA 리콜 | 기타 | 검색 질의 `https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip`(접수일 `RCDATE`가 그 주인 리콜. 싣는 기준은 [4. 고르기](SKILL.md#4-고르기)) | 제목으로 고름 | 꾸준함: 소프트웨어 리콜이 2026-07\~09에 20건(월 4\~12건). 무료. `nhtsa.gov` 페이지는 curl과 WebFetch가 403이라 평면 파일이나 API(`https://api.nhtsa.gov/recalls/campaignNumber?campaignNumber=<번호>`)로 읽는다. API는 행마다 부품 분류를 하나만 보여 주므로 리콜의 문턱은 평면 파일로 센다([6. 주요 소식](SKILL.md#6-주요-소식)). 평면 파일의 날짜는 제조사 보고서 접수일이고 게시일은 드러나지 않는다. 후방 카메라와 계기판 소프트웨어가 대부분. 2026-w03\~w05에서 5건 실음. |
| Zero Day Initiative | security | 뉴스룸 `https://www.zerodayinitiative.com/blog/` | 제목으로 고름 | 꾸준함: 자동차 글 월 1\~3건 어림(Pwn2Own Automotive 전후에 몰림). 무료. 날짜순 쪽 넘김. 2026-w02, w04에서 2건 실음. |
| 현대자동차그룹 뉴스룸 | 전체 | 뉴스룸 `https://www.hyundaimotorgroup.com/en/news/newsMain` | 제목으로 고름 | 꾸준함: 최근 3개월 자동차 임베디드 글 3건 어림(어림값, 미달). 무료. 한국어판 `/ko/news/newsMain`(영문판은 국문판의 일부만 올라온다. 더 보기가 POST라 curl은 첫 6건만 보인다). 2026-w05에서 2건 실음. |
| SK hynix 뉴스룸 | 기타 | 뉴스룸 `https://news.skhynix.co.kr/` | 제목으로 고름 | 꾸준함: 최근 3개월 자동차 글 0건 어림(미달). 무료. `/page/2/`가 첫 쪽을 돌려줘 WordPress REST로 거슬러 본다(같은 글이 여러 번 올라온다). 2026-w04에서 1건 실음. |
| Volkswagen Group | 기타, platform | 뉴스룸 `https://www.volkswagen-group.com/en/press-releases` | 제목으로 고름 | 꾸준함: 최근 3개월 자동차 임베디드 글 0건 어림(미달). 무료. 2026-w02, w05에서 2건 실음. |
| VDA | 기타, platform | 뉴스룸 `https://www.vda.de/en/press/press-releases` | 제목으로 고름 | 꾸준함: 확인 못 함. 무료. 2026-w02에서 1건 실음. |
| Ford From the Road | 기타, platform | 뉴스룸 `https://www.fromtheroad.ford.com/us/en/articles` | 제목으로 고름 | 꾸준함: 확인 못 함. 무료. `media.ford.com`은 403. 페이지 메타 발행일이 본문 날짜와 달라 본문 날짜를 쓴다. 2026-w02에서 1건 실음. |
| Federal Register | 기타, sw-engineering | 검색 질의 `https://www.federalregister.gov/api/v1/documents.json?conditions[agencies][]=national-highway-traffic-safety-administration&conditions[publication_date][gte]=<월요일>&conditions[publication_date][lte]=<일요일>&per_page=100` | 제목으로 고름 | 드물게 냄. 꾸준함: NHTSA 문서가 2026-07-13\~10-11에 62건이고 대부분 면제·청원 공고, 규칙과 규칙안은 11건. 무료. 루틴 환경에서 `federalregister.gov` 페이지가 막혀 govinfo 사본으로 읽었고, API가 루틴 환경에서 열리는지는 확인 못 함. 2026-w04에서 1건 실음. |
| Коммерсантъ | security | 검색 질의 `https://news.google.com/rss/search?q=site:kommersant.ru+Delta+after:<월요일>+before:<다음 월요일>&hl=ru&gl=RU&ceid=RU:ru` | 제목으로 고름 | 꾸준함: 확인 못 함. 무료. 러시아어. 2026-10 조사에서 질의의 `Delta`가 항공사 Delta 기사와 무관한 기사만 돌려줘 자동차 보안 결과가 없었다. 2026-w05에서 1건 실음. |
| Mobileye | 기타, platform | 검색 질의 `https://news.google.com/rss/search?q=site:ir.mobileye.com+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 1차 발표가 루틴 환경에서 열리지 않아 TechCrunch 기사를 실었다. 꾸준함: 2026-07-14\~10-13에 IR 글 4건(실적, 인사, 행사)이고 자동차 임베디드 글은 없음(미달). 무료. 2026-w02에서 1건(TechCrunch로) 실음. |
| KISA | security, sw-engineering | 검색 질의 `https://news.google.com/rss/search?q=%ED%95%9C%EA%B5%AD%EC%9D%B8%ED%84%B0%EB%84%B7%EC%A7%84%ED%9D%A5%EC%9B%90+%EC%9E%90%EB%8F%99%EC%B0%A8+%EB%B3%B4%EC%95%88+after:<월요일>+before:<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko` | 제목으로 고름 | 드물게 냄. 1차 발표가 루틴 환경에서 열리지 않아 머니투데이 기사를 실었다. 질의 결과는 대부분 보도라 KISA 발표문은 따로 연다. 2026-10 조사에서는 도박 스팸이 섞이고 금융권 해킹·국정감사 보도뿐이라 자동차 결과가 없었다. 꾸준함: 확인 못 함(2026-07-14\~10-13 질의 결과 65건이 대부분 같은 발표의 보도). 무료. 2026-w05에서 1건(머니투데이로) 실음. |
| 国家市场监督管理总局 | 기타, sw-engineering | 검색 질의 `https://news.google.com/rss/search?q=%E5%B8%82%E5%9C%BA%E7%9B%91%E7%AE%A1%E6%80%BB%E5%B1%80+%E6%B1%BD%E8%BD%A6+%E5%BC%BA%E5%88%B6%E6%80%A7%E5%9B%BD%E5%AE%B6%E6%A0%87%E5%87%86+after:<월요일>+before:<다음 월요일>&hl=zh-CN&gl=CN&ceid=CN:zh-Hans` | 제목으로 고름 | 중국 시장감독관리총국. 드물게 냄. 1차 발표가 루틴 환경에서 열리지 않아 中国新闻网 기사를 실었다. 질의 결과는 보도라 총국 공고는 따로 연다. 꾸준함: 확인 못 함(2026-07-14\~10-13 질의 결과 33건, 차량 강제 국가표준 발표 보도 포함). 무료. 2026-w05에서 1건(中国新闻网으로) 실음. |
| Car Connectivity Consortium | network, security | 검색 질의 `https://news.google.com/rss/search?q=site:carconnectivity.org+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 드물게 냄. 1차 발표가 루틴 환경에서 열리지 않아 Automotive World와 Automotive Testing Technology International 기사를 실었다. 꾸준함: 2026-07-14\~10-13에 4건(Plugfest, 시험소 인가, FCC 규칙안 의견). 무료. 질의가 0건인 주에도 `carconnectivity.org/news` 목록에는 글이 있을 수 있다(2026-10-12 글). 2026-w02, w03에서 2건(대신 실은 매체로) 실음. |
| NXP Semiconductors | network, 기타 | 검색 질의 `https://news.google.com/rss/search?q=site:nxp.com/company/about-nxp/newsroom+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 1차 발표를 내는 곳(차량용 반도체 벤더). 1차 발표가 열리지 않아(curl 404, Wayback 사본만 열림) CNX Software 기사를 실었다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w09에서 1건(CNX Software로) 실음. |
| Geehy | 기타 | 검색 질의 `https://news.google.com/rss/search?q=Geehy+automotive+MCU+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 1차 발표를 내는 곳(차량용 MCU 벤더). 1차 발표가 열리지 않아(뉴스 페이지 404) All About Circuits 기사를 실었다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w09에서 1건(All About Circuits로) 실음. |
| 폴란드군 총참모부 | security | 검색 질의 `https://news.google.com/rss/search?q=Sztab+Generalny+samochody+after:<월요일>+before:<다음 월요일>&hl=pl&gl=PL&ceid=PL:pl` | 제목으로 고름 | Sztab Generalny Wojska Polskiego. 드물게 냄. 1차 공지(wojsko-polskie.pl)가 캡차로 열리지 않아 Notes from Poland 기사를 실었다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w08에서 1건(Notes from Poland로) 실음. |
| KTR | network, sw-engineering | 검색 질의 `https://news.google.com/rss/search?q=%ED%95%9C%EA%B5%AD%ED%99%94%ED%95%99%EC%9C%B5%ED%95%A9%EC%8B%9C%ED%97%98%EC%97%B0%EA%B5%AC%EC%9B%90+%EC%9E%90%EB%8F%99%EC%B0%A8+after:<월요일>+before:<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko` | 제목으로 고름 | 한국화학융합시험연구원. 1차 발표를 내는 곳(시험 인증 기관). 1차 발표(ktr.or.kr)가 curl에 빈 틀이라 지디넷코리아 기사를 실었다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w08에 1건(지디넷코리아로) 실었다가 제품·인증 발표 문턱으로 뺐다(2026-10-14). |
| 36Kr | network, 기타 | 검색 질의 `https://news.google.com/rss/search?q=site:36kr.com+%E6%B1%BD%E8%BD%A6+%E8%8A%AF%E7%89%87+after:<월요일>+before:<다음 월요일>&hl=zh-CN&gl=CN&ceid=CN:zh-Hans` | 제목으로 고름 | 원 보도를 하는 매체(독점 취재 기사). 중국어판은 본문을 스크립트로 그려 curl로 제목이 나오지 않고, 영어판 `eu.36kr.com`은 열린다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w06에서 1건 실음. |
| ARTERY Technology | sw-engineering, 기타 | 검색 질의 `https://news.google.com/rss/search?q=%22ARTERY+Technology%22+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 1차 발표를 내는 곳(MCU 벤더). 보도자료는 PR Newswire Asia로 나가고 원본 주소를 찾지 못해 배포본(TNGlobal)을 실었다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w07에서 1건 실음. |
| 로봇신문 | sw-engineering, 기타 | 검색 질의 `https://news.google.com/rss/search?q=site:irobotnews.com+%EC%B0%A8%EB%9F%89+after:<월요일>+before:<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko` | 제목으로 고름 | 원 보도를 하는 매체인지 확인 못 함(로봇 전문지, 보도자료가 없는 회사 소식을 실음). 자동차 글은 드물다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w07에서 1건 실음. |
| Northeastern Global News | security | 검색 질의 `https://news.google.com/rss/search?q=site:news.northeastern.edu+%28car+OR+vehicle%29+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 드물게 냄. 대학의 보안 연구 발표. 페이지 메타 날짜는 수정 시각이라 URL과 본문 날짜를 쓴다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w08에서 1건 실음. |
| IMDEA Networks | security | 검색 질의 `https://news.google.com/rss/search?q=site:networks.imdea.org+%28car+OR+vehicle%29+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 드물게 냄. 연구소의 보안 연구 발표. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w09에서 1건 실음. |
| Fraunhofer IPMS | network | 검색 질의 `https://news.google.com/rss/search?q=site:ipms.fraunhofer.de+%2810BASE-T1S+OR+automotive%29+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 1차 발표를 내는 곳(연구소, 차량 네트워크 IP). 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w09에서 1건 실음. |
| 상용차매거진 | security, 기타 | 검색 질의 `https://news.google.com/rss/search?q=site:cvinfo.com+%28%EC%82%AC%EC%9D%B4%EB%B2%84%EB%B3%B4%EC%95%88+OR+%EC%A0%84%EC%9E%A5%29+after:<월요일>+before:<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko` | 제목으로 고름 | 원 보도를 하는 매체인지 확인 못 함(상용차 전문지). 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w09에서 1건 실음. |
| 헬로티 | sw-engineering, 기타 | 검색 질의 `https://news.google.com/rss/search?q=site:hellot.net+%28%EC%9E%90%EB%8F%99%EC%B0%A8+OR+%E8%BB%8A%EB%B0%98%EB%8F%84%EC%B2%B4%29+%28%EA%B8%B0%EB%8A%A5%EC%95%88%EC%A0%84+OR+SDV+OR+%EB%B0%98%EB%8F%84%EC%B2%B4%29+after:<월요일>+before:<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko` | 제목으로 고름 | 산업 전문지로 보도자료를 다시 쓴 기사가 많아 원 보도 매체에는 못 미친다. og:title에 `[헬로티 HelloT]` 머리말이 붙고, 원어 제목은 그 뒤다. 꾸준함: 확인 못 함(소급 조사라 최근 3개월을 세지 않음). 무료. 2026-w09에서 1건 실음. 질의에 `車반도체`와 `반도체`를 더했다(2026-10-26, 기존 질의가 `車반도체` 표기 기사를 놓쳐 0건). |
| Auto-ISAC | security | 뉴스룸 `https://automotiveisac.com/press-news?format=rss` | 제목으로 고름 | 1차 발표를 내는 곳(업계 보안 정보 공유 기구). 드물게 냄. 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) 0건, 3월 1건(2026-10-14 확인). 무료. RSS 20항목(2023-02-22까지)이고 `?format=json`은 10항목씩 offset으로 거슬러 본다. curl로 열린다. 2026-w12에서 1건 실음. |
| Eclipse SDV | platform | 피드 `https://eclipsesdv.org/wp-json/wp/v2/news` | 제목으로 고름 | 1차 발표를 내는 곳(오픈소스 SDV 커뮤니티). 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) `news` 6건(S-CORE v0.8·0.9, 백서, 기고 소개, 뉴스레터), `blogs`·`white-papers`를 더하면 해커톤 글을 빼고 9건, 3월 약 2건(2026-10-14 확인). 무료. WordPress REST이고 `/blogs`, `/white-papers`도 같은 꼴로 살핀다(`posts`는 비어 있고, `/events`는 행사라 뺀다). `after=`, `before=`로 기간을 걸고 curl로 열린다. 2026-w13에서 1건 실음. |
| IEEE SA | network | 검색 질의 `https://news.google.com/rss/search?q=site:standards.ieee.org+%28802.3+OR+802.1+OR+1609+OR+automotive+OR+vehicle+OR+vehicular+OR+A-PHY%29+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 1차 발표를 내는 곳(표준 단체). 드물게 냄. 꾸준함: 최근 3개월(2026-07-13에서 10-12까지) 2건(IEEE 1609.2.2, IEEE 2977 A-PHY 정오표), 3월 2건(IEEE 802.3da, 802.1ASed)(2026-10-14 확인). Google News의 날짜는 색인일이라 발행일은 표준 페이지의 `Published: YYYY-MM-DD`(curl로 읽힘)로 본다. 사이트맵의 `lastmod`는 수정일이다. 질의 결과에 검색·위원회 안내 페이지가 섞인다. 발행 사실과 날짜는 무료, 표준 본문은 유료. 2026-w11, w13에서 2건 실음. |
| EUR-Lex | sw-engineering, 기타 | 검색 질의 `https://publications.europa.eu/webapi/rdf/sparql`(POST, CELEX와 제목 키워드로 차량 형식승인 법령을 거름) | 제목으로 고름 | 1차 발표를 내는 곳(입법·규제 기관, EU 관보). 드물게 냄. 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) 3건, 3월 4건(2026-10-14 확인). 제목 키워드로 거른 어림값이다. 무료. SPARQL은 curl로 열리고 `eur-lex.europa.eu`의 본문은 `docs/source-access.md`의 호스트별 여는 법대로 연다. 날짜는 채택일이라 게재일과 며칠 어긋날 수 있다. 2026-w10, w11에서 2건 실음. |
| 国土交通省 | 기타 | 뉴스룸 `https://www.mlit.go.jp/report/press/houdou<YYYYMM>.html` | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관, 리콜 신고). 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) 규정 2건과 소프트웨어 리콜 약 14건, 3월 리콜 2건(2026-10-14 확인). 리콜은 PDF의 `プログラム`, `ソフトウェア`, `ECU` 키워드로 가른 어림값이다. 무료. curl로 열린다. 월 약 350건 가운데 `jidosha*`가 약 45건이고 리콜은 `jidosha08_hh_*.html`의 첫 PDF를 `pdftotext`로 읽는다. 일본어. 2026-w10, w13에서 2건 실음. |
| 中国汽车工业协会 | security | 뉴스룸 `http://www.caam.org.cn/bzfg` | 제목으로 고름 | 1차 발표를 내는 곳(업계 협회, 단체표준 의견 수렴, CAAM). 드물게 냄. 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) 약 5건, 3월 1건에서 3건(2026-10-14 확인). 무료. https는 연결이 안 되고 http만 열린다. 목록 `/bzfg`가 얕아 `http://www.caam.org.cn/preview/1/con_<ID>.html`을 ID로 훑어야 한다(ID가 시간순, 5237020이 2026-02-02). 중국어. 2026-w10에서 1건 실음. |
| 国家市场监督管理总局缺陷产品召回技术中心 | sw-engineering, security | 뉴스룸 `https://www.samrdprc.org.cn/fgbz/SACTC463/bzyjzq/` | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관, 국가표준 의견 수렴, SAC/TC463). 드물게 냄. 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) 표준 0건과 소프트웨어 원인 리콜 1건, 3월 표준 1건(2026-10-14 확인). 무료. 2026-10-20 사이트 개편으로 옛 주소(`/yjgz/sactc/`, `/qczh/gnzhqc/index_<N>.html`)가 홈페이지를 돌려준다. 표준 의견 징구는 `/fgbz/SACTC463/bzyjzq/`, 동향은 `/fgbz/SACTC463/gzdt/`, 국내 자동차 리콜 목록은 `/zhxx/jdczh/jdczh/index.html`(스크립트라 브라우저 필요, 6쪽이 2025-12-15까지)이다. 중국어. 2026-w13에서 1건 실음. |
| KBA | 기타 | 검색 질의 `https://www.kba-online.de/rrdb/buerger/api/rueckruf/export?format=csv&type=cars`(리콜 전체 CSV, 약 3.5MB) | 제목으로 고름 | 1차 발표를 내는 곳(독일 연방자동차청, 리콜 데이터베이스). 드물게 냄. 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) 소프트웨어 관련 약 26건(CSV 133건 중), 3월 약 17건(38건 중)(2026-10-14 확인). 키워드로 가른 어림값이고 독일 내 10만 대 이상 소프트웨어 리콜은 3개월에 0건이다. 무료. CSV는 curl로 열리고 2008년부터 전 이력이 있다(월 40건에서 60건). 데이터베이스 화면은 검색에 ALTCHA가 걸려 있고 레코드 단위 주소가 없어 항목은 기사로 링크했다. 독일어. 2026-w12에서 1건(electrive.com으로) 실음. |
| 工业和信息化部 | security | 뉴스룸 `https://www.miit.gov.cn/jgsj/zbys/qcgy/index.html` | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관, 국가표준 의견 수렴). 드물게 냄. 꾸준함: 최근 3개월(2026-07-14에서 10-13까지) 임베디드 규칙 2건, 3월 0건(차량 규칙 1건)(2026-10-14 확인). 무료. 브라우저(Playwright)가 필요하다. 국가표준 의견 공시는 이 목록이 아니라 과학기술사 표준규범 목록(`https://www.miit.gov.cn/jgsj/kjs/jscx/bzgf/`)에 오른다(2026-11-02 확인). curl은 빈 틀이고 `下一页`을 눌러 8쪽(2022-01-12까지)을 넘긴다. 공고 원문 주소는 열리지 않아 전재 게시물을 실었다. 중국어. 2026-w13에서 1건(安全内参로) 실음. |
| 国家标准化管理委员会 | 전체 | 뉴스룸 `https://www.sac.gov.cn/xw/tzgg/` | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관, 국가표준 승인·계획). 드물게 냄. 꾸준함: 최근 3개월(2026-07-18에서 10-18까지) 임베디드 표준이 첨부에 든 공고 7건(제목에 드러난 것은 1건), 4월 2건(2026-10-18 확인). 승인·계획 공고(`批准发布`, `下达`, `征求`)의 첨부를 열어 `智能网联`, `车载`, `车联网`, `道路车辆`, `汽车软件` 줄을 찾는다. 무료. 목록은 브라우저(Playwright)가 필요하거나, 화면이 부르는 JSON `https://www.sac.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit?parseType=bulidstatic&webId=f3187110e3f846379be2d3c60c38b110&tplSetId=35d7bf76af174a6bab69f983d72d4912&pageType=column&tagId=ajax%E5%88%86%E9%A1%B5&editType=null&pageId=efa11ae185454136a324ab3c6039a9a5&paramJson=%7B%22pageNo%22%3A1%2C%22pageSize%22%3A100%7D`을 curl로 받는다(`pageNo` 2까지 약 1년, `pageNo`와 `rows` 이름은 무시됨). 첨부는 PDF이거나 `.pdf` 이름의 WPS 파일(`pdftotext`로 안 읽혀 UTF-16LE 문자열로 훑음). 중국어. 2026-w14에서 2건 실음. |
| General Motors | 기타, platform | 검색 질의 `https://news.google.com/rss/search?q=site:news.gm.com+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en`(엔지니어링 블로그는 `site:engineering.gm.com`) | 제목으로 고름 | 1차 발표를 내는 곳(완성차 뉴스룸과 엔지니어링 블로그). 꾸준함: 최근 3개월(2026-07-18에서 10-18까지) 질의 83건 가운데 자동차 임베디드 7\~8건, 4월 2\~3건(2026-10-18 확인, 제목으로 센 어림값이고 질의 색인에 빠진 글이 있을 수 있다). 판매, 레이싱, 공장, 사람 이야기가 대부분이다. 피드와 사이트맵이 없다(`sitemap.xml`은 HTML). 무료. 이 환경(로컬)에서만 확인했고 루틴 환경은 확인하지 못했다. 2026-w16, w18에서 2건 실음. |
| OPEN Alliance (OPEN SIG) | network | 검색 질의 `https://opensig.org/wp-json/wp/v2/news?after=<월요일>T00:00:00&before=<다음 월요일>T00:00:00&_fields=date,link,title` | 제목으로 고름 | 1차 발표를 내는 곳(표준 단체, 차량 이더넷). 드물게 냄. 꾸준함: 최근 3개월(2026-07-18에서 10-17까지) 0건, 5월 1건, 최근 12개월 4건(차량 이더넷 시장 분석, 임원 인선, 타 단체와의 협력)(2026-10-18 확인). 무료. WordPress REST로 curl(브라우저 User-Agent)이 열린다. 피드(`/feed/`)는 2023년 글 한 건뿐이고 `/news/`는 404, Google News는 이 호스트를 잡지 못한다. 명세 갱신은 `wp-json/wp/v2/specification`에 오르지만 `modified`가 수정일이다. 2026-w20에서 1건 실음. |
| 국토교통부 자동차리콜센터 | 기타 | 검색 질의 `https://www.car.go.kr/ri/stat/list.do?searchFromDate=<시작일>&searchToDate=<끝일>&currentPageNo=<쪽>`(리콜현황. 시정개시일 범위, 쪽당 5건) | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관, 법적 리콜). 받지 않은 후보 표의 `국토교통부`(보도자료 뉴스룸)와 다른 곳이다. 꾸준함: 최근 3개월(2026-07-18에서 10-17까지) 법적 리콜 77건 가운데 시정방법이 소프트웨어 업데이트인 것 약 23건(월 2\~9건), 6월 7건(2026-10-18 확인). 무료. curl로 열리나 목록은 POST(`ctype=O`)여야 나오고 GET은 빈 목록이다(2026-11-02 확인). 기간 필터와 목록 날짜는 시정개시일이라 미래일 수 있고, 상세의 작성일(게시일)이 시정개시일보다 며칠에서 석 달까지 앞서는 건이 있어 시정개시일 범위만으로는 게시분을 놓치니, 범위를 넓히고 recallId 연번 조회로 보충해 작성일로 거른다. 상세는 `POST /ri/stat/detail.do`(`recallId=<번호>&ctype=O`)만 열리고 레코드 단위 주소가 없다. 무상수리는 `/ri/grts/list.do`. 같은 정보의 일부가 국토교통부 월간 자발적 시정조치 보도자료(korea.kr)로 나가지만 일부 제작사와 대형 건만 담는다. |
| 인도 도로교통고속도로부(MoRTH) | 기타, security, platform | 검색 질의 `https://news.google.com/rss/search?q=MoRTH+(draft+OR+notification)+(cybersecurity+OR+V2V+OR+ADAS+OR+OTA+OR+"software+update"+OR+telematics+OR+"AIS-")+after:<월요일>+before:<다음 월요일>&hl=en-IN&gl=IN&ceid=IN:en` | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관, 자동차 규칙 초안과 고시). 드물게 냄. 꾸준함: 최근 3개월(2026-07-18에서 10-17까지) 1건(V2V 통신 초안), 6월 1건(사이버보안·OTA 초안 G.S.R. 503(E))(2026-10-18 확인). 무료. 관보 원문은 열리지 않아 보도(PTI, ET Auto 등)로 읽고, 사이트 API(`http://morth.gov.in/backend/api/gazettes-notifications?page=1&per_page=20&wings=&order_by=desc&search=`, 904건이 한 번에 오고 `search`는 거르지 않음)에는 이 두 건이 오르지 않았다. 질의에 구급차·이륜차 고시 기사가 섞인다. |
| CARIAD | 기타, platform | 뉴스룸 `https://cariad.technology/de/en/news.html` | 제목으로 고름 | 확인일 2026-10-19. 1차 발표를 내는 곳(Volkswagen 그룹 소프트웨어 회사). 꾸준함: 최근 3개월 약 9건(차량 데이터·충전 연구 기사 포함), 7월 3건. 무료. 피드 없음. 최신 12건(약 3.5개월)이 정적 HTML에 있고(날짜 `dd/mm/yyyy`) 전체 목록 `stories.html`은 스크립트라 curl로 비어 있다. 로컬에서만 확인. 2026-w27에서 1건 실음. |
| ECARX | platform, 기타 | 피드 `https://www.ecarxgroup.com/feed/` | 제목으로 고름 | 확인일 2026-10-19. 1차 발표를 내는 곳(차량용 OS·칩·콕핏 소프트웨어). 꾸준함: 최근 3개월 5건, 7월 2건. 무료. 10항목(약 5개월), WordPress REST `/wp-json/wp/v2/posts`도 열린다. IR 사이트(`ir.ecarxgroup.com`)는 curl 403이라 본 사이트를 쓴다. 실적·배포 수치 글이 섞인다. 로컬에서만 확인. 2026-w31에서 1건 실음. |
| Infineon Technologies | 기타, sw-engineering | 뉴스룸 `https://www.infineon.com/about/press/technology-news` | 제목으로 고름 | 확인일 2026-10-19. 1차 발표를 내는 곳(차량용 반도체 벤더). 꾸준함: 최근 3개월 차량용 약 6건(기술 뉴스 기준, 보도자료는 따로 세지 않음), 7월 1\~2건. 무료. 피드 없음(404). 정적 HTML에는 최신 4건뿐이고 더 보기를 눌러야 해서 브라우저 필요(50건 이상이 3월까지 열림). 주소는 `/technology-news/2026/inftn<년월>-<번호>`, `/press-release/2026/infxx<년월>-<번호>` 꼴이다. 전 분야 글이 섞여 차량용은 약 1/3. 로컬에서만 확인. 2026-w27, w31에서 2건 실음. |
| 同星智能 Tosun | network | 피드 `https://www.tosunai.com/feed/` | 제목으로 고름 | 확인일 2026-10-19. 1차 발표를 내는 곳(차량 네트워크 시험 도구 벤더). 꾸준함: 최근 3개월 약 10건(CAN XL·CAN FD 시험 도구, TSMaster 업데이트), 7월 약 3건. 무료. 쪽당 10건, `?paged=N`으로 7쪽(약 7개월)까지 거슬러 본다. 전시회 초대, 대학 방문, 신입 교육 글이 절반 가까이 섞인다. 중국어, 영문판 없음. curl로 열림(로컬에서만 확인). 2026-w28에서 1건 실음. |
| CISA ICS 권고 | security | 검색 질의 `https://news.google.com/rss/search?q=site:cisa.gov/news-events/ics-advisories+(vehicle+OR+automotive+OR+brake+OR+ECU+OR+%22CAN+bus%22+OR+%22anti-theft%22)+after:<월요일>+before:<다음 월요일>&hl=en-US&gl=US&ceid=US:en` | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관). 드물게 냄. 꾸준함: 최근 3개월(2026-07-19부터 10-18까지) 1건, 6개월 3건(2026-10-19 확인). 권고가 월 약 30건이라 제목에 차량 말이 드물고, 이 질의가 2026-06 뒤 3건(Zero Motorcycles, KARR, Bendix EC80)만 잡음 없이 돌려준다. 제품명만 있는 권고는 빠질 수 있다. 대안 피드 `https://www.cisa.gov/cybersecurity-advisories/ics-advisories.xml`은 30항목(약 3주). 무료. |
| Vehicle Recalls (Australian Government) | 기타 | 검색 질의 `https://www.vehiclerecalls.gov.au/recalls/browse-all-recalls?search=software`(최신순, 쪽 넘김 `&page=N`, 한 쪽 20건) | 제목으로 고름 | 1차 발표를 내는 곳(규제 기관, 호주 정부 리콜 사이트). 꾸준함: 최근 3개월(2026-07-16부터 10-13까지) 소프트웨어 리콜 약 19건, 9월 5건(2026-10-20 확인). 무료. Node `fetch`(브라우저 User-Agent)만 열리고 curl과 Python urllib은 시간 초과다. 한 쪽이 약 3개월이다. 같은 결함이 모델별로 레코드 여럿으로 오르고 이륜차와 이모빌리티가 섞인다. 이 환경(로컬)에서만 확인했고 루틴 환경은 확인하지 못했다. 2026-w36, w37에서 4건 실음. |
| MIPI Alliance | network, 기타 | 뉴스룸 `https://www.mipi.org/press-releases` | 제목으로 고름 | 1차 발표를 내는 곳(표준 단체). 드물게 냄. 꾸준함: 최근 3개월(2026-07-19부터 10-19까지) 2건, 9월 2건(2026-10-20 확인). 보도자료는 한 해 10건 안팎이고 자동차(A-PHY 등)가 절반쯤이다. 무료. 한 주소에 날짜와 함께 목록 전체가 있고 curl로 열린다. 2026-w38에서 1건 실음. |

## 검색 질의

매체에 매이지 않는 질의다. `<월요일>`, `<다음 월요일>`은 그 주의 월요일과 다음 주 월요일(`YYYY-MM-DD`)이다.

- **arXiv** (전체): `https://export.arxiv.org/api/query?search_query=((abs:automotive+OR+abs:vehicle+OR+abs:vehicles+OR+abs:vehicular+OR+abs:%22in-vehicle%22)+AND+(abs:%22CAN+bus%22+OR+abs:%22controller+area+network%22+OR+abs:%22CAN+FD%22+OR+abs:%22CAN+XL%22+OR+abs:%22automotive+Ethernet%22+OR+abs:%22time-sensitive+networking%22+OR+abs:%22SOME%2FIP%22+OR+abs:AUTOSAR+OR+abs:ECU+OR+abs:ECUs+OR+abs:%22electronic+control+unit%22+OR+abs:%22ISO+26262%22+OR+abs:%22functional+safety%22+OR+abs:SOTIF+OR+abs:%2221434%22+OR+abs:%22R155%22+OR+abs:TARA+OR+abs:%22over-the-air+update%22+OR+abs:%22over-the-air+updates%22+OR+abs:%22firmware+update%22+OR+abs:%22software-defined+vehicle%22+OR+abs:%22software-defined+vehicles%22+OR+abs:%22E%2FE+architecture%22+OR+abs:zonal+OR+abs:%22intrusion+detection%22+OR+abs:ASPICE+OR+abs:%22real-time+operating+system%22+OR+abs:%22embedded+software%22+OR+abs:%22automotive+software%22+OR+abs:%22secure+boot%22+OR+abs:%22hardware+security+module%22+OR+abs:%22battery+management+system%22+OR+abs:%22automotive-grade%22+OR+abs:MISRA))+AND+submittedDate:[<전 일요일>1500+TO+<일요일>1459]&max_results=200&sortBy=submittedDate&sortOrder=descending`
- **Google News network** (network): `https://news.google.com/rss/search?q=%28%22CAN+bus%22+OR+%22CAN+FD%22+OR+%22CAN+XL%22+OR+%22automotive+Ethernet%22+OR+%2210BASE-T1S%22+OR+%22in-vehicle+network%22+OR+%22in-vehicle+networking%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=en-US&gl=US&ceid=US:en`
- **Google News platform** (platform): `https://news.google.com/rss/search?q=%28AUTOSAR+OR+%22automotive+RTOS%22+OR+%22vehicle+OS%22+OR+%22Automotive+Grade+Linux%22+OR+%22QNX+OS%22+OR+%22QNX+Hypervisor%22+OR+%22automotive+hypervisor%22+OR+%22automotive+middleware%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=en-US&gl=US&ceid=US:en`
- **Google News sw-engineering** (sw-engineering): `https://news.google.com/rss/search?q=%28ASPICE+OR+%22Automotive+SPICE%22+OR+%22ISO+26262%22+OR+%22ISO+21448%22+OR+SOTIF+OR+%22functional+safety%22+automotive+OR+%22automotive+software+testing%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=en-US&gl=US&ceid=US:en`
- **Google News security** (security): `https://news.google.com/rss/search?q=%28%22automotive+cybersecurity%22+OR+%22vehicle+cybersecurity%22+OR+%22ISO%2FSAE+21434%22+OR+%22UN+R155%22+OR+%22UN+R156%22+OR+%22car+hacking%22+OR+%22vehicle+vulnerability%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=en-US&gl=US&ceid=US:en`
- **Google News OTA** (security): `https://news.google.com/rss/search?q=%22OTA+update%22+vehicle+after%3A<월요일>+before%3A<다음 월요일>&hl=en-US&gl=US&ceid=US:en`
- **Google News 기타** (기타): `https://news.google.com/rss/search?q=%28%22zonal+architecture%22+OR+%22E%2FE+architecture%22+OR+%22software-defined+vehicle%22+OR+%22automotive+MCU%22+OR+%22automotive+SoC%22+OR+%22ADAS+SoC%22+OR+%22battery+management+system%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=en-US&gl=US&ceid=US:en`
- **Google News 네트워크(한국어)** (network): `https://news.google.com/rss/search?q=%28%22%EC%B0%A8%EB%9F%89+%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC%22+OR+%22%EC%B0%A8%EB%9F%89%EC%9A%A9+%EC%9D%B4%EB%8D%94%EB%84%B7%22+OR+%22CAN+%ED%86%B5%EC%8B%A0%22+OR+%22CAN+FD%22+OR+%22CAN+XL%22+OR+%2210BASE-T1S%22+OR+%22%EC%B0%A8%EB%9F%89+%EB%82%B4+%EB%84%A4%ED%8A%B8%EC%9B%8C%ED%81%AC%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko`
- **Google News 플랫폼(한국어)** (platform): `https://news.google.com/rss/search?q=%28%EC%98%A4%ED%86%A0%EC%82%AC+OR+AUTOSAR+OR+%22%EC%B0%A8%EB%9F%89+OS%22+OR+%22%EC%B0%A8%EB%9F%89%EC%9A%A9+OS%22+OR+%22%EC%B0%A8%EB%9F%89%EC%9A%A9+%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C%22+OR+%22%EC%B0%A8%EB%9F%89%EC%9A%A9+RTOS%22+OR+%22%EC%B0%A8%EB%9F%89%EC%9A%A9+%ED%95%98%EC%9D%B4%ED%8D%BC%EB%B0%94%EC%9D%B4%EC%A0%80%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko`
- **Google News 소프트웨어 공학(한국어)** (sw-engineering): `https://news.google.com/rss/search?q=%28ASPICE+OR+%22%EC%98%A4%ED%86%A0%EB%AA%A8%ED%8B%B0%EB%B8%8C+%EC%8A%A4%ED%8C%8C%EC%9D%B4%EC%8A%A4%22+OR+%22%EA%B8%B0%EB%8A%A5%EC%95%88%EC%A0%84%22+OR+%22ISO+26262%22+OR+%22SOTIF%22+OR+%22%EC%B0%A8%EB%9F%89+%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4+%EA%B2%80%EC%A6%9D%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko`
- **Google News 보안(한국어)** (security): `https://news.google.com/rss/search?q=%28%22%EC%9E%90%EB%8F%99%EC%B0%A8+%EC%82%AC%EC%9D%B4%EB%B2%84%EB%B3%B4%EC%95%88%22+OR+%22%EC%B0%A8%EB%9F%89+%EC%82%AC%EC%9D%B4%EB%B2%84%EB%B3%B4%EC%95%88%22+OR+%22%EC%9E%90%EB%8F%99%EC%B0%A8+%EB%B3%B4%EC%95%88%22+OR+%22%EC%B0%A8%EB%9F%89+%EB%B3%B4%EC%95%88%22+OR+%22UN+R155%22+OR+%22UN+R156%22+OR+%22ISO+21434%22+OR+%22%EC%B0%A8%EB%9F%89+OTA%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko`
- **Google News 기타(한국어)** (기타): `https://news.google.com/rss/search?q=%28%22%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4+%EC%A4%91%EC%8B%AC+%EC%9E%90%EB%8F%99%EC%B0%A8%22+OR+%22%EC%86%8C%ED%94%84%ED%8A%B8%EC%9B%A8%EC%96%B4+%EC%A0%95%EC%9D%98+%EC%B0%A8%EB%9F%89%22+OR+%22%EC%B0%A8%EB%9F%89%EC%9A%A9+%EB%B0%98%EB%8F%84%EC%B2%B4%22+OR+%22%ED%86%B5%ED%95%A9+%EC%A0%9C%EC%96%B4%EA%B8%B0%22+OR+%22%EC%A1%B4+%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98%22+OR+%22%EC%A1%B0%EB%84%90+%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98%22+OR+%22E%2FE+%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98%22+OR+%22%EB%B0%B0%ED%84%B0%EB%A6%AC+%EA%B4%80%EB%A6%AC+%EC%8B%9C%EC%8A%A4%ED%85%9C%22%29+after%3A<월요일>+before%3A<다음 월요일>&hl=ko&gl=KR&ceid=KR:ko`

- **arXiv**: 날짜는 UTC라 한국 시각의 한 주를 `[<전 일요일>1500 TO <일요일>1459]`(`YYYYMMDD`)로 쓴다. curl은 `-g`를 붙인다(`[ ]`를 glob으로 읽지 않게). 요청 사이는 3초 띄운다. 한 주에 0\~7건이 나온다.
- **Google News**: 이름에 `(한국어)`가 붙은 질의는 한국어 기사를 찾고, 영어 질의와 `hl`, `gl`, `ceid`가 다르다.
  - `after:`, `before:` 밖의 항목이 질의마다 몇 건 섞인다. 항목마다 `pubDate`를 한국 시각으로 바꿔 그 주인지 다시 본다.
  - 음의 연산자(`-stock`, `-shares`)를 쓴 질의와, 괄호 묶음에 `"OTA update" vehicle` 항을 넣은 질의는 날짜 제한이 풀려 몇 해 전 기사까지 나온다(2026-10-21 확인). 그래서 질의에 음의 연산자를 쓰지 않고, 그 항은 따로 질의로 둔다.
  - 같은 주소가 가끔 0건을 돌려준다. 0건이면 잠시 뒤 다시 부른다.
  - 항목 링크는 원문 주소가 아니다. 제목과 `<source>`의 매체로 원문을 찾아 연다. 같은 소식이 여러 매체로 겹치고 재게재나 주가 기사가 섞이니, 질의는 원문을 찾는 실마리로만 쓴다.
  - 한국어 기타 질의는 잡음(반도체 일반, 경영 기사, 도박 스팸)이 많다. 보안(한국어) 질의도 도박 스팸이 섞인다(2026-10 조사에서 결과의 절반쯤인 주가 있었다).

## 받지 않은 후보

매체 목록에 들이지 않은 목록 추가 후보의 표다. 줄을 더하고 다시 올리는 법은 [7. 쓰기](SKILL.md#7-쓰기)가 정한다. 사유의 건수는 최근 3개월과, 소급 조사면 그 달에 낸 자동차 임베디드 글 수다.

<!-- prettier-ignore -->
| 매체 | 확인일 | 사유 |
|---|---|---|
| Apex.AI | 2026-10-14 | 꾸준함 미달(최근 3개월 4건, 3월 1건) |
| Applied Intuition | 2026-10-14 | 꾸준함 미달(최근 3개월 4건, 짝 글을 따로 세면 6건, 3월 2건). 목록에 브라우저 필요 |
| Momenta | 2026-10-14 | 꾸준함 미달(최근 3개월 3\~4건, 3월 2건) |
| ESWIN Computing | 2026-10-14 | 꾸준함 미달(최근 3개월 3건, 3월 1건) |
| Volvo Cars | 2026-10-14 | 꾸준함 미달(최근 3개월 2\~4건, 3월 1\~2건). 일반 뉴스 위주 |
| GlobalFoundries | 2026-10-14 | 꾸준함 미달(최근 3개월 2\~4건, 3월 1건). 보도자료 대부분이 AI·광통신 |
| XPENG | 2026-10-14 | 꾸준함 미달(최근 3개월 1\~3건, 3월 1건) |
| Linux Foundation | 2026-10-14 | 꾸준함 미달(최근 3개월 1\~5건, 3월 0건). 임베디드 일반 |
| Qt Group | 2026-10-14 | 꾸준함 미달(최근 3개월 1\~2건, 3월 0건). 피드가 10일치 |
| Axera | 2026-10-14 | 꾸준함 미달(최근 3개월 1건, 3월 2건). 영문 목록이 멈춤 |
| HighTec EDV-Systeme | 2026-10-14 | 꾸준함 미달(최근 3개월 0건, 3월 1\~2건). 2026-05-07 뒤로 글 없음 |
| MIPS | 2026-10-14 | 꾸준함 미달(최근 3개월 0건, 3월 1건). 최근 글이 Physical AI |
| Parasoft | 2026-10-14 | 꾸준함 미달(최근 3개월 0건, 3월 0\~1건). 자동차 글이 드묾 |
| SiliconAuto | 2026-10-14 | 꾸준함 미달(최근 3개월 0건, 3월 2건). 뉴스룸 전체가 7건 |
| Norelsys | 2026-10-14 | 꾸준함 미달(최근 3개월 0건, 3월 1건). 뉴스 전체가 3건 |
| Volvo Trucks | 2026-10-14 | 꾸준함 미달(최근 3개월 0건, 3월 0건) |
| 국토교통부 | 2026-10-14 | 임베디드에 직접 닿는 글이 거의 없고(최근 3개월 0\~1건, 3월 0건) 분야 필터를 못 찾음 |
| 経済産業省 モビリティDX | 2026-10-14 | 연재가 2026-03-31 Vol.10에서 끝남(최근 3개월 0건, 3월 2건) |
| Ars Technica | 2026-10-14 | 차량 보안 글이 몇 해에 한두 건(최근 3개월 0건, 3월 1건) |
| Electric Vehicles | 2026-10-14 | 원 보도 매체가 아님(기자회견 발언을 옮긴 기사) |
| Arasan Chip Systems | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 1건). 뉴스가 석 달에 한 건 남짓 |
| Bosch | 2026-10-18 | 꾸준함 미달(최근 3개월 1건, 4월 3건). 그룹 전체 보도자료라 자동차 임베디드는 행사철에 몰림 |
| Excelfore | 2026-10-18 | 꾸준함 미달(보도자료 최근 3개월 0건, 4월 1건). 3개월 9건은 SEO식 해설 블로그 |
| Inceptio Technology | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 1건). 글 대부분이 물류 사업 |
| Liquid AI | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 1건). 엣지 AI 일반 |
| Mercedes-Benz Group | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 3건). 상시 설명 글 위주, 목록·피드 없음 |
| Nexteer Automotive | 2026-10-18 | 꾸준함 미달(최근 3개월 0\~1건, 4월 1\~3건). 조향·제동 하드웨어와 실적 위주 |
| PTC | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 1건). PLM 회사 |
| QNX | 2026-10-18 | 꾸준함 미달(최근 3개월 약 5건, 4월 1건). 경계. 로봇·피지컬 AI 글이 많음 |
| Qualcomm | 2026-10-18 | 꾸준함 미달(최근 3개월 1건, 4월 1건). 피드가 없고 브라우저 필요 |
| TRATON | 2026-10-18 | 꾸준함 미달(최근 3개월 1건, 4월 0건) |
| Toshiba Electronic Devices & Storage | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 1건). 2026년 자동차 분류 글이 3건뿐 |
| WITTENSTEIN high integrity systems | 2026-10-18 | 꾸준함 미달(최근 3개월 자동차 글 0건, 4월 1건) |
| 矢野経済研究所 | 2026-10-18 | 꾸준함 미달(최근 3개월 1건, 4월 1\~2건) |
| Office of Senator Bernie Moreno | 2026-10-18 | 임베디드에 직접 닿지 않음(최근 3개월 3건이 모두 중국 연계 차량 금지 법안, 4월 2건) |
| Toyoda Gosei | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 1건). 고무·수지·에어백 위주 |
| WeRide | 2026-10-18 | 꾸준함 미달(최근 3개월 1\~3건, 4월 3건). 글 대부분이 로보택시 사업 |
| ZF | 2026-10-18 | 꾸준함 미달(최근 3개월 1\~5건, 4월 1건). 상용차·애프터마켓 위주라 자동차 임베디드는 드묾. 목록은 브라우저 필요 |
| Analog Devices | 2026-10-18 | 꾸준함 미달(최근 3개월 1건, 4월 1건). 뉴스룸 보도자료 대부분이 실적·인수 등 회사 소식 |
| chargebyte | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 4월 1건). 2026-06-16 뒤로 뉴스 없음. 충전 통신 제어기 회사 |
| 黑芝麻智能 Black Sesame Technologies | 2026-10-18 | 꾸준함 미달(최근 3개월 3건, 4월 약 12건). 모터쇼 주간에 몰리고 최근 글은 로봇·AI 추론 위주. 목록에 날짜가 없어 상세 쪽을 하나씩 열어야 함 |
| 德赛西威 Desay SV | 2026-10-18 | 꾸준함 미달(최근 3개월 4건, 4월 2\~3건). 시상·행사 글이 섞임. 2쪽부터 브라우저 필요 |
| 移远通信 Quectel | 2026-10-18 | 꾸준함 미달(최근 3개월 3\~4건, 4월 약 6건). IoT 일반 글이 대부분이고 목록에 브라우저 필요 |
| 中科创达 ThunderSoft | 2026-10-18 | 꾸준함 미달(최근 3개월 영문 뉴스룸 0건·중문 2건, 4월 약 12건). 모터쇼 주간에 몰림. 중문 뉴스 목록은 11건뿐 |
| 芯驰科技 SemiDrive | 2026-10-18 | 꾸준함 미달(최근 3개월 3건, 4월 7건). 모터쇼 주간에 몰리고 나머지는 로봇·행사 글 |
| C2A Security | 2026-10-18 | 꾸준함 미달(최근 3개월 1\~2건, 5월 1건). 2026-08-25 뒤로 글 없음 |
| KPIT Technologies | 2026-10-18 | 꾸준함 미달(최근 3개월 0\~1건, 5월 1\~2건). 실적·협약 글 위주 |
| Silicon Motion | 2026-10-18 | 꾸준함 미달(최근 3개월 1건, 5월 1건). 스토리지·실적 글 위주 |
| New Eagle | 2026-10-18 | 꾸준함 미달(최근 3개월 0\~1건, 5월 1건). 행사·회사 소개 위주 |
| Counterpoint Research | 2026-10-18 | 꾸준함 미달(최근 3개월 2건, 5월 1건). 시장 조사 위주, 보고서는 유료 |
| Accurate Technologies | 2026-10-18 | 꾸준함 미달(최근 3개월 2건, 5월 1건). 교육용 블로그, 보도자료 없음 |
| 페스카로 | 2026-10-18 | 꾸준함 미달(최근 3개월 약 2건, 5월 1건). 뉴스룸이 외부 기사 링크 목록 |
| Yole Group | 2026-10-18 | 꾸준함 미달(최근 3개월 1\~2건, 5월 2\~3건). 시장 조사 위주, 브라우저 필요 |
| Juniperspring | 2026-10-18 | 꾸준함 미달(최근 3개월 0건, 6월 1건). 개인 블로그, 2022년 이후 글 16건 중 자동차 글이 2건 |
| Help Net Security | 2026-10-18 | 꾸준함 미달(최근 3개월 3건, 6월 2건). 자동차 글 대부분이 논문·벤더 조사를 풀어 쓴 기사 |
| rFpro | 2026-10-18 | 꾸준함 미달(최근 3개월 1건, 6월 2건). 피드·REST·개별 글이 403이고 뉴스 목록은 Node fetch로만 열리며 6월 글이 빠짐 |
| TÜV SÜD | 2026-10-18 | 꾸준함 미달(최근 3개월 1\~2건, 6월 1건). 보도자료 대부분이 비자동차이고 Cloudflare로 브라우저 필요 |
| AUMOVIO | 2026-10-19 | 꾸준함 경계(최근 3개월 3\~6건, 7월 2건). Valeo·SGS(약 3건)와 같은 잣대로 받지 않음. 뉴스룸은 curl로 열림 |
| ACEA | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 2건). 협회 입장문이고 규제 기관이 아님. WordPress REST로 열림 |
| Allegro DVT | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 1건). 영상 코덱 IP 업체라 자동차 글이 드묾 |
| Allegro MicroSystems | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 1건). 2026년 보도자료가 연 4건 안팎 |
| Apple | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 1건). CarPlay·차량 글은 연 몇 건 |
| AWS for Industries | 2026-10-19 | 꾸준함 미달(최근 3개월 약 3건, 7월 3건). 고객 사례·서비스 소개가 섞인 벤더 블로그 |
| CNCF | 2026-10-19 | 꾸준함 미달(최근 3개월 2건, 7월 1건). 자동차 글은 사례 연구가 거의 전부 |
| Cinemo | 2026-10-19 | 꾸준함 미달(최근 3개월 4건, 7월 1건). 수상·파트너십 위주 |
| Delta Electronics | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 1건). 전력 전자 업체이고 목록이 스크립트 |
| Emerson (NI) | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 1건). 시험·계측 업체이고 목록이 스크립트라 브라우저 필요 |
| FEV | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 1건). 수상·인사·철도·연료전지 글이 섞임 |
| Flow Engineering | 2026-10-19 | 꾸준함 미달(최근 3개월 0\~1건, 7월 2건). 항공우주·로봇 글이 많음 |
| FocalPoint | 2026-10-19 | 꾸준함 미달(최근 3개월 약 5건, 7월 2건). GNSS 한 주제의 마케팅 블로그 |
| HERE Technologies | 2026-10-19 | 꾸준함 미달(최근 3개월 약 2건, 7월 3건). EV 충전·내비·GIS 위주 |
| Honda | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 1건). 판매·트림·레이싱 글이 거의 전부 |
| IDTechEx | 2026-10-19 | 원 보도 매체가 아님(시장 조사 업체의 보고서 홍보 글). 전 분야 피드에서 자동차 임베디드 글이 거의 없음 |
| Lauterbach | 2026-10-19 | 꾸준함 미달(최근 3개월 3건, 7월 1건). 자동차 한정이 아닌 임베디드 디버거 업체 |
| Mack Trucks | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 2건). 목록이 스크립트라 브라우저 필요 |
| Melexis | 2026-10-19 | 꾸준함 미달(최근 3개월 약 2건, 7월 1건). 센서·전력 칩 위주이고 Cloudflare로 브라우저 필요 |
| Micron | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 2건). 자동차 글은 연 몇 건 |
| Micware | 2026-10-19 | 꾸준함 미달(최근 3개월 약 3건, 7월 1건). 비자동차 글이 다수 |
| Molex | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 1건). 데이터센터 위주이고 쪽 이동이 스크립트라 브라우저 필요 |
| NVIDIA | 2026-10-19 | 꾸준함 미달(자동차 블로그 피드 최근 3개월 3건, 7월 0건). 자율주행 AI 위주 |
| PCA Cyber Security | 2026-10-19 | 1차 발표도 원 보도도 아님(최근 3개월 1건, 남의 소식을 모은 분기 요약) |
| Panasonic Automotive Systems | 2026-10-19 | 꾸준함 미달(영문 기준 최근 3개월 0\~1건, 7월 1건). 일본어판이 글이 더 많음 |
| ROHM | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 0건). 파워·아날로그 소자 위주이고 목록이 스크립트 |
| Renault Group | 2026-10-19 | 꾸준함 미달(최근 3개월 약 1건, 7월 1건). 차종 공개·가격·레이싱 글, 피드 403 |
| SGS | 2026-10-19 | 꾸준함 미달(최근 3개월 약 3건, 7월 1건). 대부분 섬유·장난감 규제 소식, 검색이 스크립트 |
| UC San Diego | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 1건). 자동차 보안 연구가 연 1\~2건이고 사이트 안 검색을 못 읽음 |
| Valeo | 2026-10-19 | 꾸준함 미달(최근 3개월 약 3건, 7월 1건). 공급 계약·재무·열관리 글이 섞임 |
| Xperi | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 1건). TiVo 광고·스마트 TV·실적 글이 대부분 |
| oToBrite | 2026-10-19 | 꾸준함 미달(최근 3개월 0\~1건, 7월 1건). 행사 공지가 절반 |
| 东风汽车 Dongfeng Motor | 2026-10-19 | 꾸준함 미달(영문 뉴스룸 최근 3개월 0건, 7월 0건). 판매·행사 위주이고 중국어 목록은 읽지 못함 |
| 交通运输部 | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 7월 0건). 목록이 항만·도로 일반 소식이라 제목 키워드로 거르면 연 몇 건 |
| 코렌스 | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 7월 0건). 열관리 부품 업체이고 자체 뉴스룸에서 글을 못 찾음 |
| Texas Instruments | 2026-10-19 | 꾸준함 미달(최근 3개월 1\~2건, 8월 2건). 뉴스룸 목록이 스크립트 |
| LG Electronics | 2026-10-19 | 꾸준함 미달(최근 3개월 3건, 8월 1건). 영문 Vehicle Solution 뉴스룸 기준 |
| LG Innotek | 2026-10-19 | 꾸준함 미달(최근 3개월 3건, 8월 1건). 피드가 7주치 |
| Kaspersky Securelist | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 8월 1건). 좁은 질의가 잡음 없이 안 걸림 |
| ADAC | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 8월 1건). 자동차 시험 기관 |
| LX Semicon | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 8월 1건). 보도자료가 연 5건 안팎 |
| BMW Group PressClub | 2026-10-19 | 꾸준함 미달(최근 3개월 약 3건, 8월 1건). 모터스포츠·신차 위주 |
| SiEngine | 2026-10-19 | 꾸준함 미달(최근 3개월 1건, 8월 2건). 행사·투자 위주 |
| Xiaomi | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 8월 0건). 소비자 제품 위주 |
| 현대모비스 | 2026-10-19 | 꾸준함 미달(최근 3개월 1\~2건, 8월 0건) |
| 国家认监委 | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 8월 0건). 해당 공고를 사이트에서 못 찾음 |
| Lotus Cars | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 8월 0건). 보도자료가 5개월에 4건 |
| Cerence | 2026-10-19 | 꾸준함 미달(최근 3개월 약 4건, 8월 1건). 경계이고 재무·IR 글이 섞임 |
| Torex Semiconductor | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 8월 1건) |
| Kinetic Technologies | 2026-10-19 | 꾸준함 미달(최근 3개월 0건, 8월 1건) |
| 국민대학교 | 2026-10-19 | 꾸준함 미달(최근 3개월 1\~2건 어림, 8월 1건). 대학 소식 전반 |
| 과학기술정보통신부 보도자료 | 2026-10-19 | 찾는 법이 키워드별 검색(최근 3개월 0건, 8월 1건). 자율주행·표준에 한정 |
| ABC News | 2026-10-20 | 원 보도 매체이나 꾸준함 미달(최근 3개월 약 6건이 9월 20\~21일 연속 보도에 몰림). 자동차 전용 경로 없음 |
| Accenture | 2026-10-20 | 꾸준함 미달(최근 3개월 1건, 9월 1건). 컨설팅사 보도자료 |
| Aptiv | 2026-10-20 | 꾸준함 미달(최근 3개월 2\~3건, 9월 1건). 브라우저 필요 |
| Autoware Foundation | 2026-10-20 | 꾸준함 미달(최근 3개월 임베디드 1건 안팎, 9월 1건). 행사·회원 글이 섞임 |
| Changan Group | 2026-10-20 | 꾸준함 미달(최근 3개월 1건, 9월 1건). 신차·모터쇼 홍보 위주 |
| Chips&Media | 2026-10-20 | 꾸준함 미달(최근 3개월 2건 이하, 9월 0\~1건). 영상 코덱 IP |
| Daimler Truck | 2026-10-20 | 꾸준함 미달(최근 3개월 약 4건이 IAA 한 주에 몰림, 9월 약 3건) |
| Elmos Semiconductor | 2026-10-20 | 꾸준함 미달(최근 3개월 2건, 9월 2건). 실적·주총 글이 섞임 |
| Ettifos | 2026-10-20 | 꾸준함 미달(최근 3개월 1건, 9월 1건). 보도자료는 PR Newswire |
| Georgia Institute of Technology | 2026-10-20 | 꾸준함 미달(최근 3개월 1건, 9월 1건). 좁은 질의로 가려내기 어려움 |
| Himax Technologies | 2026-10-20 | 꾸준함 미달(최근 3개월 2건, 9월 2건). 디스플레이 IC 중심 |
| Kigen | 2026-10-20 | 꾸준함 미달(최근 3개월 1\~2건, 9월 1건). IoT eSIM 일반, 피드가 빔 |
| Lynred | 2026-10-20 | 꾸준함 미달(최근 3개월 1건, 9월 1건). 방산·우주 중심 |
| Nissan Motor | 2026-10-20 | 꾸준함 미달(최근 3개월 소프트웨어 약 4건, 엄밀히 1건; 9월 3건). 전체 발표는 약 50건 |
| OMNIVISION | 2026-10-20 | 꾸준함 미달(최근 3개월 2건이 같은 날, 9월 2건). 스마트폰·산업용이 섞임 |
| Rivian | 2026-10-20 | 꾸준함 미달 쪽(소프트웨어 스토리 5건, 9월 1건). 소비자 기능 소개 위주, 뉴스룸은 0건 |
| STMicroelectronics | 2026-10-20 | 꾸준함 미달(최근 3개월 1건, 9월 1건). RSS가 시간 초과 |
| Stoneridge | 2026-10-20 | 꾸준함 미달(최근 3개월 3건, 9월 1건). 상용차·오프하이웨이 중심 |
| The Autonomous | 2026-10-20 | 꾸준함 미달(최근 3개월 약 3건, 9월 1건). 보고서·행사 공지 위주 |
| aiMotive | 2026-10-20 | 꾸준함 미달 쪽(최근 3개월 5건이나 7월 0건, 9월 3건). ADAS·AD 벤더, 기술 해설 글이 많음 |
| Wayve | 2026-10-20 | 꾸준함 미달(최근 3개월 4건, 9월 2건). 제휴·서비스 발표 위주 |
| YFORE | 2026-10-20 | 꾸준함 미달(최근 3개월 약 4건이 공장 개소 행사에 몰림, 9월 3건) |
| 알파칩스 | 2026-10-20 | 꾸준함 미달(공식 보도자료 최근 3개월 0건). 9월 인증은 보도로만 나옴 |
| 인천일보 | 2026-10-20 | 꾸준함 미달(차량 임베디드 글 거의 없음). 지역 종합 일간지 |
| 페르세우스 | 2026-10-20 | 꾸준함 미달(최근 3개월 기술 발표 1건, 9월 1건). 전시·수상 안내 위주 |
