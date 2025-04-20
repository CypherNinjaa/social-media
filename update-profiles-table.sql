-- Add privacy settings columns to profiles table as a temporary solution
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS show_activity_status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_tagging BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_mentions BOOLEAN DEFAULT true;
