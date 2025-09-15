-- Habilitar extensión para UUIDs (Supabase ya la tiene, pero por si acaso)
create extension if not exists "pgcrypto";

-- ---------- ROLES & PERMISSIONS ----------
create table roles (
  id smallserial primary key,
  name text not null unique,
  description text
);

insert into roles (name, description) values
('superadmin','Super administrator with all permissions'),
('admin','Administrator'),
('abogado','Lawyer'),
('usuario','End user');

create table permissions (
  id serial primary key,
  name text not null unique,
  description text
);

create table role_permissions (
  id serial primary key,
  role_id smallint not null references roles(id) on delete cascade,
  permission_id int not null references permissions(id) on delete cascade,
  unique (role_id, permission_id)
);

-- ---------- USERS & PROFILES ----------
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  -- password handled by Supabase Auth; keep here only if custom auth
  role_id smallint not null references roles(id),
  status text not null default 'active', -- active / banned / pending_verification / inactive
  email_verified boolean default false,
  phone_verified boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz
);

create index idx_users_email on users(lower(email));

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  first_name text,
  last_name text,
  document_type text, -- CC, CE, NIT...
  document_number text,
  phone text,
  address text,
  avatar_url text,
  metadata jsonb,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- ---------- LOGIN ATTEMPTS ----------
create table login_attempts (
  id bigserial primary key,
  user_id uuid references users(id),
  ip_address text,
  status text not null, -- success / failed
  created_at timestamptz not null default now()
);

-- ---------- LAWYERS ----------
create table lawyers (
  id uuid primary key default gen_random_uuid(), -- same as users.id
  user_id uuid not null unique references users(id) on delete cascade,
  professional_card_number text,
  university text,
  specialty text,
  experience_years int,
  rut text,
  digital_signature_url text,
  status text not null default 'pending' -- verified / pending / suspended
);

create table lawyer_documents (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references lawyers(id) on delete cascade,
  file_url text not null,
  doc_type text, -- tarjeta profesional, cedula, diploma...
  status text not null default 'pending', -- pending / approved / rejected
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table lawyer_reviews (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references lawyers(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------- LICENSES & USER_LICENSES ----------
create table licenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null, -- trial / standard / premium
  hours_total numeric(10,2) not null, -- allows fractional hours if needed
  validity_days int not null, -- plazo definido en días (si aplica)
  applies_to text not null default 'both', -- ia / lawyer / both
  price_cents bigint default 0, -- COP en centavos
  currency text default 'COP',
  active boolean default true,
  created_at timestamptz not null default now()
);

create table user_licenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  license_id uuid not null references licenses(id),
  hours_remaining numeric(12,2) not null,
  status text not null default 'active', -- active / expired / trial
  started_at timestamptz not null default now(),
  expires_at timestamptz, -- optional
  source text, -- trial / wompi / manual
  created_at timestamptz not null default now()
);

create index idx_userlicenses_user on user_licenses(user_id);

-- ---------- PURCHASES & INVOICES & DISCOUNTS ----------
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  license_id uuid references licenses(id),
  amount_cents bigint not null,
  currency text default 'COP',
  payment_method text, -- tarjeta, PSE, nequi...
  wompi_transaction_id text,
  status text not null default 'pending', -- pending / completed / failed
  created_at timestamptz not null default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id),
  razon_social text,
  nit text,
  direccion text,
  invoice_pdf_url text,
  created_at timestamptz not null default now()
);

create table discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null, -- percentage / fixed
  value numeric(12,4) not null,
  valid_from timestamptz,
  valid_until timestamptz,
  active boolean default true,
  created_at timestamptz not null default now()
);

-- ---------- CHAT SESSIONS & MESSAGES ----------
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  lawyer_id uuid references lawyers(id),
  license_instance_id uuid references user_licenses(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text not null default 'active', -- active / closed
  summary text,
  metadata jsonb
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  chat_session_id uuid not null references chat_sessions(id) on delete cascade,
  sender_id uuid, -- user or lawyer's user id
  sender_role text not null, -- user / abogado / admin / ia
  content text not null,
  status text not null default 'sent', -- sent / delivered / seen
  created_at timestamptz not null default now()
);

create table message_moderation (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  status text not null default 'pending', -- pending / approved / blocked
  reason text,
  reviewed_by uuid references users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- AUDIT, CONSENTS, LEGAL HOLDS ----------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  terms_version text,
  privacy_version text,
  accepted_at timestamptz not null default now()
);

create table legal_holds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  reason text,
  active boolean default true,
  created_at timestamptz not null default now()
);

-- ---------- METRICS (aggregate caches opcional) ----------
create table user_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  hours_used_total numeric(12,2) default 0,
  sessions_count int default 0,
  last_session_at timestamptz
);

create table lawyer_metrics (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null references lawyers(id),
  cases_attended int default 0,
  avg_rating numeric(4,2) default 0,
  hours_in_chat numeric(12,2) default 0
);

create table sales_metrics (
  id uuid primary key default gen_random_uuid(),
  month int not null,
  year int not null,
  total_sales_cents bigint default 0,
  trial_conversions int default 0,
  created_at timestamptz not null default now(),
  unique (month, year)
);

-- ---------- INDEXES & CONSTRAINTS ----------
create index idx_messages_chat on messages(chat_session_id);
create index idx_purchases_user on purchases(user_id);
create index idx_lawyer_reviews_lawyer on lawyer_reviews(lawyer_id);

-- ---------- RLS EXAMPLES (policy skeletons) ----------
-- ----------------------------------------------------------------

-- ---- MESSAGES ----
alter table messages enable row level security;

drop policy if exists messages_select_participants on messages;
drop policy if exists messages_insert_participants on messages;
drop policy if exists messages_update_sender_or_admin on messages;
drop policy if exists messages_delete_admins on messages;

create policy messages_select_participants on messages
  for select using (
    (
      exists (
        select 1 from chat_sessions cs
        where cs.id = chat_session_id
          and cs.user_id = auth.uid()::uuid
      )
    )
    or
    (
      exists (
        select 1 from lawyers l
        join chat_sessions cs on cs.lawyer_id = l.id
        where l.user_id = auth.uid()::uuid
          and cs.id = chat_session_id
      )
    )
    or
    (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

create policy messages_insert_participants on messages
  for insert with check (
    (
      exists (
        select 1 from chat_sessions cs
        where cs.id = chat_session_id
          and cs.user_id = auth.uid()::uuid
      )
    )
    or
    (
      exists (
        select 1 from lawyers l
        join chat_sessions cs on cs.lawyer_id = l.id
        where l.user_id = auth.uid()::uuid
          and cs.id = chat_session_id
      )
    )
    or
    (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

create policy messages_update_sender_or_admin on messages
  for update using (
    sender_id = auth.uid()::uuid
    or current_setting('jwt.claims.role', true) in ('admin','superadmin')
  ) with check (
    sender_id = auth.uid()::uuid
    or current_setting('jwt.claims.role', true) in ('admin','superadmin')
  );

create policy messages_delete_admins on messages
  for delete using (
    current_setting('jwt.claims.role', true) in ('admin','superadmin')
  );

-- ---- CHAT_SESSIONS ----
alter table chat_sessions enable row level security;

drop policy if exists chat_sessions_select_participants on chat_sessions;
drop policy if exists chat_sessions_insert_own on chat_sessions;
drop policy if exists chat_sessions_update_participants on chat_sessions;

create policy chat_sessions_select_participants on chat_sessions
  for select using (
    user_id = auth.uid()::uuid
    or exists (
      select 1 from lawyers l
      where l.id = lawyer_id
        and l.user_id = auth.uid()::uuid
    )
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

create policy chat_sessions_insert_own on chat_sessions
  for insert with check (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

create policy chat_sessions_update_participants on chat_sessions
  for update using (
    user_id = auth.uid()::uuid
    or exists (
      select 1 from lawyers l
      where l.id = lawyer_id
        and l.user_id = auth.uid()::uuid
    )
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  ) with check (
    user_id = auth.uid()::uuid
    or exists (
      select 1 from lawyers l
      where l.id = lawyer_id
        and l.user_id = auth.uid()::uuid
    )
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

-- ---- USER_LICENSES ----
alter table user_licenses enable row level security;

drop policy if exists user_licenses_select_own on user_licenses;
drop policy if exists user_licenses_update_own on user_licenses;
drop policy if exists user_licenses_insert_own on user_licenses;

create policy user_licenses_select_own on user_licenses
  for select using (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

create policy user_licenses_update_own on user_licenses
  for update using (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  ) with check (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

-- Allow users to create their own trial/purchases -> server can also create (admins)
create policy user_licenses_insert_own on user_licenses
  for insert with check (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

-- ---- LAWYERS ----
alter table lawyers enable row level security;

drop policy if exists lawyer_self_or_admin on lawyers;

create policy lawyer_self_or_admin on lawyers
  for all using (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

-- ---- PROFILES ----
alter table profiles enable row level security;

drop policy if exists profiles_self_or_admin on profiles;

create policy profiles_self_or_admin on profiles
  for all using (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

-- ---- PURCHASES ----
alter table purchases enable row level security;

drop policy if exists purchases_select_owner_or_admin on purchases;
drop policy if exists purchases_insert_user_or_admin on purchases;

create policy purchases_select_owner_or_admin on purchases
  for select using (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

create policy purchases_insert_user_or_admin on purchases
  for insert with check (
    user_id = auth.uid()::uuid
    or (current_setting('jwt.claims.role', true) in ('admin','superadmin'))
  );

-- ----------------------------------------------------------------
-- End of corrected RLS policies
-- ----------------------------------------------------------------
-- End of SQL schema
-- ----------------------------------------------------------------