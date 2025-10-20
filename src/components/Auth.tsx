import { CheckCircle, XCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, resetPassword, signInUser } from '../firebase/authService';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [passwordResetLoading, setPasswordResetLoading] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const navigate = useNavigate()


  const handleSignIn = async () => {
    setShowPasswordReset(false);
    if (!email || !password) {
      setResult('Please enter both email and password')
      return
    }

    setLoading(true)
    setResult('Signing in...')
    
    const result = await signInUser(email, password)
    
    if (result.success) {
      setResult('SIGNIN_SUCCESS')
      // The AuthContext will automatically handle the state change
      navigate('/')
    } else {
      const errorMessage = result.error?.userMessage || 'Sign-in failed. Please try again.'
      setResult(`SIGNIN_ERROR:${errorMessage}`)
      // Do not show password reset box automatically
    }
    
    setLoading(false)
  }

  const handleSignUp = async () => {
    setShowPasswordReset(false);
    if (!email || !password) {
      setResult('Please enter both email and password')
      return
    }

    setLoading(true)
    setResult('Creating account...')
    
    const result = await createUser(email, password)
    
    if (result.success) {
      setResult('SIGNUP_SUCCESS')
      // The AuthContext will automatically handle the state change
      navigate('/')
    } else {
      setResult(`SIGNUP_ERROR:${result.error?.userMessage || 'Account creation failed. Please try again.'}`)
    }
    
    setLoading(false)
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResult('Please enter your email address')
      return
    }
    setPasswordResetLoading(true)
    setResult('Sending password reset email...')
    const result = await resetPassword(resetEmail)
    if (result.success) {
      setResult('RESET_SUCCESS')
      setShowPasswordReset(false)
      setResetEmail('')
    } else {
      setResult(`RESET_ERROR:${result.error?.userMessage || 'Failed to send password reset email. Please try again.'}`)
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
          {!isSignUp && (
            <div className="forgot-password-link">
              <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="forgot-password-btn"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
            </div>
          )}
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
          <h3>Reset Password</h3>
          <p className="password-reset-text">
            Enter your email address to receive a password reset link.
          </p>
          <input
            type="email"
            placeholder="Enter your email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            disabled={passwordResetLoading}
            className="password-reset-input"
          />
          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={passwordResetLoading || !resetEmail}
            className="password-reset-btn"
          >
            {passwordResetLoading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
          <button
            type="button"
            onClick={() => { setShowPasswordReset(false); setResetEmail(''); }}
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
        <div className={`auth-result ${result.includes('SUCCESS') ? 'success' : 'error'}`}>
          {result.startsWith('SIGNIN_SUCCESS') && <><CheckCircle color="#22c55e" size={18} style={{marginRight: 4}} />Sign-in successful!</>}
          {result.startsWith('SIGNIN_ERROR:') && <><XCircle color="#ef4444" size={18} style={{marginRight: 4}} />{result.replace('SIGNIN_ERROR:', '')}</>}
          {result.startsWith('SIGNUP_SUCCESS') && <><CheckCircle color="#22c55e" size={18} style={{marginRight: 4}} />Account created successfully! You are now signed in.</>}
          {result.startsWith('SIGNUP_ERROR:') && <><XCircle color="#ef4444" size={18} style={{marginRight: 4}} />{result.replace('SIGNUP_ERROR:', '')}</>}
          {result.startsWith('RESET_SUCCESS') && <><CheckCircle color="#22c55e" size={18} style={{marginRight: 4}} />Password reset email sent</>}
          {result.startsWith('RESET_ERROR:') && <><XCircle color="#ef4444" size={18} style={{marginRight: 4}} />{result.replace('RESET_ERROR:', '')}</>}
        </div>
      )}
    </div>
  )
}

export default Auth
