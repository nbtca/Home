import { useEffect, useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
  Spinner,
  Button,
} from "@heroui/react"
import { saturdayClient } from "../../utils/client"
import type { components } from "../../types/saturday"

type NotificationPreferenceItem = components["schemas"]["NotificationPreferenceItem"]
type Item = components["schemas"]["Item"]

interface NotificationPreferencesProps {
  token: string
}

export default function NotificationPreferences({ token }: NotificationPreferencesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferenceItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  const openModal = () => {
    setIsOpen(true)
    loadPreferences()
  }

  const closeModal = () => {
    setIsOpen(false)
    setErrorMessage("")
    setSuccessMessage("")
  }

  const loadPreferences = async () => {
    if (!token) return

    setIsLoading(true)
    setErrorMessage("")

    try {
      const { data, error } = await saturdayClient.GET("/member/notification-preferences", {
        params: {
          header: {
            Authorization: `Bearer ${token}`,
          },
        },
      })

      if (error || !data) {
        setErrorMessage("加载通知偏好设置失败")
        return
      }

      setPreferences(data)
    } catch (err) {
      setErrorMessage("加载通知偏好设置时出错")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = async (notificationType: string, newValue: boolean) => {
    setIsSaving(true)
    setErrorMessage("")
    setSuccessMessage("")

    // Optimistically update UI
    const previousPreferences = [...preferences]
    setPreferences(preferences.map(pref =>
      pref.notificationType === notificationType
        ? { ...pref, enabled: newValue }
        : pref
    ))

    try {
      // Create the request body with all preferences as an array of Item objects
      const preferencesArray: Item[] = preferences.map(pref => ({
        notificationType: pref.notificationType,
        enabled: pref.notificationType === notificationType ? newValue : pref.enabled,
      }))

      const { error } = await saturdayClient.PUT("/member/notification-preferences", {
        params: {
          header: {
            Authorization: `Bearer ${token}`,
          },
        },
        body: {
          preferences: preferencesArray,
        },
      })

      if (error) {
        // Revert on error
        setPreferences(previousPreferences)
        setErrorMessage("更新通知偏好设置失败")
        return
      }

      setSuccessMessage("通知偏好设置已更新")
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      // Revert on error
      setPreferences(previousPreferences)
      setErrorMessage("更新通知偏好设置时出错")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <Button onPress={openModal} color="primary" variant="flat">
        通知设置
      </Button>

      <Modal isOpen={isOpen} onClose={closeModal} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold">通知偏好设置</h3>
            <p className="text-sm text-gray-500 font-normal">管理您希望接收的通知类型</p>
          </ModalHeader>
          <ModalBody>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner label="加载中..." />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4">
                  {preferences.map((pref) => (
                    <div
                      key={pref.notificationType}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex-1">
                        <p className="text-sm sm:text-base font-medium">{pref.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{pref.notificationType}</p>
                      </div>
                      <Switch
                        isSelected={pref.enabled}
                        onValueChange={(value) => handleToggle(pref.notificationType, value)}
                        isDisabled={isSaving}
                        size="sm"
                      />
                    </div>
                  ))}

                  {preferences.length === 0 && !errorMessage && (
                    <div className="text-center py-4 text-gray-500">
                      <p className="text-sm">暂无可用的通知偏好设置</p>
                    </div>
                  )}
                </div>

                {/* Messages */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                )}
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={closeModal}>
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
