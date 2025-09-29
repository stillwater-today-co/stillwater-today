import React, { useState } from 'react'
import { signInUser, createUser, resetPassword } from '../firebase/authService'

const Auth: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      setResult('Please enter both email and password')
      return
    }

    setLoading(true)
    setResult('Signing in...')
    
    const result = await signInUser(email, password)
    
    if (result.success) {
      setResult('✅ Sign-in successful!')
      // The AuthContext will automatically handle the state change
    } else {
      const errorMessage = result.error?.userMessage || 'Sign-in failed. Please try again.'
      setResult(`❌ ${errorMessage}`)
      
      // Show password reset option for specific errors
      if (result.error?.code === 'auth/wrong-password' || result.error?.code === 'auth/user-not-found') {
        setShowPasswordReset(true)
      }
    }
    
    setLoading(false)
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setResult('Please enter both email and password')
      return
    }

    setLoading(true)
    setResult('Creating account...')
    
    const result = await createUser(email, password)
    
    if (result.success) {
      setResult('✅ Account created successfully! You are now signed in.')
      // The AuthContext will automatically handle the state change
    } else {
      setResult(`❌ ${result.error?.userMessage || 'Account creation failed. Please try again.'}`)
    }
    
    setLoading(false)
  }

  const handlePasswordReset = async () => {
    if (!email) {
      setResult('Please enter your email address first')
      return
    }

    setPasswordResetLoading(true)
    setResult('Sending password reset email...')
    
    const result = await resetPassword(email)
    
    if (result.success) {
      setResult(`✅ ${result.message}`)
      setShowPasswordReset(false)
    } else {
      setResult(`❌ ${result.error?.userMessage || 'Failed to send password reset email. Please try again.'}`)
    }
    
    setPasswordResetLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Only reset password reset state when switching between sign-in and sign-up
    if (isSignUp) {
      setShowPasswordReset(false)
      handleSignUp()
    } else {
      handleSignIn()
    }
  }

  return (
    <div className="auth-container">
      <h2>Stillwater Today</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="auth-form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className="auth-form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="auth-submit-btn"
        >
          {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>
      
      {/* Password Reset Section */}
      {showPasswordReset && !isSignUp && (
        <div className="password-reset-section">
          <p className="password-reset-text">
            Having trouble signing in? We can send you a password reset email.
          </p>
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={passwordResetLoading || !email}
            className="password-reset-btn"
          >
            {passwordResetLoading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
          <button
            type="button"
            onClick={() => setShowPasswordReset(false)}
            className="password-reset-cancel-btn"
          >
            Cancel
          </button>
        </div>
      )}
      
      <div className="auth-toggle">
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setResult('')
              setShowPasswordReset(false)
            }}
            className="auth-toggle-btn"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </p>
      </div>
      
      {result && (
        <div className={`auth-result ${result.includes('✅') ? 'success' : 'error'}`}>
          {result}
        </div>
      )}
    </div>
  )
}

export default Auth
