export function formatDateTime(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatTimeOnly(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function formatDateOnly(isoString) {
  if (!isoString) return '--';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

export function getElapsedMinutes(startTime) {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((now - start) / 60000));
}

export function formatDuration(minutes) {
  if (minutes < 60) return minutes + 'm';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? hrs + 'h ' + mins + 'm' : hrs + 'h';
}
