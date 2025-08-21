const API_BASE_URL = 'http://localhost:8000/api'

class ApiService {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
}

export const apiService = new ApiService()
