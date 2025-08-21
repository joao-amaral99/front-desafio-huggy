import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '@/components/forms/SearchBar.vue'

describe('SearchBar integration', () => {
  let wrapper: any

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Fluxo de Busca', () => {
    it('deve emitir evento ao digitar', async () => {
      wrapper = mount(SearchBar, {
        props: {
          modelValue: '',
          placeholder: 'Buscar contatos...',
        },
      })

      const input = wrapper.find('.search-bar__input')
      await input.setValue('João Silva')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('João Silva')
    })

    it('deve funcionar com v-model', async () => {
      wrapper = mount(SearchBar, {
        props: {
          modelValue: 'Valor inicial',
        },
      })

      const input = wrapper.find('.search-bar__input')

      // Verifica valor inicial
      expect(input.element.value).toBe('Valor inicial')

      // Testa mudança via prop
      await wrapper.setProps({ modelValue: 'Novo valor' })
      expect(input.element.value).toBe('Novo valor')

      // Testa mudança via input
      await input.setValue('Valor digitado')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    })
  })

  describe('Placeholder Dinâmico', () => {
    it('deve atualizar placeholder dinamicamente', async () => {
      wrapper = mount(SearchBar, {
        props: {
          placeholder: 'Placeholder inicial',
        },
      })

      const input = wrapper.find('.search-bar__input')
      expect(input.attributes('placeholder')).toBe('Placeholder inicial')

      await wrapper.setProps({ placeholder: 'Novo placeholder' })
      expect(input.attributes('placeholder')).toBe('Novo placeholder')
    })
  })

  describe('Casos de Uso', () => {
    it('deve lidar com caracteres especiais', async () => {
      wrapper = mount(SearchBar)

      const input = wrapper.find('.search-bar__input')
      await input.setValue('João & Maria - 123@email.com')

      expect(wrapper.emitted('update:modelValue')[0][0]).toBe('João & Maria - 123@email.com')
    })

    it('deve limpar busca', async () => {
      wrapper = mount(SearchBar, {
        props: {
          modelValue: 'Texto para limpar',
        },
      })

      const input = wrapper.find('.search-bar__input')
      expect(input.element.value).toBe('Texto para limpar')

      await wrapper.setProps({ modelValue: '' })
      expect(input.element.value).toBe('')
    })
  })
})
