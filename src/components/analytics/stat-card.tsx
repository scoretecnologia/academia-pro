import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({ label, value, delta, icon: Icon }: { label: string; value: string; delta: string; icon: LucideIcon }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="group p-4 transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.10)] sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight text-foreground">{value}</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-foreground transition group-hover:bg-foreground group-hover:text-background dark:group-hover:bg-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-4 text-xs font-bold text-accent">{delta}</p>
      </Card>
    </motion.div>
  );
}
