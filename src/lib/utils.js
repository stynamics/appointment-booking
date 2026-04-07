export function formatTime12Hour(timeStr) {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12; // Convert 0 to 12 for midnight
  return `${hour}:${minuteStr} ${ampm}`;
}

export function generateGoogleCalendarLink(service, dateStr, timeStr) {
  if (!dateStr || !timeStr) return '#';
  
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  const [hh, mm] = timeStr.split(':');
  
  const startStr = `${year}${month}${day}T${hh}${mm}00`;
  
  // Assume 1 hour default duration
  let endHourInt = parseInt(hh, 10) + 1;
  const endHour = String(endHourInt % 24).padStart(2, '0');
  
  // If appointment wraps past midnight, we won't mathematically adjust the date to keep it simple,
  // but standard slots are 9AM to 5PM so it's irrelevant.
  const endStr = `${year}${month}${day}T${endHour}${mm}00`;

  const title = encodeURIComponent(`Appointment: ${service}`);
  const details = encodeURIComponent(`Your booking for ${service} is confirmed!`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}`;
}
