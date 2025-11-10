import { Calendar, DollarSign, Lock, MapPin, Star, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import type { ProcessedEvent } from '../services/eventsService'
import { getCachedEvents } from '../services/eventsService'

interface FavoritesSectionProps {
  onClose?: () => void
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onClose }) => {
  const { favorites, isAuthenticated, toggleFavorite } = useFavorites()
  const [favoriteEvents, setFavoriteEvents] = useState<ProcessedEvent[]>([])
  const [loading, setLoading] = useState(false)

  // Store event data that was just favorited for immediate display
  const [recentlyFavoritedEvents, setRecentlyFavoritedEvents] = useState<Map<number, ProcessedEvent>>(new Map())

  // Load favorite event details with real-time updates
  useEffect(() => {
    const loadFavoriteEvents = async () => {
      if (favorites.length === 0) {
        setFavoriteEvents([])
        return
      }

      try {
        setLoading(true)
        
        // Get ALL events from cache (not just the subset)
        let cachedEvents = getCachedEvents()
        let foundEvents: ProcessedEvent[] = []
        let missingEventIds: number[] = []
        
        if (cachedEvents && cachedEvents.length > 0) {
          // Search through ALL cached events
          foundEvents = cachedEvents.filter(event => favorites.includes(event.id))
          missingEventIds = favorites.filter(id => !foundEvents.some(event => event.id === id))
        } else {
          missingEventIds = [...favorites]
        }
        
        // Check recently favorited events for missing ones
        missingEventIds.forEach(id => {
          const recentEvent = recentlyFavoritedEvents.get(id)
          if (recentEvent && !foundEvents.some(e => e.id === id)) {
            foundEvents.push(recentEvent)
          }
        })
        
        // Update missing list after checking recent events
        missingEventIds = favorites.filter(id => !foundEvents.some(event => event.id === id))
        
        // If we have missing events, try to load more pages to find them
        if (missingEventIds.length > 0) {
          const { loadMoreEvents, getCachedEvents } = await import('../services/eventsService')
          try {
            // Try loading more events to find the missing ones
            // Load multiple pages if needed
            let attempts = 0
            const maxAttempts = 3
            
            while (missingEventIds.length > 0 && attempts < maxAttempts) {
              const currentCached = getCachedEvents() || []
              
              // Load more events
              try {
                await loadMoreEvents(currentCached)
              } catch {
                // If no more events available, break
                break
              }
              
              // Check cache again after loading more
              cachedEvents = getCachedEvents()
              if (cachedEvents && cachedEvents.length > 0) {
                const newlyFound = cachedEvents.filter(event => 
                  missingEventIds.includes(event.id) && !foundEvents.some(e => e.id === event.id)
                )
                foundEvents = [...foundEvents, ...newlyFound]
                missingEventIds = missingEventIds.filter(id => !newlyFound.some(e => e.id === id))
              }
              
              attempts++
            }
          } catch (fetchError) {
            console.error('Failed to fetch missing events:', fetchError)
          }
        }
        
        // Remove duplicates and sort by date (earliest first)
        const uniqueFavorites = foundEvents
          .filter((event, index, array) => array.findIndex(e => e.id === event.id) === index)
          .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
        
        setFavoriteEvents(uniqueFavorites)
      } catch (error) {
        console.error('Error loading favorite events:', error)
        setFavoriteEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadFavoriteEvents()
    
    // Listen for favorites-updated event to reload when an event is favorited
    const handleFavoritesUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ eventId: number; eventData: ProcessedEvent; action: 'added' | 'removed' }>
      if (customEvent.detail) {
        const { eventId, eventData, action } = customEvent.detail
        if (action === 'added' && eventData) {
          // Store the event data for immediate display
          setRecentlyFavoritedEvents(prev => {
            const newMap = new Map(prev)
            newMap.set(eventId, eventData)
            return newMap
          })
          // Immediately add to favorites display
          setFavoriteEvents(prev => {
            if (prev.some(e => e.id === eventId)) return prev
            const updated = [...prev, eventData].sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
            return updated
          })
        } else if (action === 'removed') {
          // Remove from recently favorited
          setRecentlyFavoritedEvents(prev => {
            const newMap = new Map(prev)
            newMap.delete(eventId)
            return newMap
          })
          // Immediately remove from favorites display
          setFavoriteEvents(prev => prev.filter(e => e.id !== eventId))
        }
      } else {
        // If no detail, just reload
        loadFavoriteEvents()
      }
    }
    
    window.addEventListener('favorites-updated', handleFavoritesUpdated as EventListener)
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdated as EventListener)
    }
  }, [favorites])

  const handleRemoveFavorite = async (eventId: number) => {
    // Optimistically update local state for immediate feedback
    setFavoriteEvents(prev => prev.filter(event => event.id !== eventId))
    
    // Update the favorites in the background
    const result = await toggleFavorite(eventId)
    
    // If the operation failed, reload to get the correct state
    if (!result) {
      const cachedEvents = getCachedEvents()
      if (cachedEvents) {
        const userFavorites = cachedEvents
          .filter(event => favorites.includes(event.id))
          .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
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
              <X size={16} />
            </button>
          )}
        </div>
        <div className="favorites-empty">
          <div className="empty-icon"><Lock size={20} /></div>
          <h4>Sign In Required</h4>
          <p>Please sign in to view and favorite events.</p>
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
              <X size={16} />
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
          <div className="empty-icon"><Star size={20} /></div>
          <h4>No Favorites Yet</h4>
          <p>Start favoriting events you're interested in by clicking the star button on any event.</p>
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
                <Star size={16} />
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
                <Calendar size={14} className="detail-icon" />
                <span>{event.date} at {event.time}</span>
              </div>
              <div className="event-detail">
                <MapPin size={14} className="detail-icon" />
                <span>{event.location}</span>
              </div>
              {event.cost && (
                <div className="event-detail">
                  <DollarSign size={14} className="detail-icon" />
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