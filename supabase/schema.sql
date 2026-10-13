-- ==============================================================================
-- MEN ARE BRAVE (MAB) - SUPABASE DATABASE SCHEMA
-- Project: sjayvueparmwaokxorbd
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar TEXT DEFAULT 'batman',
    streak_count INTEGER DEFAULT 3,
    has_checked_in_today BOOLEAN DEFAULT false,
    has_completed_resolve_today BOOLEAN DEFAULT false,
    last_checkin_date TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Knight',
    avatar TEXT DEFAULT 'batman',
    content TEXT NOT NULL,
    type TEXT DEFAULT 'post',
    category TEXT DEFAULT 'General',
    is_anonymous BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. POST_LIKES TABLE
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT post_likes_profile_post_unique UNIQUE (profile_id, post_id)
);

-- 4. SAVED_POSTS TABLE
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT saved_posts_profile_post_unique UNIQUE (profile_id, post_id)
);

-- 5. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Anonymous Member',
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. REPLIES TABLE
CREATE TABLE IF NOT EXISTS public.replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL DEFAULT 'Anonymous Member',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MOOD_HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.mood_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    mood TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT mood_history_profile_date_unique UNIQUE (profile_id, date)
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON public.replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_replies_author_id ON public.replies(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_saved_posts_post_id ON public.saved_posts(post_id);
CREATE INDEX IF NOT EXISTS idx_mood_history_profile_id ON public.mood_history(profile_id);

-- 9. TRIGGER FOR AUTH.USERS -> PUBLIC.PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar, streak_count, has_checked_in_today, has_completed_resolve_today)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'batman'),
    3,
    false,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- 10. ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_history ENABLE ROW LEVEL SECURITY;

-- 11. POLICIES
-- Profiles
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);

-- Posts
CREATE POLICY "Public read posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update posts" ON public.posts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE TO authenticated USING ((select auth.uid()) = author_id);

-- Post Likes
CREATE POLICY "Public read post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert post likes" ON public.post_likes FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = profile_id);
CREATE POLICY "Users can delete own post likes" ON public.post_likes FOR DELETE TO authenticated USING ((select auth.uid()) = profile_id);

-- Saved Posts
CREATE POLICY "Users can view own saved posts" ON public.saved_posts FOR SELECT TO authenticated USING ((select auth.uid()) = profile_id);
CREATE POLICY "Users can insert own saved posts" ON public.saved_posts FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = profile_id);
CREATE POLICY "Users can delete own saved posts" ON public.saved_posts FOR DELETE TO authenticated USING ((select auth.uid()) = profile_id);

-- Comments
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING ((select auth.uid()) = author_id);

-- Replies
CREATE POLICY "Public read replies" ON public.replies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert replies" ON public.replies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete own replies" ON public.replies FOR DELETE TO authenticated USING ((select auth.uid()) = author_id);

-- Mood History
CREATE POLICY "Users can view own mood history" ON public.mood_history FOR SELECT TO authenticated USING ((select auth.uid()) = profile_id);
CREATE POLICY "Users can insert own mood history" ON public.mood_history FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = profile_id);
CREATE POLICY "Users can update own mood history" ON public.mood_history FOR UPDATE TO authenticated USING ((select auth.uid()) = profile_id);

-- 12. INITIAL SEED DATA
INSERT INTO public.posts (id, author_id, author_name, avatar, content, type, category, is_anonymous, likes_count, comments_count, created_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001', NULL, 'Anonymous Bat', 'batman', 'Feels like I am carrying the weight of the entire world. Career pressure is crushing. How do you guys manage?', 'post', 'Career', true, 14, 2, now() - interval '2 hours'),
  ('c1000000-0000-0000-0000-000000000002', NULL, 'Bruce_93', 'knight', 'Tips on dealing with a breakup: block them, hit the gym, focus on your craft. You will rise from the ashes.', 'advice', 'Breakup', false, 42, 0, now() - interval '4 hours'),
  ('c1000000-0000-0000-0000-000000000003', NULL, 'SilentGideon', 'ninja', 'Fatherhood is hard. My son looks up to me, but sometimes I feel like I have no idea what I am doing.', 'post', 'Fatherhood', false, 89, 0, now() - interval '1 day'),
  ('c1000000-0000-0000-0000-000000000004', NULL, 'IronGrip_92', 'batman', 'Consistency beats intensity every single time. 5 AM run done. Remember why you started.', 'post', 'Fitness', false, 35, 0, now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.comments (id, post_id, author_id, author_name, content, is_anonymous, created_at)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', NULL, 'SolidGrit_45', 'Hold your head up high. This phase will pass.', false, now() - interval '1 hour'),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', NULL, 'SolidBrother', 'DM is open if you need an ear, brother.', false, now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- PHONE-BASED AUTH & SECURITY QUESTION RECOVERY
-- ==============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS hashed_password TEXT,
ADD COLUMN IF NOT EXISTS security_question TEXT,
ADD COLUMN IF NOT EXISTS security_answer TEXT,
ADD COLUMN IF NOT EXISTS age_range TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[];

CREATE OR REPLACE FUNCTION public.complete_phone_signup(
  p_user_id UUID,
  p_phone TEXT,
  p_password TEXT,
  p_security_question TEXT,
  p_security_answer TEXT,
  p_age_range TEXT DEFAULT NULL,
  p_interests TEXT[] DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_clean_phone TEXT := trim(p_phone);
  v_clean_answer TEXT := lower(trim(p_security_answer));
BEGIN
  -- Auto-confirm user in auth.users & auth.identities
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = p_user_id;

  UPDATE auth.identities
  SET identity_data = jsonb_set(identity_data, '{email_verified}', 'true'::jsonb)
  WHERE user_id = p_user_id;

  -- Update profiles table
  UPDATE public.profiles
  SET phone = v_clean_phone,
      hashed_password = crypt(p_password, gen_salt('bf')),
      security_question = p_security_question,
      security_answer = v_clean_answer,
      age_range = p_age_range,
      interests = p_interests,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_phone_security_question(p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_question TEXT;
BEGIN
  SELECT security_question INTO v_question
  FROM public.profiles
  WHERE phone = trim(p_phone)
  LIMIT 1;

  IF v_question IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No account found with this phone number.');
  ELSE
    RETURN jsonb_build_object('success', true, 'question', v_question);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_phone_password(p_phone TEXT, p_answer TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_profile_id UUID;
  v_stored_answer TEXT;
  v_clean_phone TEXT := trim(p_phone);
  v_clean_answer TEXT := lower(trim(p_answer));
  v_new_pin TEXT;
BEGIN
  SELECT id, security_answer INTO v_profile_id, v_stored_answer
  FROM public.profiles
  WHERE phone = v_clean_phone
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No account found with this phone number.');
  END IF;

  IF v_stored_answer IS NULL OR v_stored_answer != v_clean_answer THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect security answer. Please check and try again.');
  END IF;

  -- Generate a random 5-digit PIN (10000 to 99999)
  v_new_pin := lpad(floor(random() * 90000 + 10000)::text, 5, '0');

  -- Update public.profiles
  UPDATE public.profiles
  SET hashed_password = crypt(v_new_pin, gen_salt('bf')),
      updated_at = now()
  WHERE id = v_profile_id;

  -- Update auth.users encrypted_password
  UPDATE auth.users
  SET encrypted_password = crypt(v_new_pin || '_mab', gen_salt('bf')),
      updated_at = now()
  WHERE id = v_profile_id;

  RETURN jsonb_build_object('success', true, 'new_password', v_new_pin);
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_phone_signup(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_phone_security_question(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_phone_password(TEXT, TEXT) TO anon, authenticated;
