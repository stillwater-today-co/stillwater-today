import React from 'react'
import { useAuthContext } from '../hooks/useAuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireAuth?: boolean // true = require auth, false = require guest, undefined = no requirement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = null,
  requireAuth = true 
}) => {
  const { loading, isAuthenticated, isGuest } = useAuthContext()

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    )
  }

  // Handle different protection requirements
  if (requireAuth === true && !isAuthenticated) {
    // Require authentication but user is not authenticated
    return fallback
  }

  if (requireAuth === false && !isGuest) {
    // Require guest state but user is authenticated
    return fallback
  }

  // All requirements met, render children
  return <>{children}</>
}

export default ProtectedRoute