# 배포

사이트는 Cloudflare Pages의 Git 연동으로 배포합니다([ADR 0004](adr/0004-cloudflare-pages.md)). 대시보드 값은 저장소 밖에 있으므로, 저장소 값과 맞춰 이 표에 적습니다.

## 대시보드 값

| 항목               | 값                                                                                |
| ------------------ | --------------------------------------------------------------------------------- |
| 프로젝트 이름      | `ash-wiki`                                                                        |
| 프로덕션 브랜치    | `main`                                                                            |
| Framework preset   | `None`                                                                            |
| 빌드 명령          | `npm run build`                                                                   |
| 빌드 출력 디렉터리 | `public`                                                                          |
| Node               | 22. 저장소의 `.node-version`이 정하므로 대시보드에 `NODE_VERSION`을 두지 않습니다 |
| 프리뷰 배포        | 끔. Branch control에서 preview 브랜치를 `None`으로 둡니다                         |

## 저장소 쪽 값

- `package.json`의 `build` 스크립트: `prebuild`가 플러그인을 먼저 설치한 뒤 `quartz build`를 돌립니다.
- `.node-version`: 빌드 이미지가 읽는 Node 버전입니다.
- `quartz.config.yaml`의 `baseUrl`: `ash-wiki.pages.dev`

## 로컬 프리뷰

```sh
npm ci
npm run build
npx quartz build --serve
```

`http://localhost:8080`에서 대문이 열립니다.
