import { repairDay, repairDayLocation } from "../repair-day"
import { SITE_URL } from "../consts"

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, "")

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
    `DESCRIPTION:计算机协会免费电脑维修。记得带上充电器。预约：${SITE_URL}/repair/create-ticket`,
    `URL:${SITE_URL}/repair-day`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return new Response(lines.join("\r\n") + "\r\n", { headers: { "Content-Type": "text/calendar; charset=utf-8" } })
}
