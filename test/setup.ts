import { afterEach, beforeEach, vi } from 'vitest'

const originalAnimateDescriptor =
  typeof globalThis.Element === 'undefined'
    ? undefined
    : Object.getOwnPropertyDescriptor(globalThis.Element.prototype, 'animate')

function createTestAnimation(): Animation {
  return {
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn()
  } as unknown as Animation
}

beforeEach(() => {
  const matchMedia = vi.fn((query: string): MediaQueryList => {
    return {
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn()
    }
  })

  vi.stubGlobal('matchMedia', matchMedia)

  // Happy DOM 20.14.0 reports Animation.cancel() as an unhandled AbortError.
  // Component tests only need the WAAPI control surface Orbo consumes, so use
  // a deterministic animation double and keep browser animation behavior out
  // of the simulated-DOM test boundary.
  if (typeof globalThis.Element !== 'undefined') {
    Object.defineProperty(globalThis.Element.prototype, 'animate', {
      configurable: true,
      value: vi.fn(() => createTestAnimation()),
      writable: true
    })
  }
})

afterEach(() => {
  if (typeof document !== 'undefined') {
    document.body.replaceChildren()
  }

  if (typeof globalThis.Element !== 'undefined') {
    if (originalAnimateDescriptor) {
      Object.defineProperty(globalThis.Element.prototype, 'animate', originalAnimateDescriptor)
    } else {
      Reflect.deleteProperty(globalThis.Element.prototype, 'animate')
    }
  }

  vi.unstubAllGlobals()
})
