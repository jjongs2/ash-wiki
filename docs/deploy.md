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
