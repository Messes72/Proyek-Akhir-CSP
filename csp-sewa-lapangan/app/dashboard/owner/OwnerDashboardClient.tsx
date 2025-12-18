"use client";

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface Field {
  id: string;
  name: string;
  address: string;
  price_per_hour: number;
}

interface Booking {
  id: string;
  created_at: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: "pending" | "confirmed" | "cancelled";
  proof_of_payment_url?: string;
  field: {
    name: string;
  };
  user: {
    name: string;
    email: string;
  };
}

interface OwnerDashboardClientProps {
  initialFields: Field[];
  initialBookings: Booking[];
  role: "owner" | "admin";
}

export default function OwnerDashboardClient({
  initialFields,
  initialBookings,
  role,
}: OwnerDashboardClientProps) {
  const supabase = createClient();
  const router = useRouter();

  // Use props directly if we rely on router.refresh()
  const fields = initialFields;
  const bookings = initialBookings;

  // Simple state update function? Or rely on router.refresh()?
  // If we rely on router.refresh(), the prop 'initialBookings' will update?
  // Yes, RSC payload will update.
  const refreshData = () => {
    router.refresh();
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "cancelled"
  ) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      alert("Gagal update status: " + error.message);
    } else {
      refreshData();
    }
  };

  const deleteField = async (fieldId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus lapangan ini?")) {
      const { error } = await supabase
        .from("fields")
        .delete()
        .eq("id", fieldId);
      if (error) {
        alert("Gagal menghapus: " + error.message);
      } else {
        refreshData();
      }
    }
  };

  const viewPaymentProof = async (path: string) => {
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(path, 60);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      alert("Gagal memuat gambar: " + (error?.message || "Unknown error"));
    }
  };

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
                        onClick={() => deleteField(field.id)}
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
                        {booking.field?.name}
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
                          onClick={() =>
                            viewPaymentProof(booking.proof_of_payment_url!)
                          }
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
