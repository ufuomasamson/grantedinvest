import React from 'react';
import {
  Box,
  Container,
  Flex,
  Link as ChakraLink,
  Heading,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { FaChartLine, FaUsers, FaMoneyBillWave, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: FaChartLine },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/transactions', label: 'Transactions', icon: FaMoneyBillWave },
  ];

  return (
    <VStack
      w="250px"
      h="100vh"
      bg="gray.900"
      p={4}
      position="fixed"
      left={0}
      top={0}
      spacing={8}
    >
      <Heading size="md" color="brand.primary">
        Admin Panel
      </Heading>

      <VStack as="nav" spacing={4} align="stretch" flex={1}>
        {menuItems.map((item) => (
          <ChakraLink
            key={item.path}
            as={RouterLink}
            to={item.path}
            p={3}
            borderRadius="md"
            bg={isActive(item.path) ? 'whiteAlpha.200' : 'transparent'}
            _hover={{ bg: 'whiteAlpha.100' }}
            display="flex"
            alignItems="center"
            gap={3}
          >
            <Icon as={item.icon} />
            {item.label}
          </ChakraLink>
        ))}
      </VStack>

      <ChakraLink
        onClick={() => signOut()}
        p={3}
        borderRadius="md"
        _hover={{ bg: 'whiteAlpha.100' }}
        display="flex"
        alignItems="center"
        gap={3}
        cursor="pointer"
      >
        <Icon as={FaSignOutAlt} />
        Sign Out
      </ChakraLink>
    </VStack>
  );
};

export default function AdminLayout() {
  return (
    <Flex>
      <Sidebar />
      <Box flex={1} ml="250px" p={8}>
        <Container maxW="container.xl">
          <Outlet />
        </Container>
      </Box>
    </Flex>
  );
} 