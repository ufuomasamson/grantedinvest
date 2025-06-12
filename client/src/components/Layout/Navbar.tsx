import { Box, Container, HStack, Button, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface NavbarProps {
  onSignOut: () => void;
  isSigningOut: boolean;
}

export function Navbar({ onSignOut, isSigningOut }: NavbarProps) {
  const { user, isAdmin } = useAuth();

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="64px"
      bg="gray.900"
      borderBottom="1px"
      borderColor="whiteAlpha.200"
      zIndex={1000}
    >
      <Container maxW="container.xl" h="100%">
        <HStack spacing={6} h="100%" justify="space-between">
          <HStack spacing={6}>
            <Text
              as={RouterLink}
              to="/"
              fontSize="xl"
              fontWeight="bold"
              color="orange.500"
            >
              GCrypto
            </Text>

            {/* Public Navigation - Always Visible */}
            <Button
              as={RouterLink}
              to="/"
              variant="ghost"
              color="gray.300"
              _hover={{ color: 'orange.500' }}
            >
              Home
            </Button>
            <Button
              as={RouterLink}
              to="/about"
              variant="ghost"
              color="gray.300"
              _hover={{ color: 'orange.500' }}
            >
              About
            </Button>
            <Button
              as={RouterLink}
              to="/services"
              variant="ghost"
              color="gray.300"
              _hover={{ color: 'orange.500' }}
            >
              Services
            </Button>
            <Button
              as={RouterLink}
              to="/contact"
              variant="ghost"
              color="gray.300"
              _hover={{ color: 'orange.500' }}
            >
              Contact
            </Button>

            {/* User-Only Navigation - Only Visible When Logged In */}
            {user && (
              <>
                <Button
                  as={RouterLink}
                  to="/dashboard"
                  variant="ghost"
                  color="gray.300"
                  _hover={{ color: 'orange.500' }}
                >
                  Dashboard
                </Button>
                <Button
                  as={RouterLink}
                  to="/trade"
                  variant="ghost"
                  color="gray.300"
                  _hover={{ color: 'orange.500' }}
                >
                  Trade
                </Button>
                <Button
                  as={RouterLink}
                  to="/market"
                  variant="ghost"
                  color="gray.300"
                  _hover={{ color: 'orange.500' }}
                >
                  Market
                </Button>
              </>
            )}
          </HStack>

          <HStack spacing={4}>
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    as={RouterLink}
                    to="/admin"
                    variant="ghost"
                    color="gray.300"
                    _hover={{ color: 'orange.500' }}
                  >
                    Admin
                  </Button>
                )}
                <Button
                  onClick={onSignOut}
                  variant="ghost"
                  color="gray.300"
                  _hover={{ color: 'orange.500' }}
                  isLoading={isSigningOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  color="gray.300"
                  _hover={{ color: 'orange.500' }}
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/register"
                  variant="ghost"
                  color="gray.300"
                  _hover={{ color: 'orange.500' }}
                >
                  Register
                </Button>
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
} 