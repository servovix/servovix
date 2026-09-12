/* ServoVIX — service worker
   Objetivo: o site abrir mesmo sem conexão e carregar instantâneo em visitas
   repetidas, sem nunca servir HTML velho quando há rede. */

const VERSAO = 'servovix-v4';
const CACHE_SHELL = `${VERSAO}-shell`;
const CACHE_ATIVOS = `${VERSAO}-ativos`;
const CACHE_FONTES = `${VERSAO}-fontes`;

/* Esqueleto do site: vai para o cache já na instalação. */
const SHELL = [
  '/',
  '/index.html',
  '/eletrica.html',
  '/serralheria.html',
  '/seguranca.html',
  '/reformas.html',
  '/offline.html',
  '/404.html',
  '/assets/css/servovix.css',
  '/assets/js/servovix.js',
  '/assets/brand/servovix-logo.svg',
  '/assets/brand/servovix-logo-compact.svg',
  '/assets/brand/favicon.svg',
  '/assets/brand/icon-192.png',
  '/assets/brand/icon-512.png',
  '/img/profissional.webp',
  '/site.webmanifest',
];

const ehFonte = (url) =>
  url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';

/* ---------- instalação ---------- */
self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE_SHELL)
      // addAll falha inteiro se um item falhar; adiciona um a um para ser tolerante
      // cache:'reload' ignora o cache HTTP do navegador. Sem isso, logo apos um
      // deploy o precache grava a copia antiga (GitHub Pages serve max-age=600)
      // e ela fica servida ate a proxima troca de VERSAO.
      .then((cache) => Promise.allSettled(
        SHELL.map((u) => cache.add(new Request(u, { cache: 'reload' })))
      ))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ativação: limpa versões antigas ---------- */
self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(
        nomes.filter((n) => !n.startsWith(VERSAO)).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- estratégias ---------- */

// HTML: rede primeiro (conteúdo sempre fresco), cache como rede de segurança.
async function redePrimeiro(req) {
  const cache = await caches.open(CACHE_SHELL);
  try {
    const resposta = await fetch(req);
    if (resposta && resposta.ok) cache.put(req, resposta.clone());
    return resposta;
  } catch (e) {
    // ignoreSearch: start_url e atalhos levam ?fonte=pwa e nao bateriam com o '/' salvo
    const guardado = await cache.match(req, { ignoreSearch: true }) || await cache.match('/index.html');
    return guardado || cache.match('/offline.html');
  }
}

// Estáticos: cache primeiro, revalidando em segundo plano.
async function cachePrimeiro(req, nomeCache) {
  const cache = await caches.open(nomeCache);
  const guardado = await cache.match(req);
  // no-cache = revalida com o servidor (If-None-Match) em vez de aceitar a
  // copia do cache HTTP; para outras origens mantem a requisicao original.
  const mesmaOrigem = new URL(req.url).origin === self.location.origin;
  const reqRede = mesmaOrigem ? new Request(req.url, { cache: 'no-cache' }) : req;
  const rede = fetch(reqRede)
    .then((resposta) => {
      if (resposta && (resposta.ok || resposta.type === 'opaque')) cache.put(req, resposta.clone());
      return resposta;
    })
    .catch(() => null);
  return guardado || (await rede) || Response.error();
}

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Navegação (abrir uma página)
  if (req.mode === 'navigate') {
    evento.respondWith(redePrimeiro(req));
    return;
  }

  // Fontes do Google
  if (ehFonte(url)) {
    evento.respondWith(cachePrimeiro(req, CACHE_FONTES));
    return;
  }

  // Demais origens ficam de fora (ex.: wa.me)
  if (url.origin !== self.location.origin) return;

  // Estáticos do próprio site
  if (/\.(css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$/i.test(url.pathname)) {
    evento.respondWith(cachePrimeiro(req, CACHE_ATIVOS));
    return;
  }

  evento.respondWith(redePrimeiro(req));
});

/* Permite forçar a troca de versão a partir da página. */
self.addEventListener('message', (evento) => {
  if (evento.data === 'pular-espera') self.skipWaiting();
});
