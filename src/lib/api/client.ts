import { createClient } from '@/lib/supabase/client'
import { API_BASES, type APIBase } from './baseUrls'

const DEV_X_API_KEY = process.env.NEXT_PUBLIC_FOODSENSE_DEV_X_API_KEY

// API 配置
const API_CONFIG = {
  timeout: 30000, // 30 秒超時
  maxRetries: 3,
  retryDelay: 1000, // 1 秒後重試
  retryStatusCodes: [408, 429, 500, 502, 503, 504], // 可重試的狀態碼
}

// API 錯誤類
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// 延遲函數
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class APIClient {
  private baseURL: string

  constructor(base: APIBase = 'V1') {
    this.baseURL = API_BASES[base]
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
    options?: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // 若呼叫端已傳入 Authorization/x-api-key，則尊重呼叫端，不覆寫
    const providedHeaders = (options?.headers || {}) as Record<string, string>
    const hasAuthHeader =
      Object.keys(providedHeaders).some((k) => k.toLowerCase() === 'authorization') ||
      Object.keys(providedHeaders).some((k) => k.toLowerCase() === 'x-api-key')

    const authHeaders = hasAuthHeader ? {} : await this.buildAuthHeaders()

    // 創建 AbortController 用於超時控制
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options?.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // 檢查是否應該重試
        if (
          retryCount < API_CONFIG.maxRetries &&
          API_CONFIG.retryStatusCodes.includes(response.status)
        ) {
          await delay(API_CONFIG.retryDelay * (retryCount + 1))
          return this.request<T>(endpoint, options, retryCount + 1)
        }

        const raw = await response.text()
        // 後端可能回 {"detail": "..."} 或 {"message": "..."} 或 {"error_code": "...", "message": "..."}
        try {
          const parsed = JSON.parse(raw) as { message?: string; detail?: string; error_code?: string }
          const msg =
            parsed?.message ||
            parsed?.detail ||
            (parsed?.error_code ? `${parsed.error_code}: ${parsed.message || ''}`.trim() : null)
          throw new APIError(msg || raw || `API Error: ${response.status}`, response.status)
        } catch (parseError) {
          if (parseError instanceof APIError) throw parseError
          throw new APIError(raw || `API Error: ${response.status}`, response.status)
        }
      }

      return response.json() as Promise<T>
    } catch (error) {
      clearTimeout(timeoutId)

      // 處理超時錯誤
      if (error instanceof Error && error.name === 'AbortError') {
        if (retryCount < API_CONFIG.maxRetries) {
          await delay(API_CONFIG.retryDelay * (retryCount + 1))
          return this.request<T>(endpoint, options, retryCount + 1)
        }
        throw new APIError('請求超時，請稍後再試', 408, 'TIMEOUT')
      }

      // 處理網路錯誤
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (retryCount < API_CONFIG.maxRetries) {
          await delay(API_CONFIG.retryDelay * (retryCount + 1))
          return this.request<T>(endpoint, options, retryCount + 1)
        }
        throw new APIError('網路連線失敗，請檢查網路狀態', 0, 'NETWORK_ERROR')
      }

      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint)
  }

  async post<T, D = unknown>(endpoint: string, data: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T, D = unknown>(endpoint: string, data: D): Promise<T> {
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

// Default clients for each API base
export const apiClient = new APIClient('V1') // Legacy Review Workbench
export const apiClientV2 = new APIClient('V2') // Products, Dictionary, Rules, Data Quality
export const apiClientLawCore = new APIClient('LAWCORE') // LawCore Presence Gate

// Backward compatibility: default export uses V1
export default apiClient
