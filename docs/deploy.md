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

## 저장소 쪽 값

대시보드 값과 맞물리는 저장소 쪽 값은 `package.json`의 `build` 스크립트, `.node-version`, `quartz.config.yaml`의 `baseUrl`입니다.

## 로컬 프리뷰

```sh
npm ci
npm run build
npx quartz build --serve
```

`http://localhost:8080`에서 대문이 열립니다.

### 바뀐 곳 표시

`WIKI_DIFF=<ref>`를 주면 프리뷰가 기준 이후 바뀐 블록을 diff처럼 표시합니다(`plugins/wiki-diff`). 변수가 없으면 아무것도 하지 않으므로 배포 빌드는 그대로입니다.

```sh
npm run preview:diff                  # origin/main 기준
WIKI_DIFF=<SHA> npm run preview:diff  # 그 커밋 이후만
```

- 기준은 `git merge-base HEAD <ref>` 시점의 원본이고, 비교 대상은 디스크의 현재 파일입니다. 커밋하지 않은 수정도 보입니다. 브랜치, SHA, `HEAD~2` 모두 받고, 끝점을 주는 범위(`a..b`)는 받지 않습니다. 지난번 리뷰한 SHA를 주면 그 뒤에 바뀐 곳만 보입니다.
- 바뀐 블록과 새 블록은 초록 막대로 구별해 표시하고, 바뀐 블록 안의 새 어절은 `<ins>`, 빠진 어절은 `<del>`입니다. 지운 블록은 제자리에 원본 마크다운 그대로 취소선 상자로 보입니다. 가리키는 SVG가 바뀐 도해도 바뀐 블록이지만, 도해 안의 어디가 바뀌었는지는 보이지 않습니다.
- 새 페이지, 바뀐 페이지, 지운 페이지 목록은 대문 배너와 터미널에 나옵니다. `--serve`는 바뀐 파일만 다시 파싱하므로 대문 배너는 처음 빌드한 뒤 갱신되지 않을 수 있습니다. 최신 목록은 빌드마다 찍히는 터미널 목록에서 봅니다.
- ref를 찾지 못하면 빌드가 이유를 알리고 멈춥니다.
