export const repairDay = {
  title: "理工维修日",
  start: "2026-11-28T09:00:00+08:00",
  end: "2026-11-28T17:00:00+08:00",
  location: "NB122",
  pass: "https://card.nbtca.space/e/repair-day-2026-11-28",
}

export const repairDayLocation = repairDay.location || "地点待公布"

export const repairDayServices = [
  { name: "清灰换硅脂", detail: "清掉风扇和散热片里的积灰，换上新硅脂。适合风扇吵、机身烫的电脑。" },
  { name: "系统重装", detail: "系统崩溃、中毒或者卡到用不下去，可以重装一个干净的 Windows。" },
  { name: "C 盘清理", detail: "查清 C 盘被什么占满，清掉缓存，把大文件夹挪到别的盘。" },
  { name: "软件卸载", detail: "卸掉流氓软件和残留文件，关掉不需要的开机自启。" },
  { name: "性能调优", detail: "检查电源模式、驱动和后台程序，找出电脑变慢的原因。" },
  { name: "使用答疑", detail: "选购、升级和日常使用上的问题，都可以当面问。" },
]

const pill = "inline-block rounded-full font-normal tracking-normal hover:no-underline transition-colors text-[14px] leading-[19px] px-[15px] py-[8px] sm:text-[17px] sm:leading-[20px] sm:px-[21px] sm:py-[11px]"
export const pillLight = `${pill} bg-[#f5f5f7] text-black hover:bg-white`
export const pillOutline = `${pill} border border-current text-[#f5f5f7] hover:bg-white/10`
export const pillBlue = `${pill} bg-[#0071e3] text-white hover:bg-[#0077ed]`

export const isRepairDayOver = (now = Date.now()) => now >= Date.parse(repairDay.end)

const shanghai = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", ...options })

export const repairDayDate = (() => {
  const start = new Date(repairDay.start)
  const end = new Date(repairDay.end)
  const md = shanghai({ month: "numeric", day: "numeric" }).formatToParts(start)
  const part = (type: string) => md.find(p => p.type === type)!.value
  const time = shanghai({ hour: "numeric", minute: "2-digit", hourCycle: "h23" })
  return {
    short: `${part("month")}.${part("day")}`,
    long: `${part("month")} 月 ${part("day")} 日`,
    weekday: shanghai({ weekday: "short" }).format(start),
    startTime: time.format(start),
    time: `${time.format(start)} – ${time.format(end)}`,
  }
})()
