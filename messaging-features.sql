-- Add status column to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'sent';

-- Add parent_id column to messages for thread replies
ALTER TABLE messages ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES messages(id) ON DELETE CASCADE;

-- Create message_reactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reaction VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Add RLS policies for message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own reactions"
ON message_reactions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view reactions"
ON message_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can delete their own reactions"
ON message_reactions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create function to update message status
CREATE OR REPLACE FUNCTION update_message_status(message_id_param UUID, new_status VARCHAR)
RETURNS VOID AS $$
BEGIN
  UPDATE messages
  SET status = new_status
  WHERE id = message_id_param;
END;
$$ LANGUAGE plpgsql;

-- Create function to get thread replies
CREATE OR REPLACE FUNCTION get_thread_replies(parent_message_id UUID)
RETURNS TABLE (
  id UUID,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  status VARCHAR,
  is_edited BOOLEAN,
  is_deleted BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  parent_id UUID,
  sender_username TEXT,
  sender_avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    m.sender_id,
    m.content,
    m.status,
    m.is_edited,
    m.is_deleted,
    m.created_at,
    m.updated_at,
    m.parent_id,
    p.username AS sender_username,
    p.avatar_url AS sender_avatar_url
  FROM messages m
  JOIN profiles p ON m.sender_id = p.id
  WHERE m.parent_id = parent_message_id
  ORDER BY m.created_at ASC;
END;
$$ LANGUAGE plpgsql;
