(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const BASE = document.body.dataset.base || "";
  const PHONE = "661 264 340";
  const TEL = "tel:+48661264340";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const typo = (t) => t.replace(/(^|[\s(])([aiouwzAIOUWZ]) /g, "$1$2 ");

  /* ---------- menu ---------- */
  const burger = $(".burger");
  const nav = $(".nav");
  if (burger) {
    const setMenu = (open) => {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
      nav.classList.toggle("open", open);
    };
    burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  /* ---------- pojawianie się przy przewijaniu ---------- */
  const rv = $$(".rv");
  if ("IntersectionObserver" in window && !calm) {
    const io = new IntersectionObserver((list) => {
      list.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rv.forEach((el) => io.observe(el));
  } else {
    rv.forEach((el) => el.classList.add("in"));
  }

  /* ---------- dom i główny wyłącznik ---------- */
  const house = $(".house");
  const mains = $(".mains");
  if (house && mains) {
    const setPower = (on) => {
      house.classList.toggle("off", !on);
      mains.setAttribute("aria-pressed", String(on));
      mains.classList.toggle("is-off", !on);
      $(".mains-s", mains).textContent = on ? "ZAŁ" : "WYŁ";
    };
    if (!calm) { setPower(false); setTimeout(() => setPower(true), 500); }
    mains.addEventListener("click", () => setPower(mains.getAttribute("aria-pressed") !== "true"));
  }

  /* ---------- rozdzielnica usług ---------- */
  const tabs = $$(".mcb");
  if (tabs.length) {
    const panels = $$(".svc");
    const warm = (id) => {
      const img = $("#p-" + id + " img");
      if (img) img.loading = "eager";
    };
    const select = (id, focus) => {
      warm(id);
      tabs.forEach((t) => {
        const on = t.dataset.id === id;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach((p) => {
        const on = p.id === "p-" + id;
        p.hidden = !on;
        p.classList.toggle("on", on);
      });
    };
    select("f1");
    tabs.forEach((t, i) => {
      t.addEventListener("pointerenter", () => warm(t.dataset.id));
      t.addEventListener("focus", () => warm(t.dataset.id));
      t.addEventListener("click", () => {
        select(t.dataset.id);
        if (innerWidth < 960) {
          const panel = $("#p-" + t.dataset.id);
          const box = panel.getBoundingClientRect();
          if (box.top > innerHeight * 0.62) panel.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
        }
      });
      t.addEventListener("keydown", (e) => {
        const cols = getComputedStyle($(".rail")).gridTemplateColumns.split(" ").length;
        const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
        let next = null;
        if (move) next = (i + move + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(tabs[next].dataset.id, true); }
      });
    });
    $$("[data-go]").forEach((a) => a.addEventListener("click", () => select(a.dataset.go)));
  }

  /* ---------- miernik ---------- */
  const keys = $$(".key");
  if (keys.length) {
    const infos = $$(".minfo");
    const lab = $(".lcd-lab"), val = $(".lcd-val"), unit = $(".lcd-unit");
    const setMode = (k) => {
      keys.forEach((x) => { const on = x === k; x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); });
      lab.textContent = k.dataset.lab;
      val.textContent = k.dataset.val;
      unit.textContent = k.dataset.unit;
      infos.forEach((i) => i.classList.toggle("on", i.dataset.mode === k.dataset.mode));
    };
    keys.forEach((k) => k.addEventListener("click", () => setMode(k)));
    infos.forEach((i) => i.addEventListener("click", () => setMode(keys.find((k) => k.dataset.mode === i.dataset.mode))));
    setMode(keys[0]);
  }

  /* ---------- narzędzia: drzewka decyzyjne ---------- */
  const CERT_LINK = ["poradnik/swiadectwo-energetyczne-kiedy-obowiazkowe.html", "Przeczytaj cały poradnik"];
  const FUSE_LINK = ["poradnik/wybija-bezpiecznik-co-zrobic.html", "Instrukcja krok po kroku"];
  const POWER_LINK = ["poradnik/brak-pradu-kogo-wezwac.html", "Elektryk czy 991?"];
  const EXEMPT = "Zabytek, miejsce kultu, dom używany do 4 miesięcy w roku, budynek wolnostojący poniżej 50 m², budynek przemysłowy lub gospodarczy bez instalacji zużywających energię albo gospodarstwo rolne z EP do 50 kWh/(m²·rok).";
  const VALID = "Musi mieć mniej niż 10 lat. Od jego sporządzenia nie mogło być prac, które zmieniły zużycie energii, na przykład ocieplenia lub wymiany ogrzewania.";

  const TREES = {
    cert: {
      q: { q: "Co planujesz zrobić z budynkiem lub lokalem?", a: [["Sprzedać", "sx"], ["Wynająć", "rx"], ["Nic, mieszkam u siebie", "none"]] },
      none: { r: "ok", t: "Nie musisz mieć świadectwa", p: "Obowiązek pojawia się przy sprzedaży albo najmie. Gdy to się zmieni, wróć tutaj.", l: CERT_LINK },
      sx: { q: "Czy to jeden z tych wyjątków?", h: EXEMPT, a: [["Tak", "ex"], ["Nie", "sv"]] },
      rx: { q: "Czy to jeden z tych wyjątków?", h: EXEMPT, a: [["Tak", "ex"], ["Nie", "rv"]] },
      ex: { r: "warn", t: "Obowiązek prawdopodobnie Cię nie dotyczy", p: "Ustawa wyłącza takie budynki. Jeśli nie masz pewności, zadzwoń i sprawdzimy to razem.", l: CERT_LINK },
      sv: { q: "Masz już ważne świadectwo?", h: VALID, a: [["Tak", "sok"], ["Nie albo nie wiem", "sneed"]] },
      rv: { q: "Masz już ważne świadectwo?", h: VALID, a: [["Tak", "rok"], ["Nie albo nie wiem", "rneed"]] },
      sok: { r: "ok", t: "Wystarczy to, które masz", p: "Przekaż je kupującemu przy akcie notarialnym. W ogłoszeniu podaj wskaźniki ze świadectwa.", l: CERT_LINK },
      rok: { r: "ok", t: "Wystarczy to, które masz", p: "Przy podpisaniu umowy przekaż najemcy kopię lub wydruk. W ogłoszeniu podaj wskaźniki ze świadectwa.", l: CERT_LINK },
      sneed: { r: "need", t: "Potrzebujesz świadectwa", p: "Przekazujesz je kupującemu przy akcie notarialnym. Kupujący nie może z niego zrezygnować, a za brak dokumentu grozi grzywna.", l: CERT_LINK },
      rneed: { r: "need", t: "Potrzebujesz świadectwa", p: "Najemca dostaje kopię lub wydruk przy podpisaniu umowy. Nie może z tego zrezygnować, a za brak dokumentu grozi grzywna.", l: CERT_LINK },
    },
    fault: {
      q: { q: "Co się dzieje?", a: [
        ["Dym, iskry, spalenizna, zalana instalacja", "danger"],
        ["Zerwany przewód lub uszkodzony słup", "line"],
        ["Nie ma prądu w całym domu", "all"],
        ["Nie działa tylko część domu", "part"],
        ["Bezpiecznik ciągle wybija", "trip"],
      ] },
      danger: { r: "danger", t: "Nie dotykaj uszkodzonego miejsca", p: "Jeśli możesz zrobić to bezpiecznie, wyłącz główny wyłącznik. Przy dymie lub ogniu wyjdź i dzwoń pod 112. Po opanowaniu sytuacji wezwij elektryka.", call: "112" },
      line: { r: "danger", t: "Odsuń się na kilka metrów", p: "Ostrzeż innych. Nie dotykaj ogrodzenia ani mokrej ściany w pobliżu. Zadzwoń na pogotowie energetyczne 991 albo pod 112.", call: "991" },
      all: { q: "Czy sąsiedzi mają prąd?", a: [["Nie, u nich też nie ma", "grid"], ["Tak, mają", "board"], ["Nie wiem", "board"]] },
      grid: { r: "warn", t: "To prawdopodobnie awaria sieci", p: "Zadzwoń na pogotowie energetyczne 991 i podaj adres. Takie usterki usuwa operator.", call: "991", l: POWER_LINK },
      board: { q: "Czy któraś dźwignia w rozdzielnicy jest w dole?", a: [["Tak", "unplug"], ["Nie, wszystkie w górze", "meter"]] },
      meter: { r: "need", t: "Usterka może być przy liczniku lub zasilaniu", p: "Nie otwieraj plombowanych zabezpieczeń. Zadzwoń, a ustalimy, czy potrzebny jest elektryk, czy operator sieci.", l: POWER_LINK },
      part: { q: "Czy któraś dźwignia w rozdzielnicy jest w dole?", a: [["Tak", "unplug"], ["Nie", "circuit"]] },
      circuit: { r: "need", t: "Usterka jest prawdopodobnie w obwodzie", p: "Może to być luźne połączenie albo uszkodzony przewód. Nie rozkręcaj gniazdek samodzielnie, tylko zadzwoń." },
      unplug: { q: "Odłącz urządzenia z tego obwodu i podnieś dźwignię raz. Co się stało?", a: [["Trzyma", "plug"], ["Od razu spadła", "fixit"]] },
      plug: { r: "ok", t: "Podłączaj sprzęt po jednym", p: "Gdy zabezpieczenie wybije po konkretnym urządzeniu, odstaw je i oddaj do serwisu. Jeśli problem wróci bez powodu, zadzwoń.", l: FUSE_LINK },
      fixit: { r: "need", t: "Nie włączaj więcej", p: "Skoro wybija bez podłączonych urządzeń, usterka jest prawdopodobnie w instalacji. Tu potrzebny jest elektryk.", l: FUSE_LINK },
      trip: { q: "Który wyłącznik wybija?", h: "Różnicowoprądowy ma zwykle przycisk T lub TEST.", a: [["Z przyciskiem TEST", "rcd"], ["Zwykły, np. B16", "mcb"], ["Nie wiem", "unplug"]] },
      rcd: { r: "warn", t: "Prąd gdzieś ucieka", p: "Odłącz wszystkie urządzenia, włącz wyłącznik i podłączaj je po jednym. Częste przyczyny to uszkodzona grzałka albo wilgoć. Jeśli wybija bez urządzeń, zadzwoń.", l: ["poradnik/wylacznik-roznicowopradowy-test.html", "Jak działa ten wyłącznik"] },
      mcb: { r: "warn", t: "Przeciążenie albo zwarcie", p: "Nie włączaj kilku mocnych urządzeń naraz. Jeśli wybija nawet bez nich, zadzwoń. Nie wymieniaj zabezpieczenia na mocniejsze.", l: FUSE_LINK },
    },
  };

  const LABEL = { ok: "Wynik", warn: "Wskazówka", need: "Zadzwoń", danger: "Uwaga" };

  $$(".tree").forEach((el) => {
    const data = TREES[el.dataset.tree];
    const body = $(".tree-body", el);
    const reset = $(".tree-reset", el);
    let step = 0;

    const render = (id, focus) => {
      const n = data[id];
      body.innerHTML = "";
      reset.hidden = id === "q";
      const box = document.createElement("div");
      if (n.q) {
        step += 1;
        box.className = "tree-q";
        box.innerHTML = `<p class="tree-step">Krok ${step}</p><p class="tree-ask" tabindex="-1">${typo(n.q)}</p>` +
          (n.h ? `<p class="tree-hint">${typo(n.h)}</p>` : "");
        const opts = document.createElement("div");
        opts.className = "tree-opts";
        n.a.forEach(([label, to]) => {
          const b = document.createElement("button");
          b.type = "button";
          b.textContent = label;
          b.addEventListener("click", () => render(to, true));
          opts.append(b);
        });
        box.append(opts);
      } else {
        box.className = "tree-res " + n.r;
        const call = n.call
          ? `<a class="btn btn-red" href="tel:${n.call}"><span>Zadzwoń: ${n.call}</span></a><a class="btn btn-ghost" href="${TEL}"><span>Elektryk: ${PHONE}</span></a>`
          : `<a class="btn btn-red" href="${TEL}"><span>${PHONE}</span></a>`;
        const more = n.l ? `<a class="tree-link" href="${BASE}${n.l[0]}">${n.l[1]} →</a>` : "";
        box.innerHTML = `<p class="tree-step">${LABEL[n.r]}</p><p class="tree-ask" tabindex="-1">${typo(n.t)}</p><p>${typo(n.p)}</p><div class="tree-acts">${call}${more}</div>`;
      }
      body.append(box);
      if (focus) $(".tree-ask", box).focus({ preventScroll: true });
    };

    reset.addEventListener("click", () => { step = 0; render("q", true); });
    render("q");
  });

  /* ---------- kalkulator terminu pomiarów ---------- */
  const plural = (n, f) => {
    const a = Math.abs(n);
    if (a === 1) return f[0];
    const d = a % 10, h = a % 100;
    return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? f[1] : f[2];
  };
  const MONTHS = ["miesiąc", "miesiące", "miesięcy"];
  const YEARS = ["rok", "lata", "lat"];
  const span = (m) => {
    const y = Math.floor(m / 12), r = m % 12, out = [];
    if (y) out.push(`${y} ${plural(y, YEARS)}`);
    if (r || !y) out.push(`${r} ${plural(r, MONTHS)}`);
    return out.join(" i ");
  };

  $$("[data-due]").forEach((form) => {
    const input = $("input", form);
    const out = $("output", form);
    const now = new Date();
    const pad = (x) => String(x).padStart(2, "0");
    input.max = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    form.addEventListener("submit", (e) => e.preventDefault());
    input.addEventListener("input", () => {
      out.className = "due-out";
      if (!input.value) { out.textContent = "Wynik pojawi się tutaj."; return; }
      const [y, m, d] = input.value.split("-").map(Number);
      const last = new Date(y, m - 1, d);
      if (y < 1950 || last > now) { out.textContent = "Podaj datę z przeszłości."; return; }
      const next = new Date(y + 5, m - 1, d);
      const nice = next.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
      const months = (next.getFullYear() - now.getFullYear()) * 12 + next.getMonth() - now.getMonth();
      if (next < now) {
        const late = Math.max(1, -months);
        out.classList.add("late");
        out.innerHTML = `<b>Termin minął ${nice}.</b> To już ${span(late)} po czasie. <a href="${TEL}">Zadzwoń: ${PHONE}</a>`;
      } else if (months <= 6) {
        out.classList.add("soon");
        out.innerHTML = `<b>Termin: ${nice}.</b> Zostało niewiele czasu, warto się umówić. <a href="${TEL}">${PHONE}</a>`;
      } else {
        out.classList.add("fine");
        out.innerHTML = `<b>Masz czas do ${nice}.</b> To jeszcze około ${span(months)}.`;
      }
    });
  });

  /* ---------- filtr poradnika ---------- */
  const list = $("[data-list]");
  if (list) {
    const chips = $$(".chip");
    const search = $("[data-search]");
    const cards = $$(".acard", list);
    const count = $("[data-count]");
    const empty = $("[data-empty]");
    let cat = "";
    const apply = () => {
      const q = search.value.trim().toLowerCase();
      let n = 0;
      cards.forEach((c) => {
        const show = (!cat || c.dataset.cat === cat) && (!q || c.dataset.text.includes(q));
        c.hidden = !show;
        if (show) n += 1;
      });
      count.textContent = `${n} ${plural(n, ["artykuł", "artykuły", "artykułów"])}`;
      empty.hidden = n !== 0;
    };
    chips.forEach((c) => c.addEventListener("click", () => {
      cat = c.dataset.cat;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      apply();
    }));
    search.addEventListener("input", apply);
  }

  /* ---------- formularz: gotowa wiadomość e-mail ---------- */
  $$(".mailform").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const f = new FormData(form);
      const subject = `${f.get("temat")}: zapytanie ze strony`;
      const text = `${f.get("opis")}\n\nImię: ${f.get("imie")}\nTelefon: ${f.get("telefon")}`;
      location.href = `mailto:${form.dataset.mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      $(".form-hint", form).innerHTML = `Nie otworzyła się poczta? Napisz na <a href="mailto:${form.dataset.mail}">${form.dataset.mail}</a> albo zadzwoń.`;
    });
  });

  /* ---------- duży numer dopasowany do szerokości ---------- */
  const giant = $(".giant");
  if (giant) {
    const inner = giant.firstElementChild;
    const fit = () => {
      giant.style.fontSize = "100px";
      const w = inner.getBoundingClientRect().width;
      if (w) giant.style.fontSize = `${Math.min(100 * (giant.clientWidth / w) * 0.995, 520)}px`;
    };
    fit();
    addEventListener("resize", fit, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }

  /* ---------- artykuł: pasek postępu i spis treści ---------- */
  const bar = $(".progress i");
  if (bar) {
    let tick = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      tick = false;
    };
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    update();
    const links = $$(".toc a");
    if ("IntersectionObserver" in window) {
      const heads = links.map((a) => $(a.getAttribute("href")));
      const spy = new IntersectionObserver((items) => {
        items.forEach((it) => {
          if (it.isIntersecting) {
            links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + it.target.id));
          }
        });
      }, { rootMargin: "-15% 0px -75% 0px" });
      heads.forEach((h) => h && spy.observe(h));
    }
  }
})();
