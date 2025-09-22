import { useState, useEffect } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase/auth'
import { formatAuthUser, type AuthUser } from '../utils/auth'

// Custom hook for managing authentication state
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      try {
        const formattedUser = formatAuthUser(firebaseUser)
        setUser(formattedUser)
        setError(null)
      } catch (err) {
        setError('Failed to format user data')
        console.error('Auth state change error:', err)
      } finally {
        setLoading(false)
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Helper functions to check auth status
  const isAuthenticated = !!user
  const isGuest = !user && !loading

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isGuest
  }
}
