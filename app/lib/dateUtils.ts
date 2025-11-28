/**
 * Converts a date string (YYYY-MM-DD) to a Date object representing UTC midnight.
 * This ensures consistent date handling across the application, avoiding timezone issues.
 * 
 * @param dateString - ISO date string in format YYYY-MM-DD
 * @returns Date object set to midnight UTC for the given date
 */
export function getUTCMidnight(dateString: string): Date {
  // Parse the date components
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create a Date object at UTC midnight
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Formats a Date object to YYYY-MM-DD string using UTC timezone.
 * 
 * @param date - Date object to format
 * @returns ISO date string in format YYYY-MM-DD
 */
export function formatUTCDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object to a long format string using UTC timezone.
 * Example: "Wednesday, November 27th, 2025"
 * 
 * @param date - Date object to format
 * @returns Formatted date string
 */
export function formatUTCDateLong(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const dayOfWeek = days[date.getUTCDay()];
  const month = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  
  // Add ordinal suffix (st, nd, rd, th)
  const suffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  return `${dayOfWeek}, ${month} ${day}${suffix(day)}, ${year}`;
}
