alter table public.sales_goals
add column if not exists competencia date
generated always as (make_date(ano, mes, 1)) stored;

alter table public.teacher_goals
add column if not exists competencia date
generated always as (make_date(ano, mes, 1)) stored;

create index if not exists sales_goals_competencia_idx
on public.sales_goals (competencia desc, vendedor_id);

create index if not exists teacher_goals_competencia_idx
on public.teacher_goals (competencia desc, professor_id);

create or replace function public.month_name_pt(month_number integer)
returns text
language sql
immutable
as $$
  select case month_number
    when 1 then 'janeiro'
    when 2 then 'fevereiro'
    when 3 then 'marco'
    when 4 then 'abril'
    when 5 then 'maio'
    when 6 then 'junho'
    when 7 then 'julho'
    when 8 then 'agosto'
    when 9 then 'setembro'
    when 10 then 'outubro'
    when 11 then 'novembro'
    when 12 then 'dezembro'
  end
$$;

create or replace view public.sales_goal_period_summary
with (security_invoker = true)
as
select
  sg.id,
  sg.vendedor_id,
  u.nome as vendedor_nome,
  sg.mes,
  sg.ano,
  sg.competencia,
  public.month_name_pt(sg.mes) || '/' || sg.ano::text as competencia_label,
  sg.meta_valor,
  sg.meta_quantidade,
  coalesce(sum(s.valor), 0)::numeric(12,2) as valor_realizado,
  count(s.id)::integer as vendas_realizadas,
  case
    when sg.meta_valor > 0 then round((coalesce(sum(s.valor), 0) / sg.meta_valor) * 100, 2)
    else 0
  end as percentual_valor,
  case
    when sg.meta_quantidade > 0 then round((count(s.id)::numeric / sg.meta_quantidade) * 100, 2)
    else 0
  end as percentual_quantidade
from public.sales_goals sg
join public.users u on u.id = sg.vendedor_id
left join public.sales s
  on s.vendedor_id = sg.vendedor_id
  and extract(month from s.data_venda)::integer = sg.mes
  and extract(year from s.data_venda)::integer = sg.ano
group by sg.id, u.nome;

create or replace view public.teacher_goal_period_summary
with (security_invoker = true)
as
select
  tg.id,
  tg.professor_id,
  u.nome as professor_nome,
  tg.mes,
  tg.ano,
  tg.competencia,
  public.month_name_pt(tg.mes) || '/' || tg.ano::text as competencia_label,
  tg.meta_fichas,
  tg.meta_semanal,
  coalesce(sum(tr.quantidade_fichas), 0)::integer as fichas_realizadas,
  case
    when tg.meta_fichas > 0 then round((coalesce(sum(tr.quantidade_fichas), 0)::numeric / tg.meta_fichas) * 100, 2)
    else 0
  end as percentual_fichas
from public.teacher_goals tg
join public.users u on u.id = tg.professor_id
left join public.teacher_records tr
  on tr.professor_id = tg.professor_id
  and extract(month from tr.data)::integer = tg.mes
  and extract(year from tr.data)::integer = tg.ano
group by tg.id, u.nome;
