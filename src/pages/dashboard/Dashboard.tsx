import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import type { Service, Appointment, Schedule, Profile } from "../../types";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Dialog } from "../../components/ui/Dialog";
import { Trash2, Clock, Calendar as CalendarIcon, User } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { formatPhoneDisplay } from "../../utils/formatPhone";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "appointments" | "services" | "schedules" | "staff"
  >("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Profile[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stan dialogów
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "alert" | "confirm" | "prompt";
    onConfirm?: (value?: string) => void;
    defaultValue?: string;
    placeholder?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "alert",
  });

  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    name: string;
    duration: string;
    price: string;
  }>({
    isOpen: false,
    name: "",
    duration: "30",
    price: "5000",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    loadData();
  };

  const loadData = async () => {
    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (profile) setCurrentUser(profile);

    const { data: appts } = await supabase.from("appointments").select("*, profiles(fullname)").order("start_time", { ascending: true });
    const { data: svcs } = await supabase.from("services").select("*");
    const { data: scheds } = await supabase.from("schedules").select("*");
    const { data: staff } = await supabase.from("profiles").select("*");

    setAppointments(appts || []);
    setServices(svcs || []);
    setSchedules(scheds || []);
    setBarbers(staff || []);
    setIsLoading(false);
  };

  const openDialog = (config: Partial<typeof dialog>) => {
    setDialog({ ...dialog, isOpen: true, ...config });
  };

  const closeDialog = () => {
    setDialog({ ...dialog, isOpen: false });
  };

  const handleCancelAppointment = (id: string) => {
    openDialog({
      title: "Odwołaj wizytę",
      message:
        "Czy na pewno chcesz odwołać tę wizytę? Klient otrzyma powiadomienie.",
      type: "confirm",
      onConfirm: async () => {
        await supabase
          .from("appointments")
          .update({ status: "cancelled" })
          .eq("id", id);
        loadData();
      },
    });
  };

  const handleAddService = async () => {
    if (serviceModal.name && serviceModal.duration && serviceModal.price) {
      await supabase.from("services").insert({
        name: serviceModal.name,
        duration_minutes: parseInt(serviceModal.duration),
        price_cents: parseInt(serviceModal.price),
      });
      setServiceModal({ ...serviceModal, isOpen: false, name: "" });
      loadData();
    }
  };

  const handleDeleteService = (id: string) => {
    openDialog({
      title: "Usuń usługę",
      message: "Czy usunąć tę usługę? To nieodwracalne.",
      type: "confirm",
      onConfirm: async () => {
        await supabase.from("services").delete().eq("id", id);
        loadData();
      },
    });
  };

  const handleAddSchedule = async (
    barberId: string,
    date: string,
    start: string,
    end: string,
  ) => {
    if (!date || !start || !end) return;

    // Upsert schedule
    const { error } = await supabase.from("schedules").upsert(
      {
        barber_id: barberId,
        date,
        start_time: start,
        end_time: end,
        is_working: true,
      },
      { onConflict: "barber_id,date" },
    );

    if (error) {
      openDialog({
        title: "Błąd zapisu",
        message: "Błąd zapisu grafiku: " + error.message,
        type: "alert",
      });
    } else {
      loadData();
      // Clear form
      const dateEl = document.getElementById(
        `date-${barberId}`,
      ) as HTMLInputElement;
      if (dateEl) dateEl.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <div className="w-12 h-1 bg-black animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-display uppercase mb-2 leading-none">
              Panel {currentUser?.role === "admin" ? "Szefa" : "Barbera"}
            </h1>
            <div className="w-16 h-1 bg-black mb-4"></div>
            <p className="text-gray-600 font-medium">
              Witaj,{" "}
              <span className="text-black">
                {currentUser?.fullname || currentUser?.email}
              </span>
            </p>
          </div>
          <Button
            onClick={() => {
              supabase.auth.signOut();
              navigate("/login");
            }}
            variant="outline"
            className="w-full sm:w-auto rounded-full px-8"
          >
            Wyloguj
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-black overflow-x-auto">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`flex-1 sm:flex-none px-6 py-4 font-display uppercase tracking-wider transition-all whitespace-nowrap border-b-4 ${
              activeTab === "appointments"
                ? "border-black text-black"
                : "border-transparent text-gray-400 hover:text-black"
            }`}
          >
            Rezerwacje
          </button>

          {currentUser?.role === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("schedules")}
                className={`flex-1 sm:flex-none px-6 py-4 font-display uppercase tracking-wider transition-all whitespace-nowrap border-b-4 ${
                  activeTab === "schedules"
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-black"
                }`}
              >
                Grafik
              </button>
              <button
                onClick={() => setActiveTab("services")}
                className={`flex-1 sm:flex-none px-6 py-4 font-display uppercase tracking-wider transition-all whitespace-nowrap border-b-4 ${
                  activeTab === "services"
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-black"
                }`}
              >
                Usługi
              </button>
              <button
                onClick={() => setActiveTab("staff")}
                className={`flex-1 sm:flex-none px-6 py-4 font-display uppercase tracking-wider transition-all whitespace-nowrap border-b-4 ${
                  activeTab === "staff"
                    ? "border-black text-black"
                    : "border-transparent text-gray-400 hover:text-black"
                }`}
              >
                Pracownicy
              </button>
            </>
          )}
        </div>

        {/* Content Tabs */}
        <div className="space-y-6">
          {activeTab === "appointments" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-display uppercase">
                    Nadchodzące rezerwacje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-12 italic">
                      Brak nadchodzących rezerwacji
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {appointments.map((apt) => (
                        <div
                          key={apt.id}
                          className={`p-5 border-2 rounded-2xl transition-all ${
                            apt.status === "cancelled"
                              ? "bg-red-50/50 border-red-200 opacity-60"
                              : "border-black hover:shadow-md"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-xl uppercase tracking-tighter">
                                  {apt.client_name}
                                </h3>
                                {currentUser?.role === "admin" && (
                                  <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                                    {barbers.find((b) => b.id === apt.barber_id)
                                      ?.fullname ||
                                      (barbers.find(
                                        (b) => b.id === apt.barber_id,
                                      )?.role === "admin"
                                        ? "Szef"
                                        : "Barber")}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-500 font-mono text-sm">
                                {formatPhoneDisplay(apt.client_phone)}
                              </p>
                              <div className="flex flex-wrap gap-4 mt-3 text-xs uppercase font-bold tracking-widest text-gray-400">
                                <span className="flex items-center gap-1.5">
                                  <CalendarIcon className="w-3.5 h-3.5" />{" "}
                                  {format(
                                    new Date(apt.start_time),
                                    "d MMM yyyy",
                                    { locale: pl },
                                  )}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" />{" "}
                                  {format(new Date(apt.start_time), "HH:mm")} -{" "}
                                  {format(new Date(apt.end_time), "HH:mm")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span
                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                                  apt.status === "cancelled"
                                    ? "border-red-500 text-red-600 bg-red-100"
                                    : apt.status === "confirmed"
                                      ? "border-black text-black bg-white"
                                      : apt.status === "paid"
                                        ? "border-green-600 text-green-700 bg-green-50"
                                        : "border-black text-black"
                                }`}
                              >
                                {apt.status === "cancelled"
                                  ? "Odwołana"
                                  : apt.status === "confirmed"
                                    ? "Potwierdzona"
                                    : apt.status === "paid"
                                      ? "Opłacona"
                                      : apt.status}
                              </span>
                              {currentUser?.role === "admin" &&
                                apt.status !== "cancelled" && (
                                  <button
                                    onClick={() =>
                                      handleCancelAppointment(apt.id)
                                    }
                                    className="text-red-500 hover:text-red-700 transition-colors uppercase text-[10px] font-black tracking-widest bg-red-50 px-3 py-1.5 rounded-full border border-red-200"
                                  >
                                    Odwołaj
                                  </button>
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

          {activeTab === "services" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-2 border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-2xl font-display uppercase">
                    Twoje usługi
                  </CardTitle>
                  <Button
                    onClick={() =>
                      setServiceModal({ ...serviceModal, isOpen: true })
                    }
                    className="rounded-full px-6"
                  >
                    Dodaj Usługę
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="p-6 border-2 border-black rounded-2xl flex items-center justify-between group hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <h3 className="text-xl font-bold uppercase mb-1">
                            {service.name}
                          </h3>
                          <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                            <span>{service.duration_minutes} MIN</span>
                            <span className="text-black font-black">
                              {(service.price_cents / 100).toFixed(2)} PLN
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-gray-300 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "schedules" && currentUser?.role === "admin" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-display uppercase">
                    Grafik Pracy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-10">
                  {barbers.map((barber) => (
                    <div
                      key={barber.id}
                      className="border-b last:border-0 pb-10"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight">
                            {barber.fullname}
                          </h3>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                            {barber.role === "admin" ? "Szef" : "Barber"}
                          </p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-12 gap-6">
                        <div className="md:col-span-4 p-6 bg-gray-50 rounded-2xl border-2 border-black/5">
                          <h4 className="text-xs font-black uppercase tracking-[.2em] mb-4">
                            Dodaj Zmianę
                          </h4>
                          <div className="space-y-3">
                            <Input
                              id={`date-${barber.id}`}
                              type="date"
                              className="rounded-xl border-black"
                            />
                            <div className="flex gap-2">
                              <Input
                                id={`start-${barber.id}`}
                                type="time"
                                defaultValue="09:00"
                                className="rounded-xl border-black"
                              />
                              <Input
                                id={`end-${barber.id}`}
                                type="time"
                                defaultValue="17:00"
                                className="rounded-xl border-black"
                              />
                            </div>
                            <Button
                              className="w-full rounded-xl mt-2"
                              onClick={() => {
                                const d = (
                                  document.getElementById(
                                    `date-${barber.id}`,
                                  ) as HTMLInputElement
                                ).value;
                                const s = (
                                  document.getElementById(
                                    `start-${barber.id}`,
                                  ) as HTMLInputElement
                                ).value;
                                const e = (
                                  document.getElementById(
                                    `end-${barber.id}`,
                                  ) as HTMLInputElement
                                ).value;
                                handleAddSchedule(barber.id, d, s, e);
                              }}
                            >
                              Zapisz
                            </Button>
                          </div>
                        </div>

                        <div className="md:col-span-8">
                          <h4 className="text-xs font-black uppercase tracking-[.2em] mb-4">
                            Zaplanowane
                          </h4>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {schedules
                              .filter((s) => s.barber_id === barber.id)
                              .sort((a, b) => a.date.localeCompare(b.date))
                              .map((s) => (
                                <div
                                  key={s.id}
                                  className="p-3 border-2 border-black rounded-xl text-center hover:bg-black hover:text-white transition-all cursor-default"
                                >
                                  <p className="text-sm font-black">
                                    {format(new Date(s.date), "dd.MM", {
                                      locale: pl,
                                    })}
                                  </p>
                                  <p className="text-[10px] opacity-60 font-mono">
                                    {s.start_time.slice(0, 5)}-
                                    {s.end_time.slice(0, 5)}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "staff" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="border-2 border-black">
                <CardHeader>
                  <CardTitle className="text-2xl font-display uppercase">
                    Zespół
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {barbers.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 border-2 border-black rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4 text-black">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-black/10">
                          {b.avatar_url ? (
                            <img
                              src={b.avatar_url}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-black uppercase tracking-tight">
                            {b.fullname}
                          </h4>
                          <p className="text-xs text-gray-500 font-mono">
                            {b.email}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest border border-black/20 px-3 py-1 rounded-full">
                        {b.role === "admin" ? "Szef" : "Barber"}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      {/* Reusable Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        defaultValue={dialog.defaultValue}
        placeholder={dialog.placeholder}
      />

      {/* Add Service Modal */}
      <Modal
        isOpen={serviceModal.isOpen}
        onClose={() => setServiceModal({ ...serviceModal, isOpen: false })}
        title="Dodaj nową usługę"
        maxWidth="max-w-md"
      >
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest mb-2">
                Nazwa usługi
              </label>
              <Input
                value={serviceModal.name}
                onChange={(e) =>
                  setServiceModal({ ...serviceModal, name: e.target.value })
                }
                placeholder="np. Strzyżenie Brody"
                className="rounded-xl border-black"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">
                  Czas (min)
                </label>
                <Input
                  type="number"
                  value={serviceModal.duration}
                  onChange={(e) =>
                    setServiceModal({
                      ...serviceModal,
                      duration: e.target.value,
                    })
                  }
                  className="rounded-xl border-black"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">
                  Cena (grosze)
                </label>
                <Input
                  type="number"
                  value={serviceModal.price}
                  onChange={(e) =>
                    setServiceModal({ ...serviceModal, price: e.target.value })
                  }
                  className="rounded-xl border-black"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 italic">
              8000 groszy = 80.00 PLN
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setServiceModal({ ...serviceModal, isOpen: false })
              }
              className="flex-1 rounded-xl"
            >
              Anuluj
            </Button>
            <Button onClick={handleAddService} className="flex-1 rounded-xl">
              Dodaj
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
