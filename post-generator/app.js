// Generatore dei post risultati (area admin → /admin/post)
// Interfaccia in JavaScript "vanilla": viene montata dentro il contenitore della pagina React
// e smontata quando si cambia pagina (tutti i listener globali vengono rimossi).
import { render, clampPhoto, coverScale, fonts, LAYOUT, W } from "./render.js";

/**
 * @param {HTMLElement} root contenitore con il markup di ./markup.js
 * @returns {() => void} funzione di pulizia
 */
export function mount(root) {
  const listeners = [];
  const on = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    listeners.push([target, event, handler, options]);
  };
  const $ = (s, el = root) => el.querySelector(s);
  const $$ = (s, el = root) => [...el.querySelectorAll(s)];



  const canvas = $("#canvas");
  const ctx = canvas.getContext("2d");

  const VBSM_LOGO = "/api/post/assets/loghi/vbsm.png";
  const RECENT_DAYS = 21;
  const ICON = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>',
    away: '<svg viewBox="0 0 24 24"><path d="M3 12h13M12 7l5 5-5 5M20 4v16"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    link: '<svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
  };

  let config = null;
  let matches = [];
  let matchesLoading = true;
  const assets = {};
  const imageCache = new Map();

  /**
   * Stato del post. I parziali sono salvati come [punti VBSM, punti avversari]:
   * a sinistra va chi gioca in casa, quindi "casa/trasferta" decide solo l'ordine.
   */
  const post = {
    squadraIdx: -1,
    lato: "casa",
    categoria: "",
    genere: "femminile",
    vbsmLines: ["VBSM"],
    sponsorId: "",
    sponsorScale: 1,
    matchId: null,
    manual: false,
    date: null,
    opp: { name: "", lines: [], entry: null, logoSrc: null, logo: null, scale: 1, apiLogo: null },
    sets: [],
    photo: null,
  };
  let vbsmLogo = null;

  // ---------------------------------------------------------------------------
  // Utilità
  // ---------------------------------------------------------------------------

  function toast(msg, err = false, ms = 3500) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("err", err);
    t.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => t.classList.remove("show"), ms);
  }

  function loadImage(src) {
    if (!src) return Promise.resolve(null);
    if (imageCache.has(src)) return imageCache.get(src);
    const p = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        imageCache.delete(src);
        resolve(null);
      };
      img.src = src;
    });
    imageCache.set(src, p);
    return p;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function api(path, options = {}) {
    const res = await fetch(path, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Errore ${res.status}`);
    return data;
  }

  const postJson = (path, body) =>
    api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const saveConfig = () =>
    api("/api/post/config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });

  const norm = (s) => (s || "").toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  /** La parola chiave compare nel testo come parola intera? ("OCL" sì in "OCL LAVANDERIA", no in "SOCLE") */
  function hasKeyword(text, kw) {
    const k = norm(kw);
    if (!k) return false;
    return new RegExp(`(^|[^A-Z0-9])${escapeRe(k)}([^A-Z0-9]|$)`).test(norm(text));
  }

  const vbsmTeamOf = (m) => (m.home_team.is_vbsm ? m.home_team : m.away_team);
  const oppTeamOf = (m) => (m.home_team.is_vbsm ? m.away_team : m.home_team);

  /**
   * A quale squadra VBSM appartiene una partita:
   * 1. abbinamento fatto a mano (campionato + nome FIPAV della squadra)
   * 2. parole chiave sul nome della squadra
   * 3. parole chiave sul nome del campionato
   */
  function squadraOf(m) {
    const title = norm(vbsmTeamOf(m).title);
    const camp = norm(m.campionato);
    const manual = config.squadre.findIndex((s) =>
      (s.abbinamenti || []).some((a) => norm(a.campionato) === camp && (!a.squadra || norm(a.squadra) === title))
    );
    if (manual >= 0) return manual;
    const byName = config.squadre.findIndex((s) => (s.cerca || []).some((kw) => hasKeyword(title, kw)));
    if (byName >= 0) return byName;
    return config.squadre.findIndex((s) => (s.cerca || []).some((kw) => hasKeyword(camp, kw)));
  }

  /** Squadra avversaria in archivio: prima nome identico, poi l'alias più lungo contenuto nel nome */
  function findAvversario(name) {
    const n = norm(name);
    if (!n) return null;
    const exact = config.avversari.find((a) => [a.nome, ...(a.alias || [])].some((x) => norm(x) === n));
    if (exact) return exact;
    let best = null;
    for (const a of config.avversari) {
      for (const al of a.alias || []) {
        const k = norm(al);
        if (k.length >= 3 && hasKeyword(n, al) && (!best || k.length > best.len)) best = { a, len: k.length };
      }
    }
    return best?.a || null;
  }

  function logoForTeam(team) {
    const entry = findAvversario(team.title);
    if (entry?.logo) return entry.logo;
    return team.logo ? `/api/post/img?url=${encodeURIComponent(team.logo)}` : null;
  }

  function deriveCategoria(campionato) {
    const t = norm(campionato);
    const genere = /FEMM/.test(t) ? "FEMMINILE" : /MASCH/.test(t) ? "MASCHILE" : /MISTO/.test(t) ? "MISTO" : "";
    if (/MISTO/.test(t) && /CSI/.test(t)) return "MISTO CSI";
    const u = t.match(/(?:UNDER|\bU)\s*-?\s*(\d{1,2})\b/);
    if (u) return `UNDER ${u[1]} ${genere}`.trim();
    return t.replace(/\s*-?\s*(GIRONE|GIR\.|FASE|POOL)\b.*$/, "").trim() || t;
  }

  /** "HERON VOLLEY" → ["HERON", "VOLLEY"]: due righe il più possibile bilanciate */
  function splitName(title) {
    const words = norm(title).split(" ").filter(Boolean);
    if (words.length <= 1) return words;
    if (words.at(-1) === "VBSM") return [words.slice(0, -1).join(" "), "VBSM"];
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(" ");
      const b = words.slice(i).join(" ");
      const score = Math.max(a.length, b.length);
      if (!best || score < best.score) best = { score, lines: [a, b] };
    }
    return best.lines;
  }

  function wins() {
    let v = 0, o = 0;
    for (const [a, b] of post.sets) {
      if (a === "" || b === "" || a == null || b == null) continue;
      if (+a > +b) v++;
      else if (+b > +a) o++;
    }
    return [v, o];
  }

  const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const WEEKDAYS = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];

  // ---------------------------------------------------------------------------
  // Disegno
  // ---------------------------------------------------------------------------

  let raf = 0;
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(drawNow);
  }

  function drawNow() {
    if (!config) return;
    const [v, o] = wins();
    const sets = post.sets.filter(([a, b]) => a !== "" || b !== "");
    const vbsm = { score: v, lines: post.vbsmLines, logo: vbsmLogo, logoScale: 1 };
    const opp = { score: o, lines: post.opp.lines, logo: post.opp.logo, logoScale: post.opp.scale };
    const casa = post.lato === "casa";
    const sponsor = config.sponsor.find((s) => s.id === post.sponsorId);
    render(
      ctx,
      {
        accent: config.colori[post.genere] || "#5E17EB",
        genere: post.genere,
        categoria: post.categoria,
        photo: post.photo,
        home: casa ? vbsm : opp,
        away: casa ? opp : vbsm,
        sets: casa ? sets : sets.map(([a, b]) => [b, a]),
        sponsor: sponsor ? { img: assets.sponsor, larghezza: sponsor.larghezza, scale: post.sponsorScale } : null,
      },
      assets
    );
    updateProgress();
  }

  function updateProgress() {
    const [v, o] = wins();
    $("#scoreLabel").innerHTML = `<span>${v}</span><em>–</em><span>${o}</span>`;
    $("#stepTeam").classList.toggle("done", post.squadraIdx >= 0);
    $("#stepMatch").classList.toggle("done", Boolean(post.matchId || post.manual));
    $("#stepOpp").classList.toggle("done", Boolean(post.opp.name) && v + o > 0);
    $("#stepPhoto").classList.toggle("done", Boolean(post.photo));
    $("#fileHint").textContent = post.squadraIdx >= 0 || post.opp.name ? `${fileName()}.png` : "";
    $$("#setsGrid input").forEach((inp) => {
      const [a, b] = post.sets[+inp.dataset.i] || [];
      const mine = inp.dataset.s === "0" ? a : b;
      const other = inp.dataset.s === "0" ? b : a;
      inp.classList.toggle("win", mine !== "" && other !== "" && +mine > +other);
    });
  }

  function applyAccent() {
    root.style.setProperty("--accent", config.colori[post.genere]);
    root.classList.toggle("maschile", post.genere === "maschile");
  }

  // ---------------------------------------------------------------------------
  // 1. Squadra VBSM
  // ---------------------------------------------------------------------------

  function renderTeams() {
    const grid = $("#teamGrid");
    grid.innerHTML = "";
    config.squadre.forEach((s, i) => {
      const color = config.colori[s.genere] || config.colori.femminile;
      const sponsor = config.sponsor.find((x) => x.id === s.sponsor);
      const short = s.nome.replace(/femminile/i, "F").replace(/maschile/i, "M");
      const tile = document.createElement("button");
      tile.className = `team-tile${i === post.squadraIdx ? " on" : ""}`;
      tile.style.setProperty("--tile-color", color);
      tile.innerHTML = `<i class="tt-bar" style="background:${color}"></i>
        <span class="tt-name">${esc(short)}</span>
        <span class="tt-sub">${esc(sponsor?.nome || s.nomeSquadra?.split("\n")[0] || "")}</span>`;
      tile.title = s.nome;
      tile.onclick = () => {
        if (i === post.squadraIdx) return;
        resetMatch();
        applySquadra(i);
      };
      grid.appendChild(tile);
    });
    const add = document.createElement("button");
    add.className = "team-tile add";
    add.innerHTML = `${ICON.plus} Nuova`;
    add.onclick = newSquadra;
    grid.appendChild(add);
  }

  function fillSponsorSelect() {
    $("#sponsor").innerHTML =
      `<option value="">Nessuno sponsor</option>` + config.sponsor.map((s) => `<option value="${s.id}">${esc(s.nome)}</option>`).join("");
    $("#sponsor").value = post.sponsorId;
  }

  function renderTeamCard() {
    const s = config.sponsor.find((x) => x.id === post.sponsorId);
    const has = post.squadraIdx >= 0 || post.categoria;
    $("#tcTitle").textContent = has ? post.categoria || "—" : "Scegli la squadra";
    $("#tcSub").textContent = has
      ? `${post.vbsmLines.join(" ")} · ${s ? s.nome : "nessuno sponsor"}`
      : "Campionato, nome, colore e sponsor si compilano da soli";
    $("#tcSponsor").innerHTML = s ? `<img src="${s.file}" alt="">` : "";
    $("#toggleDetails").hidden = !has;
  }

  function fillVbsmForm() {
    $$("#lato button").forEach((b) => b.classList.toggle("on", b.dataset.v === post.lato));
    $("#categoria").value = post.categoria;
    $("#vbsmLines").value = post.vbsmLines.join("\n");
    $$("#genere button").forEach((b) => b.classList.toggle("on", b.dataset.v === post.genere));
    $("#sponsor").value = post.sponsorId;
    $("#sponsorScale").value = Math.round(post.sponsorScale * 100);
    renderTeamCard();
    applyAccent();
  }

  async function setSponsor(id) {
    post.sponsorId = id;
    const s = config.sponsor.find((x) => x.id === id);
    assets.sponsor = s ? await loadImage(s.file) : null;
    $("#sponsor").value = id;
    renderTeamCard();
    draw();
  }

  function applySquadra(idx) {
    post.squadraIdx = idx;
    const s = config.squadre[idx];
    if (s) {
      post.categoria = s.categoria || s.nome.toUpperCase();
      post.genere = s.genere || "femminile";
      post.vbsmLines = (s.nomeSquadra || "VBSM").split("\n");
      post.sponsorScale = s.sponsorScala || 1;
      setSponsor(s.sponsor || "");
    }
    renderTeams();
    fillVbsmForm();
    renderMatches();
    draw();
  }

  async function newSquadra() {
    const nome = prompt("Nome della nuova squadra (es. Under 16 Femminile):");
    if (!nome) return;
    config.squadre.push({
      nome,
      cerca: [],
      categoria: nome.toUpperCase(),
      genere: /MASCH|MISTO/i.test(nome) ? "maschile" : "femminile",
      nomeSquadra: "VBSM",
      sponsor: "",
    });
    await saveConfig().catch((err) => toast(err.message, true));
    resetMatch();
    applySquadra(config.squadre.length - 1);
    $("#vbsmDetails").hidden = false;
    $("#toggleDetails").classList.add("on");
    toast("Squadra creata: completa nome e sponsor, poi abbina il suo campionato");
  }

  $$("#lato button").forEach((b) => {
    b.onclick = () => {
      post.lato = b.dataset.v;
      fillVbsmForm();
      draw();
    };
  });

  $("#toggleDetails").onclick = () => {
    const d = $("#vbsmDetails");
    d.hidden = !d.hidden;
    $("#toggleDetails").classList.toggle("on", !d.hidden);
  };
  $("#categoria").oninput = (e) => {
    post.categoria = e.target.value;
    renderTeamCard();
    draw();
  };
  $("#vbsmLines").oninput = (e) => {
    post.vbsmLines = e.target.value.split("\n").slice(0, 2);
    renderTeamCard();
    draw();
  };
  $$("#genere button").forEach((b) => {
    b.onclick = () => {
      post.genere = b.dataset.v;
      fillVbsmForm();
      draw();
    };
  });
  $("#sponsor").onchange = (e) => setSponsor(e.target.value);
  $("#sponsorScale").oninput = (e) => {
    post.sponsorScale = +e.target.value / 100;
    draw();
  };
  // ---------------------------------------------------------------------------
  // Editor immagine per sponsor e loghi: ritaglia i bordi trasparenti e,
  // se serve, aggiunge uno sfondo con margine e angoli arrotondati
  // ---------------------------------------------------------------------------

  class LogoEditor {
    constructor(root, onChange) {
      this.root = root;
      this.onChange = onChange;
      this.img = null;
      this.preview = $(".bg-preview", root);
      this.on = $(".bg-on", root);
      this.color = $(".bg-color", root);
      this.pad = $(".bg-pad", root);
      this.radius = $(".bg-radius", root);
      for (const el of [this.on, this.color, this.pad, this.radius]) on(el, "input", () => this.update());
    }

    reset() {
      this.img = null;
      this.on.checked = false;
      this.color.value = "#ffffff";
      this.pad.value = 12;
      this.radius.value = 10;
      this.root.hidden = true;
    }

    async load(src) {
      const img = await loadImage(src);
      if (!img) return false;
      this.img = trimTransparent(img);
      // logo scuro (si vedrebbe poco sul nero del post): sfondo attivato in automatico
      this.on.checked = isMostlyDark(this.img);
      this.root.hidden = false;
      this.update();
      return true;
    }

    /** Immagine finale (canvas) con l'eventuale sfondo */
    compose() {
      const src = this.img;
      if (!this.on.checked) return src;
      const pad = Math.round((Math.max(src.width, src.height) * +this.pad.value) / 100);
      const w = src.width + pad * 2;
      const h = src.height + pad * 2;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const g = c.getContext("2d");
      const r = (Math.min(w, h) / 2) * (+this.radius.value / 50);
      g.fillStyle = this.color.value;
      g.beginPath();
      g.roundRect(0, 0, w, h, r);
      g.fill();
      g.drawImage(src, pad, pad);
      return c;
    }

    update() {
      $(".bg-controls", this.root).classList.toggle("off", !this.on.checked);
      if (!this.img) return;
      const out = this.compose();
      const pv = this.preview;
      const g = pv.getContext("2d");
      g.clearRect(0, 0, pv.width, pv.height);
      const k = Math.min((pv.width * 0.6) / out.width, (pv.height * 0.7) / out.height);
      g.imageSmoothingQuality = "high";
      g.drawImage(out, (pv.width - out.width * k) / 2, (pv.height - out.height * k) / 2, out.width * k, out.height * k);
      this.onChange?.();
    }

    dataUrl() {
      const out = this.compose();
      if (out instanceof HTMLCanvasElement) return out.toDataURL("image/png");
      const c = document.createElement("canvas");
      c.width = out.width;
      c.height = out.height;
      c.getContext("2d").drawImage(out, 0, 0);
      return c.toDataURL("image/png");
    }
  }

  /** Toglie i bordi completamente trasparenti */
  function trimTransparent(img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const { data, width, height } = g.getImageData(0, 0, c.width, c.height);
    let x0 = width, y0 = height, x1 = -1, y1 = -1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 8) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0 || (x0 === 0 && y0 === 0 && x1 === width - 1 && y1 === height - 1)) return c;
    const t = document.createElement("canvas");
    t.width = x1 - x0 + 1;
    t.height = y1 - y0 + 1;
    t.getContext("2d").drawImage(c, -x0, -y0);
    return t;
  }

  /** I pixel visibili sono quasi tutti scuri? (es. logo nero su trasparente) */
  function isMostlyDark(c) {
    const s = document.createElement("canvas");
    const k = Math.min(1, 120 / Math.max(c.width, c.height));
    s.width = Math.max(1, Math.round(c.width * k));
    s.height = Math.max(1, Math.round(c.height * k));
    const g = s.getContext("2d");
    g.drawImage(c, 0, 0, s.width, s.height);
    const d = g.getImageData(0, 0, s.width, s.height).data;
    let n = 0, dark = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 128) continue;
      n++;
      if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < 70) dark++;
    }
    return n > 0 && dark / n > 0.6;
  }

  // --- nuovo sponsor (file, trascinamento o Ctrl+V) ---
  let sponsorData = null;
  const sponsorEditor = new LogoEditor($("#sponsorEditor"));

  function openSponsorDlg() {
    sponsorData = null;
    sponsorEditor.reset();
    $("#sponsorName").value = "";
    $("#sponsorPreview").src = "";
    $("#sponsorHint").textContent = "PNG con sfondo trasparente, se possibile";
    const squadra = config.squadre[post.squadraIdx];
    $("#sponsorAssign").closest(".check-row").hidden = !squadra;
    $("#sponsorTeamName").textContent = squadra?.nome || "";
    if (!$("#sponsorDlg").open) $("#sponsorDlg").showModal();
    $("#sponsorName").focus();
  }

  async function pickSponsorFile(file, label) {
    if (!file?.type.startsWith("image/")) return;
    sponsorData = await readFileAsDataUrl(file);
    $("#sponsorPreview").src = sponsorData;
    $("#sponsorHint").textContent = label || file.name;
    if (!(await sponsorEditor.load(sponsorData))) return toast("Immagine non valida", true);
    if (sponsorEditor.on.checked) toast("Sponsor scuro: ho attivato lo sfondo, regolalo o toglilo");
    if (!$("#sponsorName").value && file.name && !/^image\./i.test(file.name)) {
      $("#sponsorName").value = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    }
  }

  $("#uploadSponsor").onclick = openSponsorDlg;
  $("#sponsorInput").onchange = (e) => {
    pickSponsorFile(e.target.files[0]);
    e.target.value = "";
  };
  const sponsorDrop = $("#sponsorInput").closest(".drop");
  on(sponsorDrop, "dragover", (e) => e.preventDefault());
  on(sponsorDrop, "drop", (e) => {
    e.preventDefault();
    pickSponsorFile(e.dataTransfer.files[0]);
  });
  $("#sponsorCancel").onclick = () => $("#sponsorDlg").close();

  $("#sponsorForm").onsubmit = async (e) => {
    e.preventDefault();
    const nome = $("#sponsorName").value.trim();
    if (!nome) return;
    if (!sponsorData) return toast("Aggiungi l'immagine dello sponsor (anche con Ctrl+V)", true);
    $("#sponsorOk").disabled = true;
    try {
      const { file: saved } = await postJson("/api/post/carica", { tipo: "sponsor", nome, dataUrl: sponsorEditor.dataUrl() });
      const id = `${norm(nome).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
      config.sponsor.push({ id, nome, file: saved, larghezza: 240 });
      const squadra = config.squadre[post.squadraIdx];
      if (squadra && $("#sponsorAssign").checked) squadra.sponsor = id;
      await saveConfig();
      $("#sponsorDlg").close();
      fillSponsorSelect();
      renderTeams();
      await setSponsor(id);
      toast(squadra && $("#sponsorAssign").checked ? `${nome} è ora lo sponsor di ${squadra.nome}` : `Sponsor "${nome}" aggiunto`);
    } catch (err) {
      toast(`Sponsor non salvato: ${err.message}`, true);
    } finally {
      $("#sponsorOk").disabled = false;
    }
  };

  $("#saveDefaults").onclick = async () => {
    let s = config.squadre[post.squadraIdx];
    if (!s) {
      const nome = prompt("Nome della squadra (es. Under 16 Femminile):", post.categoria);
      if (!nome) return;
      s = { nome, cerca: [] };
      config.squadre.push(s);
      post.squadraIdx = config.squadre.length - 1;
    }
    Object.assign(s, {
      categoria: post.categoria,
      genere: post.genere,
      nomeSquadra: post.vbsmLines.join("\n"),
      sponsor: post.sponsorId,
      sponsorScala: post.sponsorScale !== 1 ? post.sponsorScale : undefined,
    });
    try {
      await saveConfig();
      renderTeams();
      renderMatches();
      toast(`Salvato: "${s.nome}" userà sempre questi dati`);
    } catch (err) {
      toast(`Non salvato: ${err.message}`, true);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. Partite
  // ---------------------------------------------------------------------------

  function matchCard(m) {
    const casa = m.home_team.is_vbsm;
    const opp = oppTeamOf(m);
    const [v, o] = casa ? [m.home_setwin, m.away_setwin] : [m.away_setwin, m.home_setwin];
    const [y, mo, d] = m.date.split("-").map(Number);
    const wd = WEEKDAYS[new Date(y, mo - 1, d).getDay()];
    const logo = logoForTeam(opp);
    const squadra = post.squadraIdx >= 0 ? "" : config.squadre[squadraOf(m)]?.nome || deriveCategoria(m.campionato);
    const el = document.createElement("button");
    el.className = `match${m.id === post.matchId ? " active" : ""}`;
    el.dataset.id = m.id;
    el.innerHTML = `
      <div class="m-date"><b>${d}</b><span>${MONTHS[mo - 1]}</span></div>
      <div class="m-logo">${logo ? `<img src="${logo}" alt="" onerror="this.remove()">` : ICON.shield}</div>
      <div class="m-main">
        <div class="m-opp">${esc(opp.title)}</div>
        <div class="m-meta">${casa ? ICON.home : ICON.away}${casa ? "Casa" : "Trasferta"} · ${wd}${m.time ? ` ${m.time}` : ""}${squadra ? ` · ${esc(squadra)}` : ""}</div>
      </div>
      <div class="m-res"><span class="m-score">${v}-${o}</span><span class="m-wl ${v > o ? "w" : "l"}">${v > o ? "V" : "P"}</span></div>`;
    el.onclick = () => selectMatch(m);
    return el;
  }

  function renderMatches() {
    const box = $("#matches");
    if (!config) return;
    box.innerHTML = "";
    if (matchesLoading && !matches.length) {
      box.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
      return;
    }
    const idx = post.squadraIdx;
    $("#champLink").hidden = idx < 0 || !matches.length;
    const limit = new Date(Date.now() - RECENT_DAYS * 864e5).toISOString().slice(0, 10);
    const list = matches.filter((m) => m.played && (idx >= 0 ? squadraOf(m) === idx : m.date >= limit));

    if (!list.length) {
      const s = config.squadre[idx];
      const empty = document.createElement("div");
      empty.className = "empty";
      if (!matches.length) empty.innerHTML = "Nessun risultato scaricato.<br>Puoi inserire la partita a mano.";
      else if (!s) empty.textContent = `Nessuna partita negli ultimi ${RECENT_DAYS} giorni. Scegli una squadra per vedere tutta la stagione.`;
      else {
        empty.innerHTML = `Nessuna gara trovata per <b>${esc(s.nome)}</b>.<br>Se nei risultati il campionato ha un altro nome, abbinalo:`;
        const b = document.createElement("button");
        b.className = "btn accent-outline";
        b.innerHTML = `${ICON.link} Abbina campionato`;
        b.onclick = openChampDialog;
        empty.appendChild(b);
      }
      box.appendChild(empty);
      return;
    }
    list.forEach((m) => box.appendChild(matchCard(m)));
  }

  async function loadMatches(force = false) {
    const status = $("#matchesStatus");
    status.classList.remove("err");
    status.textContent = "Carico i risultati…";
    matchesLoading = true;
    renderMatches();
    $("#refresh").disabled = true;
    $("#refresh").classList.add("spin");
    try {
      // Risposta di /api/fipav: { "nome campionato": [partite VBSM normalizzate] }
      const data = await api("/api/fipav", { cache: force ? "reload" : "no-store" });
      matches = Object.entries(data)
        .flatMap(([campionato, list]) =>
          (list || []).map((m) => ({
            id: `${campionato}|${m.id}`,
            campionato,
            date: m.date,
            time: m.time,
            played: Boolean(m.played),
            home_setwin: m.home_setwin,
            away_setwin: m.away_setwin,
            sets: (m.sets || []).map((x) => String(x).split("-").map((n) => Number(n.trim()))),
            home_team: m.home_team,
            away_team: m.away_team,
          }))
        )
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
      const when = new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
      status.textContent = `${matches.length} gare · aggiornato alle ${when}`;
    } catch (err) {
      status.textContent = `Risultati non disponibili: ${err.message}`;
      status.classList.add("err");
    } finally {
      matchesLoading = false;
      renderMatches();
      $("#refresh").disabled = false;
      $("#refresh").classList.remove("spin");
    }
  }

  async function selectMatch(m) {
    const idx = squadraOf(m);
    if (idx >= 0 && idx !== post.squadraIdx) applySquadra(idx);
    else if (idx < 0 && post.squadraIdx < 0) {
      post.categoria = deriveCategoria(m.campionato);
      post.genere = /FEMM/.test(norm(m.campionato)) ? "femminile" : "maschile";
      post.vbsmLines = splitName(vbsmTeamOf(m).title);
    }
    post.matchId = m.id;
    post.manual = false;
    igCaptionEdited = false;
    post.date = m.date;
    post.lato = m.home_team.is_vbsm ? "casa" : "fuori";
    const opp = oppTeamOf(m);
    post.sets = m.sets.map(([h, a]) => (post.lato === "casa" ? [h, a] : [a, h]));
    fillVbsmForm();
    renderSets();
    await setOpponent(opp.title, opp.logo);
    $$(".match").forEach((el) => el.classList.toggle("active", el.dataset.id === m.id));
  }

  /** Cambiando squadra si riparte da zero con partita e avversario */
  function resetMatch() {
    post.matchId = null;
    post.manual = false;
    post.date = null;
    post.sets = [];
    renderSets();
    setOpponent("", null);
  }

  $("#manual").onclick = () => {
    post.matchId = null;
    post.manual = true;
    post.date = new Date().toISOString().slice(0, 10);
    post.sets = [["", ""], ["", ""], ["", ""]];
    renderSets();
    setOpponent("", null);
    $$(".match").forEach((el) => el.classList.remove("active"));
    $("#stepOpp").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("#oppName").focus(), 300);
  };

  $("#refresh").onclick = () => loadMatches(true);

  // --- abbinamento squadra ↔ campionato scaricato ---

  function championshipGroups() {
    const groups = new Map();
    for (const m of matches) {
      const squadra = vbsmTeamOf(m).title;
      const key = `${norm(m.campionato)}|${norm(squadra)}`;
      if (!groups.has(key)) groups.set(key, { campionato: m.campionato, squadra, gare: 0, giocate: 0, m });
      const g = groups.get(key);
      g.gare++;
      if (m.played) g.giocate++;
    }
    // prima i campionati ancora senza squadra, poi gli altri
    return [...groups.values()].sort((a, b) => (squadraOf(a.m) >= 0) - (squadraOf(b.m) >= 0) || a.campionato.localeCompare(b.campionato));
  }

  function openChampDialog() {
    const s = config.squadre[post.squadraIdx];
    if (!s) return toast("Scegli prima la squadra VBSM", true);
    $("#champFor").textContent = `Scegli il campionato di ${s.nome}: le sue gare verranno riconosciute sempre da qui in poi.`;
    $("#champSearch").value = "";
    renderChampList();
    $("#champDlg").showModal();
    $("#champSearch").focus();
  }

  function renderChampList() {
    const q = norm($("#champSearch").value);
    const box = $("#champList");
    box.innerHTML = "";
    const list = championshipGroups().filter((g) => !q || norm(`${g.campionato} ${g.squadra}`).includes(q));
    if (!list.length) box.innerHTML = '<div class="empty">Nessun campionato trovato.</div>';
    for (const g of list) {
      const owner = config.squadre[squadraOf(g.m)];
      const mine = owner && owner === config.squadre[post.squadraIdx];
      const el = document.createElement("button");
      el.className = `champ${mine ? " on" : ""}`;
      el.innerHTML = `<b>${esc(g.campionato)}</b><span class="c-count">${g.giocate} ${g.giocate === 1 ? "giocata" : "giocate"}<br>${
        owner ? `<span class="${mine ? "" : "c-owner"}">${esc(owner.nome)}</span>` : "non abbinato"
      }</span><span>${esc(g.squadra)}</span>`;
      el.onclick = () => assignChampionship(g);
      box.appendChild(el);
    }
  }

  async function assignChampionship(g) {
    const s = config.squadre[post.squadraIdx];
    const camp = norm(g.campionato);
    const sq = norm(g.squadra);
    // lo stesso campionato non può appartenere a due squadre
    for (const other of config.squadre) {
      other.abbinamenti = (other.abbinamenti || []).filter((a) => !(norm(a.campionato) === camp && (!a.squadra || norm(a.squadra) === sq)));
    }
    s.abbinamenti = [...(s.abbinamenti || []), { campionato: g.campionato, squadra: g.squadra }];
    try {
      await saveConfig();
      $("#champDlg").close();
      renderMatches();
      toast(`${g.campionato} abbinato a ${s.nome}`);
    } catch (err) {
      toast(`Abbinamento non salvato: ${err.message}`, true);
    }
  }

  $("#champLink").onclick = openChampDialog;
  $("#champSearch").oninput = renderChampList;
  $("#champClose").onclick = () => $("#champDlg").close();

  // ---------------------------------------------------------------------------
  // 3. Avversario: archivio squadre con loghi e nomi alternativi
  // ---------------------------------------------------------------------------

  async function setOpponent(name, apiLogo = null) {
    post.opp.name = name;
    post.opp.apiLogo = apiLogo;
    post.opp.lines = splitName(name);
    $("#oppName").value = name;
    $("#oppLines").value = post.opp.lines.join("\n");
    await refreshOpponentLogo();
  }

  async function refreshOpponentLogo() {
    const entry = findAvversario(post.opp.name);
    post.opp.entry = entry;
    post.opp.scale = entry?.scala || 1;
    $("#oppScale").value = Math.round(post.opp.scale * 100);
    const src = entry?.logo || (post.opp.apiLogo ? `/api/post/img?url=${encodeURIComponent(post.opp.apiLogo)}` : null);
    post.opp.logoSrc = src;
    post.opp.logo = await loadImage(src);
    const shown = post.opp.logo ? src : "";
    $("#oppLogo").src = shown;
    $("#setsOppLogo").src = shown;
    $("#setsOppName").textContent = post.opp.lines.join(" ") || "Avversari";

    const st = $("#oppStatus");
    if (!post.opp.name) {
      st.className = "badge";
      st.textContent = "Scegli una partita o scrivi il nome";
    } else if (entry) {
      st.className = "badge ok";
      st.textContent = `In archivio · ${entry.nome}`;
    } else if (post.opp.logo) {
      st.className = "badge warn";
      st.textContent = "Non in archivio · logo dai risultati";
    } else {
      st.className = "badge warn";
      st.textContent = "Non in archivio · senza logo";
    }
    $("#oppLink").lastChild.textContent = entry ? "Cambia squadra" : "Cerca nell'archivio";
    draw();
  }

  let oppTimer = 0;
  $("#oppName").oninput = (e) => {
    post.opp.name = e.target.value;
    post.opp.apiLogo = null;
    post.opp.lines = splitName(e.target.value);
    $("#oppLines").value = post.opp.lines.join("\n");
    $("#setsOppName").textContent = post.opp.lines.join(" ") || "Avversari";
    draw();
    clearTimeout(oppTimer);
    oppTimer = setTimeout(refreshOpponentLogo, 250);
  };
  $("#oppLines").oninput = (e) => {
    post.opp.lines = e.target.value.split("\n").slice(0, 2);
    draw();
  };
  $("#oppScale").oninput = (e) => {
    post.opp.scale = +e.target.value / 100;
    draw();
  };
  // a slider rilasciato la dimensione resta salvata per quella squadra
  $("#oppScale").onchange = () => {
    if (!post.opp.entry) return;
    post.opp.entry.scala = post.opp.scale;
    saveConfig().catch((err) => toast(`Dimensione non salvata: ${err.message}`, true));
  };

  function openArchive() {
    $("#archiveFor").textContent = post.opp.name
      ? `Scegli la squadra da collegare a "${norm(post.opp.name)}": la prossima volta verrà riconosciuta da sola.`
      : "Scegli una squadra dall'archivio.";
    $("#archiveSearch").value = "";
    renderArchive();
    $("#archive").showModal();
    $("#archiveSearch").focus();
  }

  function renderArchive() {
    const q = norm($("#archiveSearch").value);
    const grid = $("#archiveGrid");
    grid.innerHTML = "";
    const list = config.avversari
      .filter((a) => !q || norm(`${a.nome} ${(a.alias || []).join(" ")}`).includes(q))
      .sort((a, b) => a.nome.localeCompare(b.nome));
    if (!list.length) grid.innerHTML = '<div class="empty" style="grid-column:1/-1">Nessuna squadra trovata: creala con il pulsante qui sotto.</div>';
    for (const a of list) {
      const card = document.createElement("button");
      card.className = `logo-card${a === post.opp.entry ? " on" : ""}`;
      card.innerHTML = `<div class="thumb">${a.logo ? `<img src="${a.logo}" alt="">` : ICON.shield}</div><b>${esc(a.nome)}</b><span class="teams-of">${esc((a.alias || []).join(" · "))}</span>`;
      card.onclick = () => linkOpponent(a);
      grid.appendChild(card);
    }
  }

  /** Collega il nome attuale dell'avversario a una squadra dell'archivio (come nome alternativo) */
  async function linkOpponent(entry) {
    const key = norm(post.opp.name);
    $("#archive").close();
    if (!key) return setOpponent(entry.alias?.[0] || entry.nome.toUpperCase());
    for (const a of config.avversari) a.alias = (a.alias || []).filter((x) => norm(x) !== key);
    entry.alias = [key, ...(entry.alias || [])];
    try {
      await saveConfig();
      toast(`"${key}" collegata a ${entry.nome}`);
    } catch (err) {
      toast(`Collegamento non salvato: ${err.message}`, true);
    }
    await refreshOpponentLogo();
    renderMatches();
  }

  $("#oppLink").onclick = openArchive;
  $("#oppLogoBtn").onclick = openArchive;
  $("#archiveSearch").oninput = renderArchive;
  $("#archiveClose").onclick = () => $("#archive").close();
  $("#archiveNew").onclick = () => {
    $("#archive").close();
    openCreate();
  };
  $("#oppCreate").onclick = () => openCreate();

  // --- nuova squadra avversaria ---
  let createLogoData = null;
  const createEditor = new LogoEditor($("#createEditor"));

  function openCreate() {
    $("#createName").value = norm(post.opp.name).toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
    createLogoData = null;
    createEditor.reset();
    const current = post.opp.logo ? post.opp.logoSrc : "";
    $("#createPreview").src = current;
    if (current) createEditor.load(current);
    $("#createHint").textContent = current ? "Se non scegli un file, si salva il logo attuale" : "PNG con sfondo trasparente, se possibile";
    if (!$("#createDlg").open) $("#createDlg").showModal();
    $("#createName").focus();
  }

  async function pickCreateFile(file, label) {
    if (!file?.type.startsWith("image/")) return;
    createLogoData = await readFileAsDataUrl(file);
    $("#createPreview").src = createLogoData;
    $("#createHint").textContent = label || file.name;
    if (!(await createEditor.load(createLogoData))) return toast("Immagine non valida", true);
    if (createEditor.on.checked) toast("Logo scuro: ho attivato lo sfondo, regolalo o toglilo");
  }
  $("#createFile").onchange = (e) => pickCreateFile(e.target.files[0]);
  const createDrop = $("#createFile").closest(".drop");
  on(createDrop, "dragover", (e) => e.preventDefault());
  on(createDrop, "drop", (e) => {
    e.preventDefault();
    pickCreateFile(e.dataTransfer.files[0]);
  });
  $("#createCancel").onclick = () => $("#createDlg").close();

  $("#createForm").onsubmit = async (e) => {
    e.preventDefault();
    const nome = $("#createName").value.trim();
    if (!nome) return;
    $("#createOk").disabled = true;
    try {
      const data = createEditor.img ? createEditor.dataUrl() : null;
      const logo = data ? (await postJson("/api/post/carica", { tipo: "loghi", nome, dataUrl: data })).file : null;
      const key = norm(post.opp.name);
      for (const a of config.avversari) a.alias = (a.alias || []).filter((x) => norm(x) !== key);
      config.avversari.push({ nome, alias: [...new Set([key, norm(nome)].filter(Boolean))], logo });
      await saveConfig();
      $("#createDlg").close();
      if (!post.opp.name) await setOpponent(norm(nome));
      else await refreshOpponentLogo();
      renderMatches();
      toast(`${nome} aggiunta all'archivio`);
    } catch (err) {
      toast(`Non salvata: ${err.message}`, true);
    } finally {
      $("#createOk").disabled = false;
    }
  };

  // --- parziali ---
  function renderSets() {
    const grid = $("#setsGrid");
    $$(".sg-n, .sg-in", grid).forEach((el) => el.remove());
    post.sets.forEach(([a, b], i) => {
      const n = document.createElement("span");
      n.className = "sg-n";
      n.textContent = `${i + 1}° set`;
      grid.appendChild(n);
      [a, b].forEach((val, side) => {
        const inp = document.createElement("input");
        inp.type = "number";
        inp.min = 0;
        inp.max = 99;
        inp.value = val;
        inp.className = "sg-in";
        inp.dataset.i = i;
        inp.dataset.s = side;
        inp.oninput = () => {
          post.sets[i][side] = inp.value === "" ? "" : +inp.value;
          draw();
        };
        grid.appendChild(inp);
      });
    });
    draw();
  }
  $("#addSet").onclick = () => {
    if (post.sets.length >= 5) return;
    post.sets.push(["", ""]);
    renderSets();
    $$("#setsGrid input").at(-2)?.focus();
  };
  $("#removeSet").onclick = () => {
    post.sets.pop();
    renderSets();
  };

  // ---------------------------------------------------------------------------
  // 4. Foto: caricamento e inquadratura
  // ---------------------------------------------------------------------------

  async function setPhoto(file) {
    if (!file || !file.type.startsWith("image/")) return toast("Il file non è un'immagine", true);
    const url = URL.createObjectURL(file);
    const img = await loadImage(url);
    if (!img) return toast("Non riesco ad aprire questa immagine", true);
    const scale = coverScale(img);
    post.photo = clampPhoto({ img, scale, x: (LAYOUT.photo.w - img.width * scale) / 2, y: (LAYOUT.photo.h - img.height * scale) / 2 });
    $("#zoom").value = 100;
    $("#photoTools").hidden = false;
    $("#photoThumb").src = url;
    $("#photoThumb").hidden = false;
    canvas.style.touchAction = "none";
    $("#drop").classList.add("has-photo");
    $("#dropText").innerHTML = `<b>${esc(file.name || "Foto incollata")}</b><small>${img.width}×${img.height} · clicca per sostituirla</small>`;
    draw();
  }

  function zoomPhoto(factor, cx = LAYOUT.photo.w / 2, cy = LAYOUT.photo.h / 2) {
    const p = post.photo;
    if (!p) return;
    const min = coverScale(p.img);
    const next = Math.min(min * 4, Math.max(min, p.scale * factor));
    const k = next / p.scale;
    p.x = cx - (cx - p.x) * k;
    p.y = cy - (cy - p.y) * k;
    p.scale = next;
    clampPhoto(p);
    $("#zoom").value = Math.round((p.scale / min) * 100);
    draw();
  }

  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * canvas.height, k: W / r.width };
  }

  // Un dito (o il mouse) sposta la foto, due dita fanno lo zoom
  const pointers = new Map();
  let pinch = null;
  function pinchInfo() {
    const [p1, p2] = [...pointers.values()];
    const r = canvas.getBoundingClientRect();
    const k = W / r.width;
    return {
      dist: Math.hypot(p1.x - p2.x, p1.y - p2.y),
      cx: ((p1.x + p2.x) / 2 - r.left) * k,
      cy: ((p1.y + p2.y) / 2 - r.top) * k,
    };
  }
  on(canvas, "pointerdown", (e) => {
    if (!post.photo) return $("#photoInput").click();
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // alcuni browser rifiutano la cattura: il gesto funziona comunque
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.classList.add("dragging");
    if (pointers.size === 2) pinch = pinchInfo();
  });
  on(canvas, "pointermove", (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev || !post.photo) return;
    const k = canvasPoint(e).k;
    if (pointers.size === 1) {
      post.photo.x += (e.clientX - prev.x) * k;
      post.photo.y += (e.clientY - prev.y) * k;
      clampPhoto(post.photo);
      draw();
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2 && pinch) {
      const now = pinchInfo();
      // spostamento del punto centrale + zoom attorno a quel punto
      post.photo.x += now.cx - pinch.cx;
      post.photo.y += now.cy - pinch.cy;
      zoomPhoto(now.dist / pinch.dist, now.cx, Math.min(now.cy, LAYOUT.photo.h));
      pinch = now;
    }
  });
  const endPointer = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!pointers.size) canvas.classList.remove("dragging");
  };
  on(canvas, "pointerup", endPointer);
  on(canvas, "pointercancel", endPointer);
  on(
    canvas,
    "wheel",
    (e) => {
      if (!post.photo) return;
      e.preventDefault();
      const pt = canvasPoint(e);
      zoomPhoto(Math.exp(-e.deltaY * 0.0015), pt.x, Math.min(pt.y, LAYOUT.photo.h));
    },
    { passive: false }
  );

  $("#zoom").oninput = (e) => {
    const p = post.photo;
    if (p) zoomPhoto((coverScale(p.img) * (+e.target.value / 100)) / p.scale);
  };
  $("#centerPhoto").onclick = () => {
    const p = post.photo;
    if (!p) return;
    p.scale = coverScale(p.img);
    p.x = (LAYOUT.photo.w - p.img.width * p.scale) / 2;
    p.y = (LAYOUT.photo.h - p.img.height * p.scale) / 2;
    $("#zoom").value = 100;
    draw();
  };

  $("#photoInput").onchange = (e) => setPhoto(e.target.files[0]);
  const drop = $("#drop");
  for (const target of [drop, canvas]) {
    on(target, "dragover", (e) => {
      e.preventDefault();
      drop.classList.add("over");
    });
    on(target, "dragleave", () => drop.classList.remove("over"));
    on(target, "drop", (e) => {
      e.preventDefault();
      drop.classList.remove("over");
      setPhoto(e.dataTransfer.files[0]);
    });
  }
  // ---------------------------------------------------------------------------
  // Ctrl+V: l'immagine va dove stai lavorando
  //   finestra sponsor/squadra aperta → lì · mouse sopra sponsor o logo avversario → lì · altrimenti foto
  // ---------------------------------------------------------------------------

  let hoverZone = null;
  on(document, "mousemove", (e) => {
    const z = e.target.closest?.("[data-paste]") || null;
    if (z === hoverZone) return;
    hoverZone?.classList.remove("paste-hover");
    hoverZone = z;
    if (z && (e.ctrlKey || e.metaKey)) z.classList.add("paste-hover");
  });
  on(document, "keydown", (e) => {
    if ((e.key === "Control" || e.key === "Meta") && hoverZone) hoverZone.classList.add("paste-hover");
  });
  on(document, "keyup", (e) => {
    if (e.key === "Control" || e.key === "Meta") $$(".paste-hover").forEach((el) => el.classList.remove("paste-hover"));
  });

  function flash(el) {
    el?.classList.remove("paste-flash");
    void el?.offsetWidth;
    el?.classList.add("paste-flash");
  }

  on(document, "paste", (e) => {
    const item = [...(e.clipboardData?.items || [])].find((i) => i.kind === "file" && i.type.startsWith("image/"));
    if (!item) return;
    // in un campo di testo con del testo negli appunti si incolla il testo
    const active = document.activeElement;
    if (active?.matches?.("input[type=text], input[type=search], textarea") && e.clipboardData.types.includes("text/plain")) return;
    e.preventDefault();
    const file = item.getAsFile();

    if ($("#sponsorDlg").open) return pickSponsorFile(file, "Immagine incollata");
    if ($("#createDlg").open) return pickCreateFile(file, "Logo incollato");
    if ($("#archive").open) {
      $("#archive").close();
      openCreate();
      return pickCreateFile(file, "Logo incollato");
    }
    if ($("#champDlg").open) return;

    const target = hoverZone?.dataset.paste;
    if (target === "sponsor") {
      openSponsorDlg();
      return pickSponsorFile(file, "Immagine incollata");
    }
    if (target === "logo") {
      openCreate();
      return pickCreateFile(file, "Logo incollato");
    }
    setPhoto(file);
    flash($("#drop"));
    toast("Foto incollata · per uno sponsor o un logo, tieni il mouse sopra quella zona mentre incolli");
  });

  // ---------------------------------------------------------------------------
  // Esportazione
  // ---------------------------------------------------------------------------

  function fileName() {
    const [v, o] = wins();
    const vb = norm(post.vbsmLines.join(" ")).replace(/\bVBSM\b/, "").trim() || "VBSM";
    const op = norm(post.opp.lines.join(" ")) || "avversari";
    const [l, r, sl, sr] = post.lato === "casa" ? [vb, op, v, o] : [op, vb, o, v];
    return `${post.date || new Date().toISOString().slice(0, 10)} ${post.categoria} ${l} ${sl}-${sr} ${r}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function canvasBlob(type = "image/png", quality) {
    drawNow();
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  async function downloadPng() {
    const blob = await canvasBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  $("#save").onclick = async () => {
    if (!post.photo && !confirm("Non hai caricato la foto. Scaricare comunque?")) return;
    await downloadPng();
    toast("Immagine scaricata");
  };

  $("#copy").onclick = async () => {
    const blob = await canvasBlob();
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast("Immagine copiata negli appunti");
    } catch {
      toast("Il browser non permette di copiare l'immagine: usa Scarica", true);
    }
  };

  // Condivisione nativa del telefono: da qui si sceglie Instagram, WhatsApp, ecc.
  const canShareFiles = (() => {
    try {
      return Boolean(navigator.canShare?.({ files: [new File([""], "x.png", { type: "image/png" })] }));
    } catch {
      return false;
    }
  })();
  $("#share").hidden = !canShareFiles;
  $("#share").onclick = async () => {
    const blob = await canvasBlob("image/jpeg", 0.95);
    const file = new File([blob], `${fileName()}.jpg`, { type: "image/jpeg" });
    try {
      await navigator.clipboard?.writeText(buildCaption()).catch(() => {});
      await navigator.share({ files: [file] });
      toast("Didascalia copiata: incollala quando pubblichi");
    } catch (err) {
      if (err?.name !== "AbortError") toast(`Condivisione non riuscita: ${err.message}`, true);
    }
  };


  // ---------------------------------------------------------------------------
  // Instagram
  // ---------------------------------------------------------------------------

  const DEFAULT_HASHTAGS = "#vbsm #volleyballsanmartino #pallavolo #volley";
  let igState = { collegato: false, username: null };
  let igCaptionEdited = false;

  const SMALL_WORDS = new Set(["di", "de", "del", "della", "dei", "da", "e", "la", "le", "il", "in", "a"]);
  const pretty = (t) =>
    norm(t)
      .toLowerCase()
      .split(" ")
      .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.replace(/(^|[.'(-])\S/g, (c) => c.toUpperCase())))
      .join(" ");

  function buildCaption() {
    const [v, o] = wins();
    const casa = post.lato === "casa";
    const vb = pretty(post.vbsmLines.join(" ")).replace(/\bVbsm\b/, "VBSM");
    const op = pretty(post.opp.lines.join(" ")) || "Avversari";
    const [l, r, sl, sr] = casa ? [vb, op, v, o] : [op, vb, o, v];
    const sets = post.sets
      .filter(([a, b]) => a !== "" && b !== "")
      .map(([a, b]) => (casa ? `${a}-${b}` : `${b}-${a}`))
      .join(" · ");
    const tagCat = norm(post.categoria).replace(/\b(UNDER)\s*(\d+)\b/, "U$2").split(" ")[0].toLowerCase();
    const hashtags = config.instagram?.hashtag ?? DEFAULT_HASHTAGS;
    return [
      `🏐 ${post.categoria}`,
      "",
      `${l} ${sl}-${sr} ${r}`,
      sets,
      "",
      `${hashtags}${tagCat && /^u\d+$/.test(tagCat) ? ` #${tagCat}` : ""}`.trim(),
    ].join("\n");
  }

  function igUpdateCount() {
    $("#igCount").textContent = `${$("#igCaption").value.length}/2200`;
  }

  async function igRefreshState() {
    try {
      igState = await api("/api/post/instagram/stato");
    } catch {}
    $("#igCheckAccount").classList.toggle("ok", igState.collegato);
    $("#igSetup").hidden = igState.collegato;
    $("#igAccount").innerHTML = igState.collegato
      ? `@<b>${esc(igState.username)}</b> · <button class="link-btn" id="igDisconnect">scollega</button>`
      : "non collegato";
    const disc = $("#igDisconnect");
    if (disc) disc.onclick = async () => {
      if (!confirm("Scollegare l'account Instagram da questa app?")) return;
      await postJson("/api/post/instagram/scollega", {});
      igRefreshState();
    };
    $("#igPublish").disabled = !igState.collegato;
  }

  $("#igOpen").onclick = async () => {
    drawNow();
    $("#igPreview").src = canvas.toDataURL("image/jpeg", 0.85);
    if (!igCaptionEdited) $("#igCaption").value = buildCaption();
    $("#igHashtags").value = config.instagram?.hashtag ?? DEFAULT_HASHTAGS;
    igUpdateCount();
    $("#igSteps").hidden = true;
    $("#igResult").textContent = "";
    $("#igResult").className = "ig-result";
    $("#igDlg").showModal();
    igRefreshState();
  };
  $("#igClose").onclick = () => $("#igDlg").close();
  $("#igCaption").oninput = () => {
    igCaptionEdited = true;
    igUpdateCount();
  };
  $("#igHashtags").onchange = async (e) => {
    config.instagram = { ...(config.instagram || {}), hashtag: e.target.value.trim() };
    await saveConfig().catch(() => {});
    if (!igCaptionEdited) {
      $("#igCaption").value = buildCaption();
      igUpdateCount();
    }
  };
  $("#igConnect").onclick = async () => {
    const accessToken = $("#igToken").value.trim();
    if (!accessToken) return toast("Incolla prima il token", true);
    $("#igConnect").disabled = true;
    try {
      const { username } = await postJson("/api/post/instagram/collega", { accessToken });
      $("#igToken").value = "";
      toast(`Collegato a @${username}`);
      igRefreshState();
    } catch (err) {
      toast(`Token non valido: ${err.message}`, true, 6000);
    } finally {
      $("#igConnect").disabled = false;
    }
  };

  /** Ripiego senza API: didascalia negli appunti, JPG salvato, Instagram aperto nel browser */
  $("#igManual").onclick = async () => {
    try {
      await navigator.clipboard.writeText($("#igCaption").value);
    } catch {}
    await downloadPng();
    toast("Didascalia copiata e immagine scaricata", false, 5000);
    window.open("https://www.instagram.com/", "_blank");
  };

  $("#igPublish").onclick = async () => {
    const caption = $("#igCaption").value;
    if (!post.photo && !confirm("Non hai caricato la foto. Pubblicare comunque?")) return;
    drawNow();
    const jpeg = canvas.toDataURL("image/jpeg", 0.95);
    $("#igPublish").disabled = true;
    $("#igSteps").hidden = false;
    $("#igResult").textContent = "";
    $("#igResult").className = "ig-result";
    const order = ["preparazione", "caricamento", "pubblicazione", "fatto"];
    const paint = (fase) => {
      const k = order.indexOf(fase);
      $$("#igSteps li").forEach((li, i) => {
        li.className = i < k || fase === "fatto" ? "ok" : i === k ? "run" : "";
      });
    };
    paint("preparazione");
    try {
      const { id } = await postJson("/api/post/instagram/pubblica", { dataUrl: jpeg, caption });
      for (;;) {
        await new Promise((r) => setTimeout(r, 1000));
        const job = await api(`/api/post/instagram/lavoro/${id}`);
        if (job.fase === "errore") throw new Error(job.errore);
        paint(job.fase);
        if (job.fase === "fatto") {
          $("#igResult").innerHTML = job.permalink
            ? `Fatto! <a href="${esc(job.permalink)}" target="_blank" rel="noopener">Apri il post su Instagram →</a>`
            : "Fatto! Il post è online.";
          igCaptionEdited = false;
          toast("Pubblicato su Instagram 🎉");
          break;
        }
      }
    } catch (err) {
      $$("#igSteps li.run").forEach((li) => (li.className = ""));
      $("#igResult").className = "ig-result err";
      $("#igResult").textContent = `Non pubblicato: ${err.message}`;
    } finally {
      $("#igPublish").disabled = !igState.collegato;
    }
  };

  // ---------------------------------------------------------------------------
  // Avvio
  // ---------------------------------------------------------------------------

  (async function init() {
    config = await api("/api/post/config");
    config.squadre ||= [];
    config.sponsor ||= [];
    config.avversari ||= [];
    renderMatches();
    await Promise.all([
      document.fonts.load('65px "League Gothic"'),
      document.fonts.load('700 25px "Roboto"'),
      document.fonts.load('500 25px "Roboto"'),
      document.fonts.load('700 32px "Roboto Mono"'),
      document.fonts.load('500 14px "Inter"'),
    ]);
    // Font originali del template: si usano solo se presenti (installati sul PC o in public/fonts)
    const has = async (family) => (await document.fonts.load(`100px "${family}"`).catch(() => [])).length > 0;
    fonts.digits = (await has("Yearbook Solid")) ? "Yearbook Solid" : null;
    fonts.title = (await has("Paalalabas Condensed")) ? "Paalalabas Condensed" : null;
    const [template, strisce, sf, sm, logo] = await Promise.all([
      loadImage("/api/post/assets/template.png"),
      loadImage("/api/post/assets/strisce.png"),
      loadImage("/api/post/assets/sfondo-femminile.png"),
      loadImage("/api/post/assets/sfondo-maschile.png"),
      loadImage(VBSM_LOGO),
    ]);
    Object.assign(assets, { template, strisce, sfondi: { femminile: sf, maschile: sm } });
    vbsmLogo = logo;
    renderTeams();
    fillSponsorSelect();
    fillVbsmForm();
    renderSets();
    refreshOpponentLogo();
    loadMatches(false);
  })();

  return () => {
    for (const [target, event, handler, options] of listeners) target.removeEventListener(event, handler, options);
    cancelAnimationFrame(raf);
  };
}
