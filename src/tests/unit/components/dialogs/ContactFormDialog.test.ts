import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ContactFormDialog from '@/components/dialogs/ContactFormDialog.vue'

describe('ContactFormDialog', () => {
  describe('Props', () => {
    it('deve mostrar título correto baseado na prop isEditing', () => {
      const wrapperCreate = mount(ContactFormDialog, {
        props: { isOpen: true, isEditing: false, contact: null },
      })

      const wrapperEdit = mount(ContactFormDialog, {
        props: { isOpen: true, isEditing: true, contact: null },
      })

      expect(wrapperCreate.find('.form-dialog__title').text()).toBe('Adicionar novo contato')
      expect(wrapperEdit.find('.form-dialog__title').text()).toBe('Editar contato')

      wrapperCreate.unmount()
      wrapperEdit.unmount()
    })

    it('deve preencher campos quando contact prop é fornecida', async () => {
      const contact = {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '11999998888',
        mobile: '11987654321',
        address: 'Rua A, 123',
        district: 'Centro',
        state: 'SP',
      }

      const wrapper = mount(ContactFormDialog, {
        props: { isOpen: true, isEditing: true, contact },
      })

      await wrapper.vm.$nextTick()

      expect((wrapper.find('#name').element as HTMLInputElement).value).toBe(contact.name)
      expect((wrapper.find('#email').element as HTMLInputElement).value).toBe(contact.email)

      wrapper.unmount()
    })

    it('deve controlar visibilidade com prop isOpen', () => {
      const wrapperClosed = mount(ContactFormDialog, {
        props: { isOpen: false, isEditing: false, contact: null },
      })

      const wrapperOpen = mount(ContactFormDialog, {
        props: { isOpen: true, isEditing: false, contact: null },
      })

      expect(wrapperClosed.find('.form-overlay').exists()).toBe(false)
      expect(wrapperOpen.find('.form-overlay').exists()).toBe(true)

      wrapperClosed.unmount()
      wrapperOpen.unmount()
    })
  })

  describe('Loading State', () => {
    it('deve mostrar loader quando isLoading é true', () => {
      const wrapper = mount(ContactFormDialog, {
        props: { isOpen: true, isEditing: false, contact: null, isLoading: true },
      })

      expect(wrapper.findComponent({ name: 'Loader' }).exists()).toBe(true)
      expect(wrapper.find('.form-dialog__btn--save').attributes('disabled')).toBeDefined()

      wrapper.unmount()
    })
  })
})
