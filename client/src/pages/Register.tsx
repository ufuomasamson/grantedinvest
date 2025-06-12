import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  useToast,
  Container,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password);
      
      toast({
        title: 'Success',
        description: 'Please check your email to confirm your registration',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="black">
      <Container maxW="400px" p={6}>
        <Box bg="gray.900" p={8} borderRadius="xl" boxShadow="xl">
          <VStack spacing={6}>
            <Heading color="white">Create Account</Heading>
            <Text color="gray.400">Sign up to start trading</Text>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    bg="gray.800"
                    border="1px"
                    borderColor="gray.700"
                    color="white"
                    _hover={{ borderColor: 'orange.500' }}
                    _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px var(--chakra-colors-orange-500)' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Password</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    bg="gray.800"
                    border="1px"
                    borderColor="gray.700"
                    color="white"
                    _hover={{ borderColor: 'orange.500' }}
                    _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px var(--chakra-colors-orange-500)' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300">Confirm Password</FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    bg="gray.800"
                    border="1px"
                    borderColor="gray.700"
                    color="white"
                    _hover={{ borderColor: 'orange.500' }}
                    _focus={{ borderColor: 'orange.500', boxShadow: '0 0 0 1px var(--chakra-colors-orange-500)' }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="orange"
                  size="lg"
                  width="full"
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            <Text color="gray.400">
              Already have an account?{' '}
              <ChakraLink as={RouterLink} to="/login" color="orange.500" _hover={{ textDecoration: 'underline' }}>
                Sign In
              </ChakraLink>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
} 