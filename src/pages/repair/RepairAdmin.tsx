import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Pagination,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  CheckboxGroup,
  Checkbox,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  Chip,
} from "@heroui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAsyncList } from "@react-stately/data"
import type { components } from "../../types/saturday"
import { saturdayApiBaseUrl, saturdayClient } from "../../utils/client"
import EventDetail, { EventStatusChip, type EventDetailRef } from "./EventDetail"
import dayjs from "dayjs"
import { EventStatus, UserEventStatus } from "../../types/event"
import { makeLogtoClient } from "../../utils/auth"
import type { PublicMember } from "../../store/member"
import type { UserInfoResponse } from "@logto/browser"
import { getAvailableEventActions, type EventAction, type IdentityContext } from "./EventAction"
import { ExportExcelModal } from "./ExportEventDialog"

type PublicEvent = components["schemas"]["PublicEvent"]

export const EyeIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 20 20"
      width="1em"
      {...props}
    >
      <path
        d="M12.9833 10C12.9833 11.65 11.65 12.9833 10 12.9833C8.35 12.9833 7.01666 11.65 7.01666 10C7.01666 8.35 8.35 7.01666 10 7.01666C11.65 7.01666 12.9833 8.35 12.9833 10Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M9.99999 16.8916C12.9417 16.8916 15.6833 15.1583 17.5917 12.1583C18.3417 10.9833 18.3417 9.00831 17.5917 7.83331C15.6833 4.83331 12.9417 3.09998 9.99999 3.09998C7.05833 3.09998 4.31666 4.83331 2.40833 7.83331C1.65833 9.00831 1.65833 10.9833 2.40833 12.1583C4.31666 15.1583 7.05833 16.8916 9.99999 16.8916Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  )
}

function CheckboxPopover(props: {
  value: string[]
  onValueChange: (value: string[]) => void
}) {
  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button size="sm" isIconOnly variant="bordered">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-2">
          <CheckboxGroup
            value={props.value}
            onValueChange={props.onValueChange}
            orientation="vertical"
          >
            {
              UserEventStatus.map((status) => {
                return (
                  <Checkbox key={status.status} value={status.status}>
                    <EventStatusChip size="sm" status={status.status} />
                  </Checkbox>
                )
              })
            }
          </CheckboxGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TicketDetailDrawer(props: {
  event: PublicEvent
  identity: IdentityContext
  isOpen: boolean
  onEventUpdated: (event: PublicEvent) => void
  onOpenChange: (isOpen: boolean) => void
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const { isOpen, onOpenChange, onClose } = props
  const [isLoading, setIsLoading] = useState("")

  const eventDetailRef = useRef<EventDetailRef>(null)

  const [availableActions, setAvailableActions] = useState<EventAction[]>([])

  useEffect(() => {
    if (!props.event || !props.identity?.member || !props.identity?.userInfo?.roles) {
      return
    }
    setAvailableActions(getAvailableEventActions(props.event, props.identity))
  }, [props.event, props.identity])

  const onEventUpdated = async (event: PublicEvent) => {
    props.onEventUpdated(event)
    const res = await eventDetailRef.current?.refresh()
    console.log("onEventUpdated", res)
    if (!res || !props.identity?.member || !props.identity?.userInfo?.roles) {
      return
    }
    setAvailableActions(getAvailableEventActions(res, props.identity))
  }

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold">维修详情</h2>
          {isLoading && <span className="text-sm text-gray-500">{isLoading}</span>}
        </DrawerHeader>
        <DrawerBody className="px-4 sm:px-6">
          <EventDetail ref={eventDetailRef} eventId={props.event?.eventId}>
            {
              event => (
                <div className="mb-8 sm:mb-12 flex flex-col gap-3 sm:gap-2">
                  {
                    availableActions?.map((action) => {
                      return (
                        <action.jsxHandler
                          key={action.action}
                          event={event}
                          isLoading={isLoading}
                          identityContext={props.identity}
                          onUpdated={onEventUpdated}
                          onLoading={(action) => {
                            setIsLoading(action)
                          }}
                        >
                        </action.jsxHandler>
                      )
                    }) || <></>
                  }
                </div>
              )
            }
          </EventDetail>
        </DrawerBody>
        <DrawerFooter className="px-4 sm:px-6">
          <Button variant="flat" onPress={onClose} className="w-full sm:w-auto">
            关闭
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export const validateRepairRole = (roles: string[]) => {
  const acceptableRoles = ["repair admin", "repair member"]
  return roles.some(role => acceptableRoles.includes(role.toLowerCase()))
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const rowsPerPage = 10
  const [statusFilter, setStatusFilter] = useState<string[]>(
    UserEventStatus.filter(v => v.status !== EventStatus.cancelled).map(v => v.status),
  )
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [userInfo, setUserInfo] = useState<UserInfoResponse>()
  const [currentMember, setCurrentMember] = useState<PublicMember>()
  const [token, setToken] = useState<string>()

  useEffect(() => {
    const check = async () => {
      const adminPath = "/repair/admin"
      const authenticated = await makeLogtoClient().isAuthenticated()
      if (!authenticated) {
        window.location.href = `/repair/login-hint?redirectUrl=${adminPath}`
        return
      }
      const res = await makeLogtoClient().getIdTokenClaims()
      const token = await makeLogtoClient().getAccessToken()
      setToken(token)
      const hasRole = validateRepairRole(res.roles)
      if (!hasRole) {
        window.location.href = `/repair/login-hint?redirectUrl=${adminPath}`
        return
      }
      setUserInfo(res)

      const currentMember = await fetch(`${saturdayApiBaseUrl}/member`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(res => res.json())
      setCurrentMember(currentMember)
    }
    check()
  }, [])

  const list = useAsyncList<PublicEvent>({
    async load() {
      const { data } = await saturdayClient.GET("/events", {
        params: {
          query: {
            order: "DESC",
            offset: 0,
            limit: 1000,
          },
        },
      })

      setIsLoading(false)

      return {
        items: data,
      }
    },
    async sort({ items, sortDescriptor }) {
      return {
        items: items.sort((a, b) => {
          const first = a[sortDescriptor.column]
          const second = b[sortDescriptor.column]
          let cmp = (parseInt(first) || first) < (parseInt(second) || second) ? -1 : 1

          if (sortDescriptor.direction === "descending") {
            cmp *= -1
          }

          return cmp
        }),
      }
    },
  })

  const filteredList = useMemo(() => {
    if (statusFilter.length > 0) {
      return list.items.filter(item => statusFilter.includes(item.status))
    }
    return list.items
  }, [list, statusFilter])

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage
    const end = start + rowsPerPage

    return filteredList.slice(start, end)
  }, [filteredList, page, rowsPerPage])

  const pages = useMemo(() => {
    return Math.ceil(filteredList.length / rowsPerPage)
  }, [filteredList, rowsPerPage])

  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const columns: {
    key: string
    label: string
    allowSorting?: boolean
    content?: JSX.Element
  }[] = [
    {
      key: "eventId",
      label: "单号",
    },
    {
      key: "problem",
      label: "问题描述",
    },
    {
      key: "model",
      label: "型号",
    },
    {
      key: "size",
      label: "工作量",
    },
    {
      key: "memberId",
      label: "处理人",
    },
    {
      key: "gmtCreate",
      label: "创建时间",
    },
    {
      key: "status",
      label: "状态",
      content: (
        <div className="flex items-center gap-2">
          状态
          <CheckboxPopover value={statusFilter} onValueChange={setStatusFilter}></CheckboxPopover>
        </div>
      ),
    },
    {
      key: "actions",
      label: "操作",
    },
  ]

  const [activeEvent, setActiveEvent] = useState<PublicEvent>()
  const onOpenEventDetail = (event: PublicEvent) => {
    setActiveEvent(event)
    onOpen()
  }

  const MobileEventCard = ({ event }: { event: PublicEvent }) => (
    <button className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" onClick={() => onOpenEventDetail(event)}>

      <div className="mb-3 flex gap-2 items-center justify-between">
        <div className="text font-medium text-gray-900 line-clamp-2">
          {event.problem}
          <span className="text font-medium text-gray-400 ml-1">#{event.eventId}</span>
        </div>
        <div className="">
          <EventStatusChip status={event.status} size="sm" />
        </div>
      </div>

      <div className="h-18">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="">
            { dayjs(event.gmtCreate).format("YYYY-MM-DD HH:mm") }
          </div>

          {event.model && (
            <div>
              {event.model}
            </div>
          )}

          <div>
            { event.size && <Chip size="sm">size:{event.size}</Chip>}
          </div>
          {event.member && (
            <div className="flex items-center gap-2 ">
              <User
                avatarProps={{ radius: "full", src: event.member.avatar, size: "sm" }}
                name=""
                classNames={{
                  base: "justify-start",
                  name: "text-sm",
                  description: "text-xs",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  )

  const renderCell = useCallback((event: PublicEvent, columnKey: string | number) => {
    const cellValue = event[columnKey]

    switch (columnKey) {
      case "problem":
        return (
          <div className="max-w-40 line-clamp-2 overflow-hidden text-ellipsis">
            {cellValue}
          </div>
        )
      case "memberId":
        return (
          event.member
            ? (
                <User
                  avatarProps={{ radius: "full", src: event.member.avatar, size: "sm" }}
                  name={event.member.alias}
                  description={event.member.memberId}
                >
                  {event.member.alias}
                </User>
              )
            : <></>
        )
      case "size":
        return (
          cellValue ? <Chip size="sm">{"size:" + cellValue}</Chip> : <></>
        )
      case "gmtCreate":
        return (
          <span>
            {dayjs(cellValue).format("YYYY-MM-DD HH:mm")}
          </span>
        )
      case "status":
        return EventStatusChip({
          status: cellValue,
          size: "sm",
        })
      case "actions":
        return (
          <Button onPress={() => onOpenEventDetail(event)} size="sm" isIconOnly variant="light">
            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
              <EyeIcon />
            </span>
          </Button>
        )

      default:
        return cellValue
    }
  }, [])
  return (
    <section className="box-border max-w-full px-4 sm:px-6 lg:max-w-[1024px] lg:px-[22px] mx-auto mb-16 sm:mb-24">
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-xl sm:text-2xl font-bold">维修管理</div>
        {
          userInfo?.roles?.find(v => v.toLowerCase() == "repair admin")
            ? <div className="w-full sm:w-auto"><ExportExcelModal></ExportExcelModal></div>
            : <></>
        }
      </div>
      <div className="my-8 flex flex-col gap-4">
        {/* Mobile Cards Layout */}
        <div className="block sm:hidden">
          {/* Filter Section for Mobile */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium">筛选状态:</span>
            <CheckboxPopover value={statusFilter} onValueChange={setStatusFilter} />
          </div>

          {isLoading
            ? (
                <div className="flex justify-center py-8">
                  <Spinner label="Loading..." />
                </div>
              )
            : (
                <div className="flex flex-col gap-4">
                  {items.map(event => (
                    <MobileEventCard key={event.eventId} event={event} />
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      暂无维修记录
                    </div>
                  )}
                </div>
              )}

          {/* Mobile Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={pages}
              onChange={page => setPage(page)}
            />
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden sm:block">
          <Table
            aria-label="Example table with dynamic content"
            sortDescriptor={list.sortDescriptor}
            onSortChange={list.sort}
            bottomContent={(
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={pages}
                  onChange={page => setPage(page)}
                />
              </div>
            )}
          >
            <TableHeader columns={columns}>
              {column => <TableColumn key={column.key} allowsSorting={column.allowSorting} children={column.content ?? <div>{column.label}</div>}></TableColumn>}
            </TableHeader>
            <TableBody isLoading={isLoading} items={items} loadingContent={<Spinner label="Loading..." />}>
              {item => (
                <TableRow key={item.eventId}>
                  {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <TicketDetailDrawer
        event={activeEvent}
        onEventUpdated={list.reload}
        identity={
          {
            member: currentMember,
            userInfo: userInfo,
            token: token,
          }
        }
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => {
          onOpenChange()
        }}
        onDelete={() => {}}
        onEdit={() => {}}
      >
      </TicketDetailDrawer>
    </section>
  )
}
