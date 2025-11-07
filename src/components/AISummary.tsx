import { Bot } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { generateTodayEventsSummary } from '../briefing/briefingService'

const AISummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  async function loadSummary(forceRefresh: boolean = false) {
    try {
      setIsLoading(true)
      setError(null)
      const text = await generateTodayEventsSummary({ limit: 10, forceRefresh })
      setSummary(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate summary')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSummary(false)
  }, [])

  const handleRefresh = () => {
    loadSummary(true)
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
        {isLoading && (
          <div className="loading-placeholder">
            <div className="loading-spinner"></div>
            <p>Generating your daily summary...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="summary-placeholder">
            <div className="placeholder-icon"><Bot color="#64748b" size={28} /></div>
            <h3>Unable to generate summary</h3>
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && summary && (
          <div className="summary-text">
            <p>{summary}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default AISummary
