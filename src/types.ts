export interface Profile {
  id: string; // uuid
  email: string;
  fullname: string | null;
  role: 'admin' | 'barber';
  avatar_url: string | null;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
}

export interface Schedule {
  id: string;
  barber_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  is_working: boolean;
}

export interface Appointment {
  id: string;
  barber_id: string;
  service_id: string;
  client_name: string;
  client_email?: string; // Optional now
  client_phone: string; // Required
  start_time: string; // ISO
  end_time: string; // ISO
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  created_at: string;
}
