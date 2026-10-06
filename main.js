(function () {
  "use strict";

  var $ = function (sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "] failed:", e); }
  }

  /* Nav — solidify on scroll */
  function initNav() {
    var nav = $("[data-nav]");
    if (!nav) return;
    var onScroll = function () {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobile fullscreen menu */
  function initMobileNav() {
    var burger = $("[data-nav-burger]");
    var panel = $("[data-nav-mobile]");
    if (!burger || !panel) return;
    var open = false;
    var toggle = function (force) {
      open = typeof force === "boolean" ? force : !open;
      panel.setAttribute("data-open", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.documentElement.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () { toggle(); });
    $$("[data-nav-mobile-link]", panel).forEach(function (a) {
      a.addEventListener("click", function () { toggle(false); });
    });
  }

  /* Reveal on scroll — low threshold + 6s safety net */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });
    els.forEach(function (el) { io.observe(el); });

    setTimeout(function () {
      $$("[data-reveal]:not(.is-revealed)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
      });
    }, 6000);
  }

  /* Subtle hero parallax — layered translateY on scroll, skipped for reduced motion */
  function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var hero = $(".hero");
    var layers = $$("[data-parallax-layer]", hero);
    if (!hero || !layers.length) return;

    var ticking = false;
    function update() {
      var rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        layers.forEach(function (el) {
          var rate = parseFloat(el.getAttribute("data-parallax-layer")) || 0.2;
          el.style.transform = "translateY(" + (rect.top * -rate) + "px)";
        });
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* Only one FAQ item open at a time */
  function initFaqAccordion() {
    var items = $$(".faq-item");
    items.forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        items.forEach(function (other) { if (other !== item) other.open = false; });
      });
    });
  }

  function boot() {
    safe(initNav, "initNav");
    safe(initMobileNav, "initMobileNav");
    safe(initParallax, "initParallax");
    safe(initReveals, "initReveals");
    safe(initFaqAccordion, "initFaqAccordion");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
