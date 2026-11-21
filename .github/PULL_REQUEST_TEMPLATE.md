<!--
간결한 본문의 예시입니다. 쓰는 법은 CONTRIBUTING.md의 PR 본문 절에 있고, 흐름의 스킬이 본문에 정한 항목은 더합니다.

Closes #638

## Summary

- `npm run axe`를 더했습니다. 로컬 빌드 7쪽을 1280px·390px, 라이트·다크로 검사합니다.
- 태그 목록 날짜와 footer는 플러그인의 투명도를 걷고 `gray`·`secondary`를 씁니다.
- 한 태그의 목록과 호 카드의 제목을 h2로 바꿨습니다. 크기는 그대로입니다.

## Evidence

- **Before:** `main`에서 `npm run axe` 위반 246곳입니다.
  **After:** 예외 밖 위반 0곳, 예외는 콜아웃 제목 1곳입니다.
- `npm run check`: 다섯째 커밋까지 로컬에서 통과했고, 그 뒤 커밋은 CI에 맡겼습니다.
- 확인하지 않은 것: Chromium 밖의 브라우저.

## Merge Danger

**Door:** two-way

**Blast Radius:** 스타일

색과 제목 수준만 바뀌어, 되돌리면 그대로 돌아갑니다.
-->

Closes #

## Summary

## Evidence

## Merge Danger

**Door:**

**Blast Radius:**
