"use client";

import { useEffect, useState, useCallback, use } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Database } from "@/types/database.types";
import Link from "next/link";
import PaymentUpload from "@/components/bookings/PaymentUpload";

type BookingDetail = Database["public"]["Tables"]["bookings"]["Row"] & {
  field: {
    id: string;
    name: string;
    address: string;
    description: string;
    owner_id: string;
    price_per_hour: number;
    field_images: { file_path: string }[];
  };
  user: {
    name: string;
    email: string;
  };
};

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageSignedUrl, setImageSignedUrl] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/bookings/${unwrappedParams.id}`);

      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Gagal memuat detail booking");
      }

      const data = await res.json();
      setBooking(data);

      // Generate signed URL (boleh tetap di client)
      if (data.proof_of_payment_url) {
        const { data: signedData } = await supabase.storage
          .from("payment-proofs")
          .createSignedUrl(data.proof_of_payment_url, 3600);

        if (signedData?.signedUrl) {
          setImageSignedUrl(signedData.signedUrl);
        }
      }
    } catch (err) {
      console.error(err);
      router.push("/bookings/my");
    } finally {
      setLoading(false);
    }
  }, [unwrappedParams.id, router]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchBooking();
    };
    fetchData();
  }, [fetchBooking]);

  const handleCopyId = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.id);
      alert("ID Booking disalin!");
    }
  };

  if (loading) return <div className="p-12 text-center">Memuat detail...</div>;
  if (!booking)
    return (
      <div className="p-12 text-center text-red-500">
        Booking tidak ditemukan.
      </div>
    );

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
                        // We use a simple img tag or Next Image with the signed URL source
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
                            onUploadComplete={fetchBooking}
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
                              onUploadComplete={fetchBooking}
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
