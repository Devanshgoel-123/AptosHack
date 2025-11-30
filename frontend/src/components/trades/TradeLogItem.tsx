import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface TradeLogItemProps {
  log: {
    token: string;
    action: string;
    amount: string;
    reason: string;
  };
}

export default function TradeLogItem({ log }: TradeLogItemProps) {
  const isBuy = log.action === 'BUY';
  
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/40 border border-border/30 hover:border-border/50 transition-all">
      <div className="p-1.5 rounded-full bg-foreground/10">
        {isBuy ? (
          <ArrowUpCircle className="w-4 h-4" />
        ) : (
          <ArrowDownCircle className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`font-semibold text-foreground`}>
            {log.action}
          </span>
          <span className="font-medium">{log.token}</span>
          <span className="text-muted-foreground text-sm">${log.amount}</span>
        </div>
        <div className="text-xs text-muted-foreground">{log.reason}</div>
      </div>
    </div>
  );
}
