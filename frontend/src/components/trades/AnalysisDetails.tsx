import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity, DollarSign, BarChart3 } from "lucide-react";
import type { AnalysisResponse } from "@/services/api";
import CandlestickChart from "@/components/tokens/CandlestickChart";
import { useAnalysisStore } from "@/store/analysisStore";

interface AnalysisDetailsProps {
  data: AnalysisResponse | null;
  token?: string;
}

export default function AnalysisDetails({ data: propData, token: propToken }: AnalysisDetailsProps) {
  // Use Zustand store for smooth state management - subscribe to all changes
  const storeAnalysisData = useAnalysisStore((state) => state.analysisData);
  const storeToken = useAnalysisStore((state) => state.token);
  
  // Always use store data if it exists, otherwise fall back to props
  // This ensures we're always using the latest from Zustand store
  const data = storeAnalysisData ?? propData;
  const token = storeToken ?? propToken;
  
  // Create a unique key for each update - use the entire data object reference
  // This ensures React detects changes even if nested values change
  const updateKey = useMemo(() => {
    if (!data) return 'no-data';
    // Use multiple fields to ensure uniqueness
    const price = data.market_data?.price || 0;
    const iteration = data.iteration || 0;
    const timestamp = data.timestamp || '';
    const recommendation = data.recommendation || '';
    const confidence = data.confidence || 0;
    // Include _updateTimestamp if it exists for extra uniqueness
    const updateTs = (data as any)._updateTimestamp || '';
    return `${price.toFixed(6)}-${iteration}-${timestamp}-${recommendation}-${confidence.toFixed(1)}-${updateTs}`;
  }, [data]);

  // Debug log to see if component is receiving updates
  useEffect(() => {
    if (data) {
      console.log("📈 AnalysisDetails received update:", {
        recommendation: data.recommendation,
        price: data.market_data?.price,
        timestamp: data.timestamp,
        iteration: data.iteration,
        key: updateKey,
        hasStoreData: !!storeAnalysisData
      });
    }
  }, [data, updateKey, storeAnalysisData]);

  if (!data) {
    return (
      <Card className="p-6 shadow-lg border border-border">
        <div className="text-center text-muted-foreground py-8">
          Activate agent to see detailed analysis
        </div>
      </Card>
    );
  }

  const displayToken = token || data.token || "N/A";
  
  // Extract values directly from data - React will detect changes via updateKey
  // Don't memoize these to ensure they update with the data object
  const marketData = data.market_data || {};
  const sentimentData = data.sentiment_data || {};
  const onchainData = data.onchain_data || {};
  const executionSignal = data.execution_signal || {};
  const positionInfo = data.position_info || {};

  const getRecommendationIcon = () => {
    const rec = data.recommendation;
    if (rec === "LONG") return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (rec === "SHORT") return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-yellow-500" />;
  };

  const getRecommendationColor = () => {
    const rec = data.recommendation;
    if (rec === "LONG") return "bg-green-500/20 text-green-500 border-green-500/30";
    if (rec === "SHORT") return "bg-red-500/20 text-red-500 border-red-500/30";
    return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30";
  };

  return (
    <Card className="p-6 shadow-lg border border-border">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Live Analysis Details
      </h3>

      <div className="space-y-4">
        {/* Candlestick Chart - Show at top when agent is active */}
        {displayToken !== "N/A" && (
          <div className="mb-6 -mx-6 -mt-6">
            <CandlestickChart token={displayToken} analysisData={data} />
          </div>
        )}

        {/* Main Recommendation */}
        <div className={`p-4 rounded-lg border ${getRecommendationColor()} transition-all duration-300 ease-out`} key={`recommendation-${updateKey}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRecommendationIcon()}
              <div>
                <div className="text-sm text-muted-foreground">Recommendation</div>
                <div className="text-2xl font-bold transition-all duration-300">{data.recommendation}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Confidence</div>
              <div className="text-xl font-semibold transition-all duration-300">{data.confidence.toFixed(1)}%</div>
            </div>
          </div>
          <div className="mt-2 text-sm">
            Signal Score: <span className="font-medium transition-all duration-300">{data.signal_score.toFixed(2)}</span>
          </div>
        </div>

        {/* Market Data */}
        {marketData && Object.keys(marketData).length > 0 && (
          <div className="space-y-2" key={`market-${updateKey}`}>
            <h4 className="font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Market Data
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300 ease-out">
                <div className="text-xs text-muted-foreground">Price</div>
                <div className="font-semibold text-lg transition-all duration-300 ease-out">${marketData.price?.toFixed(4) || "N/A"}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">24h Change</div>
                <div className={`font-semibold text-lg transition-colors duration-300 ${
                  (marketData.percent_change_24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {marketData.percent_change_24h?.toFixed(2) || "N/A"}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">Volume 24h</div>
                <div className="font-semibold">
                  ${marketData.volume_24h ? (marketData.volume_24h / 1e6).toFixed(2) + "M" : "N/A"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="font-semibold">
                  ${marketData.market_cap ? (marketData.market_cap / 1e9).toFixed(2) + "B" : "N/A"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">1h Change</div>
                <div className={`font-semibold transition-colors duration-300 ${
                  (marketData.percent_change_1h || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {marketData.percent_change_1h?.toFixed(2) || "N/A"}%
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">7d Change</div>
                <div className={`font-semibold transition-colors duration-300 ${
                  (marketData.percent_change_7d || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                  {marketData.percent_change_7d?.toFixed(2) || "N/A"}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sentiment Data */}
        {sentimentData && Object.keys(sentimentData).length > 0 && (
          <div className="space-y-2" key={`sentiment-${updateKey}`}>
            <h4 className="font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Sentiment Analysis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">Overall</div>
                <div className="font-semibold">
                  {(sentimentData.overall_sentiment || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">Short-term</div>
                <div className="font-semibold">
                  {(sentimentData.short_term_sentiment || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">Medium-term</div>
                <div className="font-semibold">
                  {(sentimentData.medium_term_sentiment || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground">Risk Level</div>
                <Badge variant="outline" className="mt-1">
                  {sentimentData.risk_level || "N/A"}
                </Badge>
              </div>
            </div>
            {sentimentData.key_factors && sentimentData.key_factors.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-xs text-muted-foreground mb-2">Key Factors</div>
                <div className="flex flex-wrap gap-2">
                  {sentimentData.key_factors.map((factor: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* On-chain Data */}
        {data.onchain_data && (
          <div className="space-y-2">
            <h4 className="font-semibold">On-Chain Data</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">On-chain Signal</div>
                <div className="font-semibold">
                  {(data.onchain_data.onchain_signal || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">Activity Score</div>
                <div className="font-semibold">
                  {(data.onchain_data.activity_score || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">Liquidity Score</div>
                <div className="font-semibold">
                  {(data.onchain_data.liquidity_score || 0).toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">Transactions 24h</div>
                <div className="font-semibold">
                  {data.onchain_data.transaction_count_24h?.toLocaleString() || "N/A"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">Total Liquidity</div>
                <div className="font-semibold">
                  ${data.onchain_data.total_liquidity_usd ? (data.onchain_data.total_liquidity_usd / 1e6).toFixed(2) + "M" : "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Execution Signals */}
        {executionSignal && Object.keys(executionSignal).length > 0 && (
          <div className="space-y-2" key={`execution-${updateKey}`}>
            <h4 className="font-semibold">Execution Signals</h4>
            {executionSignal.should_open && (
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚡</span>
                  <div>
                    <div className="font-semibold text-green-500">Opening Position</div>
                    <div className="text-sm text-muted-foreground">
                      {executionSignal.action || "Position opening"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {executionSignal.should_close && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔴</span>
                  <div>
                    <div className="font-semibold text-red-500">Closing Position</div>
                    <div className="text-sm text-muted-foreground">
                      {executionSignal.exit_conditions?.join(", ") || "Exit conditions met"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!executionSignal.should_open && !executionSignal.should_close && (
              <div className="p-3 rounded-lg bg-muted/30 border transition-all duration-300">
                <div className="text-sm text-muted-foreground">No execution signals at this time</div>
              </div>
            )}
          </div>
        )}

        {/* Position Info */}
        {positionInfo && positionInfo.status === "open" && (
          <div className="space-y-2" key={`position-${updateKey}`}>
            <h4 className="font-semibold">Current Position</h4>
            <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 transition-all duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Type</div>
                  <div className="font-semibold text-lg transition-all duration-300">{positionInfo.type}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">PnL (USD)</div>
                  <div className={`font-semibold text-lg transition-all duration-300 ${
                    (positionInfo.pnl_usd || 0) >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    ${(positionInfo.pnl_usd || 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">PnL (%)</div>
                  <div className={`font-semibold text-lg transition-all duration-300 ${
                    (positionInfo.pnl_pct || 0) >= 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {(positionInfo.pnl_pct || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Perp Trade Details */}
        {data.perp_trade_details && (
          <div className="space-y-2">
            <h4 className="font-semibold">Perp Trade Details</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">Collateral</div>
                <div className="font-semibold">
                  ${data.perp_trade_details.collateral_usd?.toFixed(2) || "N/A"}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">Leverage</div>
                <div className="font-semibold">
                  {data.perp_trade_details.suggested_leverage || "N/A"}x
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground">Position Size</div>
                <div className="font-semibold">
                  ${data.perp_trade_details.position_size_usd?.toFixed(2) || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timestamp */}
        {data.timestamp && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Last updated: {new Date(data.timestamp).toLocaleString()}
            {data.iteration && ` • Iteration: ${data.iteration}`}
          </div>
        )}
      </div>
    </Card>
  );
}

