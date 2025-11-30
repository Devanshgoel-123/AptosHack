import { create } from 'zustand';
import type { AnalysisResponse } from '@/services/api';

interface AnalysisState {
  analysisData: AnalysisResponse | null;
  isActive: boolean;
  token: string;
  stablecoin: string;
  portfolioAmount: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  priceHistory: Array<{ time: string; price: number; timestamp: number }>;
  
  // Actions
  setAnalysisData: (data: AnalysisResponse | null) => void;
  setIsActive: (active: boolean) => void;
  setToken: (token: string) => void;
  setStablecoin: (stablecoin: string) => void;
  setPortfolioAmount: (amount: number) => void;
  setRiskLevel: (level: 'conservative' | 'moderate' | 'aggressive') => void;
  addPricePoint: (point: { time: string; price: number; timestamp: number }) => void;
  updateLastPricePoint: (price: number, timestamp: number) => void;
  clearPriceHistory: () => void;
  reset: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // Initial state
  analysisData: null,
  isActive: false,
  token: 'APT',
  stablecoin: 'USDC',
  portfolioAmount: 100.0,
  riskLevel: 'moderate',
  priceHistory: [],

  // Actions
  setAnalysisData: (data) => {
    // Always create a deep copy to ensure React detects the change
    // This is critical for Zustand to trigger re-renders
    if (!data) {
      set({ analysisData: null });
      return;
    }
    // Deep clone the entire object to ensure new reference
    const newData = {
      ...data,
      market_data: data.market_data ? { ...data.market_data } : undefined,
      sentiment_data: data.sentiment_data ? { ...data.sentiment_data } : undefined,
      onchain_data: data.onchain_data ? { ...data.onchain_data } : undefined,
      execution_signal: data.execution_signal ? { ...data.execution_signal } : undefined,
      position_info: data.position_info ? { ...data.position_info } : undefined,
      perp_trade_details: data.perp_trade_details ? { ...data.perp_trade_details } : undefined,
    };
    set({ analysisData: newData });
  },
  
  setIsActive: (active) => set({ isActive: active }),
  
  setToken: (token) => set({ token }),
  
  setStablecoin: (stablecoin) => set({ stablecoin }),
  
  setPortfolioAmount: (amount) => set({ portfolioAmount: amount }),
  
  setRiskLevel: (level) => set({ riskLevel: level }),
  
  addPricePoint: (point) => set((state) => {
    const updated = [...state.priceHistory, point];
    // Keep only last 60 points
    return { priceHistory: updated.slice(-60) };
  }),
  
  updateLastPricePoint: (price, timestamp) => set((state) => {
    if (state.priceHistory.length === 0) {
      return { 
        priceHistory: [{ 
          time: new Date(timestamp).toLocaleTimeString(), 
          price, 
          timestamp 
        }] 
      };
    }
    const updated = [...state.priceHistory];
    const lastIndex = updated.length - 1;
    updated[lastIndex] = {
      ...updated[lastIndex],
      price,
      time: new Date(timestamp).toLocaleTimeString(),
    };
    return { priceHistory: updated };
  }),
  
  clearPriceHistory: () => set({ priceHistory: [] }),
  
  reset: () => set({
    analysisData: null,
    isActive: false,
    priceHistory: [],
  }),
}));

