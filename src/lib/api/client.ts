import { createClient } from '@/lib/supabase/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
const DEV_X_API_KEY = process.env.NEXT_PUBLIC_FOODSENSE_DEV_X_API_KEY

export class APIClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async buildAuthHeaders(): Promise<Record<string, string>> {
    // 1) Supabase JWT (end-user) — 對應後端 Authorization: Bearer <jwt>
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (token) {
        return { Authorization: `Bearer ${token}` }
      }
    } catch {
      // fail-open：沒有 supabase env 或不是在瀏覽器環境時，不阻擋請求
    }

    // 2) Dev-only service API key（不要在 production 暴露）
    if (DEV_X_API_KEY) {
      return { 'x-api-key': DEV_X_API_KEY }
    }

    return {}
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // 若呼叫端已傳入 Authorization/x-api-key，則尊重呼叫端，不覆寫
    const providedHeaders = (options?.headers || {}) as Record<string, string>
    const hasAuthHeader =
      Object.keys(providedHeaders).some((k) => k.toLowerCase() === 'authorization') ||
      Object.keys(providedHeaders).some((k) => k.toLowerCase() === 'x-api-key')

    const authHeaders = hasAuthHeader ? {} : await this.buildAuthHeaders()

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const raw = await response.text()
      // 後端可能回 {"detail": "..."} 或 {"message": "..."} 或 {"error_code": "...", "message": "..."}
      try {
        const parsed = JSON.parse(raw)
        const msg =
          parsed?.message ||
          parsed?.detail ||
          (parsed?.error_code ? `${parsed.error_code}: ${parsed.message || ''}`.trim() : null)
        throw new Error(msg || raw || `API Error: ${response.status}`)
      } catch {
        throw new Error(raw || `API Error: ${response.status}`)
      }
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new APIClient()
