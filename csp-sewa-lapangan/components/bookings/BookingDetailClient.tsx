"use client";

import Link from "next/link";
import PaymentUpload from "./PaymentUpload";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  proof_of_payment_url?: string;
  start_time: string;
  end_time: string;
  field: {
    name: string;
    address: string;
  };
}

interface BookingDetailClientProps {
  booking: Booking;
  imageSignedUrl: string | null;
}

export default function BookingDetailClient({
  booking,
  imageSignedUrl,
}: BookingDetailClientProps) {
  const router = useRouter();

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking.id);
    alert("ID Booking disalin!");
  };

  const onUploadComplete = () => {
    router.refresh();
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/bookings/my"
            className="text-green-600 hover:text-green-800 font-medium"
          >
            ← Kembali ke Booking Saya
          </Link>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Detail Booking
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                ID: {booking.id}{" "}
                <button
                  onClick={handleCopyId}
                  className="text-blue-500 ml-2"
                  title="Copy ID"
                >
                  📋
                </button>
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-semibold capitalize
                ${
                  booking.status === "confirmed"
                    ? "bg-green-100 text-green-800"
                    : booking.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
            >
              {booking.status}
            </div>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {/* Field Info */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Lapangan</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-semibold">
                  {booking.field.name}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Alamat</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {booking.field.address}
                </dd>
              </div>

              {/* Timing */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Waktu Main
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div>
                    {new Date(booking.start_time).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="font-mono text-gray-600">
                    {new Date(booking.start_time).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(booking.end_time).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </dd>
              </div>

              {/* Pricing */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dd className="mt-1 text-blue-600 font-bold sm:mt-0 sm:col-span-2 text-lg">
                  Rp {booking.total_price.toLocaleString("id-ID")}
                </dd>
              </div>

              {/* Payment Proof Section */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Bukti Pembayaran
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {booking.proof_of_payment_url ? (
                    <div className="mt-2">
                      {imageSignedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageSignedUrl}
                          alt="Bukti Bayar"
                          className="max-w-xs rounded border border-gray-300 shadow-sm"
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          Memuat gambar...
                        </span>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded at:{" "}
                        {new Date(booking.created_at).toLocaleString("id-ID")}
                      </p>

                      {booking.status === "pending" && (
                        <div className="mt-4 border-t pt-2">
                          <p className="text-xs text-gray-500 mb-2">
                            Ingin mengganti bukti bayar?
                          </p>
                          <PaymentUpload
                            bookingId={booking.id}
                            onUploadComplete={onUploadComplete}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Anda belum mengupload bukti pembayaran.
                          </p>
                          <div className="mt-2">
                            <PaymentUpload
                              bookingId={booking.id}
                              onUploadComplete={onUploadComplete}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
