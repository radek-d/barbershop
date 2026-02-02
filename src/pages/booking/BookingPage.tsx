import { useState, useEffect } from "react";
import { formatPhoneDisplay } from "../../utils/formatPhone";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../lib/supabase";
import type { Profile, Service, Schedule, Appointment } from "../../types";
import { generateAvailableSlots } from "../../utils/bookingLogic";
import { format, addMinutes, startOfDay, endOfDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Clock, User, Phone, CreditCard, CheckCircle2 } from "lucide-react";

type BookingStep = "service" | "barber" | "datetime" | "details" | "checkout";

export default function BookingPage() {
  const { slug } = useParams();
  const [step, setStep] = useState<BookingStep>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Profile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
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
    const { data: svcs } = await supabase.from("services").select("*");
    if (svcs) setServices(svcs);

    // Load Barbers (Profiles with role 'barber' or 'admin')
    const { data: bbrs } = await supabase.from("profiles").select("*");
    if (bbrs) setBarbers(bbrs);

    setIsLoading(false);
  };

  const loadSchedules = async (barberId: string) => {
    const { data } = await supabase.from("schedules").select("*").eq("barber_id", barberId);
    setSchedules(data || []);
  };

  const loadAppointments = async (date: Date) => {
    if (!selectedBarber) return;

    const startOfDayISO = startOfDay(date).toISOString();
    const endOfDayISO = endOfDay(date).toISOString();

    const { data, error } = await supabase.rpc("get_barber_availability", {
      query_barber_id: selectedBarber.id,
      query_start: startOfDayISO,
      query_end: endOfDayISO,
    });

    if (error) {
      console.error("Error fetching slots:", error);
      setAppointments([]);
      return;
    }

    const safeAppointments: Appointment[] = (data || []).map((slot: any) => ({
      id: "secure",
      barber_id: selectedBarber.id,
      service_id: "secure",
      client_name: "Zajęty",
      client_phone: "+48000000000",
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: "confirmed",
      created_at: new Date().toISOString(),
    }));

    setAppointments(safeAppointments);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep("barber");
  };

  const handleBarberSelect = (barber: Profile) => {
    setSelectedBarber(barber);
    loadSchedules(barber.id);
    setStep("datetime");
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadAppointments(date);
  };

  // Nasłuchuj zmian (gdy ktoś zarezerwuje)
  useEffect(() => {
    if (!selectedBarber) return;

    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter: `barber_id=eq.${selectedBarber.id}`,
        },
        () => {
          // Weryfikuj dostępność gdy pojawi się nowa rezerwacja
          loadAppointments(selectedDate);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedBarber, selectedDate]);

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setStep("details");
  };

  const handleSubmitDetails = () => {
    if (clientName && clientPhone) {
      setStep("checkout");
    }
  };

  const handleCheckout = async () => {
    if (!selectedService || !selectedBarber) return;

    setIsSubmitting(true);
    setBookingError(null);

    const [hours, minutes] = selectedSlot!.split(":").map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);
    const endTime = addMinutes(startTime, selectedService.duration_minutes);

    // Normalizuj numer: usuń spacje, dodaj +48 jeśli brakuje
    let normalizedPhone = clientPhone.replace(/\s+/g, "");
    if (!normalizedPhone.startsWith("+")) {
      normalizedPhone = "+48" + normalizedPhone;
    }

    const { error } = await supabase.from("appointments").insert({
      barber_id: selectedBarber.id,
      service_id: selectedService.id,
      client_name: clientName,
      client_phone: normalizedPhone,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "pending",
    });

    setIsSubmitting(false);

    if (error) {
      if (error.message.includes("zajęty")) {
        setBookingError(
          "Przepraszamy, ten termin został właśnie zajęty. Wybierz inną godzinę.",
        );
        setStep("datetime");
      } else {
        setBookingError("Wystąpił błąd: " + error.message);
      }
    } else {
      setBookingComplete(true);
    }
  };

  // Znajdź harmonogram dla wybranego dnia
  const currentDaySchedule = schedules.find(
    (s) => s.date === format(selectedDate, "yyyy-MM-dd"),
  );

  const availableSlots =
    selectedService && selectedDate && currentDaySchedule
      ? generateAvailableSlots(
          selectedDate,
          currentDaySchedule,
          appointments,
          selectedService.duration_minutes,
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
          <h1 className="text-3xl font-display uppercase mb-2">
            Rezerwacja Potwierdzona!
          </h1>
          <p className="text-gray-700 mb-4">
            Twoja wizyta w Barbershop została zarezerwowana.
          </p>
          <p className="text-sm text-gray-500">
            Link do potwierdzenia został wysłany na numer{" "}
            {formatPhoneDisplay(clientPhone)}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase mb-2">
            Rezerwacja wizyty
          </h1>
          <div className="w-16 h-1 bg-black mx-auto mb-4"></div>
          <p className="text-gray-600 font-light text-base sm:text-lg">
            Barbershop - Wybierz dogodny termin
          </p>
        </div>

        {bookingError && (
          <div className="mb-6 p-4 border-2 border-barber-red bg-red-50 text-barber-red-dark rounded-xl font-medium text-center">
            {bookingError}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase">
                    Wybierz usługę
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-4 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all text-left group"
                    >
                      <h3 className="font-semibold text-lg">{service.name}</h3>
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

          {step === "barber" && selectedService && (
            <motion.div
              key="barber"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="font-display uppercase text-2xl sm:text-3xl">
                    Wybierz Barbera
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {barbers.map((barber) => (
                      <motion.div
                        key={barber.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleBarberSelect(barber)}
                        className="p-6 border-2 border-black rounded-2xl cursor-pointer hover:bg-gray-50 transition-all flex flex-col items-center text-center group"
                      >
                        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                          <User className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-1">
                          {barber.fullname}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase tracking-widest">
                          {barber.role === "admin" ? "Szef" : "Barber"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "datetime" && selectedService && (
            <motion.div
              key="datetime"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase">
                    Wybierz datę i godzinę
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedService.name} z {selectedBarber?.fullname}
                  </p>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Kalendarz */}
                  <div className="bg-white rounded-xl">
                    <label className="block text-sm font-bold uppercase mb-3">
                      Wybierz konkretną datę
                    </label>
                    <Input
                      type="date"
                      value={format(selectedDate, "yyyy-MM-dd")}
                      onChange={(e) =>
                        handleDateSelect(new Date(e.target.value))
                      }
                      min={format(new Date(), "yyyy-MM-dd")}
                      className="w-full text-lg p-4 border-2 border-black rounded-xl mb-6"
                    />

                    {availableSlots.length > 0 ? (
                      <div>
                        <label className="block text-sm font-medium mb-3">
                          Dostępne godziny w dniu{" "}
                          {format(selectedDate, "dd.MM", { locale: pl })}:
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant="outline"
                              className="h-10 sm:h-12 border-black hover:bg-black hover:text-white transition-colors text-sm sm:text-base px-2"
                              onClick={() => handleSlotSelect(slot)}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic py-4">
                        Brak wolnych terminów w wybranym dniu. Sprawdź poniżej
                        inne dni.
                      </p>
                    )}
                  </div>

                  {/* Wolne terminy w najbliższych dniach */}
                  <div className="pt-6 border-t-2 border-gray-100">
                    <h3 className="text-xl font-display uppercase mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Najbliższe wolne terminy
                    </h3>
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const checkingDate = new Date();
                        checkingDate.setDate(new Date().getDate() + i);
                        const daySchedule = schedules.find((s) => s.date === format(checkingDate, "yyyy-MM-dd"));
                        const slots = daySchedule
                          ? generateAvailableSlots(checkingDate, daySchedule, appointments, selectedService.duration_minutes).slice(0, 5)
                          : [];

                        if (slots.length === 0) return null;

                        return (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50"
                          >
                            <div className="w-24 font-bold text-gray-900 border-b sm:border-b-0 sm:border-r border-gray-300 pb-2 sm:pb-0 sm:pr-4">
                              {format(checkingDate, "dd.MM", { locale: pl })}
                              <span className="block text-xs text-gray-500 font-normal uppercase mt-1">
                                {format(checkingDate, "EEEE", { locale: pl })}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 flex-1">
                              {slots.map((slot) => (
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
                              <span className="text-xs text-gray-400 flex items-center px-2">
                                ...więcej
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setStep("service")}
                    className="mt-6"
                  >
                    ← Wróć do usług
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-display uppercase">
                    Twoje dane
                  </CardTitle>
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
                    <Button variant="ghost" onClick={() => setStep("datetime")}>
                      ← Wróć
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

          {step === "checkout" && selectedService && (
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
                    <h3 className="font-display uppercase text-xl mb-4">
                      Podsumowanie
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Usługa:</span>
                        <span className="font-medium">
                          {selectedService.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data i godzina:</span>
                        <span className="font-medium">
                          {format(selectedDate, "d MMM yyyy", { locale: pl })} o{" "}
                          {selectedSlot}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Czas trwania:</span>
                        <span className="font-medium">
                          {selectedService.duration_minutes} min
                        </span>
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
                      onClick={() => setStep("details")}
                      disabled={isSubmitting}
                    >
                      ← Wróć
                    </Button>
                    <Button
                      onClick={handleCheckout}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting
                        ? "Przetwarzanie..."
                        : "Potwierdź rezerwację"}
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
