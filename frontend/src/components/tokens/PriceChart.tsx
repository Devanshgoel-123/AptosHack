import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { fetchHistoricalData } from "@/services/api";

interface PriceChartProps {
  token: string;
  currentPrice?: number;
}

interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  date: string;
}

export default function PriceChart({ token, currentPrice }: PriceChartProps) {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!token) return;

    setIsLoading(true);
    fetchHistoricalData(token, days)
      .then((data) => {
        if (data.data) {
          setHistoricalData(data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching historical data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token, days]);

  const chartData = historicalData.map((point) => ({
    time: new Date(point.timestamp * 1000).toLocaleDateString(),
    price: point.price,
    timestamp: point.timestamp,
  }));

  const minPrice = Math.min(...chartData.map((d) => d.price), currentPrice || Infinity);
  const maxPrice = Math.max(...chartData.map((d) => d.price), currentPrice || 0);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    );
  }

  if (!token || chartData.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          Select a token to view price history
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{token} Price History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDays(7)}
            className={`px-3 py-1 text-xs rounded ${
              days === 7
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            7D
          </button>
          <button
            onClick={() => setDays(30)}
            className={`px-3 py-1 text-xs rounded ${
              days === 30
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            30D
          </button>
          <button
            onClick={() => setDays(90)}
            className={`px-3 py-1 text-xs rounded ${
              days === 90
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            90D
          </button>
        </div>
      </div>

      <ChartContainer
        config={{
          price: {
            label: "Price (USD)",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="w-full h-[400px]"
      >
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return days <= 7
                  ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : date.toLocaleDateString("en-US", { month: "short" });
              }}
            />
            <YAxis
              domain={[minPrice * 0.95, maxPrice * 1.05]}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            {currentPrice && (
              <ReferenceLine
                y={currentPrice}
                stroke="hsl(var(--primary))"
                strokeDasharray="5 5"
                label={{ value: "Current", position: "right" }}
              />
            )}
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Price
                          </span>
                          <span className="font-bold text-muted-foreground">
                            ${payload[0].value?.toFixed(4)}
                          </span>
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
              dataKey="price"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="mt-4 text-sm text-muted-foreground">
        {currentPrice && (
          <div className="flex items-center gap-2">
            <span>Current Price:</span>
            <span className="font-semibold text-foreground">${currentPrice.toFixed(4)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

