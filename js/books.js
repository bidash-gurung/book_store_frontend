/* ============================
   BOOKS PAGE LOGIC
   Requires: app.js (window.BH)
   ============================ */

// ---------- Mock data ----------
const BOOKS = [
  { title: "The Midnight Library", author: "Matt Haig", genre: "Fiction",    price: 12.99, rating: 4.5, img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop", featured: true },
  { title: "Atomic Habits",        author: "James Clear", genre: "Self‑Help", price: 14.95, rating: 5,   img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=1200&auto=format&fit=crop", featured: true, isNew: true },
  { title: "Project Hail Mary",    author: "Andy Weir",   genre: "Sci‑Fi",    price: 16.99, rating: 4.4, img: "https://images.unsplash.com/photo-1519681394605-5f7f14f4a2d3?q=80&w=1200&auto=format&fit=crop", isNew: true },
  { title: "Educated",             author: "Tara Westover", genre: "Memoir",  price: 13.99, rating: 4.2, img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop", featured: true },
  { title: "The Last Thing He Told Me", author: "Laura Dave", genre: "Mystery", price: 11.99, rating: 4.1, img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop", isNew: true },
  { title: "The Four Winds", author: "Kristin Hannah", genre: "Historical Fiction", price: 14.5, rating: 4.6, img: "https://images.unsplash.com/photo-1526318472351-1d0f9e8f7d6e?q=80&w=1200&auto=format&fit=crop", isNew: true },
  { title: "The Invisible Life of Addie LaRue", author: "V.E. Schwab", genre: "Fantasy", price: 12.99, rating: 4.0, img: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1200&auto=format&fit=crop" },
  { title: "The Hill We Climb", author: "Amanda Gorman", genre: "Poetry", price: 9.99, rating: 4.3, img: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200&auto=format&fit=crop", isNew: true },
  { title: "The Song of Achilles", author: "Madeline Miller", genre: "Fiction", price: 15.50, rating: 4.8, img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1200&auto=format&fit=crop" },
  { title: "Klara and the Sun", author: "Kazuo Ishiguro", genre: "Sci‑Fi", price: 14.30, rating: 4.1, img: "https://images.unsplash.com/photo-1526318472351-1d0f9e8f7d6e?q=80&w=1200&auto=format&fit=crop" },
  { title: "Think Again", author: "Adam Grant", genre: "Self‑Help", price: 13.40, rating: 4.2, img: "https://images.unsplash.com/photo-1483817101829-339b08e8d83f?q=80&w=1200&auto=format&fit=crop" },
  { title: "The Vanishing Half", author: "Brit Bennett", genre: "Fiction", price: 12.20, rating: 4.4, img: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop" },
];

// ---------- Elements ----------
const gridEl      = document.getElementById("booksGrid");
const searchInput = document.getElementById("search");
const genreChecks = [...document.querySelectorAll('input[name="genre"]')];
const priceMin    = document.getElementById("priceMin");
const priceMax    = document.getElementById("priceMax");
const minRating   = document.getElementById("minRating");
const sortSel     = document.getElementById("sort");
const applyBtn    = document.getElementById("applyFilters");
const clearBtn    = document.getElementById("clearFilters");
const pageWrap    = document.querySelector(".wrap");
const toTop       = document.getElementById("toTop");

// View toggle
const viewGridBtn = document.getElementById("viewGrid");
const viewListBtn = document.getElementById("viewList");

// ---------- Render helpers ----------
const stars = () => "★★★★★";

function card(b, isLogged) {
  return `
  <article class="book-card">
    <div class="book-media">
      <img src="${b.img}" alt="${b.title} cover">
      <div class="badge-row">
        ${b.isNew ? '<span class="badge new">New</span>' : '<span></span>'}
        ${b.featured ? '<span class="badge">Featured</span>' : '<span></span>'}
      </div>
    </div>
    <div class="book-body">
      <h3 class="book-title">${b.title}</h3>
      <p class="book-author">${b.author}</p>
      <div class="book-meta">
        <span class="chip">${b.genre}</span>
        <span class="stars" aria-label="${b.rating} stars">${stars(b.rating)}</span>
      </div>
      <div class="book-footer">
        <div class="price">$${b.price.toFixed(2)}</div>
        <div class="actions">
          ${
            isLogged
              ? `<button class="btn tiny add-cart"
                   data-id="${b.title}"
                   data-title="${b.title}"
                   data-price="${b.price}"
                   data-img="${b.img}">
                   Add to Cart
                 </button>`
              : `<a class="muted-link" href="./register.html">Login / Register</a>`
          }
        </div>
      </div>
    </div>
  </article>`;
}

// ---------- Filter + Sort ----------
function getFilters() {
  const q = (searchInput?.value || "").toLowerCase();
  const activeGenres = new Set(genreChecks.filter(c => c.checked).map(c => c.value));
  const minP = parseFloat(priceMin.value || "0");
  const maxP = parseFloat(priceMax.value || Number.POSITIVE_INFINITY);
  const minR = parseFloat(minRating.value || "0");
  return { q, activeGenres, minP, maxP, minR };
}

function applyFilters() {
  const f = getFilters();
  const isLogged = !!BH.getSession();

  let list = BOOKS.filter(b =>
    (f.activeGenres.size === 0 || f.activeGenres.has(b.genre)) &&
    (b.price >= f.minP && b.price <= f.maxP) &&
    (b.rating >= f.minR) &&
    (
      b.title.toLowerCase().includes(f.q) ||
      b.author.toLowerCase().includes(f.q)
    )
  );

  switch (sortSel.value) {
    case "author":     list.sort((a,b) => a.author.localeCompare(b.author)); break;
    case "price-asc":  list.sort((a,b) => a.price - b.price); break;
    case "price-desc": list.sort((a,b) => b.price - a.price); break;
    case "rating-desc":list.sort((a,b) => b.rating - a.rating); break;
    default:           list.sort((a,b) => a.title.localeCompare(b.title));
  }

  gridEl.innerHTML = list.map(b => card(b, isLogged)).join("");
  document.getElementById("pageInfo").textContent = `Showing ${list.length} of ${BOOKS.length}`;

  if (isLogged) bindAddToCart();
}

function resetFilters() {
  if (searchInput) searchInput.value = "";
  priceMin.value = "";
  priceMax.value = "";
  minRating.value = "0";
  genreChecks.forEach(c => c.checked = false);
  sortSel.value = "title";
  applyFilters();
}

// ---------- Cart binding ----------
function bindAddToCart() {
  document.querySelectorAll(".add-cart").forEach(btn => {
    btn.addEventListener("click", () => {
      const session = BH.getSession();
      if (!session) {
        window.location.href = "./register.html";
        return;
      }
      const item = {
        id: btn.dataset.id,
        title: btn.dataset.title,
        price: parseFloat(btn.dataset.price),
        img: btn.dataset.img,
        qty: 1
      };
      const res = BH.addToCart(item);
      if (res.ok) alert(`Added "${item.title}" to your cart.`);
    });
  });
}

// ---------- View toggle ----------
function setView(mode) {
  if (mode === "list") {
    gridEl.classList.add("list");
    viewListBtn.classList.add("active");
    viewGridBtn.classList.remove("active");
    viewListBtn.setAttribute("aria-selected", "true");
    viewGridBtn.setAttribute("aria-selected", "false");
  } else {
    gridEl.classList.remove("list");
    viewGridBtn.classList.add("active");
    viewListBtn.classList.remove("active");
    viewGridBtn.setAttribute("aria-selected", "true");
    viewListBtn.setAttribute("aria-selected", "false");
  }
}
viewGridBtn.addEventListener("click", () => setView("grid"));
viewListBtn.addEventListener("click", () => setView("list"));

// ---------- Events ----------
applyBtn.addEventListener("click", applyFilters);
clearBtn.addEventListener("click", resetFilters);
[searchInput, sortSel, minRating].forEach(el => el?.addEventListener("input", applyFilters));
genreChecks.forEach(c => c.addEventListener("change", applyFilters));
[priceMin, priceMax].forEach(i => i.addEventListener("change", applyFilters));

// Keep badge in sync if cart changes elsewhere
window.addEventListener("bh:cart-changed", () => BH.updateNav());

// Back to top
const onScroll = () => toTop.classList.toggle("show", window.scrollY > 300);
window.addEventListener("scroll", onScroll);
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
onScroll();

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  setView("grid");       // default view
  resetFilters();        // ensures ALL books show on first load
  // resetFilters() calls applyFilters() internally
});
