export interface TradeSignal {
  token: string;
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
}

