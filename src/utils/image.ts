type Filename = string
type ImageType = "png" | "jpg" | "jpeg" | "gif" | "webp"
type Base64String = `data:image/${ImageType};base64,${string}`

import { readFile } from "fs/promises"
export const convertImageToBase64URL = async (filename: Filename, imageType: ImageType = "png"): Promise<Base64String> => {
  try {
    const buffer = await readFile(filename)
    const base64String = Buffer.from(buffer).toString("base64")
    // console.log(`base64String`, base64String.slice(0, 100));
    return `data:image/${imageType};base64,${base64String}`
  }
  catch (error) {
    throw new Error(`file ${filename} no exist ❌`)
  }
}
