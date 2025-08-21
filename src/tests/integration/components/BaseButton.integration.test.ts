import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '@/components/base/BaseButton.vue'

describe('BaseButton integration', () => {
  let wrapper: any

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Interação', () => {
    it('deve permitir clique quando habilitado', async () => {
      wrapper = mount(BaseButton, {
        props: {
          title: 'Adicionar contato',
          disabled: false,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
    })

    it('Não deve permitir clique quando desabilitado', async () => {
      wrapper = mount(BaseButton, {
        props: {
          title: 'Botão desabilitado',
          disabled: true,
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeFalsy()
    })
  })

  describe('Variantes', () => {
    it('deve funcionar com variante primary', async () => {
      wrapper = mount(BaseButton, {
        props: {
          variant: 'primary',
          title: 'Primary Button',
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.classes()).toContain('base-button--primary')
    })

    it('deve funcionar com variante secondary', async () => {
      wrapper = mount(BaseButton, {
        props: {
          variant: 'secondary',
          title: 'Secondary Button',
        },
      })

      await wrapper.trigger('click')

      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.classes()).toContain('base-button--secondary')
    })
  })

  describe('Props', () => {
    it('deve atualizar título dinamicamente', async () => {
      wrapper = mount(BaseButton, {
        props: {
          title: 'Título inicial',
        },
      })

      expect(wrapper.find('.base-button__text').text()).toBe('Título inicial')

      await wrapper.setProps({ title: 'Novo título' })
      expect(wrapper.find('.base-button__text').text()).toBe('Novo título')
    })

    it('deve reagir a mudanças de estado disabled', async () => {
      wrapper = mount(BaseButton, {
        props: {
          disabled: false,
        },
      })

      expect(wrapper.attributes('disabled')).toBeUndefined()

      await wrapper.setProps({ disabled: true })
      expect(wrapper.attributes('disabled')).toBeDefined()
    })
  })
})
