import { Users, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface InfluencerCardProps {
  influencer: {
    name: string;
    handle: string;
    followers: number;
    lastMention: string;
  };
}

export default function InfluencerCard({ influencer }: InfluencerCardProps) {
  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card className="p-4 border hover:border-primary/30 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center text-foreground font-bold">
            {influencer.name[0]}
          </div>
          <div>
            <div className="font-semibold">{influencer.name}</div>
            <div className="text-sm text-muted-foreground">{influencer.handle}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            {formatFollowers(influencer.followers)}
          </div>
          {influencer.lastMention && (
            <div className="flex items-center gap-1 text-xs text-foreground">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">{influencer.lastMention}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
