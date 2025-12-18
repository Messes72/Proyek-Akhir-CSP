import { createClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import FieldForm from "../../../../components/fields/FieldForm";

export default async function EditFieldPage({
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

  // Fetch field data
  const { data: field, error } = await supabase
    .from("fields")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !field) {
    return (
      <div className="p-8 text-center text-red-500">
        Lapangan tidak ditemukan.
      </div>
    );
  }

  // Check ownership
  if (field.owner_id !== user.id) {
    return (
      <div className="p-8 text-center text-red-500">
        Anda tidak memiliki izin mengedit lapangan ini.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Lapangan</h1>
      <FieldForm initialData={field} isEdit={true} />
    </div>
  );
}
