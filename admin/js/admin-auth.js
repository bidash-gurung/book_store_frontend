// Simple admin login (demo only)
// Stores a boolean "admin_session" in localStorage
(function () {
  "use strict";

  const form = document.getElementById("adminLoginForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  // If already logged in, go straight to dashboard
  if (localStorage.getItem("admin_session") === "true") {
    window.location.href = "./admin-dashboard.html";
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const u = username.value.trim();
    const p = password.value;

    if (u === "admin" && p === "admin") {
      localStorage.setItem("admin_session", "true");
      // optional: stamp time
      localStorage.setItem("admin_session_at", new Date().toISOString());
      window.location.href = "./admin-dashboard.html";
    } else {
      alert("Invalid credentials. For demo use admin / admin.");
    }
  });
})();
