create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

-- First account that signs up becomes the admin
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user');
  end if;
  return new;
end; $$;
create trigger on_auth_user_created_role after insert on auth.users
for each row execute function public.handle_new_user_role();

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  phone text check (char_length(phone) <= 40),
  service text not null check (char_length(service) <= 100),
  appointment_date date not null,
  appointment_time text not null check (char_length(appointment_time) <= 10),
  notes text check (char_length(notes) <= 1000),
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);
grant insert on public.appointments to anon, authenticated;
grant select, update, delete on public.appointments to authenticated;
grant all on public.appointments to service_role;
alter table public.appointments enable row level security;
create policy "Anyone can book" on public.appointments for insert to anon, authenticated with check (status = 'pending');
create policy "Admins read appointments" on public.appointments for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update appointments" on public.appointments for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete appointments" on public.appointments for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Taken slots exposed without personal data
create or replace function public.get_booked_slots(_date date)
returns table (appointment_time text) language sql stable security definer set search_path = public
as $$ select appointment_time from public.appointments where appointment_date = _date and status <> 'cancelled' $$;
grant execute on function public.get_booked_slots(date) to anon, authenticated;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'Journal',
  read_minutes int not null default 4,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "Public reads published posts" on public.posts for select to anon, authenticated using (published = true or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert posts" on public.posts for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update posts" on public.posts for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete posts" on public.posts for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.posts (slug, title, excerpt, content, category, read_minutes) values
('quiet-power-of-slow-pressure', 'The quiet power of slow pressure', 'Why holding a single point for ninety seconds can do what twenty minutes of quick rubbing cannot.', E'Fast, vigorous strokes feel productive, but tissue rarely responds to speed. Fascia is viscoelastic: it yields to sustained load, not to force.\n\nWhen we hold a point for sixty to ninety seconds, the nervous system has time to recognise that the pressure is safe. Protective guarding softens, and the tissue begins to glide again.\n\nIn your next session, notice the moment a held point seems to melt. That is not the muscle giving up — it is your body choosing to let go.', 'Technique', 5),
('why-stiffness-returns-by-3pm', 'Why stiffness returns by 3pm', 'Desk posture quietly shortens the hip flexors. A two-minute reset breaks the loop.', E'Sitting for hours places the hip flexors in a shortened position. By mid-afternoon they pull on the lower spine and the familiar ache arrives.\n\nTry this: stand, step one foot back into a gentle lunge, tuck the pelvis, and breathe slowly for five breaths per side. Repeat every ninety minutes.\n\nManual therapy can release the deeper layers, but small daily resets keep the gains.', 'Mobility', 4),
('what-fascia-actually-wants', 'What fascia actually wants from you', 'Hydration, variety of movement, and patience — the three things connective tissue thrives on.', E'Fascia is the continuous web that wraps every muscle and organ. It stays healthy when it is hydrated and moved in many directions.\n\nRepetitive movement patterns create dense, sticky zones. Varied movement — reaching, twisting, crawling — keeps the web supple.\n\nBetween sessions, drink water, change positions often, and treat your body to movements it rarely makes.', 'Recovery', 6);