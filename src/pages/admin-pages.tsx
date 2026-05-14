import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarRange, Download, FileSpreadsheet, KeyRound, Loader2, Plus, Repeat2, ShieldCheck, SlidersHorizontal, UserCog } from "lucide-react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/contexts/toast-context";
import { createAppUser, getDashboardData, saveGoalPlan, updateUser } from "@/services/dashboard-service";
import { currency, formatDate, formatMonthYear, monthNames, sameMonthYear } from "@/lib/utils";
import { goalSchema, userSchema, type GoalForm, type UserForm } from "@/validations/forms";
import type { AppUser, AuditLog, Sale } from "@/types";

type SelectedGoal = {
  label: string;
  type: "vendedor" | "professor";
  periodLabel: string;
};

export function GoalsPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedGoal, setSelectedGoal] = useState<SelectedGoal | null>(null);
  const currentDate = new Date();
  const defaultPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goalType: "vendedor",
      period: defaultPeriod,
      replicateMonths: 1,
      quantityGoal: 0,
      weeklyRecordsGoal: 0,
    },
  });
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    watch: watchEdit,
    formState: { errors: editErrors },
  } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: { goalType: "vendedor", period: defaultPeriod, replicateMonths: 1 },
  });
  const goalType = watch("goalType");
  const editGoalType = watchEdit("goalType");
  const goalTypeField = register("goalType");
  const createGoalMutation = useMutation({
    mutationFn: saveGoalPlan,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset({
        goalType: result.type,
        period: defaultPeriod,
        replicateMonths: 1,
        userId: "",
        amountGoal: undefined,
        quantityGoal: 0,
        monthlyRecordsGoal: undefined,
        weeklyRecordsGoal: 0,
      });
      toast({ title: "Meta salva", description: `${result.count} competência(s) atualizada(s) com sucesso.` });
    },
    onError: (error) => {
      toast({ title: "Não foi possível salvar", description: error instanceof Error ? error.message : "Verifique os dados e tente novamente." });
    },
  });
  const updateGoalMutation = useMutation({
    mutationFn: saveGoalPlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setSelectedGoal(null);
      resetEdit({ goalType: "vendedor", period: defaultPeriod, replicateMonths: 1, userId: "", amountGoal: undefined, quantityGoal: 0, monthlyRecordsGoal: undefined, weeklyRecordsGoal: 0 });
      toast({ title: "Sessão iniciada", description: "Bem-vindo ao painel executivo." });
    },
    onError: (error) => {
      toast({ title: "Não foi possível atualizar", description: error instanceof Error ? error.message : "Verifique os dados e tente novamente." });
    },
  });

  if (!data) return null;

  const sellers = data.users.filter((user) => user.role === "vendedor" && user.active);
  const teachers = data.users.filter((user) => user.role === "professor" && user.active);
  const people = goalType === "vendedor" ? sellers : teachers;
  const periodOptions = buildPeriodOptions();

  function onSubmit(values: GoalForm) {
    createGoalMutation.mutate(values);
  }

  function onEditSubmit(values: GoalForm) {
    updateGoalMutation.mutate({ ...values, replicateMonths: 1 });
  }

  function editSalesGoal(goal: { sellerId: string; month: number; year: number; amountGoal: number; quantityGoal: number }, sellerName: string) {
    resetEdit({
      goalType: "vendedor",
      userId: goal.sellerId,
      period: `${goal.year}-${String(goal.month).padStart(2, "0")}`,
      replicateMonths: 1,
      amountGoal: goal.amountGoal,
      quantityGoal: goal.quantityGoal,
      monthlyRecordsGoal: undefined,
      weeklyRecordsGoal: 0,
    });
    setSelectedGoal({ label: sellerName, type: "vendedor", periodLabel: formatMonthYear(goal.month, goal.year) });
  }

  function editTeacherGoal(goal: { teacherId: string; month: number; year: number; monthlyRecordsGoal: number; weeklyRecordsGoal: number }, teacherName: string) {
    resetEdit({
      goalType: "professor",
      userId: goal.teacherId,
      period: `${goal.year}-${String(goal.month).padStart(2, "0")}`,
      replicateMonths: 1,
      amountGoal: undefined,
      quantityGoal: 0,
      monthlyRecordsGoal: goal.monthlyRecordsGoal,
      weeklyRecordsGoal: goal.weeklyRecordsGoal,
    });
    setSelectedGoal({ label: teacherName, type: "professor", periodLabel: formatMonthYear(goal.month, goal.year) });
  }

  return (
    <Page title="Metas inteligentes" eyebrow="Planejamento">
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-bold">Metas de vendedores</h2></CardHeader>
          <CardContent className="max-h-[420px] overflow-y-auto pr-2">
            <div className="grid gap-4">
            {data.salesGoals.map((goal) => {
              const seller = data.users.find((user) => user.id === goal.sellerId);
              const sellerName = seller?.name ?? "Vendedor";
              const total = data.sales
                .filter((sale) => sale.sellerId === goal.sellerId && sameMonthYear(sale.soldAt, goal.month, goal.year))
                .reduce((sum, sale) => sum + sale.value, 0);
              return <GoalRow key={goal.id} name={sellerName} period={formatMonthYear(goal.month, goal.year)} current={currency.format(total)} target={currency.format(goal.amountGoal)} progress={(total / goal.amountGoal) * 100} onClick={() => editSalesGoal(goal, sellerName)} />;
            })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="font-bold">Metas de professores</h2></CardHeader>
          <CardContent className="max-h-[420px] overflow-y-auto pr-2">
            <div className="grid gap-4">
            {data.teacherGoals.map((goal) => {
              const teacher = data.users.find((user) => user.id === goal.teacherId);
              const teacherName = teacher?.name ?? "Professor";
              const total = data.teacherRecords
                .filter((record) => record.teacherId === goal.teacherId && sameMonthYear(record.recordDate, goal.month, goal.year))
                .reduce((sum, record) => sum + record.recordsCount, 0);
              return <GoalRow key={goal.id} name={teacherName} period={formatMonthYear(goal.month, goal.year)} current={`${total} fichas`} target={`${goal.monthlyRecordsGoal} fichas`} progress={(total / goal.monthlyRecordsGoal) * 100} onClick={() => editTeacherGoal(goal, teacherName)} />;
            })}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" />
            <div>
              <h2 className="font-bold">Configurar meta por competência</h2>
              <p className="text-xs font-semibold text-muted-foreground">Para editar, clique em uma meta da listagem.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Tipo" error={errors.goalType?.message}>
                <Select
                  {...goalTypeField}
                  onChange={(event) => {
                    goalTypeField.onChange(event);
                    reset({
                      goalType: event.target.value as "vendedor" | "professor",
                      userId: "",
                      period: defaultPeriod,
                      replicateMonths: 1,
                      amountGoal: undefined,
                      quantityGoal: 0,
                      monthlyRecordsGoal: undefined,
                      weeklyRecordsGoal: 0,
                    });
                  }}
                >
                  <option value="vendedor">Vendedor</option>
                  <option value="professor">Professor</option>
                </Select>
              </Field>
              <Field label="Responsável" error={errors.userId?.message}>
                <Select {...register("userId")}>
                  <option value="">Selecione</option>
                  {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
                </Select>
              </Field>
              <Field label="Competência" error={errors.period?.message}>
                <Select {...register("period")}>
                  {periodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
              </Field>
              <Field label="Replicar por" error={errors.replicateMonths?.message}>
                <div className="relative">
                  <Input type="number" min={1} max={36} className="pr-16" {...register("replicateMonths")} />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">meses</span>
                </div>
              </Field>
              <div className="hidden items-end lg:flex">
                <div className="flex h-10 items-center gap-2 rounded-lg border bg-muted/35 px-3 text-xs font-bold text-muted-foreground">
                  <Repeat2 className="h-4 w-4" />
                  Replica em sequência
                </div>
              </div>
            </div>
            {goalType === "vendedor" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Meta financeira mensal" error={errors.amountGoal?.message}>
                  <Input type="number" min={0} step="0.01" placeholder="Ex: 25000" {...register("amountGoal")} />
                </Field>
                <Field label="Meta de vendas" error={errors.quantityGoal?.message}>
                  <Input type="number" min={0} placeholder="Ex: 40" {...register("quantityGoal")} />
                </Field>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Meta mensal de fichas" error={errors.monthlyRecordsGoal?.message}>
                  <Input type="number" min={0} placeholder="Ex: 120" {...register("monthlyRecordsGoal")} />
                </Field>
                <Field label="Meta semanal de fichas" error={errors.weeklyRecordsGoal?.message}>
                  <Input type="number" min={0} placeholder="Ex: 30" {...register("weeklyRecordsGoal")} />
                </Field>
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="submit" disabled={createGoalMutation.isPending}>
                {createGoalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Salvar meta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Modal
        open={Boolean(selectedGoal)}
        onClose={() => setSelectedGoal(null)}
        title="Editar meta"
        description={selectedGoal ? `${selectedGoal.label} - ${selectedGoal.periodLabel}` : undefined}
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="grid gap-4">
          <input type="hidden" {...editRegister("goalType")} />
          <input type="hidden" {...editRegister("userId")} />
          <input type="hidden" {...editRegister("period")} />
          <input type="hidden" value={1} {...editRegister("replicateMonths")} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-muted/35 p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Tipo</p>
              <p className="mt-1 text-sm font-black capitalize">{selectedGoal?.type}</p>
            </div>
            <div className="rounded-xl border bg-muted/35 p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Responsável</p>
              <p className="mt-1 truncate text-sm font-black">{selectedGoal?.label}</p>
            </div>
            <div className="rounded-xl border bg-muted/35 p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">Competência</p>
              <p className="mt-1 text-sm font-black">{selectedGoal?.periodLabel}</p>
            </div>
          </div>
          {editGoalType === "vendedor" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Meta financeira mensal" error={editErrors.amountGoal?.message}>
                <Input type="number" min={0} step="0.01" {...editRegister("amountGoal")} />
              </Field>
              <Field label="Meta de vendas" error={editErrors.quantityGoal?.message}>
                <Input type="number" min={0} {...editRegister("quantityGoal")} />
              </Field>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Meta mensal de fichas" error={editErrors.monthlyRecordsGoal?.message}>
                <Input type="number" min={0} {...editRegister("monthlyRecordsGoal")} />
              </Field>
              <Field label="Meta semanal de fichas" error={editErrors.weeklyRecordsGoal?.message}>
                <Input type="number" min={0} {...editRegister("weeklyRecordsGoal")} />
              </Field>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setSelectedGoal(null)}>Cancelar</Button>
            <Button type="submit" disabled={updateGoalMutation.isPending}>
              {updateGoalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Atualizar meta
            </Button>
          </div>
        </form>
      </Modal>
    </Page>
  );
}

export function ReportsPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  if (!data) return null;
  return (
    <Page title="Relatórios avançados" eyebrow="BI operacional">
      <Card>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input type="date" />
          <Input type="date" />
          <Select><option>Todos vendedores</option>{data.users.filter((u) => u.role === "vendedor").map((u) => <option key={u.id}>{u.name}</option>)}</Select>
          <Select><option>Todos professores</option>{data.users.filter((u) => u.role === "professor").map((u) => <option key={u.id}>{u.name}</option>)}</Select>
          <Button><SlidersHorizontal className="h-4 w-4" /> Filtrar</Button>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary"><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
        <Button variant="secondary"><Download className="h-4 w-4" /> CSV</Button>
        <Button variant="secondary"><Download className="h-4 w-4" /> PDF</Button>
      </div>
      <DataTable<Sale> data={data.sales} columns={[
        { header: "Vendedor", cell: (row) => row.sellerName, priority: "primary" },
        { header: "Aluno", cell: (row) => row.studentName, priority: "secondary" },
        { header: "Tipo", cell: (row) => row.saleType },
        { header: "Plano", cell: (row) => row.plan },
        { header: "Valor", cell: (row) => currency.format(row.value) },
        { header: "Data", cell: (row) => formatDate(row.soldAt) },
      ]} />
    </Page>
  );
}

export function HistoryPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  if (!data) return null;
  const records = [...data.sales.map((sale) => ({ type: "Venda", actor: sale.sellerName, description: `${sale.studentName} - ${sale.plan}`, date: sale.soldAt })), ...data.teacherRecords.map((record) => ({ type: "Ficha", actor: record.teacherName, description: `${record.recordsCount} fichas`, date: record.recordDate }))];
  return (
    <Page title="Histórico consolidado" eyebrow="Linha do tempo">
      <DataTable data={records} columns={[
        { header: "Tipo", cell: (row) => row.type, priority: "secondary" },
        { header: "Responsável", cell: (row) => row.actor, priority: "primary" },
        { header: "Observação", cell: (row) => "Sem observação" },
        { header: "Descrição", cell: (row) => row.description },
        { header: "Data", cell: (row) => formatDate(row.date) },
      ]} />
    </Page>
  );
}

export function AuditPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  if (!data) return null;
  return (
    <Page title="Auditoria" eyebrow="Segurança">
      <DataTable<AuditLog> data={data.auditLogs} columns={[
        { header: "Usuário", cell: (row) => row.userName, priority: "primary" },
        { header: "Ação", cell: (row) => row.action, priority: "secondary" },
        { header: "Tabela", cell: (row) => row.tableName },
        { header: "Registro", cell: (row) => row.recordId },
        { header: "Detalhes", cell: (row) => row.details },
        { header: "Data", cell: (row) => formatDate(row.createdAt) },
      ]} />
    </Page>
  );
}

export function SettingsPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { role: "vendedor" },
  });

  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<Partial<UserForm>>({
    resolver: zodResolver(userSchema.partial()),
  });

  const createUserMutation = useMutation({
    mutationFn: createAppUser,
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset({ name: "", email: "", password: "", role: "vendedor" });
      toast({ title: "Usuário criado", description: `${user.name} já pode acessar o sistema.` });
    },
    onError: (error) => {
      toast({ title: "Não foi possível criar", description: error instanceof Error ? error.message : "Verifique os dados e tente novamente." });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: any }) => updateUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setEditingUser(null);
      toast({ title: "Usuário atualizado", description: "As alterações foram salvas com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro na atualização", description: error instanceof Error ? error.message : "Tente novamente." });
    },
  });

  if (!data) return null;

  function onSubmit(values: UserForm) {
    createUserMutation.mutate(values);
  }

  function onEditSubmit(values: Partial<UserForm>) {
    if (!editingUser) return;
    updateUserMutation.mutate({
      userId: editingUser.id,
      payload: { name: values.name, role: values.role },
    });
  }

  function handleEditClick(user: AppUser) {
    setEditingUser(user);
    resetEdit({ name: user.name, role: user.role });
  }

  function toggleStatus(user: AppUser) {
    updateUserMutation.mutate({
      userId: user.id,
      payload: { active: !user.active },
    });
  }

  return (
    <Page title="Configurações" eyebrow="Administração">
      <Card>
        <CardHeader><h2 className="font-bold">Cadastrar usuário</h2></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.9fr_0.8fr_auto]">
            <Field label="Nome" error={errors.name?.message}>
              <Input placeholder="Nome completo" {...register("name")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="email@academia.com" {...register("email")} />
            </Field>
            <Field label="Senha temporária" error={errors.password?.message}>
              <Input type="password" placeholder="Mínimo 6 caracteres" {...register("password")} />
            </Field>
            <Field label="Categoria" error={errors.role?.message}>
              <Select {...register("role")}>
                <option value="gestor">gestor</option>
                <option value="vendedor">vendedor</option>
                <option value="professor">professor</option>
              </Select>
            </Field>
            <div className="flex items-end">
              <Button type="submit" className="w-full" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Criar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <DataTable<AppUser> data={data.users} columns={[
        { header: "Nome", cell: (row) => row.name, priority: "primary" },
        { header: "Email", cell: (row) => row.email, priority: "secondary" },
        { header: "Categoria", cell: (row) => <span className="capitalize">{row.role}</span> },
        { header: "Status", cell: (row) => (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${row.active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {row.active ? "Ativo" : "Inativo"}
          </span>
        ) },
        { 
          header: "Ações", 
          priority: "actions", 
          className: "w-32", 
          cell: (row) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" title="Editar usuário" onClick={() => handleEditClick(row)}><UserCog className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" title="Redefinir senha" onClick={() => toast({ title: "Redefinição enviada", description: `Um link foi enviado para ${row.email}` })}><KeyRound className="h-4 w-4" /></Button>
              <Button 
                variant="ghost" 
                size="icon" 
                title={row.active ? "Desativar" : "Ativar"} 
                onClick={() => toggleStatus(row)}
                className={row.active ? "text-primary" : "text-destructive"}
              >
                <ShieldCheck className="h-4 w-4" />
              </Button>
            </div>
          ) 
        },
      ]} />

      <Modal
        open={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title="Editar Usuário"
        description={editingUser?.email}
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="grid gap-4">
          <Field label="Nome" error={editErrors.name?.message}>
            <Input {...editRegister("name")} />
          </Field>
          <Field label="Categoria" error={editErrors.role?.message}>
            <Select {...editRegister("role")}>
              <option value="gestor">gestor</option>
              <option value="vendedor">vendedor</option>
              <option value="professor">professor</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>Cancelar</Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Modal>
    </Page>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      {children}
      {error ? <span className="text-xs font-semibold text-destructive">{error}</span> : null}
    </label>
  );
}

function Page({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-5">
      <div>
        <p className="kicker">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function GoalRow({ name, period, current, target, progress, onClick }: { name: string; period: string; current: string; target: string; progress: number; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid gap-2 rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-muted/35 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs font-semibold text-muted-foreground">{period}</p>
        </div>
        <p className="text-sm font-bold text-muted-foreground">{current} / {target}</p>
      </div>
      <Progress value={progress} />
    </button>
  );
}

function buildPeriodOptions() {
  const now = new Date();
  return Array.from({ length: 37 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 12 + index, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return {
      value: `${year}-${String(month).padStart(2, "0")}`,
      label: `${monthNames[month - 1]}/${year}`,
    };
  });
}
