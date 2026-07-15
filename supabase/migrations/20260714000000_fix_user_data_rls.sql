-- MacroTrack stores each user's data in JSONB rows. The row identity must
-- include user_id; otherwise default ingredient ids and date-based log ids
-- collide between accounts.

begin;

do $$
declare
  target_table text;
  primary_key_name text;
begin
  foreach target_table in array array['ingredients', 'meals', 'food_log']
  loop
    select tc.constraint_name
      into primary_key_name
      from information_schema.table_constraints as tc
     where tc.table_schema = 'public'
       and tc.table_name = target_table
       and tc.constraint_type = 'PRIMARY KEY';

    if primary_key_name is not null then
      execute format('alter table public.%I drop constraint %I', target_table, primary_key_name);
    end if;

    execute format(
      'alter table public.%I add constraint %I primary key (user_id, id)',
      target_table,
      target_table || '_pkey'
    );
  end loop;
end
$$;

alter table public.ingredients enable row level security;
alter table public.meals enable row level security;
alter table public.food_log enable row level security;
alter table public.targets enable row level security;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename = any(array['ingredients', 'meals', 'food_log', 'targets'])
  loop
    execute format(
      'drop policy if exists %I on public.%I',
      existing_policy.policyname,
      existing_policy.tablename
    );
  end loop;
end
$$;

create policy "users_manage_own_ingredients"
  on public.ingredients
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_manage_own_meals"
  on public.meals
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_manage_own_food_log"
  on public.food_log
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "users_manage_own_targets"
  on public.targets
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.ingredients to authenticated;
grant select, insert, update, delete on public.meals to authenticated;
grant select, insert, update, delete on public.food_log to authenticated;
grant select, insert, update, delete on public.targets to authenticated;

commit;
