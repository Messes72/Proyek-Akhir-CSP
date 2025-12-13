'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function EditFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_per_hour: '',
    address: '',
  });

  useEffect(() => {
    const fetchField = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }

        const { data, error } = await supabase
            .from('fields')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error || !data) {
            alert('Lapangan tidak ditemukan atau Anda tidak memiliki akses.');
            router.push('/dashboard/owner');
            return;
        }

        if (data.owner_id !== user.id) {
             alert('Anda tidak memiliki izin mengedit lapangan ini.');
             router.push('/dashboard/owner');
             return;
        }

        setFormData({
            name: data.name,
            description: data.description || '',
            price_per_hour: data.price_per_hour.toString(),
            address: data.address,
        });
        setLoading(false);
    };

    fetchField();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('fields')
      .update({
          name: formData.name,
          description: formData.description,
          price_per_hour: parseInt(formData.price_per_hour),
          address: formData.address,
      })
      .eq('id', id);

    if (error) {
      alert('Gagal update lapangan: ' + error.message);
      setSaving(false);
      return;
    }

    alert('Lapangan berhasil diupdate!');
    router.push('/dashboard/owner');
    router.refresh();
  };

  if (loading) return <div className="p-8 text-center">Memuat data lapangan...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Lapangan</h1>
      
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
            className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
