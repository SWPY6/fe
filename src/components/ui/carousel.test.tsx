import { afterEach, describe, expect, test, vi } from "vitest"
import { cleanup, render } from "vitest-browser-react"
import { userEvent } from "vitest/browser"

import "../../index.css"
import { Carousel, type CarouselApi } from "./carousel"

afterEach(async () => {
  vi.useRealTimers()
  await cleanup()
})

describe("Carousel", () => {
  describe("세로 방향일 때", () => {
    test("아래쪽 방향키는 다음 장을, 위쪽 방향키는 이전 장을 보여준다", async () => {
      const slides = ["첫 번째", "두 번째"]
      let api: CarouselApi | undefined
      const screen = await render(
        <Carousel.Root
          orientation="vertical"
          setApi={(nextApi) => {
            api = nextApi
          }}
          style={{ width: 320, margin: 80 }}
        >
          <Carousel.Content style={{ height: 160 }}>
            {slides.map((slide) => (
              <Carousel.Item key={slide}>{slide}</Carousel.Item>
            ))}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
        </Carousel.Root>,
      )
      const previous = screen.getByRole("button", { name: "Previous slide" })
      const next = screen.getByRole("button", { name: "Next slide" })
      const selectedSlide = () => slides[api?.selectedScrollSnap() ?? -1]

      await expect.element(next).toBeEnabled()
      expect(selectedSlide()).toBe("첫 번째")

      next.element().focus()
      await userEvent.keyboard("{ArrowDown}")
      expect(selectedSlide()).toBe("두 번째")

      previous.element().focus()
      await userEvent.keyboard("{ArrowUp}")
      expect(selectedSlide()).toBe("첫 번째")
    })
  })

  describe("자동 전환이 켜져 있을 때", () => {
    test("이전·다음 버튼으로 이동할 때마다 자동 전환 간격을 다시 센다", async () => {
      const interval = 1000
      const slides = ["첫 번째", "두 번째", "세 번째"]
      let api: CarouselApi | undefined
      const screen = await render(
        <Carousel.Root
          autoplay={{ delay: interval }}
          setApi={(nextApi) => {
            api = nextApi
          }}
          style={{ width: 320, margin: 80 }}
        >
          <Carousel.Content>
            {slides.map((slide) => (
              <Carousel.Item key={slide}>{slide}</Carousel.Item>
            ))}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
        </Carousel.Root>,
      )
      const previous = screen.getByRole("button", { name: "Previous slide" })
      const next = screen.getByRole("button", { name: "Next slide" })
      const selectedSlide = () => slides[api?.selectedScrollSnap() ?? -1]
      await expect.element(next).toBeEnabled()

      const autoplay = api?.plugins().autoplay
      expect(autoplay).toBeDefined()
      autoplay?.stop()
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] })
      autoplay?.play()

      vi.advanceTimersByTime(interval - 1)
      await next.click()
      expect(selectedSlide()).toBe("두 번째")
      vi.advanceTimersByTime(1)
      expect(selectedSlide()).toBe("두 번째")
      vi.advanceTimersByTime(interval - 1)
      expect(selectedSlide()).toBe("세 번째")

      vi.advanceTimersByTime(interval - 1)
      await previous.click()
      expect(selectedSlide()).toBe("두 번째")
      vi.advanceTimersByTime(1)
      expect(selectedSlide()).toBe("두 번째")
      vi.advanceTimersByTime(interval - 1)
      expect(selectedSlide()).toBe("세 번째")
    })

    test("자동 전환을 멈춘 뒤 버튼으로 이동해도 다시 시작되지 않는다", async () => {
      const interval = 1000
      const slides = ["첫 번째", "두 번째", "세 번째"]
      let api: CarouselApi | undefined
      const screen = await render(
        <Carousel.Root
          autoplay={{ delay: interval }}
          setApi={(nextApi) => {
            api = nextApi
          }}
          style={{ width: 320, margin: 80 }}
        >
          <Carousel.Content>
            {slides.map((slide) => (
              <Carousel.Item key={slide}>{slide}</Carousel.Item>
            ))}
          </Carousel.Content>
          <Carousel.Previous />
          <Carousel.Next />
        </Carousel.Root>,
      )
      const next = screen.getByRole("button", { name: "Next slide" })
      const selectedSlide = () => slides[api?.selectedScrollSnap() ?? -1]
      await expect.element(next).toBeEnabled()

      const autoplay = api?.plugins().autoplay
      expect(autoplay).toBeDefined()
      autoplay?.stop()
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] })

      await next.click()
      expect(selectedSlide()).toBe("두 번째")
      vi.advanceTimersByTime(interval * 2)
      expect(selectedSlide()).toBe("두 번째")
    })
  })
})
