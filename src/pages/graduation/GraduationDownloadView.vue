<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useGraduationIdURL } from "./graduation"

const id = ref<string>("")

type FileRecord = {
  id: string
  status: "processing" | "done"
}

const fileStatus = ref<FileRecord | undefined>()
const getFileStatus = async (id: string): Promise<FileRecord> => {
  // TODO
  // return (await fetch(`http://localhost:3000/api/graduation/${id}`)) as any
  return {
    id: undefined,
    status: "processing",
  }
}
const setStatus = async () => {
  fileStatus.value = await getFileStatus(id.value)
}

const mailto = computed(() => {
  return `mailto:contact@nbtca.space?subject=%E6%AF%95%E4%B8%9A%E7%85%A7%E7%89%87${id.value}`
})

onMounted(() => {
  id.value = useGraduationIdURL().getId()
  setStatus()
})
</script>

<template>
  <div class="bg-[#f5f5f7] h-full flex-grow flex flex-col items-center min-h-[80vh]">
    <div
      class="text-3xl md:text-4xl font-bold h-[20vh] flex items-end bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500"
    >
      2024 毕业典礼拍摄
    </div>
    <div class="mt-6 min-w-40 w-3/4 text-center">
      <div class="h-24">
        <div v-if="id == undefined">
          <div class="text-md md:text-lg">我们没有找到相应的文件，请确认链接是否正确。</div>
        </div>
        <div v-else-if="fileStatus?.status == 'processing'">
          <div class="text-md md:text-lg">我们正在处理你的照片，这可能需要1-2天。请稍后再来试试。</div>
        </div>
        <div v-else-if="fileStatus?.status == 'done'">
          <div class="text-md md:text-lg">文件已经处理完成，你可以点击下方链接下载。</div>
          <div class="mt-4">
            <a :href="`http://localhost:3000/api/graduation/${id}?download=true`" class="text-blue-500 hover:underline">下载文件</a>
          </div>
        </div>
      </div>
      <div class="text-sm mt-12">
        <div>如果你有任何问题，可以通过邮件联系我们。</div>
        <div>
          <a :href="mailto" class="flex items-center gap-1 justify-center mt-1">
            <svg width="20" height="21" viewBox="0 0 29 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3.71533 20.2749H24.9848C27.0825 20.2749 28.3129 19.0562 28.3129 16.6421V3.70459C28.3129 1.29053 27.0708 0.0717773 24.6333 0.0717773H3.36376C1.26611 0.0717773 0.0356445 1.29053 0.0356445 3.70459V16.6421C0.0356445 19.0562 1.27783 20.2749 3.71533 20.2749ZM3.64502 18.482C2.48486 18.482 1.82861 17.8374 1.82861 16.6304V3.69287C1.82861 2.49756 2.48486 1.86475 3.64502 1.86475H24.6918C25.852 1.86475 26.52 2.49756 26.52 3.70459V16.6421C26.52 17.8374 25.852 18.482 24.6918 18.482H3.64502ZM14.1684 13.2554C14.9184 13.2554 15.645 12.9742 16.3129 12.3648L27.3403 2.43897L26.1215 1.2085L15.2934 10.9703C14.9301 11.2984 14.5551 11.4507 14.1684 11.4507C13.7817 11.4507 13.4067 11.2984 13.0434 10.9703L2.21533 1.2085L0.996583 2.43897L12.0239 12.3648C12.6918 12.9742 13.4184 13.2554 14.1684 13.2554ZM2.39111 18.7749L10.7114 10.4429L9.49267 9.22412L1.17236 17.5445L2.39111 18.7749ZM25.9692 18.7867L27.1879 17.5562L18.8559 9.22412L17.6254 10.4429L25.9692 18.7867Z"
                fill="#006ec8"
                fill-opacity="0.85"
              />
            </svg>
            contact@nbtca.space
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
