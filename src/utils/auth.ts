import LogtoClient from "@logto/browser"

let logtoClient: LogtoClient | undefined = undefined

export const makeLogtoClient = () => {
  if (logtoClient === undefined) {
    logtoClient = new LogtoClient({
      endpoint: import.meta.env.PUBLIC_LOGTO_ENDPOINT,
      appId: import.meta.env.PUBLIC_LOGTO_APP_ID,
      scopes: ["email", "custom_data", "roles"],
    })
  }
  return logtoClient
}
