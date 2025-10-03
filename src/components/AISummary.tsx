import React, { useState } from 'react'

const AISummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <section className="ai-summary">
      <div className="summary-header">
        <h2>Daily Summary</h2>
        <button 
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      <div className="summary-content">
        {isLoading ? (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Generating your daily summary...</p>
          </div>
        ) : (
          <div className="summary-placeholder">
            <div className="placeholder-icon">🤖</div>
            <h3>AI Summary Coming Soon</h3>
            <p>
              This section will display an intelligent summary of today's most important 
              news, events, and updates relevant to Stillwater. The AI will analyze 
              multiple sources and provide you with a concise, personalized overview.
            </p>
            <div className="placeholder-features">
              <div className="feature-item">
                <span className="feature-icon">📰</span>
                <span>Local News Highlights</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span>Upcoming Events</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌤️</span>
                <span>Weather Insights</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default AISummary
