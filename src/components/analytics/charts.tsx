import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { currency } from "@/lib/utils";

const colors = ["#2563eb", "#10b981", "#f59e0b", "#7c3aed", "#ef4444"];

export function RevenueChart({ data }: { data: { label: string; receita: number; vendas: number }[] }) {
  return (
    <Card className="min-h-[342px] overflow-hidden">
      <CardHeader>
        <h3 className="text-sm font-black tracking-tight">Receita e vendas</h3>
      </CardHeader>
      <CardContent className="h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.28)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={(value, name) => name === "receita" ? currency.format(Number(value)) : value} />
            <Line type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DistributionChart({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card className="min-h-[320px] overflow-hidden">
      <CardHeader>
        <h3 className="text-sm font-black tracking-tight">{title}</h3>
      </CardHeader>
      <CardContent className="h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={82}
              paddingAngle={3}
              labelLine={false}
              label={renderPieLabel}
            >
              {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PlanChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card className="min-h-[320px] overflow-hidden">
      <CardHeader>
        <h3 className="text-sm font-black tracking-tight">Receita por plano</h3>
      </CardHeader>
      <CardContent className="h-[270px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.28)" />
            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <YAxis type="category" dataKey="name" width={128} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => currency.format(Number(value))} />
            <Bar dataKey="value" radius={[0, 7, 7, 0]} fill="#2563eb" barSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function renderPieLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  name,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
}) {
  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[11px] font-semibold text-muted-foreground"
    >
      {name}
    </text>
  );
}
