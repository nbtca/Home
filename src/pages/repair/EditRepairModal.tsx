import { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@heroui/react"
import { saturdayClient } from "../../utils/client"
import { makeLogtoClient } from "../../utils/auth"
import type { components } from "../../types/saturday"

type PublicEvent = components["schemas"]["PublicEvent"]
type UpdateClientEventInputBody = components["schemas"]["UpdateClientEventInputBody"]

interface EditRepairModalProps {
  isOpen: boolean
  onClose: () => void
  event: PublicEvent
  onSaved: () => void
}

export default function EditRepairModal({ isOpen, onClose, event, onSaved }: EditRepairModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateClientEventInputBody>({
    problem: "",
    model: "",
    phone: "",
    qq: "",
  })

  useEffect(() => {
    if (event) {
      setFormData({
        problem: event.problem || "",
        model: event.model || "",
        phone: event.phone || "",
        qq: event.qq || "",
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const logtoToken = await makeLogtoClient().getAccessToken()

      const { error } = await saturdayClient.PATCH("/client/events/{EventId}", {
        params: {
          path: {
            EventId: event.eventId,
          },
        },
        headers: {
          Authorization: `Bearer ${logtoToken}`,
        },
        body: formData,
      })

      if (error) {
        throw new Error("Failed to update event")
      }

      onSaved()
    }
    catch (err) {
      console.error("Error updating event:", err)
      // Could add error handling/toast here
    }
    finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader className="flex flex-col gap-1">
            编辑维修预约 #{event?.eventId}
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-4">
              <Textarea
                label="问题描述"
                placeholder="告诉我们你遇到的问题"
                isRequired
                value={formData.problem}
                onChange={e => setFormData({ ...formData, problem: e.target.value })}
              />

              <Input
                label="设备型号"
                placeholder="你的设备型号"
                value={formData.model || ""}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
              />

              <Input
                label="电话号码"
                placeholder="必填"
                isRequired
                type="tel"
                maxLength={11}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />

              <Input
                label="QQ号码"
                placeholder="你的QQ号"
                value={formData.qq || ""}
                onChange={e => setFormData({ ...formData, qq: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose} isDisabled={loading}>
              取消
            </Button>
            <Button color="primary" type="submit" isLoading={loading}>
              保存更改
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
