<script setup lang="ts">
import QRCode from "qrcode"
import { v4 as uuid } from "uuid"
import { ref, onMounted, watch } from "vue"

const id = ref<string>()
const idStoreKey = "graduationId"
const setId = () => {
  id.value = uuid()
  localStorage.setItem(idStoreKey, id.value)
}

const url = ref<string>()
watch(id, async () => {
  url.value = await QRCode.toDataURL(`https://nbtca.space/graduation/download/${id.value}`)
})

onMounted(() => {
  const storedId = localStorage.getItem(idStoreKey)
  if (storedId) {
    id.value = storedId
  } else {
    setId()
  }
})

let clickCount: number = 0
let startTime: number | undefined = undefined
const onClickQRCode = () => {
  if (startTime === undefined) {
    startTime = Date.now()
  }

  clickCount++

  if (Date.now() - startTime <= 1000 && clickCount === 3) {
    setId()
    alert("ID 已经更新为 " + id.value)

    // Reset the click count and start time
    clickCount = 0
    startTime = undefined
  } else if (Date.now() - startTime > 1000) {
    // If more than 1 second has passed, reset the click count and start time
    clickCount = 0
    startTime = undefined
  }
}
</script>

<template>
  <div class="flex flex-col items-center min-w-[40vw]">
    <div class="min-h-64 h-[40vh] aspect-square">
      <img :src="url" class="h-full" alt="" @click="onClickQRCode" />
    </div>
    <div class="md:text-xl mt-4 font-bold">{{ id }}</div>
  </div>
</template>
