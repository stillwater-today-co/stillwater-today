import React, { useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'

interface LogoutButtonProps {
  onLogout?: () => void
  children?: React.ReactNode
  className?: string
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  onLogout, 
  children = 'Sign Out',
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const { signOut } = useAuthContext()

  const handleLogout = async () => {
    setIsLoading(true)
    
    try {
      await signOut()
      onLogout?.()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoading}
      className={`logout-button ${className}`}
    >
      {isLoading ? 'Signing Out...' : children}
    </button>
  )
}

export default LogoutButton