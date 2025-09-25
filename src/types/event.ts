import type { components } from "./saturday"

export interface Status {
  status: string
  text: string
  icon: string
}

export interface Action {
  action: string
  text: string
  icon: string
}

export enum EventStatus {
  open = "open",
  accepted = "accepted",
  committed = "committed",
  closed = "closed",
  cancelled = "cancelled",
}

export const UserEventStatus: Status[] = [
  {
    status: EventStatus.open,
    text: "待处理",
    icon: "status_initial.svg",
  },
  {
    status: EventStatus.accepted,
    text: "维修中",
    icon: "status_ongoing.svg",
  },
  {
    status: EventStatus.committed,
    text: "维修中",
    icon: "status_ongoing.svg",
  },
  {
    status: EventStatus.closed,
    text: "已完成",
    icon: "status_complete.svg",
  },
  {
    status: EventStatus.cancelled,
    text: "已取消",
    icon: "status_cancelled.svg",
  },
]

export enum EventAction {
  create = "create",
  accept = "accept",
  commit = "commit",
  close = "close",
  cancel = "cancel",
}

export const UserEventAction: Action[] = [
  {
    action: EventAction.create,
    text: "事件创建",
    icon: "event_create.svg",
  },
  {
    action: EventAction.accept,
    text: "维修开始",
    icon: "status_ongoing.svg",
  },
  {
    action: EventAction.close,
    text: "维修完成",
    icon: "status_complete.svg",
  },
  {
    action: EventAction.cancel,
    text: "事件取消",
    icon: "status_cancelled.svg",
  },
]

export type PublicEvent = components["schemas"]["PublicEvent"]
export type RepairEvent = components["schemas"]["Event"]
