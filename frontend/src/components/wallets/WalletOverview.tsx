import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { fetchAptosBalance, fetchAptosRecentTransfers, SimpleTransfer, fetchAptPriceUsd } from "@/services/api";

interface Props {
  address: string;
}

export default function WalletOverview({ address }: Props) {
  const [balance, setBalance] = useState<number | null>(null);
  const [txs, setTxs] = useState<SimpleTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [b, t, p] = await Promise.all([
          fetchAptosBalance(address),
          fetchAptosRecentTransfers(address, 5),
          fetchAptPriceUsd(),
        ]);
        if (!mounted) return;
        setBalance(b);
        setTxs(t);
        setPrice(p);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [address]);

  const mask = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const usd = balance != null && price ? (balance * price) : 0;
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(address); } catch {}
  };

  return (
    <Card className="p-6 shadow-lg border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Wallet Overview</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs text-muted-foreground">{mask(address)}</div>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopy} aria-label="Copy address">
            <Copy className="w-4 h-4" />
          </Button>
          <a
            className="inline-flex h-7 items-center justify-center rounded-md border px-2 text-sm hover:bg-muted"
            href={`https://explorer.aptoslabs.com/account/${address}?network=mainnet`}
            target="_blank"
            rel="noreferrer"
            aria-label="View on Explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm text-muted-foreground">Balance</div>
        <div className="text-3xl font-bold">{loading ? "…" : `${(balance ?? 0).toFixed(4)} APT`}</div>
        {!loading && (
          <div className="text-sm text-muted-foreground">≈ ${usd.toFixed(2)} USD {price ? `(APT $${price.toFixed(2)})` : ""}</div>
        )}
      </div>

      {/* Token-level balances (APT) */}
      {!loading && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Tokens</div>
          <div className="flex items-center justify-between text-sm border rounded-md p-2">
            <span className="font-medium">APT</span>
            <span className="text-muted-foreground">{(balance ?? 0).toFixed(4)} • ${usd.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div>
        <div className="text-sm font-medium mb-2">Last 5 transactions</div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : txs.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent transfers</div>
        ) : (
          <ul className="space-y-2">
            {txs.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {t.direction === "IN" ? "+" : "-"}
                  {t.amountApt.toFixed(4)} APT
                </span>
                {t.version ? (
                  <a
                    className="text-foreground underline-offset-4 hover:underline"
                    href={`https://explorer.aptoslabs.com/txn/${t.version}?network=mainnet`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t.version}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{t.id}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
