import { createClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import BookingDetailClient from "../../../components/bookings/BookingDetailClient";

// Force dynamic because we use params and auth.
export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      field:fields (
        *,
        field_images (file_path)
      ),
      user:users (name, email)
    `
    )
    .eq("id", id)
    .single();

  if (error || !booking) {
    return (
      <div className="p-12 text-center text-red-500">
        Booking tidak ditemukan atau terjadi kesalahan.
      </div>
    );
  }

  // Generate signed URL if proof exists (server-side)
  let imageSignedUrl: string | null = null;
  if (booking.proof_of_payment_url) {
    const { data: signedData } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(booking.proof_of_payment_url, 3600); // 1 hour
    if (signedData?.signedUrl) {
      imageSignedUrl = signedData.signedUrl;
    }
  }

  return (
    <BookingDetailClient booking={booking} imageSignedUrl={imageSignedUrl} />
  );
}
