  import React from 'react';
  import {
  Box,
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
  onTradeSuccess?: () => void;
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



const TradeModal = ({ isOpen, onClose, selectedCoin, onTradeSuccess }: TradeModalProps) => {
  const { user } = useAuth();
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0 || !user?.id || !selectedCoin) return;

    const tradeAmount = parseFloat(amount);
    const currentPrice = selectedCoin.current_price;
    const totalValue = tradeAmount * currentPrice;
    const tradeFee = totalValue * 0.001; // 0.1% trading fee
    const netTotal = totalValue + tradeFee;

    setIsSubmitting(true);
    try {
      // Check user balance for buy orders
      if (type === 'buy') {
        const { data: balanceData } = await supabase
          .from('user_balances')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        const currentBalance = balanceData?.balance || 0;
        if (currentBalance < netTotal) {
          throw new Error('Insufficient balance for this trade');
        }
      } else {
        // For sell orders, check if user has enough crypto
        const { data: tradesData } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .eq('symbol', selectedCoin.id === 'bitcoin' ? 'btc' : selectedCoin.id);

        // Calculate current holdings
        let currentHoldings = 0;
        if (tradesData) {
          tradesData.forEach(trade => {
            if (trade.type === 'buy') {
              currentHoldings += trade.amount || 0;
            } else if (trade.type === 'sell') {
              currentHoldings -= trade.amount || 0;
            }
          });
        }

        if (currentHoldings < tradeAmount) {
          throw new Error(`Insufficient ${selectedCoin.symbol} balance. You have ${currentHoldings.toFixed(6)} ${selectedCoin.symbol}`);
        }
      }

      // Save trade to database
      const { error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          type: type,
          symbol: selectedCoin.id === 'bitcoin' ? 'btc' : selectedCoin.id,
          amount: tradeAmount,
          price: currentPrice,
          total: totalValue,
          fee: tradeFee
        });

      if (tradeError) {
        console.error('Error saving trade:', tradeError);
        throw new Error(`Failed to save trade: ${tradeError.message}`);
      }

      // Update user balance
      const { data: currentBalanceData } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      const currentBalance = currentBalanceData?.balance || 0;
      let newBalance = currentBalance;

      if (type === 'buy') {
        // Buy - deduct USDT (including fee)
        newBalance = currentBalance - netTotal;
      } else {
        // Sell - add USDT (minus fee)
        newBalance = currentBalance + (totalValue - tradeFee);
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

      toast({
        title: '🎉 Trade Executed Successfully!',
        description: `${type === 'buy' ? 'Bought' : 'Sold'} ${amount} ${selectedCoin.symbol} for $${totalValue.toLocaleString()} (Fee: $${tradeFee.toFixed(2)})`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setAmount('');
      onClose();

      // Trigger data refresh
      if (onTradeSuccess) {
        onTradeSuccess();
      }

    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: 'Trade Failed',
        description: error instanceof Error ? error.message : 'Failed to execute trade. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
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
            {selectedCoin && amount && (
              <VStack spacing={2} align="stretch" p={3} bg="gray.700" borderRadius="md">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.400">Price per {selectedCoin.symbol}:</Text>
                  <Text fontSize="sm">${selectedCoin.current_price.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.400">Subtotal:</Text>
                  <Text fontSize="sm">${(Number(amount) * selectedCoin.current_price).toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.400">Trading Fee (0.1%):</Text>
                  <Text fontSize="sm">${(Number(amount) * selectedCoin.current_price * 0.001).toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between" borderTop="1px" borderColor="gray.600" pt={2}>
                  <Text fontWeight="bold" color="white">
                    {type === 'buy' ? 'Total Cost:' : 'You Receive:'}
                  </Text>
                  <Text fontWeight="bold" color={type === 'buy' ? 'red.400' : 'green.400'}>
                    ${type === 'buy'
                      ? (Number(amount) * selectedCoin.current_price * 1.001).toFixed(2)
                      : (Number(amount) * selectedCoin.current_price * 0.999).toFixed(2)
                    }
                  </Text>
                </HStack>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            colorScheme={type === 'buy' ? 'green' : 'red'}
            onClick={handleTrade}
            isLoading={isSubmitting}
            loadingText={`${type === 'buy' ? 'Buying' : 'Selling'}...`}
            isDisabled={!amount || parseFloat(amount) <= 0}
          >
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

  // Calculate profit as $30 per 24h since account creation or a fixed start date
  const msPerDay = 24 * 60 * 60 * 1000;
  const now = new Date();
  const profitStart = new Date('2025-07-01T00:00:00Z');
  const profitDays = Math.floor((now - profitStart) / msPerDay);
  const profitValue = profitDays * 30;
  const profitDisplay = profitValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

  // Wait for both loading to be false and user to be present before rendering dashboard
  if (isLoading || !user) {
    return (
      <Center h="calc(100vh - 64px)">
        <Spinner size="xl" color="orange.500" thickness="4px" />
        <Text color="gray.400" mt={4}>Loading your dashboard...</Text>
      </Center>
    );
  }

  return (
    <React.Fragment>
      <Box maxW="container.xl" py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }} mx="auto">
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Welcome Section */}
          <Box>
            <Heading size="xl" color="white" mb={2}>
              Welcome back
            </Heading>
            <Text color="gray.400" fontSize="lg">
              {user.email}
            </Text>
          </Box>
          {/* Dashboard Cards */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
            {/* Total Balance */}
            <Card bg="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.400">Total Balance</StatLabel>
                  <StatNumber color="orange.300" fontSize="2xl">${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatNumber>
                  <StatHelpText color="gray.400">USD</StatHelpText>
                </Stat>
                <Button mt={4} colorScheme="green" leftIcon={<FaArrowUp />} onClick={() => setIsDepositModalOpen(true)} size="sm" w="full">
                  Deposit
                </Button>
              </CardBody>
            </Card>
            {/* Profit Card */}
            <Card bg="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.400">Profit</StatLabel>
                  <StatNumber color="green.300" fontSize="2xl">
                    ${profitDisplay}
                  </StatNumber>
                  <StatHelpText color="gray.400">USD (increases $30 every 24h)</StatHelpText>
                </Stat>
                {/* Withdraw info removed from Profit card; now only in Withdraw popup */}
                <Button mt={2} colorScheme="red" leftIcon={<FaArrowDown />} onClick={() => setIsWithdrawModalOpen(true)} size="sm" w="full">
                  Withdraw
                </Button>
              </CardBody>
            </Card>
            {/* 24h Change */}
            <Card bg="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.400">24h Change</StatLabel>
                  <StatNumber color={dailyChange >= 0 ? 'green.300' : 'red.300'}>
                    {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)}
                  </StatNumber>
                  <StatHelpText color={dailyChangePercentage >= 0 ? 'green.400' : 'red.400'}>
                    <StatArrow type={dailyChangePercentage >= 0 ? 'increase' : 'decrease'} />
                    {dailyChangePercentage.toFixed(2)}%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            {/* Quick Trade */}
            <Card bg="gray.700">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text color="gray.400" fontWeight="bold">Quick Trade</Text>
                  <Button colorScheme="orange" leftIcon={<FaExchangeAlt />} onClick={handleGoToTrade} size="sm">
                    Go to Trade
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </Grid>

          {/* Pending Deposits Notification */}
          {transactions.some(tx => tx.type === 'deposit' && tx.status === 'pending') && (
            <Alert status="info" bg="blue.900" borderRadius="md" color="blue.100" mb={2}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Deposit Pending</AlertTitle>
                <AlertDescription>
                  You have one or more deposits awaiting admin approval. Your balance will update once approved.
                </AlertDescription>
              </Box>
              <CloseButton position="absolute" right="8px" top="8px" />
            </Alert>
          )}

          {/* Portfolio Table */}
          <Box bg="gray.800" borderRadius="md" p={4}>
            <Heading size="md" color="orange.200" mb={4}>Your Assets</Heading>
            {portfolio.length === 0 ? (
              <Text color="gray.400">No crypto assets yet. Start trading to build your portfolio!</Text>
            ) : (
              <Table variant="simple" colorScheme="orange">
                <Thead>
                  <Tr>
                    <Th color="orange.200">Asset</Th>
                    <Th color="orange.200">Amount</Th>
                    <Th color="orange.200">Price</Th>
                    <Th color="orange.200">Value (USD)</Th>
                    <Th color="orange.200">24h Change</Th>
                    <Th color="orange.200">Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {portfolio.map(coin => (
                    <Tr key={coin.id}>
                      <Td fontWeight="bold">{coin.symbol}</Td>
                      <Td>{coin.amount}</Td>
                      <Td>${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Td>
                      <Td>${coin.value_usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Td>
                      <Td>
                        <Badge colorScheme={coin.price_change_percentage_24h >= 0 ? 'green' : 'red'}>
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                        </Badge>
                      </Td>
                      <Td>
                        <Button size="xs" colorScheme="orange" onClick={() => handleTradeClick(coin)}>
                          Trade
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>

          {/* Recent Transactions Table */}
          <Box bg="gray.800" borderRadius="md" p={4}>
            <Heading size="md" color="orange.200" mb={4}>Recent Transactions</Heading>
            {transactions.length === 0 ? (
              <Text color="gray.400">No transactions yet.</Text>
            ) : (
              <Table variant="simple" colorScheme="orange">
                <Thead>
                  <Tr>
                    <Th color="orange.200">Type</Th>
                    <Th color="orange.200">Asset</Th>
                    <Th color="orange.200">Amount</Th>
                    <Th color="orange.200">Price</Th>
                    <Th color="orange.200">Total</Th>
                    <Th color="orange.200">Date</Th>
                    <Th color="orange.200">Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.slice(0, 10).map(tx => (
                    <Tr key={tx.id}>
                      <Td>
                        <Badge colorScheme={tx.type === 'buy' ? 'green' : tx.type === 'sell' ? 'red' : 'blue'}>
                          {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </Badge>
                      </Td>
                      <Td>{tx.coin}</Td>
                      <Td>{tx.amount}</Td>
                      <Td>{tx.price ? `$${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</Td>
                      <Td>{tx.total ? `$${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</Td>
                      <Td>{new Date(tx.date).toLocaleString()}</Td>
                      <Td>
                        <Badge colorScheme={tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'yellow' : 'red'}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </Box>
        </VStack>
      </Box>
      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />
      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        userBalance={profitValue}
        availableProfitDisplay={profitDisplay}
        onWithdrawSuccess={() => {
          setIsLoading(true);
        }}
      />
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        selectedCoin={selectedCoin}
        onTradeSuccess={() => {
          setIsLoading(true);
        }}
      />
      <ChatIcon />
    </React.Fragment>
  );
}