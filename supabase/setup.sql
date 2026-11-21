-- ==============================================================================
-- SUPABASE SCHEMA FOR CINEMATIC BIRTHDAY STORY (PRATIKSHA ✨)
-- Run this script once in your Supabase project's SQL Editor
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INTERACTION RESPONSES (Answers to questions, secret wishes, notes)
CREATE TABLE IF NOT EXISTS public.interaction_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT 'pratiksha-user',
  response_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MESSAGES (Two-way live chat between Pratiksha & Owner)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL DEFAULT 'pratiksha-main-convo',
  sender_id TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('recipient', 'owner')),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. GAME RESULTS (Memory match, scratch card perks, scores)
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  user_id TEXT NOT NULL DEFAULT 'pratiksha-user',
  score INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. STORY PROGRESS (Unlocked chapters, chat status)
CREATE TABLE IF NOT EXISTS public.story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  current_chapter_id TEXT NOT NULL DEFAULT 'ch-01',
  completed_chapters TEXT[] NOT NULL DEFAULT '{}',
  unlocked_chat BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_story_progress_user UNIQUE (user_id)
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES (Allow anon/public access via anon key)
-- ------------------------------------------------------------------------------
ALTER TABLE public.interaction_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

-- interaction_responses
DROP POLICY IF EXISTS "Public access interaction_responses" ON public.interaction_responses;
CREATE POLICY "Public access interaction_responses" ON public.interaction_responses
  FOR ALL USING (true) WITH CHECK (true);

-- messages
DROP POLICY IF EXISTS "Public access messages" ON public.messages;
CREATE POLICY "Public access messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

-- game_results
DROP POLICY IF EXISTS "Public access game_results" ON public.game_results;
CREATE POLICY "Public access game_results" ON public.game_results
  FOR ALL USING (true) WITH CHECK (true);

-- story_progress
DROP POLICY IF EXISTS "Public access story_progress" ON public.story_progress;
CREATE POLICY "Public access story_progress" ON public.story_progress
  FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- REALTIME BROADCASTING
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.interaction_responses;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_results;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.story_progress;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;
