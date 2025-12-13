'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddFieldPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_hour: '',
    address: '',
    open_time: '08:00',
    close_time: '22:00',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Sesi habis, silakan login kembali.');
      router.push('/auth/login');
      return;
    }

    // 1. Insert Field Data
    const { data: fieldData, error: fieldError } = await supabase
      .from('fields')
      .insert([
        {
          owner_id: user.id,
          name: formData.name,
          description: formData.description,
          price_per_hour: parseInt(formData.price_per_hour),
          address: formData.address,
        }
      ])
      .select()
      .single();

    if (fieldError) {
      alert('Gagal menambah lapangan: ' + fieldError.message);
      setLoading(false);
      return;
    }

    // 2. Upload Image (if exists)
    if (imageFile && fieldData) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${fieldData.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('field-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Lapangan dibuat, tapi gagal upload gambar.');
      } else {
        // 3. Link Image to Field
        const { data: { publicUrl } } = supabase.storage
            .from('field-images')
            .getPublicUrl(fileName);

        await supabase
          .from('field_images')
          .insert([
            {
              field_id: fieldData.id,
              file_path: publicUrl,
              caption: 'Main Image'
            }
          ]);
      }
    }

    alert('Lapangan berhasil ditambahkan!');
    router.push('/dashboard/owner');
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tambah Lapangan Baru</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lapangan</label>
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
           <label htmlFor="image" className="block text-sm font-medium text-gray-700">Foto Lapangan</label>
           <input
             type="file"
             id="image"
             accept="image/*"
             onChange={handleImageChange}
             className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
           />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi</label>
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
          <label htmlFor="price_per_hour" className="block text-sm font-medium text-gray-700">Harga per Jam (Rp)</label>
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
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
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
            {loading ? 'Menyimpan...' : 'Simpan Lapangan'}
          </button>
        </div>
      </form>
    </div>
  );
}
