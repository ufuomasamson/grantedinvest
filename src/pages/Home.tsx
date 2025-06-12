import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Image,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaLock, FaChartLine, FaWallet } from 'react-icons/fa';

const Feature = ({ icon, title, text }: { icon: React.ElementType; title: string; text: string }) => {
  return (
    <VStack
      align="center"
      p={6}
      bg={useColorModeValue('whiteAlpha.100', 'whiteAlpha.50')}
      borderRadius="lg"
      spacing={4}
    >
      <Icon as={icon} boxSize={10} color="brand.primary" />
      <Heading size="md">{title}</Heading>
      <Text textAlign="center" color="whiteAlpha.800">
        {text}
      </Text>
    </VStack>
  );
};

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box bg="brand.background" py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <VStack align="flex-start" spacing={6}>
              <Heading size="2xl" color="brand.primary">
                Trade Crypto with Confidence
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.900">
                Experience secure and seamless cryptocurrency trading with our advanced platform.
              </Text>
              <HStack spacing={4}>
                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  colorScheme="orange"
                >
                  Get Started
                </Button>
                <Button
                  as={RouterLink}
                  to="/login"
                  size="lg"
                  variant="outline"
                  colorScheme="orange"
                >
                  Sign In
                </Button>
              </HStack>
            </VStack>
            <Box>
              <Image
                src="/crypto-trading.svg"
                alt="Trading Platform"
                fallbackSrc="https://via.placeholder.com/500x400?text=Trading+Platform"
              />
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <Heading textAlign="center" color="brand.primary">
              Why Choose GCrypto?
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} width="full">
              <Feature
                icon={FaLock}
                title="Secure Trading"
                text="Advanced security measures to protect your assets and transactions"
              />
              <Feature
                icon={FaChartLine}
                title="Real-Time Analytics"
                text="Access to real-time market data and trading analytics"
              />
              <Feature
                icon={FaWallet}
                title="Easy Deposits"
                text="Simple and secure deposit process with multiple payment options"
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
} 