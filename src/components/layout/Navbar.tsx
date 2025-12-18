'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/database.types';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState<string | null>(null);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('role, name')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setRole(data.role);
      setName(data.name);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setRole(null);
        setName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh(); // Refresh server components to ensure clear state
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {role === 'admin' || role === 'owner' ? (
               <div className="shrink-0 flex items-center cursor-default">
                 <span className="text-xl font-bold text-green-600">SewaLapangan</span>
               </div>
            ) : (
              <Link href="/" className="shrink-0 flex items-center">
                <span className="text-xl font-bold text-green-600">SewaLapangan</span>
              </Link>
            )}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {(!user || role === 'user') && (
                <Link
                  href="/fields"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Cari Lapangan
                </Link>
              )}
              {(role === 'owner' || role === 'admin') && (
                <Link
                  href="/dashboard/owner"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {role === 'user' && (
                    <Link
                      href="/bookings/my"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Booking Saya
                    </Link>
                  )}
                  {(role === 'owner' || role === 'admin') && (
                     <span className={`text-xs px-2 py-1 rounded-full ${role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {role === 'admin' ? 'Admin' : 'Owner'}
                     </span>
                  )}
                  <span className="text-gray-700 text-sm border-l pl-4 border-gray-300">
                    Hello, {name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Keluar
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-green-600 text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
