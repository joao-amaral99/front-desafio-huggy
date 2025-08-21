import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock window.open para os testes de login
Object.defineProperty(window, 'open', {
  value: vi.fn(() => ({
    close: vi.fn(),
    closed: false,
  })),
})

// Mock addEventListener
Object.defineProperty(window, 'addEventListener', {
  value: vi.fn(),
})

Object.defineProperty(window, 'removeEventListener', {
  value: vi.fn(),
})

// Mock URLSearchParams
global.URLSearchParams = vi.fn(() => ({
  get: vi.fn(),
  has: vi.fn(),
})) as any

// Mock console methods para evitar logs durante os testes
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
