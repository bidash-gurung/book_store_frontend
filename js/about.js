// Back to top (reuse logic)
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () =>
  toTop.classList.toggle("show", window.scrollY > 300)
);
toTop.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);
