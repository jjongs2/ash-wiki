// serve-handler는 타입을 싣지 않는다. tools/serve.ts가 쓰는 옵션만 적는다.
declare module "serve-handler" {
  import type { IncomingMessage, ServerResponse } from "node:http"
  export default function handler(
    request: IncomingMessage,
    response: ServerResponse,
    options?: { public?: string; cleanUrls?: boolean; directoryListing?: boolean },
  ): Promise<void>
}
