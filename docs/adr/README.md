# ADR

결정과 그 까닭의 기록입니다. 현행 규칙과의 관계와 ADR을 언제 더하는지는 도메인 문서의 [ADR과 운영 문서](../agents/domain.md#adr과-운영-문서)를 따릅니다.

## 기반

- [0001](0001-isolation-boundary.md) 소스 노트는 격리 경계 밖에 둔다
- [0003](0003-engine-and-citation-stack.md) 엔진은 Quartz v5, 인용은 citations 플러그인과 엔트리별 bib 파일
- [0004](0004-cloudflare-pages.md) 호스팅은 Cloudflare Pages Git 연동
- [0017](0017-content-license.md) 콘텐츠는 CC BY 4.0, 참고문헌 데이터는 CC0 1.0으로 한다
- [0021](0021-ui-locale-and-csl-locale.md) UI locale은 ko-KR, 참고문헌의 CSL locale은 en-US로 가른다 (0003의 locale을 고침)

## 출처 위계

- [0007](0007-source-hierarchy-with-self-history-and-survey-naming.md) 출처 위계에 자기 역사와 서베이의 명명·분류를 넣는다
- [0008](0008-rfc-by-status.md) RFC는 상태로 표준 원문인지 가린다
- [0009](0009-editor-posted-copies.md) 편집서의 편집자가 공개한 사본을 인정한다
- [0013](0013-publisher-scope.md) 발행기관의 범위
- [0018](0018-consensus-documents.md) 합의 문서로 검증한 다툼 없는 설명은 일반 명제로 쓴다 (0007, 0013, 0014, 0016을 고침)
- [0019](0019-free-previews-and-bot-block-429.md) 무료 미리보기와 스크린숏 사본을 인정하고, 봇 차단 호스트의 429를 봇 차단으로 센다

## 출처 표시와 판

- [0012](0012-edition-rules-for-all-publications.md) 판의 규칙을 표준·규제 밖의 출판물에도 쓴다
- [0014](0014-source-run-attribution.md) 출처 표시를 같은 출처가 이어지는 구간마다 한 번 둔다
- [0016](0016-source-run-by-edition.md) 출처 구간의 같은 출처를 판으로 가리고, 다른 출처의 문장을 구간에 끼우지 않는다
- [0020](0020-dated-status-statements.md) 곧 낡는 상태 문장에 달 단위 날짜를 붙인다

## 콘텐츠 구조

- [0011](0011-standard-page-by-publication.md) 표준 페이지는 출판물로 고른다
- [0015](0015-weekly-news-outside-wiki-content.md) 주간 소식은 위키 콘텐츠 밖의 페이지다

## 대체됨

- [0002](0002-source-hierarchy-by-claim-kind.md) 출처 위계는 주장의 종류에 따라 다르게 둔다 (0005가 대체)
- [0005](0005-source-hierarchy-with-background-claims.md) 출처 위계에 배경 주장과 벤더의 모든 문서를 넣는다 (0006이 대체)
- [0006](0006-source-hierarchy-with-theory-claims.md) 출처 위계에 이론 주장과 원 논문을 넣는다 (0007이 대체)
- [0010](0010-section-level-source-attribution.md) 한 출처만 이어지는 절은 출처 표시를 절 첫 문단에 한 번 둔다 (0014가 대체)
