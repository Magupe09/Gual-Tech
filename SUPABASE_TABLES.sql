-- ============================================
-- JAVI CONTROL - SQL PARA SUPABASE
-- ============================================

-- ============================================
-- TABLA: machines (Máquinas)
-- ============================================
CREATE TABLE public.machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  serial_number TEXT NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  year INTEGER,
  location TEXT,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'mantenimiento')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: reports (Informes)
-- ============================================
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  machine_id UUID REFERENCES public.machines(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('preventivo', 'correctivo', 'predictivo')),
  technician TEXT NOT NULL,
  parts_changed JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  cost DECIMAL(10,2) DEFAULT 0,
  photos TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE ACCESO
-- ============================================

-- Máquinas: cualquier usuario autenticado puede hacer todo
CREATE POLICY "Allow all for authenticated" ON public.machines
  FOR ALL USING (auth.role() = 'authenticated');

-- Informes: cualquier usuario autenticado puede hacer todo
CREATE POLICY "Allow all for authenticated reports" ON public.reports
  FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- BUCKETS DE STORAGE
-- ============================================
-- Crear en Supabase > Storage > New bucket:
-- 
-- Bucket 1: machine-photos (Public)
-- Bucket 2: machine-pdfs (Public)
--
-- Luego ejecutar:
-- 

INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('machine-photos', 'machine-photos', true, NOW(), NOW()),
       ('machine-pdfs', 'machine-pdfs', true, NOW(), NOW());

-- Políticas para fotos
CREATE POLICY "Public access photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'machine-photos');

CREATE POLICY "Auth upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'machine-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Auth update photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'machine-photos' AND auth.role() = 'authenticated');

-- Políticas para PDFs
CREATE POLICY "Public access pdfs" ON storage.objects
  FOR SELECT USING (bucket_id = 'machine-pdfs');

CREATE POLICY "Auth upload pdfs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'machine-pdfs' AND auth.role() = 'authenticated');

CREATE POLICY "Auth update pdfs" ON storage.objects
  FOR UPDATE USING (bucket_id = 'machine-pdfs' AND auth.role() = 'authenticated');
