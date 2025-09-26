import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Home from './pages/Home'
import DebugAuth from './components/DebugAuth'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="App">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="App">
      {user ? <Home /> : <Auth />}
      <DebugAuth />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
