import createClient from "openapi-fetch"
import type { paths as saturdayPaths } from "../types/saturday"
import type { paths as activePaths } from "../types/active"

export const saturdayClient = createClient<saturdayPaths>({
  baseUrl: "https://api.nbtca.space/v2/",
})
export const activeClient = createClient<activePaths>({
  baseUrl: "https://active.nbtca.space/",
})
