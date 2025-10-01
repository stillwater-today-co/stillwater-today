import React, { useRef, useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { firestore } from '../firebase/firestore'
import { auth } from '../firebase/auth'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const { user } = useAuth()
  const messageRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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
      <h1>Stillwater Today</h1>
      <div className="user-info">
        <span className="welcome">Welcome, {user?.displayName || user?.email || 'User'}!</span>
        <button className="sign-out-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
      <p className="description">Submit a message to our Firebase database:</p>
      
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

      {submitStatus === 'success' && (
        <p className="success-message">
          ✅ Message sent successfully!
        </p>
      )}
      
      {submitStatus === 'error' && (
        <p className="error-message">
          ❌ Failed to send message. Please try again.
        </p>
      )}
    </div>
  )
}

export default Home
