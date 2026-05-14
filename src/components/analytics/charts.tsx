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
      <CardContent className="h-[245px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3}>
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
      <CardContent className="h-[245px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.28)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={(value) => currency.format(Number(value))} />
            <Bar dataKey="value" radius={[7, 7, 0, 0]} fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
