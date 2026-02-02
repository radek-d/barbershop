import { addMinutes, format, isBefore, isEqual, areIntervalsOverlapping, set } from 'date-fns';
import type { Schedule, Appointment } from '../types';

// Generuj dostępne terminy dla barbera na dany dzień
export function generateAvailableSlots(
  date: Date,
  schedule: Schedule | null,
  appointments: Appointment[],
  serviceDurationMinutes: number,
  slotIntervalMinutes: number = 30
): string[] {
  if (!schedule || !schedule.is_working) return [];

  const availableSlots: string[] = [];
  const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
  const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

  let currentSlot = set(date, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });
  const shiftEnd = set(date, { hours: endHour, minutes: endMinute, seconds: 0, milliseconds: 0 });
  const bookedIntervals = appointments.map(apt => ({
    start: new Date(apt.start_time),
    end: new Date(apt.end_time)
  }));

  while (isBefore(addMinutes(currentSlot, serviceDurationMinutes), shiftEnd) || isEqual(addMinutes(currentSlot, serviceDurationMinutes), shiftEnd)) {
    const slotEnd = addMinutes(currentSlot, serviceDurationMinutes);
    const isColliding = bookedIntervals.some(interval =>
      areIntervalsOverlapping({ start: currentSlot, end: slotEnd }, interval)
    );
    const isInPast = isBefore(currentSlot, new Date());

    if (!isColliding && !isInPast) {
      availableSlots.push(format(currentSlot, 'HH:mm'));
    }
    currentSlot = addMinutes(currentSlot, slotIntervalMinutes);
  }

  return availableSlots;
}
