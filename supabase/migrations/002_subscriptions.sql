alter table public.profiles add column period_end timestamptz;
create table public.subscriptions (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider_id text unique,
  status text not null default 'creating',
  cancel_at_end boolean not null default false,
  current_end timestamptz,
  created_at timestamptz not null default now()
);
create unique index one_open_subscription on public.subscriptions(user_id)
  where status not in ('cancelled','completed','expired','failed');
create table public.subscription_payments (
  payment_id text primary key,
  subscription_id uuid not null references public.subscriptions(id),
  amount integer not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  unique(subscription_id, period_start)
);
alter table public.subscriptions enable row level security;
alter table public.subscription_payments enable row level security;
create policy subscriptions_read on public.subscriptions for select to authenticated using(auth.uid()=user_id);
revoke all on public.subscriptions, public.subscription_payments from anon, authenticated;
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions, public.subscription_payments to service_role;
create function public.credit_subscription(p_subscription text,p_payment text,p_amount integer,p_start timestamptz,p_end timestamptz) returns boolean
language plpgsql security definer set search_path=public as $$
declare s subscriptions; inserted integer;
begin
  if p_amount <> 9900 or p_end <= p_start then raise exception 'Invalid payment'; end if;
  select * into s from subscriptions where provider_id=p_subscription for update;
  if not found then raise exception 'Unknown subscription'; end if;
  insert into subscription_payments(payment_id,subscription_id,amount,period_start,period_end) values(p_payment,s.id,p_amount,p_start,p_end) on conflict do nothing;
  get diagnostics inserted=row_count;
  if inserted=0 then return false; end if;
  -- Delayed events must never roll the entitlement backwards.
  update profiles set credits=10,period_end=p_end where id=s.user_id and (period_end is null or period_end<p_end);
  return true;
end $$;
revoke all on function public.credit_subscription(text,text,integer,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.credit_subscription(text,text,integer,timestamptz,timestamptz) to service_role;
create or replace function public.reserve_report(p_user uuid,p_id uuid,p_occasion text) returns text
language plpgsql security definer set search_path=public as $$
declare r reports;
begin
  insert into profiles(id) values(p_user) on conflict do nothing;
  perform 1 from profiles where id=p_user for update;
  with expired as (update reports set status='failed' where user_id=p_user and status='pending' and created_at<now()-interval '5 minutes' returning id)
  update profiles set credits=credits+(select count(*) from expired) where id=p_user;
  update profiles set credits=0 where id=p_user and period_end<=now();
  select * into r from reports where id=p_id;
  if found then
    if r.user_id<>p_user then raise exception 'Invalid request'; end if;
    return r.status;
  end if;
  if exists(select 1 from reports where user_id=p_user and status='pending') then return 'busy'; end if;
  if (select count(*) from reports where user_id=p_user and created_at>now()-interval '1 hour')>=20 then return 'limited'; end if;
  update profiles set credits=credits-1 where id=p_user and credits>0;
  if not found then return 'empty'; end if;
  insert into reports(id,user_id,occasion) values(p_id,p_user,p_occasion);
  return 'reserved';
end $$;
