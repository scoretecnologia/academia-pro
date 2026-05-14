import { useState } from "react";
import { AppShell, type PageKey } from "@/components/layout/app-shell";
import { useAuth } from "@/contexts/auth-context";
import { AuditPage, GoalsPage, HistoryPage, ReportsPage, SettingsPage } from "@/pages/admin-pages";
import { DashboardPage } from "@/pages/dashboard";
import { LoginPage } from "@/pages/login";
import { SellersPage } from "@/pages/sellers";
import { TeachersPage } from "@/pages/teachers";

export function App() {
  const { isAuthenticated, user } = useAuth();
  const [activePage, setActivePage] = useState<PageKey>("dashboard");

  if (!isAuthenticated) return <LoginPage />;

  const allowedPage = (() => {
    if (activePage === "vendedores" && user?.role === "professor") return "dashboard";
    if (activePage === "professores" && user?.role === "vendedor") return "dashboard";
    if (["metas", "relatorios", "auditoria", "configuracoes"].includes(activePage) && user?.role !== "gestor") return "dashboard";
    return activePage;
  })();

  return (
    <AppShell activePage={allowedPage} onPageChange={setActivePage}>
      {allowedPage === "dashboard" ? <DashboardPage /> : null}
      {allowedPage === "vendedores" ? <SellersPage /> : null}
      {allowedPage === "professores" ? <TeachersPage /> : null}
      {allowedPage === "metas" ? <GoalsPage /> : null}
      {allowedPage === "relatorios" ? <ReportsPage /> : null}
      {allowedPage === "historico" ? <HistoryPage /> : null}
      {allowedPage === "auditoria" ? <AuditPage /> : null}
      {allowedPage === "configuracoes" ? <SettingsPage /> : null}
    </AppShell>
  );
}
