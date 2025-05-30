<script setup lang="ts">
import { makeLogtoClient } from "../../utils/auth"
import { onMounted, ref } from "vue"
import type { IdTokenClaims } from "@logto/browser"
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue"
import type LogtoClient from "@logto/browser"

const logtoClient = ref<LogtoClient>()
const onSignIn = async () => {
  console.log(window.location.pathname)
  logtoClient.value?.signIn({
    redirectUri: import.meta.env.PUBLIC_LOGTO_CALLBACK_URL,
    postRedirectUri: window.location.pathname,
  })
}

const onGoToAccountManage = async () => {
  window.open("https://myid.app.nbtca.space/account/aboutme", "_blank")
}

const onSignOut = async () => {
  logtoClient.value?.signOut(import.meta.env.PUBLIC_LOGTO_REDIRECT_URL)
}

const isAuthenticated = ref<boolean>()
const userInfo = ref<IdTokenClaims>()
const initAuth = async () => {
  if (!logtoClient.value) {
    return
  }
  try {
    await Promise.all([
      (userInfo.value = await logtoClient.value.getIdTokenClaims()),
      (isAuthenticated.value = await logtoClient.value.isAuthenticated()),
    ])
  } catch (error) {
    isAuthenticated.value = false
  }
}
onMounted(() => {
  logtoClient.value = makeLogtoClient()
  initAuth()
})
</script>
<template>
  <div class="flex items-center justify-center">
    <div @click="onSignIn" v-if="isAuthenticated === false" class="">
      <a class="nav-item-content hover:text-[#2997ff] text-nowrap cursor-pointer">登入</a>
    </div>
    <div class="flex items-center" v-if="isAuthenticated">
      <Menu as="div" class="relative inline-block text-left">
        <div>
          <MenuButton class="flex items-center focus:outline-none">
            <div class="h-8 aspect-square rounded-full border border-gray-300 overflow-hidden">
              <img :src="userInfo.picture" alt="https://oss.nbtca.space/CA-logo.svg" class="w-full" />
            </div>
          </MenuButton>
        </div>

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <MenuItems
            class="absolute right-0 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
          >
            <div class="p-1">
              <MenuItem v-slot="{ active }">
                <button
                  @click="onGoToAccountManage"
                  class="text-nowrap items-center gap-1 group"
                  :class="[active ? 'bg-violet-500 text-white' : 'text-gray-900', 'flex w-full items-center rounded-md px-2 py-2 text-sm']"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-4 text-gray-500 group-hover:text-white"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                  账号管理
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
                <button
                  @click="onSignOut"
                  class="text-nowrap items-center gap-1 group"
                  :class="[active ? 'bg-violet-500 text-white' : 'text-gray-900', 'flex w-full items-center rounded-md px-2 py-2 text-sm']"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-4 text-gray-500 group-hover:text-white"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                    />
                  </svg>
                  登出
                </button>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>

    <!-- <div v-if="isAuthenticated" @click="onSignOut" class="px-2">Sign-Out</div> -->
  </div>
</template>
