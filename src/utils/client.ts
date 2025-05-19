import createClient from "openapi-fetch"
import type { paths as saturdayPaths } from "../types/saturday"
import { ApiClient } from "./active"

export const saturdayClient = createClient<saturdayPaths>({
  baseUrl: import.meta.env.PROD ? "https://api.nbtca.space/v2/" : "/saturday",
})

export const activeClient = new ApiClient({
  BASE: "https://active.nbtca.space",
})

export * from "./active/types.gen"
