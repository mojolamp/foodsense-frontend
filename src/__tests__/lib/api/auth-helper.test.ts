import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, checkUserRole, requireAuth } from '@/lib/api/auth-helper'

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, init) => ({
        data,
        status: init?.status || 200,
        json: async () => data,
      })),
    },
  }
})

// Mock createClient
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('authenticateRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock chain
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('should return 401 when supabase client is undefined', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(undefined as unknown as ReturnType<typeof createClient>)

    const request = new NextRequest('http://localhost/api/test')
    const result = await authenticateRequest(request)

    expect(result.success).toBe(false)
    expect(result.response?.status).toBe(401)
  })

  it('should return 401 when getUser returns an error', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    })

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createClient>)

    const request = new NextRequest('http://localhost/api/test')
    const result = await authenticateRequest(request)

    expect(result.success).toBe(false)
    expect(result.response?.status).toBe(401)
  })

  it('should return 401 when user is null', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    })

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createClient>)

    const request = new NextRequest('http://localhost/api/test')
    const result = await authenticateRequest(request)

    expect(result.success).toBe(false)
    expect(result.response?.status).toBe(401)
  })

  it('should return success with user when authenticated', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
    } as unknown as ReturnType<typeof createClient>)

    const request = new NextRequest('http://localhost/api/test')
    const result = await authenticateRequest(request)

    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
  })

  it('should return 500 on unexpected error', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/test')
    const result = await authenticateRequest(request)

    expect(result.success).toBe(false)
    expect(result.response?.status).toBe(500)
  })
})

describe('checkUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('should return 500 when supabase client is undefined', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(undefined as unknown as ReturnType<typeof createClient>)

    const result = await checkUserRole({ id: 'user-123' }, ['admin'])

    expect(result.authorized).toBe(false)
    expect(result.response?.status).toBe(500)
  })

  it('should return 403 when user profile not found', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>)

    const result = await checkUserRole({ id: 'user-123' }, ['admin'])

    expect(result.authorized).toBe(false)
    expect(result.response?.status).toBe(403)
  })

  it('should return 403 when user role is not defined', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    mockSingle.mockResolvedValue({
      data: { profile_json: {} },
      error: null,
    })

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>)

    const result = await checkUserRole({ id: 'user-123' }, ['admin'])

    expect(result.authorized).toBe(false)
    expect(result.response?.status).toBe(403)
  })

  it('should return 403 when user role is not in allowed roles', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    mockSingle.mockResolvedValue({
      data: { profile_json: { role: 'viewer' } },
      error: null,
    })

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>)

    const result = await checkUserRole({ id: 'user-123' }, ['admin', 'super-admin'])

    expect(result.authorized).toBe(false)
    expect(result.userRole).toBe('viewer')
    expect(result.response?.status).toBe(403)
  })

  it('should return authorized when user has allowed role', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    mockSingle.mockResolvedValue({
      data: { profile_json: { role: 'admin' } },
      error: null,
    })

    vi.mocked(createClient).mockResolvedValue({
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>)

    const result = await checkUserRole({ id: 'user-123' }, ['admin', 'super-admin'])

    expect(result.authorized).toBe(true)
    expect(result.userRole).toBe('admin')
  })

  it('should return 500 on unexpected error', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockRejectedValue(new Error('Database error'))

    const result = await checkUserRole({ id: 'user-123' }, ['admin'])

    expect(result.authorized).toBe(false)
    expect(result.response?.status).toBe(500)
  })
})

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle })
  })

  it('should return success when user is authenticated and authorized', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const mockUser = { id: 'user-123', email: 'test@example.com' }

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSingle.mockResolvedValue({
      data: { profile_json: { role: 'admin' } },
      error: null,
    })

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>)

    const request = new NextRequest('http://localhost/api/test')
    const result = await requireAuth(request, ['admin'])

    expect(result.success).toBe(true)
    expect(result.user).toEqual(mockUser)
    expect(result.userRole).toBe('admin')
  })

  it('should return failure when authentication fails', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue(undefined as unknown as ReturnType<typeof createClient>)

    const request = new NextRequest('http://localhost/api/test')
    const result = await requireAuth(request, ['admin'])

    expect(result.success).toBe(false)
    expect(result.response?.status).toBe(401)
  })

  it('should return failure when authorization fails', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    const mockUser = { id: 'user-123', email: 'test@example.com' }

    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    mockSingle.mockResolvedValue({
      data: { profile_json: { role: 'viewer' } },
      error: null,
    })

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as unknown as ReturnType<typeof createClient>)

    const request = new NextRequest('http://localhost/api/test')
    const result = await requireAuth(request, ['admin', 'super-admin'])

    expect(result.success).toBe(false)
    expect(result.response?.status).toBe(403)
  })
})
