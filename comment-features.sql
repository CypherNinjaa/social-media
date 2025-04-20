-- Add parent_id to comments table for replies
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- Add is_edited flag to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- Create comment_likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS comment_likes_comment_id_idx ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS comment_likes_user_id_idx ON comment_likes(user_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON comments(parent_id);
