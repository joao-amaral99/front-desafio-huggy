import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'

describe('ConfirmDialog integration', () => {
  let wrapper: any

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Fluxo de Confirmação', () => {
    it('deve confirmar ação destrutiva', async () => {
      wrapper = mount(ConfirmDialog, {
        props: {
          title: 'Excluir contato',
          isOpen: true,
          isDestructive: true,
          confirmText: 'Excluir',
        },
      })

      await wrapper.find('.confirm-dialog__btn--destructive').trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('deve confirmar ação não destrutiva', async () => {
      wrapper = mount(ConfirmDialog, {
        props: {
          title: 'Salvar alterações',
          isOpen: true,
          isDestructive: false,
          confirmText: 'Salvar',
        },
      })

      await wrapper.find('.confirm-dialog__btn--confirm').trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })
  })

  describe('Fluxo de Cancelamento', () => {
    it('deve cancelar ação', async () => {
      wrapper = mount(ConfirmDialog, {
        props: {
          title: 'Excluir item',
          isOpen: true,
        },
      })

      await wrapper.find('.confirm-dialog__btn--cancel').trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('deve cancelar ao clicar no overlay', async () => {
      wrapper = mount(ConfirmDialog, {
        props: {
          title: 'Confirmar ação',
          isOpen: true,
        },
      })

      await wrapper.find('.confirm-overlay').trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('Estado de Loading', () => {
    it('deve desabilitar botões durante loading', () => {
      wrapper = mount(ConfirmDialog, {
        props: {
          title: 'Processando...',
          isOpen: true,
          isLoading: true,
        },
      })

      expect(wrapper.find('.confirm-dialog__btn--cancel').attributes('disabled')).toBeDefined()
      expect(wrapper.find('.confirm-dialog__btn--confirm').attributes('disabled')).toBeDefined()
    })

    it('deve mostrar loader quando necessário', () => {
      wrapper = mount(ConfirmDialog, {
        props: {
          title: 'Aguarde',
          isOpen: true,
          isLoading: true,
        },
      })

      expect(wrapper.findComponent({ name: 'Loader' }).exists()).toBe(true)
    })
  })
})
