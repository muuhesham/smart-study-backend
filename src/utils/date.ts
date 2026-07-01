const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Returns a new Date with the time set to 00:00:00.000 (local time)
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Returns a new Date that is `days` days after the given date
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Formats a Date as 'YYYY-MM-DD' (local date, not UTC-shifted)
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Whole number of calendar days between two dates (to - from), ignoring time of day
export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / MS_PER_DAY);
}

export const WEEKDAY_SHORT_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// 3-letter weekday label (e.g. 'Mon') for a given date, local time
export function weekdayShortLabel(date: Date): string {
  return WEEKDAY_SHORT_LABELS[date.getDay()]!;
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const d = startOfDay(date);
  const dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const start = addDays(d, -diffToMonday);
  const end = addDays(start, 6);
  return { start, end };
}
