/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HANZO_IAM_URL?: string
  readonly VITE_IAM_CLIENT_ID?: string
  readonly VITE_HANZO_REDIRECT_URI?: string
  readonly VITE_HANZO_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
