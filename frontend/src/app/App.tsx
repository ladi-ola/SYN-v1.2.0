import { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { useTheme } from "next-themes";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Separator } from "./components/ui/separator";
import { Badge } from "./components/ui/badge";
import { ScrollArea } from "./components/ui/scroll-area";
import { Switch } from "./components/ui/switch";
import {
  Moon,
  Sun,
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Clock,
  Settings,
  Bell,
  Search,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { MarketsTable } from "./components/markets-table";
import { fetchOpportunities } from "./api";
import type { ApiMarket, ApiMarketsResponse } from "./types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

const TIME_BUCKETS: Record<string, string> = {
  "1m": "1-month",
  "1w": "1-week",
  "1d": "1-day",
  "12h": "12-hours",
  "4h": "4-hours",
};

const TIME_BUCKETS_REVERSE: Record<string, string> = {
  "1-month": "1m",
  "1-week": "1w",
  "1-day": "1d",
  "12-hours": "12h",
  "4-hours": "4h",
};

function DashboardContent() {
  const { theme, setTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [data, setData] = useState<ApiMarketsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("1-month");
  const [includeLongshots, setIncludeLongshots] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const result = await fetchOpportunities();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allMarkets: ApiMarket[] = useMemo(() => {
    if (!data) return [];
    let markets = data.markets;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      markets = markets.filter((m) => m.question.toLowerCase().includes(q));
    }
    return markets;
  }, [data, searchQuery]);

  const marketsByBucket = useMemo(() => {
    const result: Record<string, ApiMarket[]> = {};
    for (const [bucket] of Object.entries(TIME_BUCKETS)) {
      let filtered = allMarkets.filter((m) => m.time_bucket === bucket);
      if (!includeLongshots) {
        filtered = filtered.filter(
          (m) => m.no_price < 0.991 && m.no_price > 0.009
        );
      }
      result[bucket] = filtered;
    }
    return result;
  }, [allMarkets, includeLongshots]);

  const tabBucket = TIME_BUCKETS_REVERSE[activeTab] ?? "1m";
  const activeMarkets = marketsByBucket[tabBucket] ?? [];
  const topOpportunities = useMemo(
    () => allMarkets.slice(0, 20),
    [allMarkets]
  );

  const totalVolume = useMemo(
    () => allMarkets.reduce((sum, m) => sum + m.volume, 0),
    [allMarkets]
  );

  const formatRefreshTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h1 className="font-bold tracking-tight">SYN</h1>
                <p className="text-xs text-muted-foreground mt-1">Polymarket Analytics</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <nav className="space-y-1 px-3">
                <Button variant="secondary" className="w-full justify-start gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Opportunities
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Clock className="h-4 w-4" />
                  By Time
                </Button>
                <Separator className="my-3" />
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Button>
              </nav>
              <div className="p-4 mt-6">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Markets</p>
                      <p className="text-lg font-medium">{data?.count ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bucket (active tab)</p>
                      <p className="text-lg font-medium">{activeMarkets.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Volume</p>
                      <p className="text-lg font-medium">{formatCurrency(totalVolume)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r border-border bg-card hidden lg:flex lg:flex-col transition-all duration-300 shrink-0 sticky top-0 h-screen`}>
        <div className="p-6 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div>
              <h1 className="font-bold tracking-tight">SYN</h1>
              <p className="text-xs text-muted-foreground mt-1">Polymarket Analytics</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={sidebarCollapsed ? 'mx-auto' : ''}
          >
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <nav className="space-y-1 px-3">
            <Button variant="secondary" className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2`}>
              <LayoutDashboard className="h-4 w-4" />
              {!sidebarCollapsed && 'Dashboard'}
            </Button>
            <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2`}>
              <TrendingUp className="h-4 w-4" />
              {!sidebarCollapsed && 'Opportunities'}
            </Button>
            <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2`}>
              <BarChart3 className="h-4 w-4" />
              {!sidebarCollapsed && 'Analytics'}
            </Button>
            <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2`}>
              <Clock className="h-4 w-4" />
              {!sidebarCollapsed && 'By Time'}
            </Button>
            <Separator className="my-3" />
            <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2`}>
              <Settings className="h-4 w-4" />
              {!sidebarCollapsed && 'Settings'}
            </Button>
            <Button variant="ghost" className={`w-full ${sidebarCollapsed ? 'justify-center' : 'justify-start'} gap-2`}>
              <Bell className="h-4 w-4" />
              {!sidebarCollapsed && 'Notifications'}
            </Button>
          </nav>

          {!sidebarCollapsed && (
            <div className="p-4 mt-6">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Markets</p>
                    <p className="text-lg font-medium">{data?.count ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bucket (active tab)</p>
                    <p className="text-lg font-medium">{activeMarkets.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Volume</p>
                    <p className="text-lg font-medium">{formatCurrency(totalVolume)}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
                <PanelLeft className="h-4 w-4" />
              </Button>
              <h2 className="lg:hidden">SYN</h2>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-input-background rounded-md outline-none focus:ring-2 ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 mr-2">
                <Switch
                  checked={includeLongshots}
                  onCheckedChange={setIncludeLongshots}
                  id="longshot-toggle"
                />
                <label htmlFor="longshot-toggle" className="text-xs text-muted-foreground cursor-pointer select-none">
                  Longshots
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-9"
                onClick={loadData}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">{isRefreshing ? "Scanning..." : "Refresh"}</span>
              </Button>

              <Separator orientation="vertical" className="h-6" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1">
          <div className="p-6 space-y-6">
            {/* Error State */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="flex items-center gap-4 py-4">
                  <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Connection Error</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadData}>
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}

            {!error && (
              <>
                {/* Top Opportunities */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3>Top Opportunities</h3>
                      <p className="text-sm text-muted-foreground">Highest scoring markets by composite score</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Updated {formatRefreshTime(lastRefreshed)}</span>
                      <Badge variant="outline" className="gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Live
                      </Badge>
                    </div>
                  </div>
                  <MarketsTable markets={topOpportunities} loading={loading} />
                </section>

                <Separator />

                {/* Markets by Resolution Time */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3>Markets by Resolution Time</h3>
                      <p className="text-sm text-muted-foreground">Browse opportunities organized by when they resolve</p>
                    </div>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="1-month">1 Month</TabsTrigger>
                      <TabsTrigger value="1-week">1 Week</TabsTrigger>
                      <TabsTrigger value="1-day">1 Day</TabsTrigger>
                      <TabsTrigger value="12-hours">12 Hours</TabsTrigger>
                      <TabsTrigger value="4-hours">4 Hours</TabsTrigger>
                    </TabsList>

                    {Object.entries(TIME_BUCKETS).map(([bucket, tabValue]) => {
                      const bucketMarkets = marketsByBucket[bucket] ?? [];
                      return (
                        <TabsContent key={bucket} value={tabValue} className="mt-6">
                          <MarketsTable markets={bucketMarkets} loading={loading} />
                        </TabsContent>
                      );
                    })}
                  </Tabs>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardContent />
    </ThemeProvider>
  );
}
