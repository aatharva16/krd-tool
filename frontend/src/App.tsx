import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { GeneratePage } from './pages/GeneratePage'
import { ProfilesPage } from './pages/ProfilesPage'
import { HistoryPage } from './pages/HistoryPage'
import { ProfileSelector } from './components/ProfileSelector'
import { useProfileStore } from './store/profileStore'
import { getProfiles } from './api/profilesClient'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const setProfiles = useProfileStore((s) => s.setProfiles)

  // Fetch profiles once on app load so every page (Generate, Profiles) has the
  // full profiles list in the store — not just the persisted activeProfileId.
  useEffect(() => {
    getProfiles()
      .then(setProfiles)
      .catch(() => { /* non-fatal — UI degrades gracefully */ })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand + nav */}
          <div className="flex items-center gap-6">
            <div>
              <Link to="/" className="text-lg font-semibold text-gray-900 hover:text-gray-700">
                KRD Tool
              </Link>
            </div>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Generate
              </Link>
              <Link
                to="/profiles"
                className={`font-medium transition-colors ${
                  location.pathname === '/profiles'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Profiles
              </Link>
              <Link
                to="/history"
                className={`font-medium transition-colors ${
                  location.pathname === '/history'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                History
              </Link>
            </nav>
          </div>

          {/* Active profile selector */}
          <ProfileSelector />
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <GeneratePage />
            </Layout>
          }
        />
        <Route
          path="/profiles"
          element={
            <Layout>
              <ProfilesPage />
            </Layout>
          }
        />
        <Route
          path="/history"
          element={
            <Layout>
              <HistoryPage />
            </Layout>
          }
        />
        <Route
          path="/generate/:sessionId"
          element={
            <Layout>
              <GeneratePage />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
