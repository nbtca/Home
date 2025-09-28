import { CA_LOGO_URL } from "./consts"

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year + " 年 " + month + " 月 " + day + " 日"
}

export function formatDateV2(date: string) {
  // 创建一个Date对象
  const d = new Date(date)
  // 使用toLocaleString方法返回本地时间字符串
  const localTime = d.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
  // 去掉字符串中的斜杠和空格
  const formattedDate = localTime.replace(/\//g, "-").replace(/\s/g, "")
  // 返回格式化后的日期
  return formattedDate
}

export const getCoverImage = (cover: unknown) => {
  switch (typeof cover) {
    case "string":
      return cover
    case "object":
      if (cover && "url" in cover) {
        return (cover as { url: string }).url
      }
      return CA_LOGO_URL
    default:
      return CA_LOGO_URL
  }
}
