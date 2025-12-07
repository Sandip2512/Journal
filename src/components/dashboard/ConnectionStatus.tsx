import { Plug, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  isConnected: boolean;
  accountId: string;
  server: string;
  lastFetch: string;
}

export function ConnectionStatus({
  isConnected,
  accountId,
  server,
  lastFetch,
}: ConnectionStatusProps) {
  return (
    <div className="glass-card p-6 border-l-4 border-l-destructive opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted">
              <Plug className="w-4 h-4 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              MT5 Connection Status
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold transition-all",
                isConnected 
                  ? "status-connected pulse-glow" 
                  : "status-disconnected"
              )}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              Account: <span className="text-foreground font-medium">{accountId}</span>
              {" | "}
              Server: <span className="text-foreground font-medium">{server}</span>
            </p>
            <p>
              Last Fetch: <span className="text-foreground font-medium">{lastFetch}</span>
            </p>
          </div>
        </div>
        
        <Button variant="success" size="lg" className="gap-2 w-full lg:w-auto">
          <RefreshCw className="w-4 h-4" />
          Fetch Trades
        </Button>
      </div>
    </div>
  );
}
