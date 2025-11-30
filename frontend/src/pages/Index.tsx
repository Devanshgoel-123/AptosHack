import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { fetchMockTokens, fetchMockWallets, fetchMockSentiment } from "@/services/api";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TokenCard from "@/components/tokens/TokenCard";
import TokenAnalysisChart from "@/components/tokens/TokenAnalysisChart";
import WalletCard from "@/components/wallets/WalletCard";
import TradeLogItem from "@/components/trades/TradeLogItem";
import InfluencerCard from "@/components/influencers/InfluencerCard";
import AutoTradePanel from "@/components/trades/AutoTradePanel";
import PriceChart from "@/components/tokens/PriceChart";
import LivePriceChart from "@/components/tokens/LivePriceChart";
import AnalysisDetails from "@/components/trades/AnalysisDetails";
import type { AnalysisResponse } from "@/services/api";
import { useAnalysisStore } from "@/store/analysisStore";
import AddWalletDialog from "@/components/wallets/AddWalletDialog";
import AddInfluencerDialog from "@/components/influencers/AddInfluencerDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Zap } from "lucide-react";
import { toast } from "sonner";
import WalletOverview from "@/components/wallets/WalletOverview";

const Index = () => {
  const [tokens, setTokens] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any | null>(null);
  const [sentiment, setSentiment] = useState<any | null>(null);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [tradeLogs, setTradeLogs] = useState<any[]>([]);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState<any | null>(null);
  
  // Use Zustand store for analysis data
  const analysisData = useAnalysisStore((state) => state.analysisData);

  // Debug: Log when analysisData changes
  useEffect(() => {
    if (analysisData) {
      console.log("🔄 Index page - analysisData updated:", analysisData);
    }
  }, [analysisData]);

  useEffect(() => {
    // Load tokens
    fetchMockTokens().then(setTokens);
    
    // Load wallets from localStorage or mock data
    const local = window.localStorage.getItem("apthack_wallets");
    if (local) {
      try {
        const parsed = JSON.parse(local);
        const uniques = parsed.filter(
          (w: any, i: number, arr: any[]) =>
            arr.findIndex((a) => a.address?.toLowerCase() === w.address?.toLowerCase()) === i
        );
        setWallets(uniques);
      } catch (e) {
        fetchMockWallets().then(setWallets);
      }
    } else {
      fetchMockWallets().then((ws: any[]) => {
        const uniques = ws.filter(
          (w: any, i: number, arr: any[]) =>
            arr.findIndex((a) => a.address?.toLowerCase() === w.address?.toLowerCase()) === i
        );
        setWallets(uniques);
        window.localStorage.setItem("apthack_wallets", JSON.stringify(uniques));
      });
    }

    // Load mock influencers
    setInfluencers([
      { name: "ElonMeme", handle: "@elonmeme", followers: 32000000, lastMention: "MEME" },
      { name: "CryptoGuru", handle: "@cryptoguru", followers: 12000, lastMention: "PRIV" },
      { name: "MemeLord", handle: "@memelord", followers: 3450, lastMention: "ZLA" },
    ]);
  }, []);

  async function handleSelectToken(token: any) {
    setSelectedToken(token);
    const s = await fetchMockSentiment(token.symbol);
    setSentiment(s);
  }

  function handleAddWallet(w: any) {
    const wallet = {
      address: w.address,
      name: w.name || w.address,
      tokens: w.tokens || [],
      value: w.value || 0,
    };
    const addr = wallet.address?.toLowerCase();
    setWallets((p) => {
      if (p.some((x) => x.address?.toLowerCase() === addr)) {
        toast.info("Wallet already added");
        return p;
      }
      const next = [wallet, ...p];
      window.localStorage.setItem("apthack_wallets", JSON.stringify(next));
      toast.success("Wallet added successfully");
      return next;
    });
  }

  function handleRemoveWallet(address: string) {
    const clean = address?.toLowerCase();
    setWallets((p) => {
      const next = p.filter((w) => w.address?.toLowerCase() !== clean);
      window.localStorage.setItem("apthack_wallets", JSON.stringify(next));
      toast.success("Wallet removed");
      return next;
    });
  }

  function handleAddInfluencer(handle: string) {
    setInfluencers((p) => [
      { name: handle.replace("@", ""), handle, followers: 0, lastMention: "" },
      ...p,
    ]);
    toast.success("Influencer added to tracker");
  }

  function handleBuy() {
    if (!selectedToken) return;
    const newLog = {
      token: selectedToken.symbol,
      action: "BUY",
      amount: (Math.random() * 250).toFixed(2),
      reason: "High sentiment + Strong liquidity",
    };
    setTradeLogs((p) => [newLog, ...p]);
    toast.success(`Simulated BUY of ${selectedToken.symbol}`);
  }

  function handleSell() {
    if (!selectedToken) return;
    const newLog = {
      token: selectedToken.symbol,
      action: "SELL",
      amount: (Math.random() * 250).toFixed(2),
      reason: "Take profit / Low sentiment",
    };
    setTradeLogs((p) => [newLog, ...p]);
    toast.success(`Simulated SELL of ${selectedToken.symbol}`);
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Theme toggle button */}
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      {/* Geometric background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-foreground/10 to-transparent rounded-full blur-3xl"></div>
      </div>

  <DashboardHeader onAddWallet={(acc: any) => setConnectedAccount(acc)} />

      <main className="container mx-auto px-6 py-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detailed Analysis - Show always, but highlight when active */}
            <div>
              <h2 className="text-xl font-semibold mb-4">📈 Live Analysis Details</h2>
              <AnalysisDetails 
                data={null}
                token={selectedToken?.symbol}
              />
            </div>

            {/* Historical Price Chart */}
            {selectedToken && (
              <div>
                <h2 className="text-xl font-semibold mb-4">📉 Historical Price (7D/30D/90D)</h2>
                <PriceChart 
                  token={selectedToken.symbol} 
                  currentPrice={analysisData?.market_data?.price || selectedToken.price}
                />
              </div>
            )}

            {/* Token Analysis as a graph */}
            {selectedToken && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Token Analysis</h2>
                <TokenAnalysisChart token={selectedToken} sentiment={sentiment} />
              </div>
            )}

            {/* Trade History */}
            {tradeLogs.length > 0 && (
              <Card className="p-6 shadow-lg border border-border">
                <h2 className="text-xl font-semibold mb-4">Trade History</h2>
                <div className="space-y-2">
                  {tradeLogs.map((log, idx) => (
                    <TradeLogItem key={idx} log={log} />
                  ))}
                </div>
              </Card>
            )}

            {/* Influencer Tracker */}
            <Card className="p-6 shadow-lg border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Influencer Tracker</h2>
                <AddInfluencerDialog onAdd={handleAddInfluencer} />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Track influencer mentions and get alerts on trending tokens
              </p>
              <div className="space-y-2">
                {influencers.map((inf, idx) => (
                  <InfluencerCard key={idx} influencer={inf} />
                ))}
              </div>
            </Card>

            {/* Available Tokens - Moved to bottom */}
            <Card className="p-6 shadow-lg border border-border">
              <h2 className="text-xl font-semibold mb-4">Available Tokens</h2>
              <div className="grid gap-3">
                {tokens.map((token) => (
                  <TokenCard
                    key={token.symbol}
                    token={token}
                    isSelected={selectedToken?.symbol === token.symbol}
                    onClick={() => handleSelectToken(token)}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Wallet Overview */}
            {connectedAccount?.address ? (
              <WalletOverview address={connectedAccount.address} />
            ) : (
              <Card className="p-6 shadow-lg border border-border">
                <h3 className="text-lg font-semibold mb-2">Wallet Overview</h3>
                <p className="text-sm text-muted-foreground">Connect your wallet to view balance and recent transactions.</p>
              </Card>
            )}

            {/* Auto-Trade Settings */}
            <AutoTradePanel 
              selectedToken={selectedToken}
            />

            {/* Trading Console */}
            <Card className="p-6 shadow-lg border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Quick Trade</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Simulate trades with current market conditions
              </p>
              <div className="flex gap-3">
                <Button onClick={handleBuy} className="flex-1 bg-foreground text-background hover:bg-foreground/90 shadow-sm">
                   Buy
                </Button>
                <Button onClick={handleSell} variant="outline" className="flex-1 border-foreground/30 text-foreground hover:bg-foreground/5">
                   Sell
                </Button>
              </div>
            </Card>

            {/* Signals & Backup */}
            <Card className="p-6 shadow-lg border border-border">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Reports</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get automated analysis and backup reports via email
              </p>
              <Button
                variant="outline"
                className="w-full border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => toast.info("Backup email sent (simulated)")}
              >
                Send Analysis Report
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <AddWalletDialog
        onAdd={handleAddWallet}
        trigger={
          <button style={{ display: "none" }} onClick={() => setShowAddWallet(true)}>
            Hidden Trigger
          </button>
        }
      />
    </div>
  );
};

export default Index;
