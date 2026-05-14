import { clamp, cn } from "@/lib/utils";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-foreground via-primary to-accent transition-all duration-700 dark:from-primary" style={{ width: `${clamp(value)}%` }} />
    </div>
  );
}
