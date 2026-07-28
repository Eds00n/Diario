# Nosso Diário

Timeline pessoal do casal — Next.js + Supabase + Vercel.

**Guia completo de ambiente:** [SETUP.md](./SETUP.md)

## Quick start

```bash
npm install
cp .env.example .env.local   # opcional no preview
npm run dev
```

[http://localhost:3000](http://localhost:3000) — sem Supabase configurado, usa **dados de exemplo**.

## Variáveis (`.env.local`)

| Variável | Obrigatória |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim (produção) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim (produção) |

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Timeline pública |
| `/admin/login` | Login Supabase |
| `/admin` | Gerenciar entradas |
