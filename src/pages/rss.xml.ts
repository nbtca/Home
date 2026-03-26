import rss from "@astrojs/rss"
import type { APIContext } from "astro"
import { SITE_NAME, SITE_DESCRIPTION } from "../consts"

type AuthorObject = {
  name: string
  url?: string
  link?: string
}

type PostFrontmatter = {
  title: string
  pubDate: string
  description?: string
  author?: string | AuthorObject
  tags?: string[]
}

type MarkdownModule = {
  frontmatter: PostFrontmatter
  url: string | undefined
}

function resolveAuthorName(author: PostFrontmatter["author"]): string {
  if (!author) return SITE_NAME
  if (typeof author === "string") return author
  return author.name
}

export async function GET(context: APIContext) {
  const postModules = import.meta.glob<MarkdownModule>("./posts/**/*.md", {
    eager: true,
  })

  const items = Object.values(postModules)
    .filter(post => post.frontmatter.pubDate && post.url)
    .map(post => ({
      title: post.frontmatter.title,
      description: (post.frontmatter.description ?? "").trim(),
      pubDate: new Date(post.frontmatter.pubDate),
      link: post.url as string,
      author: resolveAuthorName(post.frontmatter.author),
      categories: post.frontmatter.tags ?? [],
    }))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site ?? "https://nbtca.space",
    items,
    customData: `<language>zh-CN</language>`,
  })
}
