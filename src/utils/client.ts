import createClient from "openapi-fetch"
import type { paths as saturdayPaths } from "../types/saturday"
import { ApiClient } from "./active"

export const saturdayApiBaseUrl = import.meta.env.PROD ? "https://api.nbtca.space/v2" : "/saturday"

export const saturdayClient = createClient<saturdayPaths>({
  baseUrl: saturdayApiBaseUrl,
  querySerializer: {
    array: {
      style: "form",
      explode: false,
    },
  },
})

export const activeClient = new ApiClient({
  BASE: "https://active.nbtca.space",
})

export * from "./active/types.gen"
