import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingDown } from "lucide-react";

interface MarketCardProps {
  title: string;
  volume: string;
  probability: number;
  change: number;
  timeToResolution: string;
}

export function MarketCard({ title, volume, probability, change, timeToResolution }: MarketCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h4 className="flex-1 mr-2">{title}</h4>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {timeToResolution}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Volume</p>
            <p className="font-medium">{volume}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">NO Probability</p>
            <p className="font-medium">{probability}%</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm">
          <TrendingDown className="w-4 h-4 text-green-500" />
          <span className="text-green-500">{change > 0 ? '+' : ''}{change}%</span>
          <span className="text-muted-foreground text-xs ml-1">24h change</span>
        </div>
      </CardContent>
    </Card>
  );
}
