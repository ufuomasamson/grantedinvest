import { supabase } from '../utils/supabase';
import { Trade } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export const tradeService = {
  // Get current BTC price in USDT
  async getBTCPrice(): Promise<number> {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usdt`
    );
    const data = await response.json();
    return data.bitcoin.usdt;
  },

  // Get user's trade history
  async getTradeHistory(): Promise<Trade[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user's wallet balance
  async getWalletBalance() {
    const { data, error } = await supabase
      .from('wallets')
      .select('btc_balance, usdt_balance')
      .single();

    if (error) throw error;
    return data;
  },

  // Execute a trade
  async executeTrade(
    type: 'buy' | 'sell',
    amount: number,
    price: number
  ): Promise<Trade> {
    // Calculate total and fee (0.1% trading fee)
    const total = amount * price;
    const fee = total * 0.001;

    // Start a Supabase transaction using RPC
    const { data, error } = await supabase.rpc('execute_trade', {
      p_type: type,
      p_amount: amount,
      p_price: price,
      p_total: total,
      p_fee: fee,
    });

    if (error) throw error;
    return data;
  },

  // Get trading stats
  async getTradingStats() {
    const { data, error } = await supabase.rpc('get_trading_stats');

    if (error) throw error;
    return {
      totalTrades: data.total_trades,
      totalVolume: data.total_volume,
      profitLoss: data.profit_loss,
    };
  },

  // Get price history (24h)
  async getPriceHistory(): Promise<{ timestamp: number; price: number }[]> {
    const response = await fetch(
      `${COINGECKO_API}/coins/bitcoin/market_chart?vs_currency=usdt&days=1&interval=hourly`
    );
    const data = await response.json();
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  },
}; 