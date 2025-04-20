-- Enhance notifications table with additional fields
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS content TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_actor_id ON public.notifications(actor_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Add function to create notifications
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- For likes
  IF TG_TABLE_NAME = 'likes' AND TG_OP = 'INSERT' THEN
    -- Get post owner
    INSERT INTO public.notifications (user_id, actor_id, type, post_id, is_read)
    SELECT posts.user_id, NEW.user_id, 'like', NEW.post_id, false
    FROM public.posts
    WHERE posts.id = NEW.post_id AND posts.user_id != NEW.user_id;
  
  -- For comments
  ELSIF TG_TABLE_NAME = 'comments' AND TG_OP = 'INSERT' THEN
    -- Get post owner
    INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id, content, is_read)
    SELECT posts.user_id, NEW.user_id, 'comment', NEW.post_id, NEW.id, substring(NEW.content from 1 for 100), false
    FROM public.posts
    WHERE posts.id = NEW.post_id AND posts.user_id != NEW.user_id;
    
    -- If it's a reply to another comment, notify the comment owner too
    IF NEW.parent_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, actor_id, type, post_id, comment_id, content, is_read)
      SELECT comments.user_id, NEW.user_id, 'reply', NEW.post_id, NEW.id, substring(NEW.content from 1 for 100), false
      FROM public.comments
      WHERE comments.id = NEW.parent_id AND comments.user_id != NEW.user_id;
    END IF;
  
  -- For follows
  ELSIF TG_TABLE_NAME = 'follows' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, actor_id, type, is_read)
    VALUES (NEW.following_id, NEW.follower_id, 'follow', false);
  
  -- For messages
  ELSIF TG_TABLE_NAME = 'messages' AND TG_OP = 'INSERT' THEN
    -- Get conversation participants excluding sender
    INSERT INTO public.notifications (user_id, actor_id, type, message_id, conversation_id, content, is_read)
    SELECT cp.user_id, NEW.sender_id, 'message', NEW.id, NEW.conversation_id, substring(NEW.content from 1 for 100), false
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id AND cp.user_id != NEW.sender_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for notifications
DROP TRIGGER IF EXISTS likes_notification_trigger ON public.likes;
CREATE TRIGGER likes_notification_trigger
AFTER INSERT ON public.likes
FOR EACH ROW
EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS comments_notification_trigger ON public.comments;
CREATE TRIGGER comments_notification_trigger
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS follows_notification_trigger ON public.follows;
CREATE TRIGGER follows_notification_trigger
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION create_notification();

DROP TRIGGER IF EXISTS messages_notification_trigger ON public.messages;
CREATE TRIGGER messages_notification_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION create_notification();
