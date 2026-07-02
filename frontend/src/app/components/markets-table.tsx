import { Fragment, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ArrowUpDown, ChevronDown, ChevronUp, ExternalLink, ListFilter, Check, X } from "lucide-react";
import type { ApiMarket } from "../types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return iso;
  }
}

function daysUntil(iso: string): number {
  try {
    const end = new Date(iso).getTime();
    const now = Date.now();
    return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}

interface MarketsTableProps {
  markets: ApiMarket[];
  loading?: boolean;
}

function ExpandedRow({ market, showYesPrice }: { market: ApiMarket; showYesPrice: boolean }) {
  const displayPrice = showYesPrice ? market.yes_price : market.no_price;
  const noPricePct = Math.round(market.no_price * 100);
  const yesPricePct = Math.round(market.yes_price * 100);

  return (
    <TableRow className="bg-muted/20 border-t-0">
      <TableCell colSpan={11} className="pt-0 pb-4 px-4">
        <div className="grid grid-cols-5 gap-4 mt-2 ml-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Time Bucket</p>
            <p className="font-semibold">{market.time_bucket}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Historical Accuracy</p>
            <p className="font-semibold">{market.historical_accuracy}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Score (Vol/Price/Hist)</p>
            <p className="font-semibold">
              {market.final_score.toFixed(1)} ({market.volume_score}/{market.price_score.toFixed(0)}/{market.historical_accuracy})
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">YES / NO</p>
            <p className="font-semibold">
              <span className="text-green-500">{yesPricePct}¢</span>
              {" / "}
              <span className="text-red-500">{noPricePct}¢</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Resolution</p>
            <p className="font-semibold">{formatDate(market.end_date)}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-4 ml-6">
          {market.market_url && (
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" asChild>
              <a href={market.market_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Open Market
              </a>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function MarketsTable({ markets, loading }: MarketsTableProps) {
  const [showYesPrice, setShowYesPrice] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [catFilterOpen, setCatFilterOpen] = useState(false);
  const [activeCats, setActiveCats] = useState<string[]>([]);

  const availableCategories = useMemo(
    () => Array.from(new Set(markets.map((m) => m.category))).sort(),
    [markets]
  );

  const toggleCat = (cat: string) => {
    setActiveCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setSelectedIdx(null);
  };

  const visibleMarkets = useMemo(
    () => (activeCats.length === 0 ? markets : markets.filter((m) => activeCats.includes(m.category))),
    [markets, activeCats]
  );

  const handleRowClick = (idx: number) => {
    setSelectedIdx(selectedIdx === idx ? null : idx);
  };

  if (loading) {
    return (
    <div className="border rounded-lg overflow-x-auto">
        <div className="p-8 text-center text-muted-foreground">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          Loading market data...
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[300px]">Market</TableHead>
            <TableHead>
              <div className="relative inline-flex items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); setCatFilterOpen(!catFilterOpen); }}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-foreground ${activeCats.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                >
                  Category
                  <ListFilter className="h-3.5 w-3.5" />
                  {activeCats.length > 0 && (
                    <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                      {activeCats.length}
                    </span>
                  )}
                </button>
                {catFilterOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setCatFilterOpen(false)} />
                    <div className="absolute left-0 top-7 z-20 bg-popover border rounded-lg shadow-lg p-2 min-w-[160px]">
                      <div className="flex items-center justify-between px-2 py-1 mb-1">
                        <span className="text-xs text-muted-foreground font-medium">Filter category</span>
                        {activeCats.length > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveCats([]); setSelectedIdx(null); }}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                          >
                            <X className="h-3 w-3" /> Clear
                          </button>
                        )}
                      </div>
                      <Separator className="mb-1.5" />
                      {availableCategories.map((cat) => {
                        const on = activeCats.includes(cat);
                        return (
                          <button
                            key={cat}
                            onClick={(e) => { e.stopPropagation(); toggleCat(cat); }}
                            className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${on ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"}`}
                          >
                            <span className={`flex items-center justify-center h-3.5 w-3.5 rounded border ${on ? "bg-primary border-primary" : "border-muted-foreground"}`}>
                              {on && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                            </span>
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </TableHead>
            <TableHead className="text-right">Days Left</TableHead>
            <TableHead className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); setShowYesPrice(!showYesPrice); }}
                className="h-auto p-0 hover:bg-transparent font-medium"
              >
                {showYesPrice ? "YES" : "NO"} Price
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">Odds</TableHead>
            <TableHead className="text-right">Liquidity</TableHead>
            <TableHead className="text-right">Volume</TableHead>
            <TableHead className="text-right">24h Vol</TableHead>
            <TableHead className="text-right">Accuracy</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleMarkets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                No markets match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            visibleMarkets.map((market, idx) => {
              const displayPrice = showYesPrice ? market.yes_price : market.no_price;
              const displayPriceCents = Math.round(displayPrice * 100);
              const oddsValue = displayPrice > 0 ? (100 / (displayPrice * 100)).toFixed(2) : "N/A";
              const isSelected = selectedIdx === idx;

              return (
                <Fragment key={market.market_id}>
                  <TableRow
                    className={`cursor-pointer transition-colors ${isSelected ? "bg-muted/50 border-b-0" : "hover:bg-muted/30"}`}
                    onClick={() => handleRowClick(idx)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground text-xs mt-0.5">{idx + 1}</span>
                        <span className="line-clamp-2">{market.question}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {market.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-muted-foreground">{daysUntil(market.end_date)}d</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={showYesPrice ? "text-green-500" : "text-red-500"}>
                        {displayPriceCents}¢
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {oddsValue}x
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(market.liquidity)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(market.volume)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(market.volume_24h)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {market.historical_accuracy}%
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="text-xs font-mono">
                        {market.final_score.toFixed(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      <div className="flex items-center justify-end gap-1">
                        {formatDate(market.end_date)}
                        {isSelected ? (
                          <ChevronUp className="h-3 w-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {isSelected && (
                    <ExpandedRow market={market} showYesPrice={showYesPrice} />
                  )}
                </Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
