-- Drop message reactions table
DROP TABLE IF EXISTS message_reactions;

-- Drop messages table
DROP TABLE IF EXISTS messages;

-- Drop conversation participants table
DROP TABLE IF EXISTS conversation_participants;

-- Drop conversations table
DROP TABLE IF EXISTS conversations;

-- Drop messaging-related functions
DROP FUNCTION IF EXISTS get_or_create_conversation(user1_id UUID, user2_id UUID);
DROP FUNCTION IF EXISTS update_last_read(conversation_id_param UUID, user_id_param UUID);
DROP FUNCTION IF EXISTS search_messages(search_query TEXT, user_id_param UUID);
DROP FUNCTION IF EXISTS update_message_status(message_id_param UUID, new_status VARCHAR);
DROP FUNCTION IF EXISTS get_thread_replies(parent_message_id UUID);
