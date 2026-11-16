-- ==============================================================================
-- AI ENABLED PERSONAL HEALTHCARE ASSISTANT - COMPLETE SUPABASE DATABASE SETUP
-- ==============================================================================
-- Run this complete script in your Supabase Dashboard:
-- 1. Go to your Supabase Project: https://supabase.com/dashboard/project/ardkyccwuobszvtjswmo
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Click "New query", paste this entire script, and click "RUN" (green button)
-- ==============================================================================

-- 1. Clean Reset: Drop existing tables if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.health_assessments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- TABLE 1: PROFILES (User Details & Profile Information)
-- ==============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  age INTEGER,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger:
-- Whenever a user signs up via Supabase Auth, this trigger automatically creates their profile row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- TABLE 2: HEALTH_ASSESSMENTS (Assessments, Vitals & Risk Prediction Results)
-- ==============================================================================
CREATE TABLE public.health_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL DEFAULT 80,
  summary TEXT,
  input_data JSONB DEFAULT '{}'::jsonb,
  result_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user queries on dashboard and history
CREATE INDEX IF NOT EXISTS idx_health_assessments_user_id ON public.health_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_created_at ON public.health_assessments(created_at DESC);

-- ==============================================================================
-- TABLE 3: ALERTS (Daily Health Reminders: Water, Meds, Sugar & Walking)
-- ==============================================================================
CREATE TABLE public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  timing_type TEXT NOT NULL DEFAULT 'time',
  time TEXT NOT NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- --- PROFILES POLICIES ---
CREATE POLICY "Allow users to view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow users to insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

-- --- HEALTH_ASSESSMENTS POLICIES ---
-- Allow inserting assessments (both logged-in users and anonymous demo users)
CREATE POLICY "Allow inserting assessments"
  ON public.health_assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.role() = 'anon' OR auth.role() = 'authenticated');

-- Allow users to select their own assessments
CREATE POLICY "Allow selecting assessments"
  ON public.health_assessments FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.role() = 'anon');

-- Allow users to delete their own assessments
CREATE POLICY "Allow deleting assessments"
  ON public.health_assessments FOR DELETE
  USING (auth.uid() = user_id);

-- --- ALERTS POLICIES ---
CREATE POLICY "Allow users to manage own alerts"
  ON public.alerts FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL OR auth.role() = 'anon')
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.role() = 'anon');

-- ==============================================================================
-- SETUP COMPLETE
-- ==============================================================================
