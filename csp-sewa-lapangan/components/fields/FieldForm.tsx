"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface FieldFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price_per_hour: number;
    address: string;
  };
  isEdit?: boolean;
}

export default function FieldForm({
  initialData,
  isEdit = false,
}: FieldFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  interface FormData {
    name: string;
    description: string;
    price_per_hour: number | string;
    address: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price_per_hour: initialData?.price_per_hour || "",
    address: initialData?.address || "",
    // open/close time removed from schema? user said "strict schema" did not mention open/close time.
    // Checking database.types.ts...
    // fields: id, owner_id, name, description, price_per_hour, address, lat, lng, is_active.
    // There is NO open_time or close_time in the provided schema in database.types.ts!
    // I should remove them to be strict.
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Sesi habis, silakan login kembali.");
      router.push("/auth/login");
      return;
    }

    let fieldId = initialData?.id;

    if (isEdit && fieldId) {
      // UPDATE
      const { error: updateError } = await supabase
        .from("fields")
        .update({
          name: formData.name,
          description: formData.description,
          price_per_hour: parseInt(formData.price_per_hour.toString()),
          address: formData.address,
        })
        .eq("id", fieldId);

      if (updateError) {
        alert("Gagal update lapangan: " + updateError.message);
        setLoading(false);
        return;
      }
    } else {
      // INSERT
      const { data: fieldData, error: fieldError } = await supabase
        .from("fields")
        .insert([
          {
            owner_id: user.id,
            name: formData.name,
            description: formData.description,
            price_per_hour: parseInt(formData.price_per_hour.toString()),
            address: formData.address,
          },
        ])
        .select()
        .single();

      if (fieldError) {
        alert("Gagal menambah lapangan: " + fieldError.message);
        setLoading(false);
        return;
      }
      fieldId = fieldData.id;
    }

    // Upload Image if exists
    if (imageFile && fieldId) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${fieldId}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("field-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        alert("Lapangan disimpan, tapi gagal upload gambar.");
      } else {
        const {
          data: { publicUrl },
        } = supabase.storage.from("field-images").getPublicUrl(fileName);

        await supabase.from("field_images").insert([
          {
            field_id: fieldId,
            file_path: publicUrl,
            caption: "Main Image",
          },
        ]);
      }
    }

    alert(
      isEdit ? "Lapangan berhasil diupdate!" : "Lapangan berhasil ditambahkan!"
    );
    router.push("/dashboard/owner");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow"
    >
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Nama Lapangan
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700"
        >
          Foto Lapangan {isEdit && "(Biarkan kosong jika tidak ingin mengubah)"}
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Deskripsi
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          required
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="price_per_hour"
          className="block text-sm font-medium text-gray-700"
        >
          Harga per Jam (Rp)
        </label>
        <input
          type="number"
          name="price_per_hour"
          id="price_per_hour"
          required
          min="0"
          value={formData.price_per_hour}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="address"
          className="block text-sm font-medium text-gray-700"
        >
          Alamat Lengkap
        </label>
        <textarea
          name="address"
          id="address"
          rows={2}
          required
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {loading
            ? "Menyimpan..."
            : isEdit
            ? "Update Lapangan"
            : "Simpan Lapangan"}
        </button>
      </div>
    </form>
  );
}
