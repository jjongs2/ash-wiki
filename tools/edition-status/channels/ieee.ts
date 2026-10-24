import { ChannelError, type Channel } from "../model"

// IEEE 통로. 구현 전이다.
export const ieee: Channel = {
  id: "ieee",
  ownsPage: (page) => /^IEEE\b/.test(page.publisher),
  publicationOf: () => undefined,
  async check() {
    throw new ChannelError("IEEE 통로는 아직 구현하지 않았다")
  },
}
