import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Button } from './components/ui/Button';
import { Scissors, Clock, Star } from 'lucide-react';
import './index.css';

// Lazy loading components
const BookingPage = lazy(() => import('./pages/booking/BookingPage'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-16 h-1 bg-black animate-pulse"></div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/b/:slug" element={<BookingPage />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
                <Scissors className="w-16 h-16 mb-6 opacity-20" />
                <h1 className="text-4xl font-display uppercase mb-2">404 - Nie znaleziono</h1>
                <p className="text-gray-500 mb-8">Strona, której szukasz, nie istnieje lub została przeniesiona.</p>
                <Link to="/">
                  <Button variant="primary">Wróć do strony głównej</Button>
                </Link>
              </div>
            }
          />
          <Route
            path="/"
            element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4 selection:bg-black selection:text-white">
              {/* Subtle Ambient Background */}
              <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#000_1px,transparent_1px)] bg-[length:24px_24px]"></div>
              </div>

              <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
                {/* Hero Section */}
                <div className="space-y-6">
                  <div className="inline-block">
                    <Scissors className="w-20 h-20 mx-auto mb-6" strokeWidth={1.5} />
                  </div>
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-7xl md:text-8xl lg:text-9xl font-display uppercase tracking-tight text-balance leading-none"
                  >
                    Dziupla<br/>Barbershop
                  </motion.h1>
                  <div className="w-24 h-1 bg-black mx-auto"></div>
                  <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto text-gray-700">
                    Tradycyjne rzemiosło fryzjerskie w nowoczesnym wydaniu
                  </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-8 py-12">
                  <div className="space-y-3">
                    <Clock className="w-10 h-10 mx-auto" strokeWidth={1.5} />
                    <h3 className="text-xl font-display uppercase">Szybko</h3>
                    <p className="text-sm text-gray-600">Rezerwuj wizytę online w kilka sekund</p>
                  </div>
                  <div className="space-y-3">
                    <Scissors className="w-10 h-10 mx-auto" strokeWidth={1.5} />
                    <h3 className="text-xl font-display uppercase">Profesjonalnie</h3>
                    <p className="text-sm text-gray-600">Doświadczeni barberzy, najwyższa jakość</p>
                  </div>
                  <div className="space-y-3">
                    <Star className="w-10 h-10 mx-auto" strokeWidth={1.5} />
                    <h3 className="text-xl font-display uppercase">Wyjątkowo</h3>
                    <p className="text-sm text-gray-600">Indywidualne podejście do każdego klienta</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-6">
                  <Link to="/booking">
                    <Button 
                      size="lg" 
                      className="text-xl px-12 py-6 h-auto group relative overflow-hidden transition-all hover:scale-105 active:scale-95"
                    >
                      <span className="relative z-10">Zarezerwuj wizytę</span>
                      <div className="absolute inset-0 bg-gray-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Button>
                  </Link>
                  <div className="text-sm text-gray-500">
                    <Link to="/dashboard" className="hover:text-black transition-colors underline">
                      Panel właściciela
                    </Link>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-12 border-t-2 border-black mt-12">
                  <p className="text-sm text-gray-600">
                    © 2026 Dziupla Barbershop. Wszystkie prawa zastrzeżone.
                  </p>
                </div>
              </div>
            </div>
          }
        />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
