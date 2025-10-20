import React, { useState } from 'react'

const EventsSection: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all')

  // Placeholder events data
  const events = [
    {
      id: 1,
      title: "Stillwater Farmers Market",
      date: "Today, 8:00 AM - 1:00 PM",
      location: "Downtown Stillwater",
      type: "Community",
      description: "Fresh local produce, crafts, and live music every Saturday morning."
    },
    {
      id: 2,
      title: "City Council Meeting",
      date: "Monday, 7:00 PM",
      location: "City Hall",
      type: "Government",
      description: "Monthly city council meeting to discuss local issues and proposals."
    },
    {
      id: 3,
      title: "Stillwater Arts Festival",
      date: "Next Saturday, 10:00 AM - 6:00 PM",
      location: "Boone Pickens Stadium",
      type: "Arts & Culture",
      description: "Annual celebration of local artists, musicians, and craftspeople."
    },
    {
      id: 4,
      title: "High School Football Game",
      date: "Friday, 7:30 PM",
      location: "Stillwater High School",
      type: "Sports",
      description: "Homecoming game against rival team. Come support the Pioneers!"
    }
  ]

  const filteredEvents = events.filter(event => {
    if (filter === 'today') return event.date.includes('Today')
    if (filter === 'upcoming') return !event.date.includes('Today')
    return true
  })

  return (
    <section className="events-section">
      <div className="events-header">
        <h2>Events & Activities</h2>
        <div className="events-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Events
          </button>
          <button 
            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            Today
          </button>
          <button 
            className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="event-card">
              <div className="event-header">
                <h3 className="event-title">{event.title}</h3>
                <span className={`event-type ${event.type.toLowerCase().replace(' & ', '-')}`}>
                  {event.type}
                </span>
              </div>
              <div className="event-details">
                <div className="event-detail">
                  <span className="detail-icon">📅</span>
                  <span>{event.date}</span>
                </div>
                <div className="event-detail">
                  <span className="detail-icon">📍</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="event-description">{event.description}</p>
              <button className="event-btn">Learn More</button>
            </div>
          ))
        ) : (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or check back later for new events.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default EventsSection
