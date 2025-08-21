import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Loader from '@/components/ui/Loader.vue'

describe('Loader', () => {
  describe('Renderização', () => {
    it('deve renderizar corretamente', () => {
      const wrapper = mount(Loader)

      expect(wrapper.find('.loader').exists()).toBe(true)
    })
  })
})
