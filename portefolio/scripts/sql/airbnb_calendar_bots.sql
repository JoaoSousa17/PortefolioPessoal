-- Run this once in the Supabase SQL editor to create the table used by the
-- Airbnb Calendar Sync bot (admin dashboard -> Bots -> Airbnb Calendar Sync).

CREATE TABLE IF NOT EXISTS public.airbnb_calendar_bots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  listing_url text NOT NULL,
  room_id text NOT NULL,
  public_token text NOT NULL,
  event_title text NOT NULL DEFAULT 'Casa Ocupada',
  is_active boolean NOT NULL DEFAULT true,
  cached_ics text,
  blocked_dates jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_run_at timestamp with time zone,
  last_status text CHECK (last_status = ANY (ARRAY['success'::text, 'error'::text, 'never'::text])) DEFAULT 'never',
  last_error text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT airbnb_calendar_bots_pkey PRIMARY KEY (id),
  CONSTRAINT airbnb_calendar_bots_public_token_key UNIQUE (public_token)
);
