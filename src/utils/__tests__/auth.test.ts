import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authUtils, formatAuthUser } from '../auth'
import type { User } from 'firebase/auth'

// Mock Firebase auth functions
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
  getAuth: vi.fn(() => ({})) // Add missing getAuth mock
}))

// Mock Firebase auth instance
vi.mock('../firebase/auth', () => ({
  auth: {}
}))

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth'

describe('authUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn', () => {
    it('should return user on successful sign in', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' }
      vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
        user: mockUser as User
      } as any)

      const result = await authUtils.signIn('test@example.com', 'password')

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password')
    })

    it('should return error on failed sign in', async () => {
      const mockError = new Error('Invalid credentials')
      vi.mocked(signInWithEmailAndPassword).mockRejectedValue(mockError)

      const result = await authUtils.signIn('test@example.com', 'wrongpassword')

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signUp', () => {
    it('should return user on successful sign up', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' }
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser as User
      } as any)

      const result = await authUtils.signUp('test@example.com', 'password', 'Test User')

      expect(result.user).toEqual(mockUser)
      expect(result.error).toBeNull()
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@example.com', 'password')
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'Test User' })
    })

    it('should work without display name', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' }
      vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
        user: mockUser as User
      } as any)

      const result = await authUtils.signUp('test@example.com', 'password')

      expect(result.user).toEqual(mockUser)
      expect(updateProfile).not.toHaveBeenCalled()
    })

    it('should return error on failed sign up', async () => {
      const mockError = new Error('Email already in use')
      vi.mocked(createUserWithEmailAndPassword).mockRejectedValue(mockError)

      const result = await authUtils.signUp('test@example.com', 'password')

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('should return success on sign out', async () => {
      vi.mocked(signOut).mockResolvedValue(undefined)

      const result = await authUtils.signOut()

      expect(result.error).toBeNull()
      expect(signOut).toHaveBeenCalledWith({})
    })

    it('should return error on failed sign out', async () => {
      const mockError = new Error('Sign out failed')
      vi.mocked(signOut).mockRejectedValue(mockError)

      const result = await authUtils.signOut()

      expect(result.error).toEqual(mockError)
    })
  })

  describe('resetPassword', () => {
    it('should return success on password reset', async () => {
      vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined)

      const result = await authUtils.resetPassword('test@example.com')

      expect(result.error).toBeNull()
      expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, 'test@example.com')
    })

    it('should return error on failed password reset', async () => {
      const mockError = new Error('User not found')
      vi.mocked(sendPasswordResetEmail).mockRejectedValue(mockError)

      const result = await authUtils.resetPassword('nonexistent@example.com')

      expect(result.error).toEqual(mockError)
    })
  })
})

describe('formatAuthUser', () => {
  it('should format Firebase user correctly', () => {
    const mockFirebaseUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    } as User

    const result = formatAuthUser(mockFirebaseUser)

    expect(result).toEqual({
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg'
    })
  })

  it('should return null for null user', () => {
    const result = formatAuthUser(null)
    expect(result).toBeNull()
  })

  it('should handle user with missing optional fields', () => {
    const mockFirebaseUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: null,
      photoURL: null
    } as User

    const result = formatAuthUser(mockFirebaseUser)

    expect(result).toEqual({
      uid: '123',
      email: 'test@example.com',
      displayName: null,
      photoURL: null
    })
  })
})