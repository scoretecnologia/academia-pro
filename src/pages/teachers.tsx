import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Edit, Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { createTeacherRecord, getDashboardData } from "@/services/dashboard-service";
import { teacherRecordSchema, type TeacherRecordForm } from "@/validations/forms";
import { formatDate, percentage } from "@/lib/utils";
import { useToast } from "@/contexts/toast-context";
import type { TeacherRecord } from "@/types";

export function TeachersPage() {
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData });
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TeacherRecordForm>({ resolver: zodResolver(teacherRecordSchema) });
  if (!data) return null;

  const teachers = data.users.filter((user) => user.role === "professor" && user.active !== false);
  const rows = teachers.map((teacher) => {
    const total = data.teacherRecords.filter((record) => record.teacherId === teacher.id).reduce((sum, item) => sum + item.recordsCount, 0);
    const goal = data.teacherGoals.find((item) => item.teacherId === teacher.id);
    return { teacher, total, goal: goal?.monthlyRecordsGoal ?? 0, weeklyGoal: goal?.weeklyRecordsGoal ?? 0 };
  }).sort((a, b) => b.total - a.total);

  async function onSubmit(values: TeacherRecordForm) {
    await createTeacherRecord(values);
    await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setOpen(false);
    reset();
    toast({ title: "Fichas registradas", description: "O progresso dos professores foi atualizado." });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="kicker">Professores</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Producao tecnica e fichas</h1>
        </div>
        <div className="flex gap-2"><Button variant="secondary"><Download className="h-4 w-4" /> Exportar</Button><Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nova ficha</Button></div>
      </div>
      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {rows.map((row, index) => {
          const progress = row.goal ? (row.total / row.goal) * 100 : 0;
          return (
            <Card key={row.teacher.id} className="overflow-hidden">
              <CardContent>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-sm font-black text-background dark:bg-primary">{row.teacher.name.slice(0, 2)}</div>
                    <div><p className="font-black">{row.teacher.name}</p><p className="text-sm text-muted-foreground">#{index + 1} no ranking tecnico</p></div>
                  </div>
                  <p className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{percentage(progress)}</p>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-muted/45 p-2"><p className="text-muted-foreground">Mensal</p><p className="font-black">{row.goal}</p></div>
                  <div className="rounded-lg bg-muted/45 p-2"><p className="text-muted-foreground">Semanal</p><p className="font-black">{row.weeklyGoal}</p></div>
                  <div className="rounded-lg bg-muted/45 p-2"><p className="text-muted-foreground">Feitas</p><p className="font-black">{row.total}</p></div>
                </div>
                <Progress value={progress} className="mt-5" />
              </CardContent>
            </Card>
          );
        })}
      </div>
      <DataTable<TeacherRecord> data={data.teacherRecords.filter(r => data.users.find(u => u.id === r.teacherId)?.active !== false)} columns={[
        { header: "Professor", cell: (row) => row.teacherName, priority: "primary" },
        { header: "Quantidade", cell: (row) => row.recordsCount, priority: "secondary" },
        { header: "Observação", cell: (row) => row.note ?? "Sem observação" },
        { header: "Data", cell: (row) => formatDate(row.recordDate) },
        { header: "Ações", priority: "actions", className: "w-24", cell: () => <div className="flex gap-1"><Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button></div> },
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title="Nova ficha" description="Registre a produção individual do professor.">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <Field label="Professor" error={errors.teacherId?.message}><Select {...register("teacherId")}><option value="">Selecione</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</Select></Field>
          <Field label="Quantidade" error={errors.recordsCount?.message}><Input type="number" {...register("recordsCount")} /></Field>
          <Field label="Data" error={errors.recordDate?.message}><Input type="date" {...register("recordDate")} /></Field>
          <label className="grid gap-2 text-sm font-semibold sm:col-span-2">Observação<Textarea {...register("note")} /></label>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit">Salvar ficha</Button></div>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-semibold">{label}{children}{error ? <span className="text-xs text-destructive">{error}</span> : null}</label>;
}
