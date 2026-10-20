-- Event Map schema. Run once in Supabase: SQL Editor > New query > paste > Run.

-- Profiles: one row per auth user, holds the role ------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);
-- No insert/update/delete policies: users can never change their own role.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Facilities ---------------------------------------------------------------------
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  icon text not null default 'book'
    check (icon in ('floor','projector','basketball','book','dumbbell','curtain')),
  lat double precision not null,
  lng double precision not null,
  photos text[] not null default '{}',
  rental_cost text not null default '',
  rental_requirements text[] not null default '{}',
  policies jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Activities (deleted automatically with their facility) -------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities(id) on delete cascade,
  name text not null,
  description text not null default '',
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists activities_facility_idx on public.activities(facility_id);

-- Row level security: anyone reads, only admins write ----------------------------
alter table public.facilities enable row level security;
alter table public.activities enable row level security;

create policy "public read facilities" on public.facilities for select using (true);
create policy "admin insert facilities" on public.facilities for insert with check (public.is_admin());
create policy "admin update facilities" on public.facilities for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete facilities" on public.facilities for delete using (public.is_admin());

create policy "public read activities" on public.activities for select using (true);
create policy "admin insert activities" on public.activities for insert with check (public.is_admin());
create policy "admin update activities" on public.activities for update using (public.is_admin()) with check (public.is_admin());
create policy "admin delete activities" on public.activities for delete using (public.is_admin());

-- Photo storage: public bucket, admin-only writes --------------------------------
insert into storage.buckets (id, name, public)
values ('facility-photos', 'facility-photos', true)
on conflict (id) do nothing;

create policy "admin upload photos" on storage.objects
  for insert with check (bucket_id = 'facility-photos' and public.is_admin());
create policy "admin update photos" on storage.objects
  for update using (bucket_id = 'facility-photos' and public.is_admin());
create policy "admin delete photos" on storage.objects
  for delete using (bucket_id = 'facility-photos' and public.is_admin());
