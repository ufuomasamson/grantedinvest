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
  Badge,
  Button,
  List,
  ListItem,
  ListIcon,
  Divider,
} from '@chakra-ui/react';
import {
  FaChartLine,
  FaWallet,
  FaShieldAlt,
  FaMobile,
  FaRobot,
  FaGraduationCap,
  FaHeadset,
  FaArrowRight,
  FaCheckCircle,
  FaBitcoin,
  FaEthereum,
  FaExchangeAlt,
  FaLock,
  FaClock,
  FaUsers,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

export function Services() {
  return (
    <Box bg="black" minH="100vh">
      {/* Hero Section */}
      <Box
        py={{ base: 12, md: 20 }}
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
            radial-gradient(circle at 30% 40%, rgba(255, 119, 48, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1} px={{ base: 4, md: 8 }}>
          <VStack spacing={8} textAlign="center">
            <VStack spacing={4}>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color="orange.400"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Our Services
              </Text>
              <Heading size={{ base: "xl", md: "2xl", lg: "3xl" }} color="white" maxW="800px">
                Professional Trading Solutions for Every Need
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} color="gray.400" maxW="700px" lineHeight="1.6">
                From beginner-friendly tools to advanced trading features, we provide
                everything you need to succeed in cryptocurrency markets.
              </Text>
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Core Trading Services */}
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
                Core Services
              </Text>
              <Heading size="2xl" color="white">
                Everything You Need to Trade Successfully
              </Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              <ServiceCard
                icon={FaChartLine}
                title="Spot Trading"
                description="Trade cryptocurrencies instantly with real-time market prices and deep liquidity."
                features={[
                  "Real-time price feeds",
                  "Advanced order types",
                  "Low trading fees",
                  "High liquidity"
                ]}
                badge="Most Popular"
              />
              
              <ServiceCard
                icon={FaWallet}
                title="Secure Wallet"
                description="Multi-signature wallets with cold storage protection for maximum security."
                features={[
                  "Multi-signature security",
                  "Cold storage protection",
                  "Instant deposits",
                  "Fast withdrawals"
                ]}
              />
              
              <ServiceCard
                icon={FaRobot}
                title="Trading Bots"
                description="Automated trading strategies to help you trade 24/7 without missing opportunities."
                features={[
                  "Pre-built strategies",
                  "Custom bot creation",
                  "Backtesting tools",
                  "Risk management"
                ]}
                badge="Coming Soon"
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Advanced Features */}
      <Box py={20} bg="black">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
            <GridItem>
              <VStack align="flex-start" spacing={8}>
                <VStack align="flex-start" spacing={4}>
                  <Text 
                    fontSize="sm" 
                    color="orange.400" 
                    fontWeight="bold" 
                    textTransform="uppercase" 
                    letterSpacing="wider"
                  >
                    Advanced Features
                  </Text>
                  <Heading size="2xl" color="white">
                    Professional Tools for Serious Traders
                  </Heading>
                  <Text fontSize="lg" color="gray.400" lineHeight="1.6">
                    Access institutional-grade trading tools and features designed 
                    for professional traders and advanced users.
                  </Text>
                </VStack>

                <VStack align="flex-start" spacing={4}>
                  <FeatureItem
                    icon={FaChartLine}
                    title="Advanced Charting"
                    description="Professional TradingView charts with 100+ indicators"
                  />
                  <FeatureItem
                    icon={FaExchangeAlt}
                    title="Order Types"
                    description="Market, limit, stop-loss, and advanced order types"
                  />
                  <FeatureItem
                    icon={FaLock}
                    title="Portfolio Management"
                    description="Track performance, analyze profits, and manage risk"
                  />
                  <FeatureItem
                    icon={FaClock}
                    title="Real-time Data"
                    description="Live market data with millisecond precision"
                  />
                </VStack>

                <Button
                  as={RouterLink}
                  to="/register"
                  size="lg"
                  bg="orange.400"
                  color="black"
                  fontWeight="bold"
                  px={8}
                  rightIcon={<FaArrowRight />}
                  _hover={{ 
                    bg: 'orange.300', 
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 25px rgba(255, 119, 48, 0.3)'
                  }}
                  transition="all 0.3s ease"
                >
                  Start Trading Now
                </Button>
              </VStack>
            </GridItem>

            <GridItem>
              <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700">
                <CardBody p={8}>
                  <VStack spacing={6}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="lg" fontWeight="bold" color="white">Supported Assets</Text>
                      <Badge colorScheme="green" variant="solid">100+</Badge>
                    </HStack>
                    
                    <SimpleGrid columns={2} spacing={4} w="full">
                      <AssetCard icon={FaBitcoin} name="Bitcoin" symbol="BTC" color="orange.400" />
                      <AssetCard icon={FaEthereum} name="Ethereum" symbol="ETH" color="blue.400" />
                      <AssetCard icon={FaWallet} name="Tether" symbol="USDT" color="green.400" />
                      <AssetCard icon={FaWallet} name="BNB" symbol="BNB" color="yellow.400" />
                    </SimpleGrid>

                    <Divider borderColor="gray.600" />

                    <VStack spacing={4} w="full">
                      <Text fontSize="md" fontWeight="bold" color="white">Trading Pairs</Text>
                      <SimpleGrid columns={1} spacing={2} w="full">
                        <TradingPair pair="BTC/USDT" volume="$2.4M" change="+2.34%" />
                        <TradingPair pair="ETH/USDT" volume="$1.8M" change="-1.12%" />
                        <TradingPair pair="BNB/USDT" volume="$890K" change="+5.67%" />
                      </SimpleGrid>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Support Services */}
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
                Support & Education
              </Text>
              <Heading size="2xl" color="white">
                We're Here to Help You Succeed
              </Heading>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              <SupportCard
                icon={FaHeadset}
                title="24/7 Customer Support"
                description="Get help whenever you need it with our round-the-clock support team."
                features={[
                  "Live chat support",
                  "Email assistance",
                  "Phone support",
                  "Priority support for VIP"
                ]}
              />
              
              <SupportCard
                icon={FaGraduationCap}
                title="Trading Academy"
                description="Learn cryptocurrency trading with our comprehensive educational resources."
                features={[
                  "Video tutorials",
                  "Trading guides",
                  "Market analysis",
                  "Webinars & workshops"
                ]}
              />
              
              <SupportCard
                icon={FaUsers}
                title="Community"
                description="Join our active trading community and learn from experienced traders."
                features={[
                  "Trading discussions",
                  "Market insights",
                  "Strategy sharing",
                  "Expert analysis"
                ]}
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Pricing Plans */}
      <Box py={20} bg="black">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading size="2xl" color="white">
                Simple, Transparent Pricing
              </Heading>
              <Text fontSize="lg" color="gray.400">
                No hidden fees, no surprises. Just competitive rates for everyone.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <PricingCard
                title="Starter"
                price="0.1%"
                description="Perfect for beginners"
                features={[
                  "Spot trading",
                  "Basic charts",
                  "Email support",
                  "Mobile app access"
                ]}
                isPopular={false}
              />
              
              <PricingCard
                title="Professional"
                price="0.075%"
                description="For active traders"
                features={[
                  "All Starter features",
                  "Advanced charts",
                  "Priority support",
                  "API access"
                ]}
                isPopular={true}
              />
              
              <PricingCard
                title="VIP"
                price="0.05%"
                description="For high-volume traders"
                features={[
                  "All Professional features",
                  "Dedicated support",
                  "Custom solutions",
                  "Institutional tools"
                ]}
                isPopular={false}
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
              Ready to Experience Professional Trading?
            </Heading>
            <Text fontSize="lg" color="gray.400" maxW="600px">
              Join thousands of traders who trust our platform for secure, professional cryptocurrency trading.
            </Text>
            <HStack spacing={4}>
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
                Get Started Free
              </Button>
              <Button
                as={RouterLink}
                to="/contact"
                size="lg"
                variant="outline"
                borderColor="gray.600"
                color="white"
                fontWeight="bold"
                px={8}
                _hover={{ 
                  borderColor: 'orange.400',
                  color: 'orange.400',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.3s ease"
              >
                Contact Sales
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}

function ServiceCard({ icon, title, description, features, badge }: {
  icon: any;
  title: string;
  description: string;
  features: string[];
  badge?: string;
}) {
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
      position="relative"
    >
      {badge && (
        <Badge
          position="absolute"
          top={4}
          right={4}
          colorScheme="orange"
          variant="solid"
          borderRadius="full"
          px={3}
          py={1}
        >
          {badge}
        </Badge>
      )}
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
          <List spacing={2} w="full">
            {features.map((feature, index) => (
              <ListItem key={index} color="gray.300">
                <ListIcon as={FaCheckCircle} color="green.400" />
                {feature}
              </ListItem>
            ))}
          </List>
        </VStack>
      </CardBody>
    </Card>
  );
}

function FeatureItem({ icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <HStack spacing={4} align="flex-start">
      <Icon as={icon} boxSize={6} color="orange.400" mt={1} />
      <VStack align="flex-start" spacing={1}>
        <Text fontWeight="bold" color="white">{title}</Text>
        <Text color="gray.400" fontSize="sm">{description}</Text>
      </VStack>
    </HStack>
  );
}

function AssetCard({ icon, name, symbol, color }: { icon: any; name: string; symbol: string; color: string }) {
  return (
    <HStack spacing={3} p={3} bg="gray.800" borderRadius="lg">
      <Icon as={icon} boxSize={6} color={color} />
      <VStack align="flex-start" spacing={0}>
        <Text fontSize="sm" fontWeight="bold" color="white">{symbol}</Text>
        <Text fontSize="xs" color="gray.400">{name}</Text>
      </VStack>
    </HStack>
  );
}

function TradingPair({ pair, volume, change }: { pair: string; volume: string; change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <HStack justify="space-between" p={2} bg="gray.800" borderRadius="md">
      <Text fontSize="sm" fontWeight="bold" color="white">{pair}</Text>
      <VStack align="flex-end" spacing={0}>
        <Text fontSize="xs" color="gray.400">{volume}</Text>
        <Text fontSize="xs" color={isPositive ? 'green.400' : 'red.400'}>{change}</Text>
      </VStack>
    </HStack>
  );
}

function SupportCard({ icon, title, description, features }: {
  icon: any;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <Card bg="gray.900" borderRadius="2xl" border="1px solid" borderColor="gray.700">
      <CardBody p={8}>
        <VStack spacing={6} align="flex-start">
          <Icon as={icon} boxSize={8} color="blue.400" />
          <VStack align="flex-start" spacing={3}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              {title}
            </Text>
            <Text color="gray.400" lineHeight="1.6">
              {description}
            </Text>
          </VStack>
          <List spacing={2} w="full">
            {features.map((feature, index) => (
              <ListItem key={index} color="gray.300">
                <ListIcon as={FaCheckCircle} color="green.400" />
                {feature}
              </ListItem>
            ))}
          </List>
        </VStack>
      </CardBody>
    </Card>
  );
}

function PricingCard({ title, price, description, features, isPopular }: {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular: boolean;
}) {
  return (
    <Card
      bg="gray.900"
      borderRadius="2xl"
      border="2px solid"
      borderColor={isPopular ? "orange.400" : "gray.700"}
      position="relative"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: isPopular ? '0 20px 40px rgba(255, 119, 48, 0.2)' : '0 15px 30px rgba(0, 0, 0, 0.3)'
      }}
      transition="all 0.3s ease"
    >
      {isPopular && (
        <Badge
          position="absolute"
          top={-3}
          left="50%"
          transform="translateX(-50%)"
          colorScheme="orange"
          variant="solid"
          borderRadius="full"
          px={4}
          py={1}
        >
          Most Popular
        </Badge>
      )}
      <CardBody p={8}>
        <VStack spacing={6} align="flex-start">
          <VStack align="flex-start" spacing={2}>
            <Text fontSize="2xl" fontWeight="bold" color="white">{title}</Text>
            <Text color="gray.400">{description}</Text>
          </VStack>
          <HStack align="baseline">
            <Text fontSize="4xl" fontWeight="bold" color="white">{price}</Text>
            <Text color="gray.400">per trade</Text>
          </HStack>
          <List spacing={3} w="full">
            {features.map((feature, index) => (
              <ListItem key={index} color="gray.300">
                <ListIcon as={FaCheckCircle} color="green.400" />
                {feature}
              </ListItem>
            ))}
          </List>
          <Button
            as={RouterLink}
            to="/register"
            w="full"
            size="lg"
            bg={isPopular ? "orange.400" : "gray.700"}
            color={isPopular ? "black" : "white"}
            fontWeight="bold"
            _hover={{
              bg: isPopular ? "orange.300" : "gray.600",
              transform: 'translateY(-2px)'
            }}
            transition="all 0.3s ease"
          >
            Get Started
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
}
