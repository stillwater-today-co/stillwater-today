import React, { useState } from 'react'
import { signInUser, createUser } from '../firebase/authService'

const Auth: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [isSignUp, setIsSignUp] = useState(false)

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
      setResult(`❌ ${result.error?.userMessage || 'Sign-in failed. Please try again.'}`)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
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
      
      <div className="auth-toggle">
        <p>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setResult('')
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
