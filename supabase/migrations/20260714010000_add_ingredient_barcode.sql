-- Ingredient data remains the source of truth. This generated column exposes
-- data.barcode for direct SQL queries without duplicating application writes.

begin;

alter table public.ingredients
  add column if not exists barcode text
  generated always as (nullif(data ->> 'barcode', '')) stored;

create index if not exists ingredients_user_barcode_idx
  on public.ingredients (user_id, barcode)
  where barcode is not null;

commit;
