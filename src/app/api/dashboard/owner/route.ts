import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  );

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Get role
  const { data: userData, error: roleError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (roleError || !userData) {
    return NextResponse.json({ error: 'Role not found' }, { status: 403 });
  }

  const role = userData.role;

  // 3. Fetch fields
  let fieldsQuery = supabase.from('fields').select('*');

  if (role !== 'admin') {
    fieldsQuery = fieldsQuery.eq('owner_id', user.id);
  }

  const { data: fields } = await fieldsQuery;

  // 4. Fetch bookings
  let bookings = [];

  if (fields && fields.length > 0) {
    const fieldIds = fields.map((f) => f.id);

    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        *,
        user:users (name, email),
        field:fields (name)
      `)
      .order('created_at', { ascending: false });

    if (role !== 'admin') {
      bookingsQuery = bookingsQuery.in('field_id', fieldIds);
    }

    const { data } = await bookingsQuery;
    bookings = data ?? [];
  }

  return NextResponse.json({
    role,
    fields: fields ?? [],
    bookings,
  });
}
