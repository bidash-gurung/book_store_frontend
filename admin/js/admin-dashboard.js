// Admin Dashboard with theme toggle, Add Book, image URL/file, localStorage CRUD
(function () {
  "use strict";

  // Gate: if not logged in as admin, go to admin login
  if (localStorage.getItem("admin_session") !== "true") {
    window.location.href = "./admin-login.html";
    return;
  }

  const THEME_KEY = "admin_theme";
  const LS = "admin_products";

  // ------- Theme -------
  const html = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const applyThemeIcon = () => {
    themeBtn.textContent = html.classList.contains("dark") ? "☀️" : "🌙";
  };
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") html.classList.add("dark");
  applyThemeIcon();
  themeBtn.addEventListener("click", () => {
    html.classList.toggle("dark");
    localStorage.setItem(
      THEME_KEY,
      html.classList.contains("dark") ? "dark" : "light"
    );
    applyThemeIcon();
  });

  // ------- Storage helpers -------
  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }
  function load() {
    try {
      return JSON.parse(localStorage.getItem(LS)) || [];
    } catch {
      return [];
    }
  }
  function save(v) {
    localStorage.setItem(LS, JSON.stringify(v));
  }

  // Seed demo if empty
  if (!load().length) {
    const demo = [
      {
        id: uid(),
        title: "Atomic Habits",
        author: "James Clear",
        genre: "Self‑Help",
        price: 14.95,
        stock: 10,
        isFeatured: true,
        isNew: true,
        img: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: uid(),
        title: "Educated",
        author: "Tara Westover",
        genre: "Memoir",
        price: 13.99,
        stock: 8,
        isFeatured: true,
        isNew: false,
        img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=600&auto=format&fit=crop",
      },
      {
        id: uid(),
        title: "Project Hail Mary",
        author: "Andy Weir",
        genre: "Sci‑Fi",
        price: 16.99,
        stock: 4,
        isFeatured: false,
        isNew: true,
        img: "https://images.unsplash.com/photo-1519681394605-5f7f14f4a2d3?q=80&w=600&auto=format&fit=crop",
      },
    ];
    save(demo);
  }

  // ------- UI refs -------
  const tbody = document.getElementById("tbody");
  const q = document.getElementById("q");
  const sortSel = document.getElementById("sort");
  const seedBtn = document.getElementById("seedBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const addBtn = document.getElementById("addBtn");

  // Modal refs
  const modal = document.getElementById("editModal");
  const form = document.getElementById("editForm");
  const modalTitle = document.getElementById("modalTitle");

  const m_id = document.getElementById("m_id");
  const m_title = document.getElementById("m_title");
  const m_author = document.getElementById("m_author");
  const m_genre = document.getElementById("m_genre");
  const m_price = document.getElementById("m_price");
  const m_stock = document.getElementById("m_stock");
  const m_featured = document.getElementById("m_featured");
  const m_new = document.getElementById("m_new");

  const m_img = document.getElementById("m_img"); // URL (or DataURL)
  const m_file = document.getElementById("m_file"); // file picker
  const m_preview = document.getElementById("m_preview");

  // Image preview / binding
  const setPreview = (src) => {
    m_preview.src = src || "";
  };
  m_img.addEventListener("input", () => setPreview(m_img.value));
  m_file.addEventListener("change", async () => {
    const file = m_file.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      m_img.value = reader.result;
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  });

  // ------- Render -------
  function render() {
    const term = (q.value || "").toLowerCase();
    let arr = load().filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term) ||
        (p.genre || "").toLowerCase().includes(term)
    );
    switch (sortSel.value) {
      case "price-asc":
        arr.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        arr.sort((a, b) => b.price - a.price);
        break;
      default:
        arr.sort((a, b) => a.title.localeCompare(b.title));
    }
    tbody.innerHTML = arr
      .map(
        (p) => `
      <tr>
        <td><img class="thumb" src="${p.img || ""}" alt="${p.title}"></td>
        <td><strong>${p.title}</strong></td>
        <td>${p.author}</td>
        <td>${p.genre || "-"}</td>
        <td>$${Number(p.price).toFixed(2)}</td>
        <td>${Number(p.stock)}</td>
        <td class="flags">
          ${p.isFeatured ? '<span class="flag">Featured</span>' : ""}
          ${p.isNew ? '<span class="flag new">New</span>' : ""}
        </td>
        <td>
          <button class="btn" data-act="edit" data-id="${p.id}">Edit</button>
          <button class="btn" data-act="del"  data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `
      )
      .join("");
  }

  // ------- Seed demo -------
  seedBtn.addEventListener("click", () => {
    if (!confirm("Replace current products with demo seed?")) return;
    localStorage.removeItem(LS);
    location.reload();
  });

  // Search + sort
  q.addEventListener("input", render);
  sortSel.addEventListener("input", render);

  // ------- Add Book -------
  addBtn.addEventListener("click", () => {
    modalTitle.textContent = "Add Book";
    m_id.value = uid();
    m_title.value = "";
    m_author.value = "";
    m_genre.value = "";
    m_price.value = "";
    m_stock.value = "0";
    m_featured.checked = false;
    m_new.checked = false;
    m_img.value = "";
    m_file.value = "";
    setPreview("");
    modal.showModal();
  });

  // ------- Edit/Delete handlers -------
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const items = load();
    const item = items.find((p) => p.id === id);
    if (!item) return;

    if (btn.getAttribute("data-act") === "edit") {
      modalTitle.textContent = "Edit Product";
      m_id.value = item.id;
      m_title.value = item.title;
      m_author.value = item.author;
      m_genre.value = item.genre || "";
      m_price.value = item.price;
      m_stock.value = item.stock ?? 0;
      m_featured.checked = !!item.isFeatured;
      m_new.checked = !!item.isNew;
      m_img.value = item.img || "";
      m_file.value = "";
      setPreview(item.img || "");
      modal.showModal();
    } else {
      if (confirm(`Delete "${item.title}"?`)) {
        save(items.filter((p) => p.id !== id));
        render();
      }
    }
  });

  // ------- Save (Add or Edit) -------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = m_id.value;
    const items = load();
    const idx = items.findIndex((p) => p.id === id);

    const payload = {
      id,
      title: m_title.value.trim(),
      author: m_author.value.trim(),
      genre: m_genre.value.trim(),
      price: Number(m_price.value || 0),
      stock: Number(m_stock.value || 0),
      isFeatured: !!m_featured.checked,
      isNew: !!m_new.checked,
      img: m_img.value.trim() || "",
    };

    if (!payload.title || !payload.author)
      return alert("Title and Author are required.");

    if (idx >= 0) items[idx] = { ...items[idx], ...payload }; // edit
    else items.push(payload); // add

    save(items);
    modal.close();
    render();
  });

  // ------- Logout -------
  logoutBtn.addEventListener("click", () => {
    if (!confirm("Log out of admin?")) return;
    localStorage.removeItem("admin_session");
    window.location.href = "./admin-login.html";
  });

  // Init
  render();
})();
