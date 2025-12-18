import { createClient } from "@/lib/supabaseClient";
import FieldCard from "../../components/fields/FieldCard";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function FieldsPage() {
  const supabase = await createClient();

  // Define type locally to match FieldCard requirements
  type Field = {
    id: string;
    name: string;
    price_per_hour: number;
    address: string;
    field_images?: { file_path: string }[];
  };

  // Fetch user for restricted access checks
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // Use 'any' to bypass Supabase return type but cast to our local Field type
  const { data: fieldsData, error } = await supabase
    .from("fields")
    .select("*, field_images(file_path)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const fields = (fieldsData || []) as unknown as Field[];

  if (error) {
    console.error(
      "Supabase Error Fetching Fields:",
      JSON.stringify(error, null, 2)
    );
    return (
      <div className="p-8 text-center text-red-500">
        Gagal memuat data lapangan: {error.message}
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
          {fields && fields.length > 0 ? (
            fields.map((field) => (
              <FieldCard key={field.id} field={field} user={user} />
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
