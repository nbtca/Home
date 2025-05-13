import { defineConfig } from "astro/config"
import { SITE_URL } from "./src/consts"
import vue from "@astrojs/vue"
import tailwind from "@astrojs/tailwind"
import react from "@astrojs/react"
import { handleLocalCoverPlugin } from "./src/plugins/cover"
import { themePipeline } from "./src/plugins/theme"

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  markdown: {
    rehypePlugins: [handleLocalCoverPlugin, ...themePipeline],
    syntaxHighlight: "shiki",
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    }
  },
  integrations: [
    vue(),
    tailwind(),
    react({
      include: ["**/react/*"],
      experimentalReactChildren: true,
    }),
  ],
  vite: {
    server: {
      proxy: {
        "/active": {
          target: "https://active.nbtca.space",
          changeOrigin: true,
          rewrite: path => path.replace(/^\/active/, ""),
        },
        "/saturday": {
          target: "http://localhost:4000",
          rewrite: path => path.replace(/^\/saturday/, ""),
        },
      }
    }
  }
})
