/* =======================================================
   BookHaven - Auth + Cart helpers (no backend)
   Keys:
     - localStorage["bh_users"]            : array of users
     - session/localStorage["bh_session"]  : {email, name}
     - localStorage["bh_cart_<email>"]     : array of items {id,title,price,qty,img}
   Events:
     - window 'bh:session-changed'         : detail { session }
     - window 'bh:cart-changed'            : detail { email, count }
   ======================================================= */
(() => {
  "use strict";

  const LS_USERS = "bh_users";
  const LS_SESSION = "bh_session";

  const byId = (id) => document.getElementById(id);
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Expose keys for other scripts (storage event filtering, etc.)
  const keys = Object.freeze({
    users: LS_USERS,
    session: LS_SESSION,
    cartPrefix: "bh_cart_",
  });

  // ---- Crypto helper (shared) ----
  async function sha256(text) {
    if (window.crypto?.subtle) {
      const enc = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest("SHA-256", enc);
      return [...new Uint8Array(buf)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    // fallback (demo only)
    return btoa(unescape(encodeURIComponent(text)));
  }

  // ---- Session ----
  function getSession() {
    const raw =
      sessionStorage.getItem(LS_SESSION) || localStorage.getItem(LS_SESSION);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(user, remember) {
    const payload = JSON.stringify({ email: user.email, name: user.name });
    if (remember) localStorage.setItem(LS_SESSION, payload);
    else sessionStorage.setItem(LS_SESSION, payload);
    updateNav();
    window.dispatchEvent(
      new CustomEvent("bh:session-changed", {
        detail: { session: getSession() },
      })
    );
  }

  function clearSession() {
    sessionStorage.removeItem(LS_SESSION);
    localStorage.removeItem(LS_SESSION);
    updateNav();
    window.dispatchEvent(
      new CustomEvent("bh:session-changed", { detail: { session: null } })
    );
  }

  // ---- Users ----
  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem(LS_USERS)) || [];
    } catch {
      return [];
    }
  }
  function saveUsers(users) {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
  }

  // ---- Cart (per-user) ----
  const cartKey = (email) => `${keys.cartPrefix}${email}`;
  function getCart(email) {
    if (!email) return [];
    try {
      return JSON.parse(localStorage.getItem(cartKey(email))) || [];
    } catch {
      return [];
    }
  }
  function setCart(email, items) {
    if (!email) return;
    localStorage.setItem(cartKey(email), JSON.stringify(items));
    updateNav();
    window.dispatchEvent(
      new CustomEvent("bh:cart-changed", {
        detail: { email, count: cartCount(email) },
      })
    );
  }
  function addToCart(item) {
    const session = getSession();
    if (!session) return { ok: false, reason: "no-session" };
    const items = getCart(session.email);
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) items[idx].qty += item.qty || 1;
    else items.push({ ...item, qty: item.qty || 1 });
    setCart(session.email, items);
    return { ok: true, count: cartCount(session.email) };
  }
  function cartCount(email) {
    const e = email || (getSession()?.email ?? "");
    if (!e) return 0;
    const items = getCart(e);
    return items.reduce((n, i) => n + (i.qty || 1), 0);
  }

  // ---- Navbar updater (Dashboard + Cart + Auth button) ----
  function updateNav() {
    const s = getSession();

    const dashBtn = byId("navDash"); // 👤 Dashboard (hidden if logged out)
    const cartBtn = byId("navCart"); // 🛒 Cart      (hidden if logged out)
    const cartCountEl = byId("cartCount");
    const authBtn = byId("navAuthBtn"); // switches text/target

    // Dashboard button
    if (dashBtn) {
      if (s) dashBtn.removeAttribute("hidden");
      else dashBtn.setAttribute("hidden", "hidden");
    }

    // Cart button + badge
    if (cartBtn && cartCountEl) {
      if (!s) {
        cartBtn.setAttribute("hidden", "hidden");
        cartCountEl.textContent = "0";
        cartCountEl.classList.remove("show");
      } else {
        cartBtn.removeAttribute("hidden");
        const count = cartCount(s.email);
        cartCountEl.textContent = String(count);
        cartCountEl.classList.toggle("show", count > 0);
      }
    }

    // Auth button (show name → link to dashboard; else Login/Register)
    // Auth button (blue button)
    if (authBtn) {
      if (s) {
        // show user name, link to dashboard
        authBtn.textContent = s.name || "Account";
        authBtn.href = "./dashboard.html";
        authBtn.onclick = null;
      } else {
        // show login/register
        authBtn.textContent = "Login / Register";
        authBtn.href = "./register.html";
        authBtn.onclick = null;
      }
    }
  }

  // ---- Cross-tab sync ----
  // If session/cart change in another tab, keep UI in sync.
  window.addEventListener("storage", (e) => {
    if (e.key === LS_SESSION || (e.key && e.key.startsWith(keys.cartPrefix))) {
      updateNav();
    }
  });

  // ---- Expose minimal API ----
  window.BH = {
    // constants/helpers
    keys,
    emailRe,
    sha256,
    // auth
    getSession,
    setSession,
    clearSession,
    loadUsers,
    saveUsers,
    // cart
    getCart,
    setCart,
    addToCart,
    cartCount,
    // ui
    updateNav,
  };

  // ---- Init on every page load ----
  document.addEventListener("DOMContentLoaded", updateNav);
})();
