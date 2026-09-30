/* =====================================================================
   BARBET — site script (no libraries, no build step)
   Everything here is progressive enhancement: the site reads fine
   without JavaScript.
   ===================================================================== */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  /* ---------- Footer year (the old site showed "© 1970") ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.innerHTML = open
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg><span class="sr-only">Close menu</span>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h10"/></svg><span class="sr-only">Open menu</span>';
    };
    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Header shadow, progress bar, back-to-top ---------- */
  var header = document.querySelector(".site-header");
  var bar = document.querySelector(".progress");
  var toTop = document.querySelector(".to-top");
  var onScroll = function () {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (bar) {
      var h = document.body.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
    if (toTop) toTop.classList.toggle("show", y > 900);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });

    /* Highlight the nav link of the section on screen */
    var links = {};
    document.querySelectorAll('.nav a[href*="#"]').forEach(function (a) {
      var id = a.getAttribute("href").split("#")[1];
      if (id) links[id] = a;
    });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = links[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
          a.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(links).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Click-to-load YouTube ----------
     Markup: <button class="yt" data-yt="VIDEO_ID" data-title="...">  */
  document.querySelectorAll(".yt[data-yt]").forEach(function (btn) {
    var id = btn.getAttribute("data-yt");
    btn.style.backgroundImage = "url(https://i.ytimg.com/vi/" + id + "/hqdefault.jpg)";
    btn.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.title = btn.getAttribute("data-title") || "Video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      f.allowFullscreen = true;
      btn.innerHTML = "";
      btn.appendChild(f);
    }, { once: true });
  });

  /* ---------- Publication Portfolio link ----------
     If the PDF has not been uploaded yet, the button falls back to the
     enquiry form so visitors never hit a broken link (the old site 404s). */
  document.querySelectorAll("[data-portfolio]").forEach(function (a) {
    var href = a.getAttribute("href");
    fetch(href, { method: "HEAD" }).then(function (r) {
      if (!r.ok) throw new Error("missing");
    }).catch(function () {
      a.setAttribute("href", a.getAttribute("data-fallback"));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
      var label = a.querySelector("[data-label]");
      if (label) label.textContent = "Request the Publication Portfolio";
    });
  });

  /* ---------- Insights filter (/insights page) ---------- */
  var filterBar = document.querySelector("[data-filters]");
  if (filterBar) {
    var cards = document.querySelectorAll("[data-domain]");
    var empty = document.querySelector(".empty-note");
    var apply = function (domain) {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = domain === "all" || c.getAttribute("data-domain") === domain;
        c.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.classList.toggle("show", shown === 0);
      filterBar.querySelectorAll(".filter").forEach(function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-filter") === domain ? "true" : "false");
      });
    };
    filterBar.addEventListener("click", function (e) {
      var b = e.target.closest(".filter");
      if (b) apply(b.getAttribute("data-filter"));
    });
  }

  /* ---------- Share: copy link ---------- */
  document.querySelectorAll("[data-copy-link]").forEach(function (b) {
    b.addEventListener("click", function () {
      var done = function () {
        var t = b.querySelector("[data-label]");
        if (!t) return;
        var old = t.textContent; t.textContent = "Link copied";
        setTimeout(function () { t.textContent = old; }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done, done);
    });
  });
})();
