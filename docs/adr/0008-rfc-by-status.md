---
status: accepted
---

# RFC는 상태로 표준 원문인지 가린다

> 현행 규칙은 [출처 위계](../source-hierarchy.md#1층-출처)에 있다.

[ADR 0007](0007-source-hierarchy-with-self-history-and-survey-naming.md)의 위계는 표준·규제 원문을 좁혀 쓰지 않고, 그 밖의 1층 출처는 펴낸 발행기관의 말로 좁혀 쓴다. RFC는 모두 IETF가 펴내지만, 프로토콜을 정하는 표준도 있고 입문서(RFC 1180), 실험(RFC 7413), 운영 권고(RFC 3366)도 있다. 위계에 이 구분이 없어서, 게시된 페이지에는 Internet Standard인 RFC 1122를 "RFC 1122에 따르면"으로 좁혀 쓴 문장과, Informational인 RFC 1950을 "RFC 1950은 …를 정한다"처럼 표준으로 쓴 문장이 함께 있었다.

RFC는 상태로 가른다. Standards Track RFC만 표준 원문으로 보고, 그 밖의 RFC는 IETF라는 발행기관의 자료로 보아 좁혀 쓰기를 따른다. 지금은 새로 매기지 않는 Draft Standard도 Standards Track이라 표준 원문에 든다.

## 고려한 대안

- RFC를 모두 표준 원문으로 본다. 입문서나 실험 문서가 말한 것이 일반 명제나 "RFC는 …를 정한다"로 게시되어, 독자가 IETF 표준이 정한 것으로 읽는다.
- RFC를 모두 발행기관의 자료로 본다. RFC 791이 정한 IP 헤더처럼 표준이 정한 것까지 "RFC 791에 따르면"으로 좁혀 써서, 다른 표준 기구의 표준과 다르게 쓰게 된다.
- BCP를 표준 원문에 넣는다. BCP도 IETF 합의를 거치지만 프로토콜을 정하지 않고 운영과 절차를 권하므로, 권고를 보고 동사로 쓰는 좁혀 쓰기 꼴이 맞다.
