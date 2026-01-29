# Termly - Modern Appointment Booking SaaS

A complete, production-ready appointment booking system built with React, TypeScript, Supabase, and Tailwind CSS.

## 🎯 Features

### For Clients
- **Multi-step booking wizard** with smooth Framer Motion animations
- **Service selection** with pricing and duration
- **Interactive date & time picker** showing only available slots
- **Real-time collision detection** preventing double bookings
- **Responsive mobile-first design** optimized for thumb navigation

### For Service Providers
- **Dashboard** to view upcoming appointments
- **Service management** (create, edit, delete services)
- **Working hours configuration** for each day of the week
- **Status tracking** (pending, confirmed, paid, cancelled)

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Database:** Supabase (PostgreSQL)
- **Routing:** React Router v6
- **Date handling:** date-fns

## 📦 Installation

1. **Clone and install dependencies:**
   ```bash
   cd termly
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `schema.sql` in the Supabase SQL Editor
   - Copy your project URL and anon key

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The `schema.sql` file includes:
- **businesses** - Store business information with unique slugs
- **services** - Services offered by each business
- **working_hours** - Business hours for each day of the week
- **appointments** - Booking records with status tracking
- **Row Level Security (RLS)** policies for data protection
- **Indexes** for optimized queries

## 🔑 Key Algorithm: Available Slots Generation

The core booking logic is in `src/utils/bookingLogic.ts`:

```typescript
generateAvailableSlots(
  date: Date,
  workingHours: WorkingHours,
  appointments: Appointment[],
  serviceDurationMinutes: number
)
```

**How it works:**
1. Splits the working day into 30-minute intervals (configurable)
2. For each potential slot, checks if a service of given duration fits
3. Uses `date-fns` interval overlap detection to prevent collisions
4. Returns array of available time strings (e.g., `["09:00", "09:30", ...]`)

## 🎨 Design Philosophy

- **Minimalist aesthetic** - Clean white space, subtle shadows
- **Primary color:** Blue (`primary-*` variants in Tailwind config)
- **Rounded corners** - `xl`, `2xl`, `3xl` border radius
- **Smooth animations** - Fade and slide transitions between steps
- **Mobile-first** - Touch-friendly slot buttons, responsive grids

## 📱 Routes

- `/` - Landing page with instructions
- `/b/:slug` - Client-facing booking wizard (e.g., `/b/salon-beauty`)
- `/dashboard` - Provider dashboard (requires authentication in production)

## 🔐 Security Notes

- **RLS is enabled** on all tables
- Public users can only view active businesses and create appointments
- Business owners can only manage their own data
- In production, add authentication (Supabase Auth) for dashboard access

## 💳 Payment Integration

The checkout step includes a placeholder for payment integration. To connect:

1. **Stripe:**
   ```typescript
   import { loadStripe } from '@stripe/stripe-js';
   // Add payment intent creation in checkout step
   ```

2. **Przelewy24 (Polish market):**
   ```typescript
   // Implement P24 webhook handling in Supabase Edge Functions
   ```

## 🧪 Testing

A basic test for the slot generation logic:
```bash
# Create a test file and run it
npm install -D tsx
npx tsx test_logic.ts
```

## 📝 TODO

- [ ] Add authentication for dashboard
- [ ] Implement email notifications (Supabase + SendGrid/Resend)
- [ ] Integrate payment gateway
- [ ] Add appointment reminders
- [ ] Multi-language support (i18n)
- [ ] Analytics dashboard
- [ ] Export appointments to calendar (iCal)

## 🤝 Contributing

This is a complete starter template. Customize as needed:
- Update colors in `tailwind.config.js`
- Modify booking steps in `BookingPage.tsx`
- Extend database schema in `schema.sql`
- Add custom business logic in `utils/`

## 📄 License

MIT - Use freely for commercial or personal projects

---

Built with ❤️ using modern web technologies
