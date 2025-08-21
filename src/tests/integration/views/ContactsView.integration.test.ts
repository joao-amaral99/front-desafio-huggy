import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ContactsView from '@/views/ContactsView.vue'
import { contactService } from '@/services/contactService'

// Mock do apiService
vi.mock('@/services/contactService', () => ({
  contactService: {
    getContacts: vi.fn(),
    createContact: vi.fn(),
    updateContact: vi.fn(),
    deleteContact: vi.fn(),
    getContactsByState: vi.fn(),
    getContactsByCity: vi.fn(),
  },
}))

// Mock do vue-toast-notification
vi.mock('vue-toast-notification', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}))

// Mock do Chart.js e vue-chartjs
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  ArcElement: {},
  Tooltip: {},
  Legend: {},
}))

vi.mock('vue-chartjs', () => ({
  Pie: {
    name: 'Pie',
    template: '<div class="chart-mock">Chart</div>',
  },
}))

vi.mock('@/utils/chartConfig', () => ({
  chartOptions: {},
  createChartData: vi.fn(() => ({ datasets: [], labels: [] })),
}))

const mockContacts = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '11999998888',
    mobile: '11987654321',
    address: 'Rua A, 123',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    initials: 'JS',
    photo: '',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '11888887777',
    mobile: '11876543210',
    address: 'Rua B, 456',
    district: 'Vila Nova',
    city: 'São Paulo',
    state: 'SP',
    initials: 'MS',
    photo: '',
  },
]

describe('ContactsView integration', () => {
  let wrapper: any
  let mockApiService: any

  beforeEach(async () => {
    mockApiService = contactService
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('Loading de Contatos', () => {
    it('deve carregar contatos na inicialização', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      expect(mockApiService.getContacts).toHaveBeenCalledWith({ sort_order: 'asc' })
    })

    it('deve processar contatos carregados', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      await wrapper.vm.loadContacts()

      expect(wrapper.vm.contacts).toHaveLength(2)
      expect(wrapper.vm.contacts[0].name).toBe('João Silva')
      expect(wrapper.vm.contacts[0].initials).toBe('JS')
    })
  })

  describe('Funcionalidade de Busca', () => {
    it('deve implementar debounce na busca', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      mockApiService.getContacts.mockClear()

      wrapper.vm.searchQuery = 'João Silva'
      wrapper.vm.debouncedSearch()

      vi.advanceTimersByTime(500)

      expect(mockApiService.getContacts).toHaveBeenCalledTimes(1)
      expect(mockApiService.getContacts).toHaveBeenCalledWith({
        search: 'João Silva',
        sort_order: 'asc',
      })
    })

    it('deve ignorar busca com string vazia', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      mockApiService.getContacts.mockClear()

      wrapper.vm.searchQuery = '   '
      wrapper.vm.debouncedSearch()
      vi.advanceTimersByTime(500)

      expect(mockApiService.getContacts).toHaveBeenCalledWith({ sort_order: 'asc' })
    })
  })

  describe('Funcionalidade de Ordenação', () => {
    it('deve alternar ordenação', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      mockApiService.getContacts.mockClear()

      wrapper.vm.toggleSortOrder()

      expect(wrapper.vm.sortOrder).toBe('desc')
      expect(mockApiService.getContacts).toHaveBeenCalledWith({ sort_order: 'desc' })
    })
  })

  describe('Gerenciamento de Estado dos Dialogs', () => {
    beforeEach(async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)
      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()
    })

    it('deve controlar abertura e fechamento do formulário de criação', () => {
      expect(wrapper.vm.showContactForm).toBe(false)

      wrapper.vm.openCreateForm()

      expect(wrapper.vm.showContactForm).toBe(true)
      expect(wrapper.vm.isEditingContact).toBe(false)
      expect(wrapper.vm.contactToEdit).toBeNull()

      wrapper.vm.closeContactForm()

      expect(wrapper.vm.showContactForm).toBe(false)
    })

    it('deve controlar abertura e fechamento do formulário de edição', () => {
      const contact = mockContacts[0]

      wrapper.vm.openEditForm(contact)

      expect(wrapper.vm.showContactForm).toBe(true)
      expect(wrapper.vm.isEditingContact).toBe(true)
      expect(wrapper.vm.contactToEdit).toEqual(contact)
    })

    it('deve controlar dialog de visualização de contato', () => {
      const contact = mockContacts[0]

      wrapper.vm.openContactDialog(contact)

      expect(wrapper.vm.isDialogOpen).toBe(true)
      expect(wrapper.vm.selectedContact).toEqual(contact)

      wrapper.vm.closeContactDialog()

      expect(wrapper.vm.isDialogOpen).toBe(false)
      expect(wrapper.vm.selectedContact).toBeNull()
    })

    it('deve controlar confirmação de exclusão', () => {
      const contact = mockContacts[0]

      wrapper.vm.openDeleteConfirm(contact)

      expect(wrapper.vm.showConfirmDelete).toBe(true)
      expect(wrapper.vm.contactToDelete).toEqual(contact)

      wrapper.vm.closeDeleteConfirm()

      expect(wrapper.vm.showConfirmDelete).toBe(false)
      expect(wrapper.vm.contactToDelete).toBeNull()
    })
  })

  describe('Fluxos de CRUD de Contatos', () => {
    beforeEach(async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)
      mockApiService.createContact.mockResolvedValue({ id: 3 })
      mockApiService.updateContact.mockResolvedValue({})
      mockApiService.deleteContact.mockResolvedValue({})

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()
    })

    it('deve processar salvamento de novo contato', async () => {
      const newContact = { name: 'Novo Contato', email: 'novo@email.com' }

      wrapper.vm.openCreateForm()
      await wrapper.vm.saveContact(newContact)

      expect(mockApiService.createContact).toHaveBeenCalledWith(newContact)
      expect(wrapper.vm.showContactForm).toBe(false)
    })

    it('deve processar atualização de contato existente', async () => {
      const contact = mockContacts[0]
      const updatedContact = { ...contact, name: 'João Editado' }

      wrapper.vm.openEditForm(contact)
      await wrapper.vm.saveContact(updatedContact)

      expect(mockApiService.updateContact).toHaveBeenCalledWith(contact.id, updatedContact)
      expect(wrapper.vm.showContactForm).toBe(false)
    })

    it('deve processar exclusão de contato', async () => {
      const contact = mockContacts[0]

      wrapper.vm.openDeleteConfirm(contact)
      await wrapper.vm.confirmDelete()

      expect(mockApiService.deleteContact).toHaveBeenCalledWith(contact.id)
      expect(wrapper.vm.showConfirmDelete).toBe(false)
    })
  })

  describe('Estados da Interface', () => {
    it('deve reconhecer estado vazio', async () => {
      mockApiService.getContacts.mockResolvedValue([])

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.isEmpty).toBe(true)
    })

    it('deve controlar estado de relatórios', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)
      mockApiService.getContactsByState.mockResolvedValue([{ label: 'SP', value: 2 }])
      mockApiService.getContactsByCity.mockResolvedValue([{ label: 'São Paulo', value: 2 }])

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.showReports).toBe(false)

      await wrapper.vm.toggleReports()

      expect(wrapper.vm.showReports).toBe(true)
      expect(mockApiService.getContactsByState).toHaveBeenCalled()
      expect(mockApiService.getContactsByCity).toHaveBeenCalled()

      wrapper.vm.goBackToContacts()

      expect(wrapper.vm.showReports).toBe(false)
    })
  })

  describe('Utilitários', () => {
    it('deve gerar iniciais corretamente', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.generateInitials('João Silva')).toBe('JS')
      expect(wrapper.vm.generateInitials('Maria Santos Oliveira')).toBe('MS')
      expect(wrapper.vm.generateInitials('Ana')).toBe('A')
    })

    it('deve processar mensagens de erro da API', async () => {
      mockApiService.getContacts.mockResolvedValue(mockContacts)

      wrapper = mount(ContactsView)
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.getErrorMessage({ status: 422 })).toBe(
        'Dados inválidos. Verifique os campos obrigatórios.',
      )
      expect(wrapper.vm.getErrorMessage({ status: 500 })).toBe(
        'Erro interno do servidor. Tente novamente mais tarde.',
      )

      const errorWithApiData = {
        apiData: {
          errors: {
            name: ['Campo obrigatório'],
            email: ['Email inválido'],
          },
        },
      }
      expect(wrapper.vm.getErrorMessage(errorWithApiData)).toBe('Campo obrigatório. Email inválido')
    })
  })
})
