"use client";

import Link from "next/link";
import PaymentUpload from "../../../components/bookings/PaymentUpload";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  created_at: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  proof_of_payment_url?: string;
  field: {
    name: string;
    address: string;
  };
}

interface BookingListClientProps {
  initialBookings: Booking[];
}

export default function BookingListClient({
  initialBookings,
}: BookingListClientProps) {
  const router = useRouter();

  const handleUploadComplete = () => {
    // Refresh the page data from server
    router.refresh();
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {initialBookings.map((booking) => (
          <li key={booking.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-green-600 truncate">
                  {booking.field.name}
                </p>
                <div className="ml-2 shrink-0 flex">
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
                      {new Date(booking.start_time).toLocaleString("id-ID")} -{" "}
                      {new Date(booking.end_time).toLocaleTimeString("id-ID")}
                    </p>
                    <p className="font-bold text-gray-900 mt-1">
                      Rp {booking.total_price.toLocaleString("id-ID")}
                    </p>
                    {booking.status === "pending" &&
                      !booking.proof_of_payment_url && (
                        <PaymentUpload
                          bookingId={booking.id}
                          onUploadComplete={handleUploadComplete}
                        />
                      )}
                    {booking.proof_of_payment_url && (
                      <span className="text-xs text-green-600 mt-1">
                        Bukti terupload
                      </span>
                    )}
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="mt-2 text-sm text-green-600 hover:text-green-800 font-medium hover:underline"
                    >
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
  );
}
