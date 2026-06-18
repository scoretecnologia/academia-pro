export type Role = "gestor" | "vendedor" | "professor";

export type SaleType = "Aluno novo" | "Upgrade" | "Reativação" | "Renovação";
export type PlanType =
  | "Mensal"
  | "Trimestral"
  | "Quadrimestral com recorrência"
  | "Semestral"
  | "Anual com recorrência";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  avatarUrl?: string;
  createdAt: string;
};

export type Sale = {
  id: string;
  sellerId: string;
  sellerName: string;
  studentName: string;
  saleType: SaleType;
  plan: PlanType;
  value: number;
  note?: string;
  soldAt: string;
  createdAt: string;
};

export type SalesGoal = {
  id: string;
  sellerId: string;
  amountGoal: number;
  quantityGoal: number;
  month: number;
  year: number;
};

export type TeacherGoal = {
  id: string;
  teacherId: string;
  monthlyRecordsGoal: number;
  weeklyRecordsGoal: number;
  month: number;
  year: number;
};

export type TeacherRecord = {
  id: string;
  teacherId: string;
  teacherName: string;
  recordsCount: number;
  note?: string;
  recordDate: string;
  createdAt: string;
};

export type DashboardMetrics = {
  monthRevenue: number;
  revenueGoal: number;
  revenueGoalCompletion: number;
  newStudents: number;
  upgrades: number;
  reactivations: number;
  renewals: number;
  teacherRecords: number;
};
