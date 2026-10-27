// Reader Testing 3단계의 독자(SKILL.md). Workflow 도구가 scriptPath로 부른다.
// 지시와 반환 꼴은 캡처 폴더의 지시.md(reader.md)에 있다. 반환을 파일로 받는 것은, 워크플로가
// 돌려주는 값이 끝날 때 한꺼번에 메인 문맥에 들어오기 때문이다.
export const meta = {
  name: "reader-testing-read",
  description: "Reader Testing 3단계: 고른 페이지마다 독자 하나를 띄운다",
  phases: [{ title: "읽기", model: "sonnet" }],
}

const { capture, slugs } = args

// counts의 키는 반환 꼴의 칸 이름이다. 칸은 reader.md에만 두므로 schema에 정하지 않는다.
// schema의 속성 이름은 API가 영문, 숫자, `_.-`만 받는다
const RESULT = {
  type: "object",
  properties: {
    page: { type: "string" },
    counts: { type: "object", additionalProperties: { type: "integer" } },
  },
  required: ["page", "counts"],
}

phase("읽기")
const results = await parallel(
  slugs.map(
    (slug) => () =>
      agent(
        [
          `너는 Reader Testing의 독자다. \`${capture}/지시.md\`를 읽고 따른다.`,
          "",
          `- 캡처 폴더: \`${capture}\``,
          `- 페이지: \`${slug}\``,
        ].join("\n"),
        {
          label: slug,
          phase: "읽기",
          agentType: "general-purpose",
          // 모델을 정하지 않으면 메인 세션의 모델을 물려받는다
          model: "sonnet",
          schema: RESULT,
        },
      ),
  ),
)

const failed = slugs.filter((_, i) => !results[i])
if (failed.length) log(`반환 없이 끝난 독자: ${failed.join(", ")}`)
return { 반환: results.filter(Boolean), 실패: failed }
