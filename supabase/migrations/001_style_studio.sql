-- Run once in the Supabase SQL editor. All balance mutations are server-only.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  credits integer not null default 1 check (credits >= 0),
  created_at timestamptz not null default now()
);
create table public.reports (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  occasion text not null,
  status text not null default 'pending' check (status in ('pending','complete','failed')),
  result jsonb,
  created_at timestamptz not null default now()
);
create index reports_user_date on public.reports(user_id, created_at desc);
create table public.orders (
  id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  pack text not null,
  amount integer not null check(amount > 0),
  credits integer not null check(credits > 0),
  currency text not null default 'INR',
  payment_id text unique,
  status text not null default 'created' check(status in ('created','paid')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
alter table public.reports enable row level security;
alter table public.orders enable row level security;
create policy profiles_read on public.profiles for select to authenticated using(auth.uid() = id);
create policy reports_read on public.reports for select to authenticated using(auth.uid() = user_id);
create policy orders_read on public.orders for select to authenticated using(auth.uid() = user_id);
revoke all on public.profiles, public.reports, public.orders from anon, authenticated;
grant select on public.profiles, public.reports, public.orders to authenticated;
grant all on public.profiles, public.reports, public.orders to service_role;

create function public.reserve_report(p_user uuid, p_id uuid, p_occasion text) returns text
language plpgsql security definer set search_path = public as $$
declare r public.reports; balance integer;
begin
  insert into profiles(id) values(p_user) on conflict do nothing;
  select credits into balance from profiles where id = p_user for update;
  -- Recover credits from interrupted requests; a late completion cannot overwrite a failed reservation.
  with expired as (update reports set status='failed' where user_id=p_user and status='pending' and created_at < now()-interval '5 minutes' returning id)
  update profiles set credits=credits+(select count(*) from expired) where id=p_user;
  select * into r from reports where id=p_id;
  if found then
    if r.user_id <> p_user then raise exception 'Invalid request'; end if;
    return r.status;
  end if;
  if exists(select 1 from reports where user_id=p_user and status='pending') then return 'busy'; end if;
  if (select count(*) from reports where user_id=p_user and created_at > now()-interval '1 hour') >= 20 then return 'limited'; end if;
  update profiles set credits=credits-1 where id=p_user and credits>0;
  if not found then return 'empty'; end if;
  insert into reports(id,user_id,occasion) values(p_id,p_user,p_occasion);
  return 'reserved';
end $$;
create function public.finish_report(p_user uuid, p_id uuid, p_result jsonb) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  perform 1 from profiles where id=p_user for update;
  update reports set status=case when p_result is null then 'failed' else 'complete' end, result=p_result where id=p_id and user_id=p_user and status='pending';
  if not found then return false; end if;
  if p_result is null then update profiles set credits=credits+1 where id=p_user; end if;
  return true;
end $$;
create function public.fulfill_order(p_order text, p_payment text, p_amount integer, p_currency text) returns boolean
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from orders where id=p_order for update;
  if not found then raise exception 'Unknown order'; end if;
  if o.amount <> p_amount or o.currency <> p_currency then raise exception 'Payment mismatch'; end if;
  if o.status='paid' then
    if o.payment_id <> p_payment then raise exception 'Payment mismatch'; end if;
    return false;
  end if;
  update profiles set credits=credits+o.credits where id=o.user_id;
  update orders set status='paid', payment_id=p_payment where id=o.id;
  return true;
end $$;
revoke all on function public.reserve_report(uuid,uuid,text), public.finish_report(uuid,uuid,jsonb), public.fulfill_order(text,text,integer,text) from public, anon, authenticated;
grant execute on function public.reserve_report(uuid,uuid,text), public.finish_report(uuid,uuid,jsonb), public.fulfill_order(text,text,integer,text) to service_role;
