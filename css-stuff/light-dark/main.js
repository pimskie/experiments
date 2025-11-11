document.querySelector(".js-btn-toggle").addEventListener("click", () => {
  document.documentElement.dataset.theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
});
