import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { HomePage } from "../components/HomePage"

describe("HomePage", () => {
  it("renders the team starter heading", () => {
    render(<HomePage />)

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "같은 도구, 같은 검사, 같은 개발 경험.",
    )
  })
})
