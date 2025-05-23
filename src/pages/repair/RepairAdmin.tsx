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
} from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useAsyncList } from "@react-stately/data"
import type { components } from "../../types/saturday"
import { saturdayClient } from "../../utils/client"
import EventDetail, { EventStatusChip } from "./EventDetail"
import dayjs from "dayjs"
import { UserEventStatus } from "../../types/event"
import { makeLogtoClient } from "../../utils/auth"

type PublicEvent = components["schemas"]["PublicEvent"]
// type EventLog = components["schemas"]["EventLog"]

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

export const DeleteIcon = (props) => {
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
        d="M17.5 4.98332C14.725 4.70832 11.9333 4.56665 9.15 4.56665C7.5 4.56665 5.85 4.64998 4.2 4.81665L2.5 4.98332"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.08331 4.14169L7.26665 3.05002C7.39998 2.25835 7.49998 1.66669 8.90831 1.66669H11.0916C12.5 1.66669 12.6083 2.29169 12.7333 3.05835L12.9166 4.14169"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M15.7084 7.61664L15.1667 16.0083C15.075 17.3166 15 18.3333 12.675 18.3333H7.32502C5.00002 18.3333 4.92502 17.3166 4.83335 16.0083L4.29169 7.61664"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M8.60834 13.75H11.3833"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
      <path
        d="M7.91669 10.4167H12.0834"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  )
}

export const EditIcon = (props) => {
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
        d="M11.05 3.00002L4.20835 10.2417C3.95002 10.5167 3.70002 11.0584 3.65002 11.4334L3.34169 14.1334C3.23335 15.1084 3.93335 15.775 4.90002 15.6084L7.58335 15.15C7.95835 15.0834 8.48335 14.8084 8.74168 14.525L15.5834 7.28335C16.7667 6.03335 17.3 4.60835 15.4583 2.86668C13.625 1.14168 12.2334 1.75002 11.05 3.00002Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M9.90833 4.20831C10.2667 6.50831 12.1333 8.26665 14.45 8.49998"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <path
        d="M2.5 18.3333H17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </svg>
  )
}
function CheckboxPopover(props: {
  value: string[]
  onValueChange: (value: string[]) => void
}) {
  // const [selectedValues, setSelectedValues] = useState([])

  // const handleSelectionChange = (values) => {
  //   setSelectedValues(values)
  // }

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
  eventId: number
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onClose: () => void
  onDelete: () => void
  onEdit: () => void
}) {
  const { isOpen, onOpenChange, onClose } = props

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <h2 className="text-2xl font-bold">维修详情</h2>
        </DrawerHeader>
        <DrawerBody>
          <EventDetail eventId={props.eventId}></EventDetail>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="flat" onPress={onClose}>
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
  const rowsPerPage = 15
  // const [events, setEvents] = useState<PublicEvent[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  // const [userInfo, setUserInfo] = useState<UserInfoResponse>()

  useEffect(() => {
    const check = async () => {
      const adminPath = "/repair/admin"
      const authenticated = await makeLogtoClient().isAuthenticated()
      if (!authenticated) {
        window.location.href = `/repair/login-hint?redirectUrl=${adminPath}`
        return
      }
      const res = await makeLogtoClient().getIdTokenClaims()
      const hasRole = validateRepairRole(res.roles)
      if (!hasRole) {
        window.location.href = `/repair/login-hint?redirectUrl=${adminPath}`
        return
      }
      // setUserInfo(res)
    }
    check()
  }, [])
  // const fetchAndSetEvent = async () => {
  //   const { data } = await saturdayClient.GET("/events", {
  //     params: {
  //       query: {
  //         order: "DESC",
  //         offset: 1,
  //         limit: 1000,
  //       },
  //     },
  //   })
  //   setEvents(data)
  // }

  const list = useAsyncList<PublicEvent>({
    async load() {
      const { data } = await saturdayClient.GET("/events", {
        params: {
          query: {
            order: "DESC",
            offset: 1,
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
  // useEffect(() => {
  //   fetchAndSetEvent()
  // }, [])

  const columns = [
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

  const [activeEventId, setActiveEventId] = useState<number>()
  const onOpenEventDetail = (eventId: number) => {
    setActiveEventId(eventId)
    onOpen()
  }

  const renderCell = useCallback((event: PublicEvent, columnKey: string) => {
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
                >
                  {event.member.alias}
                </User>
              )
            : <></>
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
        })
      case "actions":
        return (
          <Button onPress={() => onOpenEventDetail(event.eventId)} size="sm" isIconOnly variant="light">
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
    <section className="box-border mb-24">
      <div className="section-content mt-8">
        <h2 className="text-2xl font-bold">维修管理</h2>
      </div>
      <div className="section-content my-8 flex flex-col gap-4">
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
      <TicketDetailDrawer
        eventId={activeEventId}
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
