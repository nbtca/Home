import { useEffect, useState, useRef } from "react"
import { makeLogtoClient } from "../../utils/auth"
import type { UserInfoResponse } from "@logto/browser"
import { Alert, Form, Input, Button, Textarea, Card, CardBody } from "@heroui/react"
import { saturdayClient } from "../../utils/client"
import { safe } from "../../utils/safe"

type TicketFormData = {
  model?: string
  phone?: string
  qq?: string
  description?: string
  images?: string[] // base64 encoded images
}

type FormError = {
  field?: string
  message: string
  type: "validation" | "network" | "server" | "auth"
}

type SubmissionState = "idle" | "submitting" | "success" | "error" | "retrying"

function LoginHintAlert(props: {
  onLogin: () => void
}) {
  return (
    <div className="section-content my-8">
      <div className="flex items-center justify-center w-full">
        <Alert
          className="items-center"
          endContent={(
            <Button color="primary" size="sm" variant="flat" onPress={props.onLogin}>
              登入
            </Button>
          )}
        >
          登入账号来跟踪你的维修进度
        </Alert>
      </div>
    </div>
  )
}

function TicketForm(props: {
  userInfo?: UserInfoResponse
  onSubmit: (form: TicketFormData) => Promise<void>
}) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle")
  const [formData, setFormData] = useState<TicketFormData>({})
  const [errors, setErrors] = useState<FormError[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form persistence
  useEffect(() => {
    const savedData = localStorage.getItem("ticket-form-draft")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      }
      catch (error) {
        console.warn("Failed to parse saved form data:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem("ticket-form-draft", JSON.stringify(formData))
    }
  }, [formData])

  const clearFormData = () => {
    localStorage.removeItem("ticket-form-draft")
    setFormData({})
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors([])

    setSubmissionState("submitting")

    try {
      await props.onSubmit(formData)
      setSubmissionState("success")
      clearFormData()

      // Show success message briefly before redirect
      setTimeout(() => {
        // The redirect will be handled by the parent component
      }, 1500)
    }
    catch (error) {
      setSubmissionState("error")

      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes("auth") || error.message.includes("token")) {
          setErrors([{ message: "登录状态已过期，请重新登录", type: "auth" }])
        }
        else if (error.message.includes("network") || error.message.includes("fetch")) {
          setErrors([{ message: "网络连接失败，请检查网络后重试", type: "network" }])
        }
        else {
          setErrors([{ message: "提交失败，请稍后重试", type: "server" }])
        }
      }
      else {
        setErrors([{ message: "提交失败，请稍后重试", type: "server" }])
      }
    }
  }

  const handleRetry = async () => {
    setSubmissionState("retrying")
    setErrors([])

    try {
      await props.onSubmit(formData)
      setSubmissionState("success")
      clearFormData()
    }
    catch (error) {
      setSubmissionState("error")
      setErrors([{ message: "重试失败，请稍后再试", type: "server" }])
      console.error("Retry submission error:", error)
    }
  }

  const onLogin = async () => {
    makeLogtoClient().signIn({
      redirectUri: import.meta.env.PUBLIC_LOGTO_CALLBACK_URL,
      postRedirectUri: window.location.pathname,
    })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors([{ message: `图片 ${file.name} 超过5MB大小限制`, type: "validation" }])
        continue
      }

      // Convert to base64
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        newImages.push(base64)
      } catch (error) {
        console.error("Failed to read image:", error)
      }
    }

    setFormData({
      ...formData,
      images: [...(formData.images || []), ...newImages]
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])]
    newImages.splice(index, 1)
    setFormData({ ...formData, images: newImages })
  }

  return (
    <section className="box-border mb-24">
      {
        props.userInfo?.sub
          ? <></>
          : <LoginHintAlert onLogin={onLogin}></LoginHintAlert>
      }
      <div className="section-content my-8">
        <h2 className="text-2xl font-bold">预约维修</h2>
        <div>
          在你填写表单之后，我们会尽快联系你，确认维修时间和地点。
        </div>
      </div>
      <div className="section-content w-full">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 space-y-2">
            {errors.map((error, index) => (
              <Alert
                key={index}
                color={error.type === "validation" ? "warning" : "danger"}
                className="flex items-center justify-between"
                endContent={
                  error.type === "network" || error.type === "server"
                    ? (
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={handleRetry}
                          isLoading={submissionState === "retrying"}
                        >
                          重试
                        </Button>
                      )
                    : error.type === "auth"
                      ? (
                          <Button
                            size="sm"
                            color="warning"
                            variant="flat"
                            onPress={onLogin}
                          >
                            重新登录
                          </Button>
                        )
                      : null
                }
              >
                {error.message}
              </Alert>
            ))}
          </div>
        )}

        {/* Success Message */}
        {submissionState === "success" && (
          <Alert color="success" className="mb-4">
            提交成功！正在跳转到详情页面...
          </Alert>
        )}

        <Form
          className="w-full flex flex-col gap-4"
          onSubmit={onSubmit}
        >
          <div className="text-sm font-bold mx-1">
            问题描述
          </div>
          <Textarea
            label="问题描述"
            placeholder="告诉我们你遇到的问题"
            errorMessage="问题描述不能为空"
            required
            name="description"
            value={formData.description || ""}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value })
            }}
            isRequired
          />
          <div className="w-full">
            <Input
              label="型号"
              type="text"
              placeholder="你的设备型号"
              value={formData.model || ""}
              onChange={(e) => {
                setFormData({ ...formData, model: e.target.value })
              }}
              description="填写设备型号，帮助我们更快的定位问题"
            />
          </div>

          {/* Image Upload Section */}
          <div className="w-full flex flex-col gap-2">
            <div className="text-sm font-bold mx-1">
              问题图片
              <span className="text-xs font-normal text-default-400 ml-2">
                (可选，最多5张，每张最大5MB)
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              <Button
                onPress={() => fileInputRef.current?.click()}
                variant="bordered"
                className="w-full"
                isDisabled={(formData.images?.length || 0) >= 5}
              >
                {(formData.images?.length || 0) >= 5 ? '已达到最大数量' : '选择图片'}
              </Button>

              {formData.images && formData.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {formData.images.map((image, index) => (
                    <Card key={index} className="relative">
                      <CardBody className="p-0">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
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

          <div className="text-sm font-bold mx-1 mt-2">
            联系方式
          </div>
          <Input
            label="邮箱"
            placeholder="example@nbtca.space"
            isRequired
            type="email"
            value={props.userInfo?.email || ""}
            readOnly
            description="我们会向此邮箱发送维修相关的通知"
          />
          <Input
            label="电话号码"
            placeholder="必填"
            errorMessage="电话号码不能为空"
            isRequired
            type="phone"
            name="phone"
            value={formData.phone || ""}
            maxLength={11}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value })
            }}
          />
          <Input
            label="QQ"
            placeholder="你的QQ号"
            value={formData.qq || ""}
            onChange={(e) => {
              setFormData({ ...formData, qq: e.target.value })
            }}
          />
          <Button type="submit" color="primary" className="my-4 w-full" isLoading={submissionState == "submitting"}>
            提交
          </Button>
        </Form>
      </div>
    </section>
  )
}

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse>()

  useEffect(() => {
    const check = async () => {
      const createRepairPath = "/repair/create-ticket"
      try {
        const [res, err] = await safe(makeLogtoClient().getIdTokenClaims())
        if (err) {
          window.location.href = `/repair/login-hint?redirectUrl=${createRepairPath}`
          return
        }
        setUserInfo(res)
      }
      catch (error) {
        console.error("Error checking authentication:", error)
        window.location.href = `/repair/login-hint?redirectUrl=${createRepairPath}`
      }
    }
    check()
  }, [])

  const onSubmit = async (formData: TicketFormData) => {
    const logtoToken = await makeLogtoClient().getAccessToken()
    try {
      const { data } = await saturdayClient.POST("/client/event", {
        headers: {
          Authorization: `Bearer ${logtoToken}`,
        },
        body: {
          problem: formData.description,
          model: formData.model,
          phone: formData.phone,
          qq: formData.qq,
        },
      })
      // Update URL with eventId to persist the ticket status
      if (data?.eventId) {
        window.location.href = `/repair/ticket-detail?eventId=${data.eventId}`
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <TicketForm userInfo={userInfo} onSubmit={onSubmit}></TicketForm>
  )
}
