import { useState, useEffect } from 'react';
import { formatPhoneDisplay } from '../../utils/formatPhone';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import type { Profile, Service, Schedule, Appointment } from '../../types';
import { generateAvailableSlots } from '../../utils/bookingLogic';
import { format, addMinutes, startOfDay, endOfDay } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Clock, User, Phone, CreditCard, CheckCircle2, Scissors } from 'lucide-react';

type BookingStep = 'service' | 'barber' | 'datetime' | 'details' | 'checkout';

export default function BookingPage() {
  const { slug } = useParams();
  const [step, setStep] = useState<BookingStep>('service');
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Profile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load Services
    const { data: svcs } = await supabase.from('services').select('*');
    if (svcs) setServices(svcs);

    // Load Barbers (Profiles with role 'barber' or 'admin')
    const { data: bbrs } = await supabase.from('profiles').select('*');
    if (bbrs) setBarbers(bbrs);

    setIsLoading(false);
  };

  const loadSchedules = async (barberId: string) => {
    // Load shifts for this barber
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .eq('barber_id', barberId);
      
    setSchedules(data || []);
  };

  const loadAppointments = async (date: Date) => {
    if (!selectedBarber) return;
    
    const startOfDayISO = startOfDay(date).toISOString();
    const endOfDayISO = endOfDay(date).toISOString();

    const { data, error } = await supabase.rpc('get_barber_availability', {
      query_barber_id: selectedBarber.id,
      query_start: startOfDayISO,
      query_end: endOfDayISO
    });

    if (error) {
      console.error('Error fetching slots:', error);
      setAppointments([]);
      return;
    }

    const safeAppointments: Appointment[] = (data || []).map((slot: any) => ({
      id: 'secure',
      barber_id: selectedBarber.id,
      service_id: 'secure',
      client_name: 'Occupied',
      client_phone: '+48000000000',
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: 'confirmed',
      created_at: new Date().toISOString()
    }));

    setAppointments(safeAppointments);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('barber');
  };

  const handleBarberSelect = (barber: Profile) => {
    setSelectedBarber(barber);
    loadSchedules(barber.id);
    setStep('datetime');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadAppointments(date);
  };

  // Realtime Subscription for immediate updates
  useEffect(() => {
    if (!selectedBarber) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `barber_id=eq.${selectedBarber.id}`
        },
        () => {
          // Verify availability again when any new appointment lands
          loadAppointments(selectedDate);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBarber, selectedDate]);


  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setStep('details');
  };

  const handleSubmitDetails = () => {
    if (clientName && clientPhone) {
      setStep('checkout');
    }
  };

  const handleCheckout = async () => {
    if (!selectedService || !selectedBarber) return;
    
    setIsSubmitting(true);
    setBookingError(null);
    
    const [hours, minutes] = selectedSlot!.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = addMinutes(startTime, selectedService.duration_minutes);

    // Normalize phone number: remove spaces, add +48 if needed
    let normalizedPhone = clientPhone.replace(/\s+/g, ''); // Remove all spaces
    if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = '+48' + normalizedPhone; // Add Poland prefix if missing
    }

    const { error } = await supabase.from('appointments').insert({
      barber_id: selectedBarber.id,
      service_id: selectedService.id,
      client_name: clientName,
      client_phone: normalizedPhone,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'pending'
    });

    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('zajęty')) {
        setBookingError('Przepraszamy, ten termin został właśnie zajęty. Wybierz inną godzinę.');
        setStep('datetime');
      } else {
        setBookingError('Wystąpił błąd: ' + error.message);
      }
    } else {
      setBookingComplete(true);
    }
  };

  // Find the specific schedule for the selected date
  const currentDaySchedule = schedules.find(s => 
    s.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const availableSlots = selectedService && selectedDate && currentDaySchedule
    ? generateAvailableSlots(
        selectedDate,
        currentDaySchedule,
        appointments,
        selectedService.duration_minutes
      )
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Ładowanie...</p>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-3xl font-display uppercase mb-2">Rezerwacja Potwierdzona!</h1>
          <p className="text-gray-700 mb-4">
            Twoja wizyta w Dziupla Barbershop została zarezerwowana.
          </p>
          <p className="text-sm text-gray-500">
            Link do potwierdzenia został wysłany na numer {formatPhoneDisplay(clientPhone)}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="text-sm font-medium flex items-center gap-2 hover:underline">
            ← Strona Główna
          </Link>
          <h1 className="text-xl font-display uppercase tracking-widest opacity-50">Dziupla</h1>
        </div>
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-6xl font-display uppercase mb-2">Dziupla Barbershop</h1>
          <div className="w-16 h-1 bg-black mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Wybierz usługę i barbera</p>
        </div>

        {bookingError && (
          <div className="mb-6 p-4 border-2 border-barber-red bg-red-50 text-barber-red-dark rounded-xl font-medium text-center">
            {bookingError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'service' && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase">Wybierz usługę</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {services.map(service => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-4 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all text-left group"
                    >
                      <h3 className="font-semibold text-lg">
                        {service.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration_minutes} min
                        </span>
                        <span className="font-medium">
                          {(service.price_cents / 100).toFixed(2)} zł
                        </span>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'barber' && selectedService && (
            <motion.div
              key="barber"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase">Wybierz Barbera</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {barbers.map(barber => (
                    <button
                      key={barber.id}
                      onClick={() => handleBarberSelect(barber)}
                      className="p-4 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all text-left flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-black group-hover:text-black group-hover:bg-white overflow-hidden">
                          {barber.avatar_url ? (
                            <img src={barber.avatar_url} alt={barber.fullname || ''} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{barber.fullname || barber.email.split('@')[0]}</h3>
                          <p className="text-sm text-gray-500 group-hover:text-gray-300 capitalize">{barber.role}</p>
                        </div>
                      </div>
                      <Scissors className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'datetime' && selectedService && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase">Wybierz datę i godzinę</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedService.name} z {selectedBarber?.fullname}
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Sekcja 1: Kalendarz (zachowane) */}
                  <div className="bg-white rounded-xl">
                     <label className="block text-sm font-bold uppercase mb-3">Wybierz konkretną datę</label>
                    <Input
                      type="date"
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={(e) => handleDateSelect(new Date(e.target.value))}
                      min={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full text-lg p-4 border-2 border-black rounded-xl mb-6"
                    />

                    {availableSlots.length > 0 ? (
                      <div>
                        <label className="block text-sm font-medium mb-3">Dostępne godziny w dniu {format(selectedDate, 'dd.MM')}:</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {availableSlots.map(slot => (
                            <Button
                              key={slot}
                              variant="outline"
                              className="h-12 border-black hover:bg-black hover:text-white transition-colors"
                              onClick={() => handleSlotSelect(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic py-4">
                        Brak wolnych terminów w wybranym dniu. Sprawdź poniżej inne dni.
                      </p>
                    )}
                  </div>

                  {/* Sekcja 2: Najbliższe wolne terminy (Nowość) */}
                  <div className="pt-6 border-t-2 border-gray-100">
                    <h3 className="text-xl font-display uppercase mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Najbliższe wolne terminy
                    </h3>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => {
                         const nextDate = addMinutes(new Date(), 0); // Start from today
                         nextDate.setDate(new Date().getDate() + i + 1); // +1 day offset to start from tomorrow generally, or simply i
                         // Let's actually verify proper dates.
                         const checkingDate = new Date();
                         checkingDate.setDate(new Date().getDate() + i);
                         const daySchedule = schedules.find(s => s.date === format(checkingDate, 'yyyy-MM-dd'));
                         
                         // Generate slots for this day just for preview (simplified)
                         const slots = daySchedule 
                           ? generateAvailableSlots(checkingDate, daySchedule, appointments, selectedService.duration_minutes).slice(0, 5) // Limit to 5 slots suggestions
                           : [];

                         if (slots.length === 0) return null;

                         return (
                           <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
                             <div className="w-24 font-bold text-gray-900 border-b sm:border-b-0 sm:border-r border-gray-300 pb-2 sm:pb-0 sm:pr-4">
                               {format(checkingDate, 'dd.MM')}
                               <span className="block text-xs text-gray-500 font-normal uppercase mt-1">
                                 {format(checkingDate, 'EEEE')}
                               </span>
                             </div>
                             <div className="flex flex-wrap gap-2 flex-1">
                               {slots.map(slot => (
                                 <button
                                   key={slot}
                                   onClick={() => {
                                     setSelectedDate(checkingDate);
                                     handleSlotSelect(slot);
                                   }}
                                   className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:border-black hover:bg-black hover:text-white transition-all"
                                 >
                                   {slot}
                                 </button>
                               ))}
                               <span className="text-xs text-gray-400 flex items-center px-2">...więcej</span>
                             </div>
                           </div>
                         );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setStep('service')}
                    className="mt-6"
                  >
                    ← Wróć do usług
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase">Twoje dane</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> Imię i nazwisko
                    </label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Jan Kowalski"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Numer telefonu
                    </label>
                    <Input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+48 123 456 789 lub 123456789"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setStep('datetime')}
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleSubmitDetails}
                      disabled={!clientName || !clientPhone}
                      className="flex-1"
                    >
                      Przejdź do płatności
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'checkout' && selectedService && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase flex items-center gap-2">
                    <CreditCard className="w-6 h-6" />
                    Płatność
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 border-2 border-black rounded-xl p-6 mb-6">
                    <h3 className="font-display uppercase text-xl mb-4">Podsumowanie</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usługa:</span>
                        <span className="font-medium">{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data i godzina:</span>
                        <span className="font-medium">
                          {format(selectedDate, 'd MMM yyyy')} o {selectedSlot}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Czas trwania:</span>
                        <span className="font-medium">{selectedService.duration_minutes} min</span>
                      </div>
                      <div className="border-t-2 border-black pt-2 mt-2 flex justify-between text-lg">
                        <span className="font-semibold">Razem:</span>
                        <span className="font-bold">
                          {(selectedService.price_cents / 100).toFixed(2)} zł
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-2 border-black rounded-xl p-4 mb-6">
                    <p className="text-sm">
                      <strong>Płatność na miejscu</strong>
                      <br />
                      Płatność gotówką lub kartą w barberze
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setStep('details')}
                      disabled={isSubmitting}
                    >
                      ← Back
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Przetwarzanie...' : 'Potwierdź rezerwację'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
