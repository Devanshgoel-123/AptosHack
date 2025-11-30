import { Settings, Play, Pause, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAptosWallet } from "@/wallet/aptosWallet";
import { useState, useEffect, useRef, useCallback } from "react";
import { activateAgent, deactivateAgent, analyzePerpTrade, type AnalysisResponse } from "@/services/api";
import { toast } from "sonner";
import { useAnalysisStore } from "@/store/analysisStore";
import { openLong, openShort, getMarketId } from "@/services/perpAction";


interface AutoTradePanelProps {
  selectedToken: any;
  onAnalysisUpdate?: (data: AnalysisResponse | null) => void;
}

// Cooldown constant - 2 minutes between trades
const MIN_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

export default function AutoTradePanel({ selectedToken, onAnalysisUpdate }: AutoTradePanelProps) {
  // Use Zustand store for state management - use selectors for better performance
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const isActive = useAnalysisStore((state) => state.isActive);
  const token = useAnalysisStore((state) => state.token);
  const stablecoin = useAnalysisStore((state) => state.stablecoin);
  const portfolioAmount = useAnalysisStore((state) => state.portfolioAmount);
  const riskLevel = useAnalysisStore((state) => state.riskLevel);
  const analysisData = useAnalysisStore((state) => state.analysisData);
  const priceHistory = useAnalysisStore((state) => state.priceHistory);
  const setIsActive = useAnalysisStore((state) => state.setIsActive);
  const setToken = useAnalysisStore((state) => state.setToken);
  const setStablecoin = useAnalysisStore((state) => state.setStablecoin);
  const setPortfolioAmount = useAnalysisStore((state) => state.setPortfolioAmount);
  const setRiskLevel = useAnalysisStore((state) => state.setRiskLevel);
  const setAnalysisData = useAnalysisStore((state) => state.setAnalysisData);
  const addPricePoint = useAnalysisStore((state) => state.addPricePoint);
  const updateLastPricePoint = useAnalysisStore((state) => state.updateLastPricePoint);
  const clearPriceHistory = useAnalysisStore((state) => state.clearPriceHistory);
  
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const executedSignalsRef = useRef<Set<string>>(new Set()); // Track executed signals to prevent duplicates
  const lastTradeExecutionTimeRef = useRef<number | null>(null); // Track last trade execution timestamp

  // Update token when selectedToken changes and get wallet address
  useEffect(() => {
    if (selectedToken?.symbol) {
      setToken(selectedToken.symbol.toUpperCase());
    }
    
    // Get wallet address
    const fetchWalletAddress = async () => {
      try {
        const wallet = getAptosWallet();
        if (wallet) {
          const account = await wallet.account();
          console.log(account);
          if (account?.address) {
            setUserAddress(account.address);
          }
        }
      } catch (error) {
        console.error("Error fetching wallet address:", error);
      }
    };
    
    fetchWalletAddress();
  }, [selectedToken]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const startPolling = async () => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    // Poll immediately
    await pollAnalysis();
    
    // Then poll every 30 seconds
    pollingIntervalRef.current = setInterval(async () => {
      await pollAnalysis();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  /**
   * Calculate leverage based on risk level
   */
  const getLeverage = (riskLevel: string): number => {
    switch (riskLevel) {
      case "conservative":
        return 1;
      case "moderate":
        return 2;
      case "aggressive":
        return 4;
      default:
        return 2;
    }
  };

  /**
   * Calculate position size based on portfolio amount and leverage
   */
  const getPositionSize = (portfolioAmount: number, leverage: number): number => {
    // Use a percentage of portfolio (e.g., 80% of portfolio)
    const positionPercentage = 0.8;
    return portfolioAmount * positionPercentage * leverage;
  };

  /**
   * Execute trade when signal is generated
   */
  const executeTrade = useCallback(async (data: AnalysisResponse) => {
    // Check cooldown FIRST - before any other checks
    const now = Date.now();
    console.log("lastTradeExecutionTimeRef.current", lastTradeExecutionTimeRef.current);
    console.log("now", now);
    console.log("MIN_COOLDOWN_MS", MIN_COOLDOWN_MS);
    if (lastTradeExecutionTimeRef.current !== null) {
      const timeSinceLastTrade = now - lastTradeExecutionTimeRef.current;
      if (timeSinceLastTrade < MIN_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((MIN_COOLDOWN_MS - timeSinceLastTrade) / 1000);
        console.log(`[COOLDOWN] Trade cooldown active. Please wait ${remainingSeconds} more seconds before executing another trade.`);
        return;
      }
    }

    // Check if user address is available
    if (!userAddress) {
      console.log("User address not available, skipping trade execution");
      return;
    }

    // Determine side from recommendation - execute when LONG or SHORT
    const side = data.recommendation;
    if (side !== "LONG" && side !== "SHORT") {
      console.log("Recommendation is HOLD, skipping trade execution");
      return;
    }

    // Create a unique key for this signal to prevent duplicate executions
    // Use iteration number if available, otherwise use timestamp
    const signalKey = `${data.iteration !== undefined ? data.iteration : data.timestamp || Date.now()}-${side}-${data.execution_signal?.action || ''}`;
    
    // Skip if we've already executed this signal
    if (executedSignalsRef.current.has(signalKey)) {
      console.log("Signal already executed, skipping duplicate");
      return;
    }

    // Check if there's already an open position
    if (data.position_info?.status === "open") {
      console.log("Position already open, skipping trade execution");
      return;
    }

    // Get market ID for the token
    const marketId = getMarketId(token);
    if (!marketId) {
      toast.error(`Market ID not found for token ${token}`);
      return;
    }

    // Calculate leverage
    const leverage = getLeverage(riskLevel);

    // Final cooldown check right before API call as a safety guard
    const finalCheckTime = Date.now();
    if (lastTradeExecutionTimeRef.current !== null) {
      const timeSinceLastTrade = finalCheckTime - lastTradeExecutionTimeRef.current;
      if (timeSinceLastTrade < MIN_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((MIN_COOLDOWN_MS - timeSinceLastTrade) / 1000);
        console.warn(`[FINAL CHECK] Cooldown still active! Blocking trade. Wait ${remainingSeconds} more seconds.`);
        return;
      }
    }

    try {
      toast.info(`Executing ${side} position for ${token}...`);
      console.log(`[TRADE EXECUTION] Executing ${side} trade:`, { 
        marketId, 
        address: userAddress, 
        leverage,
        timestamp: new Date().toISOString(),
        timeSinceLastTrade: lastTradeExecutionTimeRef.current ? finalCheckTime - lastTradeExecutionTimeRef.current : 'N/A'
      });
      
      let result;
      if (side === "LONG") {
        result = await openLong(marketId, userAddress, leverage);
        console.log("[TRADE EXECUTION] Long position opened:", result);
      } else if (side === "SHORT") {
        result = await openShort(marketId, userAddress, leverage);
        console.log("[TRADE EXECUTION] Short position opened:", result);
      }

      // Mark this signal as executed and update last trade execution time
      executedSignalsRef.current.add(signalKey);
      const executionTimestamp = Date.now();
      lastTradeExecutionTimeRef.current = executionTimestamp;
      
      toast.success(`${side} position opened successfully!`);
      console.log(`[TRADE EXECUTION] Trade executed successfully at ${new Date(executionTimestamp).toISOString()}:`, result);
      console.log(`[COOLDOWN] Next trade can be executed after ${new Date(executionTimestamp + MIN_COOLDOWN_MS).toISOString()}`);
    } catch (error: any) {
      console.error("Error executing trade:", error);
      toast.error(`Failed to open ${side} position: ${error.message || error}`);
    }
  }, [token, portfolioAmount, riskLevel, userAddress]);

  const pollAnalysis = useCallback(async () => {
    try {
      const data = await analyzePerpTrade({
        token,
        stablecoin,
        portfolio_amount: portfolioAmount,
        risk_level: riskLevel,
      });
      
      // Create new object with timestamp to ensure React detects change
      const updatedData = {
        ...data,
        _updateTimestamp: Date.now(),
        timestamp: data.timestamp || new Date().toISOString(),
      };
      
      // Update Zustand store - this will trigger smooth updates in all components
      setAnalysisData(updatedData);
      
      // Execute trade when recommendation is LONG or SHORT from AI analysis
      // Check cooldown before calling executeTrade to avoid unnecessary function calls
      const canExecuteTrade = lastTradeExecutionTimeRef.current === null || 
        (Date.now() - lastTradeExecutionTimeRef.current >= MIN_COOLDOWN_MS);
      
      if ((updatedData.recommendation === "LONG" || updatedData.recommendation === "SHORT") && canExecuteTrade) {
        await executeTrade(updatedData);
      } else if ((updatedData.recommendation === "LONG" || updatedData.recommendation === "SHORT") && !canExecuteTrade) {
        const remainingSeconds = Math.ceil((MIN_COOLDOWN_MS - (Date.now() - (lastTradeExecutionTimeRef.current || 0))) / 1000);
        console.log(`[POLL] Signal received but cooldown active. Waiting ${remainingSeconds} more seconds.`);
      }
      
      // Add price point to history for smooth chart updates
      if (updatedData.market_data?.price) {
        const timestamp = Date.now();
        const lastPoint = priceHistory[priceHistory.length - 1];
        const timeSinceLastUpdate = lastPoint ? timestamp - lastPoint.timestamp : 1000;
        
        // If less than 1 second, update the last point (smooth candle update like Binance)
        if (lastPoint && timeSinceLastUpdate < 1000) {
          updateLastPricePoint(updatedData.market_data.price, timestamp);
        } else {
          // Add new point
          addPricePoint({
            time: new Date(timestamp).toLocaleTimeString(),
            price: updatedData.market_data.price,
            timestamp,
          });
        }
      }
      
      // Also call the callback for backward compatibility
      if (onAnalysisUpdate) {
        onAnalysisUpdate(updatedData);
      }
    } catch (error: any) {
      console.error("Polling error:", error);
      // Don't show toast on every polling error to avoid spam
    }
  }, [token, stablecoin, portfolioAmount, riskLevel, setAnalysisData, addPricePoint, updateLastPricePoint, priceHistory, onAnalysisUpdate, executeTrade]);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      // Activate
      setIsLoading(true);
      try {
        await activateAgent({
          token,
          stablecoin,
          portfolio_amount: portfolioAmount,
          risk_level: riskLevel,
        });
        setIsActive(true);
        // Clear executed signals and reset cooldown when reactivating
        executedSignalsRef.current.clear();
        lastTradeExecutionTimeRef.current = null;
        toast.success(`Agent activated for ${token}`);
        // Clear previous data
        setAnalysisData(null);
        if (onAnalysisUpdate) {
          onAnalysisUpdate(null);
        }
        // Start polling after a short delay to ensure backend is ready
        setTimeout(() => {
          startPolling();
        }, 500);
      } catch (error: any) {
        toast.error(error.message || "Failed to activate agent");
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Deactivate
      setIsLoading(true);
      try {
        stopPolling();
        await deactivateAgent(token, stablecoin, portfolioAmount);
        setIsActive(false);
        // Clear executed signals and reset cooldown when deactivating
        executedSignalsRef.current.clear();
        lastTradeExecutionTimeRef.current = null;
        setAnalysisData(null);
        if (onAnalysisUpdate) {
          onAnalysisUpdate(null);
        }
        toast.success("Agent deactivated");
      } catch (error: any) {
        toast.error(error.message || "Failed to deactivate agent");
        setIsActive(true); // Revert if failed
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRecommendationIcon = () => {
    if (!analysisData) return null;
    const rec = analysisData.recommendation;
    if (rec === "LONG") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rec === "SHORT") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getRecommendationColor = () => {
    if (!analysisData) return "text-muted-foreground";
    const rec = analysisData.recommendation;
    if (rec === "LONG") return "text-green-500";
    if (rec === "SHORT") return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <Card className="p-6 shadow-lg border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Perp DEX Agent</h3>
      </div>

      <div className="space-y-4">
        {/* Token Selection */}
        <div className="space-y-2">
          <Label htmlFor="token">Token to Trade</Label>
          <Input
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value.toUpperCase())}
            placeholder="APT, BTC, ETH..."
            disabled={isActive}
          />
        </div>

        {/* Stablecoin Selection */}
        <div className="space-y-2">
          <Label htmlFor="stablecoin">Collateral (Stablecoin)</Label>
          <Select value={stablecoin} onValueChange={setStablecoin} disabled={isActive}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USDC">USDC</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Portfolio Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount">Portfolio Amount ({stablecoin})</Label>
          <Input
            id="amount"
            type="number"
            value={portfolioAmount}
            onChange={(e) => setPortfolioAmount(parseFloat(e.target.value) || 0)}
            placeholder="100.0"
            min="0"
            step="0.1"
            disabled={isActive}
          />
        </div>

        {/* Risk Level */}
        <div className="space-y-2">
          <Label htmlFor="risk">Risk Level</Label>
          <Select value={riskLevel} onValueChange={(v: any) => setRiskLevel(v)} disabled={isActive}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="aggressive">Aggressive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activation Toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-muted/20 to-muted/40 border border-border/30">
          <div className="flex items-center gap-2">
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {isActive ? "Agent Active" : "Agent Inactive"}
            </span>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isLoading || !token || portfolioAmount <= 0}
          />
        </div>

        {/* Analysis Results */}
        {isActive && analysisData && (
          <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recommendation</span>
              <div className={`flex items-center gap-2 font-bold ${getRecommendationColor()}`}>
                {getRecommendationIcon()}
                {analysisData.recommendation}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-2 font-medium">{analysisData.confidence.toFixed(1)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Signal Score:</span>
                <span className="ml-2 font-medium">{analysisData.signal_score.toFixed(2)}</span>
              </div>
            </div>

            {/* Execution Signals */}
            {analysisData.execution_signal?.should_open && (
              <div className="p-2 rounded bg-green-500/20 border border-green-500/30 text-xs">
                ⚡ <strong>EXECUTION:</strong> {analysisData.execution_signal.action}
              </div>
            )}

            {analysisData.execution_signal?.should_close && (
              <div className="p-2 rounded bg-red-500/20 border border-red-500/30 text-xs">
                🔴 <strong>CLOSING:</strong> {analysisData.execution_signal.exit_conditions?.join(", ")}
              </div>
            )}

            {/* Position Info */}
            {analysisData.position_info?.status === "open" && (
              <div className="p-2 rounded bg-blue-500/20 border border-blue-500/30 text-xs">
                <div className="font-medium">
                  📊 Position: {analysisData.position_info.type}
                </div>
                <div className="mt-1">
                  PnL: ${analysisData.position_info.pnl_usd?.toFixed(2)} (
                  {analysisData.position_info.pnl_pct?.toFixed(2)}%)
                </div>
              </div>
            )}

            {/* Market Price */}
            {analysisData.market_data?.price && (
              <div className="text-xs text-muted-foreground">
                Price: ${analysisData.market_data.price.toFixed(4)}
              </div>
            )}
          </div>
        )}

        {isActive && !analysisData && (
          <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground text-center">
            Waiting for first analysis...
          </div>
        )}

        {!selectedToken && (
          <div className="text-center text-muted-foreground text-sm py-4">
            Select a token to configure auto-trading
          </div>
        )}
      </div>
    </Card>
  );
}
