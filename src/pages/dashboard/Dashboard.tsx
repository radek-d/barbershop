import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Service, Appointment, Schedule, Profile } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Clock, Calendar as CalendarIcon, User, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { formatPhoneDisplay } from '../../utils/formatPhone';


export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'schedules' | 'staff'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    loadData();
  };

  const loadData = async () => {
    setIsLoading(true);
    
    // 1. Get Current User Profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profile) setCurrentUser(profile);

    // 2. Load Appointments (RLS handles visibility: Admin sees all, Barber sees own)
    const { data: appts } = await supabase
      .from('appointments')
      .select('*, profiles(fullname)')
      .order('start_time', { ascending: true });

    // 3. Load Services
    const { data: svcs } = await supabase.from('services').select('*');

    // 4. Load Schedules (Shifts)
    const { data: scheds } = await supabase.from('schedules').select('*');

    // 5. Load Staff (Admins only need this really, but useful for filters)
    const { data: staff } = await supabase.from('profiles').select('*');

    setAppointments(appts || []);
    setServices(svcs || []);
    setSchedules(scheds || []);
    setBarbers(staff || []);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <p className="text-gray-500">Ładowanie...</p>
      </div>
    );
  }

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Czy na pewno chcesz odwołać tę wizytę? Klient otrzyma powiadomienie.')) return;
    
    await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
    loadData();
  };

  const handleAddService = async () => {
    const name = prompt('Nazwa usługi:');
    if (!name) return;
    const duration = prompt('Czas trwania (minuty):', '30');
    if (!duration) return;
    const price = prompt('Cena (w groszach, np. 8000 dla 80.00 zł):', '5000');
    if (!price) return;

    if (name && duration && price) {
      await supabase.from('services').insert({
        name,
        duration_minutes: parseInt(duration),
        price_cents: parseInt(price)
      });
      loadData();
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Czy usunąć tę usługę? To nieodwracalne.')) {
      await supabase.from('services').delete().eq('id', id);
      loadData();
    }
  };

  const handleEditSchedule = (barberId: string, shift: Schedule) => {
    // Populate the form inputs with the clicked shift's data
    const dateEl = document.getElementById(`date-${barberId}`) as HTMLInputElement;
    const startEl = document.getElementById(`start-${barberId}`) as HTMLInputElement;
    const endEl = document.getElementById(`end-${barberId}`) as HTMLInputElement;
    
    if (dateEl && startEl && endEl) {
      dateEl.value = shift.date;
      startEl.value = (shift.start_time || '').slice(0, 5);
      endEl.value = (shift.end_time || '').slice(0, 5);
      
      // Scroll to form
      dateEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleAddSchedule = async (barberId: string, date: string, start: string, end: string) => {
    if (!date || !start || !end) return;
    
    // Upsert schedule
    const { error } = await supabase.from('schedules').upsert({
      barber_id: barberId,
      date,
      start_time: start,
      end_time: end,
      is_working: true
    }, { onConflict: 'barber_id,date' }); // Ensure unique constraint exists on DB or logic handles it

    if (error) {
      alert('Błąd zapisu grafiku: ' + error.message);
    } else {
      loadData();
      // Clear form after successful save
      const dateEl = document.getElementById(`date-${barberId}`) as HTMLInputElement;
      const startEl = document.getElementById(`start-${barberId}`) as HTMLInputElement;
      const endEl = document.getElementById(`end-${barberId}`) as HTMLInputElement;
      if (dateEl) dateEl.value = '';
      if (startEl) startEl.value = '09:00';
      if (endEl) endEl.value = '17:00';
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-display uppercase mb-2">Panel {currentUser?.role === 'admin' ? 'Szefa' : 'Barbera'}</h1>
            <div className="w-16 h-1 bg-black mb-4"></div>
            <p className="text-gray-600">Witaj, <span className="font-bold">{currentUser?.fullname || currentUser?.email}</span></p>
          </div>
          <Button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} variant="outline">
            Wyloguj
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-black overflow-x-auto">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
              activeTab === 'appointments'
                ? 'border-black text-black'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Rezerwacje
          </button>
          
          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('schedules')}
                className={`px-6 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeTab === 'schedules'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Grafik
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeTab === 'services'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Usługi
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`px-6 py-3 font-medium transition-all whitespace-nowrap border-b-2 ${
                  activeTab === 'staff'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-black'
                }`}
              >
                Pracownicy
              </button>
            </>
          )}
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase text-2xl">Nadchodzące rezerwacje</CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Brak nadchodzących rezerwacji</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map(apt => (
                      <div
                        key={apt.id}
                        className={`p-4 border-2 rounded-xl transition-colors ${
                          apt.status === 'cancelled' ? 'bg-red-50 border-red-100 opacity-70' : 'border-black hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{apt.client_name}</h3>
                              {currentUser?.role === 'admin' && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                                  Barber: {barbers.find(b => b.id === apt.barber_id)?.fullname || 'Unknown'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600">{formatPhoneDisplay(apt.client_phone)}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-4 h-4" />
                                {format(new Date(apt.start_time), 'd MMM yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {format(new Date(apt.start_time), 'HH:mm')} - {format(new Date(apt.end_time), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${
                                apt.status === 'confirmed'
                                  ? 'bg-white border-black text-black'
                                  : apt.status === 'paid'
                                  ? 'bg-black border-black text-white'
                                  : apt.status === 'cancelled'
                                  ? 'bg-red-100 border-red-500 text-red-700'
                                  : 'bg-gray-100 border-black text-black'
                              }`}
                            >
                              {apt.status === 'cancelled' ? 'Odwołana' : apt.status}
                            </span>
                            
                            {/* Cancel Button (Admin Only) */}
                            {currentUser?.role === 'admin' && apt.status !== 'cancelled' && (
                               <Button 
                                 size="sm" 
                                 variant="outline" 
                                 className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-500"
                                 onClick={() => handleCancelAppointment(apt.id)}
                               >
                                 Odwołaj
                               </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display uppercase text-2xl">Twoje usługi</CardTitle>
                  <Button onClick={handleAddService} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Dodaj usługę
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map(service => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 border-2 border-black rounded-xl bg-white hover:bg-gray-50 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {service.duration_minutes} min
                            </span>
                            <span className="font-medium text-black">
                              {(service.price_cents / 100).toFixed(2)} zł
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Usuń usługę"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Schedules Tab (Admin Only) */}
        {activeTab === 'schedules' && currentUser?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-display uppercase text-2xl">Grafik Pracy</CardTitle>
                <p className="text-gray-500">Ustaw zmiany dla swoich barberów</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {barbers.map(barber => (
                    <div key={barber.id} className="border-b-2 border-gray-100 pb-6 mb-6 last:border-0">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{barber.fullname}</h3>
                          <span className="text-xs text-gray-500 uppercase">{barber.role}</span>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Quick Add Shift Form */}
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <h4 className="text-sm font-bold uppercase mb-3">Dodaj Zmianę</h4>
                          <div className="space-y-2">
                            <Input id={`date-${barber.id}`} type="date" className="bg-white" />
                            <div className="flex gap-2">
                              <Input id={`start-${barber.id}`} type="time" defaultValue="09:00" className="bg-white" />
                              <Input id={`end-${barber.id}`} type="time" defaultValue="17:00" className="bg-white" />
                            </div>
                            <Button 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => {
                                const dateEl = document.getElementById(`date-${barber.id}`) as HTMLInputElement;
                                const startEl = document.getElementById(`start-${barber.id}`) as HTMLInputElement;
                                const endEl = document.getElementById(`end-${barber.id}`) as HTMLInputElement;
                                if (dateEl.value) handleAddSchedule(barber.id, dateEl.value, startEl.value, endEl.value);
                              }}
                            >
                              Zapisz
                            </Button>
                          </div>
                        </div>

                        {/* Existing Shifts List */}
                        <div className="col-span-1 lg:col-span-2 space-y-2 max-h-60 overflow-y-auto">
                          <h4 className="text-sm font-bold uppercase mb-3">Zaplanowane Zmiany (Luty 2026 i dalej)</h4>
                          {schedules.filter(s => s.barber_id === barber.id).length === 0 ? (
                            <p className="text-sm text-gray-400 italic">Brak zmian</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {schedules
                                .filter(s => s.barber_id === barber.id)
                                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                                .map(shift => (
                                <div 
                                  key={shift.id} 
                                  className="text-sm p-2 bg-white border border-gray-200 rounded flex justify-between items-center group hover:border-black transition-colors cursor-pointer"
                                  onClick={() => handleEditSchedule(barber.id, shift)}
                                  title="Kliknij aby edytować"
                                >
                                  <span>{format(new Date(shift.date), 'd MMM')}</span>
                                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                                    {(shift.start_time || '').slice(0,5)} - {(shift.end_time || '').slice(0,5)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Staff Tab */}
        {activeTab === 'staff' && currentUser?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display uppercase text-2xl">Zespół Barberów</CardTitle>
                </div>
                <p className="text-sm text-gray-500">
                   Zarządzanie kontami wymaga bezpośredniej edycji bazy lub kontaktu z administratorem technicznym.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {barbers.map(barber => (
                    <div
                      key={barber.id}
                      className="p-4 border-2 border-black rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                          {barber.avatar_url ? (
                            <img src={barber.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {barber.fullname || 'Nieznany Barber'} 
                            {barber.role === 'admin' && <Shield className="w-4 h-4 text-blue-600" />}
                          </h3>
                          <p className="text-sm text-gray-500">{barber.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-black text-white px-3 py-1 rounded-full uppercase tracking-wider">
                        {barber.role}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

