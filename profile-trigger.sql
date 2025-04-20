-- Create a function to generate a username if one is not provided
CREATE OR REPLACE FUNCTION generate_username_if_null()
RETURNS TRIGGER AS $$
BEGIN
  -- If username is null, generate one from email or random string
  IF NEW.username IS NULL THEN
    -- Try to get email from auth.users
    DECLARE
      user_email TEXT;
    BEGIN
      SELECT email INTO user_email FROM auth.users WHERE id = NEW.id;
      
      IF user_email IS NOT NULL THEN
        -- Use email prefix as username base
        NEW.username := split_part(user_email, '@', 1) || '_' || floor(random() * 10000)::text;
      ELSE
        -- Fallback to a random username
        NEW.username := 'user_' || floor(random() * 1000000)::text;
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to run before insert on profiles
DROP TRIGGER IF EXISTS ensure_username_trigger ON profiles;
CREATE TRIGGER ensure_username_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION generate_username_if_null();
