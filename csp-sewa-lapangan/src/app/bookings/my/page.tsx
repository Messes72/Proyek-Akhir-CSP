'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import PaymentUpload from '@/components/bookings/PaymentUpload';
import { Database } from '@/types/database.types';

type Booking = Database['public']['Tables']['bookings']['Row'] & {
  field: {
    name: string;
    address: string;
  };
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        field:fields (
          name,
          address
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      if (data) {
        setBookings(data as unknown as Booking[]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line
    void fetchBookings();
  }, [fetchBookings]);

  if (loading) return <div className="p-8 text-center">Memuat booking...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Booking Saya</h2>
        
        {bookings.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            Anda belum memiliki booking. <Link href="/fields" className="text-green-600 hover:text-green-800">Cari lapangan sekarang</Link>.
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-600 truncate">
                        {booking.field.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {booking.field.address}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div className="flex flex-col items-end">
                          <p>
                            {new Date(booking.start_time).toLocaleString('id-ID')} - {new Date(booking.end_time).toLocaleTimeString('id-ID')}
                          </p>
                          <p className="font-bold text-gray-900 mt-1">
                            Rp {booking.total_price.toLocaleString('id-ID')}
                          </p>
                          {booking.status === 'pending' && !booking.proof_of_payment_url && (
                             <PaymentUpload bookingId={booking.id} onUploadComplete={fetchBookings} />
                          )}
                          {booking.proof_of_payment_url && (
                            <span className="text-xs text-green-600 mt-1">Bukti terupload</span>
                          )}
                           <Link href={`/bookings/${booking.id}`} className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium hover:underline">
                            Lihat Detail →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
