import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Box,
  Badge,
  useDisclosure,
  Tooltip,
} from '@chakra-ui/react';
import { FaComments } from 'react-icons/fa';
import { ChatModal } from './ChatModal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';



interface ChatIconProps {
  position?: 'fixed' | 'relative';
  bottom?: string;
  right?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChatIcon({ 
  position = 'fixed', 
  bottom = '20px', 
  right = '20px',
  size = 'lg'
}: ChatIconProps) {
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Set up real-time subscription for new messages
      const subscription = supabase
        .channel('unread_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newMessage = payload.new as any;
            if (newMessage.sender_type === 'admin') {
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedMessage = payload.new as any;
            if (updatedMessage.sender_type === 'admin' && updatedMessage.is_read) {
              fetchUnreadCount(); // Refresh count when messages are marked as read
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_unread_message_count', {
        target_user_id: user.id
      });

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleChatOpen = () => {
    onOpen();
    // Reset unread count when chat is opened
    setUnreadCount(0);
  };

  if (!user) return null;

  return (
    <>
      <Box
        position={position}
        bottom={bottom}
        right={right}
        zIndex={1000}
        padding="8px"
      >
        <Tooltip label="Live Support Chat" placement="left">
          <Box position="relative" display="inline-block">
            <IconButton
              aria-label="Open chat"
              icon={<FaComments />}
              size={size}
              colorScheme="orange"
              borderRadius="full"
              onClick={handleChatOpen}
              boxShadow="lg"
              _hover={{
                transform: 'scale(1.1)',
                boxShadow: 'xl',
              }}
              transition="all 0.2s"
              position="relative"
              zIndex={1}
            />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-8px"
                right="-8px"
                bg="red.500"
                color="white"
                borderRadius="full"
                fontSize="xs"
                minW="24px"
                h="24px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={2}
                border="2px solid"
                borderColor="white"
                fontWeight="bold"
                boxShadow="0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(245, 101, 101, 0.7)"
                sx={{
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(245, 101, 101, 0.7)',
                    },
                    '70%': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 8px rgba(245, 101, 101, 0)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(245, 101, 101, 0)',
                    },
                  },
                }}
                _hover={{
                  transform: 'scale(1.1)',
                }}
                transition="transform 0.2s"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Box>
        </Tooltip>
      </Box>

      <ChatModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
