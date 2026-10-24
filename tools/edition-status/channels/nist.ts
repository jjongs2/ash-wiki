import { ChannelError, type Channel } from "../model"

// NIST 통로. 구현 전이다.
export const nist: Channel = {
  id: "nist",
  ownsPage: (_page) => false,
  publicationOf: () => undefined,
  async check() {
    throw new ChannelError("NIST 통로는 아직 구현하지 않았다")
  },
}
