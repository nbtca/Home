import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  CheckboxGroup,
  Checkbox,
  useDisclosure,
  Input,
} from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useAsyncList } from "@react-stately/data"
import type { MemberApplication, ApplicationStatus } from "../../../../types/member-application"
import { APPLICATION_STATUS_MAP } from "../../../../types/member-application"
import { saturdayClient, activeClient } from "../../../../utils/client"
import ApplicationDetailDrawer, { ApplicationStatusChip } from "./ApplicationDetail"
import dayjs from "dayjs"
import { makeLogtoClient } from "../../../../utils/auth"
import type { PublicMember } from "../../../../store/member"
import type { UserInfoResponse } from "@logto/browser"

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

const STATUS_OPTIONS: { status: ApplicationStatus; label: string }[] = [
  { status: "pending", label: "待审核" },
  { status: "approved", label: "已通过" },
  { status: "rejected", label: "已拒绝" },
]

function StatusFilterPopover(props: {
  value: ApplicationStatus[]
  onValueChange: (value: ApplicationStatus[]) => void
}) {
  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button size="sm" isIconOnly variant="bordered">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
            />
          </svg>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-2">
          <CheckboxGroup
            value={props.value}
            onValueChange={(values) => props.onValueChange(values as ApplicationStatus[])}
            orientation="vertical"
          >
            {STATUS_OPTIONS.map((status) => (
              <Checkbox key={status.status} value={status.status}>
                <ApplicationStatusChip size="sm" status={status.status} />
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export const validateMemberAdminRole = (roles: string[]) => {
  const acceptableRoles = ["admin", "member admin"]
  return roles.some(role => acceptableRoles.includes(role.toLowerCase()))
}

export default function MemberApplicationAdmin() {
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const rowsPerPage = 10
  const [totalCount, setTotalCount] = useState(0)
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus[]>(["pending"])
  const [searchQuery, setSearchQuery] = useState("")
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [userInfo, setUserInfo] = useState<UserInfoResponse>()
  const [currentMember, setCurrentMember] = useState<PublicMember>()
  const [token, setToken] = useState<string>()

  useEffect(() => {
    const check = async () => {
      const adminPath = "/admin/member-applications"
      const authenticated = await makeLogtoClient().isAuthenticated()
      if (!authenticated) {
        window.location.href = `/repair/login-hint?redirectUrl=${adminPath}`
        return
      }
      const res = await makeLogtoClient().getIdTokenClaims()
      const token = await makeLogtoClient().getAccessToken()
      setToken(token)
      const hasRole = validateMemberAdminRole(res.roles)
      if (!hasRole) {
        window.location.href = `/repair/login-hint?redirectUrl=${adminPath}`
        return
      }
      setUserInfo(res)

      const { data } = await saturdayClient.GET("/member", {
        params: {
          header: {
            Authorization: `Bearer ${token}`,
          },
        },
      })
      setCurrentMember(data)
    }
    check()
  }, [])

  const list = useAsyncList<MemberApplication>({
    async load() {
      setIsLoading(true)
      const offset = (page - 1) * rowsPerPage

      // TODO: Replace with actual API endpoint when backend is ready
      const response = await activeClient.memberApplication.getMemberApplications({
        offset,
        limit: rowsPerPage,
        status: statusFilter.length > 0 ? statusFilter.join(",") : undefined,
        search: searchQuery || undefined,
      })

      setTotalCount(response.totalCount || 0)
      setIsLoading(false)

      return {
        items: response.result || [],
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

  const items = useMemo(() => {
    return list.items
  }, [list.items])

  const pages = useMemo(() => {
    return Math.ceil(totalCount / rowsPerPage)
  }, [totalCount, rowsPerPage])

  useEffect(() => {
    setPage(1)
    list.reload()
  }, [statusFilter, searchQuery])

  useEffect(() => {
    list.reload()
  }, [page])

  const columns: {
    key: string
    label: string
    allowSorting?: boolean
    content?: JSX.Element
  }[] = [
    {
      key: "applicationId",
      label: "申请ID",
    },
    {
      key: "memberId",
      label: "学号",
    },
    {
      key: "name",
      label: "姓名",
    },
    {
      key: "phone",
      label: "手机号",
    },
    {
      key: "gmtCreate",
      label: "申请时间",
    },
    {
      key: "status",
      label: "状态",
      content: (
        <div className="flex items-center gap-2">
          状态
          <StatusFilterPopover
            value={statusFilter}
            onValueChange={setStatusFilter}
          />
        </div>
      ),
    },
    {
      key: "actions",
      label: "操作",
    },
  ]

  const [activeApplication, setActiveApplication] = useState<MemberApplication | null>(null)

  const onOpenApplicationDetail = (application: MemberApplication) => {
    setActiveApplication(application)
    onOpen()
  }

  const MobileApplicationCard = ({ application }: { application: MemberApplication }) => (
    <button
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
      onClick={() => onOpenApplicationDetail(application)}
    >
      <div className="mb-3 flex gap-2 items-center justify-between">
        <div className="text font-medium text-gray-900 line-clamp-2">
          {application.name}
          <span className="text font-medium text-gray-400 ml-1">({application.memberId})</span>
        </div>
        <div>
          <ApplicationStatusChip status={application.status} size="sm" />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <div>{dayjs(application.gmtCreate).format("MM-DD HH:mm")}</div>
        {application.phone && (
          <>
            <div>·</div>
            <div>{application.phone}</div>
          </>
        )}
      </div>
    </button>
  )

  const renderCell = useCallback((application: MemberApplication, columnKey: string | number) => {
    const cellValue = application[columnKey]

    switch (columnKey) {
      case "applicationId":
        return (
          <span className="font-mono text-sm">{cellValue?.substring(0, 8)}...</span>
        )
      case "gmtCreate":
        return (
          <span className="text-sm">
            {dayjs(cellValue).format("YYYY-MM-DD HH:mm")}
          </span>
        )
      case "status":
        return <ApplicationStatusChip status={cellValue} size="sm" />
      case "actions":
        return (
          <Button
            onPress={() => onOpenApplicationDetail(application)}
            size="sm"
            isIconOnly
            variant="light"
          >
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
        <div className="text-xl sm:text-2xl font-bold">成员申请管理</div>
      </div>

      {/* Search Bar */}
      <div className="my-6">
        <Input
          placeholder="搜索学号或姓名..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          isClearable
          onClear={() => setSearchQuery("")}
          startContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          }
        />
      </div>

      <div className="my-8 flex flex-col gap-4">
        {/* Mobile Cards Layout */}
        <div className="block sm:hidden">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium">筛选状态:</span>
            <StatusFilterPopover value={statusFilter} onValueChange={setStatusFilter} />
          </div>

          <div className="min-h-[600px]">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner label="Loading..." />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((application) => (
                  <MobileApplicationCard key={application.applicationId} application={application} />
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">暂无申请记录</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={pages || 1}
              onChange={(page) => setPage(page)}
            />
          </div>
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden sm:block">
          <Table
            aria-label="Member applications table"
            sortDescriptor={list.sortDescriptor}
            onSortChange={list.sort}
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="secondary"
                  page={page}
                  total={pages || 1}
                  onChange={(page) => setPage(page)}
                />
              </div>
            }
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.key}
                  allowsSorting={column.allowSorting}
                  children={column.content ?? <div>{column.label}</div>}
                />
              )}
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              items={items}
              loadingContent={<Spinner label="Loading..." />}
            >
              {(item) => (
                <TableRow key={item.applicationId}>
                  {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ApplicationDetailDrawer
        application={activeApplication}
        identity={{
          member: currentMember,
          userInfo: userInfo,
          token: token,
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => {
          onOpenChange()
        }}
        onApplicationUpdated={(updatedApplication) => {
          // Update the application in the list
          list.reload()
          setActiveApplication(updatedApplication)
        }}
      />
    </section>
  )
}
