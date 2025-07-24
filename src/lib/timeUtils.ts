export const normalizeTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours >= 24) {
    const normalizedHours = hours % 24;
    return `${normalizedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  return time;
};

export const formatTimeForDisplay = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).toUpperCase();
};

export const getAPITimeFormat = (date: string, time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  if (hours >= 24) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    const normalizedTime = normalizeTime(time);
    return `${nextDay.toISOString().split('T')[0]} ${normalizedTime}`;
  }
  return `${date} ${time}`;
};

// Convert HH:MM to minutes since midnight
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert minutes since midnight to HH:MM
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Get rate based on current date and time
function getRate(date: Date): number {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = day === 0 || day === 6;

  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const dayStartTime = 6 * 60;  // 6 AM in minutes
  const dayEndTime = 18 * 60;   // 6 PM in minutes
  const isDayTime = totalMinutes >= dayStartTime && totalMinutes < dayEndTime;

  // Get rates from environment variables, with fallbacks
  const weekdayDayRate = Number(process.env.NEXT_PUBLIC_WEEKDAY_DAY_RATE) || 600;
  const weekdayNightRate = Number(process.env.NEXT_PUBLIC_WEEKDAY_NIGHT_RATE) || 1000;
  const weekendDayRate = Number(process.env.NEXT_PUBLIC_WEEKEND_DAY_RATE) || 600;
  const weekendNightRate = Number(process.env.NEXT_PUBLIC_WEEKEND_NIGHT_RATE) || 1100;

  if (isDayTime) {
    return isWeekend ? weekendDayRate : weekdayDayRate;
  }
  return isWeekend ? weekendNightRate : weekdayNightRate;
}

// Calculate booking price based on actual datetime
export function calculateBookingPrice(date: string, startTime: string, duration: number): number {
  const [year, month, day] = date.split('-').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);

  // Start DateTime
  const startDate = new Date(year, month - 1, day, startHour, startMinute);
  let totalPrice = 0;

  const intervalMinutes = 30;
  const intervalRateDivisor = 60 / intervalMinutes; // 2 if 30-min blocks

  for (let i = 0; i < duration * 60; i += intervalMinutes) {
    const intervalTime = new Date(startDate.getTime() + i * 60000);
    totalPrice += getRate(intervalTime) / intervalRateDivisor;
  }

  return Math.round(totalPrice);
}