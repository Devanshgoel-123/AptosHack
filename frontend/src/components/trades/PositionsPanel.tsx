import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { getPositions, type Position } from "@/services/perpAction";
import { toast } from "sonner";

interface PositionsPanelProps {
  address: string | null;
}

export default function PositionsPanel({ address }: PositionsPanelProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    if (!address) {
      setPositions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPositions(address);
      console.log("fetchPositions data", data);
      // Handle both array and object responses
      const positionsArray = Array.isArray(data) ? data : (data || []);
      setPositions(positionsArray);
    } catch (err: any) {
      console.error("Error fetching positions:", err);
      setError(err.message || "Failed to fetch positions");
      toast.error("Failed to fetch positions");
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    // Refresh positions every 30 seconds
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
  }, [address]);

  const getMarketName = (marketId: number): string => {
    const marketMap: Record<number, string> = {
      14: "APT",
      15: "BTC",
    };
    return marketMap[marketId] || `Market ${marketId}`;
  };

  const formatPnL = (pnl: number | undefined): { value: string; color: string } => {
    if (pnl === undefined || pnl === null) {
      return { value: "N/A", color: "text-muted-foreground" };
    }
    const isPositive = pnl >= 0;
    return {
      value: `${isPositive ? "+" : ""}${pnl.toFixed(2)}`,
      color: isPositive ? "text-green-500" : "text-red-500",
    };
  };

  if (!address) {
    return (
      <Card className="p-6 shadow-lg border border-border">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Open Positions</h3>
        </div>
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Connect your wallet to view positions</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Open Positions</h3>
          {positions.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({positions.length})
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPositions}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {loading && positions.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading positions...</span>
        </div>
      ) : error && positions.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-red-500">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{error}</span>
        </div>
      ) : positions.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No open positions</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {positions.map((position, index) => {
            const side = position.trade_side === true ? "LONG" : "SHORT";
            const isLong = side === "LONG";
           
            const marketName = getMarketName(position.market_id);

            return (
              <div
                key={position.trade_id || index}
                className="p-4 rounded-lg border border-border bg-gradient-to-br from-muted/20 to-muted/40 hover:from-muted/30 hover:to-muted/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {isLong ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{marketName}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            isLong
                              ? "bg-green-500/20 text-green-500"
                              : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {side}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Market ID: {position.market_id}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Size</div>
                    <div className="font-medium">
                      {position.size || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Leverage</div>
                    <div className="font-medium">
                      {position.leverage ? `${position.leverage}x` : "N/A"}
                    </div>
                  </div>
                  {position.entry_price !== undefined && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Entry Price</div>
                      <div className="font-medium">
                        ${position.entry_price.toString().slice(0,5)}
                      </div>
                    </div>
                  )}
                  {position.liq_price !== undefined && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Liquidation Price</div>
                      <div className="font-medium">
                        ${position.liq_price.toString().slice(0,5)}
                      </div>
                    </div>
                  )}
                </div>

                {position.trade_id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      Position ID: <span className="font-mono">{position.trade_id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

