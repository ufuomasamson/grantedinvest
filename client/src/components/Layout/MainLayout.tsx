import { Box, Container, useToast, Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import { Navbar } from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function MainLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    console.log('MainLayout mounted', {
      user: user?.email,
      loading,
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, []);

  useEffect(() => {
    console.log('MainLayout auth state changed', {
      user: user?.email,
      loading,
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [user, loading]);

  // Don't redirect to login if we're on public pages
  const isPublicPage = ['/', '/login', '/register', '/market'].includes(location.pathname);

  useEffect(() => {
    console.log('MainLayout checking auth', {
      user: user?.email,
      loading,
      isPublicPage,
      shouldRedirect: !loading && !user && !isPublicPage,
      path: location.pathname,
      timestamp: new Date().toISOString()
    });

    // Only redirect to login if user is not authenticated and trying to access protected pages
    if (!loading && !user && !isPublicPage) {
      console.log('MainLayout redirecting to login');
      navigate('/login');
    }
  }, [user, loading, navigate, isPublicPage]);

  console.log('MainLayout rendering', {
    user: user?.email,
    loading,
    path: location.pathname,
    timestamp: new Date().toISOString()
  });

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      navigate('/login');
      toast({
        title: 'Signed out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Show loading state with spinner
  if (loading) {
    return (
      <Box minH="100vh" bg="black">
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="100vh"
          color="white"
        >
          <VStack spacing={4}>
            <Spinner
              size="xl"
              color="orange.500"
              thickness="4px"
              speed="0.65s"
            />
            <Text fontSize="lg" color="gray.300">
              Loading...
            </Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  // For login and register pages, render without the navbar
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <Box minH="100vh" bg="black">
        <Container maxW="container.xl" py={8}>
          <Outlet />
        </Container>
      </Box>
    );
  }

  // For all other pages, render with the navbar
  return (
    <Box minH="100vh" bg="black">
      <Navbar onSignOut={handleSignOut} isSigningOut={isSigningOut} />
      <Box pt="64px">
        <Container maxW="container.xl" py={8}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
} 