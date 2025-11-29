# Sentiment Trader Backend

An autonomous trading agent backend that analyzes sentiment and executes trades on Aptos perpetuals platform.

## 🚀 Features

- **Sentiment Analysis**: Analyze token sentiment from various sources
- **Trading Signals**: Generate buy/sell/hold signals based on sentiment scores
- **Risk Management**: Built-in risk controls and position sizing
- **Perpetuals Trading**: Execute long/short positions on Aptos perps platform
- **Wallet Analysis**: Analyze wallet token distributions
- **Autonomous Agent**: X402Agent for autonomous decision-making

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Aptos wallet with private key
- API keys for:
  - Perps platform API
  - Twitter API (optional)
  - CoinMarketCap API (optional)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AptosHack/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your actual credentials (see Configuration section)

## ⚙️ Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# Aptos Configuration
APTOS_PRIVATEKEY=your_aptos_private_key_here

# Perps Platform API
API_KEY=your_perps_api_key_here

# Twitter API (Optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret

# CoinMarketCap API (Optional)
CMC_API_KEY=your_cmc_api_key

# Perps Platform URL (Optional, defaults to production)
PERPS_PLATFORM_URL=https://perps-tradeapi.kanalabs.io

# Wallet Private Key (Optional, can use APTOS_PRIVATEKEY)
WALLET_PRIVATE_KEY=your_wallet_private_key
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```


## 📁 Project Structure

```
backend/
├── src/
│   ├── adapters/          # External API adapters
│   │   ├── DefiLlamaAdapter.ts
│   │   ├── PerpsAdapter.ts
│   │   └── WalletAnalyzer.ts
│   ├── agents/            # Autonomous agents
│   │   └── X402Agent.ts
│   ├── config/            # Configuration files
│   │   └── settings.ts
│   ├── core/              # Core engine
│   │   └── Engine.ts
│   ├── models/            # TypeScript interfaces
│   │   ├── SentimentResult.ts
│   │   └── TradeSignal.ts
│   ├── services/          # Business logic services
│   │   ├── PerpsService.ts
│   │   ├── RiskService.ts
│   │   ├── SentimentService.ts
│   │   └── SignalService.ts
│   ├── utils/             # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── logger.ts
│   │   └── setup.ts
│   └── index.ts           # Entry point
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Key Components

### Adapters
- **PerpsAdapter**: Handles perpetuals trading operations (open long/short, get positions)
- **DefiLlamaAdapter**: Fetches market data and price history
- **WalletAnalyzer**: Analyzes wallet token distributions

### Services
- **PerpsService**: Core trading service for executing transactions
- **SentimentService**: Analyzes token sentiment
- **SignalService**: Generates trading signals
- **RiskService**: Manages risk and position sizing

### Agents
- **X402Agent**: Autonomous agent that observes, decides, and acts

## 📝 Usage Examples

### Opening a Long Position
```typescript
import { PerpsAdapter } from './adapters/PerpsAdapter';

const adapter = new PerpsAdapter();
const success = await adapter.openLong(marketId, size, leverage);
```

### Getting Positions
```typescript
const positions = await adapter.getPositions(userAddress);
```

### Depositing Funds
```typescript
const depositSuccess = await adapter.deposit(amount, userAddress);
```

## 🔒 Security Notes

- **Never commit your `.env` file** - it contains sensitive credentials
- Keep your private keys secure and never share them
- Use environment-specific API keys for different environments
- Consider using a secrets management service for production

## 🧪 Development

The project uses:
- **TypeScript** for type safety
- **ES Modules** (ESM) for modern JavaScript
- **Aptos TypeScript SDK** for blockchain interactions
- **Axios** for HTTP requests
- **dotenv** for environment variable management

