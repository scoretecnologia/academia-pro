import { Activity, BadgeDollarSign, ClipboardCheck, RefreshCcw, TrendingUp, UserPlus, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/analytics/stat-card";
import { DistributionChart, PlanChart, RevenueChart } from "@/components/analytics/charts";
import { RankingCard } from "@/components/analytics/ranking-card";
import { DataTable } from "@/components/ui/data-table";
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
  }).sort((a, b) => b.value - a.value);

  const teacherRanking = data.users.filter((user) => user.role === "professor" && user.active !== false).map((teacher) => {
    const total = data.teacherRecords.filter((record) => record.teacherId === teacher.id).reduce((sum, record) => sum + record.recordsCount, 0);
    const goal = data.teacherGoals.find((item) => item.teacherId === teacher.id)?.monthlyRecordsGoal ?? 1;
    return { name: teacher.name, value: total, target: goal };
  }).sort((a, b) => b.value - a.value);

  const salesByType = ["Aluno novo", "Upgrade", "Reativação", "Renovação"].map((name) => ({ name, value: data.sales.filter((sale) => sale.saleType === name).length }));
  const revenueByPlan = Array.from(new Set(data.sales.map((sale) => sale.plan))).map((name) => ({ name, value: data.sales.filter((sale) => sale.plan === name).reduce((sum, sale) => sum + sale.value, 0) }));

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 text-card-foreground shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-primary">Dashboard gestor</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl text-foreground">Central executiva de receita, metas e performance técnica</h1>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:w-[420px]">
          <div className="rounded-xl bg-muted/50 p-3"><p className="text-muted-foreground font-medium">Receita</p><p className="font-black text-foreground">{currency.format(data.metrics.monthRevenue)}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><p className="text-muted-foreground font-medium">Metas</p><p className="font-black text-foreground">{percentage(data.metrics.goalCompletion)}</p></div>
          <div className="rounded-xl bg-muted/50 p-3"><p className="text-muted-foreground font-medium">Fichas</p><p className="font-black text-foreground">{data.metrics.teacherRecords}</p></div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Receita do mes" value={currency.format(data.metrics.monthRevenue)} delta="+18% vs mes anterior" icon={BadgeDollarSign} />
        <StatCard label="Novos alunos" value={String(data.metrics.newStudents)} delta="Meta acelerando" icon={UserPlus} />
        <StatCard label="Upgrades" value={String(data.metrics.upgrades)} delta="Ticket medio em alta" icon={TrendingUp} />
        <StatCard label="Reativações" value={String(data.metrics.reactivations)} delta="Recuperação ativa" icon={RefreshCcw} />
        <StatCard label="Renovações" value={String(data.metrics.renewals)} delta="Base protegida" icon={Activity} />
        <StatCard label="Fichas criadas" value={String(data.metrics.teacherRecords)} delta="Professores no ritmo" icon={ClipboardCheck} />
        <StatCard label="Metas atingidas" value={percentage(data.metrics.goalCompletion)} delta="Indice geral ponderado" icon={Zap} />
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
