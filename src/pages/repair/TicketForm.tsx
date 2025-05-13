import { useEffect, useState } from "react"
import { makeLogtoClient } from "../../utils/auth"
import type { UserInfoResponse } from "@logto/browser"
import { Form, Input, Button, Textarea } from "@heroui/react"
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

function TicketForm(props: {
  userInfo: UserInfoResponse
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
    QRCode.toString(props.event.eventId.toString()).then((res) => {
      // const root = createRoot(
      //   document.getElementById("svg-root"),
      // )
      // root.render(res)
      setSvg(res)
    })
  })
  // const svg = ref()
  // watch(id, async () => {
  //   if (!id.value) {
  //     return
  //   }
  //   svg.value = await QRCode.toString(useGraduationIdURL().constructURL(id.value))
  // })

  return (
    <div className="w-full h-[80vh] flex flex-col justify-between items-center">
      <div className=" flex flex-col sm:flex-row items-center h-full max-w-[1280px] justify-center gap-8 p-8">
        <div className="min-h-64 h-[36vh] aspect-square">
          <div className="h-full" dangerouslySetInnerHTML={{ __html: svg }}></div>
        </div>
        <div
          className=" sm:w-auto"
        >
          <div className="flex items-center gap-2">
            <div className="text-brand text-nowrap text-3xl font-bold">
              预约成功
            </div>
          </div>
          <div className="sm:w-[30vw] mt-6 text-gray-600 lg:text-lg">
            <div>
              扫描二维码来查看预约详情
            </div>
            <div>
              你也可以保存此二维码
            </div>
          </div>
        </div>
      </div>
    </div>
    // <div>{props.event.eventId}</div>
  )
}

export default function App() {
  const [userInfo, setUserInfo] = useState<UserInfoResponse>()
  const [event, setEvent] = useState<PublicEvent | undefined>({
    eventId: 123,
  })

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
      <EventDetail />
      (
      event?.eventId
      ? <TicketFormCreated event={event}></TicketFormCreated>
      : <TicketForm userInfo={userInfo} onSubmit={onSubmit}></TicketForm>
      )
    </>
  )
}
