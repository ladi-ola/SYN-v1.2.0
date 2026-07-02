import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Bot, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface BotSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: BotSettings) => void;
}

export interface BotSettings {
  enabled: boolean;
  maxPositionSize: string;
  minProbability: string;
  stopLoss: string;
  takeProfit: string;
  strategy: string;
}

export function BotSettingsDialog({ open, onOpenChange, onSave }: BotSettingsDialogProps) {
  const [settings, setSettings] = useState<BotSettings>({
    enabled: false,
    maxPositionSize: "1000",
    minProbability: "60",
    stopLoss: "20",
    takeProfit: "50",
    strategy: "conservative"
  });

  const handleSave = () => {
    onSave(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Automated Trading Settings
          </DialogTitle>
          <DialogDescription>
            Configure your bot trading parameters and risk management
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable Bot Trading */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Bot Trading</Label>
              <p className="text-xs text-muted-foreground">
                Activate automated market execution
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
            />
          </div>

          <Separator />

          {/* Strategy Selection */}
          <div className="space-y-2">
            <Label>Trading Strategy</Label>
            <Select
              value={settings.strategy}
              onValueChange={(strategy) => setSettings({ ...settings, strategy })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative - Low risk, steady gains</SelectItem>
                <SelectItem value="moderate">Moderate - Balanced risk/reward</SelectItem>
                <SelectItem value="aggressive">Aggressive - High risk, high reward</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Position Size */}
          <div className="space-y-2">
            <Label>Max Position Size (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                className="pl-9"
                value={settings.maxPositionSize}
                onChange={(e) => setSettings({ ...settings, maxPositionSize: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum amount per trade
            </p>
          </div>

          {/* Min Probability */}
          <div className="space-y-2">
            <Label>Minimum Probability (%)</Label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                className="pl-9"
                min="0"
                max="100"
                value={settings.minProbability}
                onChange={(e) => setSettings({ ...settings, minProbability: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Only trade when NO probability exceeds this threshold
            </p>
          </div>

          {/* Risk Management */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stop Loss (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.stopLoss}
                onChange={(e) => setSettings({ ...settings, stopLoss: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Take Profit (%)</Label>
              <Input
                type="number"
                min="0"
                value={settings.takeProfit}
                onChange={(e) => setSettings({ ...settings, takeProfit: e.target.value })}
              />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-destructive">
              Automated trading carries risk. Only use funds you can afford to lose.
              Bot will execute trades based on your parameters without manual approval.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
