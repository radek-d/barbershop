import { Suspense, lazy } from 'react';
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
            path="/"
            element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4">
              <div className="max-w-4xl w-full text-center space-y-12">
                {/* Hero Section */}
                <div className="space-y-6">
                  <div className="inline-block">
                    <Scissors className="w-20 h-20 mx-auto mb-6" strokeWidth={1.5} />
                  </div>
                  <h1 className="text-7xl md:text-8xl lg:text-9xl font-display uppercase tracking-tight text-balance leading-none">
                    Dziupla<br/>Barbershop
                  </h1>
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
                    <Button size="lg" className="text-xl px-12 py-6 h-auto">
                      Zarezerwuj wizytę
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
