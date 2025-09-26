import React, { useState } from 'react'
import { testFirebaseAuth, testCreateUser } from '../firebase/firebaseui'

const DebugAuth: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleTestSignIn = async () => {
    if (!email || !password) {
      setResult('Please enter both email and password')
      return
    }

    setLoading(true)
    setResult('Testing sign-in...')
    
    const result = await testFirebaseAuth(email, password)
    
    if (result.success) {
      setResult('✅ Sign-in successful! Check console for details.')
    } else {
      setResult(`❌ Sign-in failed: ${result.error?.code} - ${result.error?.message}`)
    }
    
    setLoading(false)
  }

  const handleTestCreateUser = async () => {
    if (!email || !password) {
      setResult('Please enter both email and password')
      return
    }

    setLoading(true)
    setResult('Testing user creation...')
    
    const result = await testCreateUser(email, password)
    
    if (result.success) {
      setResult('✅ User creation successful! Check console for details.')
    } else {
      setResult(`❌ User creation failed: ${result.error?.code} - ${result.error?.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div style={{ 
      padding: '2rem', 
      border: '2px solid #f97316', 
      borderRadius: '12px', 
      margin: '2rem 0',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      color: '#f8fafc'
    }}>
      <h3 style={{ color: '#f97316', marginBottom: '1rem' }}>🔧 Debug Authentication</h3>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
        Use this to test Firebase authentication directly and see detailed error messages in the console.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #475569',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            color: '#f8fafc',
            fontSize: '1rem'
          }}
        />
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #475569',
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            color: '#f8fafc',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={handleTestSignIn}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Testing...' : 'Test Sign In'}
        </button>
        
        <button
          onClick={handleTestCreateUser}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Testing...' : 'Test Create User'}
        </button>
      </div>
      
      {result && (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          borderRadius: '8px',
          border: '1px solid #475569',
          color: '#f8fafc',
          fontSize: '0.9rem'
        }}>
          {result}
        </div>
      )}
      
      <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
        <p>💡 <strong>Instructions:</strong></p>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li>Open browser DevTools (F12) and go to Console tab</li>
          <li>Enter test credentials and click "Test Sign In" or "Test Create User"</li>
          <li>Check console for detailed error messages and debugging info</li>
          <li>This bypasses FirebaseUI to test raw Firebase Auth</li>
        </ul>
      </div>
    </div>
  )
}

export default DebugAuth
