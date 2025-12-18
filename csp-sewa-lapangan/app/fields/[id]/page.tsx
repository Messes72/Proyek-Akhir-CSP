import { createClient } from "@/lib/supabaseClient";
import BookingForm from "../../../components/fields/BookingForm";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic because we fetch single field which might be updated
export const revalidate = 0;

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  // Await params in newer Next.js
  const { id } = await params;

  const { data: field, error } = await supabase
    .from("fields")
    .select("*, field_images(*)")
    .eq("id", id)
    .single();

  if (error || !field) {
    return <div className="p-8 text-center">Lapangan tidak ditemukan.</div>;
  }

  // Use the first image or placeholder
  const imageUrl = field.field_images?.[0]?.file_path
    ? field.field_images[0].file_path
    : "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80";

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Link
          href="/fields"
          className="text-green-600 hover:text-green-800 mb-4 inline-block"
        >
          &larr; Kembali ke Daftar
        </Link>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image Gallery (Simplified to single image for MVP) */}
          <div className="flex flex-col">
            <div className="w-full aspect-w-1 aspect-h-1 rounded-lg overflow-hidden sm:aspect-w-2 sm:aspect-h-3">
              <img
                src={imageUrl}
                alt={field.name}
                className="w-full h-full object-center object-cover"
              />
            </div>
          </div>

          {/* Field Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              {field.name}
            </h1>

            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900">
                Rp {field.price_per_hour.toLocaleString("id-ID")}/jam
              </p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <div className="text-base text-gray-700 space-y-6">
                <p>{field.description}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900">Alamat</h3>
              <p className="mt-2 text-gray-500">{field.address}</p>
            </div>

            <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Booking Lapangan Ini
              </h3>
              <BookingForm
                fieldId={field.id}
                pricePerHour={field.price_per_hour}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
