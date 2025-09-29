import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react"
import type { components } from "../../types/saturday"
import { saturdayClient } from "../../utils/client"
import { Textarea, Input, Chip, Skeleton } from "@heroui/react"
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
        <div className="flex flex-col gap-2 items-center mt-1 text-gray-600">
          {dayjs(props.eventLog.gmtCreate).format("YYYY-MM-DD HH:mm")}
        </div>
      </div>

    </div>
  )
}

export function EventStatusChip(props: {
  size?: "sm" | "md" | "lg"
  status: string
}) {
  const size = props.size || "md"
  switch (props.status) {
    case EventStatus.open:
      return <Chip size={size}>未开始</Chip>
    case EventStatus.accepted:
      return <Chip size={size} color="primary">维修中</Chip>
    case EventStatus.committed:
      return <Chip size={size} color="secondary">待审核</Chip>
    case EventStatus.closed:
      return <Chip size={size} color="success">已完成</Chip>
    case EventStatus.cancelled:
      return <Chip size={size}>已取消</Chip>
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
export type EventDetailRef = {
  refresh: () => Promise<PublicEvent | undefined>
  event: PublicEvent | undefined
}
const EventDetail = forwardRef<EventDetailRef, {
  eventId?: number
  onRefresh?: () => void
  action?: React.ReactNode
  children?: (event: PublicEvent) => React.ReactNode
}>((props, ref) => {
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
        return data
      }

      const refresh = async () => {
        const url = new URL(window.location.href)
        const eventId = props.eventId ?? url.searchParams.get("eventId")
        console.log("refresh eventId", eventId)
        if (eventId) {
          return await fetchAndSetEvent(eventId as unknown as number)
        }
      }

      const repairDescription = useMemo(() => {
        return event?.logs.findLast(v => v.action == "commit" || v.action == "alterCommit")?.description
      }, [event])

      // 初次加载
      useEffect(() => {
        refresh()
      }, [])

      // 暴露给父组件的方法
      useImperativeHandle(ref, () => ({
        refresh,
        event,
      }))

      return (
        event
          ? (
              <section className="box-border">
                <div className="">
                  <h2 className="text-2xl font-bold">维修详情</h2>
                  <div className="flex gap-2 items-center">
                    <span>
                      #{event.eventId}
                    </span>
                    <EventStatusChip status={event.status}></EventStatusChip>
                    {
                      event.size
                        ? <Chip>{"size:" + event.size}</Chip>
                        : <></>
                    }
                  </div>
                </div>
                <div className="my-6  flex flex-col gap-4">
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
                  {
                    repairDescription
                      ? (
                          <Textarea
                            label="维修描述"
                            readOnly
                            name="description"
                            value={repairDescription || ""}
                          />
                        )
                      : <></>
                  }
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
                <div>
                  {props.children && props.children(event)}
                </div>
              </section>
            )
          : (
              <div className="flex flex-col gap-4">
                <Skeleton className="rounded-lg mb-4">
                  <div className="h-24 rounded-lg bg-default-300" />
                </Skeleton>
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300" />
                </Skeleton>
                <Skeleton className="rounded-lg">
                  <div className="h-16 rounded-lg bg-default-300" />
                </Skeleton>
                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300" />
                </Skeleton>
              </div>
            )
      )
    })

export default EventDetail
