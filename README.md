# Academia Pro

Sistema SaaS para gerenciamento de metas de academias, com dashboard executivo, controle de vendas, metas de professores, relatorios, auditoria e controle de permissao por perfil.

## Como rodar

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para usar autenticação real do Supabase. Sem essas variaveis, o app usa dados de demonstracao locais.

## Banco de dados

A migracao principal esta em `supabase/migrations/001_initial_schema.sql` e inclui:

- tabelas relacionais
- enums
- indices
- Row Level Security
- politicas por perfil
- triggers de auditoria
- view de resumo mensal

## Login demo

- `gestor@academiapro.com`
- senha: qualquer valor com 6 ou mais caracteres
