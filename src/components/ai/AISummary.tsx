import { Bot } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { generateTodayEventsSummary } from '../../services/briefingService';
import { fetchRandomQuote } from '../../services/quotesService';

const AISummary: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [weatherBullet, setWeatherBullet] = useState<string>('')
  const [eventsBullet, setEventsBullet] = useState<string>('')
  const [quoteBullet, setQuoteBullet] = useState<string>('')

  // Parse the AI-generated summary into two bullets: weather and events.
  const parseSummaryToBullets = useCallback((text: string) => {
    const result = { weather: '', events: '' }
    if (!text) return result

    // Try to find explicit headings first (Weather / Events)
    const weatherMatch = text.match(/weather\s*[:\-–]\s*([\s\S]*?)(?=events\s*[:\-–]|$)/i)
    const eventsMatch = text.match(/events?\s*[:\-–]\s*([\s\S]*?)$/i)

    if (weatherMatch || eventsMatch) {
      result.weather = (weatherMatch && weatherMatch[1].trim()) || ''
      result.events = (eventsMatch && eventsMatch[1].trim()) || ''
      return result
    }

    // Fallback: split into sentences and distribute roughly in half
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]
    const n = sentences.length
    if (n === 1) {
      // If only one sentence, use it for events
      result.weather = ''
      result.events = sentences[0].trim()
      return result
    }

    const half = Math.max(1, Math.ceil(n / 2))
    result.weather = sentences.slice(0, half).join(' ').trim()
    result.events = sentences.slice(half).join(' ').trim()
    return result
  }, [])

  const loadSummary = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setIsLoading(true)
      setError(null)
      const text = await generateTodayEventsSummary({ limit: 10, forceRefresh })
      setSummary(text)
      const { weather, events } = parseSummaryToBullets(text)
      setWeatherBullet(weather)
      setEventsBullet(events)
      
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
  }, [parseSummaryToBullets])

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
              <li><strong>Weather:</strong> {weatherBullet || 'No weather summary available.'}</li>
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
