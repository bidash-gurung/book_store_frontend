// User Dashboard (front-end only) — requires app.js (window.BH)
(function () {
  "use strict";
  if (!window.BH) {
    console.error("Missing app.js (BH). Load app.js before dashboard.js");
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const loginGate = document.getElementById("loginGate");
    const dashLayout = document.getElementById("dashLayout");

    const avatarEl = document.getElementById("avatar");
    const dispNameEl = document.getElementById("displayName");
    const dispEmailEl = document.getElementById("displayEmail");

    const statOrders = document.getElementById("statOrders");
    const statWishlist = document.getElementById("statWishlist");
    const statCart = document.getElementById("statCart");

    const profileForm = document.getElementById("profileForm");
    const nameIn = document.getElementById("name");
    const emailIn = document.getElementById("email");
    const phoneIn = document.getElementById("phone");
    const addrIn = document.getElementById("address");
    const saveMsg = document.getElementById("saveMsg");

    const passForm = document.getElementById("passForm");
    const currentPass = document.getElementById("currentPass");
    const newPass = document.getElementById("newPass");
    const confirmPass = document.getElementById("confirmPass");
    const passMsg = document.getElementById("passMsg");

    const logoutBtn = document.getElementById("logoutBtn");
    const toTop = document.getElementById("toTop");

    // Gate
    function syncGate() {
      const s = BH.getSession();
      const loggedIn = !!s;
      loginGate.hidden = loggedIn;
      dashLayout.hidden = !loggedIn;
      return s;
    }
    let session = syncGate();
    if (!session) return;

    // Load user profile
    function loadProfile() {
      const { loadUsers } = BH;
      const users = loadUsers();
      const u = users.find((x) => x.email === session.email);
      if (!u) return;

      // display fields
      dispNameEl.textContent = u.name || "User";
      dispEmailEl.textContent = u.email;
      avatarEl.textContent = initials(u.name || u.email);

      // form fields (email immutable)
      nameIn.value = u.name || "";
      emailIn.value = u.email;
      phoneIn.value = u.phone || "";
      addrIn.value = u.address || "";

      // stats demo (cart count real; others placeholder)
      statCart.textContent = String(BH.cartCount(u.email));
      statOrders.textContent = String(u.orders || 0);
      statWishlist.textContent = String(u.wishlistCount || 0);
    }

    function initials(s) {
      const parts = String(s).trim().split(/\s+/).slice(0, 2);
      return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
    }

    // Save profile
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameIn.value.trim();
      const phone = phoneIn.value.trim();
      const addr = addrIn.value.trim();

      if (name.length < 2) {
        saveMsg.textContent = "Please enter your full name.";
        saveMsg.style.color = "#ef4444";
        return;
      }

      const { loadUsers, saveUsers, setSession } = BH;
      const users = loadUsers();
      const i = users.findIndex((x) => x.email === session.email);
      if (i < 0) return;

      users[i].name = name;
      users[i].phone = phone;
      users[i].address = addr;
      saveUsers(users);

      // reflect in session + navbar immediately
      setSession(
        { email: session.email, name },
        true /* keep remember flag safe */
      );
      session = BH.getSession();

      // refresh display
      loadProfile();
      BH.updateNav();

      saveMsg.textContent = "Saved!";
      saveMsg.style.color = "#16a34a";
      setTimeout(() => (saveMsg.textContent = ""), 1500);
    });

    // Password change (front-end demo)
    passForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const cur = currentPass.value;
      const np = newPass.value;
      const cf = confirmPass.value;

      if (np.length < 6) {
        passMsg.textContent = "New password must be at least 6 characters.";
        passMsg.style.color = "#ef4444";
        return;
      }
      if (np !== cf) {
        passMsg.textContent = "Passwords do not match.";
        passMsg.style.color = "#ef4444";
        return;
      }

      const { loadUsers, saveUsers, sha256 } = BH;
      const users = loadUsers();
      const i = users.findIndex((x) => x.email === session.email);
      if (i < 0) return;

      const curHash = await sha256(cur);
      if (users[i].passHash !== curHash) {
        passMsg.textContent = "Current password is incorrect.";
        passMsg.style.color = "#ef4444";
        return;
      }

      users[i].passHash = await sha256(np);
      saveUsers(users);
      currentPass.value = newPass.value = confirmPass.value = "";
      passMsg.textContent = "Password updated.";
      passMsg.style.color = "#16a34a";
      setTimeout(() => (passMsg.textContent = ""), 1500);
    });

    // Logout
    logoutBtn.addEventListener("click", () => {
      if (!confirm("Log out?")) return;
      BH.clearSession();
      BH.updateNav();
      syncGate(); // will show gate
      // Optionally, redirect home:
      window.location.href = "./index.html";
    });

    // Back to top
    const onScroll = () => toTop.classList.toggle("show", window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    toTop.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
    onScroll();

    // Storage/session sync across tabs
    window.addEventListener("storage", (e) => {
      if (e.key === BH.keys.session) {
        session = syncGate();
        if (session) {
          loadProfile();
          BH.updateNav();
        }
      }
    });
    window.addEventListener("bh:session-changed", () => {
      session = syncGate();
      if (session) {
        loadProfile();
        BH.updateNav();
      }
    });

    // Init
    loadProfile();
  });
})();
