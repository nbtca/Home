import { useRef, useState } from "react"
import { Button } from "@heroui/react"
import type { components } from "../../types/saturday"
import { saturdayClient } from "../../utils/client"
import { makeLogtoClient } from "../../utils/auth"

type Event = components["schemas"]["Event"]
type EventPhoto = components["schemas"]["EventPhoto"]

const reasons: Record<string, string> = {
  "only the assigned member or an admin can add photos": "只有接单成员或管理员可以添加照片",
  "photos can only be added to accepted or committed events": "工单当前的状态不能再添加照片",
  "an event can have at most 20 photos": "每单最多 20 张照片",
}

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>(resolve => canvas.toBlob(resolve, type, quality))
  const webp = await encode("image/webp", 0.8)
  if (webp?.type === "image/webp") return webp
  const jpeg = await encode("image/jpeg", 0.85)
  if (!jpeg) throw new Error("encode failed")
  return jpeg
}

export default function EventPhotos(props: {
  photos: EventPhoto[]
  eventId: number
  canUpload: boolean
  onUploaded: (event: Event) => void
  onExpired: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const refreshed = useRef(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const upload = async (files: FileList) => {
    setError("")
    if (props.photos.length + files.length > 20) {
      setError("每单最多 20 张照片")
      if (input.current) input.current.value = ""
      return
    }
    setUploading(true)
    try {
      const blobs: Blob[] = []
      try {
        for (const file of files) blobs.push(await compress(file))
      }
      catch {
        setError("有照片无法读取，请换一张再试")
        return
      }
      const { data, error, response } = await saturdayClient.POST("/member/events/{EventId}/photos", {
        params: {
          path: { EventId: props.eventId },
          header: { Authorization: `Bearer ${await makeLogtoClient().getAccessToken()}` },
        },
        body: { photos: [] },
        bodySerializer: () => {
          const form = new FormData()
          blobs.forEach((blob, i) => form.append("photos", blob, `${i}.${blob.type === "image/webp" ? "webp" : "jpg"}`))
          return form
        },
      })
      if (data) props.onUploaded(data)
      else if (response.status === 422) setError(`上传失败：${reasons[error?.detail ?? ""] ?? "照片没有通过检查，请换一张再试"}`)
      else setError("上传失败，请稍后再试")
    }
    catch {
      setError("网络异常，上传失败，请稍后再试")
    }
    finally {
      setUploading(false)
      if (input.current) input.current.value = ""
    }
  }

  return (
    <div className="bg-gray-100 rounded-xl text-sm px-3 py-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">现场照片</span>
        {props.canUpload && (
          <>
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={e => e.target.files?.length && upload(e.target.files)}
            />
            <Button size="sm" variant="flat" isLoading={uploading} onPress={() => input.current?.click()}>
              添加照片
            </Button>
          </>
        )}
      </div>
      {props.photos.length
        ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {props.photos.map(photo => (
                <a key={photo.photoId} href={photo.url} target="_blank" rel="noreferrer">
                  <img
                    src={photo.url}
                    alt="现场照片"
                    loading="lazy"
                    className="aspect-square w-full object-cover rounded-lg"
                    onError={() => {
                      if (refreshed.current) return
                      refreshed.current = true
                      props.onExpired()
                    }}
                  />
                </a>
              ))}
            </div>
          )
        : <p className="text-gray-500">还没有照片</p>}
      {error && <p className="text-danger mt-2">{error}</p>}
    </div>
  )
}
