import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Chip,
} from "@heroui/react"
import { useState } from "react"
import type { MemberApplication } from "../../../../types/member-application"
import { APPLICATION_STATUS_MAP, SECTIONS } from "../../../../types/member-application"
import {
  ApplicationActionApprove,
  ApplicationActionReject,
  getAvailableActions,
  type IdentityContext,
} from "./ApplicationActions"
import dayjs from "dayjs"

export const ApplicationStatusChip = (props: {
  status: string
  size?: "sm" | "md" | "lg"
}) => {
  const statusInfo = APPLICATION_STATUS_MAP[props.status] || {
    label: props.status,
    color: "default" as const,
  }

  return (
    <Chip color={statusInfo.color} size={props.size || "md"} variant="flat">
      {statusInfo.label}
    </Chip>
  )
}

type ApplicationDetailDrawerProps = {
  application: MemberApplication | null
  identity: IdentityContext
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onClose: () => void
  onApplicationUpdated: (application: MemberApplication) => void
}

export default function ApplicationDetailDrawer(props: ApplicationDetailDrawerProps) {
  const { application, identity, isOpen, onOpenChange, onClose } = props
  const [isLoading, setIsLoading] = useState("")

  if (!application) {
    return null
  }

  const availableActions = getAvailableActions(application)

  const onApplicationUpdated = (updatedApplication: MemberApplication) => {
    props.onApplicationUpdated(updatedApplication)
  }

  const getSectionLabel = (value: string) => {
    return SECTIONS.find(s => s.value === value)?.label || value
  }

  return (
    <Drawer isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <DrawerContent>
        <DrawerHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold">申请详情</h2>
          {isLoading && <span className="text-sm text-gray-500">{isLoading}</span>}
        </DrawerHeader>

        <DrawerBody className="px-4 sm:px-6">
          <div className="flex flex-col gap-6">
            {/* Status */}
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm text-gray-500">申请状态</p>
                <ApplicationStatusChip status={application.status} size="lg" />
              </div>
              <div>
                <p className="text-sm text-gray-500">申请ID</p>
                <p className="font-mono text-sm">{application.applicationId}</p>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">基本信息</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">学号</p>
                  <p className="font-medium">{application.memberId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">姓名</p>
                  <p className="font-medium">{application.name}</p>
                </div>
                {application.major && (
                  <div>
                    <p className="text-sm text-gray-500">专业</p>
                    <p className="font-medium">{application.major}</p>
                  </div>
                )}
                {application.class && (
                  <div>
                    <p className="text-sm text-gray-500">班级</p>
                    <p className="font-medium">{application.class}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">部门</p>
                  <p className="font-medium">{getSectionLabel(application.section)}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">联系方式</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">手机号</p>
                  <p className="font-medium">{application.phone}</p>
                </div>
                {application.qq && (
                  <div>
                    <p className="text-sm text-gray-500">QQ</p>
                    <p className="font-medium">{application.qq}</p>
                  </div>
                )}
                {application.email && (
                  <div>
                    <p className="text-sm text-gray-500">邮箱</p>
                    <p className="font-medium">{application.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Self Introduction */}
            {application.memo && (
              <div>
                <h3 className="text-lg font-semibold mb-3">自我介绍</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{application.memo}</p>
                </div>
              </div>
            )}

            {/* Review Information */}
            {(application.status === "approved" || application.status === "rejected") && (
              <div>
                <h3 className="text-lg font-semibold mb-3">审核信息</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {application.reviewedBy && (
                    <div>
                      <p className="text-sm text-gray-500">审核人</p>
                      <p className="font-medium">{application.reviewedBy}</p>
                    </div>
                  )}
                  {application.reviewedAt && (
                    <div>
                      <p className="text-sm text-gray-500">审核时间</p>
                      <p className="font-medium">
                        {dayjs(application.reviewedAt).format("YYYY-MM-DD HH:mm:ss")}
                      </p>
                    </div>
                  )}
                  {application.status === "rejected" && application.rejectReason && (
                    <div>
                      <p className="text-sm text-gray-500">拒绝原因</p>
                      <p className="font-medium">{application.rejectReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold mb-3">时间信息</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">申请时间</p>
                  <p className="font-medium">
                    {dayjs(application.gmtCreate).format("YYYY-MM-DD HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">最后更新</p>
                  <p className="font-medium">
                    {dayjs(application.gmtModified).format("YYYY-MM-DD HH:mm:ss")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {availableActions.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">操作</h3>
                <div className="flex flex-col gap-3">
                  {availableActions.map((ActionComponent, index) => (
                    <ActionComponent
                      key={index}
                      application={application}
                      identityContext={identity}
                      isLoading={isLoading}
                      onUpdated={onApplicationUpdated}
                      onLoading={(action) => {
                        setIsLoading(action || "")
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
