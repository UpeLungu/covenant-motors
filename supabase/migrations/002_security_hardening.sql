-- Covenant Motors — security hardening
-- Apply after 001_covenant_motors_core.sql.

-- Ensure reporting views respect the caller's Row Level Security policies.
create or replace view public.vehicle_financial_summary
with (security_invoker = true)
as
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

create or replace view public.account_balances
with (security_invoker = true)
as
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

-- Do not expose helper execution to anonymous users.
revoke all on function public.next_business_reference(text,text,integer) from public;
grant execute on function public.next_business_reference(text,text,integer) to authenticated;

-- Business settings may be changed by administrators/managers only.
create policy "admins update business settings" on public.businesses
for update to authenticated
using (
  id = public.current_business_id()
  and exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.business_id = public.current_business_id()
      and p.role in ('admin','manager')
      and p.is_active = true
  )
)
with check (id = public.current_business_id());
