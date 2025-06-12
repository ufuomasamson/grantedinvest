import { supabase } from '../utils/supabase';
import { Deposit } from '../types';

export const depositService = {
  // Create a new deposit request
  async create(amount: number, currency: 'BTC' | 'USDT', imageUrl: string): Promise<Deposit> {
    const { data, error } = await supabase
      .from('deposits')
      .insert([
        {
          amount,
          currency,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all deposits for the current user
  async getUserDeposits(): Promise<Deposit[]> {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get all pending deposits (admin only)
  async getPendingDeposits(): Promise<Deposit[]> {
    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update deposit status (admin only)
  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ): Promise<Deposit> {
    const { data, error } = await supabase
      .from('deposits')
      .update({ status, admin_notes: adminNotes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload deposit proof image
  async uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `deposit-proofs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('deposits')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('deposits')
      .getPublicUrl(filePath);

    return publicUrl;
  },
}; 