import { Medal } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currency, percentage } from "@/lib/utils";

export function RankingCard({
  title,
  items,
  mode = "money",
}: {
  title: string;
  items: { name: string; value: number; target: number }[];
  mode?: "money" | "count";
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <h3 className="text-sm font-black tracking-tight">{title}</h3>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.map((item, index) => {
          const progress = (item.value / item.target) * 100;
          return (
            <div key={item.name} className="grid gap-2 rounded-xl border bg-background/45 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-xs font-black text-background dark:bg-primary">
                    {index < 3 ? <Medal className="h-4 w-4 text-accent" /> : index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{percentage(progress)} da meta</p>
                  </div>
                </div>
                <p className="text-sm font-black tabular-nums">{mode === "money" ? currency.format(item.value) : item.value}</p>
              </div>
              <Progress value={progress} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
