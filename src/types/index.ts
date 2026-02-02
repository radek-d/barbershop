export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  city: string;
  active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  created_at: string;
}

export interface WorkingHours {
  id: string;
  business_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  service_id: string;
  client_name: string;
  client_email: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  created_at: string;
}
