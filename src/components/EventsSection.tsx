import { AlertTriangle, Calendar, DollarSign, File, MapPin, RefreshCw, Star, StarOff } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import type { ProcessedEvent } from '../services/eventsService'
import {
  fetchOSUEvents,
  filterEventsByCategory,
  filterEventsByDate,
  getEventCategories,
  getRemainingEventsCount,
  hasMoreEventsAvailable,
  loadMoreEvents
} from '../services/eventsService'
import FavoritesSection from './FavoritesSection'
import Pagination from './Pagination'

const EVENTS_PER_PAGE = 12

const EventsSection: React.FC = () => {
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [events, setEvents] = useState<ProcessedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const { toggleFavorite, isFavorited, isPending, isAuthenticated } = useFavorites()

  // Load events on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        const osuEvents = await fetchOSUEvents(false)
        // Events are already sorted by date in eventsService
        setEvents(osuEvents)
        const categories = getEventCategories(osuEvents)
        setAvailableCategories(categories)
      } catch (err) {
        console.error('Failed to load events:', err)
        setError(err instanceof Error ? err.message : 'Failed to load events')
      } finally {
        setLoading(false)
      }
    }
    loadEvents()
  }, [])

  // Filter and sort events - sorted by date (earliest first)
  const filteredEvents = useMemo(() => {
    let filtered = filterEventsByDate(events, dateFilter)
    if (categoryFilter !== 'all') {
      filtered = filterEventsByCategory(filtered, categoryFilter)
    }
    // Sort by date (earliest first) - events should already be sorted, but ensure it
    return filtered.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
  }, [events, dateFilter, categoryFilter])

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)
  const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
  const endIndex = startIndex + EVENTS_PER_PAGE
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateFilter, categoryFilter])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || loading) return
    setIsRefreshing(true)
    try {
      setError(null)
      const osuEvents = await fetchOSUEvents(true)
      setEvents(osuEvents)
      const categories = getEventCategories(osuEvents)
      setAvailableCategories(categories)
    } catch (err) {
      console.error('Failed to refresh events:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh events')
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }, [isRefreshing, loading])

  // Handle page change - load more if needed
  const handlePageChange = useCallback(async (page: number) => {
    const hasMore = hasMoreEventsAvailable()
    
    // If going to last page and more events available, load more
    if (page === totalPages && hasMore && !loadingMore) {
      try {
        setLoadingMore(true)
        const newEvents = await loadMoreEvents(events)
        if (newEvents.length > 0) {
          setEvents(prev => {
            // Merge and sort by date
            const merged = [...prev, ...newEvents]
              .filter((event, index, array) => 
                array.findIndex(e => e.id === event.id) === index
              )
              .sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
            const categories = getEventCategories(merged)
            setAvailableCategories(categories)
            return merged
          })
        }
      } catch (err) {
        console.error('Failed to load more events:', err)
        setError(err instanceof Error ? err.message : 'Failed to load more events')
      } finally {
        setLoadingMore(false)
      }
    }
    
    setCurrentPage(page)
    document.querySelector('.events-section')?.scrollIntoView({ behavior: 'smooth' })
  }, [totalPages, events, loadingMore])

  // Loading state
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
              <span className="refresh-icon"><RefreshCw size={16} /></span>
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

  // Error state
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
              <span className="refresh-icon"><RefreshCw size={16} /></span>
            </button>
          </div>
        </div>
        <div className="events-error">
          <div className="error-icon"><AlertTriangle size={18} /></div>
          <h3>Unable to Load Events</h3>
          <p>{error}</p>
          <button className="refresh-btn" onClick={handleRefresh}>
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
          <div className="header-buttons">
            {isAuthenticated && (
              <>
                <button 
                  className="favorites-btn"
                  onClick={() => setShowFavorites(!showFavorites)}
                  title="View your favorite events"
                >
                  <span className="favorites-icon"><Star size={16} /></span>
                  <span>Favorites</span>
                </button>
              </>
            )}
            <button
              className={`refresh-btn ${isRefreshing ? 'loading' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              title="Refresh events"
            >
              <span className="refresh-icon"><RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} /></span>
            </button>
          </div>
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'}
          {categoryFilter !== 'all' && ` in ${categoryFilter}`}
          {dateFilter !== 'all' && ` for ${dateFilter === 'today' ? 'today' : 'upcoming dates'}`}
        </div>
      )}

      {/* Favorites Section */}
      {showFavorites && (
        <FavoritesSection onClose={() => setShowFavorites(false)} />
      )}

      <div className={`events-grid ${isRefreshing ? 'refreshing' : ''}`}>
        {isRefreshing && (
          <div className="events-refreshing-overlay">
            <div className="refreshing-indicator">
              <span className="loading-spinner-small"></span>
              <span>Refreshing events...</span>
            </div>
          </div>
        )}
        
        {error && events.length > 0 && (
          <div className="events-error-banner">
            <span><AlertTriangle size={14} /> Some events may be cached: {error}</span>
          </div>
        )}
        
        {paginatedEvents.length > 0 ? (
          paginatedEvents.map(event => (
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
                {isAuthenticated ? (
                  <button
                    onClick={async () => {
                      // Check favorite status BEFORE toggling
                      const wasFavorited = isFavorited(event.id)
                      const result = await toggleFavorite(event.id)
                      // If favorited successfully, dispatch event with event data for immediate display
                      if (result) {
                        // Action is the opposite of what it was before (if it was favorited, we removed it)
                        const action = wasFavorited ? 'removed' : 'added'
                        window.dispatchEvent(new CustomEvent('favorites-updated', { 
                          detail: { eventId: event.id, eventData: event, action }
                        }))
                      }
                    }}
                    className={`event-btn save-btn ${isFavorited(event.id) ? 'favorited' : ''}`}
                    title={isFavorited(event.id) ? 'Remove from favorites' : 'Favorite this event'}
                    aria-pressed={isFavorited(event.id)}
                    disabled={isPending && isPending(event.id)}
                  >
                    <span className="save-icon">
                      {isFavorited(event.id) ? <Star size={14} /> : <StarOff size={14} />}
                    </span>
                    {isPending && isPending(event.id) ? 'Favoriting...' : (isFavorited(event.id) ? 'Favorited' : 'Favorite')}
                  </button>
                ) : (
                  <button
                    className="event-btn save-btn disabled"
                    disabled
                    title="Sign in to favorite events"
                  >
                    <span className="save-icon"><StarOff size={14} /></span>
                    Favorite
                  </button>
                )}
              </div>
            </div>
          ))
        ) : allFilteredEvents.length > 0 ? (
          <div className="no-events">
            <div className="no-events-icon"><File size={20} /></div>
            <h3>No events on this page</h3>
            <p>Try going to a different page or adjusting your filters.</p>
          </div>
        ) : (
          <div className="no-events">
            <div className="no-events-icon"><File size={20} /></div>
            <h3>No events found</h3>
            <p>
              {dateFilter === 'today'
                ? "No events scheduled for today. Try 'Upcoming' to see future events."
                : dateFilter === 'upcoming'
                ? "No upcoming events found. Try refreshing or check back later."
                : "Try adjusting your filters or check back later for new OSU events."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEvents.length > EVENTS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={loading || loadingMore}
        />
      )}

      {/* More events info */}
      {hasMoreEventsAvailable() && (
        <div className="more-events-info">
          <p className="remaining-count">
            {getRemainingEventsCount() > 0 && `${getRemainingEventsCount()}+ more events available - `}
            Use pagination to load more events from OSU
          </p>
        </div>
      )}
    </section>
  )
}

export default EventsSection

