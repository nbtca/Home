import { useEffect, useState } from "react"
import { Card, CardBody, CardHeader, Switch, Spinner, Button } from "@heroui/react"
import { saturdayClient } from "../../utils/client"
import type { components } from "../../types/saturday"

type NotificationPreferenceItem = components["schemas"]["NotificationPreferenceItem"]
type UpdateNotificationPreferencesInputBody = components["schemas"]["UpdateNotificationPreferencesInputBody"]

interface NotificationPreferencesProps {
  token: string
}

export default function NotificationPreferences({ token }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<NotificationPreferenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  useEffect(() => {
    loadPreferences()
  }, [token])

  const loadPreferences = async () => {
    if (!token) return

    setIsLoading(true)
    setErrorMessage("")

    try {
      const { data, error } = await saturdayClient.GET("/notification-preferences", {
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
      // Create the request body with all preferences
      const requestBody: UpdateNotificationPreferencesInputBody = preferences.reduce((acc, pref) => {
        const enabled = pref.notificationType === notificationType ? newValue : pref.enabled
        acc[pref.notificationType] = enabled
        return acc
      }, {} as UpdateNotificationPreferencesInputBody)

      const { error } = await saturdayClient.PUT("/notification-preferences", {
        params: {
          header: {
            Authorization: `Bearer ${token}`,
          },
        },
        body: requestBody,
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

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardBody className="flex justify-center items-center py-8">
          <Spinner label="加载中..." />
        </CardBody>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-start gap-2 pb-4">
        <h3 className="text-lg sm:text-xl font-bold">通知偏好设置</h3>
        <p className="text-sm text-gray-500">管理您希望接收的通知类型</p>
      </CardHeader>
      <CardBody className="gap-4">
        {preferences.map((pref) => (
          <div
            key={pref.notificationType}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-2 border-b border-gray-100 last:border-0"
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

        {preferences.length === 0 && !errorMessage && (
          <div className="text-center py-4 text-gray-500">
            <p className="text-sm">暂无可用的通知偏好设置</p>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
