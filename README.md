# Dziupla Barbershop - Premium Booking System

Ekskluzywny system rezerwacji online dla nowoczesnego barbershopu. Zbudowany z dbałością o detale, wydajność i luksusowe doświadczenie użytkownika.

## ✨ Główne Cechy

- **Premium UI/UX:** Nowoczesny, ciemny styl z efektami glassmorphism i kinowym tłem.
- **Optymalizacja Wydajności:** SSR-friendly, code splitting (lazy loading), manualne chunkowanie i preloading zasobów.
- **PWA Ready:** Możliwość zainstalowania na telefonie jako aplikacja (manifest, ikony).
- **Bezpieczeństwo:** Pełne zabezpieczenie bazy danych (RLS), walidacja po stronie serwera i ograniczanie zapytań (rate limiting).
- **SEO Ready:** Zoptymalizowane meta-tagi OpenGraph, Twitter i mapa strony (sitemap.xml).

## 🚀 Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **Stylizacja:** Tailwind CSS (Custom Dark Theme)
- **Animacje:** Framer Motion (Slow-zoom, transitions)
- **Baza danych:** Supabase (PostgreSQL)
- **Routing:** React Router v7
- **Inne:** Lucide React (Ikony), date-fns (Daty)

## 📦 Instalacja i Uruchomienie

1. **Sklonuj repozytorium:**
   ```bash
   git clone https://github.com/radek-d/barbershop.git
   cd barbershop
   ```

2. **Zainstaluj zależności:**
   ```bash
   npm install
   ```

3. **Skonfiguruj środowisko:**
   Stwórz plik `.env` i dodaj swoje klucze Supabase:
   ```
   VITE_SUPABASE_URL=twoj_url
   VITE_SUPABASE_ANON_KEY=twoj_klucz
   ```

4. **Uruchom dewelopersko:**
   ```bash
   npm run dev
   ```

5. **Budowanie produkcyjne:**
   ```bash
   npm run build
   ```

## 🔐 Bezpieczeństwo

Projekt wykorzystuje zaawansowane mechanizmy Supabase:
- **Row Level Security (RLS):** Tylko uprawnieni barberzy mogą edytować grafiki.
- **Funkcje SQL:** Customowe funkcje do sprawdzania uprawnień admina.
- **Rate Limiting:** Zabezpieczenie przed atakami brute-force na logowaniu.

---

Zbudowane z pasją do rzemiosła przez **Dziupla Barbershop Team**. ✂️💈
