import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
  useToast,
  Image,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Heading,
  HStack,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { depositService } from '../services/deposit';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'BTC' | 'USDT'>('USDT');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Fetch user's deposits
  const { data: deposits, isLoading } = useQuery({
    queryKey: ['deposits'],
    queryFn: depositService.getUserDeposits,
  });

  // Create deposit mutation
  const createDeposit = useMutation({
    mutationFn: async ({ amount, currency, imageUrl }: { amount: number; currency: 'BTC' | 'USDT'; imageUrl: string }) => {
      return depositService.create(amount, currency, imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      toast({
        title: 'Deposit submitted',
        description: 'Your deposit request has been submitted for review',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      // Reset form
      setAmount('');
      setFile(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please upload proof of payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await depositService.uploadImage(file);
      await createDeposit.mutateAsync({
        amount: parseFloat(amount),
        currency,
        imageUrl,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit deposit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box>
      <Heading mb={6}>Deposit Funds</Heading>

      <HStack spacing={8} align="flex-start">
        <Card flex={1}>
          <CardHeader>
            <Heading size="md">New Deposit</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="0"
                    step="0.00000001"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Currency</FormLabel>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'BTC' | 'USDT')}
                  >
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Proof of Payment</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Upload a screenshot of your payment
                  </Text>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="orange"
                  isLoading={isUploading || createDeposit.isPending}
                  loadingText="Submitting"
                  width="full"
                >
                  Submit Deposit
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <Card flex={2}>
          <CardHeader>
            <Heading size="md">Deposit History</Heading>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Amount</Th>
                  <Th>Currency</Th>
                  <Th>Status</Th>
                  <Th>Proof</Th>
                </Tr>
              </Thead>
              <Tbody>
                {deposits?.map((deposit) => (
                  <Tr key={deposit.id}>
                    <Td>{new Date(deposit.created_at).toLocaleDateString()}</Td>
                    <Td>{deposit.amount}</Td>
                    <Td>{deposit.currency}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    </Td>
                    <Td>
                      <Image
                        src={deposit.image_url}
                        alt="Proof"
                        boxSize="50px"
                        objectFit="cover"
                        borderRadius="md"
                        cursor="pointer"
                        onClick={() => window.open(deposit.image_url, '_blank')}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </HStack>
    </Box>
  );
} 