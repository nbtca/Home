<script setup lang="ts">
import { onMounted, ref } from "vue"

const id = ref<string>()

type FileRecord = {
  id: string
  status: "processing" | "done"
}

const fileStatus = ref<FileRecord | undefined>()
const getFileStatus = async (id: string): Promise<FileRecord> => {
  // TODO
  // return (await fetch(`http://localhost:3000/api/graduation/${id}`)) as any
  return {
    id,
    status: "done",
  }
}
const setStatus = async () => {
  fileStatus.value = await getFileStatus(id.value)
}

onMounted(() => {
  id.value = new URLSearchParams(window.location.search).get("id")
  setStatus()
})
</script>

<template>
  <div class="bg-[#f5f5f7] h-full flex-grow flex flex-col items-center min-h-[70vh]">
    <div
      class="text-3xl md:text-4xl font-bold h-[20vh] flex items-end bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500"
    >
      2024 毕业典礼拍摄
    </div>
    <div class="mt-8 min-w-40 w-3/4 text-center">
      <div v-if="id == undefined">
        <div class="text-md md:text-lg">我们没有找到相应的文件，请确认链接是否正确。</div>
      </div>
      <div v-else-if="fileStatus?.status == 'processing'">
        <div class="text-md md:text-lg">文件正在处理中，请稍后刷新页面。</div>
      </div>
      <div v-else-if="fileStatus?.status == 'done'">
        <div class="text-md md:text-lg">文件已经处理完成，你可以点击下方链接下载。</div>
        <div class="mt-4">
          <a :href="`http://localhost:3000/api/graduation/${id}?download=true`" class="text-blue-500 hover:underline">下载文件</a>
        </div>
      </div>
    </div>
  </div>
</template>
