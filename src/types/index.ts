export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Wallet {
  user_id: string;
  usdt_balance: number;
  btc_balance: number;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  image_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  coin: 'BTC' | 'USDT';
  price: number;
  amount: number;
  timestamp: string;
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  wallet_address: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
} 