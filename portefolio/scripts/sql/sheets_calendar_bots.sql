-- Run this once in the Supabase SQL editor to create the table used by the
-- Google Sheets Calendar Sync bot (admin dashboard -> Bots -> Sheets Calendar Sync).

CREATE TABLE IF NOT EXISTS public.sheets_calendar_bots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  spreadsheet_id text NOT NULL,
  sheet_names jsonb NOT NULL DEFAULT '[]'::jsonb,
  year integer NOT NULL,
  public_token text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  cached_ics text,
  event_count integer NOT NULL DEFAULT 0,
  last_run_at timestamp with time zone,
  last_status text CHECK (last_status = ANY (ARRAY['success'::text, 'error'::text, 'never'::text])) DEFAULT 'never',
  last_error text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sheets_calendar_bots_pkey PRIMARY KEY (id),
  CONSTRAINT sheets_calendar_bots_public_token_key UNIQUE (public_token)
);
