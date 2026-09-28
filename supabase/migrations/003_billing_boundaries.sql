alter table public.reports add column credit_period_end timestamptz;
alter table public.subscription_payments add column refunded boolean not null default false;
create or replace function public.reserve_report(p_user uuid,p_id uuid,p_occasion text) returns text
language plpgsql security definer set search_path=public as $$
declare r reports; current_period timestamptz;
begin
  insert into profiles(id) values(p_user) on conflict do nothing;
  select period_end into current_period from profiles where id=p_user for update;
  with expired as (update reports set status='failed' where user_id=p_user and status='pending' and created_at<now()-interval '5 minutes' returning credit_period_end)
  update profiles set credits=credits+(select count(*) from expired where credit_period_end is not distinct from current_period) where id=p_user;
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
  insert into reports(id,user_id,occasion,credit_period_end) values(p_id,p_user,p_occasion,current_period);
  return 'reserved';
end $$;
create or replace function public.finish_report(p_user uuid,p_id uuid,p_result jsonb) returns boolean
language plpgsql security definer set search_path=public as $$
declare reserved_period timestamptz;
begin
  perform 1 from profiles where id=p_user for update;
  update reports set status=case when p_result is null then 'failed' else 'complete' end,result=p_result where id=p_id and user_id=p_user and status='pending' returning credit_period_end into reserved_period;
  if not found then return false; end if;
  if p_result is null then
    update profiles set credits=credits+1 where id=p_user and period_end is not distinct from reserved_period and (period_end is null or period_end>now());
  end if;
  return true;
end $$;
create function public.revoke_refunded_payment(p_payment text) returns void
language plpgsql security definer set search_path=public as $$
declare p subscription_payments; owner_id uuid;
begin
 select * into p from subscription_payments where payment_id=p_payment for update;
 if not found or p.refunded then return; end if;
 select user_id into owner_id from subscriptions where id=p.subscription_id;
 update subscription_payments set refunded=true where payment_id=p_payment;
 update profiles set credits=0,period_end=least(period_end,now()) where id=owner_id and period_end=p.period_end;
end $$;
revoke all on function public.revoke_refunded_payment(text) from public,anon,authenticated;
grant execute on function public.revoke_refunded_payment(text) to service_role;
