import React from 'react';
import {
  Box,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Box>
      <Heading mb={6}>Welcome, {user?.email}</Heading>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="md">BTC Balance</Heading>
          </CardHeader>
          <CardBody>
            <Stat>
              <StatNumber>0.0000 BTC</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                23.36%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">USDT Balance</Heading>
          </CardHeader>
          <CardBody>
            <Stat>
              <StatNumber>0.00 USDT</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                9.05%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Total Trades</Heading>
          </CardHeader>
          <CardBody>
            <Stat>
              <StatNumber>0</StatNumber>
              <StatHelpText>Since you joined</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Profit/Loss</Heading>
          </CardHeader>
          <CardBody>
            <Stat>
              <StatNumber>0.00 USDT</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                0.00%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <Card>
          <CardHeader>
            <Heading size="md">Recent Trades</Heading>
          </CardHeader>
          <CardBody>
            <Box>No trades yet</Box>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Pending Deposits</Heading>
          </CardHeader>
          <CardBody>
            <Box>No pending deposits</Box>
          </CardBody>
        </Card>
      </Grid>
    </Box>
  );
} 