// ----- Utilities -----
const $ = (sel) => document.querySelector(sel);

// ----- Footer year -----
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ----- Active nav link -----
(function setActiveNav(){
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav-link").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.classList.add("active");
  });
})();

// ----- Theme toggle with persistence -----
(function themeInit(){
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    document.documentElement.setAttribute("data-theme", saved);
  } else {
    // default: dark
    document.documentElement.setAttribute("data-theme", "dark");
  }

  const toggleBtn = $("#themeToggle");
  if (!toggleBtn) return;

  const syncLabel = () => {
    const t = document.documentElement.getAttribute("data-theme");
    toggleBtn.textContent = (t === "light") ? "☀️ Theme" : "🌙 Theme";
  };

  syncLabel();

  toggleBtn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = (current === "light") ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    syncLabel();
  });
})();

// ----- Home page: small interaction -----
const statusText = $("#statusText");
if (statusText) statusText.textContent = "Ready — exploring fundamentals.";

const confettiBtn = $("#confettiBtn");
if (confettiBtn) {
  confettiBtn.addEventListener("click", () => {
    // Lightweight celebration without libraries
    const msg = document.createElement("div");
    msg.textContent = "Nice! Keep shipping 🚀";
    msg.style.position = "fixed";
    msg.style.left = "50%";
    msg.style.top = "20px";
    msg.style.transform = "translateX(-50%)";
    msg.style.padding = "10px 14px";
    msg.style.borderRadius = "14px";
    msg.style.border = "1px solid rgba(255,255,255,0.18)";
    msg.style.background = "rgba(0,0,0,0.35)";
    msg.style.backdropFilter = "blur(8px)";
    msg.style.zIndex = "9999";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 1300);
  });
}

// ----- Contact form: client-only validation + feedback -----
const form = $("#contactForm");
const feedback = $("#formFeedback");

if (form && feedback) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.className = "feedback";

    const name = $("#name")?.value.trim();
    const email = $("#email")?.value.trim();
    const message = $("#message")?.value.trim();

    if (!name || !email || !message) {
      feedback.textContent = "Please fill out name, email, and message.";
      feedback.classList.add("err");
      return;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      feedback.textContent = "Please enter a valid email address.";
      feedback.classList.add("err");
      return;
    }

    feedback.textContent = "Message ready (frontend-only). Backend connection will be added later.";
    feedback.classList.add("ok");
    form.reset();
  });
}