import { repairDay, repairDayLocation } from "../repair-day"
import { SITE_URL } from "../consts"

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "")

// RFC 5545 folds lines at 75 octets without splitting a multi-byte character.
const fold = (line: string) => {
  const out: string[] = []
  let current = ""
  for (const char of line) {
    if (new TextEncoder().encode(current + char).length > (out.length ? 74 : 75)) {
      out.push(current)
      current = ""
    }
    current += char
  }
  return [...out, current].join("\r\n ")
}

export const GET = () => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NBTCA//Repair Day//ZH",
    "BEGIN:VEVENT",
    `UID:repair-day-${stamp(repairDay.start)}@nbtca.space`,
    `DTSTAMP:${stamp(repairDay.start)}`,
    `DTSTART:${stamp(repairDay.start)}`,
    `DTEND:${stamp(repairDay.end)}`,
    `SUMMARY:${repairDay.title}`,
    `LOCATION:${repairDayLocation}`,
    `DESCRIPTION:计算机协会免费电脑维修。记得带上充电器。预约维修：${SITE_URL}/repair/create-ticket\\n领取入场券：${repairDay.pass}`,
    `URL:${SITE_URL}/repair-day`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return new Response(lines.map(fold).join("\r\n") + "\r\n", { headers: { "Content-Type": "text/calendar; charset=utf-8" } })
}
