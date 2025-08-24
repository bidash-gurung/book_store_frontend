// About page minimal JS (reuses global nav/theme logic)
// Only handles the back-to-top button behaviour here.
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const toTop = document.getElementById("toTop");
    const onScroll = () =>
      toTop?.classList.toggle("show", window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    toTop?.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: "smooth" })
    );
    onScroll();
  });
})();
