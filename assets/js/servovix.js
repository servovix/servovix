/* ServoVIX - interacoes do site (vanilla, sem dependencias) */
(function () {
  "use strict";

  /* ---- 1. Header: estado ao rolar ---- */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var onScroll = function () {
      hdr.classList.toggle("is-stuck", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- 2. Menu mobile ---- */
  var drawer = document.getElementById("drawer");
  var burger = document.getElementById("burger");

  function setDrawer(open) {
    if (!drawer || !burger) return;
    drawer.setAttribute("data-open", open ? "true" : "false");
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.classList.toggle("is-locked", open);
    if (open) {
      var first = drawer.querySelector("a, button");
      if (first) first.focus();
    } else {
      burger.focus();
    }
  }

  if (burger && drawer) {
    burger.addEventListener("click", function () {
      setDrawer(drawer.getAttribute("data-open") !== "true");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]") || e.target.classList.contains("drawer__veil")) setDrawer(false);
      else if (e.target.closest("a")) setDrawer(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") setDrawer(false);
    });
  }

  /* ---- 3. FAQ acessivel ---- */
  document.querySelectorAll(".ac").forEach(function (ac) {
    var btn = ac.querySelector(".ac__btn");
    var panel = ac.querySelector(".ac__panel");
    if (!btn || !panel) return;
    btn.addEventListener("click", function () {
      var open = ac.getAttribute("data-open") === "true";
      ac.setAttribute("data-open", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "false" : "true");
      panel.setAttribute("aria-hidden", open ? "true" : "false");
    });
  });

  /* ---- 4. Revelar ao rolar ---- */
  var reveals = document.querySelectorAll(".rv");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reveals.length) return;

  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      setTimeout(function () { el.classList.add("in"); }, delay);
      io.unobserve(el);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

  reveals.forEach(function (el) { io.observe(el); });
})();

/* ServoVIX - formulario de orcamento via WhatsApp (sem backend) */
(function () {
  "use strict";

  var NUMERO = "5527998432920";
  var form = document.getElementById("orcamento");
  if (!form) return;

  function fieldOf(el) { return el.closest(".field"); }

  function validate(el) {
    var ok = !el.required || el.value.trim().length >= (el.dataset.min ? +el.dataset.min : 1);
    var wrap = fieldOf(el);
    if (wrap) wrap.setAttribute("data-error", ok ? "false" : "true");
    return ok;
  }

  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("blur", function () { if (el.value.trim()) validate(el); });
    el.addEventListener("input", function () {
      var wrap = fieldOf(el);
      if (wrap && wrap.getAttribute("data-error") === "true") validate(el);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var campos = form.querySelectorAll("input, select, textarea");
    var valido = true;
    var primeiroErro = null;

    campos.forEach(function (el) {
      if (!validate(el)) {
        valido = false;
        if (!primeiroErro) primeiroErro = el;
      }
    });

    if (!valido) {
      if (primeiroErro) primeiroErro.focus();
      return;
    }

    var nome = (form.elements.nome.value || "").trim();
    var servico = (form.elements.servico.value || "").trim();
    var local = (form.elements.local.value || "").trim();
    var detalhe = (form.elements.detalhe.value || "").trim();

    var linhas = ["Olá! Vim pelo site da ServoVIX e gostaria de um orçamento.", ""];
    if (nome) linhas.push("*Nome:* " + nome);
    if (servico) linhas.push("*Serviço:* " + servico);
    if (local) linhas.push("*Local:* " + local);
    if (detalhe) linhas.push("*O que preciso:* " + detalhe);

    var url = "https://wa.me/" + NUMERO + "?text=" + encodeURIComponent(linhas.join("\n"));
    window.open(url, "_blank", "noopener");
  });
})();

/* ServoVIX - registro do service worker (site utilizavel offline) */
(function () {
  "use strict";
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").then(function (reg) {
      // se uma versao nova ficar esperando, assume assim que possivel
      if (reg.waiting) reg.waiting.postMessage("pular-espera");
      reg.addEventListener("updatefound", function () {
        var novo = reg.installing;
        if (!novo) return;
        novo.addEventListener("statechange", function () {
          if (novo.state === "installed" && navigator.serviceWorker.controller) {
            novo.postMessage("pular-espera");
          }
        });
      });
    }).catch(function () { /* sem service worker o site segue normal */ });
  });
})();
