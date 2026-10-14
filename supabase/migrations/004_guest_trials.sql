-- Server-only guest reservations with a global daily AI-attempt budget.
create table public.guest_trial_attempts (
  report_id uuid primary key,
  created_at timestamptz not null default now()
);
create index guest_trial_attempts_date on public.guest_trial_attempts(created_at);
alter table public.guest_trial_attempts enable row level security;
revoke all on public.guest_trial_attempts from anon,authenticated;
grant all on public.guest_trial_attempts to service_role;

create function public.reserve_guest_report(p_user uuid,p_id uuid,p_occasion text,p_limit integer default 40) returns text
language plpgsql security definer set search_path=public as $$
declare state text; day_start timestamptz;
begin
  if p_limit is null or p_limit<1 or p_limit>1000 then raise exception 'Invalid daily limit'; end if;
  day_start := date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
  perform pg_advisory_xact_lock(74192004);
  -- Existing requests must retain idempotency even after the budget is spent.
  if exists(select 1 from reports where id=p_id) then
    return reserve_report(p_user,p_id,p_occasion);
  end if;
  if (select count(*) from guest_trial_attempts where created_at>=day_start)>=p_limit then return 'guest_limited'; end if;
  state := reserve_report(p_user,p_id,p_occasion);
  if state='reserved' then insert into guest_trial_attempts(report_id) values(p_id); end if;
  return state;
end $$;
revoke all on function public.reserve_guest_report(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.reserve_guest_report(uuid,uuid,text,integer) to service_role;

-- Called only after the server proves control of BOTH the guest and destination.
-- Never transfers billing, subscription payments, or extra free credits.
create function public.claim_guest_reports(p_guest uuid,p_owner uuid) returns integer
language plpgsql security definer set search_path=public as $$
declare source profiles; moved integer;
begin
  if p_guest=p_owner then return 0; end if;
  perform 1 from profiles where id in (p_guest,p_owner) order by id for update;
  select * into source from profiles where id=p_guest;
  if not found then return 0; end if;
  if source.period_end is not null or exists(select 1 from subscriptions where user_id=p_guest) then raise exception 'Guest billing cannot be transferred'; end if;
  if exists(select 1 from reports where user_id=p_guest and status='pending') then raise exception 'A guest plan is still processing'; end if;
  insert into profiles(id,credits) values(p_owner,least(source.credits,1)) on conflict do nothing;
  update reports set user_id=p_owner where user_id=p_guest;
  get diagnostics moved=row_count;
  update profiles set credits=least(credits,source.credits) where id=p_owner and period_end is null;
  update profiles set credits=0 where id=p_guest;
  return moved;
end $$;
revoke all on function public.claim_guest_reports(uuid,uuid) from public,anon,authenticated;
grant execute on function public.claim_guest_reports(uuid,uuid) to service_role;
