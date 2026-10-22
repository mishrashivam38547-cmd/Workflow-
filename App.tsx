import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { StoreProvider } from './store/Store';
import { AuthProvider } from './auth/Auth';
import { LangProvider } from './i18n/Lang';
import { UiProvider } from './ui/Ui';

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <LangProvider>
    <StoreProvider>
    <AuthProvider>
      <BrowserRouter>
      <UiProvider>
        <ScrollToTop />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/creator/:id" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </UiProvider>
      </BrowserRouter>
    </AuthProvider>
    </StoreProvider>
    </LangProvider>
  );
}
