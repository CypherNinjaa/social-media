-- Table for storing user interests and preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] DEFAULT '{}',
  preferred_content_types TEXT[] DEFAULT '{}',
  preferred_creators TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table for tracking user interactions for recommendation engine
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'comment', 'share', 'save'
  duration_seconds INTEGER, -- For view interactions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing AI-generated content
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'post', 'comment', 'bio', etc.
  prompt TEXT,
  generated_content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- If published as a post
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing content moderation results
CREATE TABLE IF NOT EXISTS content_moderation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL, -- 'post', 'comment', etc.
  content_id UUID NOT NULL, -- ID of the post or comment
  sentiment TEXT,
  sentiment_score DECIMAL,
  toxicity_score DECIMAL,
  is_appropriate BOOLEAN,
  moderation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing chatbot conversations
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  message TEXT NOT NULL,
  is_user_message BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for tracking AI feature usage and availability
CREATE TABLE IF NOT EXISTS ai_feature_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL, -- 'content_generation', 'recommendations', 'moderation', 'chatbot'
  is_enabled BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_post_id ON user_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_content_id ON content_moderation(content_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feature_status_user_id ON ai_feature_status(user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update timestamps
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_feature_status_updated_at
BEFORE UPDATE ON ai_feature_status
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
