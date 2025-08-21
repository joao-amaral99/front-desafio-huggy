import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/base/BaseButton.vue'

describe('BaseButton', () => {
  describe('Props', () => {
    it('deve exibir título personalizado', () => {
      const wrapper = mount(BaseButton, {
        props: { title: 'Salvar dados' },
      })

      expect(wrapper.find('.base-button__text').text()).toBe('Salvar dados')
      expect(wrapper.attributes('aria-label')).toBe('Salvar dados')
      wrapper.unmount()
    })

    it('deve usar título padrão quando não especificado', () => {
      const wrapper = mount(BaseButton)

      expect(wrapper.find('.base-button__text').text()).toBe('Adicionar contato')
      wrapper.unmount()
    })

    it('deve controlar estado disabled', () => {
      const enabled = mount(BaseButton, { props: { disabled: false } })
      const disabled = mount(BaseButton, { props: { disabled: true } })

      expect(enabled.attributes('disabled')).toBeUndefined()
      expect(disabled.attributes('disabled')).toBeDefined()

      enabled.unmount()
      disabled.unmount()
    })
  })

  describe('Variantes', () => {
    it('deve aplicar classes de variante corretamente', () => {
      const primary = mount(BaseButton, { props: { variant: 'primary' } })
      const secondary = mount(BaseButton, { props: { variant: 'secondary' } })

      expect(primary.classes()).toContain('base-button--primary')
      expect(secondary.classes()).toContain('base-button--secondary')

      primary.unmount()
      secondary.unmount()
    })
  })
})
