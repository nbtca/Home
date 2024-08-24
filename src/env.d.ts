interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string
  readonly PUBLIC_LOGTO_CALLBACK_URL: string
  readonly PUBLIC_LOGTO_REDIRECT_URL: string
  readonly PUBLIC_LOGTO_APP_ID: string
  readonly PUBLIC_LOGTO_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
