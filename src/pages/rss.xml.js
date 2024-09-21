import rss, { pagesGlobToRssItems } from "@astrojs/rss"

export async function get() {
  return rss({
    title: "NBTCA Home",
    description: "NBTCA Home Page",
    site: "https://www.nbtca.space",
    items: await pagesGlobToRssItems(import.meta.glob("./**/*.md")),
    customData: `<language>zh-cn</language>`,
  })
}
