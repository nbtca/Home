import type { UserInfoResponse } from "@logto/browser"
import type { PublicMember } from "../../../../store/member"
import type { MemberApplication } from "../../../../types/member-application"
import { saturdayClient, activeClient } from "../../../../utils/client"
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from "@heroui/react"
import { useState } from "react"

export type IdentityContext = {
  member: PublicMember
  userInfo: UserInfoResponse
  token: string
}

export type ApplicationActionProps = {
  application: MemberApplication
  identityContext: IdentityContext
  isLoading?: string
  onUpdated: (application: MemberApplication) => void
  onLoading: (loadingAction?: string) => void
}

// Approve Application Action
export const ApplicationActionApprove = (props: ApplicationActionProps) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()

  const handleApprove = async () => {
    props.onLoading("approve")
    try {
      // TODO: Replace with actual API endpoint when backend is ready
      // Step 1: Create the member in Saturday API
      const { data: member } = await saturdayClient.POST("/members/{MemberId}", {
        params: {
          header: {
            Authorization: `Bearer ${props.identityContext.token}`,
          },
          path: {
            MemberId: props.application.memberId,
          },
        },
        body: {
          memberId: props.application.memberId,
          name: props.application.name,
          phone: props.application.phone,
          section: props.application.section,
          qq: props.application.qq || "",
          email: props.application.email || "",
          alias: "", // Will be set later by member
          avatar: "", // Will be set later by member
          profile: props.application.memo || "",
          role: "member",
          logtoId: "", // Will be set when member activates
          createdBy: props.identityContext.member.memberId,
        },
      })

      // Step 2: Update application status to approved
      const updatedApplication = await activeClient.memberApplication.patchMemberApplicationApprove({
        applicationId: props.application.applicationId,
        requestBody: {
          reviewedBy: props.identityContext.member.memberId,
        },
      })

      props.onLoading()
      props.onUpdated(updatedApplication.result)
      onClose()
    } catch (error) {
      console.error("Error approving application:", error)
      props.onLoading()
      alert("审批失败，请重试")
    }
  }

  return (
    <>
      <Button
        color="success"
        variant="flat"
        onPress={onOpen}
        isLoading={props.isLoading === "approve"}
        fullWidth
      >
        通过
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <h2>确认通过申请</h2>
          </ModalHeader>
          <ModalBody>
            <p>
              确认通过 <strong>{props.application.name}</strong>（学号：{props.application.memberId}）的入社申请吗？
            </p>
            <p className="text-sm text-gray-500 mt-2">
              通过后将自动创建成员账号，申请人将成为正式成员。
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="success"
              onPress={handleApprove}
              isLoading={props.isLoading === "approve"}
            >
              确认通过
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

// Reject Application Action
export const ApplicationActionReject = (props: ApplicationActionProps) => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure()
  const [rejectReason, setRejectReason] = useState("")

  const handleReject = async () => {
    props.onLoading("reject")
    try {
      // TODO: Replace with actual API endpoint when backend is ready
      const updatedApplication = await activeClient.memberApplication.patchMemberApplicationReject({
        applicationId: props.application.applicationId,
        requestBody: {
          reason: rejectReason,
          reviewedBy: props.identityContext.member.memberId,
        },
      })

      props.onLoading()
      props.onUpdated(updatedApplication.result)
      onClose()
      setRejectReason("")
    } catch (error) {
      console.error("Error rejecting application:", error)
      props.onLoading()
      alert("拒绝失败，请重试")
    }
  }

  return (
    <>
      <Button
        color="danger"
        variant="flat"
        onPress={onOpen}
        isLoading={props.isLoading === "reject"}
        fullWidth
      >
        拒绝
      </Button>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <h2>确认拒绝申请</h2>
          </ModalHeader>
          <ModalBody>
            <p className="mb-4">
              确认拒绝 <strong>{props.application.name}</strong>（学号：{props.application.memberId}）的入社申请吗？
            </p>
            <Textarea
              label="拒绝原因（可选）"
              placeholder="请输入拒绝原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              minRows={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleReject}
              isLoading={props.isLoading === "reject"}
            >
              确认拒绝
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

// Get available actions based on application status
export const getAvailableActions = (
  application: MemberApplication,
): Array<typeof ApplicationActionApprove | typeof ApplicationActionReject> => {
  const actions: Array<typeof ApplicationActionApprove | typeof ApplicationActionReject> = []

  if (application.status === "pending") {
    actions.push(ApplicationActionApprove)
    actions.push(ApplicationActionReject)
  }

  return actions
}
