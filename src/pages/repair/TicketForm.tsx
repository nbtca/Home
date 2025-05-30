import { SITE_URL } from "../../consts"
import { useEffect, useState } from "react"
import { makeLogtoClient } from "../../utils/auth"
import type { UserInfoResponse } from "@logto/browser"
import { Alert, Form, Input, Button, Textarea } from "@heroui/react"
import { saturdayClient } from "../../utils/client"
import type { components } from "../../types/saturday"
import QRCode from "qrcode"
import EventDetail from "./EventDetail"

type TicketFormData = {
  model?: string
  phone?: string
  qq?: string
  description?: string
}

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
  const [loading, setLoading] = useState<boolean>()
  const [formData, setFormData] = useState<TicketFormData>({})
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    await props.onSubmit(formData)
    setLoading(false)
  }

  const onLogin = async () => {
    makeLogtoClient().signIn({
      redirectUri: import.meta.env.PUBLIC_LOGTO_CALLBACK_URL,
      postRedirectUri: window.location.pathname,
    })
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
          <Button type="submit" color="primary" className="my-4 w-full" isLoading={loading}>
            提交
          </Button>
        </Form>
      </div>
    </section>
  )
}
type PublicEvent = components["schemas"]["PublicEvent"]
function TicketFormCreated(props: {
  event: PublicEvent
}) {
  const [svg, setSvg] = useState<string>()

  useEffect(() => {
    const url = new URL(`/repair/ticket-detail`, SITE_URL)
    url.searchParams.append("eventId", props.event.eventId.toString())
    QRCode.toString(url.toString()).then((res) => {
      setSvg(res)
    })
  })
  return (
    <section className="box-border w-full mt-8">
      <div className="section-content">
        <Alert hideIcon color="success" variant="faded">
          <div className="flex items-center gap-8">
            <div className="h-28 lg:h-40 aspect-square">
              <div className="h-full" dangerouslySetInnerHTML={{ __html: svg }}></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-brand text-nowrap text-lg lg:text-2xl font-bold">
                  预约成功
                </div>
              </div>
              <div className="mt-1 text-gray-600 lg:text-lg">
                <div>
                  保存二维码
                </div>
                <div>
                  跟踪维修进度
                </div>
              </div>
            </div>
          </div>
        </Alert>
      </div>
      <div className="section-content">
        <EventDetail eventId={props.event?.eventId}></EventDetail>
      </div>
    </section>
  )
}

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse>()
  const [event, setEvent] = useState<PublicEvent | undefined>()

  useEffect(() => {
    const check = async () => {
      const createRepairPath = "/repair/create-ticket"
      const authenticated = await makeLogtoClient().isAuthenticated()
      if (!authenticated) {
        window.location.href = `/repair/login-hint?redirectUrl=${createRepairPath}`
        return
      }
      const res = await makeLogtoClient().getIdTokenClaims()
      setUserInfo(res)
    }
    check()
  }, [])

  const onSubmit = async (formData: TicketFormData) => {
    const logtoToken = await makeLogtoClient().getAccessToken()
    try {
      const res = await saturdayClient.POST("/client/event", {
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
      setEvent(res.data as unknown as PublicEvent)
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {
        event?.eventId
          ? <TicketFormCreated event={event}></TicketFormCreated>
          : <TicketForm userInfo={userInfo} onSubmit={onSubmit}></TicketForm>
      }
    </>
  )
}
