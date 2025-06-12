import { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
  FormErrorMessage,
  Center,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // Get the redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    console.log('Login attempt for email:', email);
    try {
      setLoading(true);
      await signIn(email, password);
      console.log('Login successful, navigating to:', from);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to sign in',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="black">
      <Container maxW="container.sm" py={10}>
        <VStack spacing={8} align="stretch">
          <VStack spacing={3} align="center">
            <Heading size="xl" color="white">Welcome Back</Heading>
            <Text color="gray.400">Please sign in to continue</Text>
          </VStack>

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="gray.900"
            p={8}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.200"
          >
            <VStack spacing={4}>
              <FormControl isInvalid={!!error} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  bg="gray.800"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'orange.400' }}
                  _focus={{ borderColor: 'orange.400', boxShadow: 'none' }}
                />
              </FormControl>

              <FormControl isInvalid={!!error} isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  bg="gray.800"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'orange.400' }}
                  _focus={{ borderColor: 'orange.400', boxShadow: 'none' }}
                />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>

              <Button
                type="submit"
                colorScheme="orange"
                width="full"
                size="lg"
                isLoading={loading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>

              <Text textAlign="center" color="gray.400">
                Don't have an account?{' '}
                <Link as={RouterLink} to="/register" color="orange.500">
                  Sign Up
                </Link>
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Center>
  );
} 