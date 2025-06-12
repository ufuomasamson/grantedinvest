import { Box, Container, Flex, Link as ChakraLink } from '@chakra-ui/react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, signOut } = useAuth();

  return (
    <Box as="nav" bg="brand.background" py={4} borderBottom="1px" borderColor="whiteAlpha.200">
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <Flex gap={6}>
            <ChakraLink as={RouterLink} to="/" color="brand.primary" fontWeight="bold">
              GCrypto
            </ChakraLink>
            {user && (
              <>
                <ChakraLink as={RouterLink} to="/dashboard">
                  Dashboard
                </ChakraLink>
                <ChakraLink as={RouterLink} to="/trade">
                  Trade
                </ChakraLink>
                <ChakraLink as={RouterLink} to="/deposit">
                  Deposit
                </ChakraLink>
                <ChakraLink as={RouterLink} to="/withdraw">
                  Withdraw
                </ChakraLink>
              </>
            )}
          </Flex>
          <Flex gap={4}>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <ChakraLink as={RouterLink} to="/admin">
                    Admin
                  </ChakraLink>
                )}
                <ChakraLink onClick={() => signOut()} cursor="pointer">
                  Sign Out
                </ChakraLink>
              </>
            ) : (
              <>
                <ChakraLink as={RouterLink} to="/login">
                  Login
                </ChakraLink>
                <ChakraLink as={RouterLink} to="/register">
                  Register
                </ChakraLink>
              </>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default function MainLayout() {
  return (
    <Box minH="100vh" bg="brand.background">
      <Navigation />
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
} 