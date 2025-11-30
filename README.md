# AptosHack - Sentiment-Based Trading Platform

A comprehensive full-stack trading platform built for the Aptos blockchain that combines sentiment analysis, perpetual trading, wallet tracking, and automated trading strategies.

## 🎯 Overview

AptosHack is an intelligent trading platform that enables users to:
- **Trade Perpetuals**: Execute long/short positions on Aptos perpetuals markets
- **Analyze Sentiment**: Track token sentiment from multiple sources
- **Monitor Wallets**: Track wallet balances, positions, and transaction history
- **Auto-Trade**: Deploy automated trading agents with customizable risk parameters
- **Track Influencers**: Monitor influencer mentions and social signals
- **Risk Management**: Built-in risk controls and position sizing

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │ Auto-Trade   │  │  Positions   │         │
│  │   Panel      │  │    Panel     │  │    Panel     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Tokens     │  │   Wallets    │  │ Influencers  │         │
│  │   Tracker    │  │   Tracker    │  │   Tracker    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Perps      │  │  CoinGecko   │  │   Wallet     │         │
│  │   Routes     │  │   Routes     │  │   Analyzer   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Adapters Layer                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │   Perps      │  │   DeFiLlama   │  │   Wallet     │  │  │
│  │  │  Adapter     │  │   Adapter     │  │  Analyzer    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Services Layer                        │  │
│  │  ┌──────────────┐  ┌──────────────┐                    │  │
│  │  │   Perps      │  │  CoinGecko   │                    │  │
│  │  │  Service     │  │   Service    │                    │  │
│  │  └──────────────┘  └──────────────┘                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Aptos      │    │   CoinGecko  │    │   Perps      │
│  Blockchain  │    │     API      │    │  Trading API │
│   (SDK)      │    │              │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

## 🚀 Features

### Trading
- **Perpetual Trading**: Open long/short positions with leverage
- **Order Management**: Place limit orders, track order history
- **Position Tracking**: Real-time position monitoring with PnL
- **Auto-Trading**: Deploy autonomous trading agents

### Analytics
- **Sentiment Analysis**: Multi-source sentiment scoring
- **Price Charts**: Historical price data (7D/30D/90D)
- **Market Data**: Real-time token prices and market metrics
- **Token Analysis**: Comprehensive token analysis charts

### Wallet Management
- **Multi-Wallet Support**: Track multiple Aptos wallets
- **Balance Tracking**: Real-time balance monitoring
- **Transaction History**: View recent deposits/withdrawals
- **Position Overview**: Aggregate position tracking

### Social Intelligence
- **Influencer Tracking**: Monitor influencer mentions
- **Social Signals**: Track Twitter volume and sentiment
- **Trend Detection**: Identify trending tokens

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Aptos Wallet** with private key
- **API Keys**:
  - Perps Trading Platform API key
  - CoinGecko API (optional, free tier available)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AptosHack
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
# Aptos Configuration
APTOS_PRIVATEKEY=your_aptos_private_key_here

# Perps Platform API
API_KEY=your_perps_api_key_here
PERPS_ENDPOINT=https://perps-tradeapi.kana.trade

# Server Configuration
PORT=3000
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional):

```env
VITE_API_URL=http://localhost:3000
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173 (or the port shown in terminal)
- **Backend API**: http://localhost:3000

### Production Build

**Backend:**
```bash
cd backend
npm run build
node dist/index.js
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
AptosHack/
├── backend/                    # Backend API Server
│   ├── src/
│   │   ├── adapters/          # External API adapters
│   │   │   ├── DefiLlamaAdapter.ts
│   │   │   ├── PerpsAdapter.ts
│   │   │   └── WalletAnalyzer.ts
│   │   ├── Routes/            # Express route handlers
│   │   │   ├── perps.ts       # Perpetuals trading endpoints
│   │   │   └── coingecko.ts   # CoinGecko data endpoints
│   │   ├── services/          # Business logic services
│   │   │   ├── PerpsService.ts
│   │   │   └── coingecko.ts
│   │   ├── utils/             # Utility functions
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   ├── logger.ts
│   │   │   ├── setup.ts
│   │   │   └── types.ts
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React Frontend Application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   ├── tokens/        # Token-related components
│   │   │   ├── trades/        # Trading components
│   │   │   ├── wallets/       # Wallet components
│   │   │   ├── influencers/   # Influencer tracking
│   │   │   └── ui/            # shadcn/ui components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── store/             # Zustand state management
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility libraries
│   │   └── wallet/            # Aptos wallet integration
│   ├── package.json
│   └── vite.config.ts
│
└── README.md                   # This file
```

## 🔌 API Endpoints

### Perpetuals Trading (`/api/v1/perps`)

- `POST /openLong` - Open a long position
  ```json
  {
    "marketId": 14,
    "leverage": 5,
    "address": "0x..."
  }
  ```

- `POST /openShort` - Open a short position
  ```json
  {
    "marketId": 14,
    "leverage": 5,
    "address": "0x..."
  }
  ```

- `GET /getPositions?address=0x...` - Get user positions

- `GET /getOrderHistory?address=0x...` - Get order history

- `POST /deposit` - Deposit funds
  ```json
  {
    "amount": 1000,
    "userAddress": "0x..."
  }
  ```

### CoinGecko Data (`/api/v1/coingecko`)

- `GET /getFearGreedIndex` - Get crypto fear & greed index
- `GET /getTokenPriceInUsd?tokenAddress=0x...` - Get token price
- `GET /getAptosBalance?address=0x...` - Get Aptos balance
- `GET /getHistoricalPrice` - Get historical price data

## 🔧 Key Technologies

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **@aptos-labs/ts-sdk** - Aptos blockchain SDK
- **Axios** - HTTP client
- **dotenv** - Environment variables

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Query** - Data fetching
- **Recharts** - Charting library
- **React Router** - Routing

## 🔒 Security Notes

- **Never commit `.env` files** - They contain sensitive credentials
- Keep private keys secure and never share them
- Use environment-specific API keys for different environments
- Consider using a secrets management service for production
- Validate all user inputs on the backend
- Implement rate limiting for API endpoints

## 🧪 Development

### Code Style
- TypeScript strict mode enabled
- ESLint for code quality
- Consistent naming conventions

### Testing
- Add unit tests for services and adapters
- Integration tests for API endpoints
- E2E tests for critical user flows

## 📝 Usage Examples

### Opening a Long Position

```typescript
// Frontend
import { openLongPosition } from '@/services/perpAction';

const result = await openLongPosition({
  marketId: 14, // APT market
  leverage: 5,
  address: userAddress
});
```

### Getting Positions

```typescript
// Backend
import { PerpsAdapter } from './adapters/PerpsAdapter';

const adapter = new PerpsAdapter();
const positions = await adapter.getPositions(userAddress);
```

### Fetching Token Price

```typescript
// Backend
import { fetchTokenPriceInUsd } from './services/coingecko';

const price = await fetchTokenPriceInUsd(APT_TOKEN_ADDRESS);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Aptos Labs for the Aptos blockchain SDK
- CoinGecko for market data APIs
- shadcn for the UI component library
- The open-source community

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for the Aptos ecosystem**

