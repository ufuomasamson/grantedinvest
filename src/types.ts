export type Trade = {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  fee: number;
  created_at: string;
};

export type TradingStats = {
  totalTrades: number;
  totalVolume: number;
  profitLoss: number;
};

export type Wallet = {
  btc_balance: number;
  usdt_balance: number;
}; 