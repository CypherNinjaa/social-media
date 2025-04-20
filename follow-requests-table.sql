-- Create follow_requests table for private profiles
CREATE TABLE IF NOT EXISTS public.follow_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

-- Add RLS policies
ALTER TABLE public.follow_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own follow requests (sent or received)"
ON public.follow_requests FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create their own follow requests"
ON public.follow_requests FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update follow requests they received"
ON public.follow_requests FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own follow requests"
ON public.follow_requests FOR DELETE
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_follow_requests_requester_id ON public.follow_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_recipient_id ON public.follow_requests(recipient_id);
CREATE INDEX IF NOT EXISTS idx_follow_requests_status ON public.follow_requests(status);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_follow_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp
CREATE TRIGGER update_follow_requests_updated_at
BEFORE UPDATE ON public.follow_requests
FOR EACH ROW
EXECUTE FUNCTION update_follow_requests_updated_at();
