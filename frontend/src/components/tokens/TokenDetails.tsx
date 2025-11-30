import { Activity, TrendingUp, Droplets, Star, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TokenDetailsProps {
  token: any;
  sentiment: any;
  onBuy: () => void;
  onSell: () => void;
}

export default function TokenDetails({ token, sentiment, onBuy, onSell }: TokenDetailsProps) {
  if (!token) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Select a token to view details and sentiment analysis</p>
        </div>
      </Card>
    );
  }

  const sentimentScore = sentiment?.score ?? 0;
  const liq = token?.liquidityUsd ?? 0;
  const logo = `/tokens/${(token?.symbol || '').toLowerCase()}.svg`;
  
  let recommendation = '';
  
  if (sentimentScore >= 0.85 && liq > 1000000) {
    recommendation = '🚀 Strong BUY — High sentiment + Strong liquidity';
    
  } else if (sentimentScore >= 0.6 && liq > 500000) {
    recommendation = '📈 BUY — Positive sentiment + Reasonable liquidity';
    
  } else if (sentimentScore >= 0.4) {
    recommendation = '⏸️ HOLD — Mixed signals';
    
  } else {
    recommendation = '⚠️ SELL or Avoid — Low sentiment';
    
  }

  const getSentimentColor = (_score: number) => 'text-foreground';

  return (
    <div className="space-y-4 animate-fade-in">
      <Card className="p-6 shadow-lg border border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <img
                src={logo}
                alt={`${token.symbol} logo`}
                className="w-7 h-7 rounded-sm border border-border object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
              <h3 className="text-2xl font-bold">{token.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{token.symbol}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">{token.market}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${token.price}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Activity className="w-4 h-4" />
              Sentiment Score
            </div>
            <div className={`text-2xl font-bold ${getSentimentColor(sentimentScore)}`}>
              {(sentimentScore * 100).toFixed(0)}%
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-muted/20 to-muted/40 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Twitter Sentiment
            </div>
            <div className="text-lg font-semibold">{sentiment?.twitter ?? 'N/A'}</div>
            <div className="text-xs text-muted-foreground">{sentiment?.twitterVolume ?? 0} mentions</div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-muted/20 to-muted/40 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Droplets className="w-4 h-4" />
              Liquidity
            </div>
            <div className="text-lg font-semibold">${(token.liquidityUsd / 1000000).toFixed(2)}M</div>
          </div>

          <div className="p-3 rounded-lg bg-gradient-to-br from-muted/20 to-muted/40 border border-border/30">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Star className="w-4 h-4" />
              CMC Rank
            </div>
            <div className="text-lg font-semibold">#{sentiment?.cmc?.rank ?? '-'}</div>
            <div className="text-xs text-muted-foreground">Greed-Fear: {sentiment?.greedFear ?? '-'}</div>
          </div>
        </div>

        <div className={`p-4 rounded-lg bg-gradient-to-br from-muted/20 to-muted/40 border border-border/30 mb-4`}>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold mb-1">AI Recommendation</div>
              <div className={`text-foreground`}>{recommendation}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onBuy} className="flex-1 bg-success hover:bg-success/90 text-foreground shadow-sm hover:shadow-md">
            Buy Token
          </Button>
          <Button onClick={onSell} variant="outline" className="flex-1 border-foreground/30 text-foreground hover:bg-foreground/5">
            Sell Token
          </Button>
        </div>
      </Card>
    </div>
  );
}
