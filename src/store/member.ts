export interface Member {
  memberId: string
  alias: string
  avatar: Promise<typeof import("*.jpg")> | string
  profile: string
  link?: string
}

export const otherMembers: Member[] = [
  {
    memberId: undefined,
    alias: "鲁冠泽",
    profile: "Java, Web。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/cimoccn.png"),
    link: "https://cimoc.cn/"
  },
  {
    memberId: undefined,
    alias: "江蕾",
    profile: "前端。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/DoEH51Nj97Ah64a.png"),
    link: "https://www.cnblogs.com/JLay"
  },
  {
    memberId: undefined,
    alias: "黄文轩",
    profile: "网安, Linux和C/C++。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/4J9NfH1UZD3sz5I.png"),
    link: "https://www.cnblogs.com/N3ptune"
  },
  {
    memberId: undefined,
    alias: "陈学书",
    profile: "Mac, 人工智能, Web和流水账。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/VjBGkQ6c58vH4l9.png"),
    link: "https://www.cnblogs.com/Flat-White"
  },
  {
    memberId: undefined,
    alias: "王纯",
    profile: "Web。",
    avatar: import("../pages/posts/blogs/更多/assets/avatar/avatar.png"),
    link: "https://chundot.org"
  },
  {
    memberId: undefined,
    alias: "章晟玮",
    profile: "算法记录。",
    avatar: undefined,
    link: "https://bcscb.xyz/"
  },
]
