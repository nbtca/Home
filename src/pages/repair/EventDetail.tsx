import { useEffect, useState } from "react"
import type { components } from "../../types/saturday"
import { saturdayClient } from "../../utils/client"
import { Textarea, Input, Chip } from "@heroui/react"
import type { PublicMember } from "../../store/member"
import dayjs from "dayjs"
import { EventStatus, UserEventAction } from "../../types/event"

type PublicEvent = components["schemas"]["PublicEvent"]
type EventLog = components["schemas"]["EventLog"]

function EventLogItem(props: {
  eventLog: EventLog
  actor?: PublicMember
}) {
  return (
    <div className="py-1 flex items-center">
      {/* <div className="mr-4 h-10 bg-red-400 flex flex-col items-center gap-2">
      </div> */}
      <div>
        <div className="flex items-center">
          <div className="mr-4">
            {
              UserEventAction.find(v => v.action === props.eventLog.action)?.text || props.eventLog.action
            }
          </div>
          <div className="flex items-center">
            {
              props.actor?.avatar
                ? <img src={props.actor?.avatar} alt="actor avatar" className="w-6 aspect-square rounded-full" />
                : <></>
            }
            <span className="text-gray-600 ml-2">
              {
                props.actor ? props.actor.alias : ""
              }
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center mt-1 text-gray-600">
          {dayjs(props.eventLog.gmtCreate).format("YYYY-MM-DD HH:mm")}
        </div>
      </div>

    </div>
  )
}

function EventStatusChip(props: {
  status: string
}) {
  switch (props.status) {
    case EventStatus.open:
      return <Chip>未开始</Chip>
    case EventStatus.accepted:
      return <Chip>维修中</Chip>
    case EventStatus.committed:
      return <Chip color="primary">维修中</Chip>
    case EventStatus.closed:
      return <Chip color="success">已完成</Chip>
    case EventStatus.cancelled:
      return <Chip>已取消</Chip>
  }
}

const filterEventLog = (event: PublicEvent) => {
  const eventLogs = event.logs
  const filteredLogs: (EventLog & { actor?: PublicMember })[] = []
  // find the first log that action is "create"
  const createLog = eventLogs.find(log => log.action === "create")
  filteredLogs.push(createLog)
  // find the first log that action is "cancel"
  const cancelLog = eventLogs.find(log => log.action === "cancel")
  if (cancelLog) {
    filteredLogs.push(cancelLog)
    return filteredLogs
  }
  // find the last log that action is "accept"
  const acceptLog = eventLogs.findLast(log => log.action === "accept")
  if (acceptLog) {
    filteredLogs.push({
      ...acceptLog,
      actor: event.member,
    })
  }
  // find the last log that action is "close"
  const closeLog = eventLogs.findLast(log => log.action === "close")
  if (closeLog) {
    filteredLogs.push({
      ...closeLog,
      actor: event.closedBy,
    })
  }
  return filteredLogs
}

export default function EventDetail() {
  const [event, setEvent] = useState<PublicEvent | undefined>()
  const fetchAndSetEvent = async (eventId: number) => {
    const { data } = await saturdayClient.GET("/events/{EventId}", {
      params: {
        path: {
          EventId: eventId,
        },
      },
    })
    setEvent(data)
  }
  useEffect(() => {
    // get the eventId from the url
    const url = new URL(window.location.href)
    const eventId = url.searchParams.get("eventId")
    if (!eventId) {
      return
    }
    fetchAndSetEvent(eventId as unknown as number)
  }, [])

  return (
    event
      ? (
          <section className="box-border mb-24">
            <div className="section-content mt-8">
              <h2 className="text-2xl font-bold">维修详情</h2>
              <div className="flex gap-2 items-center">
                <span>
                  #{event.eventId}
                </span>
                <EventStatusChip status={event.status}></EventStatusChip>
              </div>
            </div>
            <div className="section-content my-8 flex flex-col gap-4">
              <Textarea
                label="问题描述"
                readOnly
                name="description"
                value={event.problem || ""}
              />
              <Input
                label="型号"
                type="text"
                value={event.model || ""}
                readOnly
              >
              </Input>
              <div className="bg-gray-100 rounded-xl text-sm px-3 py-2 mt-2 ">
                <div className="text-xs font-semibold text-gray-600 mb-1">
                  维修记录
                </div>
                {
                  filterEventLog(event).map((v, index) => {
                    return (
                      <EventLogItem key={index} actor={v.actor} eventLog={v} />
                    )
                  })
                }
              </div>
            </div>
          </section>
        )
      : <div></div>
  )
}
