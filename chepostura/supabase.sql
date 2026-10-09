-- Area riservata dello studio: tabelle, regole di sicurezza e archivio delle foto.
-- Da incollare una volta sola in Supabase: SQL Editor > New query > Run.
-- Si puo' rieseguire: non cancella dati gia' presenti.

create extension if not exists pgcrypto with schema extensions;

-- Chi entra: amministratori (Davide, Morena) o pazienti collegati a una scheda
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'patient')),
  full_name text,
  patient_id uuid,
  created_at timestamptz not null default now()
);

-- Schede dei pazienti
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  birth date,
  phone text,
  email text,
  consent_date date not null,
  notes text,
  user_id uuid unique references auth.users (id) on delete set null,
  access_code_hash text,
  code_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Visite: foto, analisi, problemi, esercizi, piano dei controlli
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  date date not null default current_date,
  height numeric,
  findings jsonb not null default '[]',
  auto jsonb not null default '[]',
  exercises jsonb not null default '[]',
  plan jsonb not null default '{}',
  extras jsonb not null default '[]',
  notes text,
  photos jsonb not null default '{}',
  pdf_path text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists visits_patient_date on public.visits (patient_id, date desc);

-- Chi e' amministratore (usata dalle regole qui sotto)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- La scheda del paziente collegato all'utente che sta usando il sito
create or replace function public.my_patient_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.patients where user_id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.visits enable row level security;

drop policy if exists "profilo: lettura" on public.profiles;
create policy "profilo: lettura" on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "pazienti: amministratori" on public.patients;
create policy "pazienti: amministratori" on public.patients for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "pazienti: la propria scheda" on public.patients;
create policy "pazienti: la propria scheda" on public.patients for select
  using (user_id = auth.uid());

drop policy if exists "visite: amministratori" on public.visits;
create policy "visite: amministratori" on public.visits for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "visite: le proprie" on public.visits;
create policy "visite: le proprie" on public.visits for select
  using (patient_id = public.my_patient_id());

-- Diario delle sedute: trattamenti (Davide) e allenamenti (Morena)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  date date not null default current_date,
  kind text not null check (kind in ('trattamento', 'allenamento', 'altro')),
  text text,
  exercises jsonb not null default '[]',
  visible_to_patient boolean not null default false,
  author_id uuid references auth.users (id) on delete set null,
  author_name text,
  created_at timestamptz not null default now()
);
create index if not exists sessions_patient_date on public.sessions (patient_id, date desc);
alter table public.sessions enable row level security;
drop policy if exists "sedute: amministratori" on public.sessions;
create policy "sedute: amministratori" on public.sessions for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "sedute: quelle condivise" on public.sessions;
create policy "sedute: quelle condivise" on public.sessions for select
  using (visible_to_patient and patient_id = public.my_patient_id());

-- Il codice di accesso (cifrato) non si legge da nessuna pagina: si puo' solo scrivere
revoke select on public.patients from anon, authenticated;
grant select (id, full_name, birth, phone, email, consent_date, notes, user_id, code_created_at, created_at, updated_at)
  on public.patients to authenticated;

-- Primo accesso del paziente: collega il suo account alla scheda con il codice dato dallo studio
create or replace function public.claim_patient(code text) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare
  h text := encode(extensions.digest(upper(trim(code)), 'sha256'), 'hex');
  p public.patients;
begin
  if auth.uid() is null then raise exception 'Accesso richiesto'; end if;
  select * into p from public.patients
    where access_code_hash = h and code_created_at > now() - interval '60 days';
  if p.id is null then raise exception 'Codice non valido o scaduto'; end if;
  update public.patients set user_id = null where user_id = auth.uid() and id <> p.id;
  update public.patients set user_id = auth.uid(), access_code_hash = null, updated_at = now() where id = p.id;
  insert into public.profiles (id, role, full_name, patient_id)
    values (auth.uid(), 'patient', p.full_name, p.id)
    on conflict (id) do update set patient_id = excluded.patient_id, full_name = excluded.full_name
    where public.profiles.role = 'patient';
  return p.full_name;
end $$;
grant execute on function public.claim_patient(text) to authenticated;

-- Archivio privato delle foto e dei referti: cartella = id del paziente
insert into storage.buckets (id, name, public) values ('pazienti', 'pazienti', false)
  on conflict (id) do nothing;

drop policy if exists "archivio: amministratori" on storage.objects;
create policy "archivio: amministratori" on storage.objects for all
  using (bucket_id = 'pazienti' and public.is_admin())
  with check (bucket_id = 'pazienti' and public.is_admin());
drop policy if exists "archivio: i propri file" on storage.objects;
create policy "archivio: i propri file" on storage.objects for select
  using (bucket_id = 'pazienti' and (storage.foldername(name))[1] = public.my_patient_id()::text);

-- AMMINISTRATORI. Dopo esservi registrati dal sito con la vostra email,
-- togliete i due trattini davanti alle righe qui sotto, mettete le vostre email e rieseguite:
-- insert into public.profiles (id, role, full_name)
--   select id, 'admin', 'Davide Scuderi' from auth.users where email = 'EMAIL-DI-DAVIDE'
--   on conflict (id) do update set role = 'admin';
-- insert into public.profiles (id, role, full_name)
--   select id, 'admin', 'Morena Anastasi' from auth.users where email = 'EMAIL-DI-MORENA'
--   on conflict (id) do update set role = 'admin';
