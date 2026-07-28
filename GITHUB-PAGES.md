# Publicar no GitHub Pages (repositório `Eds00n/Diario`)

O GitHub Pages **não roda Next.js** — só arquivos estáticos. Este projeto gera o site com `npm run build:pages` e o workflow `.github/workflows/deploy-pages.yml` publica a pasta `out/`.

## O que colocar no repositório

O repositório precisa do **código do app**, não só das fotos na raiz.

Estrutura recomendada na raiz do repo `Diario`:

- Arquivos do app (`package.json`, `src/`, `public/`, `scripts/`, etc.)
- `content/memorias.json` (e opcionalmente `content/datas-especiais.json`)
- Fotos e vídeos referenciados no JSON (podem ficar na **raiz** do repo ou na pasta pai local; o script de build copia para `public/memorias/`)

## Configuração no GitHub

1. **Settings → Pages → Build and deployment → Source:** **GitHub Actions**
2. Envie o código para a branch `main` (ou `master`). O workflow roda sozinho.
3. URL do site: **https://eds00n.github.io/Diario/** (`basePath` = `/Diario`)

## Senha no site publicado

No GitHub Pages a senha é checada no navegador (sessão). Senha padrão: **456987**. Opcional: `NEXT_PUBLIC_SITE_PASSWORD` nos secrets do Actions.

## Desenvolvimento local (com fotos na pasta `E. S.`)

```bash
npm run dev
```

## Testar build igual ao GitHub

```bash
npm run build:pages
```

Abra a pasta `out/` com um servidor estático ou use `npx serve out` (lembre do prefixo `/Diario` se testar paths).
