const API_BASE_URL = 'http://localhost:8000/api'

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

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorData

        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` }
        }

        const apiError = new Error(errorData.message || `HTTP error! status: ${response.status}`)
        ;(apiError as any).apiData = errorData
        ;(apiError as any).status = response.status
        throw apiError
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  async createContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    return this.request<Contact>('/contacts', {
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

    const response = await this.request<any>(endpoint)

    if (Array.isArray(response)) {
      return response
    }

    if (response.data && Array.isArray(response.data)) {
      return response.data
    }

    return []
  }

  async updateContact(id: number, contact: Partial<Contact>): Promise<Contact> {
    return this.request<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    })
  }

  async deleteContact(id: number): Promise<void> {
    return this.request<void>(`/contacts/${id}`, {
      method: 'DELETE',
    })
  }

  async makeCall(id: number): Promise<void> {
    return this.request<void>(`/contacts/${id}/call`, {
      method: 'POST',
    })
  }

  async getContactsByState(): Promise<{ label: string; value: number }[]> {
    const response = await this.request<any>('/reports/contacts-by-state')

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        label: item.state || 'Não informado',
        value: item.count || 0,
      }))
    }

    return []
  }

  async getContactsByCity(): Promise<{ label: string; value: number }[]> {
    const response = await this.request<any>('/reports/contacts-by-city')

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        label: item.city || item.state || 'Não informado',
        value: item.count || 0,
      }))
    }

    return []
  }
}

export const apiService = new ApiService()
export type { Contact }
