import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'
import type { User } from 'firebase/auth'

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(() => ({})) // Add missing getAuth mock
}))

// Mock auth utils
vi.mock('../../utils/auth', () => ({
  formatAuthUser: vi.fn()
}))

// Mock Firebase auth instance
vi.mock('../../firebase/auth', () => ({
  auth: {}
}))

import { onAuthStateChanged } from 'firebase/auth'
import { formatAuthUser } from '../../utils/auth'

describe('useAuth', () => {
  let mockUnsubscribe: ReturnType<typeof vi.fn>
  let mockOnAuthStateChanged: ReturnType<typeof vi.mocked>

  beforeEach(() => {
    mockUnsubscribe = vi.fn()
    mockOnAuthStateChanged = vi.mocked(onAuthStateChanged)
    vi.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isGuest).toBe(false)
  })

  it('should update state when user signs in', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' } as User
    const mockFormattedUser = { uid: '123', email: 'test@example.com', displayName: null, photoURL: null }

    let authStateCallback: (user: User | null) => void

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback
      return mockUnsubscribe
    })

    vi.mocked(formatAuthUser).mockReturnValue(mockFormattedUser)

    const { result } = renderHook(() => useAuth())

    // Simulate user signing in
    authStateCallback!(mockUser)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toEqual(mockFormattedUser)
      expect(result.current.error).toBeNull()
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isGuest).toBe(false)
    })
  })

  it('should update state when user signs out', async () => {
    let authStateCallback: (user: User | null) => void

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback
      return mockUnsubscribe
    })

    vi.mocked(formatAuthUser).mockReturnValue(null)

    const { result } = renderHook(() => useAuth())

    // Simulate user signing out
    authStateCallback!(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.error).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isGuest).toBe(true)
    })
  })

  it('should handle auth state change errors', async () => {
    let authStateCallback: (user: User | null) => void

    mockOnAuthStateChanged.mockImplementation((auth, callback) => {
      authStateCallback = callback
      return mockUnsubscribe
    })

    vi.mocked(formatAuthUser).mockImplementation(() => {
      throw new Error('Format error')
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const { result } = renderHook(() => useAuth())

    // Simulate auth state change with error
    authStateCallback!({} as User)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.user).toBeNull()
      expect(result.current.error).toBe('Failed to format user data')
      expect(consoleSpy).toHaveBeenCalledWith('Auth state change error:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('should cleanup listener on unmount', () => {
    mockOnAuthStateChanged.mockReturnValue(mockUnsubscribe)

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })
})