import React, { useState } from 'react'
import Sidebar from './Sidebar'
import AISummary from './AISummary'
import Weather from './Weather'
import EventsSection from './EventsSection'

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header with menu button */}
        <header className="main-header">
          <button 
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <span className="hamburger"></span>
            <span className="hamburger"></span>
            <span className="hamburger"></span>
          </button>
          <h1 className="page-title">Stillwater Today</h1>
        </header>

        {/* Scrollable content */}
        <main className="scrollable-content">
          {/* AI Summary Section */}
          <AISummary />
          
          {/* Weather Section */}
          <Weather />
          
          {/* Events Section */}
          <EventsSection />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
