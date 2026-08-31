import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Lobby } from './pages/Lobby';
import { GameMatch } from './pages/GameMatch';
import { HowToPlay } from './pages/HowToPlay';
import { CasesArchive } from './pages/CasesArchive';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { LegalView } from './pages/LegalView';
import { JoinRoom } from './pages/JoinRoom';
import { NotFound } from './pages/NotFound';
import { Admin } from './pages/Admin';

export function App() {
  useEffect(() => {
    // Register Service Worker for PWA offline caching if supported
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) =>
            registration.addEventListener('updatefound', () =>
              document.dispatchEvent(new Event('service-worker-update')),
            ),
          )
          .catch(() => undefined);
      });
    }
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lobby/:roomId" element={<Lobby />} />
              <Route path="/match/:roomId" element={<GameMatch />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/cases" element={<CasesArchive />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/legal/:page" element={<LegalView />} />
              <Route path="/join" element={<JoinRoom />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
