import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'

// Mock do router
const mockRouter = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LoginView },
    { path: '/contacts', component: { template: '<div>Contacts</div>' } },
  ],
})

describe('LoginView integration', () => {
  let wrapper: any
  let mockLocalStorage: any
  let mockWindowOpen: any
  let mockSetInterval: any
  let mockClearInterval: any
  let mockAddEventListener: any
  let mockRemoveEventListener: any

  beforeEach(() => {
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    mockWindowOpen = vi.fn()
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    })

    mockSetInterval = vi.fn()
    mockClearInterval = vi.fn()
    global.setInterval = mockSetInterval
    global.clearInterval = mockClearInterval

    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()

    Object.defineProperty(window, 'addEventListener', {
      value: mockAddEventListener,
      writable: true,
    })

    Object.defineProperty(window, 'removeEventListener', {
      value: mockRemoveEventListener,
      writable: true,
    })

    vi.spyOn(console, 'error').mockImplementation(() => {})

    global.URLSearchParams = vi.fn().mockImplementation((search) => ({
      get: vi.fn((key) => {
        if (search === '?user=%7B%22name%22%3A%22Test%22%7D' && key === 'user') {
          return '%7B%22name%22%3A%22Test%22%7D'
        }
        return null
      }),
      has: vi.fn((key) => {
        if (search === '?user=%7B%22name%22%3A%22Test%22%7D' && key === 'user') {
          return true
        }
        return false
      }),
    }))

    vi.spyOn(mockRouter, 'push').mockResolvedValue(undefined)
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  describe('Fluxo OAuth', () => {
    it('deve abrir popup ao clicar no botão', async () => {
      wrapper = mount(LoginView, {
        global: {
          plugins: [mockRouter],
        },
      })

      const button = wrapper.find('.login__button')
      await button.trigger('click')

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'http://localhost:8000/api/oauth/huggy/redirect',
        'Login com Huggy',
        'width=500,height=600,scrollbars=yes,resizable=yes',
      )
    })

    it('deve configurar event listener para mensagens', async () => {
      wrapper = mount(LoginView, {
        global: {
          plugins: [mockRouter],
        },
      })

      const button = wrapper.find('.login__button')
      await button.trigger('click')

      expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function), {
        once: true,
      })
    })

    it('deve configurar interval para verificar popup fechado', async () => {
      wrapper = mount(LoginView, {
        global: {
          plugins: [mockRouter],
        },
      })

      const button = wrapper.find('.login__button')
      await button.trigger('click')

      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 1000)
    })

    it('deve processar token recebido via postMessage', async () => {
      const mockPopup = { close: vi.fn(), closed: false }
      mockWindowOpen.mockReturnValue(mockPopup)

      wrapper = mount(LoginView, {
        global: {
          plugins: [mockRouter],
        },
      })

      const button = wrapper.find('.login__button')
      await button.trigger('click')

      // Simula recebimento de mensagem com token
      const messageHandler = mockAddEventListener.mock.calls[0][1]
      messageHandler({ data: { token: 'test-token-123' } })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', 'test-token-123')
      expect(mockPopup.close).toHaveBeenCalled()
      expect(mockRouter.push).toHaveBeenCalledWith('/contacts')
    })

    it('deve lidar com popup fechado pelo usuário', async () => {
      const mockPopup = { close: vi.fn(), closed: true }
      mockWindowOpen.mockReturnValue(mockPopup)

      wrapper = mount(LoginView, {
        global: {
          plugins: [mockRouter],
        },
      })

      const button = wrapper.find('.login__button')
      await button.trigger('click')

      const intervalCallback = mockSetInterval.mock.calls[0][0]
      intervalCallback()

      expect(mockClearInterval).toHaveBeenCalled()
      expect(mockRemoveEventListener).toHaveBeenCalledWith('message', expect.any(Function))
    })
  })
})
