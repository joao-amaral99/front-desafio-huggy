import { apiService } from './api'

interface Contact {
  id?: number
  name: string
  email: string
  phone: string
  mobile: string
  address: string
  district: string
  city?: string
  state: string
  photo?: string
  initials?: string
}

class ContactService {
  async createContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    return apiService.request<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    })
  }

  async getContacts(params?: { search?: string; sort_order?: 'asc' | 'desc' }): Promise<Contact[]> {
    let endpoint = '/contacts'

    if (params) {
      const queryParams = new URLSearchParams()

      if (params.search) {
        queryParams.append('search', params.search)
      }

      if (params.sort_order) {
        queryParams.append('sort_order', params.sort_order)
      }

      if (queryParams.toString()) {
        endpoint += `?${queryParams.toString()}`
      }
    }

    const response = await apiService.request<any>(endpoint)

    if (Array.isArray(response)) {
      return response
    }

    if (response.data && Array.isArray(response.data)) {
      return response.data
    }

    return []
  }

  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact> {
    return apiService.request<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    })
  }

  async deleteContact(id: number): Promise<void> {
    return apiService.request<void>(`/contacts/${id}`, {
      method: 'DELETE',
    })
  }

  async makeCall(id: number): Promise<void> {
    return apiService.request<void>(`/contacts/${id}/call`, {
      method: 'POST',
    })
  }

  async getContactsByState(): Promise<{ label: string; value: number }[]> {
    const response = await apiService.request<any>('/reports/contacts-by-state')

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        label: item.state || 'Não informado',
        value: item.count || 0,
      }))
    }

    return []
  }

  async getContactsByCity(): Promise<{ label: string; value: number }[]> {
    const response = await apiService.request<any>('/reports/contacts-by-city')

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        label: item.city || item.state || 'Não informado',
        value: item.count || 0,
      }))
    }

    return []
  }
}

const contactService = new ContactService()

export { contactService, type Contact }
