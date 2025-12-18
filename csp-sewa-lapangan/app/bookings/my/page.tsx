import { createClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import Link from "next/link";
import BookingListClient from "./BookingListClient";

// Revalidate every 0 seconds (dynamic) as bookings change often
export const revalidate = 0;

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

export default async function MyBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Use inline type to avoid database.types.ts import
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      field:fields (
        name,
        address
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return <div>Error loading bookings.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
          Booking Saya
        </h2>

        {!bookings || bookings.length === 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            Anda belum memiliki booking.{" "}
            <Link
              href="/fields"
              className="text-green-600 hover:text-green-800"
            >
              Cari lapangan sekarang
            </Link>
            .
          </div>
        ) : (
          <BookingListClient
            initialBookings={bookings as unknown as Booking[]}
          />
        )}
      </div>
    </div>
  );
}
