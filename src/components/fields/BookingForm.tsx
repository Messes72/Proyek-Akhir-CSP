'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function BookingForm({ fieldId, pricePerHour }: { fieldId: string; pricePerHour: number }) {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    const time24 = `${hour}:00`;
    
    // Format to AM/PM for display
    const h = i % 12 || 12; // 0 becomes 12
    const ampm = i < 12 ? 'AM' : 'PM';
    const time12 = `${h}:00 ${ampm}`;
    
    timeOptions.push({ value: time24, label: time12 });
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Starting booking process...');

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Auth check result:', { user: user?.id, authError });

    if (!user) {
      alert('Silakan login terlebih dahulu untuk melakukan booking.');
      router.push('/auth/login');
      return;
    }

    // Validation for simple hour/minute check is no longer needed with dropdowns
    // which only provide full hour options.

    const startDateTime = new Date(`${date}T${startTime}:00`);
    const endDateTime = new Date(`${date}T${endTime}:00`);

    // Calculate hours duration
    const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);

    if (duration <= 0) {
      alert('Waktu selesai harus setelah waktu mulai.');
      setLoading(false);
      return;
    }

    const totalPrice = duration * pricePerHour;

    // Check for conflicting bookings
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id, start_time, end_time, status')
      .eq('field_id', fieldId)
      .neq('status', 'cancelled')
      .or(`and(start_time.lt.${endDateTime.toISOString()},end_time.gt.${startDateTime.toISOString()})`);

    if (checkError) {
      alert('Gagal memeriksa ketersediaan: ' + checkError.message);
      setLoading(false);
      return;
    }

    if (existingBookings && existingBookings.length > 0) {
      alert('Waktu yang dipilih sudah dibooking. Silakan pilih waktu lain.');
      setLoading(false);
      return;
    }

    // Use API route for booking creation
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        field_id: fieldId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        total_price: totalPrice,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert('Gagal membuat booking: ' + (result.message || 'Unknown error'));
      setLoading(false);
      return;
    }

    console.log('Booking created successfully:', result);
    alert('Booking berhasil dibuat! Silakan cek menu Booking Saya untuk status dan pembayaran.');
    router.push('/bookings/my');
    setLoading(false);
  };

  return (
    <form onSubmit={handleBooking} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Tanggal</label>
          <input
            id="date"
            type="date"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mt-2">Jam Mulai</label>
          <select
            id="start-time"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          >
            <option value="">Pilih Jam Mulai</option>
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mt-2">Jam Selesai</label>
          <select
            id="end-time"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-white rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          >
            <option value="">Pilih Jam Selesai</option>
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {loading ? 'Memproses...' : 'Booking Sekarang'}
        </button>
      </div>
    </form>
  );
}
