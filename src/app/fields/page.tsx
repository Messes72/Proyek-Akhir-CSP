import FieldCard from '@/components/fields/FieldCard';
import { createSupabaseServerClient } from '@/lib/server';

export const revalidate = 60;

export default async function FieldsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: fields, error } = await supabase
    .from('fields')
    .select('*, field_images(file_path)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return (
      <div className="p-8 text-center text-red-500">
        Gagal memuat data lapangan
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Daftar Lapangan
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Pilih lapangan favoritmu dan booking sekarang.
          </p>
        </div>

        <div className="mt-12 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
          {fields?.length ? (
            fields.map((field) => (
              <FieldCard key={field.id} field={field} />
            ))
          ) : (
            <div className="col-span-3 text-center text-gray-500 py-12">
              Belum ada lapangan yang tersedia saat ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
