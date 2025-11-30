// Mock API services for the trading dashboard

export async function fetchMockTokens() {
  return [
    { symbol: 'APT', name: 'Aptos', price: 8.42, market: 'Crypto', liquidityUsd: 45000000, change24h: 5.2 },
    { symbol: 'MEME', name: 'Meme Coin', price: 0.0042, market: 'Meme', liquidityUsd: 1200000, change24h: -2.1 },
    { symbol: 'PRIV', name: 'Privacy Token', price: 12.34, market: 'Privacy', liquidityUsd: 8900000, change24h: 8.7 },
    { symbol: 'ZLA', name: 'Zilla', price: 0.89, market: 'Gaming', liquidityUsd: 560000, change24h: 15.3 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.12, market: 'Meme', liquidityUsd: 89000000, change24h: -0.8 },
  ];
}

export async function fetchMockWallets() {
  return [
    { address: '0x1234...5678', name: 'Main Wallet', tokens: ['APT', 'MEME'], value: 12450.50 },
    { address: '0xabcd...efgh', name: 'Trading Wallet', tokens: ['PRIV', 'ZLA'], value: 8920.25 },
  ];
}

export async function fetchMockSentiment(symbol: string) {
  const sentiments: Record<string, any> = {
    APT: { score: 0.85, twitter: 'Bullish', twitterVolume: 45000, cmc: { rank: 35 }, greedFear: 72 },
    MEME: { score: 0.92, twitter: 'Very Bullish', twitterVolume: 128000, cmc: { rank: 156 }, greedFear: 85 },
    PRIV: { score: 0.65, twitter: 'Neutral', twitterVolume: 12000, cmc: { rank: 89 }, greedFear: 58 },
    ZLA: { score: 0.78, twitter: 'Bullish', twitterVolume: 8500, cmc: { rank: 245 }, greedFear: 68 },
    DOGE: { score: 0.55, twitter: 'Mixed', twitterVolume: 98000, cmc: { rank: 12 }, greedFear: 52 },
  };
  
  return sentiments[symbol] || { score: 0.5, twitter: 'Unknown', twitterVolume: 0, cmc: { rank: 999 }, greedFear: 50 };
}

// --- Aptos helpers (live data with graceful fallback) ---
const APTOS_NODE = "https://fullnode.mainnet.aptoslabs.com/v1";

export async function fetchAptosBalance(address: string): Promise<number> {
  try {
    const res = await fetch(
      `${APTOS_NODE}/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`
    );
    if (!res.ok) throw new Error("balance not found");
    const json = await res.json();
    const octas = BigInt(json.data?.coin?.value ?? "0");
    return Number(octas) / 1e8; // 1 APT = 1e8 Octas
  } catch (e) {
    // fallback mock
    return 0;
  }
}

export type SimpleTransfer = {
  id: string;
  direction: "IN" | "OUT";
  amountApt: number;
  version?: string; // aptos tx version
};

export async function fetchAptosRecentTransfers(
  address: string,
  limit = 5,
): Promise<SimpleTransfer[]> {
  try {
    const enc = encodeURIComponent(
      "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
    );
    const [withdrawRes, depositRes] = await Promise.all([
      fetch(
        `${APTOS_NODE}/accounts/${address}/events/${enc}/withdraw_events?limit=${limit}`,
      ),
      fetch(
        `${APTOS_NODE}/accounts/${address}/events/${enc}/deposit_events?limit=${limit}`,
      ),
    ]);

    const withdraws = (withdrawRes.ok ? await withdrawRes.json() : []) as any[];
    const deposits = (depositRes.ok ? await depositRes.json() : []) as any[];

    const mapEvents = (evts: any[], dir: "IN" | "OUT") =>
      evts.map((e) => ({
        id: `${dir}-${e.sequence_number ?? Math.random()}`,
        direction: dir,
        amountApt: Number(e.data?.amount ?? 0) / 1e8,
        version: e.version,
      }));

    const combined = [...mapEvents(withdraws, "OUT"), ...mapEvents(deposits, "IN")];
    // Sort by sequence_number desc if present
    combined.sort((a, b) => {
      const anum = Number(String(a.id).split("-")[1] ?? 0);
      const bnum = Number(String(b.id).split("-")[1] ?? 0);
      return bnum - anum;
    });
    return combined.slice(0, limit);
  } catch (e) {
    return [];
  }
}

export async function fetchAptPriceUsd(): Promise<number> {
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=aptos&vs_currencies=usd",
    );
    if (r.ok) {
      const j = await r.json();
      const p = Number(j?.aptos?.usd);
      if (!Number.isNaN(p) && p > 0) return p;
    }
  } catch {}
  try {
    const r2 = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=APTUSDT");
    if (r2.ok) {
      const j2 = await r2.json();
      const p2 = Number(j2?.price);
      if (!Number.isNaN(p2) && p2 > 0) return p2;
    }
  } catch {}
  return 0;
}

// --- Perp DEX Agent API ---
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export interface ActivateAgentRequest {
  token: string;
  stablecoin: string;
  portfolio_amount: number;
  risk_level: "conservative" | "moderate" | "aggressive";
}

export interface AnalysisResponse {
  token: string;
  stablecoin: string;
  portfolio_amount: number;
  risk_level: string;
  recommendation: "LONG" | "SHORT" | "HOLD";
  confidence: number;
  signal_score: number;
  execution_signal?: {
    action?: string;
    should_open?: boolean;
    should_close?: boolean;
    exit_conditions?: string[];
  };
  position_info?: {
    status: "open" | "closed" | "none";
    type?: "LONG" | "SHORT";
    pnl_usd?: number;
    pnl_pct?: number;
  };
  perp_trade_details?: any;
  market_data?: any;
  sentiment_data?: any;
  onchain_data?: any;
  timestamp?: string;
  iteration?: number;
  agent_status?: string;
}

export async function activateAgent(request: ActivateAgentRequest): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to activate agent" }));
    throw new Error(error.detail || "Failed to activate agent");
  }
  return response.json();
}

export async function deactivateAgent(
  token: string,
  stablecoin: string,
  portfolio_amount: number
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/deactivate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, stablecoin, portfolio_amount }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to deactivate agent" }));
    throw new Error(error.detail || "Failed to deactivate agent");
  }
  return response.json();
}

export async function analyzePerpTrade(request: ActivateAgentRequest): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to analyze" }));
    throw new Error(error.detail || "Failed to analyze");
  }
  return response.json();
}

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  date: string;
}

export interface HistoricalDataResponse {
  token: string;
  days: number;
  data: HistoricalDataPoint[];
  count: number;
}

export async function fetchHistoricalData(
  token: string,
  days: number = 30
): Promise<HistoricalDataResponse> {
  const response = await fetch(`${API_BASE_URL}/api/historical/${token}?days=${days}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to fetch historical data" }));
    throw new Error(error.detail || "Failed to fetch historical data");
  }
  return response.json();
}
