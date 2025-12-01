import { Bot } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { fetchRandomQuote, generateTodayEventsSummary } from '../../services/ai';

const AISummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [eventsBullet, setEventsBullet] = useState<string>('')
  const [quoteBullet, setQuoteBullet] = useState<string>('')

  const loadSummary = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const text = await generateTodayEventsSummary({ limit: 10, forceRefresh })
      setSummary(text)
      // Use the entire summary text for events (includes weather + events)
      setEventsBullet(text)
      
      // Always fetch a real positive quote from ZenQuotes instead of parsing from AI
      let quoteBullet = ''
      try {
        const q = await fetchRandomQuote()
        quoteBullet = `${q.text} — ${q.author}`
      } catch (err) {
        // log the error but don't break the UI
        console.debug('fetchRandomQuote failed', err)
        quoteBullet = 'Have a great day!'
      }

      // ensure we update component state with the fetched quote
      setQuoteBullet(quoteBullet)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate summary')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary(false)
  }, [loadSummary])

  return (
    <section className="ai-summary">
      <div className="summary-header">
        <h2>Daily Summary</h2>
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
            <p>Hello Friend!</p>
            <ul className="ai-summary-bullets">
              <li><strong>Events:</strong> {eventsBullet || summary}</li>
              <li><strong>Today's positive quote:</strong> {quoteBullet || 'Have a great day!'}</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default AISummary
