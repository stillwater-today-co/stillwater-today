import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/layout.css'
import './styles/auth.css'
import './styles/profile.css'
import './styles/summary.css'
import './styles/weather.css'
import './styles/events.css'
import './styles/favorites.css'
import './styles/pagination.css'
import './styles/responsive.css'
import './styles/App.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
