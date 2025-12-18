import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/server';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseServerClient(_req);

  const { data, error } = await supabase
    .from('fields')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}


export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseServerClient(req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const { error } = await supabase
    .from('fields')
    .update(body)
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseServerClient(_req);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('fields')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
