-- Fix machine constraints:
-- 1. Remove UNIQUE from reference (can be repeated)
-- 2. Add UNIQUE to serial_number (must be unique)
-- Context: reference can repeat, serial_number is the real unique identifier

-- Drop the unique constraint on reference (si existe)
ALTER TABLE public.machines DROP CONSTRAINT IF EXISTS machines_reference_key;

-- Add unique constraint on serial_number
ALTER TABLE public.machines ADD CONSTRAINT machines_serial_number_key UNIQUE (serial_number);
