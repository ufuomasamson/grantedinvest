import { supabase } from '../utils/supabase';
import { Deposit, User, Withdrawal } from '../types';

export const adminService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all pending deposits
  async getPendingDeposits(): Promise<Deposit[]> {
    const { data, error } = await supabase
      .from('deposits')
      .select(`
        *,
        profiles (
          email
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all pending withdrawals
  async getPendingWithdrawals(): Promise<Withdrawal[]> {
    const { data, error } = await supabase
      .from('withdrawals')
      .select(`
        *,
        profiles (
          email
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update deposit status
  async updateDepositStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('deposits')
      .update({ status, admin_notes: adminNotes })
      .eq('id', id);

    if (error) throw error;

    // If approved, update user's wallet balance
    if (status === 'approved') {
      const { data: deposit, error: depositError } = await supabase
        .from('deposits')
        .select('*')
        .eq('id', id)
        .single();

      if (depositError) throw depositError;

      const { error: walletError } = await supabase.rpc('update_wallet_balance', {
        p_user_id: deposit.user_id,
        p_currency: deposit.currency,
        p_amount: deposit.amount,
      });

      if (walletError) throw walletError;
    }
  },

  // Update withdrawal status
  async updateWithdrawalStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status, admin_notes: adminNotes })
      .eq('id', id);

    if (error) throw error;

    // If approved, update user's wallet balance
    if (status === 'approved') {
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('id', id)
        .single();

      if (withdrawalError) throw withdrawalError;

      const { error: walletError } = await supabase.rpc('update_wallet_balance', {
        p_user_id: withdrawal.user_id,
        p_currency: withdrawal.currency,
        p_amount: -withdrawal.amount, // Negative amount for withdrawal
      });

      if (walletError) throw walletError;
    }
  },
}; 