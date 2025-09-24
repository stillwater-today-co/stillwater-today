import React, { useEffect, useRef } from 'react'
import { ui, uiConfig } from '../firebase/firebaseui'

const Auth: React.FC = () => {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      // Start the FirebaseUI widget
      ui.start(elementRef.current, uiConfig)
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
