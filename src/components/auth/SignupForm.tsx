import React, { useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'

interface SignupFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { signUp } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { user, error: signUpError } = await signUp(
        email, 
        password, 
        displayName || undefined
      )
      
      if (signUpError) {
        setError(signUpError.message)
      } else if (user) {
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Signup error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Display Name (Optional)</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your display name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Enter your password (min 6 characters)"
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Confirm your password"
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {onSwitchToLogin && (
          <div className="auth-links">
            <button 
              type="button" 
              onClick={onSwitchToLogin}
              className="link-button"
            >
              Already have an account? Sign In
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default SignupForm