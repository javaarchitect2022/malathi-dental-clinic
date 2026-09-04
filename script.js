/* ============================================================
   MALATHI DENTAL CLINIC — script.js (vanilla JS, no deps)
   ------------------------------------------------------------
   ★ UPDATE PHONE / WHATSAPP IN ONE PLACE ★
   ------------------------------------------------------------
   Display : 99004 01661
   tel:    : tel:+919900401661  (tapping calls the clinic)
   wa.me   : https://wa.me/919900401661 (opens WhatsApp chat)
   ============================================================ */
const CLINIC_PHONE_DISPLAY = "99004 01661";
const CLINIC_PHONE_TEL = "+919900401661";
const CLINIC_WHATSAPP = "919900401661"; // country code + number, no "+" or spaces
const CLINIC_WA_MESSAGE = "Hi, I'd like to book an appointment at Malathi Dental Clinic";

(function () {
  "use strict";

  /* ---------- 1. Apply phone / WhatsApp links everywhere ---------- */
  // All <a data-call-link> → tel: | all <a data-whatsapp-link> → wa.me/...
  function applyContactLinks() {
    const telHref = "tel:" + CLINIC_PHONE_TEL.replace(/\s+/g, "");
    const waHref =
      "https://wa.me/" +
      CLINIC_WHATSAPP.replace(/\D/g, "") +
      "?text=" +
      encodeURIComponent(CLINIC_WA_MESSAGE);

    document.querySelectorAll("[data-call-link]").forEach((a) => a.setAttribute("href", telHref));
    document.querySelectorAll("[data-whatsapp-link]").forEach((a) => a.setAttribute("href", waHref));
    document.querySelectorAll("[data-phone-label]").forEach((el) => {
      el.textContent = CLINIC_PHONE_DISPLAY;
    });
  }

  /* ---------- 2. Mobile nav ---------- */
  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    // Close on Escape for keyboard users
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  /* ---------- 3. Header shadow + scrollspy + floating buttons ---------- */
  function initScrollSpy() {
    const header = document.getElementById("site-header");
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const sections = links.map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
    function onScroll() {
      if (header) header.style.boxShadow = window.scrollY > 8 ? "0 4px 20px rgba(11,47,74,.12)" : "none";
      const fabs = document.getElementById("fab-stack");
      if (fabs) fabs.classList.toggle("visible", window.scrollY > 400);
      const pos = window.scrollY + 160;
      let current = sections[0];
      sections.forEach((s) => { if (s.offsetTop <= pos) current = s; });
      links.forEach((l) => l.classList.toggle("active", current && l.getAttribute("href") === "#" + current.id));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 4. Reveal on scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".service-card, .review-card, .cream-card, .blue-card, .form-card, .speciality-banner, .chip, .steps li, .faq, .stats-band-inner > div");
    els.forEach((el) => el.classList.add("reveal"));
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- 5. Booking form ---------- */
  function setError(input, message) {
    const group = input.closest(".form-group");
    const err = group ? group.querySelector(".error") : null;
    if (err) err.textContent = message || "";
    if (group) group.classList.toggle("invalid", Boolean(message));
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  // Local (device) date as YYYY-MM-DD — unlike toISOString() this does
  // not shift the day for IST (+05:30) near midnight.
  function localISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  /* Clinic hours: Mon–Sat 9:30 AM – 7:30 PM, Sunday closed.
     Drives the "Open now / Closed" badge in the topbar. */
  function initOpenBadge() {
    const badge = document.getElementById("open-badge");
    if (!badge) return;
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = day !== 0 && mins >= 9 * 60 + 30 && mins < 19 * 60 + 30;
    badge.textContent = open ? "● Open now" : "○ Closed · opens 9:30 AM (Mon–Sat)";
    badge.classList.toggle("open", open);
    badge.classList.toggle("closed", !open);
  }

  function initBookingForm() {
    const form = document.getElementById("booking-form");
    if (!form) return;
    const name = document.getElementById("f-name");
    const phone = document.getElementById("f-phone");
    const email = document.getElementById("f-email");
    const service = document.getElementById("f-service");
    const clinic = document.getElementById("f-clinic");
    const date = document.getElementById("f-date");
    const time = document.getElementById("f-time");
    const success = document.getElementById("form-success");

    // No Sunday bookings (Sunday Holiday) + no past dates (local date!)
    const isoToday = localISODate(new Date());
    date.setAttribute("min", isoToday);

    [name, phone, email, service, clinic, date, time].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => setError(input, ""));
      input.addEventListener("change", () => setError(input, ""));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      if (!name.value.trim() || name.value.trim().length < 2) { setError(name, "Please enter the patient name."); ok = false; }
      const digits = phone.value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
      if (digits.length !== 10) { setError(phone, "Please enter a valid 10-digit mobile number."); ok = false; }
      if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, "Please enter a valid email address."); ok = false; }
      if (!service.value) { setError(service, "Please select a treatment."); ok = false; }
      if (!clinic.value) { setError(clinic, "Please select a preferred clinic."); ok = false; }
      if (!date.value) { setError(date, "Please pick a date."); ok = false; }
      else if (date.value < isoToday) { setError(date, "Date cannot be in the past."); ok = false; }
      else if (new Date(date.value + "T00:00:00").getDay() === 0) { setError(date, "Clinic is closed on Sundays — please pick another day."); ok = false; }
      if (!time.value) { setError(time, "Please pick a time slot."); ok = false; }

      if (!ok) {
        const firstInvalid = form.querySelector(".form-group.invalid input, .form-group.invalid select");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const booking = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim(),
        service: service.value,
        clinic: clinic.value,
        date: date.value,
        time: time.value,
        message: document.getElementById("f-msg").value.trim(),
        createdAt: new Date().toISOString(),
      };

      /* ======================================================
         ★ CONNECT A REAL BACKEND / BOOKING API HERE ★
         Front-end only right now (shows confirmation below).
         To go live, POST the `booking` object, e.g.:

           await fetch("https://your-api.com/api/appointments", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(booking)
           });

         Or forward to the clinic on WhatsApp:
           const text = encodeURIComponent(
             `New appointment: ${booking.name}, ${booking.phone}, ` +
             `${booking.service} @ ${booking.clinic} on ${booking.date} (${booking.time})`
           );
           window.open(`https://wa.me/${CLINIC_WHATSAPP}?text=${text}`, "_blank");
         ====================================================== */
      // Booking confirmed client-side (no backend yet — see note below).
      handleBookingSubmit(booking);
    });

    function handleBookingSubmit(booking) {
      document.getElementById("success-name").textContent = booking.name.split(" ")[0] || "friend";
      document.getElementById("success-slot").textContent =
        booking.service + " @ " + booking.clinic + " on " + booking.date + " · " + booking.time;
      // Direct send: open the clinic's WhatsApp with the full booking
      // pre-filled — the patient just hits send. Runs in the submit
      // (user-gesture) handler so popup blockers allow it.
      const raw =
        "Hi Malathi Dental Clinic! I'd like to confirm my appointment:\n" +
        "Name: " + booking.name +
        "\nPhone: " + booking.phone +
        "\nTreatment: " + booking.service +
        "\nClinic: " + booking.clinic +
        "\nPreferred: " + booking.date + " (" + booking.time + ")" +
        (booking.email ? "\nEmail: " + booking.email : "") +
        (booking.message ? "\nNote: " + booking.message : "");
      const waURL = "https://wa.me/" + CLINIC_WHATSAPP.replace(/\D/g, "") + "?text=" + encodeURIComponent(raw);
      const waFallback = document.getElementById("success-whatsapp");
      if (waFallback) waFallback.setAttribute("href", waURL);
      try { window.open(waURL, "_blank", "noopener"); } catch (err) { /* fallback link above covers this */ }
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "nearest" });
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = "Request Sent ✓";
      submitBtn.disabled = true; // prevent accidental double-booking
    }

    const resetBtn = document.getElementById("form-reset");
    if (resetBtn) resetBtn.addEventListener("click", () => {
      form.reset();
      success.hidden = true;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = "Request Appointment";
      submitBtn.disabled = false;
      name.focus();
    });
  }

  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- 6. Animated trust-band counters (honest figures only) ---------- */
  function initCounters() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      if (reduced || !isFinite(target)) { el.textContent = target.toFixed(decimals); return; }
      const dur = 1200;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(animate); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- 7. Symptom chips → pre-fill treatment in booking form ---------- */
  function initChips() {
    const select = document.getElementById("f-service");
    if (!select) return;
    document.querySelectorAll(".chip[data-treatment]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const want = chip.dataset.treatment;
        Array.from(select.options).forEach((o) => {
          if (o.text.trim() === want) select.selectedIndex = o.index;
        });
        setError(select, "");
      });
    });
  }

  /* ---------- 8. Sticky mobile bar: hide while booking form is visible ---------- */
  function initMobileBar() {
    const bar = document.getElementById("mobile-bar");
    const contact = document.getElementById("contact");
    if (!bar || !contact || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => bar.classList.toggle("hidden", e.isIntersecting));
    }, { threshold: 0.08 });
    io.observe(contact);
  }

  /* ---------- 9. Lock page zoom on touch devices ----------
     Android respects the viewport meta above; iOS Safari ignores it,
     so pinch (gesturestart) and double-tap zoom are blocked here.
     Normal taps and scrolling are unaffected. */
  function initNoZoom() {
    if (!("ontouchstart" in window)) return;
    document.addEventListener("gesturestart", (e) => e.preventDefault());
    let lastTouch = 0;
    document.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (now - lastTouch < 300) e.preventDefault(); // double-tap zoom
      lastTouch = now;
    }, { passive: false });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyContactLinks();
    initNav();
    initScrollSpy();
    initReveal();
    initBookingForm();
    initYear();
    initOpenBadge();
    initCounters();
    initChips();
    initMobileBar();
    initNoZoom();
  });
})();
