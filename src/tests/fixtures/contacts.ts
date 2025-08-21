export const mockContact = {
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
}

export const mockContactWithPhoto = {
  ...mockContact,
  id: 2,
  name: 'Maria Santos',
  email: 'maria@email.com',
  photo: 'https://example.com/photo.jpg',
  initials: 'MS',
}

export const mockContacts = [
  mockContact,
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

export const mockApiErrorWithValidation = {
  apiData: {
    errors: {
      name: ['Campo obrigatório'],
      email: ['Email inválido'],
    },
  },
}

export const mockApiErrorWithStatus = (status: number) => ({ status })
