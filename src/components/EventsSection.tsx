import React, { useCallback, useEffect, useState } from 'react'
import { useFavorites } from '../hooks/useFavorites'
import type { ProcessedEvent } from '../services/eventsService'
import {
  fetchOSUEvents,
  filterAndSortEvents,
  getEventCategories,
  hasMoreEventsAvailable,
  loadMoreCategoryEvents,
  loadMoreEvents
} from '../services/eventsService'
import FavoritesSection from './FavoritesSection'
import Pagination from './Pagination'

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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [eventsPerPage] = useState(6) // Show 6 events per page (reduced for faster page loads)
  
  // Favorites hook
  const { toggleFavorite, isFavorited, isPending, isAuthenticated } = useFavorites()

  // Helper to merge events and remove duplicates by id while preserving order (prev first)
  const mergeUniqueEvents = (prev: ProcessedEvent[], additions: ProcessedEvent[]) => {
    const seen = new Set<number>()
    const merged: ProcessedEvent[] = []
    for (const e of prev) {
      if (!seen.has(e.id)) {
        merged.push(e)
        seen.add(e.id)
      }
    }
    for (const e of additions) {
      if (!seen.has(e.id)) {
        merged.push(e)
        seen.add(e.id)
      }
    }
    return merged
  }

  // Auto-load more events when filtered results are too few
  useEffect(() => {
    const checkAndLoadMore = async () => {
      const currentFiltered = filterAndSortEvents(events, dateFilter, categoryFilter, false)
      const hasMoreAvailable = hasMoreEventsAvailable()
      
      // If we have fewer than 5 events for a specific category and more are available
      if (categoryFilter !== 'all' && currentFiltered.length < 5 && hasMoreAvailable && !loadingMore) {
        try {
          console.log(`Auto-loading more ${categoryFilter} events due to low count`)
          const newEvents = await loadMoreCategoryEvents(categoryFilter, events)
          if (newEvents.length > 0) {
            setEvents(prevEvents => {
              const merged = mergeUniqueEvents(prevEvents, newEvents)
              // Update available categories based on merged set
              const categories = getEventCategories(merged)
              setAvailableCategories(categories)
              return merged
            })
          }
        } catch (err) {
          console.error('Auto-load more events failed:', err)
        }
      }
    }

    // Small delay to prevent too many rapid requests
    const timeout = setTimeout(checkAndLoadMore, 500)
    return () => clearTimeout(timeout)
  }, [categoryFilter, dateFilter, events, loadingMore])

  const loadEvents = useCallback(async (forceRefresh: boolean = false) => {
    try {
      // Only show main loading spinner on initial load or filter refresh, not on manual refresh
      if (!isRefreshing && events.length === 0) {
        setLoading(true)
      }
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
      if (!isRefreshing) {
        setLoading(false)
      }
    }
  }, [isRefreshing, events.length])

  // Load OSU events on component mount
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleRefresh = async () => {
    if (isRefreshing || loading) return // Prevent double refresh
    
    setIsRefreshing(true)
    try {
      await loadEvents(true) // Force refresh
    } finally {
      // Add a small delay to show the refresh completed state
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    }
  }



  // Filter events and apply pagination - sort by popularity for first 2 pages
  const shouldSortByPopularity = currentPage <= 2
  const allFilteredEvents = filterAndSortEvents(events, dateFilter, categoryFilter, shouldSortByPopularity)
  
  // Debug logging
  console.log('Filter State:', { dateFilter, categoryFilter, totalEvents: events.length, filteredEvents: allFilteredEvents.length })
  
  const totalPages = Math.ceil(allFilteredEvents.length / eventsPerPage)
  const startIndex = (currentPage - 1) * eventsPerPage
  const endIndex = startIndex + eventsPerPage
  const filteredEvents = allFilteredEvents.slice(startIndex, endIndex)
  
  // Removed remaining-count UI; helpers no longer needed here

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateFilter, categoryFilter])

  // Handle page change - load more events if needed
  const handlePageChange = async (page: number) => {
    const allFilteredEvents = filterAndSortEvents(events, dateFilter, categoryFilter, page <= 2)
    const totalPages = Math.ceil(allFilteredEvents.length / eventsPerPage)
    const hasMoreAvailable = hasMoreEventsAvailable()
    
    // If we're going to the last page and there are more events available, load more
    if (page === totalPages && hasMoreAvailable && !loadingMore) {
      try {
        setLoadingMore(true)
        let newEvents: ProcessedEvent[]
        
        if (categoryFilter === 'all') {
          newEvents = await loadMoreEvents(events)
        } else {
          newEvents = await loadMoreCategoryEvents(categoryFilter, events)
        }

        if (newEvents.length > 0) {
          setEvents(prevEvents => {
            const merged = mergeUniqueEvents(prevEvents, newEvents)
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
    // Scroll to top of events section
    document.querySelector('.events-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Handle filter changes - filters should work immediately on loaded events
  const handleDateFilterChange = (newFilter: 'all' | 'today' | 'upcoming') => {
    console.log('Date filter changed to:', newFilter)
    setDateFilter(newFilter)
    setCurrentPage(1)
  }

  // Handle category filter changes - filters should work immediately on loaded events  
  const handleCategoryFilterChange = (newCategory: string) => {
    console.log('Category filter changed to:', newCategory)
    setCategoryFilter(newCategory)
    setCurrentPage(1)
  }

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
          <div className="header-buttons">
            {isAuthenticated && (
              <>
                <button 
                  className="favorites-btn"
                  onClick={() => setShowFavorites(!showFavorites)}
                  title="View your favorite events"
                >
                  <span className="favorites-icon">⭐</span>
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
              <span className="refresh-icon">
                {isRefreshing ? '↻' : '↻'}
              </span>
            </button>
          </div>
        </div>
        <div className="events-filters">
          <div className="date-filters">
            <button 
              className={`filter-btn ${dateFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleDateFilterChange('all')}
            >
              All Events
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'today' ? 'active' : ''}`}
              onClick={() => handleDateFilterChange('today')}
            >
              Today
            </button>
            <button 
              className={`filter-btn ${dateFilter === 'upcoming' ? 'active' : ''}`}
              onClick={() => handleDateFilterChange('upcoming')}
            >
              Upcoming
            </button>
          </div>
          
          <div className="category-filter">
            <select 
              value={categoryFilter} 
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
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

      {allFilteredEvents.length > 0 && (
        <div className="events-count">
          Showing {startIndex + 1}-{Math.min(endIndex, allFilteredEvents.length)} of {allFilteredEvents.length} event{allFilteredEvents.length === 1 ? '' : 's'}
          {categoryFilter !== 'all' && ` in ${categoryFilter}`}
          {dateFilter !== 'all' && ` for ${
            dateFilter === 'today' ? 'today' : 
            dateFilter === 'upcoming' ? 'upcoming dates' : 'all dates'
          }`}
          {currentPage <= 2 && ' (popular events first)'}
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
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
                {isAuthenticated ? (
                  <button
                    onClick={() => toggleFavorite(event.id)}
                    className={`event-btn save-btn ${isFavorited(event.id) ? 'favorited' : ''}`}
                    title={isFavorited(event.id) ? 'Remove from favorites' : 'Favorite this event'}
                    aria-pressed={isFavorited(event.id)}
                  >
                    <span className="save-icon">
                      {isFavorited(event.id) ? '⭐' : '☆'}
                    </span>
                    {isPending && isPending(event.id) ? 'Favoriting...' : (isFavorited(event.id) ? 'Favorited' : 'Favorite')}
                  </button>
                ) : (
                  <button
                    className="event-btn save-btn disabled"
                    disabled
                    title="Sign in to favorite events"
                  >
                    <span className="save-icon">☆</span>
                    Favorite
                  </button>
                )}
              </div>
            </div>
          ))
        ) : allFilteredEvents.length > 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📄</div>
            <h3>No events on this page</h3>
            <p>Try going to a different page or adjusting your filters.</p>
          </div>
        ) : (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No events found</h3>
            <p>
              {dateFilter === 'today' 
                ? "No events scheduled for today. Try 'Upcoming' to see future events."
                : dateFilter === 'upcoming' 
                ? "No upcoming events found. The events may be cached - try refreshing."
                : "Try adjusting your filters or check back later for new OSU events."
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {allFilteredEvents.length > eventsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={loading || loadingMore}
        />
      )}

      {/* Removed the "more events" footer message per request */}
    </section>
  )
}

export default EventsSection
