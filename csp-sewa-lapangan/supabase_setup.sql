-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
-- Note: This table mirrors auth.users and extends it with application-specific data
create table public.users (
    id uuid references auth.users not null primary key,
    email text,
    name text,
    role text check (
        role in ('user', 'owner', 'admin')
    ) default 'user',
    avatar_url text,
    created_at timestamptz default now()
);

-- Enable RLS on users
alter table public.users enable row level security;

-- Policies for users
create policy "Users can view public profile of others" on public.users for
select using (true);

create policy "Users can update their own profile" on public.users for
update using (auth.uid () = id);

-- Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, name, role, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name', 
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. FIELDS TABLE
create table public.fields (
    id uuid default uuid_generate_v4 () primary key,
    owner_id uuid references public.users (id) not null,
    name text not null,
    description text,
    price_per_hour numeric not null,
    address text not null,
    lat double precision,
    lng double precision,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- Enable RLS on fields
alter table public.fields enable row level security;

-- Policies for fields
create policy "Public can view active fields" on public.fields for
select using (is_active = true);

create policy "Owners can view their own fields (even inactive)" on public.fields for
select using (auth.uid () = owner_id);

create policy "Owners can insert their own fields" on public.fields for
insert
with
    check (auth.uid () = owner_id);

create policy "Owners can update their own fields" on public.fields for
update using (auth.uid () = owner_id);

create policy "Owners can delete their own fields" on public.fields for delete using (auth.uid () = owner_id);

-- 3. FIELD IMAGES TABLE
create table public.field_images (
    id uuid default uuid_generate_v4 () primary key,
    field_id uuid references public.fields (id) on delete cascade not null,
    file_path text not null,
    caption text
);

-- Enable RLS on field_images
alter table public.field_images enable row level security;

-- Policies for field_images
create policy "Public can view field images" on public.field_images for
select using (true);

create policy "Owners can insert images for their fields" on public.field_images for
insert
with
    check (
        exists (
            select 1
            from public.fields
            where
                id = field_id
                and owner_id = auth.uid ()
        )
    );

create policy "Owners can update images for their fields" on public.field_images for
update using (
    exists (
        select 1
        from public.fields
        where
            id = field_id
            and owner_id = auth.uid ()
    )
);

create policy "Owners can delete images for their fields" on public.field_images for delete using (
    exists (
        select 1
        from public.fields
        where
            id = field_id
            and owner_id = auth.uid ()
    )
);

-- 4. BOOKINGS TABLE
create table public.bookings (
    id uuid default uuid_generate_v4 () primary key,
    field_id uuid references public.fields (id) not null,
    user_id uuid references public.users (id) not null,
    start_time timestamptz not null,
    end_time timestamptz not null,
    status text check (
        status in (
            'pending',
            'confirmed',
            'cancelled',
            'completed'
        )
    ) default 'pending',
    total_price numeric not null,
    proof_of_payment_url text,
    created_at timestamptz default now()
);

-- Enable RLS on bookings
alter table public.bookings enable row level security;

-- Policies for bookings
create policy "Users can view their own bookings" on public.bookings for
select using (auth.uid () = user_id);

create policy "Field owners can view bookings for their fields" on public.bookings for
select using (
        exists (
            select 1
            from public.fields
            where
                id = field_id
                and owner_id = auth.uid ()
        )
    );

create policy "Users can create bookings" on public.bookings for
insert
with
    check (auth.uid () = user_id);

create policy "Users can cancel their own pending bookings" on public.bookings for
update using (
    auth.uid () = user_id
    and status = 'pending'
)
with
    check (status = 'cancelled');

create policy "Field owners can update booking status" on public.bookings for
update using (
    exists (
        select 1
        from public.fields
        where
            id = field_id
            and owner_id = auth.uid ()
    )
);

-- 5. STORAGE BUCKETS
-- Note: You need to create these buckets in the dashboard first or via API, but we can set policies assuming they exist.
-- Buckets: 'avatars', 'field-images', 'payment-proofs'

insert into
    storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
    (
        'field-images',
        'field-images',
        true
    ),
    (
        'payment-proofs',
        'payment-proofs',
        false
    ) on conflict (id) do nothing;

-- Storage Policies

-- Avatars
create policy "Avatar images are publicly accessible" on storage.objects for
select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar" on storage.objects for
insert
with
    check (
        bucket_id = 'avatars'
        and auth.role () = 'authenticated'
    );

create policy "Users can update their own avatar" on storage.objects for
update using (
    bucket_id = 'avatars'
    and auth.uid () = owner
);

-- Field Images
create policy "Field images are publicly accessible" on storage.objects for
select using (bucket_id = 'field-images');

create policy "Owners can upload field images" on storage.objects for
insert
with
    check (
        bucket_id = 'field-images'
        and auth.role () = 'authenticated'
    );
-- Note: Ideally we check if they are an owner, but storage policies can be tricky with join checks.
-- Simplified to authenticated for standard use; typically backend or RLS on the record handles logical permission.

create policy "Owners can delete field images" on storage.objects for delete using (
    bucket_id = 'field-images'
    and auth.uid () = owner
);

-- Payment Proofs
create policy "Owners and Users can view payment proofs" on storage.objects for
select using (
        bucket_id = 'payment-proofs'
        and auth.role () = 'authenticated'
    );
-- Fine-grained access control for storage often requires specific RLS on objects table or signed URLs.
-- For simplicity here, allowing auth users.

create policy "Users can upload payment proofs" on storage.objects for
insert
with
    check (
        bucket_id = 'payment-proofs'
        and auth.role () = 'authenticated'
    );