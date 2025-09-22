import React, { useState } from 'react'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'
import PasswordResetForm from '../components/auth/PasswordResetForm'

type AuthMode = 'login' | 'signup' | 'reset'

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const handleAuthSuccess = () => {
    // This will be handled by the auth state change in the context
    // The user will automatically be redirected to the main app
  }

  const renderAuthForm = () => {
    switch (authMode) {
      case 'login':
        return (
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={() => setAuthMode('signup')}
            onForgotPassword={() => setAuthMode('reset')}
          />
        )
      case 'signup':
        return (
          <SignupForm
            onSuccess={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode('login')}
          />
        )
      case 'reset':
        return (
          <PasswordResetForm
            onSuccess={handleAuthSuccess}
            onBackToLogin={() => setAuthMode('login')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>Stillwater Today</h1>
        {renderAuthForm()}
      </div>
    </div>
  )
}

export default AuthPage
