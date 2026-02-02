/**
 * Service Role Supabase Client Tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @supabase/supabase-js
const mockCreateClient = vi.fn().mockReturnValue({
  from: vi.fn(),
  auth: {
    signInWithPassword: vi.fn(),
  },
})

vi.mock('@supabase/supabase-js', () => ({
  createClient: (...args: unknown[]) => mockCreateClient(...args),
}))

describe('createServiceRoleClient', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    // 重設環境變數
    process.env = { ...originalEnv }
    // 重新載入模組以確保乾淨狀態
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('應該在缺少 NEXT_PUBLIC_SUPABASE_URL 時拋出錯誤', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    const { createServiceRoleClient } = await import('@/lib/supabase/service-role')

    expect(() => createServiceRoleClient()).toThrow('NEXT_PUBLIC_SUPABASE_URL is not set')
  })

  it('應該在缺少 SUPABASE_SERVICE_ROLE_KEY 時拋出錯誤', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    const { createServiceRoleClient } = await import('@/lib/supabase/service-role')

    expect(() => createServiceRoleClient()).toThrow('SUPABASE_SERVICE_ROLE_KEY is not set')
  })

  it('應該使用環境變數建立 client', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
    createServiceRoleClient()

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-service-role-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  })

  it('應該允許傳入自訂 service role key', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'env-service-role-key'

    const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
    createServiceRoleClient('custom-service-role-key')

    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'custom-service-role-key',
      expect.any(Object)
    )
  })

  it('應該回傳 Supabase client 實例', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
    const client = createServiceRoleClient()

    expect(client).toBeDefined()
    expect(client.from).toBeDefined()
    expect(client.auth).toBeDefined()
  })

  it('應該設定 auth 選項為不自動刷新和不持久化', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    const { createServiceRoleClient } = await import('@/lib/supabase/service-role')
    createServiceRoleClient()

    const callArgs = mockCreateClient.mock.calls[0]
    expect(callArgs[2]).toEqual({
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  })
})
