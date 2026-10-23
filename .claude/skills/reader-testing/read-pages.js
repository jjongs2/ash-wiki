// Reader Testing 3단계의 독자(SKILL.md). Workflow 도구가 scriptPath로 부른다.
// args: { capture: "<캡처 폴더>", slugs: ["<슬러그>", …] }
// 지시와 반환 꼴은 캡처 폴더의 지시.md(reader.md)에 있다. 독자는 반환을 returns/<슬러그>.json에 쓰고
// 여기에는 건수만 돌려주므로, 끝난 뒤 메인 문맥에 들어오는 것은 페이지마다 한 줄이다.
export const meta = {
  name: "reader-testing-read",
  description: "Reader Testing 3단계: 고른 페이지마다 독자 하나를 띄운다",
  phases: [{ title: "읽기", model: "sonnet" }],
}

const { capture, slugs } = args

// 건수의 키는 반환 꼴의 칸 이름이다. 칸은 reader.md에만 두므로 schema에 정하지 않는다
const RESULT = {
  type: "object",
  properties: {
    page: { type: "string" },
    건수: { type: "object", additionalProperties: { type: "integer" } },
  },
  required: ["page", "건수"],
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
