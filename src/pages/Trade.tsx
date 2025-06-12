import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import { tradeService } from '../services/trade';
import { formatNumber } from '../utils/format';
import { Trade } from '../types';

export default function TradePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [wallet, setWallet] = useState({ btc_balance: 0, usdt_balance: 0 });
  const [stats, setStats] = useState({
    totalTrades: 0,
    totalVolume: 0,
    profitLoss: 0,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [price, trades, wallet, stats] = await Promise.all([
          tradeService.getBTCPrice(),
          tradeService.getTradeHistory(),
          tradeService.getWalletBalance(),
          tradeService.getTradingStats(),
        ]);
        setPrice(price);
        setTrades(trades);
        setWallet(wallet);
        setStats(stats);
      } catch (error) {
        toast({
          title: 'Error fetching data',
          description: (error as Error).message,
          status: 'error',
        });
      }
    };
    fetchData();

    // Update price every 10 seconds
    const interval = setInterval(async () => {
      const newPrice = await tradeService.getBTCPrice();
      setPrice(newPrice);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleTrade = async () => {
    try {
      setLoading(true);
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Invalid amount');
      }

      const trade = await tradeService.executeTrade(tradeType, amountNum, price);
      
      // Refresh data
      const [newTrades, newWallet, newStats] = await Promise.all([
        tradeService.getTradeHistory(),
        tradeService.getWalletBalance(),
        tradeService.getTradingStats(),
      ]);
      
      setTrades(newTrades);
      setWallet(newWallet);
      setStats(newStats);
      setAmount('');

      toast({
        title: 'Trade executed',
        description: `Successfully ${tradeType} ${amountNum} BTC at $${price}`,
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Trade failed',
        description: (error as Error).message,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* Trading Form */}
        <GridItem colSpan={4}>
          <Box bg="gray.900" p={6} borderRadius="lg">
            <VStack spacing={4} align="stretch">
              <Stat>
                <StatLabel>BTC/USDT</StatLabel>
                <StatNumber>${formatNumber(price)}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Live Price
                </StatHelpText>
              </Stat>

              <Select
                value={tradeType}
                onChange={(e) => setTradeType(e.target.value as 'buy' | 'sell')}
                bg="gray.800"
              >
                <option value="buy">Buy BTC</option>
                <option value="sell">Sell BTC</option>
              </Select>

              <Input
                placeholder="Amount (BTC)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                bg="gray.800"
              />

              <Text fontSize="sm" color="gray.400">
                Total: {amount ? `$${formatNumber(parseFloat(amount) * price)}` : '$0.00'}
              </Text>

              <Button
                colorScheme={tradeType === 'buy' ? 'green' : 'red'}
                isLoading={loading}
                onClick={handleTrade}
              >
                {tradeType === 'buy' ? 'Buy BTC' : 'Sell BTC'}
              </Button>
            </VStack>
          </Box>

          <Box bg="gray.900" p={6} borderRadius="lg" mt={6}>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Your Wallet</Text>
              <HStack justify="space-between">
                <Text>BTC:</Text>
                <Text>{formatNumber(wallet.btc_balance)} BTC</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>USDT:</Text>
                <Text>${formatNumber(wallet.usdt_balance)}</Text>
              </HStack>
            </VStack>
          </Box>
        </GridItem>

        {/* Trading Stats and History */}
        <GridItem colSpan={8}>
          <Box bg="gray.900" p={6} borderRadius="lg">
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              <Stat>
                <StatLabel>Total Trades</StatLabel>
                <StatNumber>{stats.totalTrades}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Volume</StatLabel>
                <StatNumber>${formatNumber(stats.totalVolume)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Profit/Loss</StatLabel>
                <StatNumber color={stats.profitLoss >= 0 ? 'green.400' : 'red.400'}>
                  ${formatNumber(Math.abs(stats.profitLoss))}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={stats.profitLoss >= 0 ? 'increase' : 'decrease'} />
                  {stats.profitLoss >= 0 ? 'Profit' : 'Loss'}
                </StatHelpText>
              </Stat>
            </Grid>
          </Box>

          <Box bg="gray.900" p={6} borderRadius="lg" mt={6}>
            <Text fontWeight="bold" mb={4}>Trade History</Text>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th>Amount (BTC)</Th>
                  <Th>Price</Th>
                  <Th>Total</Th>
                  <Th>Fee</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {trades.map((trade) => (
                  <Tr key={trade.id}>
                    <Td color={trade.type === 'buy' ? 'green.400' : 'red.400'}>
                      {trade.type.toUpperCase()}
                    </Td>
                    <Td>{formatNumber(trade.amount)}</Td>
                    <Td>${formatNumber(trade.price)}</Td>
                    <Td>${formatNumber(trade.total)}</Td>
                    <Td>${formatNumber(trade.fee)}</Td>
                    <Td>{new Date(trade.created_at).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </GridItem>
      </Grid>
    </Container>
  );
} 