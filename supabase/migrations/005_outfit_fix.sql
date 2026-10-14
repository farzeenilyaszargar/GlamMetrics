-- One payment buys one finished Outfit Fix, not credits or recurring billing.
create table public.outfit_purchases (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider_order_id text unique,
  payment_id text unique,
  amount integer not null default 9900 check(amount=9900),
  currency text not null default 'INR' check(currency='INR'),
  status text not null default 'creating' check(status in ('creating','created','paid','refunded','failed')),
  occasion text,
  result jsonb,
  hidden boolean not null default false,
  attempts integer not null default 0,
  processing_at timestamptz,
  created_at timestamptz not null default now()
);
create index outfit_purchases_owner on public.outfit_purchases(user_id,created_at desc);
alter table public.outfit_purchases enable row level security;
create policy outfit_purchases_read on public.outfit_purchases for select to authenticated using(auth.uid()=user_id);
revoke all on public.outfit_purchases from anon,authenticated;
grant select on public.outfit_purchases to authenticated;
grant all on public.outfit_purchases to service_role;

create function public.pay_outfit_fix(p_order text,p_payment text,p_amount integer,p_currency text,p_refunded boolean default false) returns boolean
language plpgsql security definer set search_path=public as $$
declare o outfit_purchases;
begin
  select * into o from outfit_purchases where provider_order_id=p_order for update;
  if not found then raise exception 'Unknown order'; end if;
  if p_amount is distinct from o.amount or p_currency is distinct from o.currency or p_payment is null or p_payment='' then raise exception 'Payment mismatch'; end if;
  if o.payment_id is not null and o.payment_id<>p_payment then raise exception 'Payment mismatch'; end if;
  -- A delayed capture event must never revive a refund.
  if o.status='refunded' then return false; end if;
  update outfit_purchases set payment_id=p_payment,status=case when p_refunded then 'refunded' else 'paid' end where id=o.id;
  return o.status<>'paid' or p_refunded;
end $$;

create function public.reserve_outfit_fix(p_user uuid,p_id uuid,p_occasion text) returns integer
language plpgsql security definer set search_path=public as $$
declare o outfit_purchases;
begin
  select * into o from outfit_purchases where id=p_id and user_id=p_user for update;
  if not found then raise exception 'Unknown purchase'; end if;
  if o.status<>'paid' then return -1; end if;
  if o.result is not null then return 0; end if;
  if o.processing_at>now()-interval '2 minutes' then return -2; end if;
  if o.attempts>=5 then return -3; end if;
  update outfit_purchases set attempts=attempts+1,processing_at=now(),occasion=p_occasion where id=p_id;
  return o.attempts+1;
end $$;

create function public.finish_outfit_fix(p_user uuid,p_id uuid,p_attempt integer,p_result jsonb) returns boolean
language plpgsql security definer set search_path=public as $$
begin
  update outfit_purchases set result=p_result,processing_at=null
  where id=p_id and user_id=p_user and status='paid' and attempts=p_attempt and processing_at is not null and result is null;
  return found;
end $$;

-- Preserve the existing two-session proof requirement when attaching purchases.
create or replace function public.claim_guest_reports(p_guest uuid,p_owner uuid) returns integer
language plpgsql security definer set search_path=public as $$
declare source profiles; moved integer;
begin
  if p_guest=p_owner then return 0; end if;
  perform 1 from profiles where id in (p_guest,p_owner) order by id for update;
  select * into source from profiles where id=p_guest;
  if not found then return 0; end if;
  if source.period_end is not null or exists(select 1 from subscriptions where user_id=p_guest) then raise exception 'Guest billing cannot be transferred'; end if;
  perform 1 from outfit_purchases where user_id=p_guest order by id for update;
  if exists(select 1 from reports where user_id=p_guest and status='pending') or exists(select 1 from outfit_purchases where user_id=p_guest and processing_at>now()-interval '2 minutes') then raise exception 'A guest plan is still processing'; end if;
  insert into profiles(id,credits) values(p_owner,least(source.credits,1)) on conflict do nothing;
  update reports set user_id=p_owner where user_id=p_guest;
  get diagnostics moved=row_count;
  update outfit_purchases set user_id=p_owner where user_id=p_guest;
  update profiles set credits=least(credits,source.credits) where id=p_owner and period_end is null;
  update profiles set credits=0 where id=p_guest;
  return moved;
end $$;
revoke all on function public.pay_outfit_fix(text,text,integer,text,boolean),public.reserve_outfit_fix(uuid,uuid,text),public.finish_outfit_fix(uuid,uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.pay_outfit_fix(text,text,integer,text,boolean),public.reserve_outfit_fix(uuid,uuid,text),public.finish_outfit_fix(uuid,uuid,integer,jsonb) to service_role;
