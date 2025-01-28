import { type RehypePlugin } from "@astrojs/markdown-remark"
import type { RehypePlugins } from "astro"
import { visit } from "unist-util-visit"
import md5 from "md5"

export const addSeparator: RehypePlugin = () =>
  (tree) => {
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
              children: [],
            },
          ],
        })
        index++
      }
    }
  }
const image: RehypePlugin = () => (tree) => {
  visit(tree, "element", (node) => {
    if (node.tagName === "p" && node.children[0].tagName === "img") {
      node.tagName = "figure"
      const img = node.children[0]
      const sign = md5(img.properties.src)
      const data = img.properties.alt.split("|")
      const alt = data[0]
      let size = "big"
      if (data.length > 1) {
        size = data[1]
      }
      const classes = ["image component image-full-bleed body-copy-wide nr-scroll-animation nr-scroll-animation--on"]
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
}

const code: RehypePlugin = () => (tree) => {
  tree.children.forEach((node) => {
    if (node.type === "raw") {
      node.value = `<div class="page-body code component"><div class="component-content code"> ${node.value} </div></div>`
      // node.value = node.value.replace(/astro-code/g, 'astro-code')
    }
  })
}

const body: RehypePlugin = () => (tree) => {
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
        nodes.forEach((node) => {
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
}

export const themePipeline: RehypePlugins = [
  addSeparator,
  image,
  code,
  body,
]
