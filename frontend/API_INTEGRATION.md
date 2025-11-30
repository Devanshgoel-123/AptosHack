# API Integration Guide

## ✅ Integration Complete!

The frontend is now fully integrated with the Perp DEX Agent API.

## 🚀 How to Use

### 1. Start the Backend API

```bash
cd /Users/soumikbaksi/Desktop/Sentenex
source venv/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port 8001
```

### 2. Start the Frontend

```bash
cd /Users/soumikbaksi/Desktop/crypto-sentiment-trader
npm install  # if needed
npm run dev
```

The frontend will run on `http://localhost:8080` (or the port shown in terminal).

### 3. Configure API URL (Optional)

If your API is running on a different URL, create a `.env` file:

```bash
VITE_API_URL=http://localhost:8001
```

Or update the API_BASE_URL in `src/services/api.ts`.

## 🎯 Using the Auto-Trade Panel

1. **Select a Token** - Click on any token card to select it
2. **Configure Settings**:
   - **Token**: The token you want to trade (e.g., APT, BTC, ETH)
   - **Collateral**: Choose USDC or USDT
   - **Portfolio Amount**: How much stablecoin to use
   - **Risk Level**: Conservative, Moderate, or Aggressive
3. **Toggle the Switch** - Turn ON to activate the agent
4. **Monitor Results** - The panel will show:
   - Current recommendation (LONG/SHORT/HOLD)
   - Confidence percentage
   - Signal score
   - Execution signals (when positions open/close)
   - Position info (PnL if position is open)
   - Current market price

## 📊 Features

- ✅ **Real-time Polling**: Updates every 1 second when active
- ✅ **Auto-execution**: Agent automatically opens/closes positions based on signals
- ✅ **Position Tracking**: Shows current position status and PnL
- ✅ **Risk Management**: Three risk levels (conservative, moderate, aggressive)
- ✅ **Visual Indicators**: Color-coded recommendations (green=LONG, red=SHORT, yellow=HOLD)

## 🔧 API Endpoints Used

- `POST /api/activate` - Activate the agent
- `POST /api/deactivate` - Deactivate the agent
- `POST /api/analyze` - Get latest analysis (polled every 1 second)

## 🐛 Troubleshooting

### API Connection Error
- Make sure the backend is running on port 8001
- Check CORS settings if running on different domains
- Verify the API URL in `.env` or `api.ts`

### Agent Not Activating
- Ensure all fields are filled (token, amount > 0)
- Check browser console for errors
- Verify backend is running and accessible

### No Updates Showing
- Check if agent is activated (switch should be ON)
- Look for errors in browser console
- Verify polling is working (check Network tab)

## 📝 Notes

- The agent runs in the background on the server
- Frontend polls for updates every 1 second
- When you deactivate, polling stops and the agent stops monitoring
- All settings are disabled when the agent is active (to prevent conflicts)

