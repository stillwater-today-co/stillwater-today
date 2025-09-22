import React from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authUtils } from '../utils/auth'
import { AuthContext, type AuthContextType } from './AuthContextData'

// AuthProvider component that wraps your app
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuth()

  // Wrap auth utility functions to maintain consistent interface
  const signIn = async (email: string, password: string) => {
    return await authUtils.signIn(email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    return await authUtils.signUp(email, password, displayName)
  }

  const signOut = async () => {
    return await authUtils.signOut()
  }

  const resetPassword = async (email: string) => {
    return await authUtils.resetPassword(email)
  }

  const contextValue: AuthContextType = {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}