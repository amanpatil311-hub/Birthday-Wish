-- ==============================================================================
-- DATABASE SCHEMA: PREMIUM CINEMATIC BIRTHDAY STORYTELLING APPLICATION
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('recipient', 'owner')) DEFAULT 'recipient',
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Helper function: check if a user is an owner
CREATE OR REPLACE FUNCTION public.is_owner(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = check_user_id AND role = 'owner'
  );
$$;

-- ------------------------------------------------------------------------------
-- 2. CHAPTERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  order_index INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  quote TEXT,
  personal_note TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  unlocks_chat BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapters_order ON public.chapters(order_index);

-- ------------------------------------------------------------------------------
-- 3. STORY PROGRESS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_chapter_id TEXT NOT NULL REFERENCES public.chapters(id),
  completed_chapters TEXT[] NOT NULL DEFAULT '{}',
  unlocked_chat BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_story_progress_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_story_progress_user ON public.story_progress(user_id);

-- ------------------------------------------------------------------------------
-- 4. STORY INTERACTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.story_interactions (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'multiple_choice',
    'free_text',
    'yes_no',
    'poll',
    'scratch_card',
    'memory_match',
    'photo_reveal',
    'guestbook_wish'
  )),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB,
  config JSONB,
  order_index INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_chapter ON public.story_interactions(chapter_id, order_index);

-- ------------------------------------------------------------------------------
-- 5. INTERACTION RESPONSES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interaction_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_id TEXT NOT NULL REFERENCES public.story_interactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_interaction ON public.interaction_responses(interaction_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON public.interaction_responses(user_id);

-- ------------------------------------------------------------------------------
-- 6. GAMES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.games (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL CHECK (game_type IN ('memory_match', 'photo_reveal', 'scratch_card', 'hidden_object')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. GAME RESULTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_results_user ON public.game_results(user_id);

-- ------------------------------------------------------------------------------
-- 8. CONVERSATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_conversations_recipient UNIQUE (recipient_id)
);

-- ------------------------------------------------------------------------------
-- 9. MESSAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('recipient', 'owner')),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at ASC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles can be read by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- CHAPTERS POLICIES
CREATE POLICY "Anyone authenticated can view enabled chapters"
  ON public.chapters FOR SELECT
  TO authenticated
  USING (is_enabled = true OR public.is_owner(auth.uid()));

CREATE POLICY "Only owners can manage chapters"
  ON public.chapters FOR ALL
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- STORY PROGRESS POLICIES
CREATE POLICY "Users can read own story progress"
  ON public.story_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_owner(auth.uid()));

CREATE POLICY "Users can update own story progress"
  ON public.story_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own story progress"
  ON public.story_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- STORY INTERACTIONS POLICIES
CREATE POLICY "Authenticated users can view interactions"
  ON public.story_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Owners can manage interactions"
  ON public.story_interactions FOR ALL
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- INTERACTION RESPONSES POLICIES
-- Recipient can submit an answer
CREATE POLICY "Recipients can submit interaction responses"
  ON public.interaction_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only owners can view submitted responses (Recipient cannot view answers)
CREATE POLICY "Owners can view all interaction responses"
  ON public.interaction_responses FOR SELECT
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- GAMES POLICIES
CREATE POLICY "Authenticated users can view games"
  ON public.games FOR SELECT
  TO authenticated
  USING (true);

-- GAME RESULTS POLICIES
CREATE POLICY "Users can submit their game results"
  ON public.game_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can view all game results"
  ON public.game_results FOR SELECT
  TO authenticated
  USING (public.is_owner(auth.uid()));

-- CONVERSATIONS POLICIES
CREATE POLICY "Recipient can view own conversation"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_id OR public.is_owner(auth.uid()));

CREATE POLICY "Recipient can create own conversation"
  ON public.conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = recipient_id OR public.is_owner(auth.uid()));

-- MESSAGES POLICIES
CREATE POLICY "Participants can read their conversation messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    public.is_owner(auth.uid()) OR
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND recipient_id = auth.uid()
    )
  );

CREATE POLICY "Participants can insert messages in their conversation"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND (
      public.is_owner(auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id = conversation_id AND recipient_id = auth.uid()
      )
    )
  );

CREATE POLICY "Participants can update message read status"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    public.is_owner(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND recipient_id = auth.uid()
    )
  );

-- ==============================================================================
-- REALTIME CONFIGURATION
-- ==============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.interaction_responses;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_results;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.story_progress;
  END IF;
END $$;

-- ==============================================================================
-- SEED DATA: INITIAL 7 CHAPTERS
-- ==============================================================================

INSERT INTO public.chapters (id, order_index, title, subtitle, description, cover_image, quote, personal_note, is_enabled, unlocks_chat)
VALUES
  (
    'ch-01',
    1,
    'The Beginning',
    'Where everything started',
    'Before all the inside jokes, the late-night talks, and the moments that defined us, there was just a quiet beginning that changed everything.',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80',
    '"Some people arrive and make such a beautiful impact on your life, you can barely remember what the world was like without them."',
    'Looking back now, I had no idea on that day how important you would become to my life. You turned ordinary days into stories I will treasure forever.',
    true,
    false
  ),
  (
    'ch-02',
    2,
    'How We Met',
    'A destiny written in the stars',
    'The first conversation, the first smile, and that unexplainable feeling that meeting you was not just a coincidence.',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80',
    '"Meeting you was like listening to a song for the first time and knowing it would be my favorite."',
    'I still remember the exact vibe of that moment. Your presence brought an effortless warmth that I never wanted to let go of.',
    true,
    false
  ),
  (
    'ch-03',
    3,
    'Little Moments',
    'The memories that matter most',
    'Not just the grand celebrations, but the quiet laughter, the shared songs, the silly arguments, and the comfort of just being together.',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    '"It is the smallest moments that take up the most room in our hearts."',
    'Every time we laughed till our stomachs hurt, every quiet glance across the room—those are the memories carved deepest into my heart.',
    true,
    false
  ),
  (
    'ch-04',
    4,
    'Things I Never Said',
    'The truths between the lines',
    'Sometimes the deepest feelings are the hardest to put into everyday words. Here is what I always carried in my heart.',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    '"You showed me what it feels like to truly be understood without having to explain myself."',
    'You inspire me in ways you do not even realize. Your strength, your kindness, and the way you care make me want to be better every single day.',
    true,
    true
  ),
  (
    'ch-05',
    5,
    'Things Left Unsaid',
    'Promises for the future',
    'No matter how much time passes, where life leads us, or what challenges arrive, some promises remain unbroken.',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    '"I have loved you for a thousand years, and I will love you for a thousand more."',
    'I promise to always celebrate your victories, hold your hand through the hard days, and remind you how extraordinary you are.',
    true,
    false
  ),
  (
    'ch-06',
    6,
    'The Birthday Surprise',
    'Celebrating the gift of you',
    'Today is your day. The universe was made infinitely brighter the day you entered it.',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80',
    '"Count your life by smiles, not tears. Count your age by friends, not years."',
    'Happy Birthday, Pratiksha! May your candles burn bright and every secret wish you make come true.',
    true,
    false
  ),
  (
    'ch-07',
    7,
    'One Last Note',
    'A sealed letter to carry with you',
    'As this digital story reaches its final page, remember that our real story is still being written, day by day, moment by moment.',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    '"Wherever you go, go with all your heart."',
    'Thank you for being you, Pratiksha. Forever your biggest cheerleader, your friend, and someone who loves you beyond words.',
    true,
    false
  )
ON CONFLICT (id) DO NOTHING;
