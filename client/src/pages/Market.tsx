import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Text,
  Heading,
  HStack,
  VStack,
  Badge,
  Spinner,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import axios from 'axios';

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export function Market() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  const fetchCoins = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 50,
            page: 1,
            sparkline: false,
            x_cg_demo_api_key: 'CG-AHGNY7QY1vU9tPbHVmtpodDP'
          },
          headers: {
            'x-cg-demo-api-key': 'CG-AHGNY7QY1vU9tPbHVmtpodDP'
          }
        }
      );
      setCoins(response.data);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error fetching data',
        description: 'Unable to load cryptocurrency data. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredCoins = coins.filter(coin =>
    coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  return (
    <Box minH="100vh" bg="black" py={{ base: 4, md: 8 }}>
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          <Heading size={{ base: "lg", md: "xl" }} color="white">Cryptocurrency Market</Heading>
          
          <Card bg="gray.900" borderRadius="xl" p={4}>
            <CardBody>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="orange.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by name or symbol"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="gray.800"
                  border="1px"
                  borderColor="gray.700"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{ borderColor: "orange.400", boxShadow: "0 0 0 1px var(--chakra-colors-orange-400)" }}
                  color="white"
                  size="lg"
                />
              </InputGroup>
            </CardBody>
          </Card>

          {loading ? (
            <Box textAlign="center" py={10}>
              <Spinner size="xl" color="orange.400" />
            </Box>
          ) : (
            <Card bg="gray.900" borderRadius="xl" overflow="hidden">
              <CardBody p={0}>
                <Box overflowX="auto">
                  <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead bg="gray.800">
                      <Tr>
                        <Th color="gray.400">Asset</Th>
                        <Th color="gray.400" isNumeric>Price</Th>
                        <Th color="gray.400" isNumeric display={{ base: "none", md: "table-cell" }}>24h Change</Th>
                        <Th color="gray.400" isNumeric display={{ base: "none", lg: "table-cell" }}>Market Cap</Th>
                        <Th color="gray.400" isNumeric display={{ base: "none", lg: "table-cell" }}>Volume (24h)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredCoins.map((coin) => (
                        <Tr 
                          key={coin.id}
                          _hover={{ bg: "gray.800" }}
                          transition="background-color 0.2s"
                        >
                          <Td>
                            <HStack spacing={{ base: 2, md: 3 }}>
                              <Image
                                src={coin.image}
                                alt={coin.name}
                                boxSize={{ base: "24px", md: "32px" }}
                                borderRadius="full"
                              />
                              <Box>
                                <Text color="white" fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>
                                  {coin.name}
                                </Text>
                                <Text color="gray.400" fontSize={{ base: "xs", md: "sm" }}>
                                  {coin.symbol.toUpperCase()}
                                </Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td isNumeric color="white" fontSize={{ base: "sm", md: "md" }}>
                            <VStack spacing={0} align="flex-end">
                              <Text>${coin.current_price.toLocaleString()}</Text>
                              <Badge
                                colorScheme={coin.price_change_percentage_24h >= 0 ? "green" : "red"}
                                px={1}
                                py={0}
                                borderRadius="md"
                                fontSize="xs"
                                display={{ base: "block", md: "none" }}
                              >
                                {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                                {coin.price_change_percentage_24h.toFixed(2)}%
                              </Badge>
                            </VStack>
                          </Td>
                          <Td isNumeric display={{ base: "none", md: "table-cell" }}>
                            <Badge
                              colorScheme={coin.price_change_percentage_24h >= 0 ? "green" : "red"}
                              px={2}
                              py={1}
                              borderRadius="md"
                            >
                              {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                              {coin.price_change_percentage_24h.toFixed(2)}%
                            </Badge>
                          </Td>
                          <Td isNumeric color="white" display={{ base: "none", lg: "table-cell" }}>
                            {formatNumber(coin.market_cap)}
                          </Td>
                          <Td isNumeric color="white" display={{ base: "none", lg: "table-cell" }}>
                            {formatNumber(coin.total_volume)}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
} 