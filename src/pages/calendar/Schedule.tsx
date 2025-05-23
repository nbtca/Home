import ICAL from "ical.js"
import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { Calendar } from "@heroui/react"
import { today, getLocalTimeZone } from "@internationalized/date"

type ScheduleEvent = {
  start: Date
  end: Date
  summary: string
  description: string
  recurrenceId?: string
}

const parseCal = async (): Promise<ICAL.Component> => {
  const res = await fetch("https://ical.nbtca.space/").then(res => res.text())
  const jcalData = ICAL.parse(res)
  return new ICAL.Component(jcalData)
}

const expandEventOccurrences = (
  event: ICAL.Event,
  rangeEnd: ICAL.Time,
): ScheduleEvent[] => {
  const occurrences: ScheduleEvent[] = []
  const iterator = event.iterator()
  let next: ICAL.Time | null = null

  while ((next = iterator.next())) {
    if (next.compare(event.startDate) < 0) continue
    if (next.compare(rangeEnd) > 0) break
    const details = event.getOccurrenceDetails(next)
    occurrences.push({
      start: details.startDate.toJSDate(),
      end: details.endDate.toJSDate(),
      summary: event.summary,
      description: event.description,
      recurrenceId: event.recurrenceId,
    })
  }

  return occurrences
}

const extractScheduleEvents = (icalComp: ICAL.Component): ScheduleEvent[] => {
  const vevents = icalComp.getAllSubcomponents("vevent")
  const rangeEnd = ICAL.Time.fromDateString("2026-01-01")

  return vevents
    .flatMap<ScheduleEvent>((vevent) => {
      const event = new ICAL.Event(vevent)
      if (event.iterator().complete) {
        return [{
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          summary: event.summary,
          description: event.description,
          recurrenceId: "123",
        }]
      }
      return expandEventOccurrences(event, rangeEnd)
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime())
}

const formatTimePair = (s: Date, e: Date): string => {
  const start = dayjs(s)
  const end = dayjs(e)
  if (start.isSame(end, "day")) {
    return `${start.format("YYYY-MM-DD HH:mm")} - ${end.format("HH:mm")}`
  }
  return `${start.format("YYYY-MM-DD")} - ${end.format("YYYY-MM-DD")}`
}

export default function Schedule() {
  const [scheduledEvents, setScheduledEvents] = useState<ScheduleEvent[]>([])

  const defaultDate = today(getLocalTimeZone())
  const [focusedDate, setFocusedDate] = useState(defaultDate)

  useEffect(() => {
    parseCal().then((icalComp) => {
      setScheduledEvents(extractScheduleEvents(icalComp))
    })
  }, [])

  return (
    <section className="w-full flex flex-col ">
      <div className="section-content my-8 text-2xl font-bold">日程</div>
      <div className="section-content grid grid-cols-5">
        <div className="flex flex-col col-span-3">
          {scheduledEvents.map((event, index) => (
            <div key={index} className="p-4 m-2 border rounded-lg shadow">
              <div className="flex items-center gap-2">
                <div className="text-xl font-semibold">{event.summary}</div>
                <span>{ formatTimePair(event.start, event.end) }</span>
              </div>
              <p>{event.description}</p>
              <p>{event.recurrenceId}</p>
            </div>
          ))}
        </div>
        <div className="col-span-2">
          <Calendar
            aria-label="Date (Controlled Focused Value)"
            focusedValue={focusedDate}
            value={defaultDate}
            onFocusChange={setFocusedDate}
          />
        </div>
      </div>
    </section>
  )
}
