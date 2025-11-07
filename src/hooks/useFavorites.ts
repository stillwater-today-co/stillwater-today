import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { 
  getUserFavoriteEvents, 
  addEventToFavorites, 
  removeEventFromFavorites,
  createUserProfile,
  cleanupDuplicateFavorites
} from '../firebase/firestore'

export function useFavorites() {
  const { user, loading } = useAuth()
  const [favorites, setFavorites] = useState<number[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingOperations, setPendingOperations] = useState<Set<number>>(new Set())

  // Load user favorites when user changes
  useEffect(() => {
    const loadFavorites = async () => {
      console.log('loadFavorites called, user:', user, 'loading:', loading)
      if (!user) {
        console.log('No user, setting favorites to empty array')
        setFavorites([])
        return
      }

      try {
        setFavoritesLoading(true)
        setError(null)
        
        console.log('Creating user profile for user:', user.uid)
        // Ensure user profile exists
        await createUserProfile(user)
        
        console.log('Loading user favorites...')
        
        // Clean up any duplicates in Firestore first
        await cleanupDuplicateFavorites(user.uid)
        
        // Load favorites
        const userFavorites = await getUserFavoriteEvents(user.uid)
        console.log('Loaded favorites:', userFavorites)
        
        // Remove any duplicates that might exist locally (double safety)
        const uniqueFavorites = Array.from(new Set(userFavorites))
        if (uniqueFavorites.length !== userFavorites.length) {
          console.log('Found duplicates in favorites, cleaned:', uniqueFavorites)
        }
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
    console.log('addFavorite called for eventId:', eventId, 'user:', user)
    if (!user) {
      console.log('No user, cannot add favorite')
      setError('You must be logged in to save favorites')
      return false
    }

    // Check if already in favorites to prevent duplicates
    if (favorites.includes(eventId)) {
      console.log('Event already in favorites, skipping add')
      return true
    }

    try {
      setError(null)
      console.log('Calling addEventToFavorites in Firestore...')
      await addEventToFavorites(user.uid, eventId)
      console.log('Successfully added to Firestore, updating local state')
      setFavorites(prev => {
        // Double-check to prevent duplicates in local state
        if (prev.includes(eventId)) {
          console.log('Event already in local state, not adding duplicate')
          return prev
        }
        const newFavorites = [...prev, eventId]
        console.log('New favorites array:', newFavorites)
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
      setFavorites(prev => prev.filter(id => id !== eventId))
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
    if (pendingOperations.has(eventId)) {
      console.log('Operation already pending for event:', eventId)
      return false
    }
    
    setPendingOperations(prev => new Set(prev.add(eventId)))
    
    try {
      if (favorites.includes(eventId)) {
        console.log('Event is favorited, removing...')
        return await removeFavorite(eventId)
      } else {
        console.log('Event not favorited, adding...')
        return await addFavorite(eventId)
      }
    } finally {
      setPendingOperations(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
    }
  }, [favorites, addFavorite, removeFavorite, user, pendingOperations])

  // Check if event is favorited
  const isFavorited = useCallback((eventId: number) => {
    return favorites.includes(eventId)
  }, [favorites])

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
    testFirestore
  }
}