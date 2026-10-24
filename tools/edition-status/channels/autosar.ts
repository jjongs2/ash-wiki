import { ChannelError, type Channel } from "../model"

// AUTOSAR 통로. 구현 전이다.
export const autosar: Channel = {
  id: "autosar",
  ownsPage: (page) => page.publisher === "AUTOSAR",
  publicationOf: () => undefined,
  async check() {
    throw new ChannelError("AUTOSAR 통로는 아직 구현하지 않았다")
  },
}
