import { addMinutes, format, isBefore, isEqual, areIntervalsOverlapping, set } from 'date-fns';
import type { Schedule, Appointment } from '../types';

/**
 * Generates available time slots for a specific barber on a specific date.
 * Uses the specific 'Schedule' entry for that day (if exists).
 */
export function generateAvailableSlots(
  date: Date,
  schedule: Schedule | null,
  appointments: Appointment[],
  serviceDurationMinutes: number,
  slotIntervalMinutes: number = 30
): string[] {
  // If no schedule for this day (or marked as not working), no slots
  if (!schedule || !schedule.is_working) return [];

  const availableSlots: string[] = [];
  
  // Parse working hours from the Schedule (HH:mm:ss)
  const [startHour, startMinute] = schedule.start_time.split(':').map(Number);
  const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

  // Create Date objects for shift start/end on that specific day
  let currentSlot = set(date, { 
    hours: startHour, 
    minutes: startMinute, 
    seconds: 0, 
    milliseconds: 0 
  });

  const shiftEnd = set(date, { 
    hours: endHour, 
    minutes: endMinute, 
    seconds: 0, 
    milliseconds: 0 
  });

  // Convert appointments to Date Intervals for collision detection
  const bookedIntervals = appointments.map(apt => ({
    start: new Date(apt.start_time),
    end: new Date(apt.end_time)
  }));

  // Iterate through the shift
  while (isBefore(addMinutes(currentSlot, serviceDurationMinutes), shiftEnd) || isEqual(addMinutes(currentSlot, serviceDurationMinutes), shiftEnd)) {
    const slotEnd = addMinutes(currentSlot, serviceDurationMinutes);
    
    // Check for collisions with THIS barber's appointments
    const isColliding = bookedIntervals.some(interval => {
      return areIntervalsOverlapping(
        { start: currentSlot, end: slotEnd },
        interval
      );
    });

    // Also check if slot is in the past (Time Travel Prevention Frontend)
    const isInPast = isBefore(currentSlot, new Date());

    if (!isColliding && !isInPast) {
      availableSlots.push(format(currentSlot, 'HH:mm'));
    }

    // Move to next slot
    currentSlot = addMinutes(currentSlot, slotIntervalMinutes);
  }

  return availableSlots;
}
