import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/server';

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient(req);

  const { data, error } = await supabase
    .from('fields')
    .select('*, field_images(file_path)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
