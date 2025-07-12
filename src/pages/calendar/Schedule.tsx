import ICAL from "ical.js"
import dayjs from "dayjs"
import { useEffect, useMemo, useRef, useState } from "react"
import { Alert, Button, Calendar, Link, Spinner, Select, SelectItem } from "@heroui/react"
import { today, getLocalTimeZone } from "@internationalized/date"

import "dayjs/locale/zh-cn"

dayjs.locale("zh-cn")

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

const extractScheduleEventsInRange = (
  icalComp: ICAL.Component,
  rangeStart: ICAL.Time,
  rangeEnd: ICAL.Time,
): ScheduleEvent[] => {
  const vevents = icalComp.getAllSubcomponents("vevent")
  return vevents
    .flatMap<ScheduleEvent>((vevent) => {
      const event = new ICAL.Event(vevent)
      if (!event.isRecurring()) {
        if (event.startDate.compare(rangeEnd) > 0 || event.endDate.compare(rangeStart) < 0) return []
        return [{
          start: event.startDate.toJSDate(),
          end: event.endDate.toJSDate(),
          summary: event.summary,
          description: event.description,
          recurrenceId: undefined,
        }]
      }
      return expandEventOccurrences(event, rangeStart, rangeEnd)
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime())
}

const expandEventOccurrences = (
  event: ICAL.Event,
  rangeStart: ICAL.Time,
  rangeEnd: ICAL.Time,
): ScheduleEvent[] => {
  const occurrences: ScheduleEvent[] = []
  const iterator = event.iterator()
  let next: ICAL.Time | null = null
  while ((next = iterator.next())) {
    if (!next) break
    if (next.compare(rangeEnd) > 0) break
    if (next.compare(rangeStart) < 0) continue
    const details = event.getOccurrenceDetails(next)
    occurrences.push({
      start: details.startDate.toJSDate(),
      end: details.endDate.toJSDate(),
      summary: event.summary,
      description: event.description,
      recurrenceId: next.toString(),
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
          recurrenceId: event.uid || event.startDate.toString(),

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
    return `${start.format("HH:mm")} - ${end.format("HH:mm")}`
  }
  return `${start.format("MM.DD")} - ${end.format("MM.DD")}`
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

  useEffect(() => {
    setLoading(true)
    parseCal().then((icalComp) => {
      setScheduledEvents(extractScheduleEvents(icalComp))
      setLoading(false)
    })
  }, [])

  const groupedEvents = useMemo(() => {
    const grouped = new Map<string, ScheduleEvent[]>()
    scheduledEvents.forEach((event) => {
      const dateKey = dayjs(event.start).format("YYYY-MM-DD")
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(event)
    })

    // 可选：对每个日期内部事件排序（按开始时间升序）
    for (const events of grouped.values()) {
      events.sort((a, b) => a.start.getTime() - b.start.getTime())
    }

    // 可选：按照日期从早到晚排序
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
                  {events.map((event, index) => (
                    <div key={index} className="p-4 mb-2 border rounded-lg ">
                      <div className="flex items-center gap-1">
                        <div className="text-lg sm:text-xl font-semibold">{event.summary}</div>
                        {event.recurrenceId && (
                        // <span className="text-sm text-blue-500 border border-blue-500 px-1 rounded">重复</span>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                          </svg>

                        )}
                      </div>
                      <span className="text-sm text-gray-600">{formatTimePair(event.start, event.end)}</span>
                      {
                        event.description && (
                          <p className="mt-2">{event.description}</p>
                        )
                      }
                    </div>
                  ))}
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
