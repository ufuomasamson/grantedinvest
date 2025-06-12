import React from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" bg="black" color="white">
          <VStack 
            spacing={6} 
            align="center" 
            justify="center" 
            minH="100vh"
            p={8}
          >
            <Heading size="lg" color="red.400">
              Something went wrong
            </Heading>
            <Text color="gray.300" textAlign="center" maxW="md">
              The application encountered an error. Please refresh the page or clear your browser data.
            </Text>
            <VStack spacing={3}>
              <Button 
                colorScheme="orange" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                colorScheme="gray"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
              >
                Clear Data & Refresh
              </Button>
            </VStack>
            {this.state.error && (
              <Text fontSize="sm" color="gray.500" fontFamily="mono">
                Error: {this.state.error.message}
              </Text>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
