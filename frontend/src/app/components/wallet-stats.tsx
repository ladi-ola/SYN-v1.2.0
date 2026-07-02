import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, DollarSign, Activity, Target } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="font-medium">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="text-green-500">{change}</span> from last month
        </p>
      </CardContent>
    </Card>
  );
}

export function WalletStats({ connected }: { connected: boolean }) {
  if (!connected) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Value"
        value="$24,582.50"
        change="+20.1%"
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        title="Active Positions"
        value="12"
        change="+3"
        icon={<Activity className="h-4 w-4" />}
      />
      <StatCard
        title="Win Rate"
        value="68.4%"
        change="+4.2%"
        icon={<Target className="h-4 w-4" />}
      />
      <StatCard
        title="ROI"
        value="+32.5%"
        change="+8.1%"
        icon={<TrendingUp className="h-4 w-4" />}
      />
    </div>
  );
}
