import React, { useState } from 'react';
import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Image,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (notes: string) => void;
  onReject: (notes: string) => void;
  type: 'deposit' | 'withdrawal';
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  type,
}) => {
  const [notes, setNotes] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.800">
        <ModalHeader>Review {type}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Text>Add admin notes (optional):</Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes..."
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={4}>
            <Button
              colorScheme="green"
              onClick={() => {
                onApprove(notes);
                onClose();
              }}
            >
              Approve
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                onReject(notes);
                onClose();
              }}
            >
              Reject
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default function AdminDashboard() {
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: 'deposit' | 'withdrawal';
  } | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const {
    data: deposits,
    isLoading: isLoadingDeposits,
  } = useQuery({
    queryKey: ['admin', 'deposits'],
    queryFn: adminService.getPendingDeposits,
  });

  const {
    data: withdrawals,
    isLoading: isLoadingWithdrawals,
  } = useQuery({
    queryKey: ['admin', 'withdrawals'],
    queryFn: adminService.getPendingWithdrawals,
  });

  const updateDepositStatus = useMutation({
    mutationFn: (params: { id: string; status: 'approved' | 'rejected'; notes?: string }) =>
      adminService.updateDepositStatus(params.id, params.status, params.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });
      toast({
        title: 'Success',
        description: 'Deposit status updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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

  const updateWithdrawalStatus = useMutation({
    mutationFn: (params: { id: string; status: 'approved' | 'rejected'; notes?: string }) =>
      adminService.updateWithdrawalStatus(params.id, params.status, params.notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
      toast({
        title: 'Success',
        description: 'Withdrawal status updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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

  const handleApprove = (notes: string) => {
    if (!selectedItem) return;

    if (selectedItem.type === 'deposit') {
      updateDepositStatus.mutate({
        id: selectedItem.id,
        status: 'approved',
        notes,
      });
    } else {
      updateWithdrawalStatus.mutate({
        id: selectedItem.id,
        status: 'approved',
        notes,
      });
    }
  };

  const handleReject = (notes: string) => {
    if (!selectedItem) return;

    if (selectedItem.type === 'deposit') {
      updateDepositStatus.mutate({
        id: selectedItem.id,
        status: 'rejected',
        notes,
      });
    } else {
      updateWithdrawalStatus.mutate({
        id: selectedItem.id,
        status: 'rejected',
        notes,
      });
    }
  };

  return (
    <Box>
      <Heading mb={6}>Admin Dashboard</Heading>

      <Tabs colorScheme="orange">
        <TabList>
          <Tab>Pending Deposits</Tab>
          <Tab>Pending Withdrawals</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>User</Th>
                  <Th>Amount</Th>
                  <Th>Currency</Th>
                  <Th>Proof</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {deposits?.map((deposit) => (
                  <Tr key={deposit.id}>
                    <Td>{new Date(deposit.created_at).toLocaleDateString()}</Td>
                    <Td>{deposit.profiles.email}</Td>
                    <Td>{deposit.amount}</Td>
                    <Td>{deposit.currency}</Td>
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
                    <Td>
                      <Button
                        colorScheme="orange"
                        size="sm"
                        onClick={() =>
                          setSelectedItem({ id: deposit.id, type: 'deposit' })
                        }
                      >
                        Review
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>

          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>User</Th>
                  <Th>Amount</Th>
                  <Th>Currency</Th>
                  <Th>Wallet Address</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {withdrawals?.map((withdrawal) => (
                  <Tr key={withdrawal.id}>
                    <Td>{new Date(withdrawal.created_at).toLocaleDateString()}</Td>
                    <Td>{withdrawal.profiles.email}</Td>
                    <Td>{withdrawal.amount}</Td>
                    <Td>{withdrawal.currency}</Td>
                    <Td>{withdrawal.wallet_address}</Td>
                    <Td>
                      <Button
                        colorScheme="orange"
                        size="sm"
                        onClick={() =>
                          setSelectedItem({ id: withdrawal.id, type: 'withdrawal' })
                        }
                      >
                        Review
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ApprovalModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        type={selectedItem?.type || 'deposit'}
      />
    </Box>
  );
} 