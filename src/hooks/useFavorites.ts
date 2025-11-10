import { useCallback, useEffect, useState } from 'react'
import {
  addEventToFavorites,
  cleanupDuplicateFavorites,
  createUserProfile,
  getUserFavoriteEvents,
  removeEventFromFavorites
} from '../firebase/firestore'
import { useAuth } from './useAuth'

export function useFavorites() {
  const { user, loading } = useAuth()
  const [favorites, setFavorites] = useState<number[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingOperations, setPendingOperations] = useState<Set<number>>(new Set())

  // Helper to dispatch favorites changes across hook instances
  const emitFavoritesChanged = (newFavorites: number[], action?: 'added' | 'removed', eventId?: number) => {
    try {
      window.dispatchEvent(new CustomEvent('favorites-changed', { detail: newFavorites }))
      
      // Also emit favorites-updated event for FavoritesSection
      if (action && eventId !== undefined) {
        window.dispatchEvent(new CustomEvent('favorites-updated', { 
          detail: { action, eventId } 
        }))
      }
    } catch {
      // ignore in non-browser environments
    }
  }

  // Listen for favorites changes from other instances
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const custom = e as CustomEvent<number[]>
        if (custom && Array.isArray(custom.detail)) {
          setFavorites(custom.detail)
        }
      } catch (err) {
        console.error('Error handling favorites-changed event:', err)
      }
    }

    window.addEventListener('favorites-changed', handler as EventListener)
    return () => window.removeEventListener('favorites-changed', handler as EventListener)
  }, [])

  // Load user favorites when user changes
  useEffect(() => {
    const loadFavorites = async () => {
      console.log('loadFavorites called, user:', user, 'loading:', loading)
      if (!user) {
        setFavorites([])
        return
      }

      try {
        setFavoritesLoading(true)
        setError(null)
        // Ensure user profile exists
        await createUserProfile(user)

        // Clean up any duplicates in Firestore first
        await cleanupDuplicateFavorites(user.uid)

        // Load favorites
        const userFavorites = await getUserFavoriteEvents(user.uid)
        const uniqueFavorites = Array.from(new Set(userFavorites))
        setFavorites(uniqueFavorites)
      } catch (err) {
        console.error('Error loading favorites:', err)
        setError(err instanceof Error ? err.message : 'Failed to load favorites')
      } finally {
        setFavoritesLoading(false)
      }
    }

    if (!loading) {
      console.log('Auth not loading, calling loadFavorites')
      loadFavorites()
    }
  }, [user, loading])

  // Add event to favorites
  const addFavorite = useCallback(async (eventId: number) => {
    if (!user) {
      setError('You must be logged in to save favorites')
      return false
    }

    if (favorites.includes(eventId)) return true

    try {
      setError(null)
      await addEventToFavorites(user.uid, eventId)
      setFavorites(prev => {
        if (prev.includes(eventId)) return prev
        const newFavorites = [...prev, eventId]
        emitFavoritesChanged(newFavorites, 'added', eventId)
        return newFavorites
      })
      return true
    } catch (err) {
      console.error('Error adding favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to add favorite')
      return false
    }
  }, [user, favorites])

  // Remove event from favorites
  const removeFavorite = useCallback(async (eventId: number) => {
    if (!user) {
      setError('You must be logged in to manage favorites')
      return false
    }

    try {
      setError(null)
      await removeEventFromFavorites(user.uid, eventId)
      setFavorites(prev => {
        const updated = prev.filter(id => id !== eventId)
        emitFavoritesChanged(updated, 'removed', eventId)
        return updated
      })
      return true
    } catch (err) {
      console.error('Error removing favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove favorite')
      return false
    }
  }, [user])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (eventId: number) => {
    console.log('toggleFavorite called for eventId:', eventId)
    console.log('Current favorites:', favorites)
    console.log('User:', user)
    
    // Prevent duplicate operations
    if (pendingOperations.has(eventId)) return false

    setPendingOperations(prev => {
      const s = new Set(prev)
      s.add(eventId)
      return s
    })

    try {
      if (favorites.includes(eventId)) return await removeFavorite(eventId)
      return await addFavorite(eventId)
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }, [favorites, addFavorite, removeFavorite, user, pendingOperations])

  // Check if event is favorited
  const isFavorited = useCallback((eventId: number) => favorites.includes(eventId), [favorites])

  const isPending = useCallback((eventId: number) => pendingOperations.has(eventId), [pendingOperations])

  // Test function to check Firestore connectivity
  const testFirestore = useCallback(async () => {
    if (!user) {
      console.log('No user for Firestore test')
      return
    }
    
    try {
      console.log('Testing Firestore connectivity...')
      const testResult = await createUserProfile(user)
      console.log('Firestore test successful:', testResult)
      
      // Also clean up duplicates
      console.log('Cleaning up any duplicate favorites...')
      await cleanupDuplicateFavorites(user.uid)
      
      // Reload favorites after cleanup
      const cleanedFavorites = await getUserFavoriteEvents(user.uid)
      setFavorites(Array.from(new Set(cleanedFavorites)))
      console.log('Cleanup complete, current favorites:', cleanedFavorites)
    } catch (error) {
      console.error('Firestore test failed:', error)
    }
  }, [user])

  return {
    favorites,
    favoritesLoading,
    error,
    isAuthenticated: !!user,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorited,
    isPending,
    testFirestore
  }
}