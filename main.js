/* =========================================================
   CHICHI BARBER — interacciones premium (GSAP + ScrollTrigger + Lenis)
   + reservas en tiempo real con Firestore
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const body = document.body;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduced;

  if (!motion) root.classList.add("no-motion");
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  const yearEl = $("#year"); if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Botón: envuelve el texto para el roll ---------- */
  $$(".btn__text").forEach((t) => {
    const label = t.textContent.trim();
    t.innerHTML = `<i data-text="${label}">${label}</i>`;
  });

  /* ---------- Scroll suave ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Menú móvil ---------- */
  const burger = $(".burger");
  const menu = $("#mobile-menu");
  const setMenu = (open) => {
    body.classList.toggle("menu-open", open);
    burger?.setAttribute("aria-expanded", open);
    menu?.setAttribute("aria-hidden", !open);
    if (lenis) open ? lenis.stop() : lenis.start();
    else body.style.overflow = open ? "hidden" : "";
  };
  burger?.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Anclas ---------- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const target = id.length > 1 && $(id);
    if (!target) return;
    e.preventDefault();
    const wasOpen = body.classList.contains("menu-open");
    setMenu(false);
    const go = () => (lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }));
    wasOpen ? setTimeout(go, 350) : go();
  }));

  /* ---------- Rotador del hero ---------- */
  const startRotator = () => {
    if (reduced) return;
    const items = $$(".rotator__item");
    if (!items.length) return;
    let i = 0;
    setInterval(() => {
      const cur = items[i];
      cur.classList.replace("is-active", "is-leaving");
      setTimeout(() => cur.classList.remove("is-leaving"), 1100);
      i = (i + 1) % items.length;
      items[i].classList.add("is-active");
    }, 2600);
  };

  /* ---------- Partir texto en palabras enmascaradas (conserva <em>) ---------- */
  const splitWords = (el) => {
    const inners = [];
    const frag = document.createDocumentFragment();
    [...el.childNodes].forEach((node) => {
      const tag = node.nodeType === 1 ? node.tagName.toLowerCase() : null;
      if (tag === "br") { frag.appendChild(document.createElement("br")); return; }
      node.textContent.split(/\s+/).filter(Boolean).forEach((word) => {
        if (/^[.,;:!?]+$/.test(word) && inners.length) { inners[inners.length - 1].append(word); return; }
        const mask = document.createElement("span"); mask.className = "w-mask";
        const inner = document.createElement("span"); inner.className = "w-in";
        if (tag) { const t = document.createElement(tag); t.textContent = word; inner.appendChild(t); }
        else inner.textContent = word;
        mask.appendChild(inner); frag.append(mask, " "); inners.push(inner);
      });
    });
    el.textContent = ""; el.appendChild(frag);
    return inners;
  };

  /* ---------- Fallback sin GSAP ---------- */
  const wa = $(".wa-float");
  const nav = $(".nav");
  if (!motion) {
    $(".preloader")?.remove();
    startRotator();
    $$(".step").forEach((s) => s.classList.add("is-in"));
    let lastY = 0;
    addEventListener("scroll", () => {
      const y = scrollY;
      wa?.classList.toggle("is-visible", y > innerHeight * 0.5);
      nav?.classList.toggle("is-hidden", y > lastY && y > innerHeight && !body.classList.contains("menu-open"));
      nav?.classList.toggle("is-solid", y > innerHeight * 0.8);
      lastY = y;
    }, { passive: true });
  }

  /* ========================================================= Motion ========================================================= */
  if (motion) {
    const expo = "expo.out";
    const pre = $(".preloader");
    const num = $(".preloader__num");
    body.classList.add("is-loading");
    lenis?.stop();
    const counter = { v: 0 };

    gsap.set(".hero__media img", { scale: 1.35 });
    gsap.set(".hero__title .line__in", { yPercent: 115 });
    gsap.set("[data-hero]", { y: 30, autoAlpha: 0 });
    if (nav) gsap.set(nav, { yPercent: -100, autoAlpha: 0 });

    let seen = false;
    try { seen = !!sessionStorage.getItem("cb-intro"); sessionStorage.setItem("cb-intro", "1"); } catch (e) {}
    const t = seen ? 0 : 0.9;

    const intro = gsap.timeline({ paused: true });
    if (pre) {
      if (seen) intro.to(pre, { autoAlpha: 0, duration: 0.4, ease: "power2.out" }, 0);
      else intro
        .to(counter, { v: 100, duration: 0.9, ease: "power2.inOut", onUpdate: () => num && (num.textContent = Math.round(counter.v)) }, 0)
        .to(".preloader__line", { scaleX: 1, duration: 0.9, ease: "power2.inOut" }, 0)
        .to(".preloader__center, .preloader__top, .preloader__bottom", { autoAlpha: 0, y: -30, duration: 0.3, stagger: 0.03, ease: "power2.in" }, 0.82)
        .to(pre, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, 0.9);
    }
    intro
      .to(".hero__media img", { scale: 1, duration: 2.2, ease: expo }, t + 0.05)
      .to(".hero__title .line__in", { yPercent: 0, duration: 1.4, stagger: 0.1, ease: expo }, t + 0.3)
      .to("[data-hero]", { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.08, ease: expo }, t + 0.5);
    if (nav) intro.to(nav, { yPercent: 0, autoAlpha: 1, duration: 1.1, ease: expo, clearProps: "transform" }, t + 0.4);
    intro.add(() => {
      pre?.remove(); body.classList.remove("is-loading"); lenis?.start(); startRotator(); ScrollTrigger.refresh();
    }, t + 0.5);

    let started = false;
    const play = () => { if (!started) { started = true; intro.play(); } };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(play);
    setTimeout(play, 900);

    /* Hero parallax */
    gsap.to(".hero__media", { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__content, .hero__foot", { y: -70, autoAlpha: 0.25, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });

    /* Nav mostrar/ocultar + WhatsApp */
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (s) => {
        const y = s.scroll();
        nav?.classList.toggle("is-hidden", s.direction === 1 && y > innerHeight && !body.classList.contains("menu-open"));
        nav?.classList.toggle("is-solid", y > innerHeight * 0.8);
        wa?.classList.toggle("is-visible", y > innerHeight * 0.5);
      },
    });

    /* Títulos: reveal por palabras */
    $$("[data-split]").forEach((el) => {
      const words = splitWords(el);
      gsap.from(words, { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.06, ease: expo, scrollTrigger: { trigger: el, start: "top 86%" } });
    });

    /* Intro: palabras se iluminan con el scroll */
    const introEl = $("[data-words]");
    if (introEl) {
      const introWords = splitWords(introEl);
      gsap.fromTo(introWords, { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: introEl, start: "top 80%", end: "bottom 55%", scrub: true } });
    }

    /* Reveal genérico */
    gsap.set("[data-reveal]", { y: 60, autoAlpha: 0 });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 90%",
      onEnter: (batch) => { gsap.to(batch, { y: 0, autoAlpha: 1, duration: 1.3, stagger: 0.09, ease: expo, overwrite: true }); batch.forEach((el) => el.classList.add("is-in")); },
    });

    /* About: cortina + parallax + badge */
    const frame = $(".about__frame");
    if (frame) {
      gsap.fromTo(frame, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: frame, start: "top 82%" } });
      gsap.from(".about__frame img", { scale: 1.4, duration: 2.4, ease: expo, scrollTrigger: { trigger: frame, start: "top 82%" } });
      gsap.from(".about__badge", { scale: 0, rotate: -90, duration: 1.4, ease: "back.out(1.6)", scrollTrigger: { trigger: frame, start: "top 60%" } });
    }

    /* Marquee reacciona al scroll */
    const mTrack = $(".marquee__track");
    if (mTrack) {
      let mx = 0, dir = -1, boost = 0;
      ScrollTrigger.create({ trigger: ".marquee", start: "top bottom", end: "bottom top", onUpdate: (s) => { dir = s.direction === 1 ? -1 : 1; boost = Math.min(8, Math.abs(s.getVelocity()) / 250); } });
      gsap.ticker.add(() => { boost *= 0.93; mx += (0.04 + boost * 0.09) * dir; if (mx <= -50) mx += 50; if (mx > 0) mx -= 50; gsap.set(mTrack, { xPercent: mx, skewX: -boost * dir * 0.8 }); });
    }

    /* Contadores */
    $$("[data-count]").forEach((el) => {
      const end = +el.dataset.count; const o = { v: 0 }; el.textContent = "0";
      gsap.to(o, { v: end, duration: 2, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)), scrollTrigger: { trigger: el, start: "top 90%" } });
    });

    /* Servicios: preview flotante sigue al cursor */
    if (finePointer && innerWidth > 760 && $(".services-preview")) {
      const prev = $(".services-preview"); const prevInner = $(".services-preview__inner"); const list = $(".services__list");
      const px = gsap.quickTo(prev, "x", { duration: 0.7, ease: "power3" });
      const py = gsap.quickTo(prev, "y", { duration: 0.7, ease: "power3" });
      const pr = gsap.quickTo(prev, "rotate", { duration: 0.8, ease: "power3" });
      gsap.set(prev, { scale: 0, autoAlpha: 0 });
      let lastX = 0;
      list?.addEventListener("mouseenter", (e) => { gsap.set(prev, { x: e.clientX, y: e.clientY }); gsap.to(prev, { scale: 1, autoAlpha: 1, duration: 0.6, ease: expo }); });
      list?.addEventListener("mouseleave", () => gsap.to(prev, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "power3.in" }));
      list?.addEventListener("mousemove", (e) => { px(e.clientX); py(e.clientY); pr(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6)); lastX = e.clientX; });
      $$(".srow").forEach((row) => row.addEventListener("mouseenter", () => { prevInner.style.transform = `translateY(${-row.dataset.index * 100}%)`; }));
    }

    /* Galería horizontal fijada */
    const track = $(".hgallery__track");
    if (track) {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: ".hgallery", start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: (s) => gsap.set(".hgallery__progress i", { scaleX: s.progress }) } });
    }

    /* Band: imagen se expande */
    if ($(".band__media")) {
      gsap.fromTo(".band__media", { clipPath: "inset(14% 16% 14% 16% round 8px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: ".band", start: "top 85%", end: "top top", scrub: true } });
      gsap.fromTo(".band__media img", { scale: 1.3 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".band", start: "top bottom", end: "bottom top", scrub: true } });
    }

    /* Footer wordmark gigante */
    gsap.from(".footer__big span", { yPercent: 105, duration: 1.6, stagger: 0.1, ease: expo, scrollTrigger: { trigger: ".footer__big", start: "top 95%" } });

    /* Botones magnéticos */
    if (finePointer) {
      $$(".magnetic").forEach((el) => {
        const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
        const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
        el.addEventListener("mousemove", (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.3); yTo((e.clientY - r.top - r.height / 2) * 0.4); });
        el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, .4)" }));
      });
    }
    addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ========================================================= Cursor ========================================================= */
  if (finePointer && !reduced && $(".cursor")) {
    root.classList.add("has-cursor");
    const cursor = $(".cursor");
    const blob = $(".cursor__blob"), dot = $(".cursor__dot"), label = $(".cursor__label");
    const labelText = $("span", label);
    let mx = -100, my = -100, bx = mx, by = my, lx = mx, ly = my;
    addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate3d(${mx}px,${my}px,0)`; cursor.classList.remove("is-hidden"); }, { passive: true });
    const loop = () => { bx += (mx - bx) * 0.18; by += (my - by) * 0.18; lx += (mx - lx) * 0.12; ly += (my - ly) * 0.12; blob.style.transform = `translate3d(${bx}px,${by}px,0)`; label.style.translate = `${lx}px ${ly}px`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("mouseover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      if (lab) { labelText.textContent = lab.dataset.cursor; cursor.classList.add("is-label"); cursor.classList.remove("is-hover"); return; }
      cursor.classList.remove("is-label");
      cursor.classList.toggle("is-hover", !!e.target.closest("a, button, label, [data-hover], .srow, .dia-cell, .hora-cell, .svc-opt"));
    });
    document.addEventListener("mousedown", () => cursor.classList.add("is-down"));
    document.addEventListener("mouseup", () => cursor.classList.remove("is-down"));
    document.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
  }

  /* ========================================================= Copiar datos de pago ========================================================= */
  $$(".copy").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); b.classList.add("done"); showToast("◆ Copiado al portapapeles"); setTimeout(() => b.classList.remove("done"), 1600); }
    catch { showToast("✕ No se pudo copiar", true); }
  }));

  /* ========================================================= Reservas (Firestore) ========================================================= */
  const bookingRoot = $("#reserva");
  if (!bookingRoot) return;

  const firebaseConfig = {
    apiKey: "AIzaSyBQp5mklZGHAq6ogwk-8ZSlAFhlDT5DpHI",
    authDomain: "chichibarber-29cc7.firebaseapp.com",
    projectId: "chichibarber-29cc7",
    storageBucket: "chichibarber-29cc7.firebasestorage.app",
    messagingSenderId: "26086335383",
    appId: "1:26086335383:web:cdc9588208bc0f6f45dad2"
  };
  const CITAS = "citas";
  const TURNOS = ["11 AM","12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM"];
  const SERVICIOS = { corte:{nombre:"Corte de Cabello",precio:7}, barba:{nombre:"Arreglo de Barba",precio:1}, combo:{nombre:"Corte + Barba",precio:8} };
  const DOW = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
  const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const WA_NUM = "584246783781";

  const id = (x) => document.getElementById(x);
  const nowVE = () => new Date(Date.now() + new Date().getTimezoneOffset()*60000 - 4*3600000);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const hora24 = (t) => { const i = TURNOS.indexOf(t); return i < 0 ? -1 : 11 + i; };
  const usd = (n) => '$' + n;

  let fs = null, db = null;
  let citas = [], semana = [], fSel = "", hSel = "", svcSel = "corte", conectado = false, enviando = false;

  function showToast(msg, err = false) {
    const el = id("toast"); if (!el) return;
    el.textContent = msg; el.className = "toast show" + (err ? " error" : "");
    clearTimeout(showToast._t); showToast._t = setTimeout(() => el.classList.remove("show"), 3400);
  }
  window.__toast = showToast;

  function buildSemana() {
    semana = []; const base = nowVE();
    for (let i = 0; semana.length < 6 && i < 8; i++) {
      const d = new Date(base); d.setDate(base.getDate()+i);
      if (d.getDay() === 0) continue;
      semana.push({ fecha: fmt(d), dow: DOW[d.getDay()], num: d.getDate(), mes: MESES[d.getMonth()] });
    }
    fSel = semana[0].fecha;
  }

  async function conectar() {
    try {
      const [appMod, fsMod] = await Promise.all([
        import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js")
      ]);
      fs = fsMod; db = fs.getFirestore(appMod.initializeApp(firebaseConfig));
      const fechas = semana.map(s => s.fecha);
      const q = fs.query(fs.collection(db, CITAS), fs.where("fecha", "in", fechas));
      fs.onSnapshot(q, (snap) => { citas = snap.docs.map(d => d.data()); conectado = true; renderAll(); }, sinConexion);
    } catch (e) { sinConexion(e); }
  }
  function sinConexion(e) {
    console.error("Firestore:", e); conectado = false;
    const m = id("bkStatusM"), d = id("bkStatusDot");
    if (m) { m.textContent = "Sin conexión · recarga la página"; m.className = "booking__status-m"; }
    if (d) d.className = "status-dot";
    validar();
  }
  const citasDe = (f) => citas.filter(c => c.fecha === f);
  const ocupado = (f, h) => citasDe(f).some(c => c.hora === h);

  function renderAll() { renderDias(); renderHoras(); renderDispo(); renderStatus(); renderResumen(); }

  function renderDias() {
    const g = id("gridDias"); if (!g) return; g.innerHTML = "";
    semana.forEach((s) => {
      const libres = TURNOS.length - citasDe(s.fecha).length;
      const el = document.createElement("div");
      el.className = "dia-cell" + (s.fecha === fSel ? " is-active" : "");
      el.innerHTML = `<span class="dia-dow">${s.dow}</span><span class="dia-num">${s.num}</span><span class="dia-free${libres<=0?' lleno':''}">${conectado ? (libres<=0?'Lleno':libres+' libres') : '·'}</span>`;
      el.onclick = () => { fSel = s.fecha; hSel = ""; renderAll(); };
      g.appendChild(el);
    });
  }
  function renderHoras() {
    const g = id("gridHoras"); if (!g) return; g.innerHTML = "";
    const hoy = fmt(nowVE()), hAhora = nowVE().getHours();
    TURNOS.forEach((t) => {
      const pasado = fSel === hoy && hora24(t) <= hAhora;
      const oc = ocupado(fSel, t);
      const el = document.createElement("div");
      if (oc) { el.className = "hora-cell ocupado"; el.innerHTML = `<span class="hora-time">${t}</span><span class="hora-tag rojo">Reservado</span>`; }
      else if (pasado) { el.className = "hora-cell pasado"; el.innerHTML = `<span class="hora-time">${t}</span><span class="hora-tag gris">—</span>`; }
      else { el.className = "hora-cell" + (hSel === t ? " is-sel" : ""); el.innerHTML = `<span class="hora-time">${t}</span><span class="hora-tag">Libre</span>`; el.onclick = () => { hSel = (hSel === t ? "" : t); renderHoras(); renderResumen(); }; }
      g.appendChild(el);
    });
  }
  function renderDispo() {
    const total = TURNOS.length, oc = citasDe(fSel).length, libres = Math.max(0, total - oc);
    const set = (x, v) => { const e = id(x); if (e) e.textContent = v; };
    set("dispoBadge", conectado ? `${libres} cupos libres` : "— cupos");
    const f = id("dispoFill"); if (f) f.style.width = (oc/total*100) + "%";
    set("dispoLibres", `${libres} libres`); set("dispoOcupados", `${oc} reservados`);
  }
  function renderStatus() {
    if (!conectado) return;
    const m = id("bkStatusM"), dt = id("bkStatusDot"); if (!m) return;
    const d = nowVE(), h = d.getHours();
    if (d.getDay() === 0 || h < 11 || h > 23) { m.textContent = "Cerrado ahora"; m.className = "booking__status-m"; dt.className = "status-dot"; return; }
    const slot = TURNOS[Math.min(h - 11, TURNOS.length - 1)];
    if (ocupado(fmt(d), slot)) { m.textContent = "En servicio · turno ocupado"; m.className = "booking__status-m dorado"; dt.className = "status-dot dorado"; }
    else { m.textContent = "Disponible ahora"; m.className = "booking__status-m verde"; dt.className = "status-dot verde"; }
  }
  function renderResumen() {
    const r = id("resumen"), txt = id("resumenTxt"); if (!r) return;
    const svc = SERVICIOS[svcSel];
    id("resumenTotal").textContent = usd(svc.precio);
    id("stepDia")?.classList.toggle("done", !!fSel);
    id("stepHora")?.classList.toggle("done", !!hSel);
    id("stepSvc")?.classList.add("done");
    id("stepNombre")?.classList.toggle("done", id("nombreCli").value.trim().length > 2);
    if (fSel && hSel) { const s = semana.find(x => x.fecha === fSel); txt.innerHTML = `${s.dow} ${s.num} ${s.mes} · <em>${hSel}</em> · ${svc.nombre}`; r.style.opacity = "1"; }
    else { txt.textContent = "Selecciona día y hora"; r.style.opacity = "0.5"; }
    validar();
  }
  function validar() { const b = id("btnConfirmar"); if (b) b.disabled = enviando || !(conectado && fSel && hSel && id("nombreCli").value.trim().length > 2); }

  async function reservar() {
    if (enviando) return;
    const nombre = id("nombreCli").value.trim(), svc = SERVICIOS[svcSel], btn = id("btnConfirmar");
    enviando = true; btn.disabled = true;
    const lbl = btn.querySelector(".btn__text > i"); const prev = lbl ? lbl.textContent : btn.textContent;
    if (lbl) lbl.innerHTML = '<span class="spinner dark"></span>Registrando…'; else btn.innerHTML = '<span class="spinner dark"></span>Registrando…';
    const docId = `${fSel}_${hSel.replace(' ','')}`;
    try {
      await fs.runTransaction(db, async (tx) => {
        const ref = fs.doc(db, CITAS, docId);
        const snap = await tx.get(ref);
        if (snap.exists()) throw { code: "ocupado" };
        tx.set(ref, { nombre, fecha: fSel, hora: hSel, servicio: svc.nombre, precio: svc.precio, creado: fs.serverTimestamp() });
      });
      abrirExito(nombre, svc); showToast("◆ Reserva registrada");
    } catch (e) {
      if (e && e.code === "ocupado") { showToast("✕ Ese turno acaba de ocuparse", true); hSel = ""; renderHoras(); renderResumen(); }
      else { console.error(e); showToast("✕ Error de conexión, intenta de nuevo", true); }
    } finally {
      enviando = false;
      if (lbl) lbl.textContent = prev; else btn.textContent = prev;
      validar();
    }
  }
  function abrirExito(nombre, svc) {
    const s = semana.find(x => x.fecha === fSel);
    const safe = document.createElement("div"); safe.textContent = nombre;
    id("successDet").innerHTML = `👤 ${safe.innerHTML}<br>📅 <em>${s.dow} ${s.num} ${s.mes}</em> · 🕐 <em>${hSel}</em><br>💈 ${svc.nombre} — <em>${usd(svc.precio)}</em>`;
    const [y,m,d] = fSel.split("-");
    const msg = `¡Hola Chichi Barber! 💈 Reservé mi turno:\n\n👤 ${nombre}\n📅 ${d}/${m}/${y}\n🕐 ${hSel}\n✂️ ${svc.nombre} (${usd(svc.precio)})\n\nAdjunto comprobante de Pago Móvil.`;
    id("btnWaComprobante").href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
    id("successModal").classList.add("open");
  }
  function cerrarExito() { id("successModal").classList.remove("open"); hSel = ""; id("nombreCli").value = ""; renderAll(); }

  id("btnConfirmar").onclick = reservar;
  id("nombreCli").oninput = renderResumen;
  id("successClose").onclick = cerrarExito;
  id("successModal").addEventListener("click", (e) => { if (e.target.id === "successModal") cerrarExito(); });
  $$(".svc-opt").forEach((o) => o.onclick = () => { $$(".svc-opt").forEach(x => x.classList.remove("is-sel")); o.classList.add("is-sel"); svcSel = o.dataset.svc; renderResumen(); });

  buildSemana(); renderAll(); conectar();
  setInterval(() => { renderHoras(); renderStatus(); }, 60000);
})();
