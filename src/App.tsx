import { Suspense, lazy, useState } from "react";
import { motion } from "framer-motion";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Button } from "./components/ui/Button";
import {
  Scissors,
  Clock,
  Star,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  ChevronRight,
} from "lucide-react";
import { BookingModal } from "./components/booking/BookingModal";
import "./index.css";

// Wczytuj komponenty na żądanie
const BookingPage = lazy(() => import("./pages/booking/BookingPage"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));

// Fallback podczas ładowania
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-16 h-1 bg-white animate-pulse"></div>
  </div>
);

function LandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black">
      {/* Nawigacja */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/5">
        <Link
          to="/"
          className="text-2xl font-display uppercase tracking-tighter"
        >
          Barbershop<span className="text-white/40">.</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest font-medium">
          <a href="#about" className="hover:text-white/60 transition-colors">
            O nas
          </a>
          <a href="#services" className="hover:text-white/60 transition-colors">
            Usługi
          </a>
          <a href="#gallery" className="hover:text-white/60 transition-colors">
            Galeria
          </a>
          <a href="#contact" className="hover:text-white/60 transition-colors">
            Kontakt
          </a>
        </div>
        <Button
          variant="primary"
          className="bg-white text-black hover:bg-gray-200 rounded-full px-6"
          onClick={() => setIsBookingOpen(true)}
        >
          Rezerwuj
        </Button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <img
            src="/hero-bg.png"
            alt="Wnętrze salonu barberskiego - tło"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-20"></div>
        </div>

        <div className="relative z-30 text-center px-4 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs uppercase tracking-[0.3em] font-medium mb-4">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Najlepszy Barber w Mieście
            </div>
            <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-display uppercase tracking-tighter leading-[0.85]">
              TWOJ
              <br />
              <span className="text-white/20 outline-text">Barbershop</span>
            </h1>
            <p className="text-lg md:text-2xl font-light max-w-2xl mx-auto text-gray-400 tracking-wide mt-8">
              Kultowe miejsce, gdzie tradycja rzemiosła spotyka nowoczesny styl
              życia. Zarezerwuj swoją chwilę relaksu.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button
                size="lg"
                className="w-full sm:w-auto text-xl px-12 py-8 bg-white text-black hover:bg-gray-200 rounded-full transition-all"
                onClick={() => setIsBookingOpen(true)}
              >
                Rezerwuj Termin
              </Button>
              <a href="#services">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-xl px-12 py-8 border-white/20 hover:bg-white/10 rounded-full text-white"
                >
                  Zobacz Usługi
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* O nas */}
      <section id="about" className="py-24 px-6 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-7xl font-display uppercase mb-8">
              Pasja i<br />
              <span className="text-white/40">Precyzja</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Barbershop to nie tylko fryzjer męski. To miejsce z duszą, stworzone
              przez pasjonatów dla mężczyzn, którzy cenią sobie nienaganny
              wygląd i autentyczną atmosferę.
            </p>
            <div className="space-y-4">
              {[
                "Ponad 10 lat doświadczenia",
                "Indywidualne podejście",
                "Profesjonalne kosmetyki premium",
                "Kawa, whisky i dobra muzyka",
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm uppercase tracking-widest font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-square rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700"
          >
            <img
              src="/barber_interior_1_1769884591393.png"
              alt="Designerskie wnętrze salonu barberskiego"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Cechy */}
      <section className="py-24 px-6 border-y border-white/5 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Clock,
              title: "Dostępność 24/7",
              desc: "Rezerwuj wizytę o każdej porze dnia i nocy przez nasz system online.",
            },
            {
              icon: Scissors,
              title: "Mistrzowskie Cięcie",
              desc: "Nasi barberzy to artyści w swoim fachu, stale doskonalący swoje umiejętności.",
            },
            {
              icon: Star,
              title: "Doświadczenie Premium",
              desc: "Zadbamy o każdy detal Twojej wizyty, od wejścia aż po ostatnie cięcie.",
            },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <feat.icon
                className="w-12 h-12 mb-6 text-white"
                strokeWidth={1}
              />
              <h3 className="text-2xl font-display uppercase mb-4 tracking-wider">
                {feat.title}
              </h3>
              <p className="text-gray-400 leading-relaxed font-light">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Usługi */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-display uppercase mb-4">
              Nasze Usługi
            </h2>
            <div className="w-20 h-1 bg-white mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Strzyżenie Klasyczne", price: "80 zł", time: "45 min" },
              {
                name: "Combo (Włosy + Broda)",
                price: "120 zł",
                time: "90 min",
              },
              { name: "Trymowanie Brody", price: "50 zł", time: "30 min" },
              { name: "Odsiwianie", price: "60 zł", time: "30 min" },
              { name: "Strzyżenie Maszynką", price: "40 zł", time: "20 min" },
              { name: "Junior (do 12 lat)", price: "60 zł", time: "30 min" },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-8 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => setIsBookingOpen(true)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-display uppercase tracking-wider">
                    {service.name}
                  </h3>
                  <span className="text-xl font-bold">{service.price}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 uppercase tracking-widest font-medium">
                  <Clock className="w-4 h-4" /> {service.time}
                </div>
                <div className="flex items-center gap-1 text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm uppercase tracking-widest font-bold">
                  Zarezerwuj <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="gallery" className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <h2 className="text-5xl md:text-7xl font-display uppercase">
              Ostatnie
              <br />
              <span className="text-white/40">Realizacje</span>
            </h2>
            <p className="text-gray-400 max-w-md text-right hidden md:block uppercase tracking-widest text-xs font-medium">
              Zajrzyj na nasz Instagram, aby zobaczyć więcej projektów i
              codzienną pracę w barberze.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-3xl aspect-square bg-gray-900 group">
              <img
                src="/barber_interior_3_1769884614796.png"
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                alt="Praca Barbera 1"
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl aspect-square bg-gray-900 group">
              <img
                src="/barber_interior_2_1769884603797.png"
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                alt="Stylizacja brody"
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl aspect-square bg-gray-900 group">
              <img
                src="/hero-bg.png"
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                alt="Klasyczne cięcie"
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl aspect-square bg-gray-900 group">
              <img
                src="/barber_interior_1_1769884591393.png"
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                alt="Praca Barbera 4"
              />
            </div>
            <div className="relative overflow-hidden rounded-3xl aspect-square bg-gray-900 group">
              <img
                src="/barber_interior_3_1769884614796.png"
                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                alt="Praca Barbera 5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
          <div className="space-y-12">
            <h2 className="text-5xl md:text-7xl font-display uppercase">
              Znajdź
              <br />
              <span className="text-white/40">Nas</span>
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-gray-500 mb-1">
                    Adres
                  </h4>
                  <p className="text-xl font-medium">
                    ul. Barbera 12, Warszawa
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-gray-500 mb-1">
                    Telefon
                  </h4>
                  <p className="text-xl font-medium">+48 123 456 789</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm uppercase tracking-widest text-gray-500 mb-1">
                    Godziny Otwarcia
                  </h4>
                  <p className="text-lg font-medium">
                    Poniedziałek - Piątek: 09:00 - 20:00
                  </p>
                  <p className="text-lg font-medium">Sobota: 09:00 - 16:00</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <a
                href="#"
                className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all"
              >
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div className="h-[500px] rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
            {/* Mapa placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mb-4 mx-auto opacity-20" />
                <span className="text-xs uppercase tracking-[0.5em] opacity-20">
                  Widok Mapy
                </span>
              </div>
            </div>
            {/* Warstwa stylizacji mapy */}
            <div className="absolute inset-0 bg-black/50 grayscale mix-blend-multiply pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-display uppercase tracking-tighter">
            Barbershop<span className="text-white/40">.</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.5em] text-gray-500 text-center">
            © 2026 Barbershop. Wszelkie prawa zastrzeżone.
          </div>
          <Link
            to="/login"
            className="text-[10px] uppercase tracking-[0.4em] text-gray-700 hover:text-white transition-colors"
          >
            Panel Administratora
          </Link>
        </div>
      </footer>

      {/* Modal rezerwacji */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      >
        <Suspense fallback={<LoadingFallback />}>
          <BookingPage />
        </Suspense>
      </BookingModal>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<LandingPage />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center">
                <Scissors className="w-16 h-16 mb-6 opacity-20 text-white" />
                <h1 className="text-4xl font-display uppercase mb-2 text-white">
                  404 - Nie znaleziono
                </h1>
                <p className="text-gray-500 mb-8 lowercase tracking-widest">
                  Strona, której szukasz, nie istnieje.
                </p>
                <Link to="/">
                  <Button variant="primary" className="bg-white text-black">
                    Wróć do bazy
                  </Button>
                </Link>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
