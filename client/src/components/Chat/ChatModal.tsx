import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Box,
  Avatar,
  Flex,
  IconButton,
  useToast,
  Spinner,
  Badge,
} from '@chakra-ui/react';
import { FaPaperPlane, FaUser, FaUserShield } from 'react-icons/fa';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  user_id: string;
  admin_id?: string;
  message: string;
  sender_type: 'user' | 'admin';
  is_read: boolean;
  created_at: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string; // For admin to chat with specific user
  isAdmin?: boolean;
}

export function ChatModal({ isOpen, onClose, targetUserId, isAdmin = false }: ChatModalProps) {
  const { user } = useAuth();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const chatUserId = isAdmin ? targetUserId : user?.id;

  useEffect(() => {
    if (isOpen && chatUserId) {
      fetchMessages();
      markMessagesAsRead();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `user_id=eq.${chatUserId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages(prev => [...prev, payload.new as Message]);
              scrollToBottom();
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isOpen, chatUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!chatUserId) return;

    setLoading(true);
    try {
      const client = isAdmin ? supabaseAdmin : supabase;
      const { data, error } = await client
        .from('messages')
        .select('*')
        .eq('user_id', chatUserId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!chatUserId) return;

    try {
      const readerType = isAdmin ? 'admin' : 'user';
      await supabaseAdmin.rpc('mark_messages_as_read', {
        target_user_id: chatUserId,
        reader_type: readerType
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatUserId || !user) return;

    setSending(true);
    try {
      const messageData = {
        user_id: chatUserId,
        message: newMessage.trim(),
        sender_type: isAdmin ? 'admin' : 'user',
        admin_id: isAdmin ? user.id : null,
      };

      const client = isAdmin ? supabaseAdmin : supabase;
      const { error } = await client
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      setNewMessage('');
      toast({
        title: 'Message sent',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "lg" }}>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" mx={{ base: 0, md: 4 }}>
        <ModalHeader borderBottom="1px" borderColor="gray.600">
          <HStack>
            <FaUser />
            <Text>{isAdmin ? 'Chat with User' : 'Live Support'}</Text>
            {!isAdmin && (
              <Badge colorScheme="green" variant="solid">
                Online
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={0} h="400px" display="flex" flexDirection="column">
          {/* Messages Area */}
          <Box flex="1" overflowY="auto" p={4}>
            {loading ? (
              <Flex justify="center" align="center" h="full">
                <Spinner color="orange.400" />
              </Flex>
            ) : messages.length === 0 ? (
              <Flex justify="center" align="center" h="full">
                <Text color="gray.400">No messages yet. Start the conversation!</Text>
              </Flex>
            ) : (
              <VStack spacing={3} align="stretch">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={
                      isAdmin 
                        ? message.sender_type === 'admin'
                        : message.sender_type === 'user'
                    }
                    timestamp={formatTime(message.created_at)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </VStack>
            )}
          </Box>

          {/* Message Input */}
          <Box p={4} borderTop="1px" borderColor="gray.600">
            <HStack spacing={2}>
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                bg="gray.700"
                border="1px"
                borderColor="gray.600"
                _focus={{ borderColor: 'orange.400' }}
                flex="1"
              />
              <IconButton
                aria-label="Send message"
                icon={<FaPaperPlane />}
                colorScheme="orange"
                onClick={sendMessage}
                isLoading={sending}
                isDisabled={!newMessage.trim()}
              />
            </HStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  timestamp: string;
}

function MessageBubble({ message, isOwnMessage, timestamp }: MessageBubbleProps) {
  return (
    <Flex justify={isOwnMessage ? 'flex-end' : 'flex-start'}>
      <Box maxW="70%">
        <HStack spacing={2} mb={1}>
          {!isOwnMessage && (
            <Avatar
              size="xs"
              icon={message.sender_type === 'admin' ? <FaUserShield /> : <FaUser />}
              bg={message.sender_type === 'admin' ? 'orange.500' : 'blue.500'}
            />
          )}
          <Text fontSize="xs" color="gray.400">
            {message.sender_type === 'admin' ? 'Support' : 'You'}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {timestamp}
          </Text>
        </HStack>
        <Box
          bg={isOwnMessage ? 'orange.500' : 'gray.600'}
          color={isOwnMessage ? 'black' : 'white'}
          px={3}
          py={2}
          borderRadius="lg"
          borderTopLeftRadius={isOwnMessage ? 'lg' : 'sm'}
          borderTopRightRadius={isOwnMessage ? 'sm' : 'lg'}
        >
          <Text fontSize="sm" whiteSpace="pre-wrap">
            {message.message}
          </Text>
        </Box>
      </Box>
    </Flex>
  );
}
