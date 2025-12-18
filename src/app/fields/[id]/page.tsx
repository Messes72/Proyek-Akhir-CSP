import BookingForm from "@/components/fields/BookingForm";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from '@/lib/server';

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createSupabaseServerClient();

  const { data: field, error } = await supabase
    .from('fields')
    .select('*, field_images(*)')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !field) {
    return <div className="p-8 text-center">Lapangan tidak ditemukan.</div>;
  }

  // Use the first image or placeholder
  const imageUrl = field.field_images?.[0]?.file_path
    ? (field.field_images[0].file_path.startsWith('http') 
        ? field.field_images[0].file_path 
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/field-images/${field.field_images[0].file_path}`)
    : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';

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
          <div className="w-full h-96 overflow-hidden rounded-lg relative">
            <Image 
              src={imageUrl} 
              alt={field.name} 
              fill
              className="object-cover"
              unoptimized={imageUrl.includes('supabase.co')}
            />
          </div>

          <div className="mt-10">
            <h1 className="text-3xl font-bold">{field.name}</h1>
            <p className="text-2xl mt-2">
              Rp {field.price_per_hour.toLocaleString('id-ID')}/jam
            </p>

            <p className="mt-4">{field.description}</p>

            <div className="mt-8">
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
