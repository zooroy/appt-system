import { AdminBookingsClient } from './_components/admin-bookings-client';
import { getBookings } from './actions';

export default async function AdminPage() {
  const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
  const bookings = await getBookings(dateStr);

  return <AdminBookingsClient bookings={bookings} currentDate={dateStr} />;
}
