import React, { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { authUtils } from '../utils/auth'
import type { AuthUser } from '../utils/auth'

// Define the shape of our auth context
interface AuthContextType {
  // Auth state
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isGuest: boolean
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ user: any; error: Error | null }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ user: any; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  resetPassword: (email: string) => Promise<{ error: Error | null }>
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

// Custom hook to use the auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}
