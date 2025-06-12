import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Center, Spinner, Text, VStack, useToast, Button, Box } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading, isAdmin, adminLoading, refreshAdminStatus } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [retrying, setRetrying] = useState(false);

  // Log the current state only once when component mounts
  console.log('AdminRoute - Current State:', {
    user: user?.email,
    loading,
    isAdmin,
    adminLoading,
    path: location.pathname,
    timestamp: new Date().toISOString()
  });

  // Show loading while auth is initializing OR admin status is being checked
  if (loading || adminLoading) {
    return (
      <Center h="calc(100vh - 64px)">
        <VStack spacing={4}>
          <Spinner size="xl" color="orange.500" thickness="4px" />
          <Text color="gray.400">
            {loading ? 'Loading...' : 'Verifying admin access...'}
          </Text>
        </VStack>
      </Center>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    console.log('AdminRoute - No user found, redirecting to login');
    toast({
      title: 'Access Denied',
      description: 'Please log in to continue.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If logged in but not admin, show access denied with retry option
  if (!isAdmin) {
    console.log('AdminRoute - User is not admin, showing access denied');

    const handleRetry = async () => {
      setRetrying(true);
      try {
        await refreshAdminStatus();
        toast({
          title: 'Admin Status Refreshed',
          description: 'Checking admin privileges again...',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Retry Failed',
          description: 'Failed to refresh admin status.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setRetrying(false);
      }
    };

    return (
      <Center h="calc(100vh - 64px)">
        <VStack spacing={6} textAlign="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="red.400" mb={2}>
              Access Denied
            </Text>
            <Text color="gray.400" mb={4}>
              You do not have admin privileges.
            </Text>
            <Text fontSize="sm" color="gray.500">
              User: {user.email}
            </Text>
          </Box>
          <VStack spacing={3}>
            <Button
              colorScheme="orange"
              onClick={handleRetry}
              isLoading={retrying}
              loadingText="Checking..."
            >
              Retry Admin Check
            </Button>
            <Button
              variant="outline"
              colorScheme="gray"
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </Button>
          </VStack>
        </VStack>
      </Center>
    );
  }

  console.log('AdminRoute - Access granted for admin:', user.email);
  return <>{children}</>;
} 