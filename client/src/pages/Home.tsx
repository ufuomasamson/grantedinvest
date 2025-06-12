import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Grid,
  GridItem,
  Icon,
  HStack,
  Flex,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Avatar,
  Stack,
  useColorModeValue,
  Link,
  useBreakpointValue,
  Center,
  Divider,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  FaChartLine,
  FaWallet,
  FaShieldAlt,
  FaClock,
  FaUserCheck,
  FaChartBar,
  FaLock,
  FaUserFriends,
  FaTelegram,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
  FaBitcoin,
  FaEthereum,
  FaRocket,
  FaUsers,
  FaGlobe,
  FaMobile,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaCheckCircle,
  FaStar,
  FaPlay
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface CoinPrice {
  price: number;
  change: number;
}

interface PriceData {
  [key: string]: CoinPrice;
}

// Animation styles using CSS strings
const animationStyles = {
  float: "float 6s ease-in-out infinite",
  fadeInUp: "fadeInUp 1s ease-out",
  pulse: "pulse 2s ease-in-out infinite",
  slideInLeft: "slideInLeft 1s ease-out",
  slideInRight: "slideInRight 1s ease-out",
};

// CSS keyframes to be injected
const globalStyles = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

// Real price data from CoinGecko
const useLivePrices = () => {
  const [prices, setPrices] = useState<PriceData>({
    BTC: { price: 0, change: 0 },
    ETH: { price: 0, change: 0 },
    USDT: { price: 0, change: 0 }
  });

  const fetchPrices = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            ids: 'bitcoin,ethereum,tether',
            order: 'market_cap_desc',
            sparkline: false,
            x_cg_demo_api_key: 'CG-AHGNY7QY1vU9tPbHVmtpodDP'
          },
          headers: {
            'x-cg-demo-api-key': 'CG-AHGNY7QY1vU9tPbHVmtpodDP'
          }
        }
      );

      const newPrices: PriceData = {};
      response.data.forEach((coin: any) => {
        const symbol = coin.symbol.toUpperCase();
        if (['BTC', 'ETH', 'USDT'].includes(symbol)) {
          newPrices[symbol] = {
            price: coin.current_price,
            change: coin.price_change_percentage_24h
          };
        }
      });

      setPrices(newPrices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return prices;
};

export function Home() {
  const prices = useLivePrices();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Inject global styles for animations
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = globalStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Box bg="black" minH="100vh">
      {/* Hero Section - Bitfinex Style */}
      <Box
        position="relative"
        overflow="hidden"
        minH="100vh"
        bg="linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 48, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.05) 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1} pt={20}>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center" minH="80vh">
            <GridItem>
              <VStack
                align="flex-start"
                spacing={8}
                animation={animationStyles.slideInLeft}
              >
                <Box>
                  <Text
                    fontSize="sm"
                    color="orange.400"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                    mb={4}
                  >
                    Professional Trading Platform
                  </Text>
                  <Heading
                    size="4xl"
                    color="white"
                    lineHeight="1.1"
                    fontWeight="900"
                    mb={6}
                  >
                    Trade Crypto
                    <Text as="span" color="orange.400"> Like a Pro</Text>
                  </Heading>
                  <Text
                    fontSize="xl"
                    color="gray.300"
                    maxW="500px"
                    lineHeight="1.6"
                  >
                    Advanced trading tools, real-time market data, and institutional-grade security.
                    Join thousands of traders who trust our platform.
                  </Text>
                </Box>

                <HStack spacing={6}>
                  <Button
                    size="lg"
                    bg="orange.400"
                    color="black"
                    fontWeight="bold"
                    px={8}
                    py={6}
                    borderRadius="md"
                    _hover={{
                      bg: 'orange.300',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 25px rgba(255, 119, 48, 0.3)'
                    }}
                    transition="all 0.3s ease"
                    rightIcon={<FaArrowRight />}
                    onClick={() => user ? navigate('/dashboard') : navigate('/register')}
                  >
                    {user ? 'Go to Dashboard' : 'Start Trading'}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    borderColor="gray.600"
                    color="white"
                    fontWeight="bold"
                    px={8}
                    py={6}
                    borderRadius="md"
                    _hover={{
                      borderColor: 'orange.400',
                      color: 'orange.400',
                      transform: 'translateY(-2px)'
                    }}
                    transition="all 0.3s ease"
                    leftIcon={<FaPlay />}
                  >
                    Watch Demo
                  </Button>
                </HStack>

                <HStack spacing={8} pt={4}>
                  <VStack spacing={1} align="flex-start">
                    <Text fontSize="2xl" fontWeight="bold" color="white">$2.4B+</Text>
                    <Text fontSize="sm" color="gray.400">Trading Volume</Text>
                  </VStack>
                  <VStack spacing={1} align="flex-start">
                    <Text fontSize="2xl" fontWeight="bold" color="white">150K+</Text>
                    <Text fontSize="sm" color="gray.400">Active Traders</Text>
                  </VStack>
                  <VStack spacing={1} align="flex-start">
                    <Text fontSize="2xl" fontWeight="bold" color="white">99.9%</Text>
                    <Text fontSize="sm" color="gray.400">Uptime</Text>
                  </VStack>
                </HStack>
              </VStack>
            </GridItem>

            <GridItem>
              <Box
                animation={animationStyles.slideInRight}
                position="relative"
              >
                {/* Floating Trading Card */}
                <Box
                  bg="gray.900"
                  borderRadius="2xl"
                  p={8}
                  border="1px solid"
                  borderColor="gray.700"
                  backdropFilter="blur(20px)"
                  boxShadow="0 25px 50px rgba(0, 0, 0, 0.5)"
                  animation={animationStyles.float}
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: "2xl",
                    background: "linear-gradient(135deg, rgba(255, 119, 48, 0.1) 0%, rgba(120, 119, 198, 0.1) 100%)",
                    zIndex: -1
                  }}
                >
                  <VStack spacing={6}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="lg" fontWeight="bold" color="white">Live Prices</Text>
                      <Badge colorScheme="green" variant="solid">LIVE</Badge>
                    </HStack>

                    <SimpleGrid columns={1} spacing={4} w="full">
                      {Object.entries(prices).map(([coin, data], index) => (
                        <Box
                          key={coin}
                          p={4}
                          bg="gray.800"
                          borderRadius="xl"
                          border="1px solid"
                          borderColor="gray.600"
                          _hover={{
                            borderColor: 'orange.400',
                            transform: 'translateY(-2px)'
                          }}
                          transition="all 0.3s ease"
                          animation={`fadeInUp ${0.5 + index * 0.2}s ease-out`}
                        >
                          <HStack justify="space-between">
                            <HStack spacing={3}>
                              <Icon
                                as={coin === 'BTC' ? FaBitcoin : coin === 'ETH' ? FaEthereum : FaWallet}
                                color={coin === 'BTC' ? 'orange.400' : coin === 'ETH' ? 'blue.400' : 'green.400'}
                                boxSize={6}
                              />
                              <VStack align="flex-start" spacing={0}>
                                <Text fontWeight="bold" color="white">{coin}</Text>
                                <Text fontSize="sm" color="gray.400">
                                  {coin === 'BTC' ? 'Bitcoin' : coin === 'ETH' ? 'Ethereum' : 'Tether'}
                                </Text>
                              </VStack>
                            </HStack>
                            <VStack align="flex-end" spacing={0}>
                              <Text fontSize="lg" fontWeight="bold" color="white">
                                ${data.price > 0 ? data.price.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }) : '...'}
                              </Text>
                              <HStack spacing={1}>
                                <Icon
                                  as={data.change >= 0 ? FaArrowUp : FaArrowDown}
                                  color={data.change >= 0 ? 'green.400' : 'red.400'}
                                  boxSize={3}
                                />
                                <Text
                                  fontSize="sm"
                                  color={data.change >= 0 ? 'green.400' : 'red.400'}
                                  fontWeight="bold"
                                >
                                  {data.change > 0 ? '+' : ''}{data.change.toFixed(2)}%
                                </Text>
                              </HStack>
                            </VStack>
                          </HStack>
                        </Box>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </Box>

                {/* Floating Elements */}
                <Box
                  position="absolute"
                  top="-20px"
                  right="-20px"
                  w="40px"
                  h="40px"
                  bg="orange.400"
                  borderRadius="full"
                  animation={animationStyles.pulse}
                  opacity={0.7}
                />
                <Box
                  position="absolute"
                  bottom="-30px"
                  left="-30px"
                  w="60px"
                  h="60px"
                  bg="blue.400"
                  borderRadius="full"
                  animation="pulse 3s ease-in-out infinite"
                  opacity={0.5}
                />
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Features Section - Bitfinex Style */}
      <Box py={20} bg="gray.950" position="relative">
        <Container maxW="container.xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center" animation={animationStyles.fadeInUp}>
              <Text
                fontSize="sm"
                color="orange.400"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Why Choose Us
              </Text>
              <Heading size="2xl" color="white" maxW="600px">
                Professional Trading Tools for Every Trader
              </Heading>
              <Text fontSize="lg" color="gray.400" maxW="700px">
                Experience institutional-grade trading with advanced features,
                real-time data, and unmatched security.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              <FeatureCard
                icon={FaChartLine}
                title="Advanced Trading"
                description="Professional charts, real-time data, and advanced order types for precise trading execution."
                delay="0.2s"
              />
              <FeatureCard
                icon={FaShieldAlt}
                title="Bank-Grade Security"
                description="Multi-layer security with cold storage, 2FA, and insurance protection for your digital assets."
                delay="0.4s"
              />
              <FeatureCard
                icon={FaRocket}
                title="Lightning Fast"
                description="Ultra-low latency trading engine with 99.9% uptime and instant order execution."
                delay="0.6s"
              />
              <FeatureCard
                icon={FaWallet}
                title="Multi-Asset Support"
                description="Trade 100+ cryptocurrencies with deep liquidity and competitive spreads."
                delay="0.8s"
              />
              <FeatureCard
                icon={FaMobile}
                title="Mobile Trading"
                description="Trade on-the-go with our award-winning mobile app for iOS and Android."
                delay="1.0s"
              />
              <FeatureCard
                icon={FaUsers}
                title="24/7 Support"
                description="Expert support team available around the clock to assist with your trading needs."
                delay="1.2s"
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Trading Platform Preview */}
      <Box py={20} bg="black" position="relative">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={16} alignItems="center">
            <GridItem order={{ base: 2, lg: 1 }}>
              <Box
                bg="gray.900"
                borderRadius="2xl"
                p={8}
                border="1px solid"
                borderColor="gray.700"
                animation={animationStyles.slideInLeft}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(135deg, rgba(255, 119, 48, 0.05) 0%, rgba(120, 119, 198, 0.05) 100%)",
                  zIndex: 0
                }}
              >
                <VStack spacing={6} position="relative" zIndex={1}>
                  <HStack justify="space-between" w="full">
                    <Text fontSize="lg" fontWeight="bold" color="white">Trading Dashboard</Text>
                    <Badge colorScheme="green" variant="solid">LIVE</Badge>
                  </HStack>

                  <SimpleGrid columns={2} spacing={4} w="full">
                    <Box p={4} bg="gray.800" borderRadius="lg">
                      <Text fontSize="sm" color="gray.400">Portfolio Value</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="white">$124,567</Text>
                      <Text fontSize="sm" color="green.400">+12.5% (24h)</Text>
                    </Box>
                    <Box p={4} bg="gray.800" borderRadius="lg">
                      <Text fontSize="sm" color="gray.400">Active Trades</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="white">8</Text>
                      <Text fontSize="sm" color="blue.400">3 Pending</Text>
                    </Box>
                  </SimpleGrid>

                  <Box w="full" p={4} bg="gray.800" borderRadius="lg">
                    <Text fontSize="sm" color="gray.400" mb={3}>Recent Trades</Text>
                    <VStack spacing={2}>
                      <HStack justify="space-between" w="full">
                        <HStack>
                          <Icon as={FaBitcoin} color="orange.400" />
                          <Text color="white" fontSize="sm">BTC/USDT</Text>
                        </HStack>
                        <Text color="green.400" fontSize="sm">+2.34%</Text>
                      </HStack>
                      <HStack justify="space-between" w="full">
                        <HStack>
                          <Icon as={FaEthereum} color="blue.400" />
                          <Text color="white" fontSize="sm">ETH/USDT</Text>
                        </HStack>
                        <Text color="red.400" fontSize="sm">-1.12%</Text>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </GridItem>

            <GridItem order={{ base: 1, lg: 2 }}>
              <VStack
                align="flex-start"
                spacing={8}
                animation={animationStyles.slideInRight}
              >
                <VStack align="flex-start" spacing={4}>
                  <Text
                    fontSize="sm"
                    color="orange.400"
                    fontWeight="bold"
                    textTransform="uppercase"
                    letterSpacing="wider"
                  >
                    Professional Platform
                  </Text>
                  <Heading size="2xl" color="white">
                    Trade with Confidence
                  </Heading>
                  <Text fontSize="lg" color="gray.400" lineHeight="1.6">
                    Our advanced trading platform provides real-time market data,
                    professional charting tools, and lightning-fast execution to help
                    you make informed trading decisions.
                  </Text>
                </VStack>

                <VStack align="flex-start" spacing={4}>
                  <HStack spacing={3}>
                    <Icon as={FaCheckCircle} color="green.400" />
                    <Text color="white">Real-time market data and charts</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={FaCheckCircle} color="green.400" />
                    <Text color="white">Advanced order types and tools</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={FaCheckCircle} color="green.400" />
                    <Text color="white">Portfolio management and analytics</Text>
                  </HStack>
                  <HStack spacing={3}>
                    <Icon as={FaCheckCircle} color="green.400" />
                    <Text color="white">Mobile and desktop applications</Text>
                  </HStack>
                </VStack>

                <Button
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
                  rightIcon={<FaArrowRight />}
                  onClick={() => user ? navigate('/dashboard') : navigate('/register')}
                >
                  {user ? 'Open Dashboard' : 'Start Trading Now'}
                </Button>
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Box py={20} bg="gray.900">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading size="xl" textAlign="center" color="white">
              Why Thousands Trust Our Platform
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              <FeatureCard
                icon={FaUserCheck}
                title="Admin-Verified Deposits"
                description="No automation. Every deposit is manually verified for accuracy."
              />
              <FeatureCard
                icon={FaChartLine}
                title="True Market Pricing"
                description="We use only live, unmodified pricing from trusted sources like CoinGecko."
              />
              <FeatureCard
                icon={FaShieldAlt}
                title="Fast, Secure Withdrawals"
                description="Manual approval process ensures your funds are never compromised."
              />
              <FeatureCard
                icon={FaUserFriends}
                title="User-Friendly Interface"
                description="Designed for both first-time and pro traders. Simple, clean, powerful."
              />
              <FeatureCard
                icon={FaLock}
                title="100% Control"
                description="You deposit, trade, and withdraw — with no third-party custody in between."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box py={20} bg="black">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading size="xl" textAlign="center" color="white">
              3 Simple Steps to Start Trading
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <StepCard
                number={1}
                title="Create Your Account"
                description="Sign up securely in minutes and verify your email."
              />
              <StepCard
                number={2}
                title="Deposit Your Crypto"
                description="Send BTC or USDT to our wallet and upload payment proof."
              />
              <StepCard
                number={3}
                title="Start Trading"
                description="Access live spot prices, make trades, and monitor your earnings in real time."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box py={20} bg="gray.900">
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading size="xl" textAlign="center" color="white">
              What Our Users Are Saying
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <TestimonialCard
                name="Tunde B."
                text="Deposit approved within minutes. The P&L tracking is amazing!"
              />
              <TestimonialCard
                name="Ada J."
                text="Finally, a crypto platform I actually understand."
              />
              <TestimonialCard
                name="James L."
                text="The manual process gives me more trust than auto systems ever did."
              />
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section - Bitfinex Style */}
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
            radial-gradient(circle at 30% 40%, rgba(255, 119, 48, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(120, 119, 198, 0.1) 0%, transparent 50%)
          `,
          zIndex: 0
        }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={12} textAlign="center">
            <VStack spacing={6} animation={animationStyles.fadeInUp}>
              <Text
                fontSize="sm"
                color="orange.400"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Start Your Journey
              </Text>
              <Heading size="3xl" color="white" maxW="800px">
                Ready to Trade Like a Professional?
              </Heading>
              <Text fontSize="xl" color="gray.400" maxW="600px" lineHeight="1.6">
                Join thousands of traders who trust our platform for secure,
                professional cryptocurrency trading.
              </Text>
            </VStack>

            <HStack spacing={6} animation="fadeInUp 1s ease-out 0.3s">
              <Button
                size="xl"
                bg="orange.400"
                color="black"
                fontWeight="bold"
                px={12}
                py={8}
                fontSize="lg"
                borderRadius="md"
                _hover={{
                  bg: 'orange.300',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 35px rgba(255, 119, 48, 0.4)'
                }}
                transition="all 0.3s ease"
                rightIcon={<FaArrowRight />}
                onClick={() => user ? navigate('/dashboard') : navigate('/register')}
              >
                {user ? 'Go to Dashboard' : 'Start Trading Now'}
              </Button>
              <Button
                size="xl"
                variant="outline"
                borderColor="gray.600"
                color="white"
                fontWeight="bold"
                px={12}
                py={8}
                fontSize="lg"
                borderRadius="md"
                _hover={{
                  borderColor: 'orange.400',
                  color: 'orange.400',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 35px rgba(255, 119, 48, 0.2)'
                }}
                transition="all 0.3s ease"
                leftIcon={<FaPlay />}
              >
                Watch Demo
              </Button>
            </HStack>

            <HStack
              spacing={12}
              pt={8}
              animation="fadeInUp 1s ease-out 0.6s"
            >
              <VStack spacing={2}>
                <HStack spacing={2}>
                  {[...Array(5)].map((_, i) => (
                    <Icon key={i} as={FaStar} color="orange.400" boxSize={5} />
                  ))}
                </HStack>
                <Text color="gray.400" fontSize="sm">Trusted by 150K+ traders</Text>
              </VStack>
              <Divider orientation="vertical" h="40px" borderColor="gray.600" />
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="white">$2.4B+</Text>
                <Text color="gray.400" fontSize="sm">Trading volume</Text>
              </VStack>
              <Divider orientation="vertical" h="40px" borderColor="gray.600" />
              <VStack spacing={2}>
                <Text fontSize="2xl" fontWeight="bold" color="white">99.9%</Text>
                <Text color="gray.400" fontSize="sm">Uptime guarantee</Text>
              </VStack>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer */}
      <Box py={12} bg="gray.900" borderTop="1px" borderColor="gray.800">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={8}>
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Text fontSize="lg" fontWeight="bold" color="white">Navigation</Text>
                <Link as={RouterLink} to="/" color="gray.300">Home</Link>
                <Link as={RouterLink} to="/about" color="gray.300">About</Link>
                <Link as={RouterLink} to="/services" color="gray.300">Services</Link>
                <Link as={RouterLink} to="/contact" color="gray.300">Contact</Link>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Text fontSize="lg" fontWeight="bold" color="white">Contact</Text>
                <Text color="gray.300">California, USA</Text>
                <Text color="gray.300">info@ginvestment.com</Text>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Text fontSize="lg" fontWeight="bold" color="white">Social</Text>
                <HStack spacing={4} color="gray.300">
                  <Icon as={FaTelegram} boxSize={6} cursor="pointer" />
                  <Icon as={FaInstagram} boxSize={6} cursor="pointer" />
                  <Icon as={FaTwitter} boxSize={6} cursor="pointer" />
                  <Icon as={FaWhatsapp} boxSize={6} cursor="pointer" />
                </HStack>
              </VStack>
            </GridItem>
            <GridItem>
              <VStack align="flex-start" spacing={4}>
                <Text fontSize="lg" fontWeight="bold" color="white">Security</Text>
                <Text color="gray.300">
                  Your data and funds are protected with the highest standards.
                </Text>
              </VStack>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}



function FeatureCard({ icon, title, description, delay = "0s" }: {
  icon: any;
  title: string;
  description: string;
  delay?: string;
}) {
  return (
    <Card
      bg="gray.900"
      borderRadius="2xl"
      border="1px solid"
      borderColor="gray.700"
      _hover={{
        borderColor: 'orange.400',
        transform: 'translateY(-8px)',
        boxShadow: '0 20px 40px rgba(255, 119, 48, 0.1)'
      }}
      transition="all 0.3s ease"
      animation={`fadeInUp 1s ease-out ${delay}`}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(135deg, rgba(255, 119, 48, 0.02) 0%, rgba(120, 119, 198, 0.02) 100%)",
        zIndex: 0
      }}
    >
      <CardBody p={8} position="relative" zIndex={1}>
        <VStack spacing={6} align="flex-start">
          <Box
            p={4}
            bg="orange.400"
            borderRadius="xl"
            animation={animationStyles.pulse}
          >
            <Icon as={icon} boxSize={8} color="black" />
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

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Card bg="whiteAlpha.100" borderRadius="xl">
      <CardBody>
        <VStack spacing={4}>
          <Box
            w={12}
            h={12}
            borderRadius="full"
            bg="orange.400"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="2xl"
            fontWeight="bold"
          >
            {number}
          </Box>
          <Text fontSize="xl" fontWeight="bold" color="white">
            {title}
          </Text>
          <Text color="gray.300" textAlign="center">
            {description}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
}

function TestimonialCard({ name, text }: { name: string; text: string }) {
  return (
    <Card bg="whiteAlpha.100" borderRadius="xl">
      <CardBody>
        <VStack spacing={4}>
          <Text fontSize="lg" color="gray.300" fontStyle="italic">
            "{text}"
          </Text>
          <HStack>
            <Avatar size="sm" name={name} bg="orange.400" />
            <Text color="white" fontWeight="bold">
              {name}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
} 