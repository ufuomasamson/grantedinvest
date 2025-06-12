-- Create messages table for live chat system
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  admin_id UUID,
  message TEXT NOT NULL,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'admin')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_type ON messages(sender_type);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages table
-- Users can only see their own messages
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own messages
CREATE POLICY "Users can insert their own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND sender_type = 'user');

-- Admins can view all messages (using auth.jwt() to check admin status)
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (
    (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- Admins can insert messages for any user
CREATE POLICY "Admins can insert messages" ON messages
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'is_admin')::boolean = true AND sender_type = 'admin'
  );

-- Admins can update message read status
CREATE POLICY "Admins can update messages" ON messages
  FOR UPDATE USING (
    (auth.jwt() ->> 'is_admin')::boolean = true
  );

-- Users can update their own message read status
CREATE POLICY "Users can update their own message read status" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON messages 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get unread message count for user
CREATE OR REPLACE FUNCTION get_unread_message_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM messages
    WHERE user_id = target_user_id 
    AND sender_type = 'admin' 
    AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(target_user_id UUID, reader_type TEXT)
RETURNS VOID AS $$
BEGIN
  IF reader_type = 'user' THEN
    UPDATE messages 
    SET is_read = true 
    WHERE user_id = target_user_id 
    AND sender_type = 'admin' 
    AND is_read = false;
  ELSIF reader_type = 'admin' THEN
    UPDATE messages 
    SET is_read = true 
    WHERE user_id = target_user_id 
    AND sender_type = 'user' 
    AND is_read = false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
