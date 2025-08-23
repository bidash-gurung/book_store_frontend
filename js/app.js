/* =======================================================
   BookHaven - Auth + Cart helpers (no backend)
   Keys:
     - localStorage["bh_users"]          : array of users
     - session/localStorage["bh_session"]: {email, name}
     - localStorage["bh_cart_<email>"]   : array of items {id,title,price,qty,img}
   ======================================================= */
(() => {
  const LS_USERS   = "bh_users";
  const LS_SESSION = "bh_session";

  const byId = (id) => document.getElementById(id);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---- Session ----
  function getSession() {
    const raw = sessionStorage.getItem(LS_SESSION) || localStorage.getItem(LS_SESSION);
    return raw ? JSON.parse(raw) : null;
  }
  function setSession(user, remember) {
    const payload = JSON.stringify({ email: user.email, name: user.name });
    if (remember) localStorage.setItem(LS_SESSION, payload);
    else sessionStorage.setItem(LS_SESSION, payload);
    // ensure cart badge updates
    updateNav();
  }
  function clearSession() {
    sessionStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_SESSION);
    updateNav();
  }

  // ---- Users ----
  function loadUsers() {
    try { return JSON.parse(localStorage.getItem(LS_USERS)) || []; }
    catch { return []; }
  }
  function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }

  // ---- Cart (per-user) ----
  const cartKey = (email) => `bh_cart_${email}`;
  function getCart(email) {
    try { return JSON.parse(localStorage.getItem(cartKey(email))) || []; }
    catch { return []; }
  }
  function setCart(email, items) {
    localStorage.setItem(cartKey(email), JSON.stringify(items));
    updateNav();
    window.dispatchEvent(new CustomEvent("bh:cart-changed", { detail: { email, count: cartCount(email) } }));
  }
  function addToCart(item) {
    const session = getSession();
    if (!session) return { ok: false, reason: "no-session" };
    const items = getCart(session.email);
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx].qty += item.qty || 1;
    else items.push({ ...item, qty: item.qty || 1 });
    setCart(session.email, items);
    return { ok: true, count: cartCount(session.email) };
  }
  function cartCount(email) {
    const items = getCart(email || (getSession()?.email ?? ""));
    return items.reduce((n, i) => n + i.qty, 0);
  }

  // ---- Navbar updater (auth name + cart badge) ----
  function updateNav() {
    const s = getSession();
    const authBtn = byId("navAuthBtn");
    const cartBtn = byId("navCart");
    const cartCountEl = byId("cartCount");

    if (authBtn) {
      if (s) {
        authBtn.textContent = s.name;     // full name
        authBtn.href = "#";
        authBtn.onclick = (e) => {
          e.preventDefault();
          if (confirm("Log out?")) clearSession();
        };
      } else {
        authBtn.textContent = "Login / Register";
        authBtn.href = "./register.html";
        authBtn.onclick = null;
      }
    }

    if (cartBtn && cartCountEl) {
      if (!s) {
        cartBtn.setAttribute("hidden", "hidden");
        cartCountEl.textContent = "0";
      } else {
        cartBtn.removeAttribute("hidden");
        const count = cartCount(s.email);
        cartCountEl.textContent = String(count);
        cartCountEl.classList.toggle("show", count > 0);
      }
    }
  }

  // Expose minimal API
  window.BH = {
    // auth
    getSession, setSession, clearSession, loadUsers, saveUsers, emailRe,
    // cart
    getCart, setCart, addToCart, cartCount,
    // ui
    updateNav
  };

  // Init on every page load
  document.addEventListener("DOMContentLoaded", updateNav);
})();
