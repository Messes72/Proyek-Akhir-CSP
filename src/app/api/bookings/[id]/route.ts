import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/server'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseServerClient(_req)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      field:fields (
        *,
        field_images (file_path)
      ),
      user:users (name, email)
    `)
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
  }

  // Optional: pastikan user hanya bisa lihat booking sendiri
  if (data.user_id !== user.id) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(data)
}
