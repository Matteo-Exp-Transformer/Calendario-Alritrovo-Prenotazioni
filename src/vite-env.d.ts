/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_ENV: string
  readonly VITE_RESTAURANT_NAME: string
  readonly VITE_RESTAURANT_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
