-- Add owner_signature_url to reports table
-- Stores the URL of the digital signature uploaded to Supabase Storage
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS owner_signature_url TEXT;
