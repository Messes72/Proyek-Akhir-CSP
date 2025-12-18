import { createClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import OwnerDashboardClient from "./OwnerDashboardClient";

// Revalidate every 0s for dashboard to show fresh data
export const revalidate = 0;

// Define types locally to avoid database.types.ts imports and match Client Component
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

export default async function OwnerDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch Role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = userData?.role as "owner" | "admin";

  // 1. Fetch Fields
  let fieldsQuery = supabase.from("fields").select("*");

  // If NOT admin (meaning owner), filter by own ID. Admin sees ALL.
  if (userRole !== "admin") {
    fieldsQuery = fieldsQuery.eq("owner_id", user.id);
  }

  const { data: fieldsData, error: fieldsError } = await fieldsQuery;
  const fields = (fieldsData || []) as unknown as Field[];

  // 2. Fetch Bookings
  let bookingsQuery = supabase
    .from("bookings")
    .select(
      `
            *,
            user:users (name, email),
            field:fields (name)
        `
    )
    .order("created_at", { ascending: false });

  // If NOT admin, filter bookings to only those for the owner's fields
  if (userRole !== "admin") {
    if (fields.length > 0) {
      const fieldIds = fields.map((f) => f.id);
      bookingsQuery = bookingsQuery.in("field_id", fieldIds);
    } else {
      // Owner has no fields, so no bookings
      return (
        <OwnerDashboardClient
          initialFields={[]}
          initialBookings={[]}
          role={userRole}
        />
      );
    }
  }

  const { data: bookingsData, error: bookingsError } = await bookingsQuery;
  const bookings = (bookingsData || []) as unknown as Booking[];

  return (
    <OwnerDashboardClient
      initialFields={fields}
      initialBookings={bookings}
      role={userRole}
    />
  );
}
