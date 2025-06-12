import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Card,
  CardBody,
  Icon,
  SimpleGrid,
  Avatar,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Button,
} from '@chakra-ui/react';
import {
  FaShieldAlt,
  FaUsers,
  FaChartLine,
  FaGlobe,
  FaRocket,
  FaLock,
  FaCheckCircle,
  FaAward,
  FaClock,
  FaHandshake,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

export function About() {
  return (
    <Box bg="black" minH="100vh">
      {/* Hero Section */}
      <Box
        py={20}
        bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 48, 0.1) 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Text 
                fontSize="sm" 
                color="orange.400" 
                fontWeight="bold" 
                textTransform="uppercase" 
                letterSpacing="wider"
              >
                About Our Platform
              </Text>
              <Heading size="3xl" color="white" maxW="800px">
                Building the Future of Cryptocurrency Trading
              </Heading>
              <Text fontSize="xl" color="gray.400" maxW="700px" lineHeight="1.6">
                We're revolutionizing digital asset trading with cutting-edge technology, 
                unmatched security, and a commitment to transparency that puts our users first.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box py={20} bg="gray.950">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12}>
            <GridItem>
              <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700" h="full">
                <CardBody p={8}>
                  <VStack spacing={6} align="flex-start" h="full">
                    <HStack spacing={4}>
                      <Icon as={FaRocket} boxSize={8} color="orange.400" />
                      <Heading size="lg" color="white">Our Mission</Heading>
                    </HStack>
                    <Text color="gray.300" fontSize="lg" lineHeight="1.7">
                      To democratize access to cryptocurrency trading by providing a secure, 
                      transparent, and user-friendly platform that empowers both novice and 
                      experienced traders to achieve their financial goals.
                    </Text>
                    <Text color="gray.400" lineHeight="1.6">
                      We believe that everyone should have access to professional-grade trading 
                      tools and real-time market data, regardless of their experience level or 
                      investment size.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700" h="full">
                <CardBody p={8}>
                  <VStack spacing={6} align="flex-start" h="full">
                    <HStack spacing={4}>
                      <Icon as={FaGlobe} boxSize={8} color="blue.400" />
                      <Heading size="lg" color="white">Our Vision</Heading>
                    </HStack>
                    <Text color="gray.300" fontSize="lg" lineHeight="1.7">
                      To become the world's most trusted cryptocurrency trading platform, 
                      setting new standards for security, innovation, and customer satisfaction 
                      in the digital asset ecosystem.
                    </Text>
                    <Text color="gray.400" lineHeight="1.6">
                      We envision a future where cryptocurrency trading is accessible, secure, 
                      and profitable for millions of users worldwide, driving the adoption of 
                      digital assets globally.
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Core Values */}
      <Box py={20} bg="black">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Text 
                fontSize="sm" 
                color="orange.400" 
                fontWeight="bold" 
                textTransform="uppercase" 
                letterSpacing="wider"
              >
                Our Core Values
              </Text>
              <Heading size="2xl" color="white">
                What Drives Us Every Day
              </Heading>
              <Text fontSize="lg" color="gray.400" maxW="600px">
                Our values guide every decision we make and every feature we build.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              <ValueCard
                icon={FaShieldAlt}
                title="Security First"
                description="Bank-grade security with multi-layer protection, cold storage, and continuous monitoring to keep your assets safe."
              />
              <ValueCard
                icon={FaHandshake}
                title="Transparency"
                description="Complete transparency in our operations, fees, and processes. No hidden costs or surprise charges."
              />
              <ValueCard
                icon={FaUsers}
                title="User-Centric"
                description="Every feature is designed with our users in mind, prioritizing ease of use and exceptional experience."
              />
              <ValueCard
                icon={FaRocket}
                title="Innovation"
                description="Constantly pushing boundaries with cutting-edge technology and innovative trading solutions."
              />
              <ValueCard
                icon={FaCheckCircle}
                title="Reliability"
                description="99.9% uptime guarantee with robust infrastructure that you can depend on 24/7."
              />
              <ValueCard
                icon={FaAward}
                title="Excellence"
                description="Committed to delivering excellence in every aspect of our platform and customer service."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Statistics */}
      <Box py={20} bg="gray.950">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" color="white">
                Trusted by Traders Worldwide
              </Heading>
              <Text fontSize="lg" color="gray.400">
                Our numbers speak for themselves
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
              <Card bg="gray.900" borderRadius="xl" border="1px solid" borderColor="gray.700">
                <CardBody textAlign="center" py={8}>
                  <Stat>
                    <StatNumber color="white" fontSize="3xl">150K+</StatNumber>
                    <StatLabel color="gray.400">Active Traders</StatLabel>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg="gray.900" borderRadius="xl" border="1px solid" borderColor="gray.700">
                <CardBody textAlign="center" py={8}>
                  <Stat>
                    <StatNumber color="white" fontSize="3xl">$2.4B+</StatNumber>
                    <StatLabel color="gray.400">Trading Volume</StatLabel>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg="gray.900" borderRadius="xl" border="1px solid" borderColor="gray.700">
                <CardBody textAlign="center" py={8}>
                  <Stat>
                    <StatNumber color="white" fontSize="3xl">99.9%</StatNumber>
                    <StatLabel color="gray.400">Uptime</StatLabel>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg="gray.900" borderRadius="xl" border="1px solid" borderColor="gray.700">
                <CardBody textAlign="center" py={8}>
                  <Stat>
                    <StatNumber color="white" fontSize="3xl">24/7</StatNumber>
                    <StatLabel color="gray.400">Support</StatLabel>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Team Section */}
      <Box py={20} bg="black">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading size="2xl" color="white">
                Meet Our Leadership Team
              </Heading>
              <Text fontSize="lg" color="gray.400" maxW="600px">
                Experienced professionals dedicated to revolutionizing cryptocurrency trading
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              <TeamMember
                name="Sarah Johnson"
                role="Chief Executive Officer"
                experience="15+ years in FinTech"
                avatar="SJ"
              />
              <TeamMember
                name="Michael Chen"
                role="Chief Technology Officer"
                experience="12+ years in Blockchain"
                avatar="MC"
              />
              <TeamMember
                name="Emily Rodriguez"
                role="Head of Security"
                experience="10+ years in Cybersecurity"
                avatar="ER"
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg="gray.950">
        <Container maxW="container.xl">
          <VStack spacing={8} textAlign="center">
            <Heading size="xl" color="white">
              Ready to Start Your Trading Journey?
            </Heading>
            <Text fontSize="lg" color="gray.400" maxW="600px">
              Join thousands of traders who trust our platform for secure, professional cryptocurrency trading.
            </Text>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              bg="orange.400"
              color="black"
              fontWeight="bold"
              px={8}
              _hover={{ 
                bg: 'orange.300', 
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(255, 119, 48, 0.3)'
              }}
              transition="all 0.3s ease"
            >
              Get Started Today
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

function ValueCard({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <Card 
      bg="gray.900" 
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.700"
      _hover={{
        borderColor: 'orange.400',
        transform: 'translateY(-4px)',
        boxShadow: '0 15px 30px rgba(255, 119, 48, 0.1)'
      }}
      transition="all 0.3s ease"
    >
      <CardBody p={8}>
        <VStack spacing={6} align="flex-start">
          <Box
            p={4}
            bg="orange.400"
            borderRadius="xl"
          >
            <Icon as={icon} boxSize={6} color="black" />
          </Box>
          <VStack align="flex-start" spacing={3}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              {title}
            </Text>
            <Text color="gray.400" lineHeight="1.6">
              {description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

function TeamMember({ name, role, experience, avatar }: { 
  name: string; 
  role: string; 
  experience: string; 
  avatar: string; 
}) {
  return (
    <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700">
      <CardBody p={8} textAlign="center">
        <VStack spacing={6}>
          <Avatar size="xl" name={name} bg="orange.400" color="black" fontSize="2xl" />
          <VStack spacing={2}>
            <Text fontSize="xl" fontWeight="bold" color="white">{name}</Text>
            <Text color="orange.400" fontWeight="semibold">{role}</Text>
            <Badge colorScheme="gray" variant="subtle">{experience}</Badge>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}
