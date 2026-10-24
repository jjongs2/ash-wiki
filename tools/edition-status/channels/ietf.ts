import { ChannelError, type Channel } from "../model"

// IETF 통로. 구현 전이다.
export const ietf: Channel = {
  id: "ietf",
  ownsPage: (_page) => false,
  publicationOf: () => undefined,
  async check() {
    throw new ChannelError("IETF 통로는 아직 구현하지 않았다")
  },
}
