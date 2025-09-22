import React, { useState } from 'react'
import { useAuthContext } from '../../contexts/AuthContext'

interface PasswordResetFormProps {
  onSuccess?: () => void
  onBackToLogin?: () => void
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ 
  onSuccess, 
  onBackToLogin 
}) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { resetPassword } = useAuthContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: resetError } = await resetPassword(email)
      
      if (resetError) {
        setError(resetError.message)
      } else {
        setSuccess(true)
        onSuccess?.()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Password reset error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-form">
        <h2>Check Your Email</h2>
        <p>We've sent a password reset link to <strong>{email}</strong></p>
        <p>Please check your email and follow the instructions to reset your password.</p>
        {onBackToLogin && (
          <button 
            onClick={onBackToLogin}
            className="link-button"
          >
            Back to Sign In
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="auth-form">
      <h2>Reset Password</h2>
      <p>Enter your email address and we'll send you a link to reset your password.</p>
      
      <form onSubmit={handleSubmit}>
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

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {onBackToLogin && (
          <div className="auth-links">
            <button 
              type="button" 
              onClick={onBackToLogin}
              className="link-button"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </form>
    </div>
  )
}

export default PasswordResetForm
