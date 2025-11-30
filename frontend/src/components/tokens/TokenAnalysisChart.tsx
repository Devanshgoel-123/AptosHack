import React, { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  token?: {
    symbol: string;
    name: string;
    price: number;
    market: string;
    liquidityUsd: number;
    change24h: number;
  } | null;
  sentiment?: {
    score?: number; // 0..1
    twitter?: string;
    twitterVolume?: number;
    cmc?: { rank?: number };
    greedFear?: number;
  } | null;
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function toPct(x: number) {
  return Math.round(x * 100);
}

export default function TokenAnalysisChart({ token, sentiment }: Props) {
  const data = useMemo(() => {
    if (!token) return [] as Array<{ metric: string; value: number }>;

    const score = typeof sentiment?.score === "number" ? clamp01(sentiment!.score!) : 0.5;

    // Normalize liquidity: 0..100 relative to rough ranges
    const liq = token.liquidityUsd || 0;
    const liqNorm = clamp01(Math.log10(Math.max(1, liq)) / 7); // ~1 to 10^7+

    // Popularity: twitterVolume log-scaled
    const tw = sentiment?.twitterVolume ?? 0;
    const popNorm = clamp01(Math.log10(Math.max(1, tw)) / 6); // ~1..10^6

    // Volatility: absolute daily move; lower is better. Convert to a "stability" score
    const vol = Math.abs(token.change24h || 0); // percent
    const stability = clamp01(1 - Math.min(vol / 20, 1)); // 0 at 20% move, 1 if 0%

    // Momentum: price change direction mapped to 0..1 (0= -20% or worse, 1= +20% or better)
    const mom = clamp01((token.change24h + 20) / 40);

    return [
      { metric: "Sentiment", value: toPct(score) },
      { metric: "Liquidity", value: toPct(liqNorm) },
      { metric: "Popularity", value: toPct(popNorm) },
      { metric: "Stability", value: toPct(stability) },
      { metric: "Momentum", value: toPct(mom) },
    ];
  }, [token, sentiment]);

  if (!token) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-lg">Select a token to view analysis</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <img
          src={`/tokens/${token.symbol.toLowerCase()}.svg`}
          alt={`${token.symbol} logo`}
          className="w-7 h-7 rounded-sm border border-border object-contain"
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
        />
        <div className="text-xl font-semibold">{token.name}</div>
        <div className="text-sm text-muted-foreground">{token.symbol} • ${token.price}</div>
      </div>

      <ChartContainer
        config={{ value: { label: "Score", color: "hsl(var(--foreground))" } }}
        className="w-full aspect-[16/10]"
      >
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 16, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid stroke="hsl(var(--border))" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis type="category" dataKey="metric" tick={{ fill: "hsl(var(--muted-foreground))" }} width={100} />
            <ReferenceLine x={50} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <Bar dataKey="value" fill="hsl(var(--foreground) / 0.2)" stroke="hsl(var(--foreground))" radius={4} />
            <ChartTooltip cursor={{ fill: "hsl(var(--muted) / 0.3)" }} content={<ChartTooltipContent hideLabel />} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded-md border bg-gradient-to-br from-muted/20 to-muted/40">
          <div className="font-medium">How to read</div>
          <div className="text-muted-foreground">Longer bars mean stronger metrics. 100 is best.</div>
        </div>
        <div className="p-3 rounded-md border bg-gradient-to-br from-muted/20 to-muted/40">
          <div className="font-medium">Sentiment & Popularity</div>
          <div className="text-muted-foreground">Derived from AI score and Twitter volume.</div>
        </div>
        <div className="p-3 rounded-md border bg-gradient-to-br from-muted/20 to-muted/40">
          <div className="font-medium">Liquidity & Stability</div>
          <div className="text-muted-foreground">Liquidity uses log scale; stability prefers lower volatility.</div>
        </div>
      </div>
    </div>
  );
}
