import { type User } from 'firebase/auth'
import { createContext } from 'react'

export interface AuthContextType {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
})
