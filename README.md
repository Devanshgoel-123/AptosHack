# AptosHack: Sentenex Sentiment Trader

### AI agent that reads market sentiment and trades perpetuals on Aptos

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express-000?logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/GPT--4o-412991?logo=openai&logoColor=white)
![Aptos](https://img.shields.io/badge/Aptos-000?logo=aptos&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

Sentenex combines live market data, GPT-4o sentiment analysis, and Aptos on-chain metrics into a **LONG / SHORT / HOLD** call with a confidence score and a suggested leverage. In auto-trade mode it opens and manages positions on [Kana Perps](https://kana.trade) for you, within the risk limits you set.

## Architecture

```mermaid
flowchart LR
    subgraph FE["frontend/ (React + Vite + shadcn/ui)"]
        Dash["Dashboard<br/>sentiment summary · strategy<br/>risk panel · influencer tracker"]
        Auto["Auto-trade panel<br/>positions · trade log"]
        W["Aptos wallet adapter"]
    end

    subgraph AI["ai-analyzer/ (FastAPI)"]
        AAPI["/api/analyze · /api/activate<br/>/api/deactivate · /api/status · /api/historical"]
        MD["market_data.py<br/>CoinMarketCap"]
        SA["sentiment_analyzer.py<br/>GPT-4o"]
        OC["aptos_analyzer.py<br/>on-chain metrics"]
        DE["decision_engine.py<br/>weighted signal → LONG/SHORT/HOLD<br/>confidence · leverage"]
        PM["position_manager.py<br/>stop-loss · take-profit"]
    end

    subgraph BE["backend/ (Express + TypeScript)"]
        BAPI["/api/v1/perps<br/>openLong · openShort · deposit<br/>getPositions · getOrderHistory"]
        CG["/api/v1/coingecko<br/>prices · fear and greed · balances"]
        PA["PerpsAdapter"]
    end

    Dash --> AAPI
    Auto --> AAPI
    Dash --> CG
    AAPI --> MD & SA & OC --> DE --> PM
    PM -- "execute" --> BAPI
    Auto --> BAPI
    BAPI --> PA --> Kana["Kana Perps API"]
    PA --> Aptos["Aptos fullnode"]
    CG --> Ext["CoinGecko · Binance · DefiLlama"]
    W -. "sign" .-> Aptos
```

**Signal pipeline**

1. **Market data.** Price, volume, market cap, and 1h/24h/7d change from CoinMarketCap.
2. **Sentiment.** GPT-4o scores the news and social context for the token.
3. **On-chain.** Activity metrics from the Aptos chain.
4. **Decision engine.** Weights the three signals into a single score. It returns a recommendation, a confidence level, a suggested leverage, and an estimated PnL for the amount you entered.
5. **Execution.** Once you activate the agent, the position manager opens longs or shorts through the backend's Kana Perps adapter and enforces stop-loss and take-profit.

## Repository layout

| Folder | Stack | Role |
|---|---|---|
| [`frontend/`](frontend) | React, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query | Trading dashboard and wallet connection |
| [`backend/`](backend) | Node.js, Express, TypeScript, Aptos TS SDK | Perps execution on Kana, price and balance endpoints |
| [`ai-analyzer/`](ai-analyzer) | Python, FastAPI, OpenAI, httpx, Docker | Sentiment and on-chain analysis, decision engine |

Each folder has its own README with full setup steps.

## Quick start

```bash
git clone https://github.com/Devanshgoel-123/AptosHack.git && cd AptosHack

# 1. AI analyzer (port 8000)
cd ai-analyzer && pip install -r requirements.txt
cp env.example .env              # CMC_API_KEY, OPENAI_API_KEY
python app.py                    # or ./run-docker.sh

# 2. Backend (port 3000)
cd ../backend && npm install
cp .env.example .env             # APTOS_PRIVATE_KEY, PERPS_API_KEY, COINMARKETCAP_API_KEY
npm run dev

# 3. Frontend
cd ../frontend && npm install
npm run dev                      # set VITE_API_URL if the backend isn't on :3000
```

Interactive API docs for the analyzer are at `http://localhost:8000/docs`.

> ⚠️ This is a hackathon project and not financial advice. Use a dedicated test wallet with small amounts when running auto-trade.
