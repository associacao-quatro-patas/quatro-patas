# Quatro Patas

Site da instituição Quatro Patas: adoção de animais, doações e painel administrativo.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · Supabase (Auth, Postgres, Storage).

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Acesse http://localhost:3000. O site público funciona mesmo sem Supabase configurado; o painel (`/admin`) fica bloqueado até lá.

## Estrutura

```
src/
├── app/
│   ├── (public)/              # Site público (header + footer)
│   │   ├── page.tsx           # Página inicial
│   │   ├── sobre/             # Sobre a instituição
│   │   ├── adocao/            # Lista de adoção (+ filtros)
│   │   │   └── [slug]/        # Página individual do animal
│   │   └── doacoes/           # PIX, QR Code e insumos
│   ├── admin/
│   │   ├── login/             # Login do painel
│   │   └── (painel)/          # Área protegida
│   │       ├── pets/          # CRUD de pets + fotos
│   │       ├── instituicao/   # Dados da instituição
│   │       ├── doacoes/       # Dados de doação / PIX
│   │       └── insumos/       # Lista de insumos
│   ├── layout.tsx             # Layout raiz (fonte, metadados, pt-BR)
│   └── globals.css            # Tailwind + tokens de cor
├── components/
│   ├── layout/                # Header e footer do site
│   └── ui/                    # Componentes reutilizáveis
├── config/site.ts             # Nome do site e menus
├── lib/supabase/              # Clientes Supabase (navegador, servidor, proxy)
├── types/                     # Tipos de domínio (preliminares)
└── proxy.ts                   # Renova sessão e protege /admin/*
```

> No Next.js 16, o antigo `middleware.ts` passou a se chamar `proxy.ts`.

## Roteiro

- [x] Estrutura inicial e configuração
- [x] Banco dos pets, administradores e políticas do Storage (migrações 001–003)
- [x] Login do painel (Supabase Auth + tabela `admins`)
- [x] CRUD de pets com upload, prévia e troca de foto
- [x] Listagem pública de adoção e perfil do animal
- [ ] Filtros de adoção
- [ ] Botão “Tenho interesse” → WhatsApp
- [ ] Informações da instituição (página Sobre + edição no painel)
- [ ] Doações: PIX com botão copiar, QR Code e edição no painel
- [ ] Gerenciamento de insumos
- [ ] Página inicial

Nenhuma informação da instituição está fixa no código: tudo será cadastrado pelo painel.
