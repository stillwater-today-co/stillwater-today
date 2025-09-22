import { useContext } from 'react'
import { AuthContext } from '../contexts/AuthContextData'
import type { AuthContextType } from '../contexts/AuthContextData'

// Custom hook to use the auth context
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}