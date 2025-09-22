import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        {/* Show auth page for unauthenticated users */}
        <ProtectedRoute requireAuth={false} fallback={<Home />}>
          <AuthPage />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  )
}

export default App