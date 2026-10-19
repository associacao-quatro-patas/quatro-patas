# Prompt: interface do website da ONG 4 Patas

> Copie o bloco abaixo e envie junto com os anexos: **logo**, **wireframe da Home**, **wireframe da página de Doações** e o **PDF do Portfólio de Design Web (CIESA 2026)**.

---

Você é um designer de UI/UX sênior e desenvolvedor front-end. Crie a interface completa e responsiva (**mobile-first**) do website da ONG cujo nome oficial é:

**Associação Protetora 4 Patas de Assistência aos Animais Abandonados e Comunitários e Apoio aos Protetores Independentes**

Nome curto para cabeçalho, botões e textos corridos: **ONG Protetora 4 Patas** (ou "4 Patas"). O nome completo deve aparecer no rodapé, na página "Sobre/Quem somos" e nos metadados (`<title>` e descrição) do site.

## 1. Contexto do projeto

- ONG de proteção animal em **Manaus (AM)** que resgata cães e gatos em situação de vulnerabilidade, promove feirinhas de adoção em praças e apoia protetores independentes.
- Objetivos do site: aumentar as **adoções responsáveis** e facilitar as **doações**.
- O projeto já existe: **Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + Supabase**. O site terá **apenas 4 telas**: `/` (Início), `/sobre`, `/adocao` e `/doacoes`. Não crie outras páginas. Mantenha essa estrutura e reaproveite os componentes que já existem (`site-header`, `site-footer`, `hero-banner`, `pet-card`, `pet-filters`, `pix-card`, `copy-button`, `supply-list`). Os dados da instituição (Pix, WhatsApp, endereço, redes sociais) vêm do Supabase; não os coloque fixos no código.

## 2. Logo (obrigatório)

**Acrescente a logo oficial da ONG ao site.** O arquivo é o selo circular anexado: círculo rosa com borda branca, o texto "ONG PROTETORA" no arco superior, "4 PATAS" no arco inferior e, no centro, uma pata branca com silhuetas de cão e gato.

- Salve o arquivo em `public/logo-4patas.png` (de preferência também uma versão SVG ou PNG com fundo transparente) e use `next/image`.
- **Cabeçalho:** logo à esquerda (mobile: ~40px; desktop: ~56px) ao lado do texto "4 Patas" em Poppins Bold, cor Rosa Escuro. A logo leva para `/`.
- **Rodapé:** logo maior (~80px), centralizada, acima do nome completo da associação.
- **Favicon e ícone do app:** gere a partir da logo (`src/app/icon.png` e `apple-icon.png`).
- **Open Graph:** use a logo na imagem de compartilhamento.
- Texto alternativo: `alt="Logo da ONG Protetora 4 Patas"`.
- Não distorça, não recolora e não aplique a logo sobre fundos rosa do mesmo tom: deixe espaço de respiro e use fundo branco ou Rosa Pastel.

## 3. Identidade visual (siga o guia de estilos do PDF)

**Tipografia:** **Poppins** (Google Fonts, via `next/font`). Títulos 700, subtítulos 600, textos 400. Base de 16px no mobile, com altura de linha generosa.

**Paleta: cores principais**

| Token | Hex | Uso |
|---|---|---|
| Rosa Principal | `#E91E7A` | Identidade, botões prioritários, ícones |
| Rosa Escuro | `#B3125B` | Títulos, destaques de ênfase, hover de botões |
| Rosa Claro | `#FFD6E7` | Fundo de cards, banners e etiquetas |
| Rosa Pastel | `#FFEAF2` | Fundos secundários e cartões suaves |

**Paleta: ações, alertas e acessibilidade**

| Token | Hex | Uso |
|---|---|---|
| Cinza Escuro | `#2E2E2E` | Texto principal |
| Verde Sucesso | `#4CAF7D` | Botão de WhatsApp e confirmações |
| Amarelo Alerta | `#FFC857` | Avisos e pendências |
| Vermelho Urgente | `#FF6B6B` | Resgates críticos e urgências |

Declare tudo como tokens no `@theme` do Tailwind v4 (`globals.css`). Fundo geral branco, com manchas de gradiente rosa bem sutis nos cantos, no mesmo estilo do PDF.

**Componentes**
- Cantos arredondados (cards ~16px, botões em formato de pílula), sombras leves e bordas `#FFD6E7`.
- **Ação prioritária:** botão preenchido em Rosa Principal com texto branco (ex.: "Quero adotar", "Doe agora").
- **Ação secundária:** botão de contorno em Rosa Principal (ex.: "Saiba mais").
- Ícones em círculo Rosa Principal com o símbolo em branco, sempre alinhados horizontalmente com o texto. Mapa de ícones: casa (Início), pata (Adoção), coração (Doação/favoritar), WhatsApp (Contato), seringa (Cuidados: vacina e castração), estrela (Histórias/Depoimentos), mão com coração (Doar), varinha mágica (MatchPet), "X" (fechar).
- Títulos de seção com um pequeno traço de destaque logo abaixo, como nos wireframes.

## 4. Estrutura das páginas (siga os wireframes anexados)

### Home (`/`), conforme o wireframe "Quatro Patas – Home"
1. **Header:** menu hambúrguer (mobile), logo + "4 Patas" ao centro, ícone de busca. No desktop, a navegação fica horizontal: Início, Sobre, Adoção, Doações.
2. **Hero em carrossel** (3 slides com indicadores e setas): "Adote: encontre seu novo melhor amigo!", com botão "Saiba mais" e ilustração de cão e gato com coração. Os demais slides falam de Doação e da ONG (Sobre).
3. **Atalhos rápidos** (3 cards com ícone): Adoção · Doação · Sobre.
4. **Quem somos:** texto curto (ONG de proteção animal em Manaus...), botão "Saiba mais" e foto.
5. **Nossos animais:** carrossel de cards de pets (foto, nome, idade/sexo, selos de vacinado e castrado, coração para favoritar) e botão "Ver adoções".
6. **Faça uma doação:** faixa com QR Code Pix, chave Pix e botão "Copiar chave".
7. **Nosso objetivo / Como funciona?** em 2 cards lado a lado.
8. **Depoimentos:** carrossel de histórias de adotantes, com foto, citação e nome.
9. **Rodapé:** "Juntos por eles ♥", ícones de Instagram, WhatsApp e Facebook, logo, nome completo da associação, links de Transparência e Termos de uso.

### Doações (`/doacoes`), conforme o wireframe "Sua doação faz a diferença!"
1. **Hero:** "Sua doação faz a diferença!" + texto de apoio + botão "Doe agora →" + ilustração de cão e gato.
2. **Como você pode ajudar?** 4 cards: Ração e mantimentos · Produtos de higiene e limpeza · Medicamentos e cuidados · Doação financeira. Cada card mostra a lista de insumos prioritários (ração, remédios, jornais) vinda do Supabase.
3. **Doe via Pix:** chave Pix com botão de copiar (com feedback "Copiado!") e QR Code com a legenda "Aponte a câmera do seu celular".
4. **Cada doação salva uma vida:** imagem + texto + botão "Saiba mais".
5. Rodapé padrão.

### Adoção (`/adocao`): Mural Virtual de Adoção
- Grade de cards de pets com filtro por espécie (cão/gato), porte e sexo, e status de vacina e castração.
- Em cada pet, botão verde **"Quero adotar pelo WhatsApp"** que abre o WhatsApp da ONG com mensagem pré-formatada citando o nome do animal.
- Destaque opcional "MatchPet" (compatibilidade entre adotante e animal).

### Sobre (`/sobre`)
Nome completo da associação, história, missão, atuação em Manaus, apoio aos protetores independentes e transparência.

## 5. Requisitos de qualidade
- **Mobile-first**, sem rolagem horizontal, com margem lateral de 16px. Breakpoints em `md` (tablet) e `lg` (desktop, conteúdo com até ~1200px de largura).
- **Acessibilidade:** contraste AA (texto em `#2E2E2E` ou Rosa Escuro sobre fundos claros), áreas de toque de 44px ou mais, foco visível, `alt` em todas as imagens, carrosséis navegáveis por teclado e respeito a `prefers-reduced-motion`.
- Botão flutuante de WhatsApp (Verde Sucesso) fixo no canto inferior direito, no mobile.
- Tom de voz acolhedor, próximo e esperançoso, todo em português do Brasil.
- Use imagens reais da ONG quando houver. Enquanto não houver, use placeholders com a pata da marca em Rosa Claro.

**Entregável:** somente as 4 telas (Início, Sobre, Adoção e Doações) implementadas no projeto atual, com a logo aplicada no header, no rodapé, no favicon e no Open Graph, fiéis aos wireframes e ao guia de estilos.
