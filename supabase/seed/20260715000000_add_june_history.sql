-- Adds four deterministic June history days to the account that signed in most
-- recently. Safe to run again: the same four dates are replaced, not duplicated.

begin;

do $$
declare
  target_user_id uuid;
begin
  select id
    into target_user_id
    from auth.users
   order by last_sign_in_at desc nulls last
   limit 1;

  if target_user_id is null then
    raise exception 'No user account found';
  end if;

  insert into public.food_log (user_id, id, data)
  values
    (
      target_user_id,
      '2026-06-04',
      jsonb_build_array(
        jsonb_build_object('id', 'june-normal-a-breakfast', 'name', 'June Breakfast', 'cal', 500, 'protein', 35, 'carbs', 45, 'fat', 15),
        jsonb_build_object('id', 'june-normal-a-lunch', 'name', 'June Chicken Lunch', 'cal', 750, 'protein', 55, 'carbs', 50, 'fat', 15),
        jsonb_build_object('id', 'june-normal-a-dinner', 'name', 'June Rice Dinner', 'cal', 800, 'protein', 55, 'carbs', 55, 'fat', 15)
      )
    ),
    (
      target_user_id,
      '2026-06-11',
      jsonb_build_array(
        jsonb_build_object('id', 'june-normal-b-breakfast', 'name', 'June Yogurt Breakfast', 'cal', 450, 'protein', 30, 'carbs', 35, 'fat', 12),
        jsonb_build_object('id', 'june-normal-b-lunch', 'name', 'June Protein Lunch', 'cal', 650, 'protein', 45, 'carbs', 50, 'fat', 14),
        jsonb_build_object('id', 'june-normal-b-dinner', 'name', 'June Balanced Dinner', 'cal', 800, 'protein', 55, 'carbs', 55, 'fat', 16)
      )
    ),
    (
      target_user_id,
      '2026-06-18',
      jsonb_build_array(
        jsonb_build_object('id', 'june-calorie-over-breakfast', 'name', 'June Large Breakfast', 'cal', 650, 'protein', 40, 'carbs', 45, 'fat', 14),
        jsonb_build_object('id', 'june-calorie-over-lunch', 'name', 'June Large Lunch', 'cal', 850, 'protein', 55, 'carbs', 50, 'fat', 16),
        jsonb_build_object('id', 'june-calorie-over-dinner', 'name', 'June Large Dinner', 'cal', 950, 'protein', 50, 'carbs', 55, 'fat', 18)
      )
    ),
    (
      target_user_id,
      '2026-06-25',
      jsonb_build_array(
        jsonb_build_object('id', 'june-carb-over-breakfast', 'name', 'June Oat Breakfast', 'cal', 550, 'protein', 30, 'carbs', 70, 'fat', 12),
        jsonb_build_object('id', 'june-carb-over-lunch', 'name', 'June Rice Lunch', 'cal', 750, 'protein', 50, 'carbs', 65, 'fat', 15),
        jsonb_build_object('id', 'june-carb-over-dinner', 'name', 'June Pasta Dinner', 'cal', 900, 'protein', 60, 'carbs', 55, 'fat', 18)
      )
    )
  on conflict (user_id, id)
  do update set data = excluded.data;
end
$$;

commit;

-- Expected totals with the current 2300 / 150 / 155 / 50 targets:
-- 2026-06-04: 2050 kcal, P145, C150, F45 (within targets)
-- 2026-06-11: 1900 kcal, P130, C140, F42 (within targets)
-- 2026-06-18: 2450 kcal, P145, C150, F48 (calories only over target)
-- 2026-06-25: 2200 kcal, P140, C190, F45 (carbs only over target)

select
  food_log.id as day,
  sum((entry ->> 'cal')::numeric) as calories,
  sum((entry ->> 'protein')::numeric) as protein,
  sum((entry ->> 'carbs')::numeric) as carbs,
  sum((entry ->> 'fat')::numeric) as fat
from public.food_log
cross join lateral jsonb_array_elements(food_log.data) as entry
where food_log.id in ('2026-06-04', '2026-06-11', '2026-06-18', '2026-06-25')
group by food_log.id
order by food_log.id;
