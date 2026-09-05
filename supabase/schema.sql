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

-- Site-wide settings and content

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  org_name text not null default 'Action for Relief And Development Agency (ARDA)',
  short_name text not null default 'ARDA',
  tagline text not null default '',
  phone text not null default '',
  phone_ict text,
  email text not null default '',
  email_ict text,
  address text not null default '',
  sub_office_addresses text,
  location text not null default '',
  website text not null default '',
  established text,
  registrations text,
  executive_director text not null default '',
  social_facebook text,
  social_x text,
  social_linkedin text,
  social_instagram text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.about_content (
  id uuid primary key default gen_random_uuid(),
  vision text not null default '',
  mission text not null default '',
  core_values jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.impact_stats (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value int not null default 0,
  suffix text not null default '',
  order_index int not null default 0,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  initials text not null,
  logo_url text,
  website_url text,
  order_index int not null default 0,
  created_at timestamp with time zone not null default now()
);

alter table public.site_settings enable row level security;
alter table public.about_content enable row level security;
alter table public.impact_stats enable row level security;
alter table public.partners enable row level security;

drop policy if exists "Public can read site_settings" on public.site_settings;
create policy "Public can read site_settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read about_content" on public.about_content;
create policy "Public can read about_content"
  on public.about_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read impact_stats" on public.impact_stats;
create policy "Public can read impact_stats"
  on public.impact_stats for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read partners" on public.partners;
create policy "Public can read partners"
  on public.partners for select
  to anon, authenticated
  using (true);

insert into public.site_settings (id, org_name, short_name, tagline, phone, email, address, location, website, established, registrations, executive_director)
values (
  '00000000-0000-0000-0000-000000000000',
  'Action for Relief And Development Agency (ARDA)',
  'ARDA',
  'Designing and implementing life changing Relief and development programs that alleviate climatic change risks and deepening poverty in collaboration with relevant stakeholders to ensure holistic sustainable development in Somalia.',
  '+252-0624599060',
  'info@arda.org.so',
  'Mogadishu Road, Adaada, Baidoa, Southwest State, Somalia',
  'Baidoa, Southwest State, Somalia',
  'www.arda.org.so',
  '2017',
  'Federal Ministry of Interior Ref #2123 · Southwest State MoPIED Reg #6173',
  'Isse Abdullahi Hassan'
)
on conflict (id) do update set updated_at = now();

insert into storage.buckets (id, name, public)
values ('partner-logos', 'partner-logos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read partner-logos" on storage.objects;
create policy "Public read partner-logos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'partner-logos');

-- Team, vacancies, and admin credentials

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  category text not null default 'executive' check (category in ('board', 'executive', 'volunteer')),
  image_url text,
  bio text,
  order_index int not null default 0,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.vacancies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null default 'job' check (type in ('job', 'tender')),
  location text,
  deadline text,
  file_url text,
  description text,
  status text not null default 'active' check (status in ('active', 'closed')),
  order_index int not null default 0,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  passcode text not null,
  updated_at timestamp with time zone not null default now()
);

alter table public.team_members enable row level security;
alter table public.vacancies enable row level security;
alter table public.admin_credentials enable row level security;

drop policy if exists "Public can read team_members" on public.team_members;
create policy "Public can read team_members"
  on public.team_members for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read vacancies" on public.vacancies;
create policy "Public can read vacancies"
  on public.vacancies for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can read admin_credentials" on public.admin_credentials;
create policy "Public can read admin_credentials"
  on public.admin_credentials for select
  to anon, authenticated
  using (true);

insert into public.admin_credentials (id, email, passcode)
values (
  '00000000-0000-0000-0000-000000000001',
  'ict@arda.org.so',
  'ArdaAdmin2026!'
)
on conflict (id) do update set updated_at = now();

insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('vacancy-files', 'vacancy-files', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read team-photos" on storage.objects;
create policy "Public read team-photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'team-photos');

drop policy if exists "Public read vacancy-files" on storage.objects;
create policy "Public read vacancy-files"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'vacancy-files');

-- Emergency alert banner

create table if not exists public.alert_banner (
  id uuid primary key default gen_random_uuid(),
  message text not null default '',
  button_text text,
  button_url text,
  active boolean not null default false,
  bg_color text not null default '#C60C30',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.alert_banner enable row level security;

drop policy if exists "Public can read alert_banner" on public.alert_banner;
create policy "Public can read alert_banner"
  on public.alert_banner for select
  to anon, authenticated
  using (active = true);

-- Page section titles and subheadings

create table if not exists public.page_headers (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  title text not null default '',
  subtitle text,
  description text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (page_key, section_key)
);

alter table public.page_headers enable row level security;

drop policy if exists "Public can read page_headers" on public.page_headers;
create policy "Public can read page_headers"
  on public.page_headers for select
  to anon, authenticated
  using (true);

-- Programmatic pillars / focus areas

create table if not exists public.pillars (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_slug text not null,
  icon_name text not null,
  short_desc text not null,
  full_content text not null,
  interventions text[] not null default '{}',
  order_index int not null default 0,
  active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.pillars enable row level security;

drop policy if exists "Public can read pillars" on public.pillars;
create policy "Public can read pillars"
  on public.pillars for select
  to anon, authenticated
  using (active = true);

-- Field photo gallery

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  category text,
  image_url text not null,
  date text,
  featured boolean not null default false,
  created_at timestamp with time zone not null default now()
);

alter table public.gallery_photos enable row level security;

drop policy if exists "Public can read gallery_photos" on public.gallery_photos;
create policy "Public can read gallery_photos"
  on public.gallery_photos for select
  to anon, authenticated
  using (true);

insert into storage.buckets (id, name, public)
values ('gallery-photos', 'gallery-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read gallery-photos" on storage.objects;
create policy "Public read gallery-photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery-photos');

-- =====================================================================
-- WARNING — FULLY OPEN READ/WRITE POLICIES (explicitly requested)
-- =====================================================================
-- The block below grants UNRESTRICTED select/insert/update/delete to the
-- `anon` (and `authenticated`) role on every application table and to
-- every storage bucket's objects. Because the Supabase anon key ships
-- inside the public browser bundle, this means ANY visitor to the website
-- can read, create, modify, or permanently delete ANY row or file in this
-- project — completely bypassing the admin login. The app's own admin API
-- routes do NOT need this (they already use the service-role key, which
-- bypasses RLS entirely), so this section exists purely to satisfy an
-- explicit request for open public read/write access. If you did not mean
-- to allow anonymous visitors to edit/delete your live NGO data, remove
-- this block and rely on the narrower "Public can read ..." policies
-- defined above instead.
-- =====================================================================

do $$
declare
  t text;
  tables text[] := array[
    'slides', 'activities', 'documents', 'contact_messages',
    'site_settings', 'about_content', 'impact_stats', 'partners',
    'team_members', 'vacancies', 'admin_credentials',
    'alert_banner', 'page_headers', 'pillars', 'gallery_photos'
  ];
begin
  foreach t in array tables loop
    execute format('grant select, insert, update, delete on table public.%I to anon, authenticated;', t);
    execute format('drop policy if exists "Open access select" on public.%I;', t);
    execute format('create policy "Open access select" on public.%I for select to anon, authenticated using (true);', t);
    execute format('drop policy if exists "Open access insert" on public.%I;', t);
    execute format('create policy "Open access insert" on public.%I for insert to anon, authenticated with check (true);', t);
    execute format('drop policy if exists "Open access update" on public.%I;', t);
    execute format('create policy "Open access update" on public.%I for update to anon, authenticated using (true) with check (true);', t);
    execute format('drop policy if exists "Open access delete" on public.%I;', t);
    execute format('create policy "Open access delete" on public.%I for delete to anon, authenticated using (true);', t);
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;

drop policy if exists "Open access storage select" on storage.objects;
create policy "Open access storage select"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id in (
      'slide-images', 'activity-images', 'pdf-documents',
      'partner-logos', 'team-photos', 'vacancy-files', 'gallery-photos'
    )
  );

drop policy if exists "Open access storage insert" on storage.objects;
create policy "Open access storage insert"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id in (
      'slide-images', 'activity-images', 'pdf-documents',
      'partner-logos', 'team-photos', 'vacancy-files', 'gallery-photos'
    )
  );

drop policy if exists "Open access storage update" on storage.objects;
create policy "Open access storage update"
  on storage.objects for update
  to anon, authenticated
  using (
    bucket_id in (
      'slide-images', 'activity-images', 'pdf-documents',
      'partner-logos', 'team-photos', 'vacancy-files', 'gallery-photos'
    )
  )
  with check (
    bucket_id in (
      'slide-images', 'activity-images', 'pdf-documents',
      'partner-logos', 'team-photos', 'vacancy-files', 'gallery-photos'
    )
  );

drop policy if exists "Open access storage delete" on storage.objects;
create policy "Open access storage delete"
  on storage.objects for delete
  to anon, authenticated
  using (
    bucket_id in (
      'slide-images', 'activity-images', 'pdf-documents',
      'partner-logos', 'team-photos', 'vacancy-files', 'gallery-photos'
    )
  );
