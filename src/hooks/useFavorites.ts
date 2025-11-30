import { useCallback, useEffect, useState } from 'react'
import {
  addEventToFavorites,
  cleanupDuplicateFavorites,
  createUserProfile,
  getUserFavoriteEvents,
  removeEventFromFavorites
} from '../lib/firebase/firestore'
import { getCachedEvents } from '../services/events'
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

  // Clean up expired events (events that happened yesterday or earlier)
  const cleanupExpiredEvents = useCallback(async (favoriteIds: number[]) => {
    if (!user || favoriteIds.length === 0) return favoriteIds

    try {
      const cachedEvents = getCachedEvents()
      if (!cachedEvents || cachedEvents.length === 0) return favoriteIds

      // Get today at midnight to compare dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Find expired event IDs (events that happened before today)
      const expiredIds: number[] = []
      favoriteIds.forEach(id => {
        const event = cachedEvents.find(e => e.id === id)
        if (event) {
          const eventDate = new Date(event.rawDate)
          eventDate.setHours(0, 0, 0, 0)
          // If event date is before today, it's expired
          if (eventDate < today) {
            expiredIds.push(id)
          }
        }
      })

      // Remove expired events from Firestore
      if (expiredIds.length > 0) {
        for (const expiredId of expiredIds) {
          await removeEventFromFavorites(user.uid, expiredId)
        }
        // Return the cleaned list
        return favoriteIds.filter(id => !expiredIds.includes(id))
      }

      return favoriteIds
    } catch (err) {
      console.error('Error cleaning up expired events:', err)
      return favoriteIds // Return original list on error
    }
  }, [user])

  // Load user favorites when user changes
  useEffect(() => {
    const loadFavorites = async () => {
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
        let userFavorites = await getUserFavoriteEvents(user.uid)
        
        // Clean up expired events (events that happened yesterday or earlier)
        userFavorites = await cleanupExpiredEvents(userFavorites)
        
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
      loadFavorites()
    }
  }, [user, loading, cleanupExpiredEvents])

  // Add event to favorites
  const addFavorite = useCallback(async (eventId: number) => {
    if (!user) {
      setError('You must be logged in to save favorites')
      return false
    }

    if (favorites.includes(eventId)) {
      return true
    }

    try {
      setError(null)
      await addEventToFavorites(user.uid, eventId)
      
      // Reload favorites from Firestore to ensure consistency
      const updatedFavorites = await getUserFavoriteEvents(user.uid)
      
      setFavorites(updatedFavorites)
      emitFavoritesChanged(updatedFavorites, 'added', eventId)
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
      
      // Reload favorites from Firestore to ensure consistency
      const updatedFavorites = await getUserFavoriteEvents(user.uid)
      
      setFavorites(updatedFavorites)
      emitFavoritesChanged(updatedFavorites, 'removed', eventId)
      return true
    } catch (err) {
      console.error('Error removing favorite:', err)
      setError(err instanceof Error ? err.message : 'Failed to remove favorite')
      return false
    }
  }, [user])

  // Toggle favorite status
  const toggleFavorite = useCallback(async (eventId: number) => {
    
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
      return
    }
    
    try {
      const testResult = await createUserProfile(user)
      
      // Also clean up duplicates
      await cleanupDuplicateFavorites(user.uid)
      
      // Reload favorites after cleanup
      const cleanedFavorites = await getUserFavoriteEvents(user.uid)
      setFavorites(Array.from(new Set(cleanedFavorites)))
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
