import React, { useState } from 'react';
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  useToast,
  Divider,
} from '@chakra-ui/react';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaHeadset,
  FaQuestionCircle,
  FaShieldAlt,
  FaUsers,
  FaTelegram,
  FaTwitter,
  FaDiscord,
  FaLinkedin,
} from 'react-icons/fa';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: 'Message Sent Successfully!',
        description: 'Thank you for contacting us. We\'ll get back to you within 24 hours.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 2000);
  };

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
                Get In Touch
              </Text>
              <Heading size="3xl" color="white" maxW="800px">
                We're Here to Help You Succeed
              </Heading>
              <Text fontSize="xl" color="gray.400" maxW="700px" lineHeight="1.6">
                Have questions about our platform? Need technical support? Want to discuss 
                enterprise solutions? Our team is ready to assist you.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Contact Methods */}
      <Box py={20} bg="gray.950">
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
                Contact Methods
              </Text>
              <Heading size="2xl" color="white">
                Multiple Ways to Reach Us
              </Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              <ContactCard
                icon={FaHeadset}
                title="24/7 Live Support"
                description="Get instant help through our live chat system"
                info="Available 24/7"
                color="green.400"
              />
              
              <ContactCard
                icon={FaEnvelope}
                title="Email Support"
                description="Send us detailed questions and get comprehensive answers"
                info="support@gcrypto.com"
                color="blue.400"
              />
              
              <ContactCard
                icon={FaPhone}
                title="Phone Support"
                description="Speak directly with our support specialists"
                info="+1 (555) 123-4567"
                color="orange.400"
              />
              
              <ContactCard
                icon={FaMapMarkerAlt}
                title="Office Location"
                description="Visit our headquarters for in-person meetings"
                info="San Francisco, CA"
                color="purple.400"
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Contact Form & Info */}
      <Box py={20} bg="black">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={16}>
            <GridItem>
              <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700">
                <CardBody p={8}>
                  <VStack spacing={8} align="stretch">
                    <VStack spacing={4} align="flex-start">
                      <Heading size="lg" color="white">Send Us a Message</Heading>
                      <Text color="gray.400">
                        Fill out the form below and we'll get back to you as soon as possible.
                      </Text>
                    </VStack>

                    <form onSubmit={handleSubmit}>
                      <VStack spacing={6}>
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} w="full">
                          <FormControl isRequired>
                            <FormLabel color="white">Full Name</FormLabel>
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              bg="gray.800"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                              _focus={{ borderColor: 'orange.400' }}
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel color="white">Email Address</FormLabel>
                            <Input
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email"
                              bg="gray.800"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                              _focus={{ borderColor: 'orange.400' }}
                            />
                          </FormControl>
                        </Grid>

                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4} w="full">
                          <FormControl isRequired>
                            <FormLabel color="white">Category</FormLabel>
                            <Select
                              name="category"
                              value={formData.category}
                              onChange={handleInputChange}
                              placeholder="Select category"
                              bg="gray.800"
                              borderColor="gray.600"
                              color="white"
                              _focus={{ borderColor: 'orange.400' }}
                            >
                              <option value="technical">Technical Support</option>
                              <option value="account">Account Issues</option>
                              <option value="trading">Trading Questions</option>
                              <option value="billing">Billing & Payments</option>
                              <option value="partnership">Partnership</option>
                              <option value="other">Other</option>
                            </Select>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel color="white">Subject</FormLabel>
                            <Input
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              placeholder="Brief subject line"
                              bg="gray.800"
                              borderColor="gray.600"
                              color="white"
                              _placeholder={{ color: 'gray.400' }}
                              _focus={{ borderColor: 'orange.400' }}
                            />
                          </FormControl>
                        </Grid>

                        <FormControl isRequired>
                          <FormLabel color="white">Message</FormLabel>
                          <Textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Describe your question or issue in detail..."
                            rows={6}
                            bg="gray.800"
                            borderColor="gray.600"
                            color="white"
                            _placeholder={{ color: 'gray.400' }}
                            _focus={{ borderColor: 'orange.400' }}
                          />
                        </FormControl>

                        <Button
                          type="submit"
                          size="lg"
                          bg="orange.400"
                          color="black"
                          fontWeight="bold"
                          w="full"
                          isLoading={isSubmitting}
                          loadingText="Sending..."
                          _hover={{ 
                            bg: 'orange.300', 
                            transform: 'translateY(-2px)',
                            boxShadow: '0 10px 25px rgba(255, 119, 48, 0.3)'
                          }}
                          transition="all 0.3s ease"
                        >
                          Send Message
                        </Button>
                      </VStack>
                    </form>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <VStack spacing={8}>
                {/* Quick Help */}
                <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700" w="full">
                  <CardBody p={6}>
                    <VStack spacing={6} align="flex-start">
                      <HStack spacing={3}>
                        <Icon as={FaQuestionCircle} boxSize={6} color="blue.400" />
                        <Heading size="md" color="white">Quick Help</Heading>
                      </HStack>
                      
                      <VStack spacing={4} align="flex-start" w="full">
                        <QuickHelpItem
                          title="Trading Issues"
                          description="Problems with orders or trades"
                          time="< 5 min response"
                        />
                        <QuickHelpItem
                          title="Account Access"
                          description="Login or verification problems"
                          time="< 10 min response"
                        />
                        <QuickHelpItem
                          title="Deposit/Withdrawal"
                          description="Transaction-related questions"
                          time="< 15 min response"
                        />
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Office Hours */}
                <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700" w="full">
                  <CardBody p={6}>
                    <VStack spacing={6} align="flex-start">
                      <HStack spacing={3}>
                        <Icon as={FaClock} boxSize={6} color="green.400" />
                        <Heading size="md" color="white">Support Hours</Heading>
                      </HStack>
                      
                      <VStack spacing={3} align="flex-start" w="full">
                        <HStack justify="space-between" w="full">
                          <Text color="gray.300">Live Chat</Text>
                          <Text color="green.400" fontWeight="bold">24/7</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text color="gray.300">Email Support</Text>
                          <Text color="green.400" fontWeight="bold">24/7</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text color="gray.300">Phone Support</Text>
                          <Text color="orange.400" fontWeight="bold">9AM-6PM PST</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Social Media */}
                <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700" w="full">
                  <CardBody p={6}>
                    <VStack spacing={6} align="flex-start">
                      <HStack spacing={3}>
                        <Icon as={FaUsers} boxSize={6} color="purple.400" />
                        <Heading size="md" color="white">Follow Us</Heading>
                      </HStack>
                      
                      <HStack spacing={4} w="full" justify="center">
                        <Icon as={FaTelegram} boxSize={8} color="blue.400" cursor="pointer" 
                          _hover={{ color: 'blue.300', transform: 'scale(1.1)' }} 
                          transition="all 0.2s" 
                        />
                        <Icon as={FaTwitter} boxSize={8} color="blue.400" cursor="pointer" 
                          _hover={{ color: 'blue.300', transform: 'scale(1.1)' }} 
                          transition="all 0.2s" 
                        />
                        <Icon as={FaDiscord} boxSize={8} color="purple.400" cursor="pointer" 
                          _hover={{ color: 'purple.300', transform: 'scale(1.1)' }} 
                          transition="all 0.2s" 
                        />
                        <Icon as={FaLinkedin} boxSize={8} color="blue.600" cursor="pointer" 
                          _hover={{ color: 'blue.500', transform: 'scale(1.1)' }} 
                          transition="all 0.2s" 
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box py={20} bg="gray.950">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" color="white">
                Frequently Asked Questions
              </Heading>
              <Text fontSize="lg" color="gray.400">
                Quick answers to common questions
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <FAQCard
                question="How do I create an account?"
                answer="Click 'Get Started' and follow the simple registration process. You'll need to verify your email address to start trading."
              />
              <FAQCard
                question="What are your trading fees?"
                answer="Our fees start at 0.1% per trade for beginners, with lower rates for higher volume traders. No hidden fees or charges."
              />
              <FAQCard
                question="How long do deposits take?"
                answer="Cryptocurrency deposits are typically processed within 10-30 minutes after network confirmation."
              />
              <FAQCard
                question="Is my money safe?"
                answer="Yes, we use bank-grade security with cold storage, multi-signature wallets, and comprehensive insurance coverage."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

function ContactCard({ icon, title, description, info, color }: {
  icon: any;
  title: string;
  description: string;
  info: string;
  color: string;
}) {
  return (
    <Card
      bg="gray.900"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.700"
      _hover={{
        borderColor: color,
        transform: 'translateY(-4px)',
        boxShadow: `0 15px 30px ${color}20`
      }}
      transition="all 0.3s ease"
    >
      <CardBody p={8} textAlign="center">
        <VStack spacing={6}>
          <Box
            p={4}
            bg={color}
            borderRadius="xl"
          >
            <Icon as={icon} boxSize={6} color="black" />
          </Box>
          <VStack spacing={3}>
            <Text fontSize="xl" fontWeight="bold" color="white">{title}</Text>
            <Text color="gray.400" lineHeight="1.6">{description}</Text>
            <Text color={color} fontWeight="bold">{info}</Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

function QuickHelpItem({ title, description, time }: { title: string; description: string; time: string }) {
  return (
    <VStack align="flex-start" spacing={1} w="full">
      <HStack justify="space-between" w="full">
        <Text fontWeight="bold" color="white" fontSize="sm">{title}</Text>
        <Text color="green.400" fontSize="xs">{time}</Text>
      </HStack>
      <Text color="gray.400" fontSize="sm">{description}</Text>
      <Divider borderColor="gray.700" />
    </VStack>
  );
}

function FAQCard({ question, answer }: { question: string; answer: string }) {
  return (
    <Card bg="gray.900" borderRadius="xl" border="1px solid" borderColor="gray.700">
      <CardBody p={6}>
        <VStack spacing={4} align="flex-start">
          <Text fontSize="lg" fontWeight="bold" color="white">{question}</Text>
          <Text color="gray.400" lineHeight="1.6">{answer}</Text>
        </VStack>
      </CardBody>
    </Card>
  );
}
