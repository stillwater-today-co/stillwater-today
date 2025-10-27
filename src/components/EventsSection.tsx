import React, { useState, useEffect } from 'react'
import { 
  fetchOSUEvents, 
  filterEvents, 
  getEventCategories, 
  loadMoreEvents, 
  loadMoreCategoryEvents,
  hasMoreEventsAvailable,
  getRemainingEventsCount 
} from '../services/eventsService'
import type { ProcessedEvent } from '../services/eventsService'

const EventsSection: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [events, setEvents] = useState<ProcessedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])

  // Load OSU events on component mount
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      const osuEvents = await fetchOSUEvents(forceRefresh)
      setEvents(osuEvents)
      
      // Update available categories
      const categories = getEventCategories(osuEvents)
      setAvailableCategories(categories)
    } catch (err) {
      console.error('Failed to load events:', err)
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    loadEvents(true) // Force refresh
  }

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true)
      setError(null)

      let newEvents: ProcessedEvent[]
      
      if (categoryFilter === 'all') {
        // Load more general events
        newEvents = await loadMoreEvents(events)
      } else {
        // Load more events for specific category
        newEvents = await loadMoreCategoryEvents(categoryFilter, events)
      }

      if (newEvents.length > 0) {
        setEvents(prevEvents => [...prevEvents, ...newEvents])
        
        // Update available categories with new events
        const allEvents = [...events, ...newEvents]
        const categories = getEventCategories(allEvents)
        setAvailableCategories(categories)
      }
      
    } catch (err) {
      console.error('Failed to load more events:', err)
      setError(err instanceof Error ? err.message : 'Failed to load more events')
    } finally {
      setLoadingMore(false)
    }
  }

  const filteredEvents = filterEvents(events, dateFilter, categoryFilter)
  const hasMoreAvailable = hasMoreEventsAvailable()
  const remainingCount = getRemainingEventsCount()

  // Show loading state
  if (loading) {
    return (
      <section className="events-section">
        <div className="events-header">
          <div className="events-title-area">
            <h2>Events & Activities</h2>
            <button 
              className="refresh-btn loading"
              disabled={true}
            >
              <span className="refresh-icon">↻</span>
            </button>
          </div>
        </div>
        <div className="loading-placeholder">
          <div className="loading-spinner"></div>
          <p>Loading OSU events...</p>
        </div>
      </section>
    )
  }

  // Show error state with fallback
  if (error && events.length === 0) {
    return (
      <section className="events-section">
        <div className="events-header">
          <div className="events-title-area">
            <h2>Events & Activities</h2>
            <button 
              className="refresh-btn"
              onClick={handleRefresh}
            >
              <span className="refresh-icon">↻</span>
            </button>
          </div>
        </div>
        <div className="events-error">
          <div className="error-icon">⚠️</div>
          <h3>Unable to Load Events</h3>
          <p>{error}</p>
          <button 
            className="refresh-btn" 
            onClick={handleRefresh}
          >
            Try Again
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="events-section">
      <div className="events-header">
        <div className="events-title-area">
          <h2>Events & Activities</h2>
          <button 
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh events"
          >
            <span className="refresh-icon">
              {loading ? '↻' : '↻'}
            </span>
          </button>
        </div>
        <div className="events-filters">
          <div className="date-filters">
            <button 
              className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDateFilter('all')}
            >
              All Events
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => setDateFilter('today')}
            >
              Today
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setDateFilter('upcoming')}
            >
              Upcoming
            </button>
          </div>
          
          <div className="category-filter">
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="category-dropdown"
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredEvents.length > 0 && (
        <div className="events-count">
          Showing {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}
          {categoryFilter !== 'all' && ` in ${categoryFilter}`}
          {dateFilter !== 'all' && ` for ${dateFilter === 'today' ? 'today' : 'upcoming dates'}`}
        </div>
      )}

      <div className="events-grid">
        {error && events.length > 0 && (
          <div className="events-error-banner">
            <span>⚠️ Some events may be cached: {error}</span>
          </div>
        )}
        
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3 className="event-title">{event.title}</h3>
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
                {event.contact?.email && (
                  <a 
                    href={`mailto:${event.contact.email}`}
                    className="event-btn contact-btn"
                  >
                    Contact
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or check back later for new OSU events.</p>
          </div>
        )}
      </div>

      {/* Load More Section */}
      {hasMoreAvailable && filteredEvents.length > 0 && (
        <div className="load-more-section">
          <button 
            className={`load-more-btn ${loadingMore ? 'loading' : ''}`}
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            <span className="load-more-icon">
              {loadingMore ? '↻' : '+'}
            </span>
            <span className="load-more-text">
              {loadingMore 
                ? 'Loading...' 
                : categoryFilter === 'all' 
                  ? 'Load More Events' 
                  : `Load More ${categoryFilter} Events`
              }
            </span>
          </button>
          
          {remainingCount > 0 && (
            <p className="remaining-count">
              {remainingCount}+ more events available
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default EventsSection
