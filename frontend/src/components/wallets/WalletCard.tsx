import { Wallet, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WalletCardProps {
  wallet: {
    address: string;
    name: string;
    tokens: string[];
    value: number;
  };
  onRemove: () => void;
}

export default function WalletCard({ wallet, onRemove }: WalletCardProps) {
  return (
    <Card className="p-4 border hover:border-primary/30 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-foreground/10 to-foreground/5">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold mb-1">{wallet.name}</div>
            <div className="text-xs text-muted-foreground truncate mb-2">{wallet.address}</div>
            <div className="flex items-center gap-2 flex-wrap">
              {wallet.tokens.map((token) => (
                <span key={token} className="text-xs px-2 py-1 rounded-full bg-muted/50 border border-border/30">
                  {token}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right ml-3">
          <div className="text-lg font-bold text-foreground mb-2">${wallet.value.toFixed(2)}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 w-7 p-0 hover:bg-foreground/10 hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
