import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Informe um email valido"),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export const saleSchema = z.object({
  sellerId: z.string().min(1, "Selecione um vendedor"),
  studentName: z.string().min(3, "Informe o nome do aluno"),
  saleType: z.enum(["Aluno novo", "Upgrade", "Reativação", "Renovação"]),
  plan: z.enum(["Mensal", "Trimestral", "Quadrimestral com recorrência", "Semestral", "Anual com recorrência"]),
  value: z.coerce.number().positive("Informe um valor positivo"),
  note: z.string().optional(),
  soldAt: z.string().min(1, "Informe a data"),
});

export const teacherRecordSchema = z.object({
  teacherId: z.string().min(1, "Selecione um professor"),
  recordsCount: z.coerce.number().int().positive("Informe a quantidade"),
  note: z.string().optional(),
  recordDate: z.string().min(1, "Informe a data"),
});

export const userSchema = z.object({
  name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("Informe um email valido"),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
  role: z.enum(["gestor", "vendedor", "professor"]),
});

export const goalSchema = z.object({
  goalType: z.enum(["vendedor", "professor"]),
  userId: z.string().min(1, "Selecione um responsavel"),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Selecione mes e ano"),
  replicateMonths: z.coerce.number().int().min(1, "Informe ao menos 1 mes").max(36, "Limite de 36 meses"),
  amountGoal: z.coerce.number().min(0, "Informe um valor valido").optional(),
  quantityGoal: z.coerce.number().int().min(0, "Informe uma quantidade valida").optional(),
  monthlyRecordsGoal: z.coerce.number().int().min(0, "Informe uma meta mensal valida").optional(),
  weeklyRecordsGoal: z.coerce.number().int().min(0, "Informe uma meta semanal valida").optional(),
}).superRefine((value, ctx) => {
  if (value.goalType === "vendedor" && (!value.amountGoal || value.amountGoal <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["amountGoal"], message: "Informe a meta financeira" });
  }
  if (value.goalType === "professor" && (!value.monthlyRecordsGoal || value.monthlyRecordsGoal <= 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["monthlyRecordsGoal"], message: "Informe a meta mensal de fichas" });
  }
});

export type LoginForm = z.infer<typeof loginSchema>;
export type SaleForm = z.infer<typeof saleSchema>;
export type TeacherRecordForm = z.infer<typeof teacherRecordSchema>;
export type UserForm = z.infer<typeof userSchema>;
export type GoalForm = z.infer<typeof goalSchema>;
