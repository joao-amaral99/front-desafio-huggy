import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ContactDialog from '@/components/dialogs/ContactDialog.vue'

describe('ContactDialog integration', () => {
  let wrapper: any

  const mockContact = {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '55 119999-8888',
    mobile: '55 11987654321',
    address: 'Rua das Flores, 123',
    district: 'Centro',
    state: 'SP',
    city: 'São Paulo',
    initials: 'JS',
    photo: undefined,
  }

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Fluxo de Visualização', () => {
    it('deve exibir dados do contato corretamente', () => {
      wrapper = mount(ContactDialog, {
        props: {
          contact: mockContact,
          isOpen: true,
        },
      })

      expect(wrapper.find('.dialog__contact-name').text()).toBe('João Silva')
      expect(wrapper.text()).toContain('joao@email.com')
      expect(wrapper.text()).toContain('55 119999-8888')
      expect(wrapper.text()).toContain('Centro')
    })

    it('deve exibir iniciais quando não há foto', () => {
      wrapper = mount(ContactDialog, {
        props: {
          contact: mockContact,
          isOpen: true,
        },
      })

      expect(wrapper.find('.dialog__contact-initials').text()).toBe('JS')
      expect(wrapper.find('.dialog__contact-photo').exists()).toBe(false)
    })

    it('deve exibir foto quando disponível', () => {
      const contactWithPhoto = { ...mockContact, photo: 'https://example.com/photo.jpg' }

      wrapper = mount(ContactDialog, {
        props: {
          contact: contactWithPhoto,
          isOpen: true,
        },
      })

      expect(wrapper.find('.dialog__contact-photo').exists()).toBe(true)
      expect(wrapper.find('.dialog__contact-photo').attributes('src')).toBe(
        'https://example.com/photo.jpg',
      )
    })
  })

  describe('Fluxo de Ações', () => {
    it('deve emitir evento edit ao clicar em editar', async () => {
      wrapper = mount(ContactDialog, {
        props: {
          contact: mockContact,
          isOpen: true,
        },
      })

      await wrapper.find('button[aria-label="Editar contato"]').trigger('click')

      expect(wrapper.emitted('edit')).toBeTruthy()
      expect(wrapper.emitted('edit')[0][0]).toEqual(mockContact)
    })

    it('deve emitir evento delete ao clicar em excluir', async () => {
      wrapper = mount(ContactDialog, {
        props: {
          contact: mockContact,
          isOpen: true,
        },
      })

      await wrapper.find('button[aria-label="Excluir contato"]').trigger('click')

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')[0][0]).toEqual(mockContact)
    })

    it('deve fechar dialog', async () => {
      wrapper = mount(ContactDialog, {
        props: {
          contact: mockContact,
          isOpen: true,
        },
      })

      await wrapper.find('button[aria-label="Fechar"]').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('deve fechar ao clicar no overlay', async () => {
      wrapper = mount(ContactDialog, {
        props: {
          contact: mockContact,
          isOpen: true,
        },
      })

      await wrapper.find('.dialog-overlay').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
})
