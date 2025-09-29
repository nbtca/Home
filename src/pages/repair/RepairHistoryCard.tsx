import { Card, CardBody, Chip } from "@heroui/react"
import { EventStatusChip } from "./EventDetail"
import dayjs from "dayjs"
import type { components } from "../../types/saturday"

type PublicEvent = components["schemas"]["PublicEvent"]

interface RepairHistoryCardProps {
  event: PublicEvent
  onViewDetail: (event: PublicEvent) => void
}

export default function RepairHistoryCard({ event, onViewDetail }: RepairHistoryCardProps) {
  const handleCardClick = () => {
    onViewDetail(event)
  }

  return (
    <Card
      className="w-full cursor-pointer hover:bg-gray-50 transition shadow"
      isPressable
      onPress={handleCardClick}
    >
      <CardBody className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">#{event.eventId}</span>
            <EventStatusChip status={event.status} size="sm" />
            {event.size && <Chip size="sm">{event.size}</Chip>}
          </div>
          <span className="text-xs text-gray-400">
            {dayjs(event.gmtCreate).format("YYYY-MM-DD")}
          </span>
        </div>

        <div className="mb-2">
          <p className="text-sm font-medium line-clamp-2">{event.problem}</p>
          {event.model && (
            <p className="text-xs text-gray-500 mt-1">型号: {event.model}</p>
          )}
        </div>

        <div className="text-xs text-gray-400">
          创建于 {dayjs(event.gmtCreate).format("YYYY-MM-DD HH:mm")}
          {event.gmtModified !== event.gmtCreate && (
            <span className="ml-2">
              更新于 {dayjs(event.gmtModified).format("MM-DD HH:mm")}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
