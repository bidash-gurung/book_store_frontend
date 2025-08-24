/* =========================================================
   NAV: theme toggle, mobile menu, and auth button behavior
   - No logout confirm here
   - When logged in: blue button shows full name → dashboard
   - When logged out: blue button shows Login / Register
   ========================================================= */
(function () {
  // ---------- Theme toggle ----------
  const html = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved === "dark") html.classList.add("dark");

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    const updateIcon = () => {
      const span = themeBtn.querySelector(".icon");
      if (span)
        span.textContent = html.classList.contains("dark") ? "☀️" : "🌙";
    };
    updateIcon();

    themeBtn.addEventListener("click", () => {
      html.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        html.classList.contains("dark") ? "dark" : "light"
      );
      updateIcon();
    });
  }

  // ---------- Mobile menu ----------
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (e) => {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }
})();

(function () {
  // ---------- Auth button (blue) ----------
  const BTN_ID = "navAuthBtn";
  const btn = document.getElementById(BTN_ID);
  if (!btn) return;

  const readSession = () => {
    try {
      const raw =
        sessionStorage.getItem("bh_session") ||
        localStorage.getItem("bh_session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const updateAuthBtn = () => {
    const s = readSession();

    // clear any old click behavior
    btn.onclick = null;

    if (s) {
      // logged in → show full name, go to dashboard
      btn.textContent = s.name || "Account";
      btn.href = "./dashboard.html";
    } else {
      // logged out → login/register
      btn.textContent = "Login / Register";
      btn.href = "./register.html";
    }
  };

  // Initial paint
  updateAuthBtn();

  // Keep in sync across tabs / after login-logout
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    if (e.key === "bh_session") updateAuthBtn();
  });

  // If you dispatch a custom event in app.js on session change:
  // window.dispatchEvent(new CustomEvent("bh:session-changed", { detail: { session } }));
  window.addEventListener("bh:session-changed", updateAuthBtn);
})();
