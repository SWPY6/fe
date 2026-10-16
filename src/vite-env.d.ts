interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_MSW?: "true" | "false"
  readonly VITE_CAPTURE_SKELETONS?: "true" | "false"
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
