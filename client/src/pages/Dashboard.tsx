import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  useToast,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Center,
  Spinner,
  Grid,
  GridItem,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { FaWallet, FaArrowUp, FaArrowDown, FaExchangeAlt, FaSignOutAlt, FaChartLine, FaRocket, FaClock } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { WithdrawModal } from '../components/WithdrawModal';
import { ChatIcon } from '../components/Chat/ChatIcon';

interface PortfolioCoin {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  current_price: number;
  price_change_percentage_24h: number;
  value_usd: number;
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  coin: string;
  amount: number;
  price: number;
  total: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// Real data will be fetched from database

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}



interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCoin?: PortfolioCoin;
}

const DepositModal = ({ isOpen, onClose }: DepositModalProps) => {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [proofOfPayment, setProofOfPayment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const { user } = useAuth();

  // Fetch available wallets from admin settings
  const [availableWallets, setAvailableWallets] = useState([]);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const { data: walletsData, error } = await supabase
          .from('wallet_configs')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching wallets:', error);
        } else {
          setAvailableWallets(walletsData || []);
        }
      } catch (error) {
        console.error('Error fetching wallets:', error);
      }
    };

    if (isOpen) {
      fetchWallets();
    }
  }, [isOpen]);

  const handleWalletSelect = (wallet) => {
    setSelectedWallet(wallet);
    setShowWalletDetails(true);
  };

  const handleBackToWallets = () => {
    setShowWalletDetails(false);
    setShowDepositForm(false);
    setSelectedWallet(null);
    setDepositAmount('');
    setProofOfPayment('');
    setIsUploading(false); // Reset uploading state
  };

  const handleCopyAddress = () => {
    if (selectedWallet) {
      navigator.clipboard.writeText(selectedWallet.address);
      toast({
        title: 'Address Copied',
        description: 'Wallet address has been copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const testBucketAccess = async () => {
    try {
      console.log('Testing bucket access...');

      // First test basic Supabase connectivity
      console.log('Step 0: Testing Supabase connectivity...');
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

      // Skip bucket listing and test direct access to invest bucket
      console.log('Step 1: Testing direct access to invest bucket...');

      // Test if we can list files in the invest bucket directly
      const { data: files, error: filesError } = await supabase.storage
        .from('invest')
        .list('', { limit: 1 });

      console.log('Files in invest bucket:', files);
      if (filesError) {
        console.error('Files error:', filesError);
        toast({
          title: 'Bucket Access Error',
          description: `Cannot access invest bucket: ${filesError.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      console.log('Step 2: Bucket access test successful!');
      toast({
        title: 'Bucket Test Successful',
        description: 'Can access the invest bucket successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Bucket test error:', error);
      toast({
        title: 'Bucket Test Failed',
        description: `Test failed: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleProofUpload = async (file) => {
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('Starting file upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    try {
      setIsUploading(true);

      // Create a simple filename
      const fileExt = file.name.split('.').pop();
      const fileName = `proof-${Date.now()}.${fileExt}`;

      console.log('Uploading to bucket: invest, filename:', fileName);

      // Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('Current user:', user?.email, 'User error:', userError);

      if (!user) {
        console.error('User not authenticated');
        toast({
          title: 'Authentication Error',
          description: 'You must be logged in to upload files',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      // Upload to Supabase storage
      console.log('Attempting upload to invest bucket...');
      const { data, error } = await supabase.storage
        .from('invest')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error
        });

        // Try with a different approach if the first fails
        if (error.message.includes('duplicate') || error.statusCode === 409) {
          console.log('File exists, trying with upsert...');
          const retryFileName = `proof-${Date.now()}-retry.${fileExt}`;
          const { data: retryData, error: retryError } = await supabase.storage
            .from('invest')
            .upload(retryFileName, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (retryError) {
            throw retryError;
          }

          console.log('Retry upload successful:', retryData);

          // Get the public URL for retry
          const { data: urlData } = supabase.storage
            .from('invest')
            .getPublicUrl(retryFileName);

          setProofOfPayment(urlData.publicUrl);
        } else {
          throw error;
        }
      } else {
        console.log('Upload successful:', data);

        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('invest')
          .getPublicUrl(fileName);

        console.log('Public URL:', urlData.publicUrl);
        setProofOfPayment(urlData.publicUrl);
      }

      toast({
        title: 'Proof Uploaded',
        description: 'Proof of payment uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: `Failed to upload: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      console.log('Upload process completed, setting isUploading to false');
      setIsUploading(false);
    }
  };

  const handleSubmitDeposit = async () => {
    if (!depositAmount || !proofOfPayment || !selectedWallet) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('Submitting deposit:', {
        amount: depositAmount,
        walletType: selectedWallet.type,
        proofOfPayment: proofOfPayment,
        userEmail: user?.email
      });

      // Save deposit to Supabase database
      const { data, error } = await supabase
        .from('deposits')
        .insert([
          {
            user_id: user?.id,
            user_email: user?.email,
            amount: parseFloat(depositAmount),
            wallet_type: selectedWallet.type,
            wallet_name: selectedWallet.name,
            proof_of_payment: proofOfPayment,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Database error:', error);
        toast({
          title: 'Submission Failed',
          description: `Failed to submit deposit: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      console.log('Deposit submitted successfully:', data);

      toast({
        title: '✅ Deposit Submitted Successfully!',
        description: `Your $${depositAmount} ${selectedWallet.type} deposit is now awaiting admin approval. You'll receive a notification once it's processed. Please keep this page open or refresh periodically to check your balance.`,
        status: 'success',
        duration: 8000,
        isClosable: true,
      });

      // Reset form and close modal
      handleCloseModal();

    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit deposit. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCloseModal = () => {
    setShowWalletDetails(false);
    setShowDepositForm(false);
    setSelectedWallet(null);
    setDepositAmount('');
    setProofOfPayment('');
    setIsUploading(false); // Reset uploading state
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>
          {showWalletDetails ? (
            <HStack spacing={4}>
              <Button size="sm" variant="ghost" onClick={handleBackToWallets}>
                ← Back
              </Button>
              <Text>Deposit {selectedWallet?.type}</Text>
            </HStack>
          ) : (
            'Select Deposit Wallet'
          )}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!showWalletDetails ? (
            // Wallet Selection Screen
            <VStack spacing={4}>
              <Text color="gray.400" textAlign="center" mb={4}>
                Choose a cryptocurrency wallet to deposit funds
              </Text>
              {availableWallets.filter(w => w.is_active).map((wallet) => (
                <Card
                  key={wallet.id}
                  bg="gray.700"
                  w="full"
                  cursor="pointer"
                  _hover={{ bg: "gray.600" }}
                  onClick={() => handleWalletSelect(wallet)}
                >
                  <CardBody>
                    <HStack spacing={4}>
                      <Box
                        w="50px"
                        h="50px"
                        bg="orange.500"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                        fontSize="lg"
                      >
                        {wallet.type}
                      </Box>
                      <VStack align="start" spacing={1} flex="1">
                        <Text fontWeight="bold" fontSize="lg">{wallet.name}</Text>
                        <Text color="gray.400" fontSize="sm">{wallet.blockchain}</Text>
                      </VStack>
                      <Icon as={FaArrowUp} color="gray.400" />
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          ) : (
            // Wallet Details Screen
            selectedWallet && (
              <VStack spacing={6}>
                {/* Wallet Info */}
                <Card bg="gray.700" w="full">
                  <CardBody textAlign="center">
                    <VStack spacing={4}>
                      <Box
                        w="60px"
                        h="60px"
                        bg="orange.500"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontWeight="bold"
                        fontSize="xl"
                        mx="auto"
                      >
                        {selectedWallet.type}
                      </Box>
                      <VStack spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">{selectedWallet.name}</Text>
                        <Text color="gray.400" fontSize="sm">{selectedWallet.blockchain}</Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>

                {/* QR Code */}
                <Card bg="gray.700" w="full">
                  <CardBody textAlign="center">
                    <VStack spacing={4}>
                      <Text fontWeight="bold">Scan QR Code</Text>
                      <Box bg="white" p={4} borderRadius="md">
                        <Image
                          src={selectedWallet.qr_code}
                          alt="QR Code"
                          w="200px"
                          h="200px"
                        />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Wallet Address */}
                <Card bg="gray.700" w="full">
                  <CardBody>
                    <VStack spacing={4}>
                      <Text fontWeight="bold">Wallet Address</Text>
                      <Box
                        bg="gray.800"
                        p={4}
                        borderRadius="md"
                        w="full"
                        border="1px"
                        borderColor="gray.600"
                      >
                        <Text
                          fontSize="sm"
                          fontFamily="mono"
                          wordBreak="break-all"
                          textAlign="center"
                        >
                          {selectedWallet.address}
                        </Text>
                      </Box>
                      <Button
                        colorScheme="orange"
                        size="sm"
                        onClick={handleCopyAddress}
                        leftIcon={<Icon as={FaWallet} />}
                      >
                        Copy Address
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Instructions */}
                <Card bg="orange.900" borderColor="orange.500" borderWidth="1px" w="full">
                  <CardBody>
                    <VStack spacing={2} align="start">
                      <Text fontWeight="bold" color="orange.200">Important Instructions:</Text>
                      <Text fontSize="sm" color="orange.100">
                        • Send only {selectedWallet.type} to this address
                      </Text>
                      <Text fontSize="sm" color="orange.100">
                        • Ensure you're using the {selectedWallet.blockchain}
                      </Text>
                      <Text fontSize="sm" color="orange.100">
                        • Minimum deposit: 0.001 {selectedWallet.type}
                      </Text>
                      <Text fontSize="sm" color="orange.100">
                        • Deposits will be credited after network confirmations
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Deposit Submission Form */}
                <Card bg="gray.700" w="full">
                  <CardHeader>
                    <Text fontWeight="bold" textAlign="center">Submit Your Deposit</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Amount Deposited (USD)</FormLabel>
                        <Input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="Enter the amount you deposited"
                          bg="gray.800"
                          borderColor="gray.600"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Proof of Payment</FormLabel>
                        <VStack spacing={4}>
                          {proofOfPayment && (
                            <Box>
                              <Image
                                src={proofOfPayment}
                                alt="Proof of Payment"
                                w="200px"
                                h="200px"
                                objectFit="cover"
                                borderRadius="md"
                                border="2px"
                                borderColor="gray.600"
                              />
                            </Box>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProofUpload(e.target.files[0])}
                            bg="gray.800"
                            borderColor="gray.600"
                            pt={1}
                            isDisabled={isUploading}
                          />
                          <Text fontSize="sm" color="gray.400" textAlign="center">
                            Upload a screenshot or photo of your payment confirmation
                          </Text>
                          {isUploading && (
                            <Text fontSize="sm" color="orange.400">
                              Uploading...
                            </Text>
                          )}
                        </VStack>
                      </FormControl>

                      <Button
                        colorScheme="green"
                        w="full"
                        onClick={handleSubmitDeposit}
                        isDisabled={!depositAmount || !proofOfPayment || isUploading}
                        leftIcon={<Icon as={FaArrowUp} />}
                      >
                        Submit Deposit for Review
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            )
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={testBucketAccess}>
            Test Bucket
          </Button>
          <Button variant="ghost" onClick={handleCloseModal}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};



const TradeModal = ({ isOpen, onClose, selectedCoin }: TradeModalProps) => {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const toast = useToast();

  const handleTrade = () => {
    toast({
      title: `${type.toUpperCase()} Order Placed`,
      description: `${type === 'buy' ? 'Bought' : 'Sold'} ${amount} ${selectedCoin?.symbol || 'BTC'}`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Trade {selectedCoin?.name || 'Bitcoin'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Type</FormLabel>
              <Select 
                value={type} 
                onChange={(e) => setType(e.target.value as 'buy' | 'sell')}
                bg="gray.700"
                borderColor="gray.600"
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Amount ({selectedCoin?.symbol || 'BTC'})</FormLabel>
              <NumberInput
                min={0}
                value={amount}
                onChange={(value) => setAmount(value)}
                bg="gray.700"
                borderColor="gray.600"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper borderColor="gray.600" color="gray.400" />
                  <NumberDecrementStepper borderColor="gray.600" color="gray.400" />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            {selectedCoin && (
              <Text>
                Estimated Total: ${(Number(amount) * selectedCoin.current_price).toFixed(2)}
              </Text>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme={type === 'buy' ? 'green' : 'red'} onClick={handleTrade}>
            {type === 'buy' ? 'Buy' : 'Sell'} {selectedCoin?.symbol || 'BTC'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [userBalance, setUserBalance] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioCoin[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState<PortfolioCoin | undefined>();
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [lastCheckedDeposits, setLastCheckedDeposits] = useState<string[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const toast = useToast();

  // Check for deposit status changes on mount and periodically
  // DISABLED - useEffect that was calling checkDepositStatusChanges
  // This was causing the "checkDepositStatusChanges is not defined" error

  // Use real user balance instead of portfolio calculation
  const totalValue = userBalance;

  // For now, set daily change to 0 until we implement real portfolio tracking
  const dailyChange = 0;
  const dailyChangePercentage = 0;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Dashboard: Logout failed', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTradeClick = (coin: PortfolioCoin) => {
    setSelectedCoin(coin);
    setIsTradeModalOpen(true);
  };

  const handleGoToTrade = () => {
    navigate('/trade');
  };

  const getTimeRangePercentage = (timeRange: string) => {
    // Mock data for different time ranges - replace with actual API data later
    const mockPercentages: { [key: string]: number } = {
      '24h': 2.5,
      '1d': 2.5,
      '2d': 4.8,
      '3d': -1.2,
      '1w': 8.3,
      '2w': 12.7,
      '1m': 15.4,
      '2m': 22.1
    };
    return mockPercentages[timeRange] || 0;
  };

  // DISABLED - Function causing console spam and not needed for debugging
  // const checkDepositStatusChanges = async () => { ... };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (!user?.id) {
          return;
        }

        // Fetch user balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('user_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (balanceError && balanceError.code !== 'PGRST116') {
          setUserBalance(0);
        } else {
          const balance = balanceData?.balance || 0;
          setUserBalance(balance);
        }

        // Fetch user transactions (deposits and trades)
        const { data: depositsData, error: depositsError } = await supabase
          .from('deposits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch user trades
        const { data: tradesData, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        let allTransactions: Transaction[] = [];

        // Add deposits to transactions
        if (!depositsError && depositsData) {
          const depositTransactions: Transaction[] = depositsData.map(deposit => ({
            id: deposit.id,
            type: 'deposit' as const,
            coin: deposit.wallet_type,
            amount: deposit.amount,
            price: 1, // For deposits, price is 1:1 with amount
            total: deposit.amount,
            date: deposit.created_at,
            status: deposit.status === 'approved' ? 'completed' : deposit.status === 'rejected' ? 'failed' : 'pending'
          }));
          allTransactions = [...allTransactions, ...depositTransactions];
        }

        // Add trades to transactions
        if (!tradesError && tradesData) {
          const tradeTransactions: Transaction[] = tradesData.map(trade => {
            const symbol = trade.symbol || 'btc';
            const cryptoInfo = {
              'btc': 'BTC',
              'eth': 'ETH',
              'bnb': 'BNB',
              'ada': 'ADA',
              'sol': 'SOL',
              'xrp': 'XRP',
              'dot': 'DOT',
              'doge': 'DOGE',
              'avax': 'AVAX',
              'matic': 'MATIC',
              'link': 'LINK'
            }[symbol] || symbol.toUpperCase();

            return {
              id: trade.id,
              type: trade.type as 'buy' | 'sell',
              coin: cryptoInfo,
              amount: trade.amount,
              price: trade.price,
              total: trade.total,
              date: trade.created_at,
              status: 'completed' // All trades are completed
            };
          });
          allTransactions = [...allTransactions, ...tradeTransactions];
        }

        // Sort all transactions by date
        allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(allTransactions);

        // Calculate crypto holdings from trades (supports all cryptocurrencies)
        const cryptoHoldings: Record<string, number> = {};

        if (tradesData && tradesData.length > 0) {
          tradesData.forEach((trade) => {
            const symbol = trade.symbol || 'btc'; // Use trade symbol, fallback to btc for old trades
            if (!cryptoHoldings[symbol]) cryptoHoldings[symbol] = 0;

            if (trade.type === 'buy') {
              cryptoHoldings[symbol] += trade.amount || 0;
            } else if (trade.type === 'sell') {
              cryptoHoldings[symbol] -= trade.amount || 0;
            }
          });
        }

        // Fetch current prices for all held cryptocurrencies
        const portfolioData: PortfolioCoin[] = [];

        if (Object.keys(cryptoHoldings).length > 0) {
          // Map crypto IDs to CoinGecko IDs
          const cryptoIdMap: Record<string, string> = {
            'btc': 'bitcoin',
            'eth': 'ethereum',
            'bnb': 'binancecoin',
            'ada': 'cardano',
            'sol': 'solana',
            'xrp': 'ripple',
            'dot': 'polkadot',
            'doge': 'dogecoin',
            'avax': 'avalanche-2',
            'matic': 'matic-network',
            'link': 'chainlink'
          };

          // Get CoinGecko IDs for held cryptocurrencies
          const heldCryptos = Object.keys(cryptoHoldings).filter(symbol => cryptoHoldings[symbol] > 0);
          const coinGeckoIds = heldCryptos.map(symbol => cryptoIdMap[symbol]).filter(Boolean);

          if (coinGeckoIds.length > 0) {
            try {
              const priceResponse = await fetch(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true`
              );
              const priceData = await priceResponse.json();

              // Create portfolio entries for each held cryptocurrency
              heldCryptos.forEach(symbol => {
                const coinGeckoId = cryptoIdMap[symbol];
                const holdings = cryptoHoldings[symbol];

                if (holdings > 0 && coinGeckoId && priceData[coinGeckoId]) {
                  const price = priceData[coinGeckoId].usd || 0;
                  const change = priceData[coinGeckoId].usd_24h_change || 0;

                  // Get crypto info from CRYPTO_PAIRS
                  const cryptoInfo = {
                    'btc': { name: 'Bitcoin', symbol: 'BTC' },
                    'eth': { name: 'Ethereum', symbol: 'ETH' },
                    'bnb': { name: 'BNB', symbol: 'BNB' },
                    'ada': { name: 'Cardano', symbol: 'ADA' },
                    'sol': { name: 'Solana', symbol: 'SOL' },
                    'xrp': { name: 'XRP', symbol: 'XRP' },
                    'dot': { name: 'Polkadot', symbol: 'DOT' },
                    'doge': { name: 'Dogecoin', symbol: 'DOGE' },
                    'avax': { name: 'Avalanche', symbol: 'AVAX' },
                    'matic': { name: 'Polygon', symbol: 'MATIC' },
                    'link': { name: 'Chainlink', symbol: 'LINK' }
                  }[symbol] || { name: symbol.toUpperCase(), symbol: symbol.toUpperCase() };

                  portfolioData.push({
                    id: coinGeckoId,
                    name: cryptoInfo.name,
                    symbol: cryptoInfo.symbol,
                    amount: holdings.toFixed(symbol === 'btc' || symbol === 'eth' ? 6 : 2),
                    current_price: price,
                    value_usd: holdings * price,
                    price_change_percentage_24h: change
                  });
                }
              });
            } catch (error) {
              console.error('Dashboard: Error fetching crypto prices:', error);
            }
          }
        }

        setPortfolio(portfolioData);

      } catch (error) {
        console.error('Dashboard: Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  // Removed excessive logging to prevent console spam

  if (isLoading) {
    return (
      <Center h="calc(100vh - 64px)">
        <Spinner size="xl" color="orange.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }}>
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* Welcome Section */}
        <Box>
          <Heading size="xl" color="white" mb={2}>
            Welcome back
          </Heading>
          <Text color="gray.400" fontSize="lg">
            {user?.email}
          </Text>
        </Box>

        {/* Dashboard Cards */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
          {/* Total Balance Card */}
          <GridItem>
            <Card bg="gray.800" borderColor="orange.500" borderWidth="1px">
              <CardHeader>
                <HStack spacing={4}>
                  <Icon as={FaWallet} boxSize={6} color="orange.500" />
                  <Heading size="md" color="white">Total Balance</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontSize="3xl" fontWeight="bold" color="white">
                    ${totalValue.toLocaleString()}
                  </Text>
                  <HStack spacing={{ base: 2, md: 4 }} flexWrap="wrap">
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={FaArrowUp} />}
                      colorScheme="green"
                      onClick={() => setIsDepositModalOpen(true)}
                      flex={{ base: "1", md: "auto" }}
                      minW={{ base: "80px", md: "auto" }}
                    >
                      Deposit
                    </Button>
                    <Button
                      size={{ base: "xs", md: "sm" }}
                      leftIcon={<Icon as={FaArrowDown} />}
                      colorScheme="red"
                      onClick={() => setIsWithdrawModalOpen(true)}
                      flex={{ base: "1", md: "auto" }}
                      minW={{ base: "80px", md: "auto" }}
                    >
                      Withdraw
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={async () => {
                        setIsLoading(true);

                        try {
                          // Fetch user balance
                          const { data: balanceData, error: balanceError } = await supabase
                            .from('user_balances')
                            .select('*')
                            .eq('user_id', user.id);

                          if (balanceError) {
                            setUserBalance(0);
                          } else if (balanceData && balanceData.length > 0) {
                            const balance = balanceData[0].balance || 0;
                            setUserBalance(balance);
                          } else {
                            setUserBalance(0);
                          }

                          // Fetch transactions (deposits and trades)
                          const { data: depositsData, error: depositsError } = await supabase
                            .from('deposits')
                            .select('*')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false });

                          const { data: tradesData, error: tradesError } = await supabase
                            .from('trades')
                            .select('*')
                            .eq('user_id', user.id)
                            .order('created_at', { ascending: false });

                          let allTransactions: Transaction[] = [];

                          // Add deposits
                          if (!depositsError && depositsData) {
                            const depositTransactions = depositsData.map(deposit => ({
                              id: deposit.id,
                              type: 'deposit' as const,
                              coin: deposit.wallet_type,
                              amount: deposit.amount,
                              price: 1,
                              total: deposit.amount,
                              date: deposit.created_at,
                              status: deposit.status === 'approved' ? 'completed' : deposit.status === 'rejected' ? 'failed' : 'pending'
                            }));
                            allTransactions = [...allTransactions, ...depositTransactions];
                          }

                          // Add trades
                          if (!tradesError && tradesData) {
                            const tradeTransactions = tradesData.map(trade => ({
                              id: trade.id,
                              type: trade.type as 'buy' | 'sell',
                              coin: 'BTC',
                              amount: trade.amount,
                              price: trade.price,
                              total: trade.total,
                              date: trade.created_at,
                              status: 'completed'
                            }));
                            allTransactions = [...allTransactions, ...tradeTransactions];
                          }

                          // Sort and set transactions
                          allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          setTransactions(allTransactions);

                          // Calculate and set portfolio
                          let btcHoldings = 0;
                          if (tradesData) {
                            tradesData.forEach(trade => {
                              if (trade.type === 'buy') {
                                btcHoldings += trade.amount || 0;
                              } else if (trade.type === 'sell') {
                                btcHoldings -= trade.amount || 0;
                              }
                            });
                          }

                          // Fetch BTC price and update portfolio
                          try {
                            const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
                            const priceData = await priceResponse.json();
                            const btcPrice = priceData.bitcoin?.usd || 0;
                            const btcChange = priceData.bitcoin?.usd_24h_change || 0;

                            const portfolioData: PortfolioCoin[] = [];
                            if (btcHoldings > 0) {
                              portfolioData.push({
                                id: 'bitcoin',
                                name: 'Bitcoin',
                                symbol: 'BTC',
                                amount: btcHoldings.toFixed(6),
                                current_price: btcPrice,
                                value_usd: btcHoldings * btcPrice,
                                price_change_percentage_24h: btcChange
                              });
                            }
                            setPortfolio(portfolioData);
                          } catch (error) {
                            console.error('Error fetching BTC price:', error);
                            setPortfolio([]);
                          }

                          console.log('Refreshed all data:', { allTransactions, btcHoldings });

                          toast({
                            title: 'Data Refreshed',
                            description: 'Dashboard data has been updated',
                            status: 'success',
                            duration: 2000,
                            isClosable: true,
                          });
                        } catch (error) {
                          console.error('Refresh error:', error);
                          toast({
                            title: 'Refresh Failed',
                            description: 'Failed to refresh data',
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      Refresh
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* 24h Change Card */}
          <GridItem>
            <Card bg="gray.800" borderColor="blue.500" borderWidth="1px">
              <CardHeader>
                <HStack spacing={4}>
                  <Icon as={FaChartLine} boxSize={6} color="blue.500" />
                  <Heading size="md" color="white">24h Change</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={dailyChangePercentage >= 0 ? 'green.400' : 'red.400'}
                  >
                    {dailyChangePercentage >= 0 ? '+' : ''}{dailyChangePercentage.toFixed(2)}%
                  </Text>
                  <Text color="gray.400" fontSize="sm">
                    ${Math.abs(dailyChange).toLocaleString()} {dailyChangePercentage >= 0 ? 'gain' : 'loss'}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Quick Trade Card */}
          <GridItem>
            <Card bg="gray.800" borderColor="green.500" borderWidth="1px">
              <CardHeader>
                <HStack spacing={4}>
                  <Icon as={FaRocket} boxSize={6} color="green.500" />
                  <Heading size="md" color="white">Quick Trade</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Text color="gray.400" fontSize="sm">
                    Start trading cryptocurrencies instantly
                  </Text>
                  <Button
                    colorScheme="green"
                    leftIcon={<Icon as={FaExchangeAlt} />}
                    onClick={handleGoToTrade}
                    w="full"
                  >
                    Go to Trade
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* Time Range Card */}
          <GridItem>
            <Card bg="gray.800" borderColor="purple.500" borderWidth="1px">
              <CardHeader>
                <HStack spacing={4}>
                  <Icon as={FaClock} boxSize={6} color="purple.500" />
                  <Heading size="md" color="white">Time Range</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    bg="gray.700"
                    borderColor="gray.600"
                    color="white"
                  >
                    <option value="24h">24 Hours</option>
                    <option value="1d">1 Day</option>
                    <option value="2d">2 Days</option>
                    <option value="3d">3 Days</option>
                    <option value="1w">1 Week</option>
                    <option value="2w">2 Weeks</option>
                    <option value="1m">1 Month</option>
                    <option value="2m">2 Months</option>
                  </Select>
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color={getTimeRangePercentage(selectedTimeRange) >= 0 ? 'green.400' : 'red.400'}
                  >
                    {getTimeRangePercentage(selectedTimeRange) >= 0 ? '+' : ''}{getTimeRangePercentage(selectedTimeRange)}%
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Pending Deposits Notification */}
        {pendingDeposits.length > 0 && (
          <Alert status="info" bg="blue.900" borderColor="blue.500" borderWidth="1px">
            <AlertIcon color="blue.400" />
            <Box flex="1">
              <AlertTitle color="blue.200">
                {pendingDeposits.length} Deposit{pendingDeposits.length > 1 ? 's' : ''} Awaiting Approval
              </AlertTitle>
              <AlertDescription color="blue.100">
                {pendingDeposits.length === 1 ? (
                  `Your $${pendingDeposits[0].amount} ${pendingDeposits[0].wallet_type} deposit is being reviewed by our admin team. You'll receive a notification once it's approved.`
                ) : (
                  `You have ${pendingDeposits.length} deposits totaling $${pendingDeposits.reduce((sum, d) => sum + d.amount, 0)} being reviewed. You'll receive notifications as they are processed.`
                )}
              </AlertDescription>
            </Box>
          </Alert>
        )}

            {/* Assets Table */}
            <Card bg="gray.800">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Your Assets</Heading>
                  <Box overflowX="auto">
                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead>
                      <Tr>
                        <Th>Asset</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Price</Th>
                        <Th isNumeric>Value</Th>
                        <Th isNumeric>24h Change</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {portfolio.length === 0 ? (
                        <Tr>
                          <Td colSpan={6} textAlign="center" py={8}>
                            <VStack spacing={2}>
                              <Text color="gray.400">No crypto assets found</Text>
                              <Text color="gray.500" fontSize="sm">
                                Start trading to see your crypto holdings here
                              </Text>
                              <Button
                                size="sm"
                                colorScheme="orange"
                                onClick={handleGoToTrade}
                              >
                                Start Trading
                              </Button>
                            </VStack>
                          </Td>
                        </Tr>
                      ) : (
                        portfolio.map((coin) => (
                          <Tr key={coin.id}>
                            <Td>
                              <HStack>
                                <Text>{coin.name}</Text>
                                <Text color="gray.500">{coin.symbol}</Text>
                              </HStack>
                            </Td>
                            <Td isNumeric>{coin.amount}</Td>
                            <Td isNumeric>${coin.current_price.toLocaleString()}</Td>
                            <Td isNumeric>${coin.value_usd.toLocaleString()}</Td>
                            <Td isNumeric>
                              <Text color={coin.price_change_percentage_24h >= 0 ? 'green.400' : 'red.400'}>
                                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h}%
                              </Text>
                            </Td>
                            <Td>
                              <Button
                                size="sm"
                                leftIcon={<Icon as={FaExchangeAlt} />}
                                colorScheme="orange"
                                onClick={() => handleTradeClick(coin)}
                              >
                                Trade
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      )}
                    </Tbody>
                  </Table>
                  </Box>
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Transactions */}
            <Card bg="gray.800">
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Recent Transactions</Heading>
                  <Box overflowX="auto">
                    <Table variant="simple" size={{ base: "sm", md: "md" }}>
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th>Asset</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>Price</Th>
                        <Th isNumeric>Total</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transactions.map((tx) => (
                        <Tr key={tx.id}>
                          <Td>
                            <Badge colorScheme={tx.type === 'buy' ? 'green' : 'red'}>
                              {tx.type.toUpperCase()}
                            </Badge>
                          </Td>
                          <Td>{tx.coin}</Td>
                          <Td isNumeric>{tx.amount}</Td>
                          <Td isNumeric>${tx.price.toLocaleString()}</Td>
                          <Td isNumeric>${tx.total.toLocaleString()}</Td>
                          <Td>{new Date(tx.date).toLocaleDateString()}</Td>
                          <Td>
                            <Badge colorScheme={
                              tx.status === 'completed' ? 'green' :
                              tx.status === 'pending' ? 'yellow' : 'red'
                            }>
                              {tx.status.toUpperCase()}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
      </VStack>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        userBalance={userBalance}
        onWithdrawSuccess={() => {
          // Refresh user data after successful withdrawal
          setIsLoading(true);
          // The useEffect will handle the refresh
        }}
      />
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        selectedCoin={selectedCoin}
      />

      {/* Live Chat Icon */}
      <ChatIcon />
    </Container>
  );
}