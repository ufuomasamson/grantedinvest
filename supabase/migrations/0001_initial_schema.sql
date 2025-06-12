-- Enable the necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('user', 'admin');
create type deposit_status as enum ('pending', 'approved', 'rejected');
create type withdrawal_status as enum ('pending', 'approved', 'rejected');
create type trade_type as enum ('buy', 'sell');

-- Create profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade,
  email text unique not null,
  role user_role default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Create wallets table
create table if not exists wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  usdt_balance decimal(20,8) default 0 not null,
  btc_balance decimal(20,8) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Create deposits table
create table if not exists deposits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  amount decimal(20,8) not null,
  currency text not null check (currency in ('BTC', 'USDT')),
  image_url text not null,
  status deposit_status default 'pending' not null,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create withdrawals table
create table if not exists withdrawals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  amount decimal(20,8) not null,
  currency text not null check (currency in ('BTC', 'USDT')),
  wallet_address text not null,
  status withdrawal_status default 'pending' not null,
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create trades table
create table if not exists trades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type trade_type not null,
  amount decimal(20,8) not null,
  price decimal(20,8) not null,
  total decimal(20,8) not null,
  fee decimal(20,8) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create profile for new user
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');

  -- Create wallet for new user
  insert into public.wallets (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create RLS policies
alter table profiles enable row level security;
alter table wallets enable row level security;
alter table deposits enable row level security;
alter table withdrawals enable row level security;
alter table trades enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admin can view all profiles"
  on profiles for select
  using (auth.jwt() ->> 'role' = 'admin');

-- Wallets policies
create policy "Users can view their own wallet"
  on wallets for select
  using (auth.uid() = user_id);

create policy "Admin can view all wallets"
  on wallets for select
  using (auth.jwt() ->> 'role' = 'admin');

-- Deposits policies
create policy "Users can create deposits"
  on deposits for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own deposits"
  on deposits for select
  using (auth.uid() = user_id);

create policy "Admin can view all deposits"
  on deposits for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin can update deposits"
  on deposits for update
  using (auth.jwt() ->> 'role' = 'admin');

-- Withdrawals policies
create policy "Users can create withdrawals"
  on withdrawals for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own withdrawals"
  on withdrawals for select
  using (auth.uid() = user_id);

create policy "Admin can view all withdrawals"
  on withdrawals for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin can update withdrawals"
  on withdrawals for update
  using (auth.jwt() ->> 'role' = 'admin');

-- Trades policies
create policy "Users can view their own trades"
  on trades for select
  using (auth.uid() = user_id);

create policy "Admin can view all trades"
  on trades for select
  using (auth.jwt() ->> 'role' = 'admin'); 