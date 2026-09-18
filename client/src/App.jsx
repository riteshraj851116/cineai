import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';

// Global Layout Shells & Error Boundaries
import { CineErrorBoundary } from './components/ui/CineErrorBoundary';
import { CineLayout } from './components/layout/CineLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public & Patron Pages
import { Home } from './pages/Home';
import { Movies } from './pages/Movies';
import { MovieDetails } from './pages/MovieDetails';
import { Cinemas } from './pages/Cinemas';
import { CinemaDetails } from './pages/CinemaDetails';
import { Schedule } from './pages/Schedule';
import { Watchlist } from './pages/Watchlist';
import { Notifications } from './pages/Notifications';
import { AIPage } from './pages/AIPage';
import { Community } from './pages/Community';
import { BookingFlow } from './pages/BookingFlow';
import { TicketView } from './pages/TicketView';
import { MyBookings } from './pages/MyBookings';
import { Recommendations } from './pages/Recommendations';
import { Rewards } from './pages/Rewards';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';


// Administrative Dashboards
import { AdminDashboard } from './pages/AdminDashboard';
import { TheatreOwnerDashboard } from './pages/TheatreOwnerDashboard';

export default function App() {
  return (
    <CineErrorBoundary>
      <AuthProvider>
        <CityProvider>
          <SocketProvider>
            <NotificationProvider>
              <ToastProvider>
                <Router>
                  <Routes>
                    {/* 1. Administrative & Partner Control Rooms */}
                    <Route
                      path="/admin"
                      element={
                        <DashboardLayout title="CINEMA CONTROL ROOM">
                          <AdminDashboard />
                        </DashboardLayout>
                      }
                    />
                    <Route
                      path="/theatre-owner"
                      element={
                        <DashboardLayout title="THEATRE PARTNER SUITE">
                          <TheatreOwnerDashboard />
                        </DashboardLayout>
                      }
                    />

                    {/* 2. Public Cinematic Platform Pages (Wrapped in CineLayout) */}
                    <Route
                      path="/"
                      element={
                        <CineLayout>
                          <Home />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/movies"
                      element={
                        <CineLayout>
                          <Movies />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/movies/:id"
                      element={
                        <CineLayout>
                          <MovieDetails />
                        </CineLayout>
                      }
                    />
                    {/* Backwards compatibility alias */}
                    <Route
                      path="/movie/:id"
                      element={
                        <CineLayout>
                          <MovieDetails />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/cinemas"
                      element={
                        <CineLayout>
                          <Cinemas />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/cinemas/:id"
                      element={
                        <CineLayout>
                          <CinemaDetails />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/schedule"
                      element={
                        <CineLayout>
                          <Schedule />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/watchlist"
                      element={
                        <CineLayout>
                          <Watchlist />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <CineLayout>
                          <Notifications />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/ai"
                      element={
                        <CineLayout>
                          <AIPage />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/community"
                      element={
                        <CineLayout>
                          <Community />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/booking/:showId"
                      element={
                        <CineLayout>
                          <BookingFlow />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/ticket/:bookingId"
                      element={
                        <CineLayout>
                          <TicketView />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/bookings"
                      element={
                        <CineLayout>
                          <MyBookings />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/recommendations"
                      element={
                        <CineLayout>
                          <Recommendations />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/rewards"
                      element={
                        <CineLayout>
                          <Rewards />
                        </CineLayout>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <CineLayout>
                          <Profile />
                        </CineLayout>
                      }
                    />

                    {/* 3. Global 404 Route */}
                    <Route
                      path="*"
                      element={
                        <CineLayout>
                          <NotFound />
                        </CineLayout>
                      }
                    />
                  </Routes>
                </Router>
              </ToastProvider>
            </NotificationProvider>
          </SocketProvider>
        </CityProvider>
      </AuthProvider>
    </CineErrorBoundary>
  );
}
