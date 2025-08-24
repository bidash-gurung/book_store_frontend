// BookHaven Auth (register/login) — uses helpers from app.js (window.BH)
(function () {
  'use strict';

  if (!window.BH) {
    console.error('Missing app.js (BH). Load app.js before register.js');
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    // --- pull helpers from BH (no re-declarations) ---
    const { emailRe, loadUsers, saveUsers, setSession, getSession } = BH;

    // Tabs & panels
    const tabLogin    = document.getElementById('tab-login');
    const tabSignup   = document.getElementById('tab-signup');
    const panelLogin  = document.getElementById('panel-login');
    const panelSignup = document.getElementById('panel-signup');

    const goSignup = document.getElementById('goSignup');
    const goLogin  = document.getElementById('goLogin');

    const toTop = document.getElementById('toTop');

    const show = (tab) => {
      const isLogin = tab === 'login';
      if (tabLogin && tabSignup) {
        tabLogin.classList.toggle('active', isLogin);
        tabSignup.classList.toggle('active', !isLogin);
        tabLogin.setAttribute('aria-selected', isLogin);
        tabSignup.setAttribute('aria-selected', !isLogin);
      }
      if (panelLogin && panelSignup) {
        panelLogin.classList.toggle('show', isLogin);
        panelSignup.classList.toggle('show', !isLogin);
      }
    };

    const notify = (msg) => alert(msg);

    // Tab wiring
    tabLogin?.addEventListener('click', () => show('login'));
    tabSignup?.addEventListener('click', () => show('signup'));
    goSignup?.addEventListener('click', (e) => { e.preventDefault(); show('signup'); });
    goLogin?.addEventListener('click', (e) => { e.preventDefault(); show('login'); });

    // Show/Hide password toggles
    document.querySelectorAll('.pass-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-target');
        const input = document.getElementById(id);
        if (!input) return;
        const nextType = input.type === 'password' ? 'text' : 'password';
        input.type = nextType;
        btn.setAttribute('aria-label', nextType === 'password' ? 'Show password' : 'Hide password');
      });
    });

    // Hash helper
    async function sha256(text) {
      if (window.crypto?.subtle) {
        const enc = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest('SHA-256', enc);
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
      }
      // fallback (demo only)
      return btoa(unescape(encodeURIComponent(text)));
    }

    // ------- REGISTER -------
    panelSignup?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = document.getElementById('name').value.trim();
      const email   = document.getElementById('signupEmail').value.trim().toLowerCase();
      const pass    = document.getElementById('signupPassword').value;
      const confirm = document.getElementById('confirmPassword').value;
      const tos     = document.getElementById('tos').checked;

      if (name.length < 2)          return notify('Please enter your full name.');
      if (!emailRe.test(email))     return notify('Enter a valid email address.');
      if (pass.length < 6)          return notify('Password must be at least 6 characters.');
      if (pass !== confirm)         return notify('Passwords do not match.');
      if (!tos)                     return notify('Please agree to the Terms & Privacy.');

      const users = loadUsers();
      if (users.some(u => u.email === email)) return notify('An account with this email already exists.');

      const passHash = await sha256(pass);
      users.push({ name, email, passHash, createdAt: new Date().toISOString() });
      saveUsers(users);

      notify('Account created 🎉 You can now log in.');
      show('login');
      const loginEmail = document.getElementById('loginEmail');
      if (loginEmail) loginEmail.value = email;
    });

    // ------- LOGIN -------
    panelLogin?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pass     = document.getElementById('loginPassword').value;
      const remember = document.getElementById('remember').checked;

      if (!emailRe.test(email)) return notify('Enter a valid email address.');
      if (pass.length < 6)      return notify('Password must be at least 6 characters.');

      const users = loadUsers();
      const user  = users.find(u => u.email === email);
      if (!user) return notify('No account found for this email.');

      const passHash = await sha256(pass);
      if (user.passHash !== passHash) return notify('Incorrect password.');

      // start session via shared helper (updates navbar/cart too)
      setSession({ email, name: user.name }, remember);
      alert(`Welcome back, ${user.name}!`);
      window.location.href = './index.html';
    });

    // ------- Back to top -------
    const onScroll = () => toTop?.classList.toggle('show', window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();

    // If already logged in, you can optionally redirect:
    // const existing = getSession();
    // if (existing) window.location.href = './index.html';
  });
})();
