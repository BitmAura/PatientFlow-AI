-- ==========================================
-- SUBSCRIPTION & BILLING MANAGEMENT
-- Compatible with existing NoShowKiller schema
-- ==========================================

-- Create subscriptions table for SaaS billing
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan information
  plan_id VARCHAR(50) NOT NULL CHECK (plan_id IN ('clinic', 'hospital')),
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  
  -- Razorpay integration
  razorpay_subscription_id VARCHAR(255) UNIQUE,
  razorpay_customer_id VARCHAR(255),
  razorpay_plan_id VARCHAR(255),
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'expired')),
  
  -- Trial and billing periods
  trial_start TIMESTAMPTZ DEFAULT NOW(),
  trial_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Cancellation tracking
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one active subscription per user
  CONSTRAINT one_subscription_per_user UNIQUE (user_id)
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  -- Usage metrics
  appointments_count INTEGER DEFAULT 0,
  whatsapp_messages_sent INTEGER DEFAULT 0,
  sms_messages_sent INTEGER DEFAULT 0, 
  email_messages_sent INTEGER DEFAULT 0,
  
  -- Period tracking
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription payment history table (separate from clinic payments table)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  
  -- Razorpay payment details
  razorpay_payment_id VARCHAR(255) UNIQUE NOT NULL,
  razorpay_order_id VARCHAR(255),
  
  -- Payment information
  amount INTEGER NOT NULL, -- in paise (₹2,999 = 299900 paise)
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'refunded', 'failed')),
  
  -- Metadata
  payment_method VARCHAR(50),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_id ON public.subscriptions(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription_id ON public.subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON public.subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_razorpay_id ON public.subscription_payments(razorpay_payment_id);

-- Apply trigger to subscriptions table (reuse existing update_updated_at_column function)
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to usage table  
DROP TRIGGER IF EXISTS update_subscription_usage_updated_at ON public.subscription_usage;
CREATE TRIGGER update_subscription_usage_updated_at
  BEFORE UPDATE ON public.subscription_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;
CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for usage
DROP POLICY IF EXISTS "Users can view their own subscription usage" ON public.subscription_usage;
CREATE POLICY "Users can view their own subscription usage"
  ON public.subscription_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.id = subscription_usage.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

-- RLS Policies for subscription payments
DROP POLICY IF EXISTS "Users can view their own subscription payments" ON public.subscription_payments;
CREATE POLICY "Users can view their own subscription payments"
  ON public.subscription_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE subscriptions.id = subscription_payments.subscription_id
      AND subscriptions.user_id = auth.uid()
    )
  );

-- Function to automatically create subscription on user signup
CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (
    user_id,
    plan_id,
    status,
    trial_start,
    trial_end
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'selectedPlan', 'clinic'),
    'trialing',
    NOW(),
    NOW() + INTERVAL '14 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription on signup
DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = p_user_id
    AND status IN ('trialing', 'active')
    AND (trial_end IS NULL OR trial_end > NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get subscription limits
CREATE OR REPLACE FUNCTION get_subscription_limits(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_plan_id VARCHAR(50);
BEGIN
  SELECT plan_id INTO v_plan_id
  FROM public.subscriptions
  WHERE user_id = p_user_id
  AND status IN ('trialing', 'active')
  LIMIT 1;
  
  IF v_plan_id = 'clinic' THEN
    RETURN json_build_object(
      'maxAppointments', 500,
      'maxDoctors', 3,
      'whatsappEnabled', true,
      'multiLocationEnabled', false
    );
  ELSIF v_plan_id = 'hospital' THEN
    RETURN json_build_object(
      'maxAppointments', -1, -- unlimited
      'maxDoctors', -1, -- unlimited
      'whatsappEnabled', true,
      'multiLocationEnabled', true
    );
  ELSE
    RETURN json_build_object(
      'maxAppointments', 0,
      'maxDoctors', 0,
      'whatsappEnabled', false,
      'multiLocationEnabled', false
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
