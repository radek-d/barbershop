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
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4 selection:bg-white selection:text-black overflow-x-hidden">
              {/* Premium Hero Background */}
              <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <img 
                  src="/hero-bg.png" 
                  alt="Barbershop Background" 
                  className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-20"></div>
              </div>

              <div className="max-w-6xl w-full text-center space-y-16 relative z-30">
                {/* Hero Section */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="inline-block"
                  >
                    <div className="p-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-md">
                      <Scissors className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1} />
                    </div>
                  </motion.div>
                  
                  <div className="space-y-4">
                    <motion.h1 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-display uppercase tracking-tighter leading-[0.85] text-white"
                    >
                      Dziupla<br/>
                      <span className="text-white/40">Barbershop</span>
                    </motion.h1>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "80px" }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                      className="h-1 bg-white mx-auto"
                    ></motion.div>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      className="text-lg md:text-2xl font-light max-w-2xl mx-auto text-gray-300 tracking-wide"
                    >
                      Kultowe miejsce, gdzie tradycja rzemiosła<br className="hidden md:block"/> spotyka nowoczesny styl życia.
                    </motion.p>
                  </div>
                </div>

                {/* Features Section - Glassmorphism */}
                <div className="grid md:grid-cols-3 gap-6 py-8">
                  {[
                    { icon: Clock, title: "Szybko", desc: "System rezerwacji działający 24/7" },
                    { icon: Scissors, title: "Mistrzowsko", desc: "Precyzja w każdym cięciu i detalu" },
                    { icon: Star, title: "Premium", desc: "Wyjątkowa atmosfera i topowe kosmetyki" }
                  ].map((feat, i) => (
                    <motion.div
                      key={feat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 + (i * 0.1) }}
                      className="group p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <feat.icon className="w-10 h-10 mx-auto mb-4 text-white group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                      <h3 className="text-2xl font-display uppercase mb-2 tracking-wider">{feat.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed">{feat.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Section */}
                <div className="space-y-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    <Link to="/booking">
                      <Button 
                        size="lg" 
                        className="text-xl sm:text-2xl px-8 sm:px-16 py-6 sm:py-8 h-auto bg-white text-black hover:bg-gray-200 rounded-full group relative overflow-hidden transition-all shadow-2xl hover:shadow-white/10"
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          Zarezerwuj teraz <Scissors className="w-6 h-6 rotate-90" />
                        </span>
                      </Button>
                    </Link>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.6 }}
                    className="flex flex-col items-center gap-4 pt-4"
                  >
                    <Link to="/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors tracking-widest uppercase">
                      Panel Właściciela
                    </Link>
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-gray-500 text-center">
                      <span className="text-xs uppercase tracking-tighter">Warszawa, ul. Barbera 12</span>
                      <span className="text-xs uppercase tracking-tighter">Pon - Sob: 09:00 - 20:00</span>
                    </div>
                  </motion.div>
                </div>

                {/* Footer */}
                <div className="pt-12 border-t border-white/10 mt-12 opacity-30 text-[10px] uppercase tracking-[0.5em]">
                  <p>© 2026 Dziupla Barbershop. All rights reserved.</p>
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
