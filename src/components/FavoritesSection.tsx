import React, { useState, useEffect } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import { getCachedEvents } from '../services/eventsService'
import type { ProcessedEvent } from '../services/eventsService'

interface FavoritesSectionProps {
  onClose?: () => void
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onClose }) => {
  const { favorites, isAuthenticated, toggleFavorite } = useFavorites()
  const [favoriteEvents, setFavoriteEvents] = useState<ProcessedEvent[]>([])
  const [loading, setLoading] = useState(false)

  // Load favorite event details with real-time updates
  useEffect(() => {
    const loadFavoriteEvents = async () => {
      console.log('Loading favorite events, favorites array:', favorites)
      
      if (favorites.length === 0) {
        console.log('No favorites, clearing favorite events')
        setFavoriteEvents([])
        return
      }

      try {
        setLoading(true)
        
        // First, try to get events from cache
        const cachedEvents = getCachedEvents()
        let foundEvents: ProcessedEvent[] = []
        let missingEventIds: number[] = []
        
        if (cachedEvents) {
          foundEvents = cachedEvents.filter(event => favorites.includes(event.id))
          missingEventIds = favorites.filter(id => !foundEvents.some(event => event.id === id))
          
          console.log('Found in cache:', foundEvents.length, 'Missing from cache:', missingEventIds.length)
        } else {
          console.log('No cached events available, will need to fetch all')
          missingEventIds = [...favorites]
        }
        
        // If we have missing events, try to fetch them from API
        if (missingEventIds.length > 0) {
          console.log('Fetching missing events from API:', missingEventIds)
          
          // Import fetchOSUEvents dynamically to avoid circular imports
          const { fetchOSUEvents } = await import('../services/eventsService')
          
          try {
            // Fetch fresh events to find the missing ones
            const allEvents = await fetchOSUEvents(false) // Don't force refresh, use existing cache
            const missingEvents = allEvents.filter(event => missingEventIds.includes(event.id))
            
            console.log('Found missing events:', missingEvents.length)
            foundEvents = [...foundEvents, ...missingEvents]
          } catch (fetchError) {
            console.error('Failed to fetch missing events:', fetchError)
            // Continue with just the cached events
          }
        }
        
        // Remove duplicates and sort by date (earliest first)
        const uniqueFavorites = foundEvents
          .filter((event, index, array) => array.findIndex(e => e.id === event.id) === index)
          .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
        
        console.log('Final favorite events:', uniqueFavorites.length, 'out of', favorites.length, 'favorites')
        setFavoriteEvents(uniqueFavorites)
        
        // Log any still missing events
        if (uniqueFavorites.length < favorites.length) {
          const stillMissing = favorites.filter(id => !uniqueFavorites.some(event => event.id === id))
          console.log('Still missing events (may be old/deleted):', stillMissing)
        }
        
      } catch (error) {
        console.error('Error loading favorite events:', error)
        setFavoriteEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadFavoriteEvents()
  }, [favorites])

  const handleRemoveFavorite = async (eventId: number) => {
    console.log('Removing favorite event:', eventId)
    
    // Optimistically update local state for immediate feedback
    setFavoriteEvents(prev => prev.filter(event => event.id !== eventId))
    
    // Update the favorites in the background
    const result = await toggleFavorite(eventId)
    console.log('Toggle favorite result:', result)
    
    // If the operation failed, we could revert the optimistic update here
    if (!result) {
      console.log('Failed to remove favorite, reverting optimistic update')
      // Reload to get the correct state
      const cachedEvents = getCachedEvents()
      if (cachedEvents) {
        const userFavorites = cachedEvents.filter(event => 
          favorites.includes(event.id)
        )
        setFavoriteEvents(userFavorites)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="favorites-section">
        <div className="favorites-header">
          <h3>Favorite Events</h3>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <div className="favorites-empty">
          <div className="empty-icon">🔐</div>
          <h4>Sign In Required</h4>
          <p>Please sign in to view and save your favorite events.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="favorites-section">
        <div className="favorites-header">
          <h3>Favorite Events</h3>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    )
  }

  if (favoriteEvents.length === 0) {
    return (
      <div className="favorites-section">
        <div className="favorites-header">
          <h3>Favorite Events</h3>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
        <div className="favorites-empty">
          <div className="empty-icon">⭐</div>
          <h4>No Favorites Yet</h4>
          <p>Start saving events you're interested in by clicking the star button on any event.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="favorites-section">
      <div className="favorites-header">
        <h3>Your Favorite Events ({favoriteEvents.length})</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>
      
      <div className="favorites-grid">
        {favoriteEvents.map(event => (
          <div key={event.id} className="favorite-event-card">
            <div className="event-header">
              <h4 className="event-title">{event.title}</h4>
              <button
                className="remove-favorite-btn"
                onClick={() => handleRemoveFavorite(event.id)}
                title="Remove from favorites"
              >
                ⭐
              </button>
            </div>
            
            <div className="event-badges">
              {event.category && (
                <span className={`event-category ${event.category.toLowerCase().replace(/[^\w]/g, '-')}`}>
                  {event.category}
                </span>
              )}
              {event.type && (
                <span className={`event-type ${event.type.toLowerCase().replace(' & ', '-')}`}>
                  {event.type === 'inperson' ? 'In Person' : 
                   event.type === 'virtual' ? 'Virtual' : 
                   event.type === 'hybrid' ? 'Hybrid' : event.type}
                </span>
              )}
            </div>
            
            <div className="event-details">
              <div className="event-detail">
                <span className="detail-icon">📅</span>
                <span>{event.date} at {event.time}</span>
              </div>
              <div className="event-detail">
                <span className="detail-icon">📍</span>
                <span>{event.location}</span>
              </div>
              {event.cost && (
                <div className="event-detail">
                  <span className="detail-icon">💰</span>
                  <span>{event.cost}</span>
                </div>
              )}
            </div>
            
            <p className="event-description">{event.description}</p>
            
            <div className="event-actions">
              {event.url && (
                <a 
                  href={event.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="event-btn"
                >
                  Learn More
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FavoritesSection