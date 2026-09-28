---
title: 인용 위반
tags:
  - network
verified: 2026-09-20
---

머리말이다.

<!-- 위반(citation): 대괄호 하나에 키가 둘이다. -->

첫 문장이다.[@example-spec-2024; @example-manual-2023]

<!-- 위반(citation, output): bib/에 엔트리가 없는 키라 [@ 마커가 그대로 남는다. -->

둘째 문장이다.[@missing-key-2020]

<!-- 위반(citation): 키 꼴이 <발행기관>-<식별자>-<연도>가 아니다. -->

셋째 문장이다.[@BadKey]

<!-- 위반(citation, output): 앞 키는 bib/에 있지만(엔트리 쪽 위반은 bib 파일 주석), 뒤 키는 파일 이름과 엔트리 키가 달라 엔트리가 없는 키가 되고 [@ 마커가 남는다. -->

넷째 문장이다.[@no-urldate-spec-2024] 다섯째 문장이다.[@renamed-entry-2024]
