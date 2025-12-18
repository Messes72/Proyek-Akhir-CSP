import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(req: Request) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
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
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  try {
    console.log('POST /api/bookings called');

    const cookieStore = await cookies()

    const supabase = createServerClient(
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
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('User check:', { hasUser: !!user, userId: user?.id });

    if (!user) {
      console.log('No user found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { field_id, start_time, end_time, total_price } = body

    if (!field_id || !start_time || !end_time || !total_price) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for conflicting bookings
    const { data: existingBookings, error: checkError } = await supabase
      .from('bookings')
      .select('id')
      .eq('field_id', field_id)
      .neq('status', 'cancelled')
      .or(`and(start_time.lt.${end_time},end_time.gt.${start_time})`)

    if (checkError) {
      return NextResponse.json(
        { message: 'Failed to check availability: ' + checkError.message },
        { status: 500 }
      )
    }

    if (existingBookings && existingBookings.length > 0) {
      return NextResponse.json(
        { message: 'Time slot already booked' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([
        {
          field_id,
          user_id: user.id,
          start_time,
          end_time,
          status: 'pending',
          total_price,
        },
      ])
      .select()

    if (error) {
      console.error('Booking insert error:', error)
      return NextResponse.json(
        { message: 'Failed to create booking: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0])
  } catch (e: any) {
    console.error('Error in POST /api/bookings:', e)
    return NextResponse.json(
      { message: 'Internal server error', error: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
