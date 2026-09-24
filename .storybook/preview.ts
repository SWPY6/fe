import type { Preview } from "@storybook/tanstack-react"
import { MINIMAL_VIEWPORTS } from "storybook/viewport"
import "../src/index.css"

const preview: Preview = {
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    viewport: { options: MINIMAL_VIEWPORTS },
  },
}

export default preview
