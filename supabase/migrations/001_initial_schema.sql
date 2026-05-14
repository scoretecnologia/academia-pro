create extension if not exists pgcrypto;

create type public.user_role as enum ('gestor', 'vendedor', 'professor');
create type public.sale_type as enum ('Aluno novo', 'Upgrade', 'Reativacao', 'Renovacao');
create type public.plan_type as enum ('Mensal', 'Trimestral', 'Quadrimestral com recorrencia', 'Semestral', 'Anual com recorrencia');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  role public.user_role not null default 'vendedor',
  ativo boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.sales_goals (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references public.users(id) on delete cascade,
  meta_valor numeric(12,2) not null check (meta_valor >= 0),
  meta_quantidade integer not null default 0 check (meta_quantidade >= 0),
  meta_novos_alunos integer not null default 0 check (meta_novos_alunos >= 0),
  meta_por_plano jsonb not null default '{}'::jsonb,
  mes integer not null check (mes between 1 and 12),
  ano integer not null check (ano between 2020 and 2100),
  created_at timestamptz not null default now(),
  unique (vendedor_id, mes, ano)
);

create table public.sales (
  id uuid primary key default gen_random_uuid(),
  vendedor_id uuid not null references public.users(id) on delete restrict,
  aluno_nome text not null,
  tipo_venda public.sale_type not null,
  plano public.plan_type not null,
  valor numeric(12,2) not null check (valor > 0),
  observacao text,
  data_venda date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.teacher_goals (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.users(id) on delete cascade,
  meta_fichas integer not null check (meta_fichas >= 0),
  meta_semanal integer not null default 0 check (meta_semanal >= 0),
  mes integer not null check (mes between 1 and 12),
  ano integer not null check (ano between 2020 and 2100),
  created_at timestamptz not null default now(),
  unique (professor_id, mes, ano)
);

create table public.teacher_records (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references public.users(id) on delete restrict,
  quantidade_fichas integer not null check (quantidade_fichas > 0),
  observacao text,
  data date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.users(id) on delete set null,
  acao text not null,
  tabela text not null,
  registro_id uuid,
  detalhes jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index sales_vendedor_date_idx on public.sales (vendedor_id, data_venda desc);
create index sales_type_plan_idx on public.sales (tipo_venda, plano);
create index teacher_records_professor_date_idx on public.teacher_records (professor_id, data desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'gestor', false)
$$;

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_record uuid;
begin
  changed_record := coalesce(new.id, old.id);
  insert into public.audit_logs (usuario_id, acao, tabela, registro_id, detalhes)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    changed_record,
    jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
  );
  return coalesce(new, old);
end;
$$;

create trigger sales_audit after insert or update or delete on public.sales
for each row execute function public.write_audit_log();

create trigger teacher_records_audit after insert or update or delete on public.teacher_records
for each row execute function public.write_audit_log();

create trigger sales_goals_audit after insert or update or delete on public.sales_goals
for each row execute function public.write_audit_log();

create trigger teacher_goals_audit after insert or update or delete on public.teacher_goals
for each row execute function public.write_audit_log();

alter table public.users enable row level security;
alter table public.sales_goals enable row level security;
alter table public.sales enable row level security;
alter table public.teacher_goals enable row level security;
alter table public.teacher_records enable row level security;
alter table public.audit_logs enable row level security;

create policy "users can read own profile and managers read all" on public.users
for select using (id = auth.uid() or public.is_manager());

create policy "managers maintain users" on public.users
for all using (public.is_manager()) with check (public.is_manager());

create policy "sales visible by owner or manager" on public.sales
for select using (vendedor_id = auth.uid() or public.is_manager());

create policy "sellers insert own sales" on public.sales
for insert with check (vendedor_id = auth.uid() or public.is_manager());

create policy "sellers update own sales and managers update all" on public.sales
for update using (vendedor_id = auth.uid() or public.is_manager()) with check (vendedor_id = auth.uid() or public.is_manager());

create policy "managers delete sales" on public.sales
for delete using (public.is_manager());

create policy "sales goals visible by owner or manager" on public.sales_goals
for select using (vendedor_id = auth.uid() or public.is_manager());

create policy "managers maintain sales goals" on public.sales_goals
for all using (public.is_manager()) with check (public.is_manager());

create policy "teacher records visible by owner or manager" on public.teacher_records
for select using (professor_id = auth.uid() or public.is_manager());

create policy "teachers insert own records" on public.teacher_records
for insert with check (professor_id = auth.uid() or public.is_manager());

create policy "teachers update own records and managers update all" on public.teacher_records
for update using (professor_id = auth.uid() or public.is_manager()) with check (professor_id = auth.uid() or public.is_manager());

create policy "managers delete teacher records" on public.teacher_records
for delete using (public.is_manager());

create policy "teacher goals visible by owner or manager" on public.teacher_goals
for select using (professor_id = auth.uid() or public.is_manager());

create policy "managers maintain teacher goals" on public.teacher_goals
for all using (public.is_manager()) with check (public.is_manager());

create policy "managers read audit logs" on public.audit_logs
for select using (public.is_manager());

create or replace view public.dashboard_monthly_summary as
select
  date_trunc('month', s.data_venda)::date as mes,
  sum(s.valor) as receita,
  count(*) filter (where s.tipo_venda = 'Aluno novo') as novos_alunos,
  count(*) filter (where s.tipo_venda = 'Upgrade') as upgrades,
  count(*) filter (where s.tipo_venda = 'Reativacao') as reativacoes,
  count(*) filter (where s.tipo_venda = 'Renovacao') as renovacoes
from public.sales s
group by 1;
