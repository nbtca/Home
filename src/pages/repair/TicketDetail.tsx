import { useState, useEffect } from "react"
import { Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react"
import { makeLogtoClient } from "../../utils/auth"
import { saturdayClient } from "../../utils/client"
import EventDetail from "./EventDetail"
import EditRepairModal from "./EditRepairModal"
import type { UserInfoResponse } from "@logto/browser"
import type { components } from "../../types/saturday"
import { checkAuthAndRedirect } from "../../utils/repair"

type PublicEvent = components["schemas"]["PublicEvent"]

export default function TicketDetail() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [eventId, setEventId] = useState<number | null>(null)
  const [event, setEvent] = useState<PublicEvent | null>(null)

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isCancelOpen, onOpen: onCancelOpen, onClose: onCancelClose } = useDisclosure()

  useEffect(() => {
    // Get eventId from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const eventIdParam = urlParams.get("eventId")

    if (eventIdParam) {
      setEventId(parseInt(eventIdParam, 10))
    }

    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const redirectUrl = `/repair/ticket-detail${window.location.search}`
      const claims = await checkAuthAndRedirect(redirectUrl)
      if (claims) {
        setUserInfo(claims)
      }
    }
    finally {
      setLoading(false)
    }
  }

  const handleBackToHome = () => {
    window.location.href = "/repair"
  }

  const handleEdit = () => {
    if (event) {
      onEditOpen()
    }
  }

  const handleCancel = () => {
    if (event) {
      onCancelOpen()
    }
  }

  const confirmCancel = async () => {
    if (!event) return

    try {
      const logtoToken = await makeLogtoClient().getAccessToken()

      await saturdayClient.DELETE("/client/events/{EventId}", {
        params: {
          path: {
            EventId: event.eventId,
          },
        },
        headers: {
          Authorization: `Bearer ${logtoToken}`,
        },
      })

      // Navigate back to history after cancellation
      onCancelClose()
      window.location.href = "/repair/history"
    }
    catch (err) {
      console.error("Error cancelling event:", err)
    }
  }

  const handleEditSaved = () => {
    onEditClose()
    // Refresh the event data
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="container mx-auto pt-16 pb-20">
        <div className="flex flex-col items-center justify-center">
          <Spinner size="lg" />
        </div>
      </div>
    )
  }

  if (!userInfo || !eventId) {
    return (
      <div className="container mx-auto pt-16 pb-20">
        <div className="flex flex-col items-center justify-center">
          <p className="text-gray-500 mb-4">
            {!userInfo ? "请先登录以查看维修详情" : "无效的维修单ID"}
          </p>
          <Button color="primary" onPress={handleBackToHome}>
            返回首页
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto pt-6 pb-20">

      {/* Event detail content */}
      <div className="section-content">
        <EventDetail eventId={eventId}>
          {(eventData: PublicEvent) => {
            // Store the event data for actions
            if (eventData && !event) {
              setEvent(eventData)
            }

            const canModify = eventData.status !== "closed" && eventData.status !== "cancelled"

            return (
              <div className="mt-6 flex flex-col gap-4">
                {/* Client Action Buttons */}
                {canModify && (
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={handleEdit}
                    >
                      编辑
                    </Button>
                    <Button
                      color="danger"
                      variant="flat"
                      onPress={handleCancel}
                    >
                      取消预约
                    </Button>
                  </div>
                )}
              </div>
            )
          }}
        </EventDetail>

        {/* Edit Modal */}
        {event && (
          <EditRepairModal
            isOpen={isEditOpen}
            onClose={onEditClose}
            event={event}
            onSaved={handleEditSaved}
          />
        )}

        {/* Cancel Confirmation Modal */}
        <Modal isOpen={isCancelOpen} onClose={onCancelClose} size="sm">
          <ModalContent>
            <ModalHeader>确认取消维修预约</ModalHeader>
            <ModalBody>
              <p>你确定要取消这个维修预约吗？此操作无法撤销。</p>
              {event && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <p className="text-sm font-medium">#{event.eventId}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{event.problem}</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onCancelClose}>
                保留
              </Button>
              <Button color="danger" onPress={confirmCancel}>
                确认取消
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  )
}
