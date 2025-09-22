import React, { useRef, useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { firestore } from '../firebase/firestore'
import { useAuthContext } from '../hooks/useAuthContext'
import LogoutButton from '../components/auth/LogoutButton'

const Home = () => {
  const { user, isAuthenticated } = useAuthContext()
  const messageRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    if (!messageRef.current) {
      setIsSubmitting(false)
      return
    }

    const message = messageRef.current.value.trim()
    if (!message) {
      setIsSubmitting(false)
      return
    }

    try {
      await addDoc(collection(firestore, 'messages'), {
        text: message,
        createdAt: new Date(),
      })
      
      messageRef.current.value = ''
      setSubmitStatus('success')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } catch (error) {
      console.error('Error adding message:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="message-form">
      <div className="header">
        <h1>Stillwater Today</h1>
        {isAuthenticated && (
          <div className="user-info">
            <span>Welcome, {user?.displayName || user?.email}!</span>
            <LogoutButton />
          </div>
        )}
      </div>
      
      {isAuthenticated ? (
        <p>Submit a message to our Firebase database:</p>
      ) : (
        <p>Please sign in to submit messages.</p>
      )}
      
      {isAuthenticated && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="message">Your Message</label>
          <input
            id="message"
            type="text"
            ref={messageRef}
            placeholder="Enter your message here..."
            disabled={isSubmitting}
            required
          />
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}

      {submitStatus === 'success' && (
        <p style={{ color: '#4caf50', textAlign: 'center' }}>
          ✅ Message sent successfully!
        </p>
      )}
      
      {submitStatus === 'error' && (
        <p style={{ color: '#f44336', textAlign: 'center' }}>
          ❌ Failed to send message. Please try again.
        </p>
      )}
    </div>
  )
}

export default Home