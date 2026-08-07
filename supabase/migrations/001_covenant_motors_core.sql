-- Covenant Motors — Supabase/PostgreSQL core schema
-- Version 1 database foundation for migrating the current localStorage application.
-- Run in a new Supabase project before wiring the frontend.

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Business and access control
-- -----------------------------------------------------------------------------

create table if not exists public.businesses (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  legal_name text,
  tpin text,
  phone text,
  email text,
  address text,
  base_currency text not null default 'ZMW' check (base_currency = 'ZMW'),
  logo_path text,
  receipt_footer text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.businesses (id,name,legal_name,base_currency)
values ('covenant-motors','Covenant Motors','Covenant Motors','ZMW')
on conflict (id) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete restrict,
  full_name text,
  role text not null default 'staff' check (role in ('admin','manager','sales','finance','operations','staff','viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.current_business_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.business_id
  from public.profiles p
  where p.id = auth.uid() and p.is_active = true
  limit 1;
$$;

revoke all on function public.current_business_id() from public;
grant execute on function public.current_business_id() to authenticated;

-- Human-readable business references such as CM-2026-0001 and SAL-2026-0001.
create table if not exists public.id_counters (
  business_id text not null references public.businesses(id) on delete cascade,
  entity text not null,
  counter_year integer not null,
  last_number integer not null default 0 check (last_number >= 0),
  primary key (business_id,entity,counter_year)
);

create or replace function public.next_business_reference(
  p_business_id text,
  p_entity text,
  p_year integer default extract(year from current_date)::integer
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_number integer;
begin
  v_prefix := case p_entity
    when 'vehicle' then 'CM'
    when 'customer' then 'CUS'
    when 'sale' then 'SAL'
    when 'driver' then 'DRV'
    when 'trip' then 'TRP'
    when 'quotation' then 'QUO'
    else raise_exception('Unsupported reference entity: %s', p_entity)
  end;

  insert into public.id_counters (business_id,entity,counter_year,last_number)
  values (p_business_id,p_entity,p_year,1)
  on conflict (business_id,entity,counter_year)
  do update set last_number = public.id_counters.last_number + 1
  returning last_number into v_number;

  if p_entity in ('vehicle','sale','trip','quotation') then
    return v_prefix || '-' || p_year::text || '-' || lpad(v_number::text,4,'0');
  end if;

  return v_prefix || '-' || lpad(v_number::text,4,'0');
end;
$$;

-- -----------------------------------------------------------------------------
-- Master data
-- -----------------------------------------------------------------------------

create table if not exists public.suppliers (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  tpin text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,name)
);

create table if not exists public.customers (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  customer_id text not null,
  name text not null,
  phone text not null,
  nrc_or_tpin text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,customer_id)
);

create table if not exists public.drivers (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  driver_id text not null,
  name text not null,
  phone text not null,
  licence text not null,
  licence_expiry date not null,
  status text not null default 'Available' check (status in ('Available','On Trip','Inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,driver_id),
  unique (business_id,licence)
);

-- -----------------------------------------------------------------------------
-- Vehicle inventory and Deal Jacket
-- -----------------------------------------------------------------------------

create table if not exists public.vehicles (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  stock_id text not null,
  vin text not null,
  engine_number text not null,
  registration_number text,
  make text not null,
  model text not null,
  manufacture_year integer not null check (manufacture_year between 1950 and 2100),
  colour text,
  supplier_id text references public.suppliers(id) on delete set null,
  supplier_name text not null,
  cost_price numeric(14,2) not null default 0 check (cost_price >= 0),
  total_cost numeric(14,2) not null default 0 check (total_cost >= 0),
  estimated_selling_price numeric(14,2) not null default 0 check (estimated_selling_price >= 0),
  current_location text not null,
  status text not null default 'Available' check (status in ('Awaiting Collection','In Transit','Available','Reserved','Sold','Under Repair')),
  purchase_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,stock_id),
  unique (business_id,vin)
);

create table if not exists public.vehicle_status_history (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  from_status text,
  to_status text not null check (to_status in ('Awaiting Collection','In Transit','Available','Reserved','Sold','Under Repair')),
  reason text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create table if not exists public.vehicle_expenses (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  vehicle_id text not null references public.vehicles(id) on delete restrict,
  category text not null,
  description text not null,
  amount numeric(14,2) not null check (amount >= 0),
  expense_date date not null,
  reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_documents (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  vehicle_id text not null references public.vehicles(id) on delete cascade,
  document_type text not null,
  name text not null,
  reference text,
  document_date date,
  storage_bucket text not null default 'covenant-documents',
  storage_path text,
  file_name text,
  file_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicle_cost_analysis (
  vehicle_id text primary key references public.vehicles(id) on delete cascade,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  allocated_overheads numeric(14,2) not null default 0 check (allocated_overheads >= 0),
  sales_commission numeric(14,2) not null default 0 check (sales_commission >= 0),
  finance_charges numeric(14,2) not null default 0 check (finance_charges >= 0),
  tax_cost numeric(14,2) not null default 0 check (tax_cost >= 0),
  other_indirect_costs numeric(14,2) not null default 0 check (other_indirect_costs >= 0),
  notes text,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Quotations and Sales
-- -----------------------------------------------------------------------------

create table if not exists public.quotations (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  quotation_id text not null,
  vehicle_id text not null references public.vehicles(id) on delete restrict,
  customer_id text not null references public.customers(id) on delete restrict,
  quotation_date date not null,
  valid_until date not null,
  quoted_price numeric(14,2) not null check (quoted_price >= 0),
  status text not null default 'Draft' check (status in ('Draft','Sent','Accepted','Expired','Converted')),
  payment_terms text,
  notes text,
  converted_sale_id text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,quotation_id)
);

create table if not exists public.sales (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  sale_id text not null,
  vehicle_id text not null references public.vehicles(id) on delete restrict,
  customer_id text not null references public.customers(id) on delete restrict,
  quotation_id text references public.quotations(id) on delete set null,
  sale_date date not null,
  selling_price numeric(14,2) not null check (selling_price >= 0),
  amount_paid numeric(14,2) not null default 0 check (amount_paid >= 0),
  outstanding_balance numeric(14,2) not null default 0 check (outstanding_balance >= 0),
  vehicle_cost numeric(14,2) not null default 0 check (vehicle_cost >= 0),
  gross_profit numeric(14,2) not null default 0,
  payment_method text,
  payment_status text not null default 'Partially Paid' check (payment_status in ('Partially Paid','Fully Paid')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,sale_id),
  unique (business_id,vehicle_id),
  check (amount_paid <= selling_price),
  check (outstanding_balance <= selling_price)
);

alter table public.quotations
  drop constraint if exists quotations_converted_sale_id_fkey;
alter table public.quotations
  add constraint quotations_converted_sale_id_fkey
  foreign key (converted_sale_id) references public.sales(id) on delete set null;

-- -----------------------------------------------------------------------------
-- Collection operations
-- -----------------------------------------------------------------------------

create table if not exists public.collection_trips (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  trip_id text not null,
  vehicle_id text not null references public.vehicles(id) on delete restrict,
  driver_id text not null references public.drivers(id) on delete restrict,
  collection_point text not null,
  destination text not null,
  departure_date date not null,
  expected_arrival date,
  advance numeric(14,2) not null default 0 check (advance >= 0),
  status text not null default 'Assigned' check (status in ('Assigned','In Transit','Arrived','Reconciled')),
  reconciled_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,trip_id)
);

create table if not exists public.trip_expenses (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  trip_id text not null references public.collection_trips(id) on delete cascade,
  category text not null,
  amount numeric(14,2) not null check (amount >= 0),
  expense_date date not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Finance
-- -----------------------------------------------------------------------------

create table if not exists public.finance_accounts (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  name text not null,
  account_type text not null check (account_type in ('Bank','Cash','Mobile Money')),
  opening_balance numeric(14,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,name)
);

insert into public.finance_accounts (id,business_id,name,account_type,opening_balance)
values
  ('acc-bank-main','covenant-motors','Main Bank Account','Bank',0),
  ('acc-cash','covenant-motors','Cash on Hand','Cash',0),
  ('acc-mobile','covenant-motors','Mobile Money','Mobile Money',0)
on conflict (id) do nothing;

create table if not exists public.finance_entries (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  entry_date date not null,
  entry_type text not null check (entry_type in ('Customer Payment','Supplier Payment','General Expense','Capital','Other Income')),
  reference text,
  description text not null,
  account_id text not null references public.finance_accounts(id) on delete restrict,
  money_in numeric(14,2) not null default 0 check (money_in >= 0),
  money_out numeric(14,2) not null default 0 check (money_out >= 0),
  related_sale_id text references public.sales(id) on delete restrict,
  related_vehicle_id text references public.vehicles(id) on delete restrict,
  reversal_of_entry_id text unique references public.finance_entries(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (not (money_in > 0 and money_out > 0)),
  check (money_in > 0 or money_out > 0)
);

-- -----------------------------------------------------------------------------
-- Tax / compliance
-- -----------------------------------------------------------------------------

create table if not exists public.tax_settings (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  tax_type text not null check (tax_type in ('VAT','TOT','Income Tax','PAYE','NAPSA','NHIMA','Withholding Tax','Customs & Import Duty')),
  rate numeric(9,4) not null default 0 check (rate >= 0),
  enabled boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,tax_type)
);

insert into public.tax_settings (business_id,tax_type,rate,enabled,notes)
values
 ('covenant-motors','VAT',0,true,'Set the current approved VAT rate.'),
 ('covenant-motors','TOT',0,true,'Set the applicable turnover tax rate.'),
 ('covenant-motors','Income Tax',0,true,'Set the applicable income tax rate.'),
 ('covenant-motors','PAYE',0,false,'Configure when payroll is introduced.'),
 ('covenant-motors','NAPSA',0,false,'Configure contribution rate and ceiling.'),
 ('covenant-motors','NHIMA',0,false,'Configure contribution rules.'),
 ('covenant-motors','Withholding Tax',0,false,'Configure by payment category.'),
 ('covenant-motors','Customs & Import Duty',0,true,'Vehicle-specific customs values are recorded as vehicle expenses.')
on conflict (business_id,tax_type) do nothing;

create table if not exists public.tax_returns (
  id text primary key default gen_random_uuid()::text,
  business_id text not null default 'covenant-motors' references public.businesses(id) on delete cascade,
  tax_type text not null check (tax_type in ('VAT','TOT','Income Tax','PAYE','NAPSA','NHIMA','Withholding Tax','Customs & Import Duty')),
  period text not null,
  taxable_amount numeric(14,2) not null default 0 check (taxable_amount >= 0),
  tax_due numeric(14,2) not null default 0 check (tax_due >= 0),
  status text not null default 'Draft' check (status in ('Draft','Ready','Submitted','Paid')),
  due_date date not null,
  reference text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id,tax_type,period)
);

-- -----------------------------------------------------------------------------
-- Audit trail
-- -----------------------------------------------------------------------------

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  business_id text references public.businesses(id) on delete cascade,
  table_name text not null,
  record_id text,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id text;
  v_record_id text;
begin
  if tg_op = 'DELETE' then
    v_business_id := to_jsonb(old)->>'business_id';
    v_record_id := to_jsonb(old)->>'id';
    insert into public.audit_logs(business_id,table_name,record_id,action,old_data,new_data,changed_by)
    values(v_business_id,tg_table_name,v_record_id,tg_op,to_jsonb(old),null,auth.uid());
    return old;
  else
    v_business_id := to_jsonb(new)->>'business_id';
    v_record_id := to_jsonb(new)->>'id';
    insert into public.audit_logs(business_id,table_name,record_id,action,old_data,new_data,changed_by)
    values(v_business_id,tg_table_name,v_record_id,tg_op,case when tg_op='UPDATE' then to_jsonb(old) else null end,to_jsonb(new),auth.uid());
    return new;
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Useful views
-- -----------------------------------------------------------------------------

create or replace view public.vehicle_financial_summary as
select
  v.id as vehicle_id,
  v.business_id,
  v.stock_id,
  v.make,
  v.model,
  v.manufacture_year,
  v.cost_price,
  coalesce(sum(ve.amount),0)::numeric(14,2) as vehicle_expenses,
  (
    coalesce(vca.allocated_overheads,0)+
    coalesce(vca.sales_commission,0)+
    coalesce(vca.finance_charges,0)+
    coalesce(vca.tax_cost,0)+
    coalesce(vca.other_indirect_costs,0)
  )::numeric(14,2) as indirect_costs,
  (
    v.cost_price + coalesce(sum(ve.amount),0) +
    coalesce(vca.allocated_overheads,0)+
    coalesce(vca.sales_commission,0)+
    coalesce(vca.finance_charges,0)+
    coalesce(vca.tax_cost,0)+
    coalesce(vca.other_indirect_costs,0)
  )::numeric(14,2) as calculated_total_cost
from public.vehicles v
left join public.vehicle_expenses ve on ve.vehicle_id=v.id
left join public.vehicle_cost_analysis vca on vca.vehicle_id=v.id
group by v.id,v.business_id,v.stock_id,v.make,v.model,v.manufacture_year,v.cost_price,
         vca.allocated_overheads,vca.sales_commission,vca.finance_charges,vca.tax_cost,vca.other_indirect_costs;

create or replace view public.account_balances as
select
  a.id as account_id,
  a.business_id,
  a.name,
  a.account_type,
  a.opening_balance,
  (a.opening_balance + coalesce(sum(fe.money_in-fe.money_out),0))::numeric(14,2) as current_balance
from public.finance_accounts a
left join public.finance_entries fe on fe.account_id=a.id
group by a.id,a.business_id,a.name,a.account_type,a.opening_balance;

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index if not exists idx_profiles_business on public.profiles(business_id);
create index if not exists idx_customers_business_name on public.customers(business_id,name);
create index if not exists idx_vehicles_business_status on public.vehicles(business_id,status);
create index if not exists idx_vehicles_registration on public.vehicles(business_id,registration_number);
create index if not exists idx_vehicle_expenses_vehicle_date on public.vehicle_expenses(vehicle_id,expense_date desc);
create index if not exists idx_vehicle_documents_vehicle on public.vehicle_documents(vehicle_id);
create index if not exists idx_status_history_vehicle on public.vehicle_status_history(vehicle_id,changed_at desc);
create index if not exists idx_sales_business_date on public.sales(business_id,sale_date desc);
create index if not exists idx_sales_customer on public.sales(customer_id);
create index if not exists idx_quotations_business_status on public.quotations(business_id,status);
create index if not exists idx_trips_vehicle on public.collection_trips(vehicle_id,status);
create index if not exists idx_trips_driver on public.collection_trips(driver_id,status);
create index if not exists idx_trip_expenses_trip on public.trip_expenses(trip_id,expense_date desc);
create index if not exists idx_finance_entries_account_date on public.finance_entries(account_id,entry_date desc,created_at desc);
create index if not exists idx_finance_entries_sale on public.finance_entries(related_sale_id);
create index if not exists idx_finance_entries_vehicle on public.finance_entries(related_vehicle_id);
create index if not exists idx_tax_returns_business_period on public.tax_returns(business_id,period);
create index if not exists idx_audit_business_time on public.audit_logs(business_id,changed_at desc);

-- -----------------------------------------------------------------------------
-- Updated-at triggers
-- -----------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'businesses','profiles','suppliers','customers','drivers','vehicles','vehicle_expenses',
    'vehicle_documents','vehicle_cost_analysis','quotations','sales','collection_trips','trip_expenses',
    'finance_accounts','tax_settings','tax_returns'
  ] loop
    execute format('drop trigger if exists trg_%I_updated_at on public.%I',t,t);
    execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',t,t);
  end loop;
end $$;

-- Core audit triggers. Finance entries are append-only/reversal based and are audited too.
do $$
declare t text;
begin
  foreach t in array array['customers','drivers','vehicles','vehicle_expenses','vehicle_documents','quotations','sales','collection_trips','finance_entries'] loop
    execute format('drop trigger if exists trg_%I_audit on public.%I',t,t);
    execute format('create trigger trg_%I_audit after insert or update or delete on public.%I for each row execute function public.audit_row_change()',t,t);
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.customers enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_status_history enable row level security;
alter table public.vehicle_expenses enable row level security;
alter table public.vehicle_documents enable row level security;
alter table public.vehicle_cost_analysis enable row level security;
alter table public.quotations enable row level security;
alter table public.sales enable row level security;
alter table public.collection_trips enable row level security;
alter table public.trip_expenses enable row level security;
alter table public.finance_accounts enable row level security;
alter table public.finance_entries enable row level security;
alter table public.tax_settings enable row level security;
alter table public.tax_returns enable row level security;
alter table public.audit_logs enable row level security;

-- Business users can access rows belonging to their assigned business.
create policy "business members read business" on public.businesses
for select to authenticated using (id = public.current_business_id());

create policy "business members read profiles" on public.profiles
for select to authenticated using (business_id = public.current_business_id());
create policy "users update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and business_id = public.current_business_id());

-- Apply common business-member CRUD policies to operational tables.
do $$
declare t text;
begin
  foreach t in array array[
    'suppliers','customers','drivers','vehicles','vehicle_status_history','vehicle_expenses','vehicle_documents',
    'vehicle_cost_analysis','quotations','sales','collection_trips','trip_expenses','finance_accounts','finance_entries',
    'tax_settings','tax_returns'
  ] loop
    execute format('create policy "business members select %1$s" on public.%1$I for select to authenticated using (business_id = public.current_business_id())',t);
    execute format('create policy "business members insert %1$s" on public.%1$I for insert to authenticated with check (business_id = public.current_business_id())',t);
    execute format('create policy "business members update %1$s" on public.%1$I for update to authenticated using (business_id = public.current_business_id()) with check (business_id = public.current_business_id())',t);
    execute format('create policy "business members delete %1$s" on public.%1$I for delete to authenticated using (business_id = public.current_business_id())',t);
  end loop;
end $$;

create policy "business members read audit" on public.audit_logs
for select to authenticated using (business_id = public.current_business_id());

-- -----------------------------------------------------------------------------
-- Supabase Storage — private Deal Jacket documents
-- Files should be stored under: <business_id>/vehicles/<vehicle_id>/<filename>
-- -----------------------------------------------------------------------------

insert into storage.buckets (id,name,public)
values ('covenant-documents','covenant-documents',false)
on conflict (id) do nothing;

create policy "business members read covenant documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'covenant-documents'
  and (storage.foldername(name))[1] = public.current_business_id()
);

create policy "business members upload covenant documents"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'covenant-documents'
  and (storage.foldername(name))[1] = public.current_business_id()
);

create policy "business members update covenant documents"
on storage.objects for update to authenticated
using (
  bucket_id = 'covenant-documents'
  and (storage.foldername(name))[1] = public.current_business_id()
)
with check (
  bucket_id = 'covenant-documents'
  and (storage.foldername(name))[1] = public.current_business_id()
);

create policy "business members delete covenant documents"
on storage.objects for delete to authenticated
using (
  bucket_id = 'covenant-documents'
  and (storage.foldername(name))[1] = public.current_business_id()
);
