import { supabase } from "@/lib/supabase";
import { addMonthsToPeriod, parseMonthYear } from "@/lib/utils";
import type { Sale, TeacherRecord, AppUser, SalesGoal, TeacherGoal, AuditLog, Role } from "@/types";

export async function getDashboardData() {
  if (!supabase) throw new Error("Supabase is not configured");

  // Fetch all necessary data in parallel
  const [
    { data: usersData },
    { data: salesData },
    { data: salesGoalsData },
    { data: teacherRecordsData },
    { data: teacherGoalsData },
    { data: auditLogsData },
  ] = await Promise.all([
    supabase.from("users").select("*"),
    supabase.from("sales").select("*, users(nome)"),
    supabase.from("sales_goals").select("*"),
    supabase.from("teacher_records").select("*, users(nome)"),
    supabase.from("teacher_goals").select("*"),
    supabase.from("audit_logs").select("*, users(nome)"),
  ]);

  const users: AppUser[] = (usersData || []).map(u => ({
    id: u.id,
    name: u.nome,
    email: u.email,
    role: u.role,
    active: u.ativo,
    avatarUrl: u.avatar_url,
    createdAt: u.created_at,
  }));

  const sales: Sale[] = (salesData || []).map(s => ({
    id: s.id,
    sellerId: s.vendedor_id,
    sellerName: s.users?.nome || "Desconhecido",
    studentName: s.aluno_nome,
    saleType: s.tipo_venda,
    plan: s.plano,
    value: Number(s.valor),
    note: s.observacao,
    soldAt: s.data_venda,
    createdAt: s.created_at,
  }));

  const salesGoals: SalesGoal[] = (salesGoalsData || []).map(g => ({
    id: g.id,
    sellerId: g.vendedor_id,
    amountGoal: Number(g.meta_valor),
    quantityGoal: g.meta_quantidade,
    month: g.mes,
    year: g.ano,
  })).sort((a, b) => b.year - a.year || b.month - a.month);

  const teacherRecords: TeacherRecord[] = (teacherRecordsData || []).map(r => ({
    id: r.id,
    teacherId: r.professor_id,
    teacherName: r.users?.nome || "Desconhecido",
    recordsCount: r.quantidade_fichas,
    note: r.observacao,
    recordDate: r.data,
    createdAt: r.created_at,
  }));

  const teacherGoals: TeacherGoal[] = (teacherGoalsData || []).map(g => ({
    id: g.id,
    teacherId: g.professor_id,
    monthlyRecordsGoal: g.meta_fichas,
    weeklyRecordsGoal: g.meta_semanal,
    month: g.mes,
    year: g.ano,
  })).sort((a, b) => b.year - a.year || b.month - a.month);

  const auditLogs: AuditLog[] = (auditLogsData || []).map(l => ({
    id: l.id,
    userName: l.users?.nome || "Sistema",
    action: l.acao,
    tableName: l.tabela,
    recordId: l.registro_id,
    details: JSON.stringify(l.detalhes),
    createdAt: l.created_at,
  }));

  const monthRevenue = sales.reduce((sum, sale) => sum + sale.value, 0);
  const teacherRecordsTotal = teacherRecords.reduce((sum, item) => sum + item.recordsCount, 0);
  const salesGoalTotal = salesGoals.reduce((sum, goal) => sum + goal.amountGoal, 0) || 1; // avoid division by zero
  const teacherGoalTotal = teacherGoals.reduce((sum, goal) => sum + goal.monthlyRecordsGoal, 0) || 1;
  const goalCompletion = ((monthRevenue / salesGoalTotal) * 65 + (teacherRecordsTotal / teacherGoalTotal) * 35);

  // Simple revenue series for the chart (grouped by date of the last 7 days)
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const revenueSeries = days.map((label, index) => {
    const daySales = sales.filter(s => new Date(s.soldAt).getDay() === index);
    return {
      label,
      receita: daySales.reduce((sum, s) => sum + s.value, 0),
      vendas: daySales.length,
    };
  });

  return {
    users,
    sales,
    salesGoals,
    teacherRecords,
    teacherGoals,
    auditLogs,
    revenueSeries,
    metrics: {
      monthRevenue,
      newStudents: sales.filter((sale) => sale.saleType === "Aluno novo").length,
      upgrades: sales.filter((sale) => sale.saleType === "Upgrade").length,
      reactivations: sales.filter((sale) => sale.saleType === "Reativação").length,
      renewals: sales.filter((sale) => sale.saleType === "Renovação").length,
      teacherRecords: teacherRecordsTotal,
      goalCompletion,
    },
  };
}

export async function createSale(payload: Omit<Sale, "id" | "createdAt" | "sellerName">) {
  if (!supabase) throw new Error("O Supabase não está configurado");

  const { data, error } = await supabase
    .from("sales")
    .insert({
      vendedor_id: payload.sellerId,
      aluno_nome: payload.studentName,
      tipo_venda: payload.saleType,
      plano: payload.plan,
      valor: payload.value,
      observacao: payload.note,
      data_venda: payload.soldAt,
    })
    .select("*, users(nome)")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    sellerId: data.vendedor_id,
    sellerName: data.users?.nome || "Vendedor",
    studentName: data.aluno_nome,
    saleType: data.tipo_venda,
    plan: data.plano,
    value: Number(data.valor),
    note: data.observacao,
    soldAt: data.data_venda,
    createdAt: data.created_at,
  } as Sale;
}

export async function createTeacherRecord(payload: Omit<TeacherRecord, "id" | "createdAt" | "teacherName">) {
  if (!supabase) throw new Error("O Supabase não está configurado");

  const { data, error } = await supabase
    .from("teacher_records")
    .insert({
      professor_id: payload.teacherId,
      quantidade_fichas: payload.recordsCount,
      observacao: payload.note,
      data: payload.recordDate,
    })
    .select("*, users(nome)")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    teacherId: data.professor_id,
    teacherName: data.users?.nome || "Professor",
    recordsCount: data.quantidade_fichas,
    note: data.observacao,
    recordDate: data.data,
    createdAt: data.created_at,
  } as TeacherRecord;
}

export async function createAppUser(payload: { name: string; email: string; password: string; role: Role }) {
  if (!supabase) throw new Error("O Supabase não está configurado");

  const { data: currentSessionData } = await supabase.auth.getSession();
  const currentSession = currentSessionData.session;
  if (!currentSession) {
    throw new Error("Sua sessão expirou. Entre novamente antes de criar usuários.");
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        role: payload.role,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Não foi possível criar o usuário no Supabase Auth.");

  await supabase.auth.setSession({
    access_token: currentSession.access_token,
    refresh_token: currentSession.refresh_token,
  });

  const { data, error } = await supabase
    .from("users")
    .upsert({
      id: authData.user.id,
      nome: payload.name,
      email: payload.email,
      role: payload.role,
      ativo: true,
    }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.nome,
    email: data.email,
    role: data.role,
    active: data.ativo,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  } as AppUser;
}

export async function saveGoalPlan(payload: {
  goalType: "vendedor" | "professor";
  userId: string;
  period: string;
  replicateMonths: number;
  amountGoal?: number;
  quantityGoal?: number;
  monthlyRecordsGoal?: number;
  weeklyRecordsGoal?: number;
}) {
  if (!supabase) throw new Error("Supabase is not configured");

  const { month, year } = parseMonthYear(payload.period);
  const periods = Array.from({ length: payload.replicateMonths }, (_, index) => addMonthsToPeriod(month, year, index));

  if (payload.goalType === "vendedor") {
    const rows = periods.map((period) => ({
      vendedor_id: payload.userId,
      meta_valor: payload.amountGoal ?? 0,
      meta_quantidade: payload.quantityGoal ?? 0,
      mes: period.month,
      ano: period.year,
    }));

    const { error } = await supabase
      .from("sales_goals")
      .upsert(rows, { onConflict: "vendedor_id,mes,ano" });

    if (error) throw error;
    return { count: rows.length, type: "vendedor" as const };
  }

  const rows = periods.map((period) => ({
    professor_id: payload.userId,
    meta_fichas: payload.monthlyRecordsGoal ?? 0,
    meta_semanal: payload.weeklyRecordsGoal ?? 0,
    mes: period.month,
    ano: period.year,
  }));

  const { error } = await supabase
    .from("teacher_goals")
    .upsert(rows, { onConflict: "professor_id,mes,ano" });

  if (error) throw error;
  return { count: rows.length, type: "professor" as const };
}

export async function updateUser(userId: string, payload: Partial<Omit<AppUser, "id" | "createdAt" | "email">>) {
  if (!supabase) throw new Error("Supabase is not configured");

  const updateData: any = {};
  if (payload.name !== undefined) updateData.nome = payload.name;
  if (payload.role !== undefined) updateData.role = payload.role;
  if (payload.active !== undefined) updateData.ativo = payload.active;
  if (payload.avatarUrl !== undefined) updateData.avatar_url = payload.avatarUrl;

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) throw error;

  return {
    id: data.id,
    name: data.nome,
    email: data.email,
    role: data.role,
    active: data.ativo,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  } as AppUser;
}

export async function adminResetUserPassword(userId: string, newPassword: string) {
  if (!supabase) throw new Error("Supabase is not configured");

  const { error } = await supabase.rpc("admin_reset_user_password", {
    target_user_id: userId,
    new_password: newPassword,
  });

  if (error) throw error;
}
