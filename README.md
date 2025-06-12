# GCrypto Trading Platform

A professional cryptocurrency trading platform built with React, TypeScript, Chakra UI, and Supabase.

## Tech Stack

- Frontend: React
- Backend: Node.js
- Database & Auth: Supabase
- API Integration: CoinGecko

## Features

- 🔐 User Authentication (Supabase Auth)
- 💰 Manual Deposit System with Admin Verification
- 📈 BTC/USDT Spot Trading Simulation
- 📊 User Dashboard with Balance & Trade History
- 👑 Admin Dashboard for Platform Management
- 📤 Manual Withdrawal Request System
- 💬 Real-time Live Chat System with Admin Support
- 🔄 Live Price Integration via CoinGecko

## Getting Started

1. Clone the repository:
```bash
git clone [repository-url]
cd gcrypto
```

2. Install dependencies:
```bash
npm run install-all
```

3. Set up environment variables:
- Create `.env` files in both `client` and `server` directories
- Add necessary environment variables (see `.env.example` files)

4. Start development servers:
```bash
npm run dev
```

## Environment Variables

### Frontend (.env in client directory)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend (.env in server directory)
```
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Color Palette

- Background: #000000 (Black)
- Primary: #f7a600 (Orange)
- Accent: #f5f7fa (Light Grey)
- White: #ffffff

## Project Structure

```
gcrypto/
├── client/              # React frontend
├── server/              # Node.js backend
├── package.json         # Root package.json
└── README.md           # Project documentation
```

## 🚀 Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account
- Supabase project set up

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard
   - Deploy!

### Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
VITE_API_URL=https://api.coingecko.com/api/v3
VITE_APP_NAME=GCrypto Trading Platform
VITE_APP_VERSION=1.0.0
```

## License

MIT