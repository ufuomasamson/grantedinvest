-- Function to execute a trade
create or replace function execute_trade(
  p_type trade_type,
  p_amount decimal,
  p_price decimal,
  p_total decimal,
  p_fee decimal
)
returns table (
  id uuid,
  user_id uuid,
  type trade_type,
  amount decimal,
  price decimal,
  total decimal,
  fee decimal,
  created_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_wallet record;
  v_trade_id uuid;
begin
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  -- Get user's wallet
  select * into v_wallet
  from wallets
  where user_id = v_user_id
  for update; -- Lock the row
  
  -- Validate the trade
  if p_type = 'buy' then
    -- Check if user has enough USDT
    if v_wallet.usdt_balance < (p_total + p_fee) then
      raise exception 'Insufficient USDT balance';
    end if;
    
    -- Update wallet balances
    update wallets
    set
      usdt_balance = usdt_balance - (p_total + p_fee),
      btc_balance = btc_balance + p_amount
    where user_id = v_user_id;
  else -- sell
    -- Check if user has enough BTC
    if v_wallet.btc_balance < p_amount then
      raise exception 'Insufficient BTC balance';
    end if;
    
    -- Update wallet balances
    update wallets
    set
      btc_balance = btc_balance - p_amount,
      usdt_balance = usdt_balance + (p_total - p_fee)
    where user_id = v_user_id;
  end if;
  
  -- Record the trade
  insert into trades (
    user_id,
    type,
    amount,
    price,
    total,
    fee
  )
  values (
    v_user_id,
    p_type,
    p_amount,
    p_price,
    p_total,
    p_fee
  )
  returning * into v_trade_id;
  
  -- Return the trade details
  return query
  select *
  from trades
  where id = v_trade_id;
end;
$$;

-- Function to get trading stats
create or replace function get_trading_stats()
returns table (
  total_trades bigint,
  total_volume decimal,
  profit_loss decimal
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  -- Get the current user's ID
  v_user_id := auth.uid();
  
  return query
  select
    count(*)::bigint as total_trades,
    sum(total)::decimal as total_volume,
    (
      select
        (w.btc_balance * (
          select price
          from trades
          where user_id = v_user_id
          order by created_at desc
          limit 1
        ) + w.usdt_balance) -
        (
          select coalesce(sum(
            case
              when type = 'buy' then total + fee
              when type = 'sell' then -(total - fee)
            end
          ), 0)
          from trades
          where user_id = v_user_id
        )
      from wallets w
      where w.user_id = v_user_id
    )::decimal as profit_loss
  from trades
  where user_id = v_user_id;
end;
$$; 