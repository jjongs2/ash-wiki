import { ChannelError, type Channel } from "../model"

// ISTQB 통로. 구현 전이다.
export const istqb: Channel = {
  id: "istqb",
  ownsPage: (_page) => false,
  publicationOf: () => undefined,
  async check() {
    throw new ChannelError("ISTQB 통로는 아직 구현하지 않았다")
  },
}
