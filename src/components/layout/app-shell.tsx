import { useMemo, useState, type ReactNode } from "react";
import { BarChart3, ChevronLeft, ChevronRight, ClipboardList, Dumbbell, FileBarChart, History, LogOut, Menu, Settings, ShieldCheck, Sparkles, Target, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

type PageKey = "dashboard" | "vendedores" | "professores" | "metas" | "relatorios" | "historico" | "auditoria" | "configuracoes";

const navItems: { key: PageKey; label: string; icon: React.ElementType; roles: Role[] }[] = [
  { key: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["gestor", "vendedor", "professor"] },
  { key: "vendedores", label: "Vendedores", icon: Trophy, roles: ["gestor", "vendedor"] },
  { key: "professores", label: "Professores", icon: Dumbbell, roles: ["gestor", "professor"] },
  { key: "metas", label: "Metas", icon: Target, roles: ["gestor"] },
  { key: "relatorios", label: "Relatórios", icon: FileBarChart, roles: ["gestor"] },
  { key: "historico", label: "Histórico", icon: History, roles: ["gestor", "vendedor", "professor"] },
  { key: "auditoria", label: "Auditoria", icon: ShieldCheck, roles: ["gestor"] },
  { key: "configuracoes", label: "Configurações", icon: Settings, roles: ["gestor"] },
];

export function AppShell({
  activePage,
  onPageChange,
  children,
}: {
  activePage: PageKey;
  onPageChange: (page: PageKey) => void;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = useMemo(() => navItems.filter((item) => user && item.roles.includes(user.role)), [user]);

  const sidebar = (
    <aside className={cn(
      "flex h-dvh flex-col overflow-hidden border-r border-border/70 bg-card/94 shadow-[18px_0_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 ease-in-out",
      collapsed ? "w-[76px]" : "w-[280px]"
    )}>
      <div className={cn("relative flex h-[76px] shrink-0 items-center border-b border-border/70 px-4", collapsed ? "justify-center" : "gap-3")}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-background shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
          <ClipboardList className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-black tracking-tight">Academia Pro</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Revenue & Coaching OS</p>
          </div>
        )}
      </div>
      <div className="shrink-0 px-3 pt-3">
        <div className={cn("rounded-xl border border-border/70 bg-muted/35", collapsed ? "p-2" : "p-3")}>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/12 text-accent">
              <Sparkles className="h-4 w-4" />
            </span>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-black">Operação em tempo real</p>
                <p className="text-[11px] font-semibold text-muted-foreground">Metas, ranking e auditoria</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="grid min-h-0 flex-1 content-start gap-1.5 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => {
                onPageChange(item.key);
                setMenuOpen(false);
              }}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex h-10 items-center rounded-lg text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground",
                collapsed ? "justify-center px-0" : "gap-3 px-3",
                activePage === item.key && "bg-foreground text-background shadow-[0_10px_24px_rgba(15,23,42,0.12)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="min-w-0 flex-1 text-left">{item.label}</span>}
              {!collapsed && (
                <ChevronRight className={cn("h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-60", activePage === item.key && "opacity-70")} />
              )}
            </button>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-border/70 bg-card/90 p-3">
        <div className={cn("rounded-xl border border-border/70 bg-muted/35", collapsed ? "p-1" : "p-3")}>
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-xs font-black text-background">
              {user?.name?.slice(0, 2) ?? "AP"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{user?.name}</p>
                <p className="text-xs capitalize text-muted-foreground">{user?.role} ativo</p>
              </div>
            )}
          </div>
        </div>
        <Button variant="secondary" className={cn("mt-3 w-full", collapsed ? "px-0 justify-center" : "justify-between")} onClick={logout} title={collapsed ? "Encerrar sessão" : undefined}>
          {!collapsed && "Encerrar sessão"}
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.10),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(20,184,166,0.09),transparent_25%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))] text-foreground">
      <div className="flex min-h-screen">
        <div className={cn("hidden lg:sticky lg:top-0 lg:block lg:h-dvh transition-all duration-300", collapsed ? "w-[76px]" : "w-[280px]")}>
          {sidebar}
        </div>
        {menuOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/45" onClick={() => setMenuOpen(false)} />
            <div className="relative h-full">{sidebar}</div>
          </div>
        ) : null}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[72px] items-center gap-3 border-b border-border/70 bg-background/82 px-4 backdrop-blur-2xl sm:px-6">
            <Button variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setCollapsed(!collapsed)}>
              <ChevronLeft className={cn("h-5 w-5 transition-transform duration-300", collapsed && "rotate-180")} />
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
          </header>
          <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}

export type { PageKey };
