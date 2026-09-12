# ServoVIX — site institucional

Site estático da **ServoVIX — Instalações e Manutenções**, empresa de serviços de
elétrica, serralheria, segurança eletrônica e reformas em Vitória e Grande Vitória (ES).

**Produção:** https://servovix.com.br
**Hospedagem:** GitHub Pages (branch `main`, raiz do repositório, domínio próprio via `CNAME`)

---

## Estrutura

```
.
├── index.html              Home (landing focada em conversão)
├── eletrica.html           Serviço: instalação e manutenção elétrica
├── serralheria.html        Serviço: serralheria e estruturas metálicas
├── seguranca.html          Serviço: segurança eletrônica
├── reformas.html           Serviço: reformas e acabamentos
├── 404.html                Página de erro (servida pelo GitHub Pages)
├── offline.html            Página exibida quando não há conexão
├── sw.js                   Service worker (cache e uso offline)
│
├── assets/
│   ├── css/servovix.css    Design system completo (sem framework)
│   ├── js/servovix.js      Menu, FAQ, animações e formulário → WhatsApp
│   └── brand/              Logotipo, ícones e imagem social
│       ├── servovix-logo.svg        Logo horizontal (fundo escuro)
│       ├── servovix-logo-light.svg  Logo horizontal (fundo claro)
│       ├── servovix-mark.svg/.png   Símbolo isolado
│       ├── favicon.svg              Ícone vetorial
│       ├── icon-16…512.png          Ícones raster (favicon, PWA, Apple)
│       └── og-image.jpg             Imagem de compartilhamento (1200×630)
│
├── img/                    Fotos dos serviços (.jpg + .webp)
│   └── elet/               Registros antes/depois de elétrica
│
├── favicon.ico             Favicon multi-resolução (16/32/48)
├── site.webmanifest        Manifesto PWA
├── robots.txt              Diretivas para buscadores
├── sitemap.xml             Mapa do site
└── CNAME                   Domínio personalizado
```

---

## Decisões técnicas

| Item | Escolha | Motivo |
|---|---|---|
| CSS | Arquivo único, sem framework | O site antigo carregava o Tailwind via CDN, que não é recomendado em produção (bloqueia a renderização e gera CSS em tempo de execução) |
| Ícones | Sprite SVG embutido | Substitui o Font Awesome por CDN — menos requisições, sem dependência externa |
| Imagens | `.webp` com fallback `.jpg`, `loading="lazy"`, `width`/`height` | Reduz peso e evita deslocamento de layout (CLS) |
| Fontes | Google Fonts com `preconnect` + `display=swap` | Barlow Condensed (títulos) e Inter (texto) |
| Formulário | Monta a mensagem e abre o WhatsApp | Site estático não tem backend; nenhum dado é armazenado |
| JavaScript | Vanilla, sem dependências | ~5 KB, sem build |
| PWA | Service worker próprio, sem biblioteca | HTML com rede primeiro (nunca serve conteúdo velho), estáticos com cache primeiro |

## Acessibilidade e SEO

- Estrutura semântica, link "pular para o conteúdo", `aria-*` no menu e no FAQ, foco visível.
- Respeita `prefers-reduced-motion`.
- Título, descrição e URL canônica únicos por página.
- Open Graph e Twitter Card com imagem própria.
- Dados estruturados JSON-LD: `LocalBusiness`/`Electrician`, `WebSite`, `Service`,
  `BreadcrumbList` e `FAQPage`.

---

## PWA (aplicativo instalável)

O site pode ser instalado como aplicativo no celular e continua abrindo sem conexão.

- `site.webmanifest` — nome, ícones (incluindo dois `maskable`, que o Android exige
  para o ícone adaptativo não sair cortado), cor de tema e três atalhos de acesso rápido.
- `sw.js` — service worker. Guarda o esqueleto do site na instalação e usa duas
  estratégias: **rede primeiro** para HTML, de modo que o conteúdo nunca fique velho
  quando há internet, e **cache primeiro** para CSS, JS, imagens e fontes, o que dá
  carregamento instantâneo em visitas repetidas. Sem conexão, cai para a página já
  salva ou para `offline.html`.
- O registro do service worker fica em `assets/js/servovix.js`.

> **Ao publicar mudanças, incremente `VERSAO` no topo do `sw.js`**
> (`servovix-v1` → `servovix-v2`). É isso que descarta os caches antigos na ativação.
> Sem incrementar, quem já visitou o site pode continuar vendo CSS ou imagens antigos.

Service worker só funciona em HTTPS ou em `localhost`. Em produção o GitHub Pages
já serve HTTPS no domínio próprio.

---

## Como editar

O site é HTML puro — basta abrir o arquivo e alterar o texto.

**Onde mudam as informações de contato** (aparecem em todas as páginas):

| O que | Onde procurar |
|---|---|
| Telefone / WhatsApp | `wa.me/5527998432920` e `tel:+5527998432920` |
| E-mail | `servovix@gmail.com` |
| Instagram | `instagram.com/servovix.servicos` |
| Cidades atendidas | Seção `#area` no `index.html` e o bloco JSON-LD `areaServed` |

> Ao trocar o número de telefone, atualize também a constante `NUMERO`
> em `assets/js/servovix.js` (usada pelo formulário de orçamento).

**Para testar localmente**, qualquer servidor estático serve. Exemplo:

```bash
npx serve .
```

Abrir direto pelo `file://` não funciona: as páginas usam caminhos absolutos (`/assets/...`).

---

## Publicação

O GitHub Pages publica automaticamente a cada `push` na branch `main`.
A propagação leva de alguns segundos a poucos minutos.

---

## Pendências do proprietário

Itens que aumentam a credibilidade e a conversão, mas que dependem de
informação real da empresa — não foram inventados:

- [ ] **CNPJ e razão social** no rodapé.
- [ ] **Tempo de atuação** ("desde 20XX") — dado de confiança de alto impacto.
- [ ] **Qualificação técnica** (NR-10, ART/CREA ou registro equivalente), se houver.
- [ ] **Avaliações do Google** — vincular o perfil do Google Business e exibir a nota.
- [ ] **Fotos de serralheria e reformas** — hoje há apenas duas de cada frente.
- [ ] **Confirmar a lista de serviços** de cada página e as cidades atendidas.
- [ ] **Confirmar a política de garantia**, caso exista prazo definido.
