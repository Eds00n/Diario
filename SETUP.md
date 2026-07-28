# Setup — Nosso Diário

## 1. Dependências

```bash
cd nosso-diario
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

**Modo preview:** com `.env.local` vazio ou com placeholders do `.env.example`, a timeline usa **dados mock** automaticamente.

---

## 2. Criar projeto no Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Escolha organização, nome, senha do banco e região.
3. Aguarde o projeto ficar **Active**.

### Credenciais → `.env.local`

Dashboard → **Project Settings** → **API**:

| Campo no Supabase | Variável no `.env.local` |
|-------------------|---------------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

Copie `.env.example` para `.env.local` e substitua os valores.

Reinicie o dev server após salvar (`Ctrl+C` → `npm run dev`).

---

## 3. Banco de dados

**SQL Editor** → New query → cole o conteúdo de `supabase/schema.sql` → **Run**.

Isso cria `entries`, `special_dates`, RLS (leitura pública, escrita autenticada).

---

## 4. Storage — bucket `fotos`

1. **Storage** → **New bucket**
2. Name: `fotos`
3. **Public bucket:** ligado (ON)
4. Create bucket

### Políticas (Storage → fotos → Policies)

| Operação | Quem |
|----------|------|
| SELECT (read) | public / anon |
| INSERT, UPDATE, DELETE | authenticated |

No editor de políticas, exemplos:

- **Leitura:** `true` para `SELECT` role `public`
- **Upload:** `INSERT` com `auth.role() = 'authenticated'`

---

## 5. Usuário admin (Auth)

1. **Authentication** → **Users** → **Add user**
2. Email + senha (ex.: seu email pessoal)
3. Use essas credenciais em `/admin/login`

---

## 6. Fluxo de teste

1. `/admin/login` → entrar
2. **Nova entrada** → texto, data, foto → Publicar
3. `/` → entrada aparece na timeline com imagem via `next/image`

---

## 7. Imagens decorativas

Coloque `public/images/lirio.jpg` (foto de lírio). Sem o arquivo, a home pode falhar ao otimizar essa imagem — adicione o JPG ou comente `LilyField` temporariamente.

---

## Stack no repositório

- **Next.js 16** (App Router) — não Next 14
- Timeline: `Timeline.tsx` + `EntryCard.tsx` (layout editorial)
- Não há `StoryEntry.tsx` / scrollytelling `--reveal` neste branch — se for outra versão, compare branches ou peça merge do layout scrolly
