import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  priority?: "primary" | "secondary" | "meta" | "actions";
};

export function DataTable<T>({ data, columns, empty = "Nenhum registro encontrado" }: { data: T[]; columns: Column<T>[]; empty?: string }) {
  const primary = columns.find((column) => column.priority === "primary") ?? columns[0];
  const secondary = columns.find((column) => column.priority === "secondary") ?? columns[1];
  const actions = columns.find((column) => column.priority === "actions");
  const metaColumns = columns.filter((column) => column !== primary && column !== secondary && column !== actions);

  return (
    <Card className="overflow-hidden">
      <div className="hidden md:block">
        <table className="w-full table-fixed text-sm">
          <thead className="border-b bg-muted/45 text-left text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <tr>{columns.map((column) => <th key={column.header} className={cn("px-4 py-3 font-black", column.className)}>{column.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {data.length ? data.map((row, index) => (
              <tr key={index} className="transition hover:bg-muted/35">
                {columns.map((column) => <td key={column.header} className={cn("truncate px-4 py-3.5 align-middle", column.className)}>{column.cell(row)}</td>)}
              </tr>
            )) : (
              <tr><td colSpan={columns.length} className="px-5 py-10 text-center text-muted-foreground">{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="grid divide-y md:hidden">
        {data.length ? data.map((row, index) => (
          <div key={index} className="grid gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{primary.cell(row)}</p>
                {secondary ? <p className="mt-1 truncate text-xs text-muted-foreground">{secondary.cell(row)}</p> : null}
              </div>
              {actions ? <div className="shrink-0">{actions.cell(row)}</div> : null}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {metaColumns.map((column) => (
                <div key={column.header} className="rounded-lg bg-muted/45 px-3 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{column.header}</p>
                  <div className="mt-1 truncate text-xs font-bold">{column.cell(row)}</div>
                </div>
              ))}
            </div>
          </div>
        )) : <div className="px-5 py-10 text-center text-sm text-muted-foreground">{empty}</div>}
      </div>
    </Card>
  );
}
