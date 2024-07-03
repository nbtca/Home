import createClient from "openapi-fetch"
import type { paths } from "../types/saturday"

export const saturdayClient = createClient<paths>({
  baseUrl: "https://api.nbtca.space/v2/",
})
