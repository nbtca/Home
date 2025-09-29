import { useState, useEffect } from "react"
import { Button, Spinner, Card, CardBody, CardFooter } from "@heroui/react"
import { makeLogtoClient } from "../../utils/auth"
import { saturdayClient } from "../../utils/client"
import RepairHistoryCard from "./RepairHistoryCard"
import EditRepairModal from "./EditRepairModal"
import type { UserInfoResponse } from "@logto/browser"
import type { components } from "../../types/saturday"
// eslint-disable-next-line @cspell/spellchecker
import hayasaka from "../_assets/hayasaka.jpg"

type PublicEvent = components["schemas"]["PublicEvent"]

export default function RepairLandingSection() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentEvents, setRecentEvents] = useState<PublicEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<PublicEvent | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    checkAuthStatusAndFetchEvents()
  }, [])

  const checkAuthStatusAndFetchEvents = async () => {
    try {
      const logtoClient = makeLogtoClient()
      const authenticated = await logtoClient.isAuthenticated()

      if (authenticated) {
        const claims = await logtoClient.getIdTokenClaims()
        setUserInfo(claims)
        await fetchRecentEvents()
      }
    }
    catch (error) {
      console.error("Error checking auth status:", error)
    }
    finally {
      setLoading(false)
    }
  }

  const fetchRecentEvents = async () => {
    try {
      const logtoToken = await makeLogtoClient().getAccessToken()
      const { data } = await saturdayClient.GET("/client/events", {
        headers: {
          Authorization: `Bearer ${logtoToken}`,
        },
        params: {
          query: {
            limit: 10,
            offset: 0,
          },
        },
      })

      if (data) {
        // Filter for unfinished events and take only the first 3
        const unfinishedEvents = (data as unknown as PublicEvent[]).slice(0, 3)
        setRecentEvents(unfinishedEvents)
      }
    }
    catch (error) {
      console.error("Error fetching recent events:", error)
    }
  }

  const handleCreateTicketClick = async () => {
    const logtoClient = makeLogtoClient()
    const createRepairPath = "/repair/create-ticket"
    const authenticated = await logtoClient.isAuthenticated()

    if (!authenticated) {
      window.location.href = `/repair/login-hint?redirectUrl=${createRepairPath}`
      return
    }
    window.location.href = createRepairPath
  }

  const handleEdit = (event: PublicEvent) => {
    setSelectedEvent(event)
    setIsEditOpen(true)
  }

  const handleCancel = async (event: PublicEvent) => {
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
      await fetchRecentEvents()
    }
    catch (error) {
      console.error("Error cancelling event:", error)
    }
  }

  const handleViewDetail = (event: PublicEvent) => {
    window.location.href = `/repair/ticket-detail?eventId=${event.eventId}`
  }

  const handleEditSaved = () => {
    fetchRecentEvents()
    setIsEditOpen(false)
    setSelectedEvent(null)
  }

  const handleViewAllHistory = () => {
    window.location.href = "/repair/history"
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

  return (
    <div className="container mx-auto pt-16 pb-20">
      {/* Main service section - always shown */}
      <div className="flex flex-col items-center justify-center">
        {/* eslint-disable-next-line @cspell/spellchecker */}
        <img src={hayasaka.src} alt="" className="h-48 md:h-auto md:w-1/2 object-cover" />
        <div className="mt-12 text-lg lg:text-2xl font-bold">我们提供免费的电脑维修服务</div>
        <div className="mt-4 text-gray-500 text-center lg:text-lg">
          <div>
            从<strong>清理磁盘</strong>到<strong>加装硬件</strong>再到<strong>环境配置</strong>，
          </div>
          <div>
            我们都帮你搞定。
          </div>
        </div>

        <div className="mt-6">
          <Button
            className="bg-blue-500 text-white"
            radius="full"
            onPress={handleCreateTicketClick}
          >
            预约维修
          </Button>
        </div>
      </div>

      {/* Recent events section - only for authenticated users */}
      {userInfo && (
        <div className="mt-16 section-content">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">最近的维修</h2>
            <Button
              color="primary"
              variant="flat"
              size="sm"
              onPress={handleViewAllHistory}
            >
              查看全部历史
            </Button>
          </div>

          {recentEvents.length > 0
            ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentEvents.map(event => (
                    <RepairHistoryCard
                      key={event.eventId}
                      event={event}
                      onEdit={handleEdit}
                      onCancel={handleCancel}
                      onViewDetail={handleViewDetail}
                    />
                  ))}
                </div>
              )
            : (
                <Card className="w-full">
                  <CardBody className="text-center py-8">
                    <p className="text-gray-500">暂无进行中的维修预约</p>
                  </CardBody>
                  <CardFooter className="justify-center">
                    <Button color="primary" onPress={handleCreateTicketClick}>
                      创建新预约
                    </Button>
                  </CardFooter>
                </Card>
              )}
        </div>
      )}

      {/* Login suggestion for unauthenticated users */}
      {/* {!userInfo && (
        <div className="mt-16 flex justify-center">
          <Alert
            className="items-center max-w-md"
            endContent={(
              <Button color="primary" size="sm" variant="flat" onPress={handleLogin}>
                登入
              </Button>
            )}
          >
            登入账号来查看和管理你的维修记录
          </Alert>
        </div>
      )} */}

      {/* Edit Modal */}
      {selectedEvent && (
        <EditRepairModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          event={selectedEvent}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  )
}
