import { useState, useEffect } from "react"
import { Alert, Button, Spinner, Pagination } from "@heroui/react"
import { saturdayClient } from "../../utils/client"
import { makeLogtoClient } from "../../utils/auth"
import RepairHistoryCard from "./RepairHistoryCard"
import type { components } from "../../types/saturday"
import { LogtoRequestError } from "@logto/browser"

type PublicEvent = components["schemas"]["PublicEvent"]

interface UserRepairHistoryProps {
  onCreateNew: () => void
  onLogin: () => void
}

export default function UserRepairHistory({ onCreateNew, onLogin }: UserRepairHistoryProps) {
  const [events, setEvents] = useState<PublicEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  const fetchUserEvents = async (page: number = currentPage) => {
    try {
      setLoading(true)
      const logtoToken = await makeLogtoClient().getAccessToken()
      const offset = (page - 1) * itemsPerPage

      const { data, error: apiError } = await saturdayClient.GET("/client/events", {
        headers: {
          Authorization: `Bearer ${logtoToken}`,
        },
        params: {
          query: {
            limit: itemsPerPage,
            offset: offset,
            order: "desc",
          },
        },
      })

      if (apiError || !data) {
        throw new Error("Failed to fetch repair history")
      }

      setEvents(data || [])

      // Calculate total pages based on total count
      // Note: You may need to adjust this based on your API response structure
      // If your API returns total count in headers or response metadata
      const totalItems = data.length < itemsPerPage ? offset + data.length : offset + data.length + 1
      setTotalPages(Math.ceil(totalItems / itemsPerPage))
    }
    catch (err) {
      if (err instanceof LogtoRequestError) {
        onLogin()
      }
      console.error("Error fetching user events:", err)
      setError("获取维修记录失败")
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserEvents(1)
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchUserEvents(page)
  }

  const handleViewDetail = (event: PublicEvent) => {
    window.location.href = `/repair/ticket-detail?eventId=${event.eventId}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert color="danger" className="mb-4">
        {error}
        <Button size="sm" color="danger" variant="flat" onPress={() => fetchUserEvents(currentPage)}>
          重试
        </Button>
      </Alert>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">你还没有任何维修记录</p>
        <Button color="primary" onPress={onCreateNew}>
          创建第一个维修预约
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">我的维修记录</h2>
        <Button color="primary" onPress={onCreateNew}>
          新建预约
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <RepairHistoryCard
            key={event.eventId}
            event={event}
            onViewDetail={handleViewDetail}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}
    </div>
  )
}
