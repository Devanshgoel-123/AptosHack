import { useEffect, useState, useMemo, useCallback, useRef, memo } from "react";
import { useAnalysisStore } from "@/store/analysisStore";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { fetchHistoricalData } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisResponse } from "@/services/api";

interface CandlestickChartProps {
  token: string;
  analysisData: AnalysisResponse | null;
}

interface CandlestickData {
  timestamp: number;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  price: number;
  volume: number;
}

function CandlestickChart({ token: propToken, analysisData: propAnalysisData }: CandlestickChartProps) {
  // Use Zustand store for smooth state management
  const storeToken = useAnalysisStore((state) => state.token);
  const storeAnalysisData = useAnalysisStore((state) => state.analysisData);
  const priceHistory = useAnalysisStore((state) => state.priceHistory);
  
  // Use store data if available, otherwise fall back to props
  const token = storeToken || propToken;
  const analysisData = storeAnalysisData || propAnalysisData;
  
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"1d" | "7d" | "30d" | "1y">("7d");
  const maxHistoryLength = 60;
  const lastPeriodRef = useRef<"1d" | "7d" | "30d" | "1y">("7d");
  const lastTokenRef = useRef<string>("");
  const historicalDataLoadedRef = useRef<boolean>(false);

  // Fetch historical candlestick data - only when token or period changes
  useEffect(() => {
    if (!token) return;
    
    // Only reload if token or period actually changed
    if (token === lastTokenRef.current && selectedPeriod === lastPeriodRef.current && historicalDataLoadedRef.current) {
      return;
    }

    const periodDays = {
      "1d": 1,
      "7d": 7,
      "30d": 30,
      "1y": 365,
    };

    // Note: Price history is managed by Zustand store, no need to reset here

    lastTokenRef.current = token;
    lastPeriodRef.current = selectedPeriod;

    setIsLoading(true);
    fetchHistoricalData(token, periodDays[selectedPeriod])
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          // Convert to candlestick format with proper timestamp handling
          const candles = data.data
            .filter((point: any) => point && point.timestamp) // Filter out invalid data
            .map((point: any) => {
              // Handle timestamp - could be in seconds or milliseconds
              const timestamp = typeof point.timestamp === 'number' 
                ? (point.timestamp < 1e12 ? point.timestamp * 1000 : point.timestamp)
                : Date.now();
              
              // Ensure price values are valid numbers
              const price = parseFloat(point.price) || parseFloat(point.close) || 0;
              const open = parseFloat(point.open) || price;
              const high = parseFloat(point.high) || price * 1.01;
              const low = parseFloat(point.low) || price * 0.99;
              const close = parseFloat(point.close) || price;
              
              return {
                timestamp,
                time: new Date(timestamp).toISOString(),
                open: Math.max(0, open),
                high: Math.max(0, high),
                low: Math.max(0, low),
                close: Math.max(0, close),
                price: Math.max(0, price),
                volume: parseFloat(point.volume) || 0,
              };
            })
            .filter((candle: any) => candle.price > 0); // Remove invalid candles
          
          setCandlestickData(candles);
          historicalDataLoadedRef.current = true;
        } else {
          console.warn("No historical data received or invalid format:", data);
          setCandlestickData([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching candlestick data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, selectedPeriod]);

  // Price history is now managed by Zustand store in AutoTradePanel
  // No need to update it here - it's already being updated in the store
  // This ensures smooth updates without conflicts

  // Memoize chart data to prevent unnecessary recalculations
  // Use timestamp as number for proper date handling
  const chartData = useMemo(() => {
    return candlestickData.map((candle) => {
      // Ensure timestamp is in milliseconds
      const timestampMs = candle.timestamp < 1e12 ? candle.timestamp * 1000 : candle.timestamp;
      const date = new Date(timestampMs);
      
      return {
        timestamp: timestampMs, // Keep as number for proper sorting/formatting
        time: date.toISOString(), // Use ISO string for consistent formatting
        timeLabel: selectedPeriod === "1d" 
          ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        price: candle.close,
        volume: candle.volume,
      };
    });
  }, [candlestickData, selectedPeriod]);

  // Memoize live data points - create smooth updating candles like Binance/DexScreener
  const liveDataPoints = useMemo(() => {
    if (priceHistory.length === 0) return [];
    
    // For smooth updates, we'll show the last 60 points as individual candles
    // Each point becomes a candle that updates in real-time
    return priceHistory.map((point) => {
      // Find the min/max in a small window around this point for realistic OHLC
      const index = priceHistory.findIndex(p => p.timestamp === point.timestamp);
      const window = priceHistory.slice(Math.max(0, index - 2), Math.min(priceHistory.length, index + 3));
      const prices = window.map(p => p.price);
      
      // Ensure timestamp is in milliseconds
      const timestampMs = point.timestamp < 1e12 ? point.timestamp * 1000 : point.timestamp;
      const date = new Date(timestampMs);
      
      return {
        timestamp: timestampMs, // Keep as number for proper sorting
        time: date.toISOString(), // Use ISO string for consistent formatting
        timeLabel: selectedPeriod === "1d"
          ? date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        open: prices[0] || point.price,
        high: Math.max(...prices),
        low: Math.min(...prices),
        close: point.price,
        price: point.price,
        volume: 0,
      };
    });
  }, [priceHistory, selectedPeriod]);

  // Memoize combined data - merge and sort by timestamp, remove duplicates
  const allData = useMemo(() => {
    // Combine historical and live data
    const combined = [...chartData, ...liveDataPoints];
    
    // Remove duplicates based on timestamp (keep latest if duplicate)
    const uniqueMap = new Map<number, any>();
    combined.forEach((point) => {
      const ts = point.timestamp;
      if (!uniqueMap.has(ts) || point.close !== undefined) {
        uniqueMap.set(ts, point);
      }
    });
    
    // Convert back to array and sort by timestamp
    const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    
    return sorted;
  }, [chartData, liveDataPoints]);

  // Memoize current price
  const currentPrice = useMemo(() => {
    return analysisData?.market_data?.price || (chartData.length > 0 ? chartData[chartData.length - 1].close : null);
  }, [analysisData?.market_data?.price, chartData]);

  // Memoize price range
  const { minPrice, maxPrice } = useMemo(() => {
    if (allData.length > 0) {
      return {
        minPrice: Math.min(...allData.map((d) => d.low)),
        maxPrice: Math.max(...allData.map((d) => d.high)),
      };
    }
    return {
      minPrice: (currentPrice || 0) * 0.99,
      maxPrice: (currentPrice || 0) * 1.01,
    };
  }, [allData, currentPrice]);

  // Memoize price change calculations
  const { priceChange, priceChangePercent, isPositive } = useMemo(() => {
    const change = chartData.length > 1 
      ? chartData[chartData.length - 1].close - chartData[0].open 
      : 0;
    const changePercent = chartData.length > 1 && chartData[0].open !== 0
      ? ((change / chartData[0].open) * 100)
      : 0;
    return {
      priceChange: change,
      priceChangePercent: changePercent,
      isPositive: change >= 0,
    };
  }, [chartData]);

  if (!token) {
    return null;
  }

  return (
    <Card className="p-6 shadow-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{token}/USDC</h3>
          <div className="flex items-center gap-2 mt-1">
            {currentPrice !== null ? (
              <>
                <span className="text-2xl font-bold">${currentPrice.toFixed(4)}</span>
                {chartData.length > 1 && (
                  <Badge
                    variant={isPositive ? "default" : "destructive"}
                    className={`flex items-center gap-1 ${
                      isPositive ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {isPositive ? "+" : ""}
                    {priceChangePercent.toFixed(2)}%
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Loading...</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Live Updates</div>
          <div className="flex items-center gap-2">
            {analysisData ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-500">Active</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Inactive</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 mb-4">
        {(["1d", "7d", "30d", "1y"] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => {
              // Only update if different
              if (selectedPeriod !== period) {
                setSelectedPeriod(period);
              }
            }}
            className="text-xs"
          >
            {period.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Chart */}
      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : allData.length > 0 ? (
        <ChartContainer
          config={{
            price: {
              label: "Price (USD)",
              color: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)",
            },
          }}
          className="w-full h-[400px]"
        >
          <ResponsiveContainer>
            <LineChart data={allData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="timeLabel"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => {
                  // value is already formatted in timeLabel, but handle edge cases
                  if (!value || value === "Invalid Date") {
                    return "";
                  }
                  return value;
                }}
                minTickGap={30}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[
                  minPrice > 0 ? minPrice * 0.999 : "auto",
                  maxPrice > 0 ? maxPrice * 1.001 : "auto"
                ]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                tickFormatter={(value) => {
                  // Handle very large or very small numbers
                  if (value > 1000) {
                    return `$${(value / 1000).toFixed(2)}k`;
                  }
                  return `$${value.toFixed(4)}`;
                }}
                allowDataOverflow={false}
              />
              {currentPrice && (
                <ReferenceLine
                  y={currentPrice}
                  stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as any;
                    // Format time properly
                    const timeDisplay = data.timeLabel || data.time || 
                      (data.timestamp ? new Date(data.timestamp).toLocaleString() : "N/A");
                    
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">Time</span>
                            <span className="font-bold">{timeDisplay}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Open</span>
                              <div className="font-semibold">${(data.open || data.price || 0).toFixed(4)}</div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">High</span>
                              <div className="font-semibold text-green-500">${(data.high || data.price || 0).toFixed(4)}</div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Low</span>
                              <div className="font-semibold text-red-500">${(data.low || data.price || 0).toFixed(4)}</div>
                            </div>
                            <div>
                              <span className="text-[0.70rem] uppercase text-muted-foreground">Close</span>
                              <div className="font-semibold">${(data.close || data.price || 0).toFixed(4)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive={false} // Disable animation for smooth real-time updates
                animationDuration={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      ) : (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
          <div className="text-center">
            <div className="animate-pulse mb-2 text-lg font-semibold">⏳ Loading chart data...</div>
            <div className="text-sm">Fetching {selectedPeriod} historical data</div>
          </div>
        </div>
      )}

      {/* Stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t mt-4">
          <div>
            <div className="text-xs text-muted-foreground">Period High</div>
            <div className="font-semibold text-green-500">
              ${maxPrice.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Period Low</div>
            <div className="font-semibold text-red-500">
              ${minPrice.toFixed(4)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Current Price</div>
            <div className="font-semibold">
              ${currentPrice?.toFixed(4) || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Period Change</div>
            <div className={`font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? "+" : ""}{priceChangePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Memoize component but allow updates for smooth chart updates
export default memo(CandlestickChart, (prevProps, nextProps) => {
  // Always re-render if token changes
  if (prevProps.token !== nextProps.token) {
    return false; // Re-render
  }
  
  // Re-render if price changed OR timestamp changed (for smooth updates)
  const prevPrice = prevProps.analysisData?.market_data?.price;
  const nextPrice = nextProps.analysisData?.market_data?.price;
  const prevTimestamp = prevProps.analysisData?.timestamp;
  const nextTimestamp = nextProps.analysisData?.timestamp;
  const prevIteration = prevProps.analysisData?.iteration;
  const nextIteration = nextProps.analysisData?.iteration;
  
  // Re-render if price, timestamp, or iteration changed
  if (prevPrice !== nextPrice || prevTimestamp !== nextTimestamp || prevIteration !== nextIteration) {
    return false; // Re-render for smooth updates
  }
  
  return true; // Don't re-render if nothing changed
});

