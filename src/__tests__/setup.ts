import { expect, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"
import * as matchers from "@testing-library/jest-dom/matchers"
import "@testing-library/jest-dom"

expect.extend(matchers)

Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.resetAllMocks()
})

declare global {
  namespace jest {
    interface AsymmetricMatcher {
      [key: string]: any
    }

    interface Matchers<R = void, T = {}> {
      toBeInTheDocument(): R
      toBeVisible(): R
      toHaveTextContent(text: string | RegExp): R
      toHaveAttribute(attr: string, value?: string): R
    }

    interface Expect extends AsymmetricMatcher {
      <T = any>(actual: T): Matchers<void, T>
    }
  }
}
