(function setupThemeToggler() {
  const toggle = document.getElementById("toggle");

  toggle.addEventListener("change", () =>
    document.body.classList.toggle("dark")
  );

  const darkThemeQuery = "(prefers-color-scheme: dark)";
  const matchMedia = window.matchMedia;
  if (matchMedia && matchMedia(darkThemeQuery).matches) {
    toggle.click();
  }
})();
