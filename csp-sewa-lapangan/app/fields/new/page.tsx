import { createClient } from "@/lib/supabaseClient";
import { redirect } from "next/navigation";
import FieldForm from "../../../components/fields/FieldForm";

export default async function AddFieldPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check role
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "owner" && userData?.role !== "admin") {
    return <div className="p-8 text-center">Akses ditolak.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Tambah Lapangan Baru
      </h1>
      <FieldForm />
    </div>
  );
}
