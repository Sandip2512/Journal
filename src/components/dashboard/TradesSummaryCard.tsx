import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TradesSummaryCardProps {
  type: "winning" | "losing";
  count: number;
  amount: number;
  animationDelay?: string;
}

export function TradesSummaryCard({ 
  type, 
  count, 
  amount,
  animationDelay = "0s"
}: TradesSummaryCardProps) {
  const isWinning = type === "winning";
  
  return (
    <div 
      className={cn(
        "glass-card p-6 border-l-4 opacity-0 animate-fade-up",
        isWinning ? "border-l-success" : "border-l-destructive"
      )}
      style={{ animationDelay }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {isWinning ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <h3 className="text-sm font-medium text-muted-foreground">
              {isWinning ? "Winning Trades" : "Losing Trades"}
            </h3>
          </div>
          
          <p className={cn(
            "text-4xl font-bold",
            isWinning ? "text-success" : "text-destructive"
          )}>
            {count}
          </p>
          
          <p className="text-sm text-muted-foreground">
            {isWinning ? "Total Profit:" : "Total Loss:"}{" "}
            <span className={cn(
              "font-semibold",
              isWinning ? "text-success" : "text-destructive"
            )}>
              ${amount.toFixed(2)}
            </span>
          </p>
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl",
          isWinning ? "bg-success/10" : "bg-destructive/10"
        )}>
          {isWinning ? (
            <TrendingUp className="w-6 h-6 text-success" />
          ) : (
            <TrendingDown className="w-6 h-6 text-destructive" />
          )}
        </div>
      </div>
    </div>
  );
}
