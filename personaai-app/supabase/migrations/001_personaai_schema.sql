-- =============================================================================
-- PersonaAI Schema v2.0
-- supabase/migrations/001_personaai_schema.sql
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------------

CREATE TABLE plans (
  id                        TEXT          PRIMARY KEY,
  display_name              TEXT          NOT NULL,
  price_weekly_cents        INTEGER,
  price_monthly_cents       INTEGER,
  max_influencers           INTEGER       NOT NULL,
  max_content_plans         INTEGER,
  weekly_post_limit         INTEGER       NOT NULL,
  weekly_story_limit        INTEGER       NOT NULL,
  weekly_reel_limit         INTEGER       NOT NULL,
  daily_post_limit          INTEGER       NOT NULL,
  daily_story_limit         INTEGER       NOT NULL,
  daily_reel_limit          INTEGER       NOT NULL,
  daily_total_limit         INTEGER       NOT NULL,
  storage_duration_hours    INTEGER       NOT NULL,
  auto_generation_enabled   BOOLEAN       NOT NULL DEFAULT FALSE,
  content_unlock_enabled    BOOLEAN       NOT NULL DEFAULT FALSE,
  priority_queue            BOOLEAN       NOT NULL DEFAULT FALSE,
  is_lifetime_limited       BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

INSERT INTO plans (
  id, display_name, price_weekly_cents, price_monthly_cents,
  max_influencers, max_content_plans,
  weekly_post_limit, weekly_story_limit, weekly_reel_limit,
  daily_post_limit, daily_story_limit, daily_reel_limit, daily_total_limit,
  storage_duration_hours,
  auto_generation_enabled, content_unlock_enabled, priority_queue, is_lifetime_limited
) VALUES
  ('free',    'Free',    NULL, NULL,  1,  1,    1,  1,  0,  1, 1, 0, 2,  12,  FALSE, FALSE, FALSE, TRUE),
  ('pro',     'Pro',     999,  2700,  3,  NULL, 8,  5,  3,  1, 1, 1, 3,  48,  TRUE,  TRUE,  FALSE, FALSE),
  ('creator', 'Creator', 1999, 4900,  10, NULL, 15, 10, 8,  2, 2, 1, 5,  168, TRUE,  TRUE,  TRUE,  FALSE);

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id                UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT          NOT NULL,
  display_name      TEXT,
  timezone          TEXT          NOT NULL DEFAULT 'UTC',
  onboarding_done   BOOLEAN       NOT NULL DEFAULT FALSE,
  onboarding_data   JSONB,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------

CREATE TABLE subscriptions (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id                 TEXT          NOT NULL REFERENCES plans(id),
  status                  TEXT          NOT NULL CHECK (status IN ('active','trialing','past_due','canceled','paused')),
  billing_interval        TEXT          CHECK (billing_interval IN ('weekly','monthly')),
  stripe_subscription_id  TEXT          UNIQUE,
  stripe_customer_id      TEXT,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  canceled_at             TIMESTAMPTZ,
  downgrade_to_plan_id    TEXT          REFERENCES plans(id),
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_subscriptions_user_active
  ON subscriptions(user_id) WHERE status = 'active';
CREATE INDEX idx_subscriptions_stripe
  ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_user
  ON subscriptions(user_id);

-- ---------------------------------------------------------------------------
-- influencers
-- ---------------------------------------------------------------------------

CREATE TABLE influencers (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT          NOT NULL,
  handle            TEXT          NOT NULL,
  niche             TEXT          NOT NULL,
  archetype         TEXT,
  personality_tags  TEXT[],
  style_notes       TEXT,
  is_archived       BOOLEAN       NOT NULL DEFAULT FALSE,
  archived_reason   TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_influencers_user
  ON influencers(user_id);
CREATE INDEX idx_influencers_user_active
  ON influencers(user_id) WHERE is_archived = FALSE;

-- ---------------------------------------------------------------------------
-- character_models
-- ---------------------------------------------------------------------------

CREATE TABLE character_models (
  id                        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id             UUID          NOT NULL UNIQUE REFERENCES influencers(id) ON DELETE CASCADE,
  replicate_model_version   TEXT,
  lora_weights_url          TEXT,
  base_model                TEXT          NOT NULL DEFAULT 'sdxl',
  face_embedding            vector(512),
  face_embedding_model      TEXT          DEFAULT 'insightface_w600k',
  face_similarity_threshold NUMERIC(3,2)  DEFAULT 0.85,
  positive_prompt_prefix    TEXT,
  negative_prompt           TEXT,
  default_seed              BIGINT,
  training_status           TEXT          NOT NULL DEFAULT 'pending'
    CHECK (training_status IN ('pending','training','ready','failed')),
  training_trigger_word     TEXT,
  training_started_at       TIMESTAMPTZ,
  training_completed_at     TIMESTAMPTZ,
  training_error            TEXT,
  training_image_count      INTEGER       NOT NULL DEFAULT 0,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_char_models_influencer
  ON character_models(influencer_id);

-- ---------------------------------------------------------------------------
-- character_training_images
-- ---------------------------------------------------------------------------

CREATE TABLE character_training_images (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  character_model_id  UUID          NOT NULL REFERENCES character_models(id) ON DELETE CASCADE,
  storage_bucket      TEXT          NOT NULL DEFAULT 'training-images',
  storage_path        TEXT          NOT NULL,
  file_size_bytes     INTEGER,
  mime_type           TEXT,
  is_primary          BOOLEAN       NOT NULL DEFAULT FALSE,
  face_detected       BOOLEAN,
  face_embedding      vector(512),
  caption             TEXT,
  uploaded_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_training_images_model
  ON character_training_images(character_model_id);

-- ---------------------------------------------------------------------------
-- content_plans
-- ---------------------------------------------------------------------------

CREATE TABLE content_plans (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  influencer_id     UUID          NOT NULL REFERENCES influencers(id) ON DELETE RESTRICT,
  title             TEXT,
  niche             TEXT          NOT NULL,
  target_audience   TEXT,
  content_pillars   TEXT[],
  posting_cadence   JSONB,
  plan_status       TEXT          NOT NULL DEFAULT 'draft'
    CHECK (plan_status IN ('draft','active','completed','archived')),
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  ai_generated      BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_content_plans_user
  ON content_plans(user_id);
CREATE INDEX idx_content_plans_influencer
  ON content_plans(influencer_id);
CREATE INDEX idx_content_plans_active
  ON content_plans(user_id) WHERE plan_status = 'active';

-- ---------------------------------------------------------------------------
-- plan_days
-- ---------------------------------------------------------------------------

CREATE TABLE plan_days (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  content_plan_id   UUID          NOT NULL REFERENCES content_plans(id) ON DELETE CASCADE,
  day_number        INTEGER       NOT NULL CHECK (day_number BETWEEN 1 AND 30),
  content_type      TEXT          NOT NULL CHECK (content_type IN ('post','story','reel')),
  theme             TEXT,
  hook_suggestion   TEXT,
  caption_draft     TEXT,
  hashtag_set       TEXT[],
  is_unlocked       BOOLEAN       NOT NULL DEFAULT FALSE,
  unlocked_at       TIMESTAMPTZ,
  is_skipped        BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (content_plan_id, day_number, content_type)
);

CREATE INDEX idx_plan_days_plan
  ON plan_days(content_plan_id);
CREATE INDEX idx_plan_days_unlocked
  ON plan_days(content_plan_id) WHERE is_unlocked = TRUE;

-- ---------------------------------------------------------------------------
-- generated_content
-- ---------------------------------------------------------------------------

CREATE TABLE generated_content (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id             UUID          NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
  user_id                 UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type            TEXT          NOT NULL CHECK (content_type IN ('post','story','reel')),
  triggered_by            TEXT          NOT NULL CHECK (triggered_by IN ('user','auto_system')),
  status                  TEXT          NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','generating','auto_pending','ready','previewed','downloaded','failed','expired')),
  quota_consumed          BOOLEAN       NOT NULL DEFAULT FALSE,
  quota_source            TEXT          CHECK (quota_source IN ('subscription','credits')),
  credits_used            INTEGER,
  quota_consumed_at       TIMESTAMPTZ,
  prompt_used             TEXT,
  negative_prompt_used    TEXT,
  model_version_used      TEXT,
  seed_used               BIGINT,
  generation_params       JSONB,
  face_similarity_score   NUMERIC(4,3),
  face_check_passed       BOOLEAN,
  storage_bucket          TEXT          DEFAULT 'generated-content',
  storage_path            TEXT,
  storage_expires_at      TIMESTAMPTZ,
  storage_deleted_at      TIMESTAMPTZ,
  file_size_bytes         BIGINT,
  mime_type               TEXT,
  duration_seconds        NUMERIC(6,2),
  caption                 TEXT,
  hook                    TEXT,
  hashtags                TEXT[],
  error_message           TEXT,
  retry_count             INTEGER       NOT NULL DEFAULT 0,
  generation_started_at   TIMESTAMPTZ,
  generation_ended_at     TIMESTAMPTZ,
  generation_duration_ms  INTEGER,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gc_plan_day
  ON generated_content(plan_day_id);
CREATE INDEX idx_gc_user
  ON generated_content(user_id);
CREATE INDEX idx_gc_user_status
  ON generated_content(user_id, status);
CREATE INDEX idx_gc_expires
  ON generated_content(storage_expires_at)
  WHERE storage_deleted_at IS NULL
    AND status NOT IN ('failed','expired','queued','generating');
CREATE UNIQUE INDEX idx_gc_canonical
  ON generated_content(plan_day_id, content_type)
  WHERE status IN ('auto_pending','ready','previewed','downloaded','queued','generating');

-- ---------------------------------------------------------------------------
-- usage_counters (weekly)
-- ---------------------------------------------------------------------------

CREATE TABLE usage_counters (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start          DATE          NOT NULL,
  posts_generated     INTEGER       NOT NULL DEFAULT 0,
  stories_generated   INTEGER       NOT NULL DEFAULT 0,
  reels_generated     INTEGER       NOT NULL DEFAULT 0,
  plan_id_snapshot    TEXT          REFERENCES plans(id),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_start)
);

CREATE INDEX idx_usage_user_week
  ON usage_counters(user_id, week_start);

-- ---------------------------------------------------------------------------
-- daily_usage_counters
-- ---------------------------------------------------------------------------

CREATE TABLE daily_usage_counters (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_date          DATE          NOT NULL,
  posts_generated     INTEGER       NOT NULL DEFAULT 0,
  stories_generated   INTEGER       NOT NULL DEFAULT 0,
  reels_generated     INTEGER       NOT NULL DEFAULT 0,
  total_generated     INTEGER       NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, usage_date)
);

CREATE INDEX idx_daily_user_date
  ON daily_usage_counters(user_id, usage_date);

-- ---------------------------------------------------------------------------
-- user_credits
-- ---------------------------------------------------------------------------

CREATE TABLE user_credits (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance          INTEGER       NOT NULL DEFAULT 0 CHECK (balance >= 0),
  lifetime_earned  INTEGER       NOT NULL DEFAULT 0,
  lifetime_spent   INTEGER       NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- credit_transactions
-- ---------------------------------------------------------------------------

CREATE TABLE credit_transactions (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                  TEXT          NOT NULL CHECK (type IN ('purchase','spend','refund','adjustment','bonus')),
  amount                INTEGER       NOT NULL,
  balance_after         INTEGER       NOT NULL,
  generated_content_id  UUID          REFERENCES generated_content(id),
  stripe_payment_intent TEXT,
  pack_id               TEXT,
  description           TEXT,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_tx_user
  ON credit_transactions(user_id);
CREATE INDEX idx_credit_tx_content
  ON credit_transactions(generated_content_id)
  WHERE generated_content_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- generation_queue
-- ---------------------------------------------------------------------------

CREATE TABLE generation_queue (
  id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_content_id    UUID          NOT NULL UNIQUE REFERENCES generated_content(id) ON DELETE CASCADE,
  priority                INTEGER       NOT NULL DEFAULT 5,
  attempts                INTEGER       NOT NULL DEFAULT 0,
  max_attempts            INTEGER       NOT NULL DEFAULT 3,
  scheduled_for           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  locked_at               TIMESTAMPTZ,
  locked_by               TEXT,
  completed_at            TIMESTAMPTZ,
  failed_at               TIMESTAMPTZ,
  error                   TEXT,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_queue_pending
  ON generation_queue(priority, scheduled_for)
  WHERE completed_at IS NULL
    AND failed_at IS NULL
    AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '10 minutes');

-- ---------------------------------------------------------------------------
-- webhook_events
-- ---------------------------------------------------------------------------

CREATE TABLE webhook_events (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT          NOT NULL UNIQUE,
  event_type      TEXT          NOT NULL,
  payload         JSONB,
  processed_at    TIMESTAMPTZ,
  error           TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_stripe_id
  ON webhook_events(stripe_event_id);

-- =============================================================================
-- RLS
-- =============================================================================

ALTER TABLE users                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_models          ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_training_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_plans             ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_days                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content         ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_counters            ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_usage_counters      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits              ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON users
  FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "subscriptions_own" ON subscriptions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "influencers_own" ON influencers
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "char_models_own" ON character_models
  FOR ALL USING (
    influencer_id IN (SELECT id FROM influencers WHERE user_id = auth.uid())
  );

CREATE POLICY "training_images_own" ON character_training_images
  FOR ALL USING (
    character_model_id IN (
      SELECT cm.id FROM character_models cm
      JOIN influencers i ON cm.influencer_id = i.id
      WHERE i.user_id = auth.uid()
    )
  );

CREATE POLICY "content_plans_own" ON content_plans
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "plan_days_own" ON plan_days
  FOR ALL USING (
    content_plan_id IN (SELECT id FROM content_plans WHERE user_id = auth.uid())
  );

CREATE POLICY "generated_content_own" ON generated_content
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "usage_counters_own" ON usage_counters
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_usage_own" ON daily_usage_counters
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_credits_own" ON user_credits
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "credit_tx_own" ON credit_transactions
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- Trigger functions
-- =============================================================================

CREATE OR REPLACE FUNCTION check_influencer_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_active_count  INTEGER;
  v_plan_max      INTEGER;
  v_plan_id       TEXT;
BEGIN
  IF NEW.is_archived THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(s.plan_id, 'free')
    INTO v_plan_id
    FROM subscriptions s
   WHERE s.user_id = NEW.user_id AND s.status = 'active'
   LIMIT 1;

  IF v_plan_id IS NULL THEN
    v_plan_id := 'free';
  END IF;

  SELECT p.max_influencers INTO v_plan_max
    FROM plans p WHERE p.id = v_plan_id;

  SELECT COUNT(*) INTO v_active_count
    FROM influencers i
   WHERE i.user_id = NEW.user_id
     AND i.is_archived = FALSE
     AND (TG_OP = 'INSERT' OR i.id != NEW.id);

  IF v_active_count >= v_plan_max THEN
    RAISE EXCEPTION 'INFLUENCER_LIMIT_EXCEEDED plan=% allows=% current=%',
      v_plan_id, v_plan_max, v_active_count;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_influencer_limit
  BEFORE INSERT OR UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION check_influencer_limit();


CREATE OR REPLACE FUNCTION check_content_plan_limit()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_plan_max    INTEGER;
  v_plan_count  INTEGER;
  v_plan_id     TEXT;
BEGIN
  SELECT COALESCE(s.plan_id, 'free') INTO v_plan_id
    FROM subscriptions s
   WHERE s.user_id = NEW.user_id AND s.status = 'active'
   LIMIT 1;

  IF v_plan_id IS NULL THEN
    v_plan_id := 'free';
  END IF;

  SELECT p.max_content_plans INTO v_plan_max
    FROM plans p WHERE p.id = v_plan_id;

  IF v_plan_max IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_plan_count
    FROM content_plans cp
   WHERE cp.user_id = NEW.user_id
     AND cp.plan_status != 'archived';

  IF v_plan_count >= v_plan_max THEN
    RAISE EXCEPTION 'CONTENT_PLAN_LIMIT_EXCEEDED';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_plan_limit
  BEFORE INSERT ON content_plans
  FOR EACH ROW EXECUTE FUNCTION check_content_plan_limit();


CREATE OR REPLACE FUNCTION check_credit_balance()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.balance < 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS balance would be %', NEW.balance;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_balance
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION check_credit_balance();

-- =============================================================================
-- RPC functions
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_usage_counters(
  p_user_id      UUID,
  p_content_type TEXT,
  p_date         DATE,
  p_week_start   DATE,
  p_plan_id      TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_post  INTEGER := CASE WHEN p_content_type = 'post'  THEN 1 ELSE 0 END;
  v_story INTEGER := CASE WHEN p_content_type = 'story' THEN 1 ELSE 0 END;
  v_reel  INTEGER := CASE WHEN p_content_type = 'reel'  THEN 1 ELSE 0 END;
BEGIN
  INSERT INTO daily_usage_counters
    (user_id, usage_date, posts_generated, stories_generated, reels_generated, total_generated)
  VALUES (p_user_id, p_date, v_post, v_story, v_reel, 1)
  ON CONFLICT (user_id, usage_date) DO UPDATE SET
    posts_generated   = daily_usage_counters.posts_generated   + v_post,
    stories_generated = daily_usage_counters.stories_generated + v_story,
    reels_generated   = daily_usage_counters.reels_generated   + v_reel,
    total_generated   = daily_usage_counters.total_generated   + 1,
    updated_at        = NOW();

  INSERT INTO usage_counters
    (user_id, week_start, posts_generated, stories_generated, reels_generated, plan_id_snapshot)
  VALUES (p_user_id, p_week_start, v_post, v_story, v_reel, p_plan_id)
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    posts_generated   = usage_counters.posts_generated   + v_post,
    stories_generated = usage_counters.stories_generated + v_story,
    reels_generated   = usage_counters.reels_generated   + v_reel,
    updated_at        = NOW();
END;
$$;


CREATE OR REPLACE FUNCTION add_credits(
  p_user_id               UUID,
  p_amount                INTEGER,
  p_pack_id               TEXT,
  p_stripe_payment_intent TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
  VALUES (p_user_id, p_amount, p_amount, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    balance         = user_credits.balance + p_amount,
    lifetime_earned = user_credits.lifetime_earned + p_amount,
    updated_at      = NOW()
  RETURNING balance INTO v_new_balance;

  INSERT INTO credit_transactions
    (user_id, type, amount, balance_after, stripe_payment_intent, pack_id, description)
  VALUES
    (p_user_id, 'purchase', p_amount, v_new_balance,
     p_stripe_payment_intent, p_pack_id,
     'Purchased ' || p_amount || ' credits (' || p_pack_id || ' pack)');
END;
$$;


CREATE OR REPLACE FUNCTION spend_credits(
  p_user_id              UUID,
  p_amount               INTEGER,
  p_generated_content_id UUID,
  p_description          TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_credits
  SET
    balance        = balance - p_amount,
    lifetime_spent = lifetime_spent + p_amount,
    updated_at     = NOW()
  WHERE user_id = p_user_id
    AND balance  >= p_amount
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  INSERT INTO credit_transactions
    (user_id, type, amount, balance_after, generated_content_id, description)
  VALUES
    (p_user_id, 'spend', -p_amount, v_new_balance,
     p_generated_content_id,
     COALESCE(p_description, 'Content generation: ' || p_amount || ' credit(s) used'));
END;
$$;


CREATE OR REPLACE FUNCTION refund_credits(
  p_user_id              UUID,
  p_amount               INTEGER,
  p_generated_content_id UUID
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  UPDATE user_credits
  SET
    balance        = balance + p_amount,
    lifetime_spent = GREATEST(0, lifetime_spent - p_amount),
    updated_at     = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  INSERT INTO credit_transactions
    (user_id, type, amount, balance_after, generated_content_id, description)
  VALUES
    (p_user_id, 'refund', p_amount, v_new_balance,
     p_generated_content_id, 'Generation failed - credits refunded');
END;
$$;


CREATE OR REPLACE FUNCTION unlock_plan_days_for_date(
  p_target_date DATE DEFAULT CURRENT_DATE
) RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH eligible AS (
    SELECT pd.id
    FROM   plan_days pd
    JOIN   content_plans cp ON pd.content_plan_id = cp.id
    JOIN   subscriptions  s  ON cp.user_id = s.user_id AND s.status = 'active'
    JOIN   plans          pl ON s.plan_id = pl.id
    WHERE  pl.content_unlock_enabled = TRUE
      AND  cp.plan_status  = 'active'
      AND  cp.started_at   IS NOT NULL
      AND  pd.is_unlocked  = FALSE
      AND  pd.is_skipped   = FALSE
      AND  (cp.started_at::DATE + ((pd.day_number - 1) * INTERVAL '1 day'))::DATE
             <= (p_target_date + INTERVAL '1 day')::DATE
  )
  UPDATE plan_days
     SET is_unlocked = TRUE,
         unlocked_at = NOW(),
         updated_at  = NOW()
   WHERE id IN (SELECT id FROM eligible);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


CREATE OR REPLACE FUNCTION get_auto_generate_targets(p_target_date DATE)
RETURNS TABLE (
  plan_day_id   UUID,
  user_id       UUID,
  content_type  TEXT,
  plan_id       TEXT,
  influencer_id UUID
) LANGUAGE sql AS $$
  SELECT
    pd.id           AS plan_day_id,
    cp.user_id,
    pd.content_type,
    s.plan_id,
    cp.influencer_id
  FROM   plan_days      pd
  JOIN   content_plans  cp ON pd.content_plan_id = cp.id
  JOIN   subscriptions  s  ON cp.user_id = s.user_id AND s.status = 'active'
  JOIN   plans          pl ON s.plan_id = pl.id
  WHERE  pl.auto_generation_enabled = TRUE
    AND  cp.plan_status    = 'active'
    AND  cp.started_at     IS NOT NULL
    AND  pd.is_skipped     = FALSE
    AND  (cp.started_at::DATE + (pd.day_number - 1))::DATE = p_target_date
    AND  NOT EXISTS (
      SELECT 1 FROM generated_content gc
       WHERE gc.plan_day_id  = pd.id
         AND gc.content_type = pd.content_type
         AND gc.status NOT IN ('failed','expired')
    );
$$;


CREATE OR REPLACE FUNCTION consume_auto_quota(
  p_content_id   UUID,
  p_user_id      UUID,
  p_content_type TEXT,
  p_date         DATE,
  p_week_start   DATE,
  p_quota_source TEXT,
  p_credits_used INTEGER,
  p_new_status   TEXT
) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_plan_id TEXT;
BEGIN
  UPDATE generated_content
     SET quota_consumed    = TRUE,
         quota_source      = p_quota_source,
         credits_used      = NULLIF(p_credits_used, 0),
         quota_consumed_at = NOW(),
         status            = p_new_status,
         updated_at        = NOW()
   WHERE id             = p_content_id
     AND quota_consumed = FALSE
     AND status         = 'auto_pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'QUOTA_ALREADY_CONSUMED_OR_INVALID_STATE';
  END IF;

  SELECT s.plan_id INTO v_plan_id
    FROM subscriptions s
   WHERE s.user_id = p_user_id AND s.status = 'active'
   LIMIT 1;

  IF p_quota_source = 'subscription' THEN
    PERFORM increment_usage_counters(
      p_user_id, p_content_type, p_date, p_week_start,
      COALESCE(v_plan_id, 'free')
    );
  ELSE
    PERFORM spend_credits(p_user_id, p_credits_used, p_content_id, NULL);
  END IF;
END;
$$;


CREATE OR REPLACE FUNCTION cleanup_usage_history(
  p_keep_weeks INTEGER DEFAULT 12,
  p_keep_days  INTEGER DEFAULT 90
) RETURNS VOID LANGUAGE sql AS $$
  DELETE FROM usage_counters
   WHERE week_start < CURRENT_DATE - (p_keep_weeks * 7);

  DELETE FROM daily_usage_counters
   WHERE usage_date < CURRENT_DATE - p_keep_days;
$$;
