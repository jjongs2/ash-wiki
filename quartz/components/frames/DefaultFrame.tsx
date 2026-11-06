import { PageFrame, PageFrameProps } from "./types"
import HeaderConstructor from "../Header"

const Header = HeaderConstructor()

/**
 * The default page frame — three-column layout with left sidebar, center
 * content (header + body + afterBody), and right sidebar, followed by a footer.
 *
 * This is the original Quartz layout, extracted from renderPage.tsx.
 *
 * ash-wiki: 칸마다 랜드마크를 둔다(#633). 왼쪽 사이드바(사이트 이름, 검색, 탐색기)는 banner, 가운데 칸은
 * <main>, 오른쪽 사이드바는 complementary(<aside>)다. footer 컴포넌트는 스스로 <footer>(contentinfo)다.
 * 왼쪽 사이드바를 <header>로 두지 않는 것은 업스트림 Header의 전역 header 규칙(flex, margin)이 걸리기
 * 때문이다. <main>은 건너뛰기 링크와 SPA 이동이 포커스를 옮기는 자리라 tabindex="-1"을 받는다
 * (renderPage.tsx, spa.inline.ts).
 */
export const DefaultFrame: PageFrame = {
  name: "default",
  render({
    componentData,
    header,
    beforeBody,
    pageBody: Content,
    afterBody,
    left,
    right,
    footer,
  }: PageFrameProps) {
    return (
      <>
        <div class="left sidebar" role="banner">
          {left.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </div>
        <main class="center" id="quartz-main" tabindex={-1}>
          <div class="page-header">
            <Header {...componentData}>
              {header.map((HeaderComponent) => (
                <HeaderComponent {...componentData} />
              ))}
            </Header>
            <div class="popover-hint">
              {beforeBody.map((BodyComponent) => (
                <BodyComponent {...componentData} />
              ))}
            </div>
          </div>
          <Content {...componentData} />
          <hr />
          <div class="page-footer">
            {afterBody.map((BodyComponent) => (
              <BodyComponent {...componentData} />
            ))}
          </div>
        </main>
        <aside class="right sidebar">
          {right.map((BodyComponent) => (
            <BodyComponent {...componentData} />
          ))}
        </aside>
        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}
      </>
    )
  },
}
