import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../LoginForm'

// Mock the auth context
vi.mock('../../../hooks/useAuthContext', () => ({
  useAuthContext: vi.fn()
}))

import { useAuthContext } from '../../../hooks/useAuthContext'

const mockUseAuthContext = vi.mocked(useAuthContext)

describe('LoginForm', () => {
  const mockSignIn = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockOnSwitchToSignup = vi.fn()
  const mockOnForgotPassword = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuthContext.mockReturnValue({
      loading: false,
      isAuthenticated: false,
      isGuest: true,
      user: null,
      error: null,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn()
    })
  })

  it('should render login form', () => {
    render(<LoginForm />)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('should handle successful login', async () => {
    const user = userEvent.setup()
    const mockUser = { uid: '123', email: 'test@example.com' }
    mockSignIn.mockResolvedValue({ user: mockUser, error: null })

    render(
      <LoginForm 
        onSuccess={mockOnSuccess}
      />
    )

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('should display error on failed login', async () => {
    const user = userEvent.setup()
    const mockError = new Error('Invalid credentials')
    mockSignIn.mockResolvedValue({ user: null, error: mockError })

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should show loading state during login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByText('Signing In...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Signing In...' })).toBeDisabled()
  })

  it('should call onSwitchToSignup when signup link is clicked', async () => {
    const user = userEvent.setup()

    render(
      <LoginForm 
        onSwitchToSignup={mockOnSwitchToSignup}
      />
    )

    await user.click(screen.getByText('Don\'t have an account? Sign Up'))

    expect(mockOnSwitchToSignup).toHaveBeenCalled()
  })

  it('should call onForgotPassword when forgot password link is clicked', async () => {
    const user = userEvent.setup()

    render(
      <LoginForm 
        onForgotPassword={mockOnForgotPassword}
      />
    )

    await user.click(screen.getByText('Forgot Password?'))

    expect(mockOnForgotPassword).toHaveBeenCalled()
  })

  it('should not show links when callbacks are not provided', () => {
    render(<LoginForm />)

    expect(screen.queryByText('Forgot Password?')).not.toBeInTheDocument()
    expect(screen.queryByText('Don\'t have an account? Sign Up')).not.toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    // Try to submit without filling fields
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(mockSignIn).not.toHaveBeenCalled()
  })
})