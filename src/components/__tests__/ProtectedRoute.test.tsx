import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../ProtectedRoute'

// Mock the auth context
vi.mock('../../hooks/useAuthContext', () => ({
  useAuthContext: vi.fn()
}))

import { useAuthContext } from '../../hooks/useAuthContext'

const mockUseAuthContext = vi.mocked(useAuthContext)

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>
  const FallbackComponent = () => <div>Fallback Content</div>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show loading when auth is loading', () => {
    mockUseAuthContext.mockReturnValue({
      loading: true,
      isAuthenticated: false,
      isGuest: false,
      user: null,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show protected content when user is authenticated and requireAuth is true', () => {
    mockUseAuthContext.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      isGuest: false,
      user: { uid: '123', email: 'test@example.com', displayName: null, photoURL: null },
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <ProtectedRoute requireAuth={true} fallback={<FallbackComponent />}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Fallback Content')).not.toBeInTheDocument()
  })

  it('should show fallback when user is not authenticated and requireAuth is true', () => {
    mockUseAuthContext.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      isGuest: true,
      user: null,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <ProtectedRoute requireAuth={true} fallback={<FallbackComponent />}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Fallback Content')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show protected content when user is guest and requireAuth is false', () => {
    mockUseAuthContext.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      isGuest: true,
      user: null,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <ProtectedRoute requireAuth={false} fallback={<FallbackComponent />}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByText('Fallback Content')).not.toBeInTheDocument()
  })

  it('should show fallback when user is authenticated and requireAuth is false', () => {
    mockUseAuthContext.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      isGuest: false,
      user: { uid: '123', email: 'test@example.com', displayName: null, photoURL: null },
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <ProtectedRoute requireAuth={false} fallback={<FallbackComponent />}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Fallback Content')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('should show content when requireAuth is undefined (default true)', () => {
    mockUseAuthContext.mockReturnValue({
      loading: false,
      isAuthenticated: true,
      isGuest: false,
      user: { uid: '123', email: 'test@example.com', displayName: null, photoURL: null },
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('should show nothing when no fallback is provided', () => {
    mockUseAuthContext.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      isGuest: true,
      user: null,
      error: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })

    render(
      <ProtectedRoute requireAuth={true}>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Fallback Content')).not.toBeInTheDocument()
  })
})
