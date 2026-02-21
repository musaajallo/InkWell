/**
 * Date Formatting Helpers
 */

/**
 * Format a date to a relative or absolute display string.
 * - "Just now" for < 1 minute
 * - "5 min ago" for < 1 hour
 * - "Today, 9:15 AM" for today
 * - "Yesterday, 11:30 PM" for yesterday
 * - "Feb 19, 2026" for older dates
 */
export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86_400_000);
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (dateDay.getTime() === today.getTime()) {
    return `Today, ${timeStr}`;
  }

  if (dateDay.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a date for display as a full date string.
 */
export function formatFullDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get the current ISO 8601 timestamp.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Check if a cached timestamp has expired.
 */
export function isCacheExpired(fetchedAt: string, expiryHours: number): boolean {
  const fetchedTime = new Date(fetchedAt).getTime();
  const expiryMs = expiryHours * 3_600_000;
  return Date.now() - fetchedTime > expiryMs;
}
