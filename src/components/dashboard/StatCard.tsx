import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  valueClassName?: string;
  animationDelay?: string;
}

export function StatCard({ 
  label, 
  value, 
  className,
  valueClassName,
  animationDelay = "0s"
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "stat-card text-center opacity-0 animate-fade-up",
        className
      )}
      style={{ animationDelay }}
    >
      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className={cn(
        "text-2xl lg:text-3xl font-bold text-foreground",
        valueClassName
      )}>
        {value}
      </p>
    </div>
  );
}
