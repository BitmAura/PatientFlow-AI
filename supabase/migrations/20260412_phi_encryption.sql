-- 🧬 Persona: Security Architect
-- ⚡ Purpose: Implements Column-Level Encryption (CLE) for Patient PHI (Phone, Name) to meet DISHA requirements.

-- 1. Enable pgcrypto for AES support
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create the Security Vault (Internal Use)
-- Note: In production, the key should be rotated or managed via an HSM/External Provider.
CREATE TABLE IF NOT EXISTS public.phi_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT UNIQUE NOT NULL,
    key_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed an initial master key (Demo/Base Key)
-- IMPORTANT: This key MUST be guarded.
INSERT INTO public.phi_vault (key_name, key_value)
VALUES ('master_patient_key', 'PF_AI_PHI_ENCRYPTION_MASTER_KEY_2026_CHANGE_ME')
ON CONFLICT (key_name) DO NOTHING;

-- 3. Encryption/Decryption Helper Functions
CREATE OR REPLACE FUNCTION public.encrypt_phi(plaintext TEXT) 
RETURNS TEXT AS $$
DECLARE
    master_key TEXT;
BEGIN
    SELECT key_value INTO master_key FROM public.phi_vault WHERE key_name = 'master_patient_key';
    RETURN pgp_sym_encrypt(plaintext, master_key)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_phi(ciphertext TEXT) 
RETURNS TEXT AS $$
DECLARE
    master_key TEXT;
BEGIN
    SELECT key_value INTO master_key FROM public.phi_vault WHERE key_name = 'master_patient_key';
    RETURN pgp_sym_decrypt(ciphertext::BYTEA, master_key)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Alter Patients Table for Encrypted Storage
-- We add 'encrypted_phone' and 'encrypted_full_name'
-- We keep raw fields for now for seamless migration, then we migrate and drop/obscure raw fields.
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS encrypted_phone TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS encrypted_full_name TEXT;

-- 5. Auto-Encryption Trigger
CREATE OR REPLACE FUNCTION public.on_patient_write_encrypt()
RETURNS TRIGGER AS $$
BEGIN
    -- Encrypt phone and name upon insertion or update
    IF NEW.phone IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.phone <> OLD.phone) THEN
        NEW.encrypted_phone := public.encrypt_phi(NEW.phone);
    END IF;
    
    IF NEW.full_name IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.full_name <> OLD.full_name) THEN
        NEW.encrypted_full_name := public.encrypt_phi(NEW.full_name);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_encrypt_patient_phi
BEFORE INSERT OR UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.on_patient_write_encrypt();

-- 6. Backfill existing records
UPDATE public.patients 
SET encrypted_phone = public.encrypt_phi(phone), 
    encrypted_full_name = public.encrypt_phi(full_name)
WHERE encrypted_phone IS NULL OR encrypted_full_name IS NULL;
