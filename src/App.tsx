import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import NavBar from './components/NavBar'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import MapPage from './pages/MapPage'
import ItineraryPage from './pages/ItineraryPage'
import BookingsPage from './pages/BookingsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-full flex-col">
        <main className="order-1 flex-1">
          <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-5 md:pb-12 md:pt-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stay" element={<CategoryPage category="stay" />} />
              <Route path="/eat" element={<CategoryPage category="eat" />} />
              <Route path="/do" element={<CategoryPage category="do" />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/itinerary" element={<ItineraryPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        <div className="order-2 md:order-first">
          <NavBar />
        </div>
      </div>
    </HashRouter>
  )
}
