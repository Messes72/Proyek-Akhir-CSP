import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import FieldCard from "../components/fields/FieldCard";
import RestrictedLink from "@/components/common/RestrictedLink";

// Inline interface for Field with joined FieldImages
// Using 'any' as requested for convenience, or simple interface
interface FieldWithImage {
  id: string;
  name: string;
  price_per_hour: number;
  address: string;
  field_images: { file_path: string }[];
}

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role === "owner" || userData?.role === "admin") {
      redirect("/dashboard/owner");
    }
  }

  // Fetch featured fields (active, limit 6)
  const { data: fields } = await supabase
    .from("fields")
    .select("id, name, price_per_hour, address, field_images(file_path)")
    .eq("is_active", true)
    .limit(6);

  const featuredFields = (fields as unknown as FieldWithImage[]) || [];

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
            Temukan dan booking lapangan futsal, basket, badminton, dan lainnya
            di sekitar Anda. Cek jadwal real-time dan bayar aman.
          </p>
          <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
            <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
              <RestrictedLink
                href="/fields"
                user={user}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-green-700 bg-white hover:bg-green-50 sm:px-8"
              >
                Cari Lapangan
              </RestrictedLink>
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

      {/* Featured Fields Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Lapangan Pilihan
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Daftar lapangan terbaru yang siap untuk Anda booking.
            </p>
          </div>
          <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {featuredFields.map((field) => (
              <FieldCard key={field.id} field={field as any} user={user} />
            ))}
            {featuredFields.length === 0 && (
              <p className="text-center text-gray-500 col-span-3">
                Belum ada lapangan yang tersedia saat ini.
              </p>
            )}
          </div>
          <div className="mt-10 text-center">
            <RestrictedLink
              href="/fields"
              user={user}
              className="text-green-600 hover:text-green-700 font-medium text-lg"
            >
              Lihat Semua Lapangan &rarr;
            </RestrictedLink>
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
              <h3 className="text-lg font-medium text-gray-900">
                Booking Instan
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Pilih jam, cek ketersediaan, dan langsung booking tanpa ribet
                chat.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900">
                Pembayaran Mudah
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Upload bukti pembayaran dan dapatkan konfirmasi instan dari
                pemilik.
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-lg font-medium text-gray-900">
                Manajemen Jadwal
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Untuk pemilik lapangan, atur jadwal dan harga dengan mudah lewat
                dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
