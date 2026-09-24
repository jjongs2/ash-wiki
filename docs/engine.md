# 엔진

사이트 엔진은 Quartz v5를 복제해 씁니다([ADR 0003](adr/0003-engine-and-citation-stack.md)).

## 기준선

| 항목       | 값                                                      |
| ---------- | ------------------------------------------------------- |
| 저장소     | https://github.com/jackyzha0/quartz                     |
| 브랜치     | `v5`                                                    |
| 기준선 SHA | `97a2d05f80c4c50534959b1d0d41cc4b3895625e` (2026-09-20) |

기준선 트리 중 다음은 가져오지 않았습니다. 업스트림의 문서 사이트(`docs/`), 업스트림 CI와 템플릿(`.github/`), `Dockerfile`, `CODE_OF_CONDUCT.md`, `README.md`, `content/.gitkeep`입니다.

## 고친 파일

고친 파일 목록은 따로 적지 않고 기준선과의 `git diff`로 계산합니다. 고친 이유는 각 파일 안의 주석에 있습니다.

```sh
git fetch https://github.com/jackyzha0/quartz.git 97a2d05f80c4c50534959b1d0d41cc4b3895625e
git diff --name-only --diff-filter=M 97a2d05f80c4c50534959b1d0d41cc4b3895625e HEAD -- . ':!README.md'
```

`README.md`는 이 저장소의 소개라 엔진 파일로 보지 않고 뺍니다. 엔진 트리(`quartz/`) 안에 더한 파일은 `--diff-filter=A`로 봅니다. 더한 이유는 파일 맨 위의 주석에 있습니다.

```sh
git diff --name-only --diff-filter=A 97a2d05f80c4c50534959b1d0d41cc4b3895625e HEAD -- quartz
```

JSON 파일은 주석을 달 수 없어서, npm 관례에 따라 최상위 `"//"` 키에 이유를 적습니다. `tsconfig.json`은 주석을 허용하는 JSONC라 주석으로 적습니다.

## 설정

사이트 설정은 `quartz.config.yaml`에 둡니다. 업스트림 기본값인 `quartz.config.default.yaml`은 고치지 않고, 설정 로더가 `quartz.config.yaml`을 먼저 읽습니다. 기본값과 다르게 둔 항목 가운데 값만 봐서 이유를 알 수 없는 것은 `quartz.config.yaml`의 주석에 이유를 적습니다.

## 태그 목록

태그 목록 페이지는 tag-page 플러그인이 만듭니다. 태그의 한국어 표시 이름은 `content/tags/<구역>.md`, `content/tags/<구역>/<주제>.md`의 `title`로 주고, 본문은 비워 둡니다.

- 표시 이름 파일이 있으면, 그 태그를 쓰는 페이지가 없어도 태그 목록 페이지가 생깁니다. 이때 목록은 비어 있습니다.
- 상위 태그 목록(`tags/network`)은 하위 태그 목록(`tags/network/can`)으로 링크하지 않습니다. 대문이 두 층을 모두 직접 링크하는 이유입니다.
- 대문의 링크는 `[[tags/network|네트워크]]`처럼 표시 이름을 한 번 더 적습니다. 별칭이 없는 위키링크는 대상 페이지의 `title`이 아니라 경로의 마지막 부분(`network`)을 보여 주기 때문입니다.
- 표시 이름 파일은 태그 경로를 따라 `content/tags/` 아래 폴더에 둘 수밖에 없습니다. 슬러그를 폴더 없는 한 네임스페이스로 두는 규칙에서 `tags/`는 예외입니다.

## 인용

`[@키]`를 citations 플러그인이 IEEE 스타일의 번호로 바꾸고, 페이지 하단에 참고문헌을 붙입니다([ADR 0003](adr/0003-engine-and-citation-stack.md)). 표기 규칙은 [위키 규약](wiki-conventions.md)에 있습니다.

- `npm run build`의 prebuild(`npm run bib`)가 `bib/`의 엔트리 파일을 합본 `bibliography.bib`로 합칩니다. 합본은 추적하지 않습니다.
- CSL은 저장소가 소유합니다(`csl/ieee.csl`). 고치지 않고 가져온 그대로 둡니다.

| 항목     | 값                                                      |
| -------- | ------------------------------------------------------- |
| 저장소   | https://github.com/citation-style-language/styles       |
| 파일     | `ieee.csl`                                              |
| 커밋     | `1ccf4696be22ea0b55f83cc9163bde3061fddb0a` (2026-01-07) |
| 라이선스 | CC BY-SA 3.0(파일 안 `<rights>`)                        |
