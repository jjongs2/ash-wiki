// 테스트 전용 preload. 로컬 테스트 서버(127.0.0.1) 밖으로 가는 fetch를 `/<호스트><경로>`로 그 서버에 돌린다.
// 통로의 실제 URL과 GitHub API를 그대로 둔 채 응답을 테스트가 정할 수 있다.
// 모듈이 아닌 스크립트라 tools/source-status/fake-hosts.ts와 이름이 겹치면 tsc가 같은 전역으로 본다.
const fakeOrigin = process.env.FAKE_HOSTS_ORIGIN!
const originalFetch = globalThis.fetch

globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input))
  const local = url.hostname === new URL(fakeOrigin).hostname
  return originalFetch(
    local ? url : new URL(`/${url.host}${url.pathname}${url.search}`, fakeOrigin),
    init,
  )
}
