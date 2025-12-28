import { useState, useEffect, useRef } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Card, CardBody } from "@heroui/react"
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
    images: [],
  })
  const [uploadError, setUploadError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (event) {
      setFormData({
        problem: event.problem || "",
        model: event.model || "",
        phone: "",
        qq: "",
        images: event.images || [],
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError("")
    const newImages: string[] = []
    const logtoToken = await makeLogtoClient().getAccessToken()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`图片 ${file.name} 超过10MB大小限制`)
        continue
      }

      // Upload to server
      try {
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        const { data, error } = await saturdayClient.POST("/upload", {
          params: {
            header: {
              Authorization: `Bearer ${logtoToken}`,
            },
          },
          body: formDataUpload as unknown as { file: string },
          bodySerializer: () => formDataUpload as unknown as string,
        })

        if (error || !data) {
          throw new Error("Upload failed")
        }

        newImages.push(data.url)
      }
      catch (error) {
        console.error("Failed to upload image:", error)
        setUploadError(`图片 ${file.name} 上传失败`)
      }
    }

    setFormData({
      ...formData,
      images: [...(formData.images || []), ...newImages],
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
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

              {/* Image Upload Section */}
              <div className="flex flex-col gap-2">
                <div className="text-sm font-bold">
                  问题图片
                  <span className="text-xs font-normal text-default-400 ml-2">
                    (可选，最多5张，每张最大10MB)
                  </span>
                </div>
                {uploadError && (
                  <div className="text-xs text-danger">{uploadError}</div>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                  <Button
                    onPress={() => fileInputRef.current?.click()}
                    variant="bordered"
                    size="sm"
                    isDisabled={(formData.images?.length || 0) >= 5}
                  >
                    {(formData.images?.length || 0) >= 5 ? "已达到最大数量" : "选择图片"}
                  </Button>

                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {formData.images.map((image, index) => (
                        <Card key={index} className="relative">
                          <CardBody className="p-0">
                            <img
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <Button
                              isIconOnly
                              color="danger"
                              variant="flat"
                              size="sm"
                              className="absolute top-1 right-1"
                              onPress={() => handleRemoveImage(index)}
                            >
                              ✕
                            </Button>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
