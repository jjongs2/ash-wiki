import { PageFrame, PageFrameProps } from "./types"

/**
 * Minimal page frame — no sidebars, no header/footer chrome. Only the
 * page body is rendered with a thin wrapper, plus the footer for legal/link
 * obligations.
 *
 * Useful for immersive page types like full-screen canvases, kiosks,
 * or custom landing pages that want complete control of the viewport.
 *
 * ash-wiki: 가운데 칸은 기본 꼴(DefaultFrame.tsx)과 같은 <main>이다(#633).
 */
export const MinimalFrame: PageFrame = {
  name: "minimal",
  render({ componentData, pageBody: Content, footer }: PageFrameProps) {
    return (
      <>
        <main class="center minimal" id="quartz-main" tabindex={-1}>
          <Content {...componentData} />
        </main>
        {footer.map((FooterComponent) => (
          <FooterComponent {...componentData} />
        ))}
      </>
    )
  },
}
