import Link from 'next/link';
import Image from 'next/image';
import { Database } from '@/types/database.types';

type Field = Database['public']['Tables']['fields']['Row'];
// Extend Field to include images if we join them, but for now pure Row is fine
// Realistically we will fetch with images, so let's allow an optional image property for now
interface FieldWithImage extends Field {
  field_images?: { file_path: string }[];
}

interface FieldCardProps {
  field: FieldWithImage;
}

export default function FieldCard({ field }: FieldCardProps) {
  // Demo image if none
  const imageUrl = field.field_images?.[0]?.file_path 
    ? (field.field_images[0].file_path.startsWith('http') 
        ? field.field_images[0].file_path 
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/field-images/${field.field_images[0].file_path}`)
    : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'; // Placeholder

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
      <div className="h-48 w-full relative">
        <Image 
          src={imageUrl} 
          alt={field.name} 
          fill
          className="object-cover"
          unoptimized={imageUrl.includes('supabase.co')}
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-sm font-bold text-green-600 shadow-sm">
          Rp {field.price_per_hour.toLocaleString('id-ID')}/jam
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          <Link href={`/fields/${field.id}`} className="hover:text-green-600 transition-colors">
            {field.name}
          </Link>
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 truncate">
          {field.address}
        </p>
        <div className="mt-4 flex justify-between items-center">
            <Link 
              href={`/fields/${field.id}`}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
            >
              Lihat Detail
            </Link>
        </div>
      </div>
    </div>
  );
}
