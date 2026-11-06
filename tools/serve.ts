import http from "node:http"
import type { AddressInfo } from "node:net"
import handler from "serve-handler"

// 로컬 빌드 폴더를 이 프로세스 안의 서버로 띄운다. 따로 띄운 서버는 셸이 끝나면 죽기 때문이다.
// Reader Testing 캡처(tools/reader-capture)와 접근성 검사(tools/axe)가 쓴다.
export async function serve(dir: string): Promise<{ base: string; close: () => void }> {
  const server = http.createServer((req, res) =>
    handler(req, res, { public: dir, cleanUrls: true, directoryListing: false }).catch((error) => {
      res.statusCode = 500
      res.end(String(error))
    }),
  )
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
  const { port } = server.address() as AddressInfo
  return { base: `http://127.0.0.1:${port}`, close: () => server.close() }
}
