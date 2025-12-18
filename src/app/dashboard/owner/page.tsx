"use client";

import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import Link from "next/link";

type Field = Database["public"]["Tables"]["fields"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  user: {
    name: string;
    email: string;
  };
  field: {
    name: string;
  };
};

export default function OwnerDashboard() {
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"owner" | "admin" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard/owner", {
        credentials: "include",
      });

      if (res.status === 401) {
        console.log('Dashboard: User not authorized');
        setError('Anda tidak memiliki akses ke halaman ini. Silakan login dengan akun yang sesuai.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("Gagal load dashboard");
        setError('Terjadi kesalahan saat memuat dashboard.');
        setLoading(false);
        return;
      }

      const data = await res.json();

      setRole(data.role);
      setFields(data.fields);
      setBookings(data.bookings);
      setLoading(false);
    };

    fetchDashboard();
  }, [refreshKey]);

  const updateBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "cancelled"
  ) => {
    const res = await fetch(`/api/dashboard/owner/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert("Gagal update status");
    } else {
      setRefreshKey((prev) => prev + 1);
    }
  };

  if (error)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Akses Ditolak
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    href="/auth/login"
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Login dengan Akun yang Sesuai
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  if (loading)
    return <div className="p-8 text-center">Memuat dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Fields Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {role === "admin" ? "Semua Lapangan" : "Lapangan Saya"}
          </h2>
          {role !== "admin" && (
            <Link
              href="/fields/new"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Tambah Lapangan
            </Link>
          )}
        </div>

        {fields.length === 0 ? (
          <p className="text-gray-500">
            {role === "admin"
              ? "Belum ada lapangan di sistem."
              : "Anda belum memiliki lapangan."}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fields.map((field) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 shadow-sm bg-white"
              >
                <h3 className="font-bold text-lg">{field.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{field.address}</p>
                <p className="text-green-600 font-semibold">
                  Rp {field.price_per_hour.toLocaleString()}/jam
                </p>
                <div className="mt-4 flex space-x-2">
                  {role !== "admin" && (
                    <>
                      <Link
                        href={`/fields/${field.id}/edit`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={async () => {
                          if (
                            confirm(
                              "Apakah Anda yakin ingin menghapus lapangan ini?"
                            )
                          ) {
                            const { error } = await supabase
                              .from("fields")
                              .delete()
                              .eq("id", field.id);
                            if (error) {
                              alert("Gagal menghapus: " + error.message);
                            } else {
                              setRefreshKey((prev) => prev + 1);
                            }
                          }
                        }}
                        className="text-red-600 text-sm hover:underline cursor-pointer"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bookings Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Booking Masuk
        </h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">Belum ada booking masuk.</p>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 truncate">
                        {booking.field.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Penyewa: {booking.user?.name || booking.user?.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tanggal:{" "}
                        {new Date(booking.start_time).toLocaleDateString()} |
                        Jam:{" "}
                        {new Date(booking.start_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -
                        {new Date(booking.end_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p className="text-sm text-gray-500 font-bold mt-1">
                        Total: Rp {booking.total_price.toLocaleString()}
                      </p>
                      {booking.proof_of_payment_url && (
                        <button
                          onClick={async () => {
                            const { data, error } = await supabase.storage
                              .from("payment-proofs")
                              .createSignedUrl(
                                booking.proof_of_payment_url!,
                                60
                              ); // Valid for 60s

                            if (data?.signedUrl) {
                              window.open(data.signedUrl, "_blank");
                            } else {
                              alert(
                                "Gagal memuat gambar: " +
                                  (error?.message || "Unknown error")
                              );
                            }
                          }}
                          className="text-blue-500 text-xs hover:underline mt-1 block text-left cursor-pointer"
                        >
                          Lihat Bukti Bayar
                        </button>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${
                                          booking.status === "confirmed"
                                            ? "bg-green-100 text-green-800"
                                            : booking.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                        }`}
                      >
                        {booking.status}
                      </span>
                      {booking.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              updateBookingStatus(booking.id, "confirmed")
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 cursor-pointer"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() =>
                              updateBookingStatus(booking.id, "cancelled")
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
