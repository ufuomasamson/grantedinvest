import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  Box,
  Alert,
  AlertIcon,
  useToast,
  Image,
  Spinner
} from '@chakra-ui/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: number;
  onWithdrawSuccess: () => void;
}

export function WithdrawModal({ isOpen, onClose, userBalance, onWithdrawSuccess }: WithdrawModalProps) {
  const { user } = useAuth();
  const toast = useToast();

  const [amount, setAmount] = useState('');
  const [withdrawalType, setWithdrawalType] = useState('crypto'); // 'crypto' or 'bank'

  // Crypto withdrawal fields
  const [walletType, setWalletType] = useState('USDT');
  const [walletAddress, setWalletAddress] = useState('');

  // Bank withdrawal fields
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid withdrawal amount',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (parseFloat(amount) > userBalance) {
      toast({
        title: 'Insufficient Balance',
        description: `You only have $${userBalance.toLocaleString()} available`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (withdrawalType === 'crypto') {
      if (!walletAddress.trim()) {
        toast({
          title: 'Wallet Address Required',
          description: 'Please enter your wallet address',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    } else if (withdrawalType === 'bank') {
      if (!bankName.trim() || !accountHolderName.trim() || !accountNumber.trim()) {
        toast({
          title: 'Bank Details Required',
          description: 'Please fill in all required bank account details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user || !validateForm()) return;

    setIsSubmitting(true);

    try {
      const withdrawAmount = parseFloat(amount);

      // Prepare withdrawal data based on type
      const withdrawalData: any = {
        user_id: user.id,
        amount: withdrawAmount,
        withdrawal_type: withdrawalType,
        status: 'pending'
      };

      if (withdrawalType === 'crypto') {
        withdrawalData.wallet_type = walletType;
        withdrawalData.wallet_address = walletAddress.trim();
      } else if (withdrawalType === 'bank') {
        withdrawalData.bank_name = bankName.trim();
        withdrawalData.account_holder_name = accountHolderName.trim();
        withdrawalData.account_number = accountNumber.trim();
        withdrawalData.routing_number = routingNumber.trim() || null;
        withdrawalData.swift_code = swiftCode.trim() || null;
      }

      // Create withdrawal request
      const { error: withdrawalError } = await supabase
        .from('withdrawals')
        .insert(withdrawalData);

      if (withdrawalError) {
        throw new Error(`Failed to create withdrawal request: ${withdrawalError.message}`);
      }

      toast({
        title: 'Withdrawal Request Submitted',
        description: 'Your withdrawal request has been submitted for review. You will be notified once it is processed.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      resetForm();
      onWithdrawSuccess();
      onClose();

    } catch (error) {
      console.error('Withdrawal submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'Failed to submit withdrawal request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setWalletAddress('');
    setBankName('');
    setAccountHolderName('');
    setAccountNumber('');
    setRoutingNumber('');
    setSwiftCode('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size={{ base: "full", md: "lg" }}>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" mx={{ base: 4, md: 0 }} my={{ base: 0, md: "auto" }}>
        <ModalHeader fontSize={{ base: "lg", md: "xl" }}>Withdraw Funds</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={{ base: 4, md: 6 }}>
          <VStack spacing={{ base: 3, md: 4 }}>
            <Alert status="info" bg="blue.900" color="white" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>Available Balance: ${userBalance.toLocaleString()}</Text>
                <Text fontSize={{ base: "xs", md: "sm" }}>Withdrawals are processed within 24-48 hours after verification.</Text>
              </Box>
            </Alert>

            <FormControl isRequired>
              <FormLabel>Withdrawal Amount (USD)</FormLabel>
              <Input
                type="number"
                placeholder="Enter amount to withdraw"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                bg="gray.700"
                border="1px solid"
                borderColor="gray.600"
                min="1"
                max={userBalance}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Withdrawal Method</FormLabel>
              <Select
                value={withdrawalType}
                onChange={(e) => setWithdrawalType(e.target.value)}
                bg="gray.700"
                border="1px solid"
                borderColor="gray.600"
              >
                <option value="crypto">Cryptocurrency Wallet</option>
                <option value="bank">Bank Account</option>
              </Select>
            </FormControl>

            {withdrawalType === 'crypto' ? (
              <>
                <FormControl isRequired>
                  <FormLabel>Wallet Type</FormLabel>
                  <Select
                    value={walletType}
                    onChange={(e) => setWalletType(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                  >
                    <option value="USDT">USDT (Tether)</option>
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="BNB">BNB</option>
                    <option value="ADA">Cardano (ADA)</option>
                    <option value="SOL">Solana (SOL)</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Wallet Address</FormLabel>
                  <Textarea
                    placeholder="Enter your wallet address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                    rows={3}
                  />
                </FormControl>
              </>
            ) : (
              <>
                <FormControl isRequired>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    placeholder="Enter your bank name"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Account Holder Name</FormLabel>
                  <Input
                    placeholder="Enter account holder name"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Account Number</FormLabel>
                  <Input
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Routing Number</FormLabel>
                  <Input
                    placeholder="Enter routing number (for US banks)"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>SWIFT Code</FormLabel>
                  <Input
                    placeholder="Enter SWIFT code (for international transfers)"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    bg="gray.700"
                    border="1px solid"
                    borderColor="gray.600"
                  />
                </FormControl>
              </>
            )}

            {amount && parseFloat(amount) > 0 && (
              <Box bg="gray.700" p={3} borderRadius="md" w="full">
                <Text fontSize="sm" color="gray.300">Withdrawal Summary:</Text>
                <HStack justify="space-between">
                  <Text>Amount:</Text>
                  <Text fontWeight="bold">${parseFloat(amount).toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Method:</Text>
                  <Text fontWeight="bold">
                    {withdrawalType === 'crypto' ? `${walletType} Wallet` : 'Bank Transfer'}
                  </Text>
                </HStack>
                {withdrawalType === 'crypto' && walletAddress && (
                  <HStack justify="space-between">
                    <Text>Address:</Text>
                    <Text fontWeight="bold" fontSize="sm" isTruncated maxW="200px">
                      {walletAddress}
                    </Text>
                  </HStack>
                )}
                {withdrawalType === 'bank' && bankName && (
                  <HStack justify="space-between">
                    <Text>Bank:</Text>
                    <Text fontWeight="bold">{bankName}</Text>
                  </HStack>
                )}
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter px={{ base: 4, md: 6 }} flexDirection={{ base: "column", md: "row" }} gap={{ base: 2, md: 0 }}>
          <Button
            variant="ghost"
            mr={{ base: 0, md: 3 }}
            onClick={handleClose}
            isDisabled={isSubmitting}
            w={{ base: "full", md: "auto" }}
            order={{ base: 2, md: 1 }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Submitting..."
            isDisabled={
              !amount ||
              (withdrawalType === 'crypto' && !walletAddress) ||
              (withdrawalType === 'bank' && (!bankName || !accountHolderName || !accountNumber))
            }
            w={{ base: "full", md: "auto" }}
            order={{ base: 1, md: 2 }}
          >
            Submit Withdrawal Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
