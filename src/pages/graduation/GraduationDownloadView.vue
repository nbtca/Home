<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useGraduationIdURL } from "./graduation"

const id = ref<string>("")

type FileRecord = {
  id: string
  status: "processing" | "ready" | "not_found"
}

const fileStatus = ref<FileRecord | undefined>()
const getFileStatus = async (id: string): Promise<FileRecord> => {
  try {
    const res: FileRecord = await fetch(`https://api.nbtca.space/static/graduation/${id}/info.json`).then(res => res.json())
    return res
  } catch (error) {
    return { id, status: "not_found" }
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
      <div class="">
        <div v-if="id == undefined || fileStatus?.status == 'not_found'">
          <div class="text-md md:text-lg">我们没有找到相应的文件，请确认链接是否正确。</div>
        </div>
        <div v-else-if="fileStatus?.status == 'processing'">
          <div class="text-md md:text-lg">我们正在处理你的照片，这可能需要1-2天。请稍后再来试试。</div>
        </div>
        <div v-else-if="fileStatus?.status == 'ready'" class="h-40">
          <div class="text-md md:text-lg ">文件已经处理完成，你可以点击下方链接下载。</div>
          <div class="mt-6">
            <a
              :href="`https://api.nbtca.space/static/graduation/${id}/${id}.zip`"
              class="text-white hover:no-underline bg-blue-500 hover:bg-blue-600 p-1.5 px-2 rounded-full text-sm inline-flex items-center gap-1"
            >
              <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_2207_37351)">
                  <path
                    d="M13.9741 25.9204C20.5132 25.9204 25.9272 20.4947 25.9272 13.9673C25.9272 7.42822 20.5015 2.01416 13.9624 2.01416C7.43506 2.01416 2.021 7.42822 2.021 13.9673C2.021 20.4947 7.44678 25.9204 13.9741 25.9204ZM13.9741 23.9283C8.44288 23.9283 4.02491 19.4986 4.02491 13.9673C4.02491 8.43604 8.43116 4.00635 13.9624 4.00635C19.4937 4.00635 23.9351 8.43604 23.9351 13.9673C23.9351 19.4986 19.5054 23.9283 13.9741 23.9283Z"
                    fill="white"
                    fill-opacity="0.85"
                  />
                  <path
                    d="M13.9741 8.00244C13.4702 8.00244 13.0952 8.36572 13.0952 8.88135V14.7408L13.189 17.2134L12.0171 15.8072L10.6226 14.4009C10.4585 14.2369 10.2476 14.1431 10.0015 14.1431C9.52099 14.1431 9.15771 14.5064 9.15771 14.9869C9.15771 15.233 9.22802 15.4439 9.38037 15.5962L13.2944 19.4869C13.5288 19.7212 13.728 19.8267 13.9741 19.8267C14.2319 19.8267 14.4429 19.7095 14.6655 19.4869L18.5679 15.5962C18.7202 15.4439 18.814 15.233 18.814 14.9869C18.814 14.5064 18.439 14.1431 17.9585 14.1431C17.7007 14.1431 17.4898 14.2251 17.3374 14.4009L15.9546 15.8072L14.7593 17.2251L14.853 14.7408V8.88135C14.853 8.36572 14.4898 8.00244 13.9741 8.00244Z"
                    fill="white"
                    fill-opacity="0.85"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_2207_37351">
                    <rect width="23.9062" height="23.918" fill="white" transform="translate(2.021 2.01416)" />
                  </clipPath>
                </defs>
              </svg>
              下载文件
            </a>
          </div>
        </div>
      </div>
      <div class="mt-12">
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
