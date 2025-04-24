import { useEffect, useState } from "react"
import { makeLogtoClient } from "../../utils/auth"
import type { UserInfoResponse } from "@logto/browser"
import { Form, Input, Button, Textarea } from "@heroui/react"
import { saturdayClient } from "../../utils/client"
import type LogtoClient from "@logto/browser"

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse>()
  const [formData, setFormData] = useState<{
    model?: string
    phone?: string
    qq?: string
    description?: string
  }>({})

  let logtoClient: LogtoClient | undefined = undefined

  useEffect(() => {
    const check = async () => {
      logtoClient = makeLogtoClient()
      const createRepairPath = "/repair/create-ticket"
      const authenticated = await logtoClient.isAuthenticated()
      if (!authenticated) {
        window.location.href = `/repair/login-hint?redirectUrl=${createRepairPath}`
        return
      }
      const res = await logtoClient.getIdTokenClaims()
      setUserInfo(res)
    }
    check()
  }, [])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const logtoToken = await logtoClient.getAccessToken()
    await saturdayClient.POST("/client/event", {
      headers: {
        Authorization: `Bearer ${logtoToken}`,
      },
      body: {
        Problem: formData.description,
        model: formData.model,
        phone: formData.phone,
        qq: formData.qq,
      },
    })
  }

  return (
    <section className="box-border mb-24">
      <div className="section-content my-8">
        <h2 className="text-2xl font-bold">预约维修</h2>
        <div>
          在你填写表单之后，我们会尽快联系你，确认维修时间和地点。
        </div>
      </div>
      <div className="section-content w-full">
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
          <div className="text-sm font-bold mx-1 mt-2">
            联系方式
          </div>
          <Input
            label="邮箱"
            placeholder="example@nbtca.space"
            isRequired
            type="email"
            value={userInfo?.email || ""}
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
          <Button type="submit" color="primary" className="my-4 w-full">
            提交
          </Button>
        </Form>
      </div>
    </section>
  )
}
