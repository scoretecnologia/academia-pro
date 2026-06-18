import type { AppUser, Sale, SalesGoal, TeacherGoal, TeacherRecord } from "@/types";

export const users: AppUser[] = [
  { id: "u1", name: "Marina Costa", email: "gestor@academiapro.com", role: "gestor", active: true, createdAt: "2026-05-01" },
  { id: "u2", name: "Lucas Almeida", email: "lucas@academiapro.com", role: "vendedor", active: true, createdAt: "2026-05-02" },
  { id: "u3", name: "Bianca Reis", email: "bianca@academiapro.com", role: "vendedor", active: true, createdAt: "2026-05-02" },
  { id: "u4", name: "Rafael Nunes", email: "rafael@academiapro.com", role: "professor", active: true, createdAt: "2026-05-03" },
  { id: "u5", name: "Camila Rocha", email: "camila@academiapro.com", role: "professor", active: true, createdAt: "2026-05-03" },
];

export const sales: Sale[] = [
  { id: "s1", sellerId: "u2", sellerName: "Lucas Almeida", studentName: "Ana Martins", saleType: "Aluno novo", plan: "Anual com recorrência", value: 2388, soldAt: "2026-05-02", createdAt: "2026-05-02" },
  { id: "s2", sellerId: "u3", sellerName: "Bianca Reis", studentName: "Pedro Lima", saleType: "Upgrade", plan: "Semestral", value: 1090, soldAt: "2026-05-04", createdAt: "2026-05-04" },
  { id: "s3", sellerId: "u2", sellerName: "Lucas Almeida", studentName: "Joao Freitas", saleType: "Renovação", plan: "Trimestral", value: 597, soldAt: "2026-05-06", createdAt: "2026-05-06" },
  { id: "s4", sellerId: "u3", sellerName: "Bianca Reis", studentName: "Livia Souza", saleType: "Aluno novo", plan: "Quadrimestral com recorrência", value: 796, soldAt: "2026-05-07", createdAt: "2026-05-07" },
  { id: "s5", sellerId: "u2", sellerName: "Lucas Almeida", studentName: "Bruno Castro", saleType: "Reativação", plan: "Mensal", value: 229, soldAt: "2026-05-09", createdAt: "2026-05-09" },
  { id: "s6", sellerId: "u3", sellerName: "Bianca Reis", studentName: "Carolina Dias", saleType: "Aluno novo", plan: "Anual com recorrência", value: 2388, soldAt: "2026-05-11", createdAt: "2026-05-11" },
];

export const salesGoals: SalesGoal[] = [
  { id: "g1", sellerId: "u2", amountGoal: 18000, quantityGoal: 28, month: 5, year: 2026 },
  { id: "g2", sellerId: "u3", amountGoal: 16000, quantityGoal: 24, month: 5, year: 2026 },
];

export const teacherRecords: TeacherRecord[] = [
  { id: "r1", teacherId: "u4", teacherName: "Rafael Nunes", recordsCount: 14, recordDate: "2026-05-03", createdAt: "2026-05-03" },
  { id: "r2", teacherId: "u5", teacherName: "Camila Rocha", recordsCount: 11, recordDate: "2026-05-05", createdAt: "2026-05-05" },
  { id: "r3", teacherId: "u4", teacherName: "Rafael Nunes", recordsCount: 16, recordDate: "2026-05-09", createdAt: "2026-05-09" },
  { id: "r4", teacherId: "u5", teacherName: "Camila Rocha", recordsCount: 18, recordDate: "2026-05-12", createdAt: "2026-05-12" },
];

export const teacherGoals: TeacherGoal[] = [
  { id: "tg1", teacherId: "u4", monthlyRecordsGoal: 120, weeklyRecordsGoal: 30, month: 5, year: 2026 },
  { id: "tg2", teacherId: "u5", monthlyRecordsGoal: 110, weeklyRecordsGoal: 28, month: 5, year: 2026 },
];

export const revenueSeries = [
  { label: "Seg", receita: 2388, vendas: 3 },
  { label: "Ter", receita: 1687, vendas: 4 },
  { label: "Qua", receita: 3250, vendas: 6 },
  { label: "Qui", receita: 1890, vendas: 3 },
  { label: "Sex", receita: 4215, vendas: 8 },
  { label: "Sab", receita: 2780, vendas: 5 },
];
