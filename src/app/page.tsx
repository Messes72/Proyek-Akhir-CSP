'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      setLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Home page - Session check:', { session: !!session, userId: session?.user?.id, error });
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Fetch role
          const { data, error: roleError } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentUser.id)
            .single();
          
          console.log('Home page - Role check:', { role: data?.role, roleError });
          
          if (data?.role === 'owner' || data?.role === 'admin') {
             console.log('Home page - Redirecting to dashboard...');
             window.location.href = '/dashboard/owner'; // Force redirect
             return;
          }
        }
      } catch (err) {
        console.error('Home page - Error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkUserAndRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log('Home page - Auth state change:', { event: _event, hasSession: !!session, userId: session?.user?.id });
        
        // Re-run check on auth change
        if (session?.user) {
             supabase.from('users').select('role').eq('id', session.user.id).single()
             .then(({ data, error }) => {
                 console.log('Home page - Auth change role check:', { role: data?.role, error });
                 if (data?.role === 'owner' || data?.role === 'admin') {
                   console.log('Home page - Auth change redirecting to dashboard...');
                   window.location.href = '/dashboard/owner';
                 }
             });
        }
        setUser(session?.user ?? null);
        setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl">
            Sewa Lapangan Olahraga
            <span className="block text-green-200">Dengan Mudah & Cepat</span>
          </h1>
          <p className="mt-6 text-xl text-green-100 max-w-3xl mx-auto">
            Temukan dan booking lapangan futsal, basket, badminton, dan lainnya di sekitar Anda.
            Cek jadwal real-time dan bayar aman.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <Link
                href="/fields"
                className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50 sm:px-8"
              >
                Cari Lapangan
              </Link>
              {user ? (
                <Link
                  href="/bookings/my"
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-800 hover:bg-green-900 sm:px-8"
                >
                  Lihat Booking Saya
                </Link>
              ) : (
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-800 hover:bg-green-900 sm:px-8"
                >
                  Daftar Sekarang
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-16 bg-gray-50 overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Kenapa Memilih Kami?
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Platform terbaik untuk pemilik lapangan dan pecinta olahraga.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900">Booking Instan</h3>
              <p className="mt-2 text-base text-gray-500">
                Pilih jam, cek ketersediaan, dan langsung booking tanpa ribet chat.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900">Pembayaran Mudah</h3>
              <p className="mt-2 text-base text-gray-500">
                Upload bukti pembayaran dan dapatkan konfirmasi instan dari pemilik.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900">Manajemen Jadwal</h3>
              <p className="mt-2 text-base text-gray-500">
                Untuk pemilik lapangan, atur jadwal dan harga dengan mudah lewat dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
