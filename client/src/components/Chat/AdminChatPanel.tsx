import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Card,
  CardBody,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Flex,
  useDisclosure,
  Button,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FaUser, FaComments } from 'react-icons/fa';
import { ChatModal } from './ChatModal';
import { supabase, supabaseAdmin } from '../../lib/supabase';

interface ChatUser {
  user_id: string;
  user_email: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  sender_type: string;
}

export function AdminChatPanel() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchChatUsers();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('admin_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchChatUsers(); // Refresh the list when any message changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Filter users based on search query
    const filtered = chatUsers.filter(user =>
      user.user_email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [chatUsers, searchQuery]);

  const fetchChatUsers = async () => {
    setLoading(true);
    try {
      // Get all users who have sent or received messages
      const { data, error } = await supabaseAdmin
        .from('messages')
        .select(`
          user_id,
          message,
          created_at,
          sender_type,
          is_read
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by user and get the latest message for each
      const userMap = new Map<string, ChatUser>();

      // Get unique user IDs first
      const uniqueUserIds = [...new Set(data?.map((msg: any) => msg.user_id) || [])];

      // Get user emails from auth.users
      const userEmails = new Map<string, string>();
      for (const userId of uniqueUserIds) {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
          if (userData.user?.email) {
            userEmails.set(userId, userData.user.email);
          }
        } catch (error) {
          console.error('Error fetching user email:', error);
          userEmails.set(userId, `User ${userId.slice(0, 8)}`);
        }
      }

      data?.forEach((msg: any) => {
        const userId = msg.user_id;
        const userEmail = userEmails.get(userId) || `User ${userId.slice(0, 8)}`;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            user_email: userEmail,
            last_message: msg.message,
            last_message_time: msg.created_at,
            unread_count: 0,
            sender_type: msg.sender_type,
          });
        }
      });

      // Count unread messages for each user (messages from users that admin hasn't read)
      for (const [userId, userData] of userMap.entries()) {
        const { data: unreadData } = await supabaseAdmin
          .from('messages')
          .select('id')
          .eq('user_id', userId)
          .eq('sender_type', 'user')
          .eq('is_read', false);

        userData.unread_count = unreadData?.length || 0;
      }

      const users = Array.from(userMap.values()).sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      setChatUsers(users);
    } catch (error) {
      console.error('Error fetching chat users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    onOpen();
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="orange.400" />
      </Flex>
    );
  }

  return (
    <>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <HStack>
            <FaComments />
            <Text fontSize="xl" fontWeight="bold" color="white">
              Live Chat Messages
            </Text>
          </HStack>
          <Badge colorScheme="orange" variant="solid">
            {chatUsers.reduce((sum, user) => sum + user.unread_count, 0)} unread
          </Badge>
        </HStack>

        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search users by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="gray.700"
            border="1px"
            borderColor="gray.600"
            _hover={{ borderColor: 'orange.400' }}
            _focus={{ borderColor: 'orange.400' }}
            color="white"
          />
        </InputGroup>

        <Box maxH="500px" overflowY="auto">
          {filteredUsers.length === 0 ? (
            <Card bg="gray.700">
              <CardBody>
                <Text color="gray.400" textAlign="center">
                  {searchQuery ? 'No users found matching your search.' : 'No chat messages yet.'}
                </Text>
              </CardBody>
            </Card>
          ) : (
            <VStack spacing={2} align="stretch">
              {filteredUsers.map((user) => (
                <Card
                  key={user.user_id}
                  bg="gray.700"
                  _hover={{ bg: 'gray.600', cursor: 'pointer' }}
                  transition="background-color 0.2s"
                  onClick={() => handleUserClick(user.user_id)}
                >
                  <CardBody p={4}>
                    <HStack justify="space-between" align="flex-start">
                      <HStack spacing={3} flex="1">
                        <Avatar
                          size="sm"
                          icon={<FaUser />}
                          bg="blue.500"
                        />
                        <VStack align="flex-start" spacing={1} flex="1">
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="bold" color="white" fontSize="sm">
                              {user.user_email}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {formatTime(user.last_message_time)}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.300">
                            {user.sender_type === 'admin' ? 'You: ' : ''}
                            {truncateMessage(user.last_message)}
                          </Text>
                        </VStack>
                      </HStack>
                      {user.unread_count > 0 && (
                        <Badge
                          colorScheme="red"
                          borderRadius="full"
                          fontSize="xs"
                          minW="20px"
                          textAlign="center"
                        >
                          {user.unread_count}
                        </Badge>
                      )}
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>

      {selectedUserId && (
        <ChatModal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setSelectedUserId(null);
            fetchChatUsers(); // Refresh the list when chat is closed
          }}
          targetUserId={selectedUserId}
          isAdmin={true}
        />
      )}
    </>
  );
}
