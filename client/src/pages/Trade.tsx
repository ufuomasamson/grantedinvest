import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PriceData {
  price: number;
  change: number;
}

interface CryptoPair {
  id: string;
  symbol: string;
  name: string;
  pair: string;
  coingeckoId: string;
  icon: string;
}

const CRYPTO_PAIRS: CryptoPair[] = [
  { id: 'btc', symbol: 'BTC', name: 'Bitcoin', pair: 'USDT/BTC', coingeckoId: 'bitcoin', icon: '₿' },
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', pair: 'USDT/ETH', coingeckoId: 'ethereum', icon: 'Ξ' },
  { id: 'bnb', symbol: 'BNB', name: 'Binance Coin', pair: 'USDT/BNB', coingeckoId: 'binancecoin', icon: '🔶' },
  { id: 'ada', symbol: 'ADA', name: 'Cardano', pair: 'USDT/ADA', coingeckoId: 'cardano', icon: '₳' },
  { id: 'sol', symbol: 'SOL', name: 'Solana', pair: 'USDT/SOL', coingeckoId: 'solana', icon: '◎' },
  { id: 'xrp', symbol: 'XRP', name: 'Ripple', pair: 'USDT/XRP', coingeckoId: 'ripple', icon: '✕' },
  { id: 'dot', symbol: 'DOT', name: 'Polkadot', pair: 'USDT/DOT', coingeckoId: 'polkadot', icon: '●' },
  { id: 'doge', symbol: 'DOGE', name: 'Dogecoin', pair: 'USDT/DOGE', coingeckoId: 'dogecoin', icon: 'Ð' },
  { id: 'avax', symbol: 'AVAX', name: 'Avalanche', pair: 'USDT/AVAX', coingeckoId: 'avalanche-2', icon: '🔺' },
  { id: 'matic', symbol: 'MATIC', name: 'Polygon', pair: 'USDT/MATIC', coingeckoId: 'matic-network', icon: '⬟' },
  { id: 'link', symbol: 'LINK', name: 'Chainlink', pair: 'USDT/LINK', coingeckoId: 'chainlink', icon: '🔗' },
];

export function Trade() {
  const [activeTab, setActiveTab] = useState(0);
  const [amount, setAmount] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [selectedPair, setSelectedPair] = useState<CryptoPair>(CRYPTO_PAIRS[0]);
  const [priceData, setPriceData] = useState<Record<string, PriceData>>({});
  const [btcPrice, setBtcPrice] = useState<PriceData>({ price: 0, change: 0 }); // Keep for backward compatibility
  const [userBalance, setUserBalance] = useState<number>(0);
  const [cryptoHoldings, setCryptoHoldings] = useState<Record<string, number>>({});
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  // Fetch user balance and crypto holdings
  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
  

      // Fetch user balance from user_balances table
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (balanceError) {
        console.error('Error fetching user balance:', balanceError);
      } else {
        setUserBalance(balanceData?.balance || 0);

      }

      // Fetch user's crypto holdings (from trades table)
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tradesError) {
        console.error('Error fetching trades:', tradesError);
      } else {
        // Calculate crypto holdings from trades (now supports all cryptocurrencies)
        const holdings: Record<string, number> = {};

        tradesData?.forEach(trade => {
          const symbol = trade.symbol || 'btc'; // Use trade symbol, fallback to btc for old trades
          if (!holdings[symbol]) holdings[symbol] = 0;

          if (trade.type === 'buy') {
            holdings[symbol] += trade.amount || 0;
          } else if (trade.type === 'sell') {
            holdings[symbol] -= trade.amount || 0;
          }
        });

        setCryptoHoldings(holdings);
        setRecentTrades(tradesData?.slice(0, 5) || []);
        console.log('Crypto holdings:', holdings);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchPrices = async () => {
      try {
        // Fetch all crypto prices in one API call
        const coinIds = CRYPTO_PAIRS.map(pair => pair.coingeckoId).join(',');
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/simple/price',
          {
            params: {
              ids: coinIds,
              vs_currencies: 'usd',
              include_24hr_change: true,
            },
          }
        );

        if (!mounted) return;

        // Transform the response into our price data format
        const newPriceData: Record<string, PriceData> = {};
        CRYPTO_PAIRS.forEach(pair => {
          const coinData = response.data[pair.coingeckoId];
          if (coinData) {
            newPriceData[pair.id] = {
              price: coinData.usd,
              change: coinData.usd_24h_change || 0,
            };
          }
        });

        setPriceData(newPriceData);

        // Keep backward compatibility for BTC
        if (newPriceData.btc) {
          setBtcPrice(newPriceData.btc);
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        if (mounted) {
          toast({
            title: 'Error',
            description: 'Failed to fetch cryptocurrency prices. Please refresh the page.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [toast]);

  // Fetch user data when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
  }, [user?.id]);

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0 || !user?.id) return;

    const tradeAmount = parseFloat(amount);
    const currentPrice = priceData[selectedPair.id]?.price || 0;
    const totalValue = tradeAmount * currentPrice;
    const tradeFee = totalValue * 0.001; // 0.1% trading fee
    const netTotal = totalValue + tradeFee;

    // Validate trade
    if (activeTab === 0) { // Buy order
      if (userBalance < netTotal) {
        toast({
          title: 'Insufficient Balance',
          description: `You need $${netTotal.toFixed(2)} USDT to complete this trade (including $${tradeFee.toFixed(2)} fee). Your balance: $${userBalance.toFixed(2)}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    } else { // Sell order
      const currentHolding = cryptoHoldings[selectedPair.id] || 0;
      if (currentHolding < tradeAmount) {
        toast({
          title: 'Insufficient Holdings',
          description: `You only have ${currentHolding.toFixed(6)} ${selectedPair.symbol}. Cannot sell ${tradeAmount} ${selectedPair.symbol}.`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {


      // Save trade to database
      const { data: tradeResult, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          type: activeTab === 0 ? 'buy' : 'sell',
          symbol: selectedPair.id,
          amount: tradeAmount,
          price: currentPrice,
          total: totalValue,
          fee: tradeFee
        })
        .select()
        .single();

      if (tradeError) {
        console.error('Error saving trade:', tradeError);
        throw new Error(`Failed to save trade: ${tradeError.message}`);
      }

      // Update user balance
      let newBalance = userBalance;
      if (activeTab === 0) { // Buy - deduct USDT
        newBalance = userBalance - netTotal;
      } else { // Sell - add USDT
        newBalance = userBalance + (totalValue - tradeFee);
      }

      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (balanceError) {
        console.error('Error updating balance:', balanceError);
        throw new Error('Failed to update balance');
      }

      // Update local state
      setUserBalance(newBalance);

      // Update crypto holdings (now supports all cryptocurrencies)
      const newHoldings = { ...cryptoHoldings };
      const symbol = selectedPair.id;
      if (!newHoldings[symbol]) newHoldings[symbol] = 0;

      if (activeTab === 0) { // Buy - add crypto
        newHoldings[symbol] += tradeAmount;
      } else { // Sell - subtract crypto
        newHoldings[symbol] -= tradeAmount;
      }

      setCryptoHoldings(newHoldings);

      // Refresh user data
      await fetchUserData();

      toast({
        title: '🎉 Trade Executed Successfully!',
        description: `${activeTab === 0 ? 'Bought' : 'Sold'} ${amount} ${selectedPair.symbol} for $${totalValue.toLocaleString()} (Fee: $${tradeFee.toFixed(2)})`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setAmount('');
    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: 'Trade Failed',
        description: 'Failed to execute trade. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Center h="calc(100vh - 64px)">
        <VStack spacing={4}>
          <Spinner size="xl" color="orange.500" />
          <Text color="gray.400">Loading market data...</Text>
        </VStack>
      </Center>
    );
  }

  const currentPrice = priceData[selectedPair.id] || { price: 0, change: 0 };

  return (
    <Box minH="100vh" bg="black" py={8}>
      <Container maxW="container.xl">
        {/* Cryptocurrency Pair Selection */}
        <Card bg="gray.900" borderRadius="xl" mb={8}>
          <CardHeader>
            <Heading size="lg" color="white" mb={4}>Select Trading Pair</Heading>
            <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)", lg: "repeat(6, 1fr)" }} gap={4}>
              {CRYPTO_PAIRS.map((pair) => {
                const pairPrice = priceData[pair.id] || { price: 0, change: 0 };
                const isSelected = selectedPair.id === pair.id;
                return (
                  <Card
                    key={pair.id}
                    bg={isSelected ? "orange.500" : "gray.800"}
                    borderRadius="lg"
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      bg: isSelected ? "orange.600" : "gray.700",
                      transform: "translateY(-2px)"
                    }}
                    onClick={() => setSelectedPair(pair)}
                  >
                    <CardBody p={4}>
                      <VStack spacing={2}>
                        <Text fontSize="2xl">{pair.icon}</Text>
                        <Text fontWeight="bold" color="white" fontSize="sm">
                          {pair.pair}
                        </Text>
                        <Text color={isSelected ? "white" : "gray.400"} fontSize="xs">
                          {pair.name}
                        </Text>
                        <Text color="white" fontSize="sm" fontWeight="bold">
                          ${pairPrice.price.toLocaleString()}
                        </Text>
                        <Badge
                          colorScheme={pairPrice.change >= 0 ? 'green' : 'red'}
                          fontSize="xs"
                        >
                          {pairPrice.change >= 0 ? '+' : ''}{pairPrice.change.toFixed(2)}%
                        </Badge>
                      </VStack>
                    </CardBody>
                  </Card>
                );
              })}
            </Grid>
          </CardHeader>
        </Card>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Trading Section */}
          <GridItem>
            <Card bg="gray.900" borderRadius="xl">
              <CardHeader>
                <HStack spacing={4} align="center">
                  <Text fontSize="3xl">{selectedPair.icon}</Text>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color="white">{selectedPair.pair}</Heading>
                    <Text color="gray.400" fontSize="sm">{selectedPair.name}</Text>
                  </VStack>
                </HStack>
                <HStack spacing={4} mt={4}>
                  <Text fontSize="2xl" color="white">
                    ${currentPrice.price.toLocaleString()}
                  </Text>
                  <Badge
                    colorScheme={currentPrice.change >= 0 ? 'green' : 'red'}
                    fontSize="md"
                    px={2}
                    py={1}
                  >
                    {currentPrice.change >= 0 ? '+' : ''}{currentPrice.change.toFixed(2)}%
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Tabs variant="soft-rounded" colorScheme="orange">
                  <TabList mb={4}>
                    <Tab
                      _selected={{ bg: 'orange.500', color: 'white' }}
                      color="gray.400"
                      onClick={() => setActiveTab(0)}
                    >
                      Buy
                    </Tab>
                    <Tab
                      _selected={{ bg: 'orange.500', color: 'white' }}
                      color="gray.400"
                      onClick={() => setActiveTab(1)}
                    >
                      Sell
                    </Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text color="gray.400" mb={2}>Order Type</Text>
                          <Select
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            bg="gray.800"
                            borderColor="gray.700"
                            color="white"
                            _hover={{ borderColor: 'orange.400' }}
                            _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' }}
                          >
                            <option value="market">Market Order</option>
                            <option value="limit">Limit Order</option>
                          </Select>
                        </Box>
                        <Box>
                          <Text color="gray.400" mb={2}>Amount ({selectedPair.symbol})</Text>
                          <Input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            bg="gray.800"
                            borderColor="gray.700"
                            color="white"
                            _hover={{ borderColor: 'orange.400' }}
                            _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' }}
                          />
                        </Box>
                        <Box>
                          <Text color="gray.400" mb={2}>Total (USDT)</Text>
                          <Input
                            value={amount ? (parseFloat(amount) * currentPrice.price * 1.001).toFixed(2) : ''}
                            isReadOnly
                            bg="gray.800"
                            borderColor="gray.700"
                            color="white"
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            Includes 0.1% trading fee
                          </Text>
                        </Box>

                        {/* Balance Check */}
                        <Box bg="gray.800" p={3} borderRadius="md">
                          <Text fontSize="sm" color="gray.400" mb={1}>Available Balance</Text>
                          <Text fontSize="lg" color="white" fontWeight="bold">
                            ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                          </Text>
                          {amount && parseFloat(amount) > 0 && (
                            <Text
                              fontSize="sm"
                              color={userBalance >= (parseFloat(amount) * currentPrice.price * 1.001) ? "green.400" : "red.400"}
                              mt={1}
                            >
                              {userBalance >= (parseFloat(amount) * currentPrice.price * 1.001)
                                ? "✓ Sufficient balance"
                                : "✗ Insufficient balance"
                              }
                            </Text>
                          )}
                        </Box>

                        <Button
                          colorScheme="green"
                          size="lg"
                          width="full"
                          mt={4}
                          onClick={handleTrade}
                          isLoading={isSubmitting}
                          loadingText="Processing..."
                          isDisabled={
                            !amount ||
                            parseFloat(amount) <= 0 ||
                            isSubmitting ||
                            userBalance < (parseFloat(amount || '0') * currentPrice.price * 1.001)
                          }
                        >
                          Buy {selectedPair.symbol}
                        </Button>
                      </VStack>
                    </TabPanel>
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text color="gray.400" mb={2}>Order Type</Text>
                          <Select
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            bg="gray.800"
                            borderColor="gray.700"
                            color="white"
                            _hover={{ borderColor: 'orange.400' }}
                            _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' }}
                          >
                            <option value="market">Market Order</option>
                            <option value="limit">Limit Order</option>
                          </Select>
                        </Box>
                        <Box>
                          <Text color="gray.400" mb={2}>Amount ({selectedPair.symbol})</Text>
                          <Input
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            bg="gray.800"
                            borderColor="gray.700"
                            color="white"
                            _hover={{ borderColor: 'orange.400' }}
                            _focus={{ borderColor: 'orange.400', boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)' }}
                          />
                        </Box>
                        <Box>
                          <Text color="gray.400" mb={2}>Total (USDT)</Text>
                          <Input
                            value={amount ? (parseFloat(amount) * currentPrice.price * 0.999).toFixed(2) : ''}
                            isReadOnly
                            bg="gray.800"
                            borderColor="gray.700"
                            color="white"
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            After 0.1% trading fee
                          </Text>
                        </Box>

                        {/* Holdings Check */}
                        <Box bg="gray.800" p={3} borderRadius="md">
                          <Text fontSize="sm" color="gray.400" mb={1}>Available {selectedPair.symbol} Holdings</Text>
                          <Text fontSize="lg" color="white" fontWeight="bold">
                            {(cryptoHoldings[selectedPair.id] || 0).toLocaleString(undefined, {
                              minimumFractionDigits: selectedPair.id === 'btc' || selectedPair.id === 'eth' ? 6 : 2,
                              maximumFractionDigits: selectedPair.id === 'btc' || selectedPair.id === 'eth' ? 6 : 2
                            })} {selectedPair.symbol}
                          </Text>
                          {amount && parseFloat(amount) > 0 && (
                            <Text
                              fontSize="sm"
                              color={(cryptoHoldings[selectedPair.id] || 0) >= parseFloat(amount) ? "green.400" : "red.400"}
                              mt={1}
                            >
                              {(cryptoHoldings[selectedPair.id] || 0) >= parseFloat(amount)
                                ? `✓ Sufficient ${selectedPair.symbol} holdings`
                                : `✗ Insufficient ${selectedPair.symbol} holdings`
                              }
                            </Text>
                          )}
                        </Box>

                        <Button
                          colorScheme="red"
                          size="lg"
                          width="full"
                          mt={4}
                          onClick={handleTrade}
                          isLoading={isSubmitting}
                          loadingText="Processing..."
                          isDisabled={
                            !amount ||
                            parseFloat(amount) <= 0 ||
                            isSubmitting ||
                            (cryptoHoldings[selectedPair.id] || 0) < parseFloat(amount || '0')
                          }
                        >
                          Sell {selectedPair.symbol}
                        </Button>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </GridItem>

          {/* Balance Section */}
          <GridItem>
            <VStack spacing={6}>
              <Card bg="gray.900" borderRadius="xl" w="full">
                <CardHeader>
                  <Heading size="md" color="white">Your Balances</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    {/* USDT Balance - Always show first */}
                    <Stat>
                      <StatLabel color="gray.400">USDT Balance</StatLabel>
                      <StatNumber color="white">${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatNumber>
                      <StatHelpText color="gray.400">Available for trading</StatHelpText>
                    </Stat>

                    {/* Selected Pair Holdings */}
                    <Stat>
                      <StatLabel color="gray.400">{selectedPair.symbol} Holdings</StatLabel>
                      <StatNumber color="white">
                        {(cryptoHoldings[selectedPair.id] || 0).toLocaleString(undefined, {
                          minimumFractionDigits: selectedPair.id === 'btc' || selectedPair.id === 'eth' ? 6 : 2,
                          maximumFractionDigits: selectedPair.id === 'btc' || selectedPair.id === 'eth' ? 6 : 2
                        })} {selectedPair.symbol}
                      </StatNumber>
                      <StatHelpText color="gray.400">
                        {cryptoHoldings[selectedPair.id] ? (
                          `≈ $${((cryptoHoldings[selectedPair.id] || 0) * currentPrice.price).toLocaleString()}`
                        ) : (
                          `No ${selectedPair.symbol} holdings`
                        )}
                      </StatHelpText>
                    </Stat>

                    {/* Portfolio Value */}
                    <Stat>
                      <StatLabel color="gray.400">Portfolio Value</StatLabel>
                      <StatNumber color="white">
                        ${(() => {
                          let totalValue = userBalance; // Start with USDT balance
                          Object.entries(cryptoHoldings).forEach(([cryptoId, amount]) => {
                            const price = priceData[cryptoId]?.price || 0;
                            totalValue += amount * price;
                          });
                          return totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()}
                      </StatNumber>
                      <StatHelpText color="gray.400">
                        USDT + Crypto holdings
                      </StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg="gray.900" borderRadius="xl" w="full">
                <CardHeader>
                  <Heading size="md" color="white">Recent Trades</Heading>
                </CardHeader>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th color="gray.400">Pair</Th>
                        <Th color="gray.400">Type</Th>
                        <Th color="gray.400">Amount</Th>
                        <Th color="gray.400">Price</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentTrades.length === 0 ? (
                        <Tr>
                          <Td colSpan={4} textAlign="center" color="gray.400" py={8}>
                            No trades yet. Start trading to see your history here!
                          </Td>
                        </Tr>
                      ) : (
                        recentTrades.map((trade, index) => {
                          const tradeSymbol = trade.symbol || 'btc';
                          const cryptoPair = CRYPTO_PAIRS.find(p => p.id === tradeSymbol);
                          const icon = cryptoPair?.icon || '?';
                          const symbol = cryptoPair?.symbol || tradeSymbol.toUpperCase();

                          return (
                            <Tr key={trade.id || index}>
                              <Td color="white">
                                <HStack spacing={2}>
                                  <Text>{icon}</Text>
                                  <Text>{symbol}</Text>
                                </HStack>
                              </Td>
                              <Td>
                                <Badge colorScheme={trade.type === 'buy' ? 'green' : 'red'}>
                                  {trade.type?.toUpperCase() || 'UNKNOWN'}
                                </Badge>
                              </Td>
                              <Td color="white">
                                {trade.amount ? trade.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: symbol === 'BTC' || symbol === 'ETH' ? 6 : 2,
                                  maximumFractionDigits: symbol === 'BTC' || symbol === 'ETH' ? 6 : 2
                                }) : '0'}
                              </Td>
                              <Td color="white">
                                ${trade.price ? trade.price.toLocaleString() : '0'}
                              </Td>
                            </Tr>
                          );
                        })
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
} 