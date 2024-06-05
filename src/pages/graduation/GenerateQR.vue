<script setup lang="ts">
import QRCode from "qrcode"
import { v4 as uuid } from "uuid"
import { ref, onMounted, watch } from "vue"
import { useGraduationIdURL } from "./graduation"

const id = ref<string>()
const idStoreKey = "graduationId"
const setId = () => {
  id.value = uuid()
  localStorage.setItem(idStoreKey, id.value)
}

const svg = ref()
watch(id, async () => {
  if (!id.value) {
    return
  }
  svg.value = await QRCode.toString(useGraduationIdURL().constructURL(id.value))
})

onMounted(() => {
  const storedId = localStorage.getItem(idStoreKey)
  if (storedId) {
    id.value = storedId
  } else {
    setId()
  }
})

const useTimedCounter = () => {
  const count = ref(0)
  const startTime = ref<number>()

  const add = () => {
    if (startTime.value === undefined) {
      startTime.value = Date.now()
    }

    count.value++
    if (Date.now() - startTime.value > 1000) {
      // If more than 1 second has passed, reset the click count and start time
      count.value = 0
      startTime.value = undefined
    }
  }

  const reset = () => {
    count.value = 0
    startTime.value = undefined
  }

  return {
    count,
    add,
    reset,
  }
}
const { count, add, reset } = useTimedCounter()
const onClickQRCode = () => {
  add()
  if (count.value === 3) {
    setId()
    alert("ID 已经更新为 " + id.value)
    reset()
  }
}
</script>

<template>
  <div class="flex flex-col items-center" @click="onClickQRCode">
    <div class="min-h-64 h-[40vh] aspect-square">
      <div class="h-full" v-if="svg" v-html="svg"></div>
    </div>
    <div class="text-base sm:text-lg md:text-2xl mt-4 font-bold">{{ id }}</div>
  </div>
</template>
