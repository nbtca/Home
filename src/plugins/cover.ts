import path from "path"
import { type RehypePlugin } from "@astrojs/markdown-remark"
import { convertImageToBase64URL } from "../utils/image"

export const handleLocalCoverPlugin: RehypePlugin = () => {
  return async (tree, file) => {
    const filePath = file.history[0]
    type AstroData = {
      frontmatter: {
        cover: { url: string } | string | undefined
      }
    }
    const astroData = file.data.astro as AstroData
    if (!astroData.frontmatter.cover) {
      return
    }
    const coverUrl = typeof astroData.frontmatter.cover === "string" ? astroData.frontmatter.cover : astroData.frontmatter.cover.url
    if (coverUrl.includes("http")) {
      return
    }
    if (coverUrl.includes("base64")) {
      return
    }
    const url = path.resolve(path.dirname(filePath), coverUrl)
    const dataURL = await convertImageToBase64URL(url)
    if (typeof astroData.frontmatter.cover === "string") {
      astroData.frontmatter.cover = dataURL
    }
    else {
      astroData.frontmatter.cover.url = dataURL
    }
  }
}
