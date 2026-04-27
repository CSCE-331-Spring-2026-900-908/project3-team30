export const DEFAULT_MANAGER_TIME_ZONE = 'America/Chicago';

export function getBrowserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_MANAGER_TIME_ZONE;
}

export function formatOrderDate(value, timeZone = getBrowserTimeZone()) {
  if (!value) return '—';

  return new Date(value).toLocaleString([], {
    timeZone,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}