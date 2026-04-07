-- ============================================================
-- Fix subscription plan_id constraint mismatch
-- The app uses 'starter'/'growth'/'pro' but the table only
-- accepted 'clinic'/'hospital'. This caused the auto-create
-- trigger to fail on every normal signup → no subscription row
-- → all WhatsApp blocked.
-- ============================================================

-- 1. Drop the old constraint (allow all plan variants)
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;

-- 2. Add new constraint accepting both new and legacy plan IDs
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_id_check
  CHECK (plan_id IN ('starter', 'growth', 'pro', 'clinic', 'hospital'));

-- 3. Replace the trigger function with a version that normalises plan IDs
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_raw_plan TEXT;
  v_plan_id  TEXT;
BEGIN
  -- Read plan from signup metadata (set by the frontend SignupForm)
  v_raw_plan := COALESCE(NEW.raw_user_meta_data->>'selectedPlan', 'starter');

  -- Normalise legacy plan IDs to current ones
  v_plan_id := CASE v_raw_plan
    WHEN 'clinic'        THEN 'starter'
    WHEN 'hospital'      THEN 'growth'
    WHEN 'professional'  THEN 'growth'
    WHEN 'enterprise'    THEN 'pro'
    WHEN 'free'          THEN 'starter'
    WHEN 'starter'       THEN 'starter'
    WHEN 'growth'        THEN 'growth'
    WHEN 'pro'           THEN 'pro'
    ELSE 'starter'
  END;

  -- Insert a 14-day trial subscription; ignore if one already exists
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    trial_start,
    trial_end
  ) VALUES (
    NEW.id,
    v_plan_id,
    'trialing',
    NOW(),
    NOW() + INTERVAL '14 days'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- 5. Fix the has_active_subscription helper so it doesn't gate on
--    trial_end (Razorpay webhooks own status transitions)
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
      AND status IN ('trialing', 'active')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Back-fill: create starter subscriptions for any existing users
--    who ended up without one due to the old constraint failure
INSERT INTO public.subscriptions (user_id, plan_id, status, trial_start, trial_end)
SELECT
  u.id,
  'starter',
  'trialing',
  NOW(),
  NOW() + INTERVAL '14 days'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions s WHERE s.user_id = u.id
)
ON CONFLICT (user_id) DO NOTHING;
