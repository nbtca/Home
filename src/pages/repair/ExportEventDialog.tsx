import { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  DateRangePicker,
} from "@heroui/react"
import { parseDate } from "@internationalized/date"
import { saturdayApiBaseUrl } from "../../utils/client"
import { makeLogtoClient } from "../../utils/auth"
import dayjs from "dayjs"

export function ExportExcelModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: parseDate(dayjs().subtract(1, "month").format("YYYY-MM-DD")),
    end: parseDate(dayjs().format("YYYY-MM-DD")),
  })
  const [loading, setLoading] = useState(false)

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  const downloadExcel = async () => {
    if (!dateRange.start || !dateRange.end) return

    setLoading(true)
    try {
      const start = dateRange.start.toString() // Format: 'YYYY-MM-DD'
      const end = dateRange.end.toString()
      const url = `${saturdayApiBaseUrl}/events/xlsx?start_time=${start}&end_time=${end}`

      const token = await makeLogtoClient().getAccessToken()
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Download failed")

      // Extract filename from Content-Disposition header
      const disposition = response.headers.get("Content-Disposition")
      let filename = "export.xlsx" // Default filename
      if (disposition && disposition.includes("filename=")) {
        const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
        if (filenameMatch != null && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "")
        }
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl) // Clean up
    }
    catch (error) {
      alert("Failed to download Excel file: " + error.message)
    }
    finally {
      setLoading(false)
      closeModal()
    }
  }

  return (
    <>
      <Button onPress={openModal} color="primary">
        导出为Excel
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <ModalContent>
          <ModalHeader>导出为Excel</ModalHeader>
          <ModalBody>
            <DateRangePicker
              label="选择日期范围"
              value={dateRange}
              onChange={setDateRange}
              granularity="day"
              visibleMonths={2}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeModal}>
              取消
            </Button>
            <Button
              color="primary"
              onClick={downloadExcel}
              isLoading={loading}
              disabled={loading}
            >
              {loading ? "导出中..." : "导出"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
