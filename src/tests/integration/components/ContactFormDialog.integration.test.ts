import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ContactFormDialog from '@/components/dialogs/ContactFormDialog.vue'

vi.mock('maska', () => ({
  vMaska: {
    mounted: vi.fn(),
    updated: vi.fn(),
    unmounted: vi.fn(),
  },
}))

describe('ContactFormDialog integration', () => {
  let wrapper: any

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Fluxo de Criação de Contato', () => {
    it('deve criar contato com dados válidos', async () => {
      wrapper = mount(ContactFormDialog, {
        props: {
          isOpen: true,
          isEditing: false,
          contact: null,
        },
      })

      await wrapper.find('#name').setValue('João Silva')
      await wrapper.find('#email').setValue('joao@email.com')
      await wrapper.find('#phone').setValue('11999998888')
      await wrapper.find('#mobile').setValue('11987654321')

      await wrapper.find('.form-dialog__btn--save').trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0][0]).toMatchObject({
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '55 119999-9888',
        mobile: '55 1198765-4321',
      })
    })

    it('Não deve criar contato com dados inválidos', async () => {
      wrapper = mount(ContactFormDialog, {
        props: {
          isOpen: true,
          isEditing: false,
          contact: null,
        },
      })

      await wrapper.find('.form-dialog__btn--save').trigger('click')

      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })

  describe('Fluxo de Edição de Contato', () => {
    it('deve editar contato existente', async () => {
      const contactToEdit = {
        id: 1,
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '11888887777',
        mobile: '11999998888',
        address: 'Rua B, 456',
        district: 'Vila Nova',
        state: 'RJ',
      }

      wrapper = mount(ContactFormDialog, {
        props: {
          isOpen: true,
          isEditing: true,
          contact: contactToEdit,
        },
      })

      expect(wrapper.find('#name').element.value).toBe('Maria Santos')
      expect(wrapper.find('#email').element.value).toBe('maria@email.com')

      await wrapper.find('#name').setValue('Maria Silva')

      await wrapper.find('.form-dialog__btn--save').trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0][0].name).toBe('Maria Silva')
    })
  })

  describe('Fluxo de Cancelamento', () => {
    it('deve cancelar e fechar formulário', async () => {
      wrapper = mount(ContactFormDialog, {
        props: {
          isOpen: true,
          isEditing: false,
          contact: null,
        },
      })

      await wrapper.find('#name').setValue('Teste')

      await wrapper.find('button[type="button"]').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve fechar ao clicar no overlay', async () => {
      wrapper = mount(ContactFormDialog, {
        props: {
          isOpen: true,
          isEditing: false,
          contact: null,
        },
      })

      await wrapper.find('.form-overlay').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
})
