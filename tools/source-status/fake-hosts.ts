// 테스트 전용 preload. 로컬 테스트 서버(127.0.0.1) 밖으로 가는 fetch를 경로만 남기고 그 서버로 돌린다.
// 봇 차단 호스트 목록의 실제 호스트(예: www.iso.org)를 bib에 적은 채로 응답을 테스트가 정할 수 있다.
const serverOrigin = process.env.FAKE_HOSTS_ORIGIN!
const realFetch = globalThis.fetch

globalThis.fetch = (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input))
  return realFetch(url.hostname === "127.0.0.1" ? url : new URL(url.pathname, serverOrigin), init)
}
