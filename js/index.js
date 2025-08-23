// Newsletter + Back-to-top behaviors

// Subscribe (demo only)
document.getElementById("newsletterForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = (document.getElementById("newsletterEmail")?.value || "").trim();
  // simple email check
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  alert(ok ? "Thanks for subscribing! 🎉" : "Please enter a valid email.");
  if (ok) e.target.reset();
});

// Back to top
const toTop = document.getElementById("toTop");
const onScroll = () => {
  if (!toTop) return;
  const show = window.scrollY > 300;
  toTop.classList.toggle("show", show);
};
window.addEventListener("scroll", onScroll);
toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
onScroll(); // initial
/* =======================================================
   Home (index) — Feature/Arrivals: Auth-aware purchase action
   Requires: app.js (window.BH)
   ======================================================= */

function buildAddBtn() {
  const btn = document.createElement("button");
  btn.className = "btn tiny";
  btn.textContent = "Add to Cart";
  return btn;
}

function buildLoginLink() {
  const a = document.createElement("a");
  a.className = "muted-link";
  a.href = "./register.html";
  a.textContent = "Login / Register";
  return a;
}

function getCardData(card) {
  const title = card.querySelector(".book-title")?.textContent?.trim() || "Untitled";
  const priceText = card.querySelector(".price")?.textContent?.replace(/[^0-9.]/g, "") || "0";
  const price = parseFloat(priceText) || 0;
  const img = card.querySelector(".book-media img")?.getAttribute("src") || "";
  // use title as id (demo). In real app use a real id.
  return { id: title, title, price, img, qty: 1 };
}

function swapActionForCard(card, isLogged) {
  // Ensure there is an actions container in the footer
  let actions = card.querySelector(".book-footer .actions");
  if (!actions) {
    actions = document.createElement("div");
    actions.className = "actions";
    const footer = card.querySelector(".book-footer");
    if (!footer) return; // unexpected card shape
    // Move the existing link (if present) into actions so layout remains consistent
    const oldLink = footer.querySelector("a.muted-link");
    if (oldLink) oldLink.remove();
    footer.appendChild(actions);
  } else {
    // Clear existing content (login link or old button)
    actions.innerHTML = "";
  }

  if (isLogged) {
    const btn = buildAddBtn();
    btn.addEventListener("click", () => {
      const item = getCardData(card);
      const res = BH.addToCart(item);
      if (res.ok) alert(`Added "${item.title}" to your cart.`);
      else if (res.reason === "no-session") window.location.href = "./register.html";
    });
    actions.appendChild(btn);
  } else {
    actions.appendChild(buildLoginLink());
  }
}

function refreshAllCards() {
  const isLogged = !!BH.getSession();
  document.querySelectorAll(".book-card").forEach(card => swapActionForCard(card, isLogged));
}

// Keep nav/cart badge in sync with any other page actions
window.addEventListener("bh:cart-changed", () => BH.updateNav());

document.addEventListener("DOMContentLoaded", () => {
  // Initial pass
  refreshAllCards();

  // If you dynamically insert more cards later, call refreshAllCards() again.
});
