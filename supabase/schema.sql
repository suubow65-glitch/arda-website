-- ARDA CMS schema
-- Run this in the Supabase SQL editor (Dashboard → SQL).

create extension if not exists "pgcrypto";

create table if not exists public.slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  description text not null,
  image_url text not null,
  button_text text,
  button_link text,
  order_index int not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  sector text not null,
  location text not null,
  date text not null,
  image_url text not null,
  description text not null,
  content text,
  status text not null default 'Ongoing',
  created_at timestamp with time zone not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  year text not null,
  file_url text not null,
  file_size text,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamp with time zone not null default now()
);

alter table public.slides enable row level security;
alter table public.activities enable row level security;
alter table public.documents enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "Public can read active slides" on public.slides;
create policy "Public can read active slides"
  on public.slides for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Public can read activities" on public.activities;
create policy "Public can read activities"
  on public.activities for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read documents" on public.documents;
create policy "Public can read documents"
  on public.documents for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can submit contact messages" on public.contact_messages;
create policy "Public can submit contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

insert into storage.buckets (id, name, public)
values
  ('slide-images', 'slide-images', true),
  ('activity-images', 'activity-images', true),
  ('pdf-documents', 'pdf-documents', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read slide-images" on storage.objects;
create policy "Public read slide-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'slide-images');

drop policy if exists "Public read activity-images" on storage.objects;
create policy "Public read activity-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'activity-images');

drop policy if exists "Public read pdf-documents" on storage.objects;
create policy "Public read pdf-documents"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'pdf-documents');
