import LogtoClient from "@logto/browser"

export const logtoClient = new LogtoClient({
  endpoint: import.meta.env.PUBLIC_LOGTO_ENDPOINT,
  appId: import.meta.env.PUBLIC_LOGTO_APP_ID,
})
