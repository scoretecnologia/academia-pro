import type { ReactNode } from "react";
import { BadgeDollarSign, ClipboardCheck, Goal, RefreshCcw, TrendingUp, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DistributionChart, PlanChart, RevenueChart } from "@/components/analytics/charts";
import { RankingCard } from "@/components/analytics/ranking-card";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/services/dashboard-service";
import { currency, formatDate, percentage } from "@/lib/utils";
import type { Sale, TeacherRecord } from "@/types";

export function DashboardPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  if (!data) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}</div>;

  const sellerRanking = data.users.filter((user) => user.role === "vendedor" && user.active !== false).map((seller) => {
    const total = data.sales.filter((sale) => sale.sellerId === seller.id).reduce((sum, sale) => sum + sale.value, 0);
    const goal = data.salesGoals.find((item) => item.sellerId === seller.id)?.amountGoal ?? 1;
    return { name: seller.name, value: total, target: goal };
  }).sort((a, b) => b.value - a.value).slice(0, 3);

  const teacherRanking = data.users.filter((user) => user.role === "professor" && user.active !== false).map((teacher) => {
    const total = data.teacherRecords.filter((record) => record.teacherId === teacher.id).reduce((sum, record) => sum + record.recordsCount, 0);
    const goal = data.teacherGoals.find((item) => item.teacherId === teacher.id)?.monthlyRecordsGoal ?? 1;
    return { name: teacher.name, value: total, target: goal };
  }).sort((a, b) => b.value - a.value).slice(0, 3);

  const salesByType = ["Aluno novo", "Upgrade", "Reativação", "Renovação"].map((name) => ({ name, value: data.sales.filter((sale) => sale.saleType === name).length }));
  const revenueByPlan = Array.from(new Set(data.sales.map((sale) => sale.plan))).map((name) => ({ name, value: data.sales.filter((sale) => sale.plan === name).reduce((sum, sale) => sum + sale.value, 0) }));

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Dashboard gestor</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl text-foreground">Central executiva de receita, metas e performance técnica</h1>
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/35 px-4 py-3 text-sm lg:w-[320px]">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Pulso do mês</p>
          <p className="mt-1 text-lg font-black text-foreground">{currency.format(data.metrics.monthRevenue)}</p>
          <p className="text-xs font-semibold text-muted-foreground">
            Meta financeira {data.metrics.revenueGoal > 0 ? currency.format(data.metrics.revenueGoal) : "não definida"}
          </p>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.18fr_0.82fr_1.5fr_0.72fr]">
        <DashboardMetricCard
          eyebrow="Receita do mês"
          icon={<BadgeDollarSign className="h-5 w-5" />}
          accent="from-blue-500/15 via-primary/10 to-transparent"
        >
          <div className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <p className="text-3xl font-black tracking-tight text-foreground">{currency.format(data.metrics.monthRevenue)}</p>
              <div className="rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Meta</p>
                <p className="text-sm font-black text-foreground">
                  {data.metrics.revenueGoal > 0 ? currency.format(data.metrics.revenueGoal) : "Não definida"}
                </p>
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              {getRevenueGapLabel(data.metrics.monthRevenue, data.metrics.revenueGoal)}
            </p>
          </div>
        </DashboardMetricCard>

        <DashboardMetricCard
          eyebrow="% da meta"
          icon={<Goal className="h-5 w-5" />}
          accent="from-emerald-500/15 via-emerald-400/10 to-transparent"
        >
          <div className="grid gap-3">
            <div className="flex items-end justify-between gap-3">
              <p className="text-3xl font-black tracking-tight text-foreground">{percentage(data.metrics.revenueGoalCompletion)}</p>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-black text-emerald-600">
                Receita
              </span>
            </div>
            <Progress value={data.metrics.revenueGoalCompletion} className="h-2.5" />
            <p className="text-xs font-semibold text-muted-foreground">
              {data.metrics.revenueGoal > 0 ? "Percentual da meta financeira acumulada no período." : "Cadastre uma meta financeira para acompanhar este indicador."}
            </p>
          </div>
        </DashboardMetricCard>

        <DashboardMetricCard
          eyebrow="Mix comercial"
          icon={<UserPlus className="h-5 w-5" />}
          accent="from-violet-500/15 via-violet-400/10 to-transparent"
        >
          <div className="grid gap-3">
            <div className="grid grid-cols-[0.88fr_1fr_1.14fr] gap-2">
              <MetricChip label="Novos" value={String(data.metrics.newStudents)} icon={<UserPlus className="h-3.5 w-3.5" />} />
              <MetricChip label="Upgrades" value={String(data.metrics.upgrades)} icon={<TrendingUp className="h-3.5 w-3.5" />} />
              <MetricChip label="Reativações" value={String(data.metrics.reactivations)} icon={<RefreshCcw className="h-3.5 w-3.5" />} />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              Renovações no período: <span className="font-black text-foreground">{data.metrics.renewals}</span>
            </p>
          </div>
        </DashboardMetricCard>

        <DashboardMetricCard
          eyebrow="Fichas geradas"
          icon={<ClipboardCheck className="h-5 w-5" />}
          accent="from-amber-500/15 via-amber-400/10 to-transparent"
        >
          <div className="grid gap-3">
            <p className="text-3xl font-black tracking-tight text-foreground">{data.metrics.teacherRecords}</p>
            <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Produção técnica</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {data.metrics.teacherRecords > 0 ? "Fichas registradas pelos professores no período." : "Sem fichas registradas até o momento."}
              </p>
            </div>
          </div>
        </DashboardMetricCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <RevenueChart data={data.revenueSeries} />
        <RankingCard title="Ranking de vendedores" items={sellerRanking} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <RankingCard title="Ranking de professores" items={teacherRanking} mode="count" />
        <DistributionChart title="Vendas por tipo" data={salesByType} />
        <PlanChart data={revenueByPlan} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="grid gap-3"><h2 className="text-sm font-black">Ultimas vendas</h2>
        <DataTable<Sale> data={data.sales.filter(s => data.users.find(u => u.id === s.sellerId)?.active !== false).slice(0, 5)} columns={[
          { header: "Vendedor", cell: (row) => row.sellerName, priority: "primary" },
          { header: "Aluno", cell: (row) => row.studentName, priority: "secondary" },
          { header: "Plano", cell: (row) => row.plan },
          { header: "Valor", cell: (row) => currency.format(row.value) },
          { header: "Data", cell: (row) => formatDate(row.soldAt) },
        ]} /></div>
        <div className="grid gap-3"><h2 className="text-sm font-black">Ultimas fichas</h2>
        <DataTable<TeacherRecord> data={data.teacherRecords.filter(r => data.users.find(u => u.id === r.teacherId)?.active !== false).slice(0, 5)} columns={[
          { header: "Professor", cell: (row) => row.teacherName, priority: "primary" },
          { header: "Fichas", cell: (row) => row.recordsCount, priority: "secondary" },
          { header: "Observação", cell: (row) => row.note ?? "Sem observação" },
          { header: "Data", cell: (row) => formatDate(row.recordDate) },
        ]} /></div>
      </div>
    </div>
  );
}

function DashboardMetricCard({
  eyebrow,
  icon,
  accent,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  accent: string;
  children: ReactNode;
}) {
  return (
    <Card className={`relative overflow-hidden border border-border/70 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-5 ${accent && `bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))]`} ${accent}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
        <div className="grid h-10 w-10 place-items-center rounded-xl border border-border/70 bg-background/85 text-foreground">
          {icon}
        </div>
      </div>
      {children}
    </Card>
  );
}

function MetricChip({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/80 px-2.5 py-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <p className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.1em]">{label}</p>
      </div>
      <p className="mt-2 text-xl font-black tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function getRevenueGapLabel(monthRevenue: number, revenueGoal: number) {
  if (revenueGoal <= 0) return "Cadastre uma meta para acompanhar o desempenho financeiro do mês.";
  if (monthRevenue >= revenueGoal) return `Meta superada em ${currency.format(monthRevenue - revenueGoal)}.`;
  return `Faltam ${currency.format(revenueGoal - monthRevenue)} para atingir a meta financeira.`;
}
