import type { UserInfoResponse } from "@logto/browser"
import type { PublicMember } from "../../store/member"
import { EventStatus, type PublicEvent } from "../../types/event"
import { saturdayApiBaseUrl } from "../../utils/client"
import { Button, Form, Select, SelectItem, Textarea } from "@heroui/react"
import { useState } from "react"

export type IdentityContext = {
  member: PublicMember
  userInfo: UserInfoResponse
  token: string
}

enum RepairRole {
  repairAdmin = "repair admin",
  repairMember = "repair member",
}

export type EventActionProps = {
  event: PublicEvent
  identityContext: IdentityContext
  isLoading?: string
  onUpdated: (event: PublicEvent) => void
  onLoading: (loadingAction?: string) => void
}

const EventSizeOptions: {
  size: string
  description?: string
}[] = [
  { size: "xs", description: "无需工具，仅简单排查或软件层级操作" },
  { size: "s", description: "简单拆装部件，操作快，风险低" },
  { size: "m", description: "需基本工具、一定技术判断，时间较长" },
  { size: "l", description: "较复杂的拆装和测试流程，需熟练技能、多人协作可能" },
  { size: "xl", description: "工作量极大，涉及多个设备，需团队作业和详细记录" },
]

const EventActionCommitForm = (props: {
  formData: {
    size: string
    description: string
  }
  setFormData: (data: {
    size: string
    description: string
  }) => void
}) => {
  const { formData, setFormData } = props
  return (
    <Form>
      <Select
        items={EventSizeOptions}
        label="维修难度"
        size="sm"
        value={formData.size}
        onChange={(value) => {
          setFormData({ ...formData, size: value.target.value.split(",")[0] })
        }}
        placeholder="请选择维修难度"
      >
        {
          size => (
            <SelectItem key={size.size} textValue={"size:" + size.size}>
              <div className="flex gap-2 items-center">
                <div className="flex flex-col">
                  <span className="text-small">{size.size}</span>
                  <span className="text-tiny text-default-400">{size.description}</span>
                </div>
              </div>
            </SelectItem>
          )
        }
      </Select>
      <Textarea
        label="维修描述"
        placeholder="请输入维修描述"
        errorMessage="维修描述不能为空"
        required
        name="description"
        value={formData.description || ""}
        onChange={(e) => {
          setFormData({ ...formData, description: e.target.value })
        }}
        isRequired
        rows={3}
      />
    </Form>
  )
}

export const EventActionCommit = (props: EventActionProps) => {
  const [formData, setFormData] = useState({
    size: "",
    description: "",
  })

  const onSubmit = async () => {
    props.onLoading("commit")
    const res = await fetch(`${saturdayApiBaseUrl}/member/events/${props.event.eventId}/commit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${props.identityContext.token}`,
      },
      body: JSON.stringify({
        size: formData.size,
        problem: formData.description,
      }),
    }).then(res => res.json())
    props.onLoading()
    return props.onUpdated(res)
  }
  return (
    <div className="flex flex-col gap-4">
      <EventActionCommitForm
        formData={formData}
        setFormData={setFormData}
      >
      </EventActionCommitForm>
      <Button
        variant="flat"
        isLoading={props.isLoading === "commit"}
        onPress={() => onSubmit()}
      >
        提交
      </Button>
    </div>
  )
}
export const EventActionAlterCommit = (props: EventActionProps) => {
  const [formData, setFormData] = useState({
    size: props.event.size,
    description: props.event.problem,
  })

  const onSubmit = async () => {
    props.onLoading("alterCommit")
    const res = await fetch(`${saturdayApiBaseUrl}/member/events/${props.event.eventId}/commit`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${props.identityContext.token}`,
      },
      body: JSON.stringify({
        size: formData.size,
        problem: formData.description,
      }),
    }).then(res => res.json())
    props.onLoading()
    return props.onUpdated(res)
  }
  return (
    <div className="flex flex-col gap-4">
      <EventActionCommitForm
        formData={formData}
        setFormData={setFormData}
      >
      </EventActionCommitForm>
      <Button
        variant="flat"
        isLoading={props.isLoading === "commit"}
        onPress={() => onSubmit()}
      >
        修改提交
      </Button>
    </div>
  )
}

type CommonHandler = () => Promise<unknown>
type JsxHandler = (props: EventActionProps) => JSX.Element
export type EventAction = {
  action: string
  label?: string
  handler?: CommonHandler
  jsxHandler: JsxHandler
}
export const getAvailableEventActions = (event: PublicEvent, identityContext: IdentityContext) => {
  console.log("getting event actions", event, identityContext)
  const actions: EventAction[] = []

  const makeCommonJsxHandler = (action: Omit<EventAction, "jsxHandler">) => {
    return (props: EventActionProps) => {
      const onAction = async (action: {
        action: string
        handler?: CommonHandler
      }) => {
        props.onLoading(action.action)
        if (action.handler) {
          const res = await action.handler()
          props.onUpdated(res as PublicEvent)
        }
        props.onLoading()
      }
      return (
        <div className="flex flex-col">
          <Button
            variant="flat"
            isLoading={props.isLoading === action.action}
            isDisabled={props.isLoading}
            onPress={() => onAction(action)}
          >
            {action.label ?? action.action}
          </Button>
        </div>
      )
    }
  }

  if (event.status == EventStatus.open) {
    actions.push({
      action: "accept",
      jsxHandler: makeCommonJsxHandler({
        action: "accept",
        label: "接受",
        handler: async () => {
          return await fetch(`${saturdayApiBaseUrl}/member/events/${event.eventId}/accept`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${identityContext.token}`,
            },
          }).then(res => res.json())
        },
      }),
    })
  }
  else if (event.status == EventStatus.accepted && event.member?.memberId == identityContext.member.memberId) {
    actions.push({
      action: "commit",
      jsxHandler: EventActionCommit,
    })
    actions.push({
      action: "drop",
      jsxHandler: makeCommonJsxHandler({
        action: "drop",
        label: "放弃",
        handler: async () => {
          return await fetch(`${saturdayApiBaseUrl}/member/events/${event.eventId}/accept`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${identityContext.token}`,
            },
          }).then(res => res.json())
        },
      }),
    })
  }
  else if (event.status == EventStatus.committed) {
    if (event.member?.memberId == identityContext.member.memberId) {
      actions.push({
        action: "alterCommit",
        jsxHandler: EventActionAlterCommit,
      })
    }
    if (identityContext.userInfo.roles.find(role => role.toLocaleLowerCase() == RepairRole.repairAdmin)) {
      actions.push({
        action: "close",
        jsxHandler: makeCommonJsxHandler({
          action: "close",
          label: "关闭",
          handler: async () => {
            return await fetch(`${saturdayApiBaseUrl}/events/${event.eventId}/close`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${identityContext.token}`,
              },
            }).then(res => res.json())
          },
        }),
      })
      actions.push({
        action: "reject",
        jsxHandler: makeCommonJsxHandler({
          action: "rejectCommit",
          label: "退回",
          handler: async () => {
            return await fetch(`${saturdayApiBaseUrl}/events/${event.eventId}/commit`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${identityContext.token}`,
              },
            }).then(res => res.json())
          },
        }),
      })
    }
  }

  return actions
}
