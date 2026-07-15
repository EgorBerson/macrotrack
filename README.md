# MacroTrack

Mobile-first React application for tracking calories and macronutrients. Data is stored per user in Supabase; packaged-food barcodes are resolved through Open Food Facts.

## Local development

Requirements: Node.js 18 or newer and npm.

```bash
cp .env.example .env.local
npm install
npm start
```

Set the real Supabase project URL and publishable key in `.env.local`. This file is ignored by Git. Never put a Supabase secret/service-role key in the browser application.

The development server is available at `http://127.0.0.1:3000` (or the URL printed by Create React App).

## Checks

```bash
npm test -- --watchAll=false
npm run build
```

## Supabase setup

The client expects these public tables:

- `ingredients`: `user_id`, `id`, `data`, generated `barcode`
- `meals`: `user_id`, `id`, `data`
- `food_log`: `user_id`, `id`, `data`
- `targets`: `user_id`, `data`

Apply `supabase/migrations/20260714000000_fix_user_data_rls.sql` in the Supabase SQL editor before using writes. It changes the first three tables to composite `(user_id, id)` primary keys and replaces their RLS policies with owner-only policies. Review and back up production data before applying any database migration.

Then apply `supabase/migrations/20260714010000_add_ingredient_barcode.sql`. The application saves the barcode in the ingredient JSON data immediately; this migration also exposes it as an indexed generated `ingredients.barcode` column for direct SQL lookup.

## Camera troubleshooting

Barcode scanning requires a secure browser context (`https` or localhost) and camera permission in both the browser and operating system. On macOS, check **System Settings → Privacy & Security → Camera**. The scanner accepts EAN/UPC-style numeric codes and keeps scanning when Open Food Facts does not recognize a detected code.
