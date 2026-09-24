import type { StorybookConfig } from "@storybook/tanstack-react"

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  framework: "@storybook/tanstack-react",
  staticDirs: ["../public"],
  core: { disableTelemetry: true },
}

export default config
