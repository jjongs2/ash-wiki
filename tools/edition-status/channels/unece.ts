import { ChannelError, type Channel } from "../model"

// UNECE 통로. 구현 전이다.
export const unece: Channel = {
  id: "unece",
  ownsPage: (page) => page.publisher === "UNECE",
  publicationOf: () => undefined,
  async check() {
    throw new ChannelError("UNECE 통로는 아직 구현하지 않았다")
  },
}
