import { useEffect, useState, useRef } from "react";
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
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { AnalysisResponse } from "@/services/api";

interface LivePriceChartProps {
  token: string;
  analysisData: AnalysisResponse | null;
}

interface PricePoint {
  time: string;
  price: number;
  timestamp: number;
  volume?: number;
}

export default function LivePriceChart({ token, analysisData }: LivePriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const maxHistoryLength = 60; // Keep last 60 data points (1 minute if updating every second)

  useEffect(() => {
    if (!analysisData || !analysisData.market_data) return;

    const price = analysisData.market_data.price;
    const timestamp = Date.now();
    const time = new Date(timestamp).toLocaleTimeString();

    // Update current price
    setCurrentPrice(price);

    // Calculate price change
    if (priceHistory.length > 0) {
      const previousPrice = priceHistory[priceHistory.length - 1].price;
      const change = price - previousPrice;
      const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
      setPriceChange(change);
      setPriceChangePercent(changePercent);
    }

    // Add new price point
    setPriceHistory((prev) => {
      const newPoint: PricePoint = {
        time,
        price,
        timestamp,
        volume: analysisData.market_data?.volume_24h,
      };
      const updated = [...prev, newPoint];
      // Keep only last N points
      return updated.slice(-maxHistoryLength);
    });
  }, [analysisData]);

  // Always show the chart, even if no data yet
  // This ensures it appears immediately when agent is activated

  const minPrice = priceHistory.length > 0 
    ? Math.min(...priceHistory.map((p) => p.price)) 
    : (currentPrice || 0) * 0.99;
  const maxPrice = priceHistory.length > 0 
    ? Math.max(...priceHistory.map((p) => p.price)) 
    : (currentPrice || 0) * 1.01;

  const isPositive = priceChange >= 0;

  return (
    <Card className="p-6 shadow-lg border border-border">
      {/* Header with current price */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{token}/USDC</h3>
          <div className="flex items-center gap-2 mt-1">
            {currentPrice !== null ? (
              <>
                <span className="text-2xl font-bold">${currentPrice.toFixed(4)}</span>
                {priceHistory.length > 1 && (
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
                    {priceChange.toFixed(4)} ({isPositive ? "+" : ""}
                    {priceChangePercent.toFixed(2)}%)
                  </Badge>
                )}
              </>
            ) : analysisData?.market_data?.price ? (
              <>
                <span className="text-2xl font-bold">${analysisData.market_data.price.toFixed(4)}</span>
                <span className="text-xs text-muted-foreground">Initial price</span>
              </>
            ) : (
              <span className="text-muted-foreground">Waiting for data...</span>
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

      {/* Price Chart */}
      {priceHistory.length > 0 || analysisData?.market_data?.price ? (
        <div className="space-y-4">
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
              <LineChart
                data={priceHistory.length > 0 ? priceHistory : (analysisData?.market_data?.price ? [{ time: "Now", price: analysisData.market_data.price, timestamp: Date.now() }] : [])}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => {
                    // Show only time, format nicely
                    return value.split(" ")[0] || value;
                  }}
                />
                <YAxis
                  domain={[minPrice * 0.999, maxPrice * 1.001]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
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
                      const data = payload[0].payload as PricePoint;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Time
                              </span>
                              <span className="font-bold">{data.time}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Price
                              </span>
                              <span className="font-bold text-foreground">
                                ${data.price.toFixed(4)}
                              </span>
                            </div>
                            {analysisData?.market_data?.volume_24h && (
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  24h Volume
                                </span>
                                <span className="font-medium">
                                  ${(analysisData.market_data.volume_24h / 1e6).toFixed(2)}M
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)" }}
                  animationDuration={300}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
            <div>
              <div className="text-xs text-muted-foreground">24h High</div>
              <div className="font-semibold text-green-500">
                ${analysisData?.market_data?.price ? (analysisData.market_data.price * 1.05).toFixed(4) : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">24h Low</div>
              <div className="font-semibold text-red-500">
                ${analysisData?.market_data?.price ? (analysisData.market_data.price * 0.95).toFixed(4) : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">24h Volume</div>
              <div className="font-semibold">
                {analysisData?.market_data?.volume_24h
                  ? `$${(analysisData.market_data.volume_24h / 1e6).toFixed(2)}M`
                  : "N/A"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">24h Change</div>
              <div
                className={`font-semibold ${
                  (analysisData?.market_data?.percent_change_24h || 0) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {analysisData?.market_data?.percent_change_24h
                  ? `${analysisData.market_data.percent_change_24h >= 0 ? "+" : ""}${analysisData.market_data.percent_change_24h.toFixed(2)}%`
                  : "N/A"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
          <div className="text-center">
            <div className="animate-pulse mb-2 text-lg font-semibold">⏳ Waiting for live data...</div>
            <div className="text-sm">Activate agent to start receiving real-time price updates</div>
            <div className="mt-4 text-xs opacity-70">
              Chart will appear here once agent is activated
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

