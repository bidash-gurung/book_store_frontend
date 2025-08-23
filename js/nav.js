(function () {
  const html = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved === "dark") html.classList.add("dark");

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    const updateIcon = () => themeBtn.querySelector(".icon").textContent =
      html.classList.contains("dark") ? "☀️" : "🌙";
    updateIcon();

    themeBtn.addEventListener("click", () => {
      html.classList.toggle("dark");
      localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
      updateIcon();
    });
  }

  // mobile menu
  const toggle = document.querySelector(".nav-toggle");
  const links  = document.querySelector(".nav-links");
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
  const BTN_ID = "navAuthBtn";
  const btn = document.getElementById(BTN_ID);
  if (!btn) return;

  const session = sessionStorage.getItem("bh_session") || localStorage.getItem("bh_session");
  if (session) {
    const { name } = JSON.parse(session);
    btn.textContent = `Logout (${name.split(" ")[0]})`;
    btn.href = "#";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Log out?")) {
        sessionStorage.removeItem("bh_session");
        localStorage.removeItem("bh_session");
        location.reload();
      }
    }, { once: true });
  }
})();
