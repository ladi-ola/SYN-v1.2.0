import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Wallet, Bot, Shield, Zap } from "lucide-react";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (walletType: string) => void;
}

export function WalletConnectDialog({ open, onOpenChange, onConnect }: WalletConnectDialogProps) {
  const wallets = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask browser extension",
      type: "metamask"
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      description: "Scan QR code with your mobile wallet",
      type: "walletconnect"
    },
    {
      name: "Coinbase Wallet",
      icon: "💼",
      description: "Connect with Coinbase Wallet",
      type: "coinbase"
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect and enable automated trading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {wallets.map((wallet) => (
            <Button
              key={wallet.type}
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => {
                onConnect(wallet.type);
                onOpenChange(false);
              }}
            >
              <span className="text-2xl mr-3">{wallet.icon}</span>
              <div className="text-left flex-1">
                <p className="font-medium">{wallet.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{wallet.description}</p>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <span>Secure connection with encrypted keys</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="h-3 w-3" />
              <span>Enable automated trading strategies</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-3 w-3" />
              <span>Real-time market execution</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
