/* ============================================================
   MALATHI DENTAL CLINIC — script.js
   World-Class Interactive Platform Logic (Zero Dependencies)
   ============================================================ */

const CLINIC_PHONE_DISPLAY = "99004 01661";
const CLINIC_PHONE_TEL = "+919900401661";
const CLINIC_WHATSAPP = "919900401661"; // 10 digits with 91 country code, no + or spaces
const CLINIC_WA_MESSAGE = "Hi, I would like to book an appointment at Malathi Dental Clinic";

// Silent FormSubmit backup endpoint (preserves all booking inquiries reliably)
const BACKUP_ENDPOINT = "https://formsubmit.co/ajax/malathi.thandapani@gmail.com";

// Google Ads conversion labels (fill when conversion actions are created)
const GOOGLE_ADS_BOOKING_LABEL = "";
const GOOGLE_ADS_CALL_LABEL = "";
const GOOGLE_ADS_WHATSAPP_LABEL = "";

(function () {
  "use strict";

  /* ---------- 1. Apply Dynamic Contact Links ---------- */
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

  /* ---------- 2. Live Clinic Hours Indicator ---------- */
  function initOpenBadge() {
    const badge = document.getElementById("live-status");
    if (!badge) return;

    const now = new Date();
    const day = now.getDay(); // 0 = Sunday
    const mins = now.getHours() * 60 + now.getMinutes();
    const openMins = 9 * 60 + 30;  // 9:30 AM
    const closeMins = 19 * 60 + 30; // 7:30 PM

    const isOpen = day !== 0 && mins >= openMins && mins < closeMins;

    if (isOpen) {
      badge.innerHTML = '<span class="status-dot"></span> Open Now · Closes 7:30 PM';
      badge.className = "live-status open";
    } else {
      const nextText = day === 0 ? "Closed Today (Sunday) · Opens Mon 9:30 AM" : "Closed Now · Opens 9:30 AM";
      badge.innerHTML = '<span class="status-dot"></span> ' + nextText;
      badge.className = "live-status closed";
    }
  }

  /* ---------- 3. Mobile Navigation Drawer ---------- */
  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    }

    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));

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

  /* ---------- 4. Header Shadow, ScrollSpy & Floating FABs ---------- */
  function initScrollSpy() {
    const header = document.getElementById("site-header");
    const fabs = document.getElementById("fab-stack");
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const sections = links
      .map((l) => document.querySelector(l.getAttribute("href")))
      .filter(Boolean);

    function onScroll() {
      const scrollY = window.scrollY;
      if (header) {
        header.classList.toggle("scrolled", scrollY > 10);
      }
      if (fabs) {
        fabs.classList.toggle("visible", scrollY > 350);
      }

      // Highlight active nav item
      const pos = scrollY + 160;
      let currentSection = null;
      sections.forEach((s) => {
        if (s.offsetTop <= pos) currentSection = s;
      });

      links.forEach((l) => {
        const targetId = l.getAttribute("href");
        const isActive = currentSection && targetId === "#" + currentSection.id;
        l.classList.toggle("active", Boolean(isActive));
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 5. Interactive Patient Triage Integration ---------- */
  function initTriage() {
    const cards = document.querySelectorAll("[data-triage-service]");
    const serviceSelect = document.getElementById("f-service");
    const bookingSection = document.getElementById("booking-section");

    cards.forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const serviceName = card.getAttribute("data-triage-service");
        if (serviceSelect && serviceName) {
          serviceSelect.value = serviceName;
          serviceSelect.dispatchEvent(new Event("change"));
        }
        if (bookingSection) {
          bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(() => {
            const nameInput = document.getElementById("f-name");
            if (nameInput) nameInput.focus();
          }, 450);
        }
      });
    });
  }

  /* ---------- 6. Two Clinic Locations Tab Switcher ---------- */
  function initBranchTabs() {
    const tabBtns = document.querySelectorAll(".branch-tab-btn");
    const tabPanes = document.querySelectorAll(".branch-pane");
    const clinicSelect = document.getElementById("f-clinic");

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-branch-target");

        tabBtns.forEach((b) => b.classList.remove("active"));
        tabPanes.forEach((p) => p.classList.remove("active"));

        btn.classList.add("active");
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add("active");

        // Sync clinic dropdown if relevant
        if (clinicSelect) {
          if (targetId === "branch-maruthi") {
            clinicSelect.value = "Clinic 1 — Maruthi Layout";
          } else if (targetId === "branch-hosa") {
            clinicSelect.value = "Clinic 2 — Hosa Road / Gregorian Nagar";
          }
        }
      });
    });
  }

  /* ---------- 7. Local ISO Date Helper ---------- */
  function getLocalISODate(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  /* ---------- 8. High-Converting Booking Engine ---------- */
  function setError(input, message) {
    const group = input.closest(".form-group");
    if (!group) return;
    const err = group.querySelector(".form-error");
    if (err) err.textContent = message || "";
    group.classList.toggle("invalid", Boolean(message));
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }

  function sendBackupSilent(booking) {
    if (!BACKUP_ENDPOINT) return;
    try {
      const payload = JSON.stringify(booking);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(BACKUP_ENDPOINT, new Blob([payload], { type: "application/json" }));
      } else {
        fetch(BACKUP_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch (_) {}
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
    const note = document.getElementById("f-msg");
    const successCard = document.getElementById("form-success");

    // Min date = today (local IST)
    const todayISO = getLocalISODate();
    if (date) date.setAttribute("min", todayISO);

    // Clear errors on input
    [name, phone, email, service, clinic, date].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => setError(input, ""));
      input.addEventListener("change", () => setError(input, ""));
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      // Name validation
      if (!name.value.trim() || name.value.trim().length < 2) {
        setError(name, "Please enter the patient's name.");
        isValid = false;
      }

      // 10-digit mobile number validation
      const digits = phone.value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
      if (digits.length !== 10) {
        setError(phone, "Please enter a valid 10-digit Indian mobile number.");
        isValid = false;
      }

      // Email validation (optional)
      if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        setError(email, "Please provide a valid email address.");
        isValid = false;
      }

      // Treatment validation
      if (!service.value) {
        setError(service, "Please choose a treatment or consultation.");
        isValid = false;
      }

      // Clinic branch validation
      if (!clinic.value) {
        setError(clinic, "Please select your preferred clinic branch.");
        isValid = false;
      }

      // Date validation (not past, not Sunday)
      if (!date.value) {
        setError(date, "Please choose your preferred appointment date.");
        isValid = false;
      } else if (date.value < todayISO) {
        setError(date, "Appointment date cannot be in the past.");
        isValid = false;
      } else {
        const selectedDate = new Date(date.value + "T00:00:00");
        if (selectedDate.getDay() === 0) {
          setError(date, "Our clinics are closed on Sundays. Please select Mon–Sat.");
          isValid = false;
        }
      }

      // Time slot
      const selectedTimeChip = form.querySelector('input[name="time_slot"]:checked');
      const timeVal = selectedTimeChip ? selectedTimeChip.value : "Anytime during clinic hours";

      if (!isValid) {
        const firstInvalid = form.querySelector(".form-group.invalid input, .form-group.invalid select");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const bookingData = {
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email ? email.value.trim() : "",
        service: service.value,
        clinic: clinic.value,
        date: date.value,
        time: timeVal,
        message: note ? note.value.trim() : "",
        submittedAt: new Date().toISOString(),
      };

      // Format WhatsApp Message
      const waText =
        "✨ *New Appointment Request — Malathi Dental Clinic*\n\n" +
        "👤 *Patient:* " + bookingData.name + "\n" +
        "📱 *Phone:* " + bookingData.phone + "\n" +
        "🦷 *Treatment:* " + bookingData.service + "\n" +
        "📍 *Clinic:* " + bookingData.clinic + "\n" +
        "📅 *Date & Slot:* " + bookingData.date + " (" + bookingData.time + ")" +
        (bookingData.email ? "\n📧 *Email:* " + bookingData.email : "") +
        (bookingData.message ? "\n📝 *Note:* " + bookingData.message : "") +
        "\n\n_Sent via malathidental.com_";

      const waURL =
        "https://wa.me/" +
        CLINIC_WHATSAPP.replace(/\D/g, "") +
        "?text=" +
        encodeURIComponent(waText);

      // 1. Fire silent backup
      sendBackupSilent(bookingData);

      // 2. Fire Google Ads conversion tracking
      trackAdsEvent("appointment_request", GOOGLE_ADS_BOOKING_LABEL);

      // 3. Open WhatsApp directly
      try {
        window.open(waURL, "_blank", "noopener");
      } catch (_) {}

      // 4. Update Success View
      document.getElementById("success-patient-name").textContent =
        bookingData.name.split(" ")[0] || "Friend";
      document.getElementById("success-details-summary").textContent =
        `${bookingData.service} at ${bookingData.clinic} on ${bookingData.date} (${bookingData.time})`;

      const fallbackWaLink = document.getElementById("success-wa-link");
      if (fallbackWaLink) fallbackWaLink.setAttribute("href", waURL);

      form.style.display = "none";
      if (successCard) {
        successCard.hidden = false;
        successCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    // Reset Form Button
    const resetBtn = document.getElementById("booking-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        form.reset();
        form.style.display = "block";
        if (successCard) successCard.hidden = true;
        name.focus();
      });
    }
  }

  /* ---------- 9. WhatsApp Enquire Links on Service Cards ---------- */
  function initEnquireLinks() {
    const base = "https://wa.me/" + CLINIC_WHATSAPP.replace(/\D/g, "");
    document.querySelectorAll("[data-wa-enquire]").forEach((a) => {
      const msg = a.getAttribute("data-wa-enquire");
      a.setAttribute("href", base + "?text=" + encodeURIComponent(msg));
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
  }

  /* ---------- 10. Sticky Mobile Bottom Bar Auto-Hide ---------- */
  function initMobileBar() {
    const bar = document.getElementById("mobile-bar");
    const bookingSec = document.getElementById("booking-section");
    if (!bar || !bookingSec || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => bar.classList.toggle("hidden", e.isIntersecting));
      },
      { threshold: 0.1 }
    );
    io.observe(bookingSec);
  }

  /* ---------- 11. Google Ads Event Tracking ---------- */
  function trackAdsEvent(eventName, label) {
    try {
      if (typeof gtag !== "function") return;
      if (label) gtag("event", "conversion", { send_to: label });
      else gtag("event", eventName);
    } catch (_) {}
  }

  function initAdsTracking() {
    document.querySelectorAll("[data-call-link]").forEach((a) => {
      a.addEventListener("click", () => trackAdsEvent("call_click", GOOGLE_ADS_CALL_LABEL));
    });
    document.querySelectorAll("[data-whatsapp-link], [data-wa-enquire]").forEach((a) => {
      a.addEventListener("click", () => trackAdsEvent("whatsapp_click", GOOGLE_ADS_WHATSAPP_LABEL));
    });
  }

  /* ---------- 12. Dynamic Year ---------- */
  function initYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------- DOMContentLoaded Bootstrap ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    applyContactLinks();
    initOpenBadge();
    initNav();
    initScrollSpy();
    initTriage();
    initBranchTabs();
    initBookingForm();
    initEnquireLinks();
    initMobileBar();
    initAdsTracking();
    initYear();
  });
})();
