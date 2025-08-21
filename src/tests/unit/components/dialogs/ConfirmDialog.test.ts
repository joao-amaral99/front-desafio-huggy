import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '@/components/dialogs/ConfirmDialog.vue'

describe('ConfirmDialog', () => {
  describe('Props', () => {
    it('deve exibir título personalizado', () => {
      const wrapper = mount(ConfirmDialog, {
        props: { title: 'Confirmar exclusão', isOpen: true },
      })

      expect(wrapper.find('.confirm-dialog__title').text()).toBe('Confirmar exclusão')
      wrapper.unmount()
    })

    it('deve usar textos personalizados para botões', () => {
      const wrapper = mount(ConfirmDialog, {
        props: {
          title: 'Teste',
          isOpen: true,
          confirmText: 'Sim',
          cancelText: 'Não',
          isDestructive: false,
        },
      })

      expect(wrapper.find('.confirm-dialog__btn--cancel').text()).toBe('Não')
      expect(wrapper.find('.confirm-dialog__btn--confirm').text()).toBe('Sim')
      wrapper.unmount()
    })

    it('deve controlar visibilidade com prop isOpen', () => {
      const wrapperClosed = mount(ConfirmDialog, {
        props: { title: 'Teste', isOpen: false },
      })

      const wrapperOpen = mount(ConfirmDialog, {
        props: { title: 'Teste', isOpen: true },
      })

      expect(wrapperClosed.find('.confirm-overlay').exists()).toBe(false)
      expect(wrapperOpen.find('.confirm-overlay').exists()).toBe(true)

      wrapperClosed.unmount()
      wrapperOpen.unmount()
    })
  })

  describe('Variantes', () => {
    it('deve alternar entre botão destrutivo e normal baseado na prop', () => {
      const destructive = mount(ConfirmDialog, {
        props: { title: 'Excluir', isOpen: true, isDestructive: true },
      })

      const normal = mount(ConfirmDialog, {
        props: { title: 'Salvar', isOpen: true, isDestructive: false },
      })

      expect(destructive.find('.confirm-dialog__btn--destructive').exists()).toBe(true)
      expect(destructive.find('.confirm-dialog__btn--confirm').exists()).toBe(false)

      expect(normal.find('.confirm-dialog__btn--confirm').exists()).toBe(true)
      expect(normal.find('.confirm-dialog__btn--destructive').exists()).toBe(false)

      destructive.unmount()
      normal.unmount()
    })
  })
})
