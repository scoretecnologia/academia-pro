import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Edit, Plus, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/contexts/toast-context";
import { createSale, getDashboardData } from "@/services/dashboard-service";
import { saleSchema, type SaleForm } from "@/validations/forms";
import { currency, formatDate, percentage } from "@/lib/utils";
import type { Sale } from "@/types";

export function SellersPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SaleForm>({ resolver: zodResolver(saleSchema) });
  if (!data) return null;

  const sellers = data.users.filter((user) => user.role === "vendedor");
  const rows = sellers.map((seller) => {
    const sellerSales = data.sales.filter((sale) => sale.sellerId === seller.id);
    const goal = data.salesGoals.find((item) => item.sellerId === seller.id);
    const total = sellerSales.reduce((sum, sale) => sum + sale.value, 0);
    return { seller, total, count: sellerSales.length, goal: goal?.amountGoal ?? 0, quantityGoal: goal?.quantityGoal ?? 0 };
  }).sort((a, b) => b.total - a.total);

  async function onSubmit(values: SaleForm) {
    await createSale(values);
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setOpen(false);
    reset();
    toast({ title: "Venda lancada", description: "O ranking e o dashboard foram atualizados." });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">Vendas</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Pipeline e metas comerciais</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Download className="h-4 w-4" /> Exportar</Button>
          <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Novo lançamento</Button>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {rows.map((row, index) => {
          const progress = row.goal ? (row.total / row.goal) * 100 : 0;
          return (
            <Card key={row.seller.id} className="overflow-hidden">
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-sm font-black text-background dark:bg-primary">{row.seller.name.slice(0, 2)}</div>
                    <div>
                      <p className="font-black">{row.seller.name}</p>
                      <p className="text-sm text-muted-foreground">#{index + 1} no ranking comercial</p>
                    </div>
                  </div>
                  <p className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{percentage(progress)}</p>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/45 p-2"><p className="text-muted-foreground">Meta</p><p className="truncate font-black">{currency.format(row.goal)}</p></div>
                  <div className="rounded-lg bg-muted/45 p-2"><p className="text-muted-foreground">Vendido</p><p className="truncate font-black">{currency.format(row.total)}</p></div>
                  <div className="rounded-lg bg-muted/45 p-2"><p className="text-muted-foreground">Vendas</p><p className="font-black">{row.count}/{row.quantityGoal}</p></div>
                </div>
                <Progress value={progress} className="mt-5" />
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar por vendedor, aluno ou plano" />
        </div>
        <Select className="sm:w-56"><option>Este mes</option><option>Ultimos 90 dias</option><option>Ano atual</option></Select>
      </div>
      <DataTable<Sale> data={data.sales} columns={[
        { header: "Vendedor", cell: (row) => row.sellerName, priority: "primary" },
        { header: "Aluno", cell: (row) => row.studentName, priority: "secondary" },
        { header: "Tipo", cell: (row) => row.saleType },
        { header: "Plano", cell: (row) => row.plan },
        { header: "Valor", cell: (row) => currency.format(row.value) },
        { header: "Data", cell: (row) => formatDate(row.soldAt) },
        { header: "Ações", priority: "actions", className: "w-24", cell: () => <div className="flex gap-1"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></div> },
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title="Novo lançamento de venda" description="Registre aluno, plano, valor e observações da negociação.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Vendedor" error={errors.sellerId?.message}><Select {...register("sellerId")}><option value="">Selecione</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.name}</option>)}</Select></Field>
          <Field label="Nome do Aluno" error={errors.studentName?.message}><Input {...register("studentName")} /></Field>
          <Field label="Tipo da venda" error={errors.saleType?.message}><Select {...register("saleType")}><option>Aluno novo</option><option>Upgrade</option><option>Reativação</option><option>Renovação</option></Select></Field>
          <Field label="Plano" error={errors.plan?.message}><Select {...register("plan")}><option>Mensal</option><option>Trimestral</option><option>Quadrimestral com recorrência</option><option>Semestral</option><option>Anual com recorrência</option></Select></Field>
          <Field label="Valor total" error={errors.value?.message}><Input type="number" step="0.01" {...register("value")} /></Field>
          <Field label="Data da venda" error={errors.soldAt?.message}><Input type="date" {...register("soldAt")} /></Field>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Observação<Textarea {...register("note")} /></label>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Salvar venda</Button></div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}{children}{error ? <span className="text-xs text-destructive">{error}</span> : null}</label>;
}
