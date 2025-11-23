/**
 * Member Application Types
 * These types define the structure for the member onboarding process
 */

export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface MemberApplication {
  applicationId: string
  memberId: string
  name: string
  phone: string
  section: string
  qq?: string
  email?: string
  major?: string
  class?: string
  memo?: string

  status: ApplicationStatus

  // Approval info
  reviewedBy?: string
  reviewedAt?: string
  rejectReason?: string

  // Timestamps
  gmtCreate: string
  gmtModified: string
}

export interface CreateMemberApplicationRequest {
  memberId: string
  name: string
  phone: string
  section: string
  qq?: string
  email?: string
  major?: string
  class?: string
  memo?: string
}

export interface ApproveApplicationRequest {
  applicationId: string
}

export interface RejectApplicationRequest {
  applicationId: string
  reason?: string
}

export const SECTIONS = [
  { value: 'web', label: 'Web开发' },
  { value: 'design', label: '设计' },
  { value: 'algorithm', label: '算法' },
  { value: 'embedded', label: '嵌入式' },
  { value: 'operation', label: '运营' },
] as const

export const APPLICATION_STATUS_MAP = {
  pending: {
    label: '待审核',
    color: 'warning' as const,
  },
  approved: {
    label: '已通过',
    color: 'success' as const,
  },
  rejected: {
    label: '已拒绝',
    color: 'danger' as const,
  },
}
