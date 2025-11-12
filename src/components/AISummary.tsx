import { Bot } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { generateTodayEventsSummary } from '../briefing/briefingService';

const AISummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [weatherBullet, setWeatherBullet] = useState<string>('')
  const [eventsBullet, setEventsBullet] = useState<string>('')
  const [quoteBullet, setQuoteBullet] = useState<string>('')

  const loadSummary = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const text = await generateTodayEventsSummary({ limit: 10, forceRefresh })
      setSummary(text)
      const { weather, events, quote } = parseSummaryToBullets(text)
      setWeatherBullet(weather)
      setEventsBullet(events)
      setQuoteBullet(quote)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate summary')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary(false)
  }, [loadSummary])

  // Parse the AI-generated summary into three bullets: weather, events, and quote.
  function parseSummaryToBullets(text: string) {
    const result = { weather: '', events: '', quote: '' }
    if (!text) return result

    // Try to find explicit headings first (Weather / Events / Quote)
    const weatherMatch = text.match(/weather\s*[:\-–]\s*([\s\S]*?)(?=events\s*[:\-–]|quote\s*[:\-–]|$)/i)
    const eventsMatch = text.match(/events?\s*[:\-–]\s*([\s\S]*?)(?=quote\s*[:\-–]|$)/i)
    const quoteMatch = text.match(/quote\s*[:\-–]\s*([\s\S]*?)$/i)

    if (weatherMatch || eventsMatch || quoteMatch) {
      result.weather = (weatherMatch && weatherMatch[1].trim()) || ''
      result.events = (eventsMatch && eventsMatch[1].trim()) || ''
      result.quote = (quoteMatch && quoteMatch[1].trim()) || ''
      return result
    }

    // Fallback: split into sentences and distribute roughly into three parts
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]
    const n = sentences.length
    if (n === 1) {
      // If only one sentence, use it for events and provide defaults
      result.weather = ''
      result.events = sentences[0].trim()
      result.quote = "Have a great day!"
      return result
    }

    const oneThird = Math.max(1, Math.ceil(n / 3))
    const twoThird = Math.max(oneThird + 1, Math.ceil((2 * n) / 3))

    result.weather = sentences.slice(0, oneThird).join(' ').trim()
    result.events = sentences.slice(oneThird, twoThird).join(' ').trim()
    result.quote = sentences.slice(twoThird).join(' ').trim() || "Have a great day!"
    return result
  }

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
            <p>hello friend,</p>
            <ul className="ai-summary-bullets">
              <li><strong>Weather:</strong> {weatherBullet || 'No weather summary available.'}</li>
              <li><strong>Events:</strong> {eventsBullet || summary}</li>
              <li><strong>Today\'s positive quote:</strong> {quoteBullet || 'Have a great day!'}</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

export default AISummary
