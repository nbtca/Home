import type { components } from "../types/saturday"

export type PublicMember = components["schemas"]["PublicMember"]

export const otherMembers: (
  Partial<Omit<PublicMember, "avatar">>
  & {
    year?: number
    avatar: Promise<typeof import("*.jpg")>
    link: string
  })[] = [
  {
    alias: "cimoc",
    profile: "Java, Web。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/cimoccn.png"),
    link: "https://cimoc.cn/",
  },
  {
    alias: "J1ay",
    profile: "前端。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/DoEH51Nj97Ah64a.png"),
    link: "https://www.cnblogs.com/JLay",
  },
  {
    alias: "N3ptune",
    profile: "网安, Linux和C/C++。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/4J9NfH1UZD3sz5I.png"),
    link: "https://www.cnblogs.com/N3ptune",
  },
  {
    alias: "双份浓缩馥芮白",
    profile: "Mac, 人工智能, Web和流水账。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/44250c1b6e2f243ff60949efe9269348.png"),
    link: undefined,
  },
  {
    alias: "Chun.",
    profile: "Web。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/avatar.png"),
    link: undefined, // "https://chundot.org",
  },
  {
    alias: "bcscb",
    profile: "算法记录。",
    avatar: undefined,
    link: undefined, // "https://bcscb.xyz/",
  },
]
// export const memberWithLink: Member[] = [
// https://zzh0u.github.io/
// ]
