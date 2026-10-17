---
status: accepted
---

# 호스팅은 Cloudflare Pages Git 연동

Cloudflare는 새 프로젝트를 Workers로 시작하라고 권하지만, 이 위키는 Pages를 쓴다. 기본 URL(`ash-wiki.pages.dev`)이 Workers의 계정 서브도메인 URL보다 짧기 때문이다. 대시보드에 넣는 값은 저장소 밖에 있으므로, 문서에 표로 적어 저장소 값과 맞춘다.

## 고려한 대안

- Workers 정적 자산과 Workers Builds: 설정이 `wrangler.jsonc`로 저장소 안에 들어온다.
- GitHub Actions에서 빌드하고 Direct Upload로 배포: 이렇게 만든 프로젝트는 나중에 Git 연동으로 바꿀 수 없다.
