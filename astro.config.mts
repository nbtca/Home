// @ts-check

import { defineConfig } from "astro/config"
import { SITE_URL } from "./src/consts"
import vue from "@astrojs/vue"
import { visit } from "unist-util-visit"
import tailwind from "@astrojs/tailwind"
import react from "@astrojs/react"
import md5 from "md5"
import { type RehypePlugin } from "@astrojs/markdown-remark"
import path from "path"
import { convertImageToBase64URL } from "./src/utils/image"

function pipeline() {
  return [
    () => tree => {
      visit(tree, "element", (node, index) => {
        if (node.tagName === "p" && node.children[0].tagName === "img") {
          node.tagName = "figure"
          let img = node.children[0]
          let sign = md5(img.properties.src)
          let data = img.properties.alt.split("|")
          let alt = data[0]
          let size = "big"
          if (data.length > 1) {
            size = data[1]
          }
          let classes = ["image component image-full-bleed body-copy-wide nr-scroll-animation nr-scroll-animation--on"]
          classes.push(`image-${size}`)
          node.properties.className = classes
          node.children = [
            {
              type: "element",
              tagName: "div",
              properties: {
                className: ["component-content"],
              },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["image-share-sheet"],
                  },
                  children: [
                    {
                      type: "element",
                      tagName: "div",
                      properties: {
                        className: [`image image-loaded image-asset image-${sign}`],
                        id: `lht${sign}`,
                      },
                      children: [
                        {
                          type: "element",
                          tagName: "picture",
                          properties: {
                            className: ["picture"],
                          },
                          children: [
                            {
                              type: "element",
                              tagName: "img",
                              properties: {
                                src: img.properties.src,
                                alt: alt,
                                className: ["picture-image"],
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["image-description"],
                  },
                  children: [
                    {
                      type: "element",
                      tagName: "div",
                      properties: {
                        className: ["image-caption"],
                      },
                      children: [
                        {
                          type: "text",
                          value: alt,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ]
        }
      })
    },
    () => tree => {
      tree.children.forEach(node => {
        if (node.type === "raw") {
          node.value = `<div class="page-body code component"><div class="component-content code"> ${node.value} </div></div>`
          // node.value = node.value.replace(/astro-code/g, 'astro-code')
        }
      })
    },
    () => tree => {
      for (let i = 0; i < tree.children.length; i++) {
        const node = tree.children[i]
        if (node.type === "element" && ["p", "h1", "h2", "h3", "h4", "h5", "h6", "table"].includes(node.tagName)) {
          let next = tree.children[i + 1]
          const nodes = [node]
          while (next && !["figure"].includes(next.tagName) && next.type != "raw") {
            nodes.push(next)
            next = tree.children[tree.children.indexOf(next) + 1]
          }
          if (nodes.length > 1) {
            // rename label
            nodes.forEach(node => {
              if (node.tagName === "p") {
                node.properties.className = ["page-body-copy"]
                node.tagName = "div"
              }
              if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
                node.properties.className = ["page-body-header"]
              }
            })
            tree.children.splice(i, nodes.length, {
              type: "element",
              tagName: "div",
              properties: {
                className: ["page-body  text component"],
              },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: {
                    className: ["component-content"],
                  },
                  children: nodes,
                },
              ],
            })
          }
        }
      }
    },
    () => tree => {
      const len = tree.children.length
      for (let index = 0; index < len; index++) {
        const node = tree.children[index]
        if (node.type === "element" && node.tagName === "figure") {
          tree.children.splice(index, 0, {
            type: "element",
            tagName: "div",
            properties: {
              className: ["tertiary-nav component"],
            },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["component-content"],
                },
              },
            ],
          })
          index++
        }
      }
    },
  ]
}

const handleLocalCoverPlugin: RehypePlugin = () => {
  return async (tree, file) => {
    const filePath = file.history[0]
    type AstroData = {
      frontmatter: {
        cover:
          | {
              url: string
            }
          | string
          | undefined
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
    const url = path.resolve(path.dirname(filePath), coverUrl)
    const dataURL = await convertImageToBase64URL(url)
    if (typeof astroData.frontmatter.cover === "string") {
      astroData.frontmatter.cover = dataURL
    } else {
      astroData.frontmatter.cover.url = dataURL
    }
  }
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  markdown: {
    rehypePlugins: [handleLocalCoverPlugin, ...pipeline()],
    syntaxHighlight: "prism",
  },
  integrations: [
    vue(),
    tailwind(),
    react({
      include: ["**/react/*"],
      experimentalReactChildren: true,
    }),
  ],
})
