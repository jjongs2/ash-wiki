// ash-wiki: OG 이미지 emitter(CustomOgImages)를 뺄지 정한다. 이미지를 페이지마다 그리느라 빌드 시간의
// 절반을 넘게 쓰는데, 미리보기(--serve)와 콘텐츠 검사기의 빌드는 이미지를 보지 않는다(docs/deploy.md).
import { QuartzConfig } from "../cfg"
import { Argv } from "./ctx"

export function ogImagesEnabled(argv: Pick<Argv, "serve">, flag = process.env.OG_IMAGES): boolean {
  if (flag === "1") return true
  if (flag === "0") return false
  return !argv.serve
}

export function withOgImagesSetting(cfg: QuartzConfig, argv: Pick<Argv, "serve">): QuartzConfig {
  if (ogImagesEnabled(argv)) return cfg
  const emitters = cfg.plugins.emitters.filter((emitter) => emitter.name !== "CustomOgImages")
  return { ...cfg, plugins: { ...cfg.plugins, emitters } }
}
