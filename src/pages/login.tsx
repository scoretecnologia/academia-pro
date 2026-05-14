import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Dumbbell, Loader2, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { loginSchema, type LoginForm } from "@/validations/forms";

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "gestor@academiapro.com", password: "123456" },
  });

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    try {
      await login(values.email, values.password);
      toast({ title: "Sessão iniciada", description: "Bem-vindo ao painel executivo." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_10%,rgba(37,99,235,0.18),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.16),transparent_26%),linear-gradient(135deg,#f8fafc,#eef2f7)] p-4">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block">
          <div className="max-w-2xl">
            <p className="kicker">Academia Pro</p>
            <h1 className="mt-4 text-5xl font-black tracking-tight text-foreground">Gestão de metas com clareza de board executivo.</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Receita, professores, ranking e auditoria em uma operação visualmente limpa, rápida e pronta para escala.
            </p>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                { icon: TrendingUp, label: "Vendas" },
                { icon: ShieldCheck, label: "RLS ativo" },
                { icon: Sparkles, label: "Insights" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="surface rounded-xl p-4">
                    <Icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-black">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.section>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full justify-self-center lg:max-w-md">
        <Card className="p-6 sm:p-7">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-foreground text-background shadow-[0_16px_35px_rgba(15,23,42,0.18)]">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black">Academia Pro</h1>
              <p className="text-sm text-muted-foreground">Revenue & Coaching OS</p>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Email
              <Input type="email" {...register("email")} />
              {errors.email ? <span className="text-xs text-destructive">{errors.email.message}</span> : null}
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Senha
              <Input type="password" {...register("password")} />
              {errors.password ? <span className="text-xs text-destructive">{errors.password.message}</span> : null}
            </label>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sessão persistente ativa</span>
            </div>
            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Entrar no painel
              {!loading ? <ArrowRight className="h-4 w-4" /> : null}
            </Button>
          </form>
        </Card>
      </motion.div>
      </div>
    </main>
  );
}
