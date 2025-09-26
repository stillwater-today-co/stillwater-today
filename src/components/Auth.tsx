import React, { useEffect, useRef } from 'react'
import { ui, uiConfig } from '../firebase/firebaseui'
import 'firebaseui/dist/firebaseui.css'

const Auth: React.FC = () => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      console.log('Starting FirebaseUI widget...')
      console.log('Element ref:', elementRef.current)
      console.log('UI config:', uiConfig)
      
      try {
        // Start the FirebaseUI widget
        ui.start(elementRef.current, uiConfig)
        console.log('FirebaseUI widget started successfully')
      } catch (error) {
        console.error('Error starting FirebaseUI widget:', error)
      }
    }
  }, [])

  return (
    <div className="auth-container">
      <h2>Sign In to Stillwater Today</h2>
      <div ref={elementRef}></div>
    </div>
  )
}

export default Auth
