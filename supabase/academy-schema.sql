-- ============================================================
-- ATLAS ACADEMY — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS academy_courses (
  id TEXT PRIMARY KEY,                    -- e.g. 'level-1-foundations'
  title TEXT NOT NULL,
  description TEXT,
  level INT NOT NULL DEFAULT 1,           -- 1-9 matching the academy levels
  sort_order INT NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false, -- free courses visible to all
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. LESSONS TABLE  
CREATE TABLE IF NOT EXISTS academy_lessons (
  id TEXT PRIMARY KEY,                    -- e.g. 'what-is-trading'
  course_id TEXT NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  estimated_minutes INT DEFAULT 10,
  quiz_pass_threshold INT DEFAULT 66,     -- percentage needed to pass
  total_sections INT NOT NULL DEFAULT 5,  -- for progress tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. LESSON PROGRESS (per user per lesson)
CREATE TABLE IF NOT EXISTS academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  sections_completed INT NOT NULL DEFAULT 0,
  quiz_score INT,                         -- percentage 0-100
  quiz_passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,               -- null until fully complete
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- 4. CERTIFICATES
CREATE TABLE IF NOT EXISTS academy_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  certificate_code TEXT NOT NULL UNIQUE,  -- e.g. 'ATLAS-L1-A3F8K2'
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;

-- Courses & Lessons: anyone can read published ones
CREATE POLICY "Anyone can read published courses" ON academy_courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Anyone can read published lessons" ON academy_lessons
  FOR SELECT USING (is_published = true);

-- Progress: users can CRUD their own
CREATE POLICY "Users read own progress" ON academy_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress" ON academy_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress" ON academy_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Certificates: users can read their own
CREATE POLICY "Users read own certificates" ON academy_certificates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own certificates" ON academy_certificates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED DATA — Level 1 Course + Lesson 1
-- ============================================================

INSERT INTO academy_courses (id, title, description, level, sort_order, is_free, is_published)
VALUES (
  'level-1-foundations',
  'Level 1 — Foundations',
  'The absolute basics of trading. Start here if you''re brand new to the markets.',
  1, 1, true, true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO academy_lessons (id, course_id, title, subtitle, description, sort_order, is_free, is_published, estimated_minutes, quiz_pass_threshold, total_sections)
VALUES (
  'what-is-trading',
  'level-1-foundations',
  'What Is Trading?',
  'The oldest human skill, reinvented',
  'From ancient bazaars to digital markets — understand what trading really is, try your first simulated trade, and earn your Level 1 certificate.',
  1, true, true, 8, 66, 5
) ON CONFLICT (id) DO NOTHING;
