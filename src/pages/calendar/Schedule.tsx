import ICAL from "ical.js"
import dayjs from "dayjs"
import { useEffect, useMemo, useRef, useState } from "react"
import { Alert, Button, Calendar, Link, Spinner, Select, SelectItem } from "@heroui/react"
import { today, getLocalTimeZone } from "@internationalized/date"

import "dayjs/locale/zh-cn"
import { CA_PUBLIC_ICAL_URL } from "../../consts"

dayjs.locale("zh-cn")

type ScheduleEvent = {
  start: Date
  end: Date
  summary: string
  description: string
  location?: string
  url?: string
  recurrenceId?: string
}

type EventTextSegment = {
  type: "text"
  value: string
} | {
  type: "link"
  value: string
  href: string
}

const URL_MATCHER = /\b(?:https?:\/\/|www\.)[^\s<>"']+/gi
const TRAILING_URL_PUNCTUATION = /[),.:;!?]+$/

const parseCal = async (): Promise<ICAL.Component> => {
  const res = await fetch(CA_PUBLIC_ICAL_URL).then(res => res.text())
  const jcalData = ICAL.parse(res)
  return new ICAL.Component(jcalData)
}

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed || undefined
  }

  if (value && typeof value === "object" && "toString" in value && typeof value.toString === "function") {
    const stringified = value.toString().trim()
    return stringified || undefined
  }

  return undefined
}

const extractScheduleEventsInRange = (
  icalComp: ICAL.Component,
  rangeStart: ICAL.Time,
  rangeEnd: ICAL.Time,
): ScheduleEvent[] => {
  const vevents = icalComp.getAllSubcomponents("vevent")

  // First, collect all exception events (events with RECURRENCE-ID)
  const exceptions = new Map<string, Set<string>>() // uid -> set of recurrence-id strings
  const exceptionEvents: ScheduleEvent[] = []

  vevents.forEach((vevent) => {
    const recurrenceId = vevent.getFirstPropertyValue("recurrence-id")
    if (recurrenceId) {
      const uid = vevent.getFirstPropertyValue("uid")
      const event = new ICAL.Event(vevent)
      const location = toOptionalString(vevent.getFirstPropertyValue("location"))
      const url = toOptionalString(vevent.getFirstPropertyValue("url"))

      // Check if exception is in range
      if (event.startDate.compare(rangeEnd) <= 0 && event.endDate.compare(rangeStart) >= 0) {
        exceptionEvents.push({
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          summary: event.summary,
          description: event.description,
          location,
          url,
          recurrenceId: recurrenceId.toString(),
        })
      }

      // Track exception for filtering recurring events
      if (!exceptions.has(uid)) {
        exceptions.set(uid, new Set())
      }
      exceptions.get(uid)!.add(recurrenceId.toString())
    }
  })

  // Process regular and recurring events
  const regularEvents = vevents
    .filter(vevent => !vevent.getFirstPropertyValue("recurrence-id"))
    .flatMap<ScheduleEvent>((vevent) => {
      const event = new ICAL.Event(vevent)
      const location = toOptionalString(vevent.getFirstPropertyValue("location"))
      const url = toOptionalString(vevent.getFirstPropertyValue("url"))
      if (!event.isRecurring()) {
        if (event.startDate.compare(rangeEnd) > 0 || event.endDate.compare(rangeStart) < 0) return []
        return [{
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          summary: event.summary,
          description: event.description,
          location,
          url,
          recurrenceId: undefined,
        }]
      }
      const eventExceptions = exceptions.get(event.uid) || new Set()
      return expandEventOccurrences(event, rangeStart, rangeEnd, eventExceptions, location, url)
    })

  return [...regularEvents, ...exceptionEvents]
    .sort((a, b) => b.start.getTime() - a.start.getTime())
}

const expandEventOccurrences = (
  event: ICAL.Event,
  rangeStart: ICAL.Time,
  rangeEnd: ICAL.Time,
  exceptions?: Set<string>,
  location?: string,
  url?: string,
): ScheduleEvent[] => {
  const occurrences: ScheduleEvent[] = []
  const iterator = event.iterator()
  let next: ICAL.Time | null = null
  while ((next = iterator.next())) {
    if (!next) break
    if (next.compare(rangeEnd) > 0) break
    if (next.compare(rangeStart) < 0) continue

    // Skip this occurrence if it has an exception
    if (exceptions && exceptions.has(next.toString())) continue

    const details = event.getOccurrenceDetails(next)
    occurrences.push({
      start: details.startDate.toJSDate(),
      end: details.endDate.toJSDate(),
      summary: event.summary,
      description: event.description,
      location,
      url,
      recurrenceId: next.toString(),
    })
  }
  return occurrences
}

const formatTimePair = (s: Date, e: Date): string => {
  const start = dayjs(s)
  const end = dayjs(e)
  if (start.isSame(end, "day")) {
    return `${start.format("HH:mm")} - ${end.format("HH:mm")}`
  }
  return `${start.format("MM.DD")} - ${end.format("MM.DD")}`
}

const normalizeUrl = (value: string): string => {
  return value.startsWith("www.") ? `https://${value}` : value
}

const toEventTextSegments = (value: string): EventTextSegment[] => {
  const segments: EventTextSegment[] = []
  let index = 0
  URL_MATCHER.lastIndex = 0

  let match: RegExpExecArray | null = null
  while ((match = URL_MATCHER.exec(value)) !== null) {
    const raw = match[0]
    const linkText = raw.replace(TRAILING_URL_PUNCTUATION, "")
    const trailingText = raw.slice(linkText.length)

    if (match.index > index) {
      segments.push({ type: "text", value: value.slice(index, match.index) })
    }

    if (linkText) {
      segments.push({
        type: "link",
        value: linkText,
        href: normalizeUrl(linkText),
      })
    }

    if (trailingText) {
      segments.push({ type: "text", value: trailingText })
    }

    index = match.index + raw.length
  }

  if (index < value.length) {
    segments.push({ type: "text", value: value.slice(index) })
  }

  return segments.length > 0 ? segments : [{ type: "text", value }]
}

const renderTextWithLinks = (value: string, keyPrefix: string) => {
  return toEventTextSegments(value).map((segment, index) => {
    const key = `${keyPrefix}-${index}`
    if (segment.type === "link") {
      return (
        <a
          key={key}
          href={segment.href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-blue-600 underline decoration-blue-500 underline-offset-2 hover:text-blue-700"
        >
          {segment.value}
        </a>
      )
    }

    return <span key={key}>{segment.value}</span>
  })
}

export default function Schedule() {
  const [scheduledEvents, setScheduledEvents] = useState<ScheduleEvent[]>([])

  const defaultDate = today(getLocalTimeZone())
  const [focusedDate, setFocusedDate] = useState(defaultDate)
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const calendarRef = useRef<ICAL.Component | null>(null)
  const [loading, setLoading] = useState(true)

  const currentYear = focusedDate.year
  const currentMonth = focusedDate.month

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  useEffect(() => {
    const rangeStart = ICAL.Time.fromJSDate(dayjs(focusedDate.toDate(getLocalTimeZone())).startOf("month").toDate())
    const rangeEnd = ICAL.Time.fromJSDate(dayjs(focusedDate.toDate(getLocalTimeZone())).endOf("month").toDate())
    if (!calendarRef.current) {
      setLoading(true)
      parseCal().then((icalComp) => {
        calendarRef.current = icalComp
        const events = extractScheduleEventsInRange(
          icalComp,
          rangeStart,
          rangeEnd,
        )
        setScheduledEvents(events)
        setLoading(false)
      })
    }
    else {
      const events = extractScheduleEventsInRange(
        calendarRef.current,
        rangeStart,
        rangeEnd,
      )
      setScheduledEvents(events)
    }
  }, [focusedDate])

  const groupedEvents = useMemo(() => {
    const grouped = new Map<string, ScheduleEvent[]>()
    scheduledEvents.forEach((event) => {
      const dateKey = dayjs(event.start).format("YYYY-MM-DD")
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(event)
    })

    // Optional: sort events for each date by start time.
    for (const events of grouped.values()) {
      events.sort((a, b) => a.start.getTime() - b.start.getTime())
    }

    // Optional: sort dates from earliest to latest.
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [scheduledEvents])

  const isUserChangeRef = useRef(false)

  useEffect(() => {
    if (!isUserChangeRef.current) return
    isUserChangeRef.current = false

    const dateKey = dayjs(focusedDate.toDate(getLocalTimeZone())).format("YYYY-MM-DD")
    const target = dateRefs.current[dateKey]
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    else {
      // to nearest date if not found
      const dates = Object.keys(dateRefs.current).map(d => dayjs(d))
      const closestDate = dates.reduce((prev, curr) => {
        return Math.abs(curr.diff(focusedDate.toDate(getLocalTimeZone()), "day")) < Math.abs(prev.diff(focusedDate.toDate(getLocalTimeZone()), "day")) ? curr : prev
      }, dates[0])
      const closestKey = closestDate.format("YYYY-MM-DD")
      const closestTarget = dateRefs.current[closestKey]
      if (closestTarget) {
        closestTarget.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [focusedDate, groupedEvents])

  return (
    <div className="box-border flex justify-center">
      <section className="max-w-[1024px] px-[22px] mb-24 flex flex-col w-full">
        <div className="my-8 text-2xl font-bold">日程</div>

        {/* Mobile Date Selector */}
        <div className="sm:hidden sticky top-0 bg-white z-10 py-4 -mx-[22px] px-[22px] border-b border-gray-200 mb-4">
          <div className="flex gap-4">
            <Select
              placeholder="选择年份"
              selectedKeys={[currentYear.toString()]}
              defaultSelectedKeys={[currentYear.toString()]}
              onSelectionChange={(keys) => {
                const year = parseInt(Array.from(keys)[0] as string)
                setFocusedDate(focusedDate.set({ year }))
              }}
              className="flex-1"
              size="sm"
              aria-label="选择年份"
              renderValue={(items) => {
                return items.map(item => `${item.key}年`)
              }}
            >
              {years.map(year => (
                <SelectItem key={year.toString()} textValue={year.toString()}>
                  {year}年
                </SelectItem>
              ))}
            </Select>
            <Select
              placeholder="选择月份"
              selectedKeys={[currentMonth.toString()]}
              defaultSelectedKeys={[currentMonth.toString()]}
              onSelectionChange={(keys) => {
                const month = parseInt(Array.from(keys)[0] as string)
                setFocusedDate(focusedDate.set({ month }))
              }}
              className="flex-1"
              size="sm"
              aria-label="选择月份"
              renderValue={(items) => {
                return items.map(item => `${item.key}月`)
              }}
            >
              {months.map(month => (
                <SelectItem key={month.toString()} textValue={month.toString()}>
                  {month}月
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>
        <Alert
          title="你可以在日历 App 中订阅我们的日程"
          className="my-4 items-center"
          endContent={(
            <Button
              color="default"
              showAnchorIcon
              size="sm"
              as={Link}
              variant="flat"
              onPress={e => console.log(e)}
              href="webcal://ical.nbtca.space"
              target="_blank"
            >
              订阅
            </Button>
          )}
        />
        <div className="flex flex-col sm:flex-row gap-8 pt-4">
          <div className="flex flex-col grow">
            <div className="text-2xl font-bold w-full">
              {
                dayjs(focusedDate.toDate()).format("MMMM YYYY")
              }
            </div>
            <div className="h-[0.5px] bg-gray-300 my-4" />
            {loading && (
              <div className="text-gray-500 h-[30vh] flex items-center justify-center w-full">
                <Spinner label="加载中..."></Spinner>
              </div>
            )}
            {groupedEvents.length === 0 && !loading && (
              <div className="text-gray-500">本月暂无日程</div>
            )}
            {
              groupedEvents.map(([date, events]) => (
                <div
                  key={date}
                  ref={el => dateRefs.current[date] = el}
                  className="mb-6"
                >
                  <div className="text-lg mb-2">
                    <span className="text-lg mr-1"> { dayjs(date).format("MM.DD") } </span>
                    <span className="text-base"> { dayjs(date).format("ddd") } </span>
                  </div>
                  {events.map((event, index) => {
                    const shouldRenderEventUrl = Boolean(
                      event.url
                      && !event.description.includes(event.url)
                      && !event.location?.includes(event.url),
                    )

                    return (
                      <div key={index} className="p-4 mb-2 border rounded-lg ">
                        <div className="flex items-center gap-1">
                          <div className="text-lg sm:text-xl font-semibold">{event.summary}</div>
                          {event.recurrenceId && (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 text-gray-500">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{formatTimePair(event.start, event.end)}</span>
                        {
                          event.location && (
                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                              {renderTextWithLinks(event.location, `${date}-${index}-location`)}
                            </p>
                          )
                        }
                        {
                          shouldRenderEventUrl && (
                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                              {renderTextWithLinks(event.url!, `${date}-${index}-event-url`)}
                            </p>
                          )
                        }
                        {
                          event.description && (
                            <p className="mt-2 whitespace-pre-wrap">
                              {renderTextWithLinks(event.description, `${date}-${index}-description`)}
                            </p>
                          )
                        }
                      </div>
                    )
                  })}
                </div>
              ))
            }
          </div>
          <div className="flex-shrink-0 hidden sm:block">
            <div className="sticky top-6">
              <Calendar
                aria-label="Date (Controlled Focused Value)"
                focusedValue={focusedDate}
                value={defaultDate}
                onFocusChange={(v) => {
                  isUserChangeRef.current = true
                  setFocusedDate(v)
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
