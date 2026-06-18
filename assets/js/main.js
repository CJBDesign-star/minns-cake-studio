/* ============================================================
   Minns Cake Studio · cinematic motion layer
   GSAP + ScrollTrigger + Lenis
   ============================================================ */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = window.gsap && window.ScrollTrigger;
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Year ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    document.documentElement.classList.add("lenis");
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (hasGSAP) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ---------- Anchor links via Lenis ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      // Form triggers open a modal instead of scrolling
      if (id === "#quote") { e.preventDefault(); closeMobile(); openModal("quoteModal"); return; }
      if (id === "#cake-inquiry") { e.preventDefault(); closeMobile(); openModal("cakeModal"); return; }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobile();
      if (lenis) lenis.scrollTo(target, { offset: -10, duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Preloader (first visit only, snappy) ---------- */
  const preloader = document.getElementById("preloader");
  let introSeen = false;
  try { introSeen = !!sessionStorage.getItem("mcs_intro"); } catch (e) {}
  if (introSeen && preloader) preloader.style.display = "none";

  function showHeroNow() {
    // Hard fallback: make every hero element visible, no animation.
    if (preloader) preloader.style.display = "none";
    document.querySelectorAll(".hero__title .ln>span, .hero .reveal-up").forEach((el) => {
      el.style.transform = "none";
      el.style.opacity = "1";
    });
  }

  function revealHero(skip) {
    document.body.classList.add("is-loaded");
    if (hasGSAP && !reduce) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      if (skip) { if (preloader) preloader.style.display = "none"; }
      else { tl.to("#preloader", { yPercent: -100, duration: 0.85, ease: "power3.inOut" }, 0); }
      tl.to(".hero__title .ln>span", { yPercent: 0, duration: 1.05, stagger: 0.1 }, skip ? 0 : 0.3)
        .to(".hero .reveal-up", { y: 0, opacity: 1, duration: 0.85, stagger: 0.08 }, skip ? 0.05 : 0.5);
    } else {
      showHeroNow();
    }
  }

  /* Reveal exactly once, no matter which trigger fires first. */
  let heroRevealed = false;
  function ensureHero(skip) {
    if (heroRevealed) return;
    heroRevealed = true;
    revealHero(skip);
  }

  if (preloader && !reduce && hasGSAP && !introSeen) {
    gsap.fromTo(".preloader__bar>i", { xPercent: -100 }, { xPercent: 0, duration: 0.7, ease: "power2.inOut", delay: 0.15 });
  }

  function startReveal() {
    if (reduce || introSeen) { ensureHero(true); }
    else { try { sessionStorage.setItem("mcs_intro", "1"); } catch (e) {} setTimeout(function () { ensureHero(false); }, 800); }
  }

  // Fire on load — but if the page is already loaded (cache/bfcache), fire now.
  if (document.readyState === "complete") { startReveal(); }
  else { window.addEventListener("load", startReveal); }

  // bfcache restore (mobile back/forward): content must be visible immediately.
  window.addEventListener("pageshow", function (e) { if (e.persisted) { heroRevealed = true; showHeroNow(); } });

  // Last-resort safety net: never leave the hero hidden if load/animation stalls.
  setTimeout(function () { if (!heroRevealed) { heroRevealed = true; showHeroNow(); } }, 3000);

  /* ---------- Navigation behaviour ---------- */
  const nav = document.getElementById("nav");
  const progEl = document.getElementById("scrollProg");
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 60);
    if (y > 400 && y > lastY) nav.classList.add("is-hidden");
    else nav.classList.remove("is-hidden");
    lastY = y;
    if (progEl) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progEl.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = document.getElementById("navToggle");
  const mobile = document.getElementById("mobileMenu");
  function closeMobile() {
    if (!mobile) return;
    mobile.classList.remove("is-open");
    mobile.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (toggle && mobile) {
    toggle.addEventListener("click", () => {
      const open = mobile.classList.toggle("is-open");
      mobile.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
  }

  /* ---------- Modals (quote + cake inquiry) ---------- */
  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    document.querySelectorAll(".modal.is-open").forEach((o) => { if (o !== m) closeModal(o); });
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const panel = m.querySelector(".modal__panel");
    if (panel) panel.scrollTop = 0;
    const back = m.querySelector(".modal__back");
    if (back) back.focus();
  }
  function closeModal(m) {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.is-open")) document.body.style.overflow = "";
  }
  document.querySelectorAll(".modal").forEach((m) => {
    const panel = m.querySelector(".modal__panel");
    if (panel) panel.setAttribute("data-lenis-prevent", ""); // let the panel scroll natively over Lenis
    m.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", () => closeModal(m)));
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { const open = document.querySelector(".modal.is-open"); if (open) closeModal(open); }
  });

  /* ============================================================
     ScrollTrigger-driven cinematics
     ============================================================ */
  if (hasGSAP && !reduce) {

    /* Generic parallax on tagged elements */
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      gsap.fromTo(el, { yPercent: -speed * 50 }, {
        yPercent: speed * 50, ease: "none",
        scrollTrigger: { trigger: el.closest("section") || el, start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    /* Generic reveal-up */
    gsap.utils.toArray(".reveal-up").forEach((el) => {
      if (el.closest(".hero")) return; // hero handled by intro timeline
      gsap.to(el, {
        y: 0, opacity: 1, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
      });
    });

    /* Scroll-tilt reveal (ContainerScroll-style): the element starts tilted
       back in 3D and rotates flat + scales up as it scrolls into view. */
    gsap.utils.toArray("[data-tilt-reveal]").forEach((el) => {
      gsap.fromTo(el,
        { rotateX: 16, scale: 0.92, y: 44, opacity: 0, transformPerspective: 1200, transformOrigin: "50% 90%" },
        {
          rotateX: 0, scale: 1, y: 0, opacity: 1, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", end: "top 40%", scrub: 0.6 },
        }
      );
    });

    /* Section titles: clip reveal */
    gsap.utils.toArray(".sec-title").forEach((t) => {
      if (t.closest(".modal")) return; // modal titles aren't scroll-revealed
      gsap.from(t, {
        yPercent: 18, opacity: 0, duration: 1.1, ease: "power4.out",
        scrollTrigger: { trigger: t, start: "top 88%" },
      });
    });

    /* Manifesto word-by-word brighten */
    const words = gsap.utils.toArray(".intro__lead .word");
    if (words.length) {
      gsap.to(words, {
        opacity: 1, ease: "none", stagger: 1,
        scrollTrigger: { trigger: ".intro", start: "top 70%", end: "bottom 60%", scrub: true },
      });
    }

    /* Image clip reveals */
    gsap.utils.toArray(".reveal-clip img").forEach((img) => {
      gsap.fromTo(img, { clipPath: "inset(100% 0 0 0)", scale: 1.2 }, {
        clipPath: "inset(0% 0 0 0)", scale: 1, duration: 1.4, ease: "power3.out",
        scrollTrigger: { trigger: img, start: "top 85%" },
      });
    });

    /* ---- How it works: editorial rows reveal + numeral fill ---- */
    gsap.utils.toArray(".how__row").forEach((row) => {
      const n = row.querySelector(".how__n");
      if (n) gsap.from(n, {
        xPercent: -14, opacity: 0, duration: 1.1, ease: "power3.out",
        scrollTrigger: { trigger: row, start: "top 84%" },
      });
      ScrollTrigger.create({
        trigger: row, start: "top 72%",
        onEnter: () => row.classList.add("is-active"),
      });
    });

    /* Footer title rise */
    gsap.from(".footer__title .ln>span", {
      yPercent: 120, duration: 1.1, stagger: 0.12, ease: "power4.out",
      scrollTrigger: { trigger: ".footer", start: "top 78%" },
    });

    /* Included-list staggered reveal */
    gsap.utils.toArray(".included__list li").forEach((li) => {
      gsap.from(li, {
        opacity: 0, y: 16, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: li, start: "top 95%" },
      });
    });

  } else {
    // reduced-motion / no GSAP fallback: show everything
    document.querySelectorAll(".reveal-up").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
    document.querySelectorAll(".intro__lead .word").forEach((el) => (el.style.opacity = 1));
    document.querySelectorAll(".how__row").forEach((r) => r.classList.add("is-active"));
  }

  /* ============================================================
     Menu tabs (works regardless of motion pref)
     ============================================================ */
  const tabs = document.querySelectorAll(".menu__tab");
  const mpanels = document.querySelectorAll(".menu__panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle("is-active", t === tab));
      mpanels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === id));
      if (hasGSAP) ScrollTrigger.refresh();
    });
  });

  /* ============================================================
     FAQ accordion: animated height, single-open
     ============================================================ */
  const faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach((item) => {
    const summary = item.querySelector("summary");
    const body = item.querySelector(".faq__body");
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = item.hasAttribute("open");
      // close siblings
      faqItems.forEach((other) => {
        if (other !== item && other.hasAttribute("open")) {
          const ob = other.querySelector(".faq__body");
          if (hasGSAP && !reduce) gsap.to(ob, { height: 0, duration: 0.4, ease: "power2.inOut", onComplete: () => other.removeAttribute("open") });
          else other.removeAttribute("open");
        }
      });
      if (isOpen) {
        if (hasGSAP && !reduce) gsap.to(body, { height: 0, duration: 0.4, ease: "power2.inOut", onComplete: () => item.removeAttribute("open") });
        else item.removeAttribute("open");
      } else {
        item.setAttribute("open", "");
        if (hasGSAP && !reduce) {
          gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.5, ease: "power2.out" });
        }
      }
    });
  });

  /* ============================================================
     Form submission (FormSubmit / Web3Forms) — AJAX, no reload
     ============================================================ */
  // Build FormData excluding empty fields, so blank/optional inputs
  // (e.g. an unused "Other occasion") never show up in the email.
  function buildData(form) {
    const off = [];
    form.querySelectorAll("input, select, textarea").forEach((el) => {
      if (el.name && el.type !== "checkbox" && el.type !== "radio" && !el.disabled && String(el.value).trim() === "") {
        el.disabled = true; off.push(el);
      }
    });
    const data = new FormData(form);
    off.forEach((el) => (el.disabled = false));
    return data;
  }

  const qForm = document.getElementById("quoteForm");
  if (qForm) {
    const status = document.getElementById("quoteStatus");
    const submit = document.getElementById("quoteSubmit");
    const keyInput = qForm.querySelector('input[name="access_key"]');
    const PLACEHOLDER = "YOUR_WEB3FORMS_ACCESS_KEY";

    /* Enforce the 50-guest minimum even if typed directly */
    const guests = document.getElementById("q-guests");
    if (guests) {
      guests.addEventListener("change", () => {
        if (guests.value !== "" && Number(guests.value) < 50) guests.value = 50;
      });
    }

    /* Reveal "what are you celebrating?" only for Other Celebration */
    const typeSel = document.getElementById("q-type");
    const otherField = document.getElementById("q-otherField");
    const otherInput = document.getElementById("q-other");
    if (typeSel && otherField) {
      const toggleOther = () => {
        const show = typeSel.value === "Other Celebration";
        otherField.hidden = !show;
        if (otherInput) {
          otherInput.required = show;
          if (show) otherInput.focus();
          else otherInput.value = "";
        }
      };
      typeSel.addEventListener("change", toggleOther);
      toggleOther();
    }

    const setStatus = (msg, kind) => {
      status.textContent = msg;
      status.classList.remove("is-ok", "is-err");
      if (kind) status.classList.add(kind);
    };

    qForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Web3Forms only: block if the access key is still the placeholder.
      if (qForm.action.indexOf("web3forms") !== -1 && (!keyInput || keyInput.value.trim() === PLACEHOLDER || keyInput.value.trim() === "")) {
        setStatus("Form isn't connected yet. Add your free Web3Forms access key to start receiving quotes.", "is-err");
        return;
      }

      submit.disabled = true;
      const original = submit.textContent;
      submit.textContent = "Sending…";
      setStatus("", null);

      try {
        const data = buildData(qForm);
        const res = await fetch(qForm.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        const json = await res.json().catch(() => ({}));
        if (res.ok && (json.success === true || json.success === "true")) {
          qForm.innerHTML =
            '<div class="quote__sent"><h3>Thank you!</h3>' +
            "<p>Your request has been received. A follow up will be sent to your email or phone shortly with a personalized proposal for your celebration.</p></div>";
        } else {
          setStatus(json.message || "Something went wrong. Please try again or email us directly.", "is-err");
          submit.disabled = false;
          submit.textContent = original;
        }
      } catch (err) {
        setStatus("Network error. Please check your connection and try again.", "is-err");
        submit.disabled = false;
        submit.textContent = original;
      }
    });
  }

  /* ============================================================
     Custom cake inquiry form (separate from the cart quote)
     ============================================================ */
  const cForm = document.getElementById("cakeForm");
  if (cForm) {
    const cStatus = document.getElementById("cakeStatus");
    const cSubmit = document.getElementById("cakeSubmit");
    const cKey = cForm.querySelector('input[name="access_key"]');
    const CK_PLACEHOLDER = "YOUR_WEB3FORMS_ACCESS_KEY";
    const cSet = (msg, kind) => {
      cStatus.textContent = msg;
      cStatus.classList.remove("is-ok", "is-err");
      if (kind) cStatus.classList.add(kind);
    };
    cForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (cForm.action.indexOf("web3forms") !== -1 && (!cKey || cKey.value.trim() === CK_PLACEHOLDER || cKey.value.trim() === "")) {
        cSet("Form isn't connected yet. Add your free Web3Forms access key to start receiving inquiries.", "is-err");
        return;
      }
      cSubmit.disabled = true;
      const orig = cSubmit.textContent;
      cSubmit.textContent = "Sending…";
      cSet("", null);
      try {
        const res = await fetch(cForm.action, { method: "POST", body: buildData(cForm), headers: { Accept: "application/json" } });
        const json = await res.json().catch(() => ({}));
        if (res.ok && (json.success === true || json.success === "true")) {
          cForm.innerHTML =
            '<div class="quote__sent"><h3>Thank you!</h3>' +
            "<p>Your inquiry has been received. A follow up will be sent to your email or phone soon with details and a quote for your custom cake.</p></div>";
        } else {
          cSet(json.message || "Something went wrong. Please try again or email us directly.", "is-err");
          cSubmit.disabled = false; cSubmit.textContent = orig;
        }
      } catch (err) {
        cSet("Network error. Please check your connection and try again.", "is-err");
        cSubmit.disabled = false; cSubmit.textContent = orig;
      }
    });
  }

})();
