import createClient from "openapi-fetch"
import type { paths as saturdayPaths } from "../types/saturday"
// import type { paths as activePaths } from "../types/active"
import { ApiClient } from "./active"
export const saturdayClient = createClient<saturdayPaths>({
  baseUrl: "https://api.nbtca.space/v2/",
})
// export const activeClient = createClient<activePaths>({
//   baseUrl: "https://active.nbtca.space/",
// })
export const activeClient = new ApiClient({
  BASE: "https://active.nbtca.space",
  // BASE: "/active",
})
export * from "./active/types.gen"
