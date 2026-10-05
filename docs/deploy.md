# 배포

사이트는 Cloudflare Pages의 Git 연동으로 배포합니다([ADR 0004](adr/0004-cloudflare-pages.md)). 대시보드 값은 저장소 밖에 있으므로, 저장소 값과 맞춰 이 표에 적습니다.

## 대시보드 값

항목 이름은 대시보드의 표기를 따릅니다.

| 항목                   | 값                                                                               |
| ---------------------- | -------------------------------------------------------------------------------- |
| Project name           | `ash-wiki`                                                                       |
| Production branch      | `main`                                                                           |
| Framework preset       | `None`                                                                           |
| Build command          | `npm run build`                                                                  |
| Build output directory | `public`                                                                         |
| Node                   | 22. 저장소의 `.node-version`이 정하므로 `NODE_VERSION` 환경 변수는 두지 않습니다 |
| Preview branch         | `None`(프리뷰 배포 끔)                                                           |
| Web Analytics          | 켬(Metrics 탭)                                                                   |

## 저장소 쪽 값

대시보드 값과 맞물리는 저장소 쪽 값은 `package.json`의 `build` 스크립트, `.node-version`, `quartz.config.yaml`의 `baseUrl`과 `analytics`입니다. Web Analytics 스크립트는 Cloudflare가 배포 때 넣으므로 `analytics`는 `null`로 둡니다.

## 로컬 프리뷰

```sh
npm ci
npm run prebuild
npx quartz build --serve
```

`prebuild`는 `npm run build`가 빌드 전에 돌리는 준비 단계이고, 빌드는 `--serve`가 합니다.

`http://localhost:8080`에서 대문이 열립니다.

### 바뀐 곳 표시

`WIKI_DIFF=<ref>`를 주면 프리뷰가 기준 이후 바뀐 블록을 diff처럼 표시합니다(`plugins/wiki-diff`). 변수가 없으면 아무것도 하지 않으므로 배포 빌드는 그대로입니다.

```sh
npm run preview:diff                  # origin/main 기준
WIKI_DIFF=<SHA> npm run preview:diff  # 그 커밋 이후만
```

- 시작할 때 `npm run build`와 같은 `prebuild`를 먼저 돌립니다. 띄운 뒤에 `bib/`를 고치면 합본이 새로 만들어지지 않으므로 서버를 재시작합니다.
- 기준은 `git merge-base HEAD <ref>` 시점의 원본이고, 비교 대상은 디스크의 현재 파일입니다. 커밋하지 않은 수정도 보입니다. 브랜치, SHA, `HEAD~2` 모두 받고, 끝점을 주는 범위(`a..b`)는 받지 않습니다. 지난번 리뷰한 SHA를 주면 그 뒤에 바뀐 곳만 보입니다.
- 새 블록은 왼쪽의 초록 실선과 옅은 배경, 바뀐 블록은 초록 점선으로 표시하고, 바뀐 블록 안의 새 어절은 `<ins>`, 빠진 어절은 `<del>`입니다. 지운 블록은 제자리에 빨간 선을 단 상자로, 원본 마크다운을 그대로 취소선을 그어 보입니다. 가리키는 SVG가 바뀐 도해도 바뀐 블록이지만, 도해 안의 어디가 바뀌었는지는 보이지 않습니다.
- 오른쪽 아래 막대에 이 표시의 범례가 있습니다. "바뀐 곳만"을 켜면 바뀐 블록과 그 제목만 순서대로 남습니다. ↑·↓ 버튼이나 `n`·`p` 키는 바뀐 블록을 차례로 옮겨 다니고, 페이지 끝에서는 바뀐 페이지 목록의 다음이나 이전 페이지로 넘어갑니다.
- 새 페이지는 블록마다 표시하지 않고 맨 위에 안내 한 줄만 둡니다. 막대는 "새 페이지"라고 알리고 이 안내에 한 번 서며, "바뀐 곳만"을 켜도 본문을 숨기지 않습니다.
- 새 페이지, 바뀐 페이지, 지운 페이지 목록은 대문 배너와 터미널에 나옵니다. `--serve`는 바뀐 파일만 다시 파싱하므로 대문 배너는 처음 빌드한 뒤 갱신되지 않을 수 있습니다. 최신 목록은 빌드마다 찍히는 터미널 목록에서 봅니다.
- ref를 찾지 못하면 빌드가 이유를 알리고 멈춥니다.
