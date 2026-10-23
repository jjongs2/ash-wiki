---
status: accepted
---

# UI locale은 ko-KR, 참고문헌의 CSL locale은 en-US로 가른다

> 현행 규칙은 [엔진 문서의 locale 절](../engine.md#locale)에 있다.
>
> 고려한 대안의 "로더가 로컬 플러그인의 컴포넌트를 읽지 못한다"는 전제는 틀렸다. 로더는 `package.json`의 exports를 먼저 읽고, 그래프 fork(#369)가 그렇게 컴포넌트를 싣는다. 결정은 그대로다.

[ADR 0003](0003-engine-and-citation-stack.md)은 사이트 locale을 `en-US`로 두었다. citations 플러그인은 따로 locale 옵션이 없이 사이트 locale을 쓰고, `en-US`가 아니면 CSL locale 파일을 페이지마다 raw.githubusercontent.com에서 받기 때문이다. 그 대가로 본문은 한국어인데 UI 문구와 날짜가 영어라, 한 화면에 두 언어가 섞였다.

- 사이트 locale은 `ko-KR`로 두고, citations만 패치로 `en-US`에 묶는다(소유자 결정, #460). 참고문헌은 IEEE 꼴의 영어 고정 문구 그대로이고, 빌드가 네트워크에 기대지 않는다.
- npm 플러그인 안의 문구를 고치는 수단은 patch-package 하나로 둔다. citations 말고도 여러 플러그인이 ko-KR 사본을 영어로 두거나 영어를 코드에 박아 두어, 설정만으로는 고칠 수 없다.

## 고려한 대안

- 로컬 플러그인으로 감싼다. citations는 transformer라 감쌀 수 있지만, 영어가 남는 나머지는 레이아웃 컴포넌트다. 엔진의 로더는 로컬 플러그인의 컴포넌트를 읽지 못해(`./components`의 `.js`만 찾는다) 로더부터 고쳐야 하고, 감싼 쪽은 출력 VNode의 글자를 다시 바꿔야 한다. 코드가 패치의 몇 배이고, 업스트림 꼴이 바뀌면 조용히 놓친다. 패치는 맞지 않으면 설치가 실패한다.
- CSL locale 파일을 저장소에 둔다. 플러그인이 사이트 locale로 URL을 정해 rehype-citation에 넘기므로, 파일을 두어도 플러그인을 고쳐야 한다.
- UI와 CSL을 모두 `ko-KR`로 둔다. 참고문헌의 고정 문구가 한국어로 바뀌어 IEEE 꼴과 달라지고, 빌드가 원격 파일에 기댄다.
